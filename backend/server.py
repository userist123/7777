from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_ALGORITHM = "HS256"
def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Password hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT tokens
def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, 
        "email": email, 
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60), 
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id, 
        "exp": datetime.now(timezone.utc) + timedelta(days=7), 
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth dependency
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Create the main app
app = FastAPI(title="WOB ART API")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["auth"])
orders_router = APIRouter(prefix="/orders", tags=["orders"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])
payments_router = APIRouter(prefix="/payments", tags=["payments"])
contact_router = APIRouter(prefix="/contact", tags=["contact"])

# ==================== PYDANTIC MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str]
    role: str
    created_at: str

class OrderCreate(BaseModel):
    car_brand: str
    car_model: str
    car_year: int
    car_plate: Optional[str] = None
    service_type: str
    finish_type: Optional[str] = None
    description: Optional[str] = None
    preferred_date: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    estimated_price: Optional[float] = None
    notes: Optional[str] = None
    
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    car_brand: Optional[str] = None
    car_model: Optional[str] = None
    car_year: Optional[str] = None
    service_type: str
    finish_type: Optional[str] = None
    message: Optional[str] = None

class CheckoutRequest(BaseModel):
    order_id: str
    origin_url: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ==================== AUTH ENDPOINTS ====================

@auth_router.post("/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "phone": data.phone,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email, "user")
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": email,
        "name": data.name,
        "phone": data.phone,
        "role": "user"
    }

@auth_router.post("/login")
async def login(data: UserLogin, request: Request, response: Response):
    email = data.email.lower()
    ip = request.client.host
    identifier = f"{ip}:{email}"
    
    # Check brute force
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        lockout_until = attempts.get("lockout_until")
        if lockout_until and datetime.fromisoformat(lockout_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        # Increment failed attempts
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {
                "$inc": {"count": 1},
                "$set": {"lockout_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}
            },
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear failed attempts
    await db.login_attempts.delete_one({"identifier": identifier})
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email, user.get("role", "user"))
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "phone": user.get("phone"),
        "role": user.get("role", "user")
    }

@auth_router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@auth_router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@auth_router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"], user.get("role", "user"))
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@auth_router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": str(user["_id"]),
            "email": email,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False
        })
        logging.info(f"Password reset link: /reset-password?token={token}")
    return {"message": "If the email exists, a reset link has been sent"}

@auth_router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    reset_doc = await db.password_reset_tokens.find_one({"token": data.token, "used": False})
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    if datetime.fromisoformat(str(reset_doc["expires_at"])) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    await db.users.update_one(
        {"_id": ObjectId(reset_doc["user_id"])},
        {"$set": {"password_hash": hash_password(data.new_password)}}
    )
    await db.password_reset_tokens.update_one({"token": data.token}, {"$set": {"used": True}})
    return {"message": "Password reset successfully"}

# ==================== ORDERS ENDPOINTS ====================

