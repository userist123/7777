# WOB ART - Premium Car Wrapping Platform

## Project Overview
Site-ul premium pentru WOB ART - atelier de car wrapping, PPF și detailing din București. Redesign complet futurist cu efecte holografice, Bento Grid layout sci-fi, configurator culori wrap interactiv, sistem complet de comenzi, tracking, autentificare și admin panel.

## Tech Stack
- **Frontend**: React 19, Framer Motion, TailwindCSS, Axios
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Auth**: JWT + httpOnly cookies, bcrypt password hashing
- **Payments**: Stripe (emergentintegrations library)
- **Design**: Futuristic Sci-Fi UI, Glassmorphism 2.0, Bento Grid Layout

## Core Requirements (Static)

### User Personas
1. **Client** - proprietar de mașină care dorește servicii de wrapping/PPF/detailing
2. **Admin** - operator WOB ART care gestionează comenzile și clienții

### Key Features
- [x] Landing page futurist cu Bento Grid layout
- [x] Configurator vizual de culori wrap
- [x] Sistem de autentificare (login/register)
- [x] Dashboard client cu tracking comenzi
- [x] Admin panel pentru gestiune comenzi/utilizatori
- [x] Formular contact/cerere ofertă
- [x] Plăți Stripe pentru avansuri/depozite
- [ ] Notificări WhatsApp (necesită chei Twilio)
- [ ] Email-uri reale (necesită cheie SendGrid)

## What's Been Implemented (January 2026)

### Phase 1: Backend Full-Stack (FastAPI)
- Auth endpoints: register, login, logout, me, refresh, forgot-password, reset-password
- Orders CRUD: create, read, update (admin only)
- Admin endpoints: orders, users, quotes, stats
- Payments: Stripe checkout session creation, status polling
- Contact: quote form submission
- Brute force protection for login
- MongoDB indexes for performance

### Phase 2: Futuristic UI Redesign
**Bento Grid Layout**
- Asymmetric card grid (hero 2x2, configurator 2x3, feature cards 1x1, gallery 2x2)
- Responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)

**Car Color Configurator - Sports Car SVG**
- 8 wrap colors (Matte Black, Satin Blue, Gloss White, Military Green, Color Shift, Neon Orange, Brushed Steel, Cherry Red)
- Porsche 911-style sports car SVG visualization cu:
  - 3 unghiuri de vizualizare (front-side, side, back-side)
  - Roți detailiate cu spițe
  - Faruri LED neon (cyan față, roșu spate)
  - Reflexii metalice și gradient
  - Umbră realistă sub mașină
- Auto-rotare la fiecare 3 secunde (cu pause on hover/click)
- Price estimate display cu gradient text

**Advanced Interaction Patterns**
- Custom cursor with trailing effect (desktop only)
- Magnetic hover effect on buttons
- Kinetic typography with glitch effect on hero text
- Animated counters on scroll (IntersectionObserver)
- Hover reveal on feature cards
- In-place click expand on Bento cards
- Image modal with FLIP animation for gallery
- Staggered entrance animations
- Animated gradient borders

**Visual Effects**
- Glassmorphism cards (backdrop-blur: 16px)
- Grid + dot background pattern
- Neon color palette (cyan #00f5ff, purple #7c3aed, pink #f0157f)
- Glow effects on hover
- Ambient glow orbs with pulse animation

### Design System
- Font: Unbounded (headings), Outfit (body), JetBrains Mono (code/numbers)
- Colors: Cyan (#00f5ff), Purple (#7c3aed), Pink (#f0157f), Green (#00ffa3)
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
- POST / - Creare comandă nouă (201)
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
- [x] Landing page futurist cu Bento Grid
- [x] Car color configurator
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
- [ ] 3D car model visualization (Three.js)
- [ ] Before/After gallery slider
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
