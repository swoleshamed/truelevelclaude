# TrueLevel - Chemical Inventory Management

**Version:** 0.1.0 (V0 Development)
**Status:** Phase 4 Complete - Dashboard Implementation ✅
**Domain:** truelevel.app

---

## Project Overview

TrueLevel is a mobile-first Progressive Web Application (PWA) for car wash chemical inventory management, serving both chemical distributors and car wash operators.

### Core Features (V0 Scope)
- 🔐 Multi-role authentication system (5 roles)
- 📊 Chemical catalog & inventory management
- 🧪 Wash package configuration
- 📝 Visit logging (chemical + service)
- 📈 Cost-per-car analytics with GPM weighting
- 📅 Visit scheduling & reminders
- 📱 Mobile-first responsive design

---

## Tech Stack

### Frontend
- **Next.js 14+** - App Router with Server Components
- **TypeScript** - Strict type safety
- **Tailwind CSS** - Utility-first styling with custom design tokens
- **React Hook Form + Zod** - Form handling & validation
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database (Supabase)
- **NextAuth.js v5** - Authentication

### Infrastructure
- **Vercel** - Hosting & deployment
- **Supabase** - Managed PostgreSQL

---

## Project Structure

```
truelevelclaude/
├── prisma/
│   ├── schema.prisma          # Complete database schema
│   └── seed.ts                # Reference data seeding
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication routes ✅
│   │   ├── (dashboard)/       # Dashboard routes (partial)
│   │   ├── api/               # API endpoints (auth complete)
│   │   ├── globals.css        # Global styles + design tokens
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── ui/                # Base UI components (TODO)
│   │   ├── dashboard/         # Dashboard components (TODO)
│   │   ├── visit-log/         # Visit log components (TODO)
│   │   └── forms/             # Form components (TODO)
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # Authentication utilities
│   │   └── utils.ts           # Helper functions
│   ├── hooks/                 # Custom React hooks (TODO)
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── .env                       # Environment variables
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind + design tokens
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies & scripts
```

---

## Getting Started

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 15+ (or Supabase account)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Edit `.env` and set your database connection:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```

3. **Initialize database:**
   ```bash
   # Push schema to database
   npm run db:push

   # Seed reference data
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## Development Status

### ✅ Phase 1: Foundation (COMPLETE)

**1.1 Database Schema**
- [x] Complete Prisma schema with all models
- [x] Enums for all type definitions
- [x] Proper indexes and relationships
- [x] Support for all PRD requirements

**1.2 Seed Reference Data**
- [x] 23 injector types (Hydroflex + Hydrominder)
- [x] 59 tip types (Standard + Hydrominder + Dial 1-32)
- [x] Inch-gallon conversions (5/15/30/55 gal drums)

**1.3 Base Configuration**
- [x] Next.js 14 with App Router
- [x] TypeScript strict mode
- [x] Tailwind CSS with design tokens
- [x] Environment variable setup

**1.4 Utility Files**
- [x] Prisma client singleton
- [x] Authentication helpers (password hashing, role checks)
- [x] Utility functions (inch-to-gallon conversion, tank status, formatting)
- [x] TypeScript type definitions

### ✅ Phase 2: Core UI Components (COMPLETE)

**2.1 Base Form Components**
- [x] Button (primary, secondary, destructive, ghost variants)
- [x] Input (with label, error, helper text)
- [x] Select (with custom arrow and placeholder)
- [x] Checkbox (with label and description)

**2.2 Container Components**
- [x] Card (with header, content, footer)
- [x] Modal (full-screen mobile, centered desktop)
- [x] Tabs (pill-style with controlled/uncontrolled modes)

**2.3 Status & Interaction Components**
- [x] StatusBadge (NORMAL/LOW_STOCK/CRITICAL)
- [x] StatusDot (for calendar indicators)
- [x] NumberStepper (for count inputs)

**2.4 Dashboard Components**
- [x] TankVisualization (SVG tank with dynamic fill)
- [x] LocationSwitcher (dropdown navigation)
- [x] CostPerCarChart (Recharts line chart)

**2.5 Layout Components**
- [x] Header (logo, notifications, user menu)
- [x] BottomNav (mobile navigation bar)
- [x] PageContainer, PageHeader, PageSection
- [x] FAB (context-aware floating action button)

### ✅ Phase 3: Authentication Pages (COMPLETE)

**3.1 NextAuth.js Configuration**
- [x] NextAuth.js v5 with credentials provider
- [x] JWT-based session management (7-day expiry)
- [x] Prisma adapter integration
- [x] Password hashing with bcrypt

**3.2 API Endpoints**
- [x] POST /api/auth/register (transaction-based registration)
- [x] NextAuth API routes at /api/auth/[...nextauth]
- [x] Email uniqueness validation
- [x] Automatic admin role assignment

**3.3 Authentication Pages**
- [x] Login page with email/password form
- [x] Registration page with 2-step flow
  - Account type selection (Distributor vs Organization)
  - Company and user details form
- [x] Zod validation schemas
- [x] Error handling and display

