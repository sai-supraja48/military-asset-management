# Military Asset Management System

A full-stack asset and inventory management system based on the Kristallball reference material.

## Stack
- Frontend: React + Vite, Tailwind CSS, Lucide React, Recharts, Axios
- Backend: Node.js, Express.js
- Database: PostgreSQL using `pg`
- Authentication: JWT + bcryptjs
- Deployment targets: Netlify/Vercel (frontend), Render/Railway (backend/database)

## Core formula
Closing Balance = Opening Balance + Net Movement - Assigned - Expended

Net Movement = Purchases + Transfers In - Transfers Out

## Roles
- ADMIN: global access
- BASE_COMMANDER: restricted to assigned base
- LOGISTICS_OFFICER: purchase and transfer operations

## 1. Database setup

Create a PostgreSQL database, then run:

```bash
psql -U postgres -d military_assets -f database/schema.sql
```

or paste `database/schema.sql` into pgAdmin Query Tool.

Then seed the demo inventory from `database/seed.sql`. After the backend dependencies are installed, create the demo users with:

```bash
cd backend
npm run seed:users
```

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Default backend: http://localhost:5000

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend: http://localhost:5173

## Demo accounts

These are created by `npm run seed:users`.

| Role | Username | Password | Base |
|---|---|---|---|
| Admin | admin_user | AdminPass123! | All |
| Base Commander | commander_alpha | CommandPass123! | Fort Alpha |
| Logistics Officer | logistics_officer | LogisticsPass123! | Fort Alpha |

> Change demo passwords before any real deployment.

## API overview

- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/bases`
- GET `/api/equipment-types`
- GET `/api/assets/metrics`
- GET `/api/purchases`
- POST `/api/purchases`
- GET `/api/transfers`
- POST `/api/transfers`
- GET `/api/assignments`
- POST `/api/assignments`
- GET `/api/expenditures`
- POST `/api/expenditures`
- GET `/api/audit-logs`

## Important implementation note

The reference material specifies atomic database transactions for transfers. This implementation validates available stock and performs the transfer plus audit log in one PostgreSQL transaction.
