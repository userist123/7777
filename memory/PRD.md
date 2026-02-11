# CrissCustoms & WobArt - Car Wrapping Studio Website

## Project Overview
A premium car wrapping studio website with dark theme and neon pink/red accents. The website showcases services, portfolio, pricing, and includes a complete authentication system with user and admin dashboards.

**Slogan:** "Where Light Meets Art"

## Completed Features (December 2025)

### 1. Landing Page Sections
- **Hero Section**: Full-screen hero with background image, animated particles, gradient text, and CTA buttons
- **About Section**: Company overview with stats (500+ projects, 400+ clients, 8+ years experience)
- **Services Section**: 6 service cards (Full Wrap, Partial, Reclama, Faruri/Stopuri, PPF, Custom) with hover effects
- **Portfolio Section**: Filterable gallery with lightbox, like functionality, and category filters
- **Process Section**: 6-step process visualization
- **Pricing Section**: 3 pricing tiers
- **Testimonials Section**: Client reviews with ratings
- **FAQ Section**: Accordion-style FAQ
- **Contact Section**: Contact form + Google Maps integration
- **Footer**: Quick links, services, social media

### 2. Authentication System (MOCKED)
- Login/Register pages with validation
- Session management via localStorage
- Protected routes
- Role-based access (admin/user)
- **Test Credentials:**
  - Admin: admin@crisscustoms.ro / admin123
  - Client: client@test.ro / client123

### 3. User Dashboard
- Project progress tracking
- Statistics and charts (Recharts)
- Photo tracking UI

### 4. Admin Panel
- Revenue/statistics overview with charts
- Project/customer management UI
- Quote management
- Review moderation UI

### 5. Wrap Configurator (/configurator)
- Car type selection (Sedan, SUV, Sports)
- 40+ wrap colors organized by category
- 5 finish types (Gloss, Matte, Satin, Metallic, Chrome)
- Dynamic price estimation
- Image gallery with color overlay effect
- Google Maps location integration
- Share and favorites functionality

### 6. Google Maps Integration
- Embedded in Contact section on homepage
- Embedded in Configurator page
- Fictional location: Bucuresti, Romania

## Tech Stack
- **Frontend**: React 19, React Router v7
- **Styling**: Tailwind CSS, shadcn/ui components
- **Icons**: Lucide React
- **State**: React Context (AuthContext)
- **Notifications**: Sonner
- **Charts**: Recharts

## What's MOCKED (No Backend)
- All authentication (localStorage only)
- Dashboard data
- Admin statistics
- Form submissions
- Project management

## File Structure
```
/app/frontend/src/
├── components/
│   ├── ui/           # shadcn components
│   ├── Navbar.jsx
│   ├── HeroSection.jsx
│   ├── ServicesSection.jsx
│   ├── PortfolioSection.jsx
│   ├── ContactSection.jsx (Google Maps here)
│   └── ...
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── AdminPage.jsx
│   └── ConfiguratorPage.jsx
├── contexts/
│   └── AuthContext.js
└── App.js
```

## Backlog / Future Tasks
1. **P1**: Photo upload functionality (User & Admin)
2. **P2**: Make dashboards fully interactive with mock data CRUD
3. **P2**: Differentiate guest vs logged-in user content
4. **P3**: Add more car images per type
5. **P3**: Implement real backend (FastAPI + MongoDB)

## Notes
- 3D car configurator was removed due to technical issues with Three.js/React Three Fiber
- Current configurator uses image-based visualization with color overlay
- All data is client-side only
