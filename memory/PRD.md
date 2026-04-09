# WOB ART - Premium Car Wrapping Platform

## Project Overview
Site-ul premium pentru WOB ART - atelier de car wrapping, PPF și detailing din București. Redesign complet futurist cu efecte holografice, sistem complet de comenzi, tracking, autentificare și admin panel.

## Tech Stack
- **Frontend**: React 19, Framer Motion, TailwindCSS, Axios
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Auth**: JWT + httpOnly cookies, bcrypt password hashing
- **Payments**: Stripe (emergentintegrations library)
- **Design**: Futuristic holographic UI, Glassmorphism 2.0

## Core Requirements (Static)

### User Personas
1. **Client** - proprietar de mașină care dorește servicii de wrapping/PPF/detailing
2. **Admin** - operator WOB ART care gestionează comenzile și clienții

### Key Features
- [x] Landing page futurist cu animații și efecte holo
- [x] Sistem de autentificare (login/register)
- [x] Dashboard client cu tracking comenzi
- [x] Admin panel pentru gestiune comenzi/utilizatori
- [x] Formular contact/cerere ofertă
- [x] Plăți Stripe pentru avansuri/depozite
- [ ] Notificări WhatsApp (necesită chei Twilio)
- [ ] Email-uri reale (necesită cheie SendGrid)

## What's Been Implemented (January 2026)

### Backend (FastAPI)
- Auth endpoints: register, login, logout, me, refresh, forgot-password, reset-password
- Orders CRUD: create, read, update (admin only)
- Admin endpoints: orders, users, quotes, stats
- Payments: Stripe checkout session creation, status polling
- Contact: quote form submission
- Brute force protection for login
- MongoDB indexes for performance

### Frontend (React)
- **Landing Page**: Hero section cu parallax, services, portfolio, reviews, contact form
- **Login/Register Pages**: Autentificare cu validare și feedback
- **Dashboard**: KPIs, order tracking, create new order modal, payment flow
- **Admin Panel**: Orders table cu editing, users list, quotes list, statistics

### Design System
- Font: Unbounded (headings), Outfit (body), JetBrains Mono (code)
- Colors: Cyan (#00F0FF), Purple (#BD00FF), Green (#00FFA3)
- Glassmorphism cards cu backdrop-blur
- Framer Motion animations

## API Endpoints

### Public
- GET /api/ - Health check
- GET /api/services - Lista servicii

### Auth (/api/auth)
- POST /register - Înregistrare user nou
- POST /login - Autentificare
- POST /logout - Delogare
- GET /me - User curent
- POST /refresh - Refresh token
- POST /forgot-password - Cerere reset parolă
- POST /reset-password - Reset parolă

### Orders (/api/orders)
- POST / - Creare comandă nouă
- GET / - Lista comenzi user
- GET /{order_number} - Detalii comandă

### Admin (/api/admin)
- GET /orders - Toate comenzile
- PATCH /orders/{order_number} - Update comandă
- GET /users - Lista utilizatori
- GET /quotes - Lista cereri ofertă
- GET /stats - Statistici dashboard

### Payments (/api/payments)
- POST /checkout - Creare sesiune Stripe
- GET /status/{session_id} - Status plată

### Contact (/api/contact)
- POST /quote - Trimite cerere ofertă

## Prioritized Backlog

### P0 - Critical (Done)
- [x] Landing page futurist
- [x] Auth system complet
- [x] Dashboard client
- [x] Admin panel
- [x] Order management
- [x] Stripe payments

### P1 - Important
- [ ] WhatsApp notifications (Twilio) - necesită API keys
- [ ] Email notifications (SendGrid) - necesită API key
- [ ] Upload fotografii pentru comenzi
- [ ] Notifications in-app pentru statusuri

### P2 - Nice to Have
- [ ] Calendar pentru programări
- [ ] Chat live cu clientul
- [ ] Estimator de preț avansat
- [ ] Gallery mode pentru portofoliu
- [ ] Multi-language support

## Next Action Items
1. Obține chei API pentru SendGrid și Twilio de la client
2. Implementează notificări email pentru comenzi noi
3. Adaugă WhatsApp notifications când comanda își schimbă statusul
4. Upload fotografii pentru vehicule
5. In-app notifications

## Test Credentials
Vezi `/app/memory/test_credentials.md`

## Deployment Notes
- Backend rulează pe port 8001 (via supervisor)
- Frontend rulează pe port 3000 (via supervisor)
- MongoDB local pe port 27017
- Stripe test key: sk_test_emergent

---
*Last updated: January 2026*