@orders_router.post("/", status_code=201)
async def create_order(data: OrderCreate, user: dict = Depends(get_current_user)):
    order_count = await db.orders.count_documents({})
    order_number = f"WOB-{datetime.now().year}-{str(order_count + 1).zfill(4)}"
    
    order_doc = {
        "order_number": order_number,
        "user_id": user["_id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "car_brand": data.car_brand,
        "car_model": data.car_model,
        "car_year": data.car_year,
        "car_plate": data.car_plate,
        "service_type": data.service_type,
        "finish_type": data.finish_type,
        "description": data.description,
        "preferred_date": data.preferred_date,
        "status": "PENDING",
        "estimated_price": None,
        "deposit_paid": False,
        "deposit_amount": None,
        "notes": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = str(result.inserted_id)
    return order_doc

@orders_router.get("/")
async def get_my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    # Add id field from order_number for frontend
    for order in orders:
        order["id"] = order["order_number"]
    return orders

@orders_router.get("/{order_number}")
async def get_order(order_number: str, user: dict = Depends(get_current_user)):
    query = {"order_number": order_number}
    if user.get("role") != "admin":
        query["user_id"] = user["_id"]
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order["id"] = order["order_number"]
    return order

# ==================== ADMIN ENDPOINTS ====================

@admin_router.get("/orders")
async def admin_get_orders(status: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    for order in orders:
        order["id"] = order["order_number"]
    return orders

@admin_router.patch("/orders/{order_number}")
async def admin_update_order(order_number: str, data: OrderUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.status:
        update_data["status"] = data.status
    if data.estimated_price is not None:
        update_data["estimated_price"] = data.estimated_price
    if data.notes:
        update_data["notes"] = data.notes
    
    result = await db.orders.update_one({"order_number": order_number}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await db.orders.find_one({"order_number": order_number}, {"_id": 0})
    order["id"] = order["order_number"]
    return order

@admin_router.get("/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"password_hash": 0}).to_list(500)
    for user in users:
        user["_id"] = str(user["_id"])
        user["id"] = user["_id"]
    return users

@admin_router.get("/stats")
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "PENDING"})
    in_progress = await db.orders.count_documents({"status": "IN_PROGRESS"})
    completed = await db.orders.count_documents({"status": "COMPLETED"})
    total_users = await db.users.count_documents({"role": "user"})
    
    # Calculate revenue from completed orders
    pipeline = [
        {"$match": {"status": "COMPLETED", "estimated_price": {"$ne": None}}},
        {"$group": {"_id": None, "total": {"$sum": "$estimated_price"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "in_progress": in_progress,
        "completed": completed,
        "total_users": total_users,
        "total_revenue": total_revenue
    }

# ==================== PAYMENTS ENDPOINTS ====================

DEPOSIT_PACKAGES = {
    "standard": 200.0,
    "premium": 500.0,
    "full": 1000.0
}

@payments_router.post("/checkout")
async def create_checkout(data: CheckoutRequest, request: Request, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"order_number": data.order_id, "user_id": user["_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.get("deposit_paid"):
        raise HTTPException(status_code=400, detail="Deposit already paid")
    
    # Calculate deposit (20% of estimated price or minimum 200€)
    estimated = order.get("estimated_price", 0) or 0
    deposit_amount = max(float(estimated) * 0.2, 200.0)
    
    api_key = os.environ.get("STRIPE_API_KEY")
    webhook_url = f"{str(request.base_url).rstrip('/')}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    success_url = f"{data.origin_url}/dashboard?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{data.origin_url}/dashboard?payment=cancelled"
    
    checkout_request = CheckoutSessionRequest(
        amount=deposit_amount,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": data.order_id,
            "user_id": user["_id"],
            "type": "deposit"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Store transaction
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "order_id": data.order_id,
        "user_id": user["_id"],
        "amount": deposit_amount,
        "currency": "eur",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@payments_router.get("/status/{session_id}")
async def get_payment_status(session_id: str, user: dict = Depends(get_current_user)):
    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and order if paid
    if status.payment_status == "paid":
        tx = await db.payment_transactions.find_one({"session_id": session_id})
        if tx and tx.get("payment_status") != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
            )
            await db.orders.update_one(
                {"order_number": tx["order_id"]},
                {"$set": {
                    "deposit_paid": True,
                    "deposit_amount": status.amount_total / 100,
                    "status": "APPROVED",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    try:
        event = await stripe_checkout.handle_webhook(body, sig)
        logging.info(f"Stripe webhook: {event.event_type}")
        return {"received": True}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ==================== CONTACT ENDPOINTS ====================

@contact_router.post("/quote")
async def submit_quote(data: ContactForm, background_tasks: BackgroundTasks):
    quote_doc = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "car_brand": data.car_brand,
        "car_model": data.car_model,
        "car_year": data.car_year,
        "service_type": data.service_type,
        "finish_type": data.finish_type,
        "message": data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    await db.quotes.insert_one(quote_doc)
    
    # TODO: Send email notification (requires SendGrid API key)
    logging.info(f"New quote request from {data.name} ({data.email})")
    
    return {"message": "Quote request submitted successfully"}

@admin_router.get("/quotes")
async def admin_get_quotes(admin: dict = Depends(get_admin_user)):
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return quotes

# ==================== PUBLIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "WOB ART API v1.0", "status": "online"}

@api_router.get("/services")
async def get_services():
    return [
        {"id": "WRAP_COMPLET", "name": "Wrap Complet", "description": "Transformare totală a vehiculului", "price_from": 2400},
        {"id": "PPF", "name": "PPF Protecție", "description": "Armură invizibilă pentru vopsea", "price_from": 1800},
        {"id": "CHROME_DELETE", "name": "Ștergere Crom", "description": "Eliminare ornamente crom", "price_from": 480},
        {"id": "INTERIOR", "name": "Wrap Interior", "description": "Bord și ornamente", "price_from": 950},
        {"id": "TINTING", "name": "Geamuri Fumurii", "description": "Folii geamuri", "price_from": 350},
        {"id": "DETAILING", "name": "Detailing", "description": "Curățare profesională", "price_from": 250}
    ]

# Include routers
api_router.include_router(auth_router)
api_router.include_router(orders_router)
api_router.include_router(admin_router)
api_router.include_router(payments_router)
api_router.include_router(contact_router)
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Startup events
@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.orders.create_index("order_number", unique=True)
    await db.orders.create_index("user_id")
    await db.payment_transactions.create_index("session_id")
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@wobart.ro")
    admin_password = os.environ.get("ADMIN_PASSWORD", "WobAdmin2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Administrator",
            "phone": None,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")
    
    # Write test credentials
    creds_path = Path("/app/memory/test_credentials.md")
    creds_path.parent.mkdir(parents=True, exist_ok=True)
    creds_path.write_text(f"""# WOB ART Test Credentials

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Test User (create via register)
- Email: test@example.com
- Password: Test123!
- Role: user

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
""")
    logger.info("Test credentials written")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
