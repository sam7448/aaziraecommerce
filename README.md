# NovaMarket — Full-Stack E-Commerce Platform

A production-ready, multi-role e-commerce platform built to the Software Requirements Specification (SRS v1.0).

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript, Tailwind CSS v4, Redux Toolkit, React Router v7, Lucide Icons, Vite
- **Backend**: Node.js + Express + TypeScript, Zod Schema Validation, Helmet, Express Rate Limiter, Supabase Admin SDK
- **Database & Storage**: Supabase PostgreSQL with 15 normalized tables, triggers, and Supabase Storage bucket for product media
- **Testing**: Jest + Supertest (integration & unit test suites)
- **Deployment**: Docker, Docker Compose, Multi-stage builds, Nginx reverse proxy

---

## 📂 Project Structure

```
d:/E-commerce/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & Supabase configurations
│   │   ├── controllers/     # Route controllers (Auth, Products, Orders, Admin, etc.)
│   │   ├── middleware/      # Auth, Role-based RBAC, Error, and Not-Found middlewares
│   │   ├── repositories/    # Database query layer (Profiles, Products, Cart, Orders)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic layer (Stock validation, checkout)
│   │   ├── types/           # TypeScript definitions
│   │   ├── utils/           # Async handlers & utilities
│   │   ├── validators/      # Zod validation schemas
│   │   ├── db/              # schema.sql (PostgreSQL DDL)
│   │   ├── __tests__/       # Jest + Supertest test suites
│   │   ├── app.ts           # Hardened Express application
│   │   └── server.ts        # Server entrypoint
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common (Navbar, Footer) & Product Card
│   │   ├── hooks/           # Custom React hooks (useAuth)
│   │   ├── layouts/         # MainLayout, AuthLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Register, Forgot Password
│   │   │   ├── customer/    # Home, Catalog, Details, Cart, Wishlist, Checkout, Tracking
│   │   │   ├── seller/      # Seller Merchant Dashboard
│   │   │   └── admin/       # Super Administrator Console
│   │   ├── routes/          # AppRoutes with RBAC guards
│   │   ├── services/        # Axios API clients
│   │   ├── store/           # Redux Toolkit store (Auth, Cart)
│   │   └── types/           # TypeScript models
│   ├── Dockerfile
│   ├── nginx.conf           # SPA fallback & reverse proxy
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml       # Production multi-container orchestration
└── README.md
```

---

## 🚀 Getting Started

### 1. Database Setup
Apply the schema located at [`backend/src/db/schema.sql`](file:///d:/E-commerce/backend/src/db/schema.sql) in your Supabase SQL Editor.

### 2. Running Locally

#### Backend:
```bash
cd backend
npm install
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Automated Testing

Run the automated test suite with Jest & Supertest:
```bash
cd backend
npm test
```

---

## 🐳 Docker Deployment

To launch the complete platform in isolated production containers:
```bash
docker compose up --build
```
- **Storefront**: Accessible on `http://localhost`
- **Backend API**: Accessible on `http://localhost:5000/api`
