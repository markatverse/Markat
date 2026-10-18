# MarkatVerse Architecture & Codebase Map

A unified multi-vendor hyper-local marketplace platform with Next.js (App Router) and NestJS.

---

## 📂 Repository Directory Structure

```text
MarkatVerse/
├── .github/workflows/       # CI/CD and deployment workflows
├── backend/                 # NestJS Backend API & Services
│   ├── api/                 # Serverless Vercel function entrypoint
│   ├── prisma/              # Prisma schema, migrations, and database seed
│   ├── scripts/             # Backend TypeScript seed/maintenance tasks
│   ├── src/                 # Application source code
│   │   ├── admin/           # Admin modules & controls
│   │   ├── auth/            # Authentication & JWT services
│   │   ├── categories/      # Category taxonomy & sector structure
│   │   ├── commercial/      # Advertisements, subscriptions, commissions
│   │   ├── configuration/   # Platform & system configurations
│   │   ├── content/         # CMS, Banners, Blog posts, SEO
│   │   ├── orders/          # Cart & order processing
│   │   ├── payment/         # Payment gateways (Razorpay, Stripe, Mock)
│   │   ├── products/        # Product catalog & listings
│   │   ├── service-queue/   # Live booking and queue token system
│   │   └── upload/          # Multi-format media upload & compression
│   └── uploads/             # Locally uploaded media assets
│
├── frontend/                # Next.js 16 (React 19, Turbopack) Frontend
│   ├── public/              # Static public assets (images, icons, logo)
│   └── src/
│       ├── app/             # App Router pages & API routes
│       │   ├── (public)/    # Customer-facing shopping & services
│       │   │   ├── cart/         # Shopping cart
│       │   │   ├── checkout/     # Order placement & checkout
│       │   │   ├── product/      # Product detail view
│       │   │   ├── salon/        # Salon/clinic live booking & tokens
│       │   │   └── search/       # Global search & filters
│       │   ├── admin/       # Administrator dashboard & management
│       │   │   ├── commercial/   # Commission, subscriptions, ads
│       │   │   ├── content/      # CMS pages, banners, advertisements
│       │   │   ├── marketplace/  # Products, categories, services
│       │   │   └── settings/     # Payments, platform, auth settings
│       │   └── seller/      # Seller storefront, dashboard & onboarding
│       ├── components/      # Reusable UI & widget components
│       ├── context/         # React Context providers (Auth, Cart, Products, Settings)
│       ├── hooks/           # Custom React hooks
│       └── utils/           # Utility helpers (API URL resolver, image compression)
│
├── scripts/                 # Utility and maintenance tools
│   ├── db/                  # Database management scripts (admin, clean, seed)
│   └── dev/                 # Route generators, secret sync, and local dev helpers
│
└── docs/                    # Project documentation & guides
```

---

## 🚀 Key Commands

### Development
```bash
# Run both Frontend and Backend concurrently
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend
```

### Build & Deploy
```bash
# Build frontend
npm run build

# Deploy to Vercel production
npx vercel --prod
```