**3.4 Route Protection**
- [x] Middleware for authenticated routes
- [x] Public/protected path definitions
- [x] Smart redirects based on auth status
- [x] Callback URL preservation

**3.5 Dashboard Structure**
- [x] Dashboard layout with session check
- [x] Header with user menu and sign-out
- [x] Placeholder dashboard page

### ✅ Phase 4: Dashboard Implementation (COMPLETE)

**4.1 Location Context System**
- [x] LocationContext provider for managing selected location
- [x] Three location types (ALL/ORG/SITE)
- [x] localStorage persistence
- [x] Type-safe discriminated union types

**4.2 Role-Specific Dashboard Views**
- [x] Distributor Dashboard (client portfolio view)
- [x] Organization Dashboard (sites overview)
- [x] Site Dashboard (detailed tanks, analytics, visits)
- [x] Server-side role routing
- [x] LocationSwitcher integration

**4.3 Site Dashboard Features**
- [x] Tab-based navigation (Overview, Chemicals, Visits, Analytics)
- [x] Tank visualization grid with status
- [x] Cost-per-car trend chart
- [x] Upcoming visit schedule
- [x] Quick stats cards

**4.4 Navigation & Layout**
- [x] Bottom navigation for mobile (4 tabs)
- [x] Route-aware active states
- [x] FAB integration with context-aware actions
- [x] Responsive layouts for all screen sizes

**4.5 Visit Management Components**
- [x] VisitReminder component with status badges
- [x] VisitReminderList for compact view
- [x] Quick navigation to site details

### 📋 Upcoming Phases

- **Phase 5:** Chemical Management
- **Phase 6:** Wash Packages
- **Phase 7:** Visit Logging
- **Phase 8:** Analytics
- **Phase 9:** Scheduling
- **Phase 10:** Polish & PWA

---

## Database Schema Overview

### Core Entities
- **Distributors** - Chemical supplier companies
- **Organizations** - Car wash operator companies
- **Sites** - Individual car wash locations
- **Users** - System users with role-based access

### Chemical Management
- **ChemicalMaster** - Distributor catalog templates
- **ChemicalOrgConfig** - Org-level pricing & containers
- **ChemicalSiteConfig** - Site-level configuration
- **ChemicalSiteApplication** - Injector/tip assignments

### Wash Packages
- **WashPackageTemplate** - Org-level templates
- **WashPackage** - Site-level packages
- **WashPackageChemical** - Package chemical assignments

### Visit Logging
- **VisitLog** - Visit records with timestamps
- **VisitLogChemicalEntry** - Inventory measurements
- **VisitLogServiceEntry** - Equipment changes

### Reference Data
- **InjectorType** - Hydroflex & Hydrominder injectors
- **TipType** - Standard, Hydrominder, Dial tips
- **InchGallonConversion** - Container measurement tables

---

## Key Business Logic

### Inch-to-Gallon Conversion
Linear interpolation between conversion points:
```typescript
const ratio = (inches - lower.inches) / (upper.inches - lower.inches);
const gallons = lower.gallons + ratio * (upper.gallons - lower.gallons);
```

### Tank Status Logic
- **Custom threshold:**
  - \> 2x threshold = NORMAL (green)
  - \> 1x threshold = LOW_STOCK (yellow)
  - ≤ threshold = CRITICAL (red)
- **Default (no threshold):**
  - \> 50% = NORMAL
  - 25-50% = LOW_STOCK
  - < 25% = CRITICAL

### GPM-Weighted Cost Allocation
1. Calculate work: `Work = GPM × Cars`
2. Total work across applications
3. Allocate usage: `AppGallons = TotalUsage × (AppWork / TotalWork)`
4. Split to packages by car count ratio

---

## Code Commenting Standards

Every file must include:

```typescript
// ===========================================
// FILE: src/path/to/file.ts
// PURPOSE: Brief description
// PRD REFERENCE: Section X.X (if applicable)
// USED BY: List of dependent files
// ===========================================
```

Functions must explain **WHY** they exist, not just what they do.

See `TrueLevel_Implementation_Guide.md` for full standards.

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed reference data
npm run db:studio    # Open Prisma Studio (database GUI)
```

---

## Documentation

- **TrueLevel_PRD_v3.md** - Complete product requirements
- **TrueLevel_TECHNICAL_SPEC.md** - Database schema & API specs
- **TrueLevel_UI_SPEC.md** - Design system & components
- **TrueLevel_Implementation_Guide.md** - Build instructions

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Contributing

This project follows the implementation phases outlined in `TrueLevel_Implementation_Guide.md`.

### Current Phase: Phase 5 - Chemical Management
- Chemical catalog (distributor, organization, site levels)
- Container and pricing configuration
- Injector and tip assignments
- Equipment management
- API endpoints for CRUD operations

---

## License

Proprietary - All Rights Reserved

---

## Support

For questions or issues, contact the development team.

---

**Last Updated:** January 15, 2026
**Phase Status:** 4/10 Complete ✅✅✅✅
