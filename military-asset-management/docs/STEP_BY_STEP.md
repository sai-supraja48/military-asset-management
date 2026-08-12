# Step-by-step project explanation

## Step 1 — Understand the problem

The application tracks assets across multiple bases. The important stock movements are:
1. Purchases add stock.
2. Transfers move stock from one base to another.
3. Assignments allocate stock to personnel.
4. Expenditures consume stock.
5. Audit logs record mutations.

The reference defines:

`Closing Balance = Opening Balance + Net Movement - Assigned - Expended`

and

`Net Movement = Purchases + Transfers In - Transfers Out`.

## Step 2 — Choose the architecture

The project is split into:
- React frontend
- Express REST API
- PostgreSQL database

React handles the screens and API calls. Express handles authentication, authorization and business logic. PostgreSQL stores relational transactions.

## Step 3 — Design the database

Main entities:
- Users
- Bases
- EquipmentTypes
- Assets
- Purchases
- Transfers
- Assignments
- Expenditures
- AuditLogs

`assets` stores current stock for each base/equipment pair. Movement tables preserve history.

## Step 4 — Authentication

A user submits username/password to `/api/auth/login`.

The backend:
1. Finds the user.
2. Compares the bcrypt password hash.
3. Creates a JWT containing user ID, role and base ID.
4. Returns the token.

The frontend stores the token and Axios sends it as a Bearer token.

## Step 5 — RBAC

Three roles are implemented:
- ADMIN: global access.
- BASE_COMMANDER: scoped to the assigned base.
- LOGISTICS_OFFICER: mainly purchase and transfer operations.

The backend enforces these permissions. UI hiding is only a convenience; real security is enforced by API middleware.

## Step 6 — Purchase flow

When a purchase is submitted:
1. Validate input.
2. Insert a purchase record.
3. Increase `assets.quantity`.
4. Add an audit log.
5. Commit the transaction.

## Step 7 — Transfer flow

A transfer:
1. Starts a PostgreSQL transaction.
2. Locks the source stock row with `FOR UPDATE`.
3. Checks available quantity.
4. Inserts the transfer.
5. Subtracts from source stock.
6. Adds to destination stock.
7. Creates an audit record.
8. Commits.

If anything fails, the transaction rolls back.

## Step 8 — Assignments and expenditures

Both operations validate stock before reducing the current asset balance.

Assignment also stores personnel name.

Expenditure stores an optional reason.

## Step 9 — Dashboard

The dashboard calls `/api/assets/metrics` and `/api/assets/stock`.

The metric endpoint aggregates purchase, transfer, assignment and expenditure data.

The frontend displays:
- Opening Balance
- Net Movement
- Assigned
- Expended
- Closing Balance

Clicking Net Movement opens a breakdown.

## Step 10 — Run locally

1. Install PostgreSQL.
2. Create `military_assets`.
3. Run `database/schema.sql`.
4. Run `database/seed.sql`.
5. Create backend `.env`.
6. Install backend dependencies.
7. Start backend.
8. Create frontend `.env`.
9. Install frontend dependencies.
10. Start frontend.

## Step 11 — Test

Use the supplied demo accounts.

Recommended test sequence:
1. Login as Admin.
2. Open Dashboard.
3. Record a purchase.
4. Verify stock increases.
5. Create a transfer.
6. Verify source decreases and destination increases.
7. Record an assignment/expenditure.
8. Verify the dashboard.
9. Open Audit Logs.
10. Login as Base Commander and confirm the base scope.
11. Login as Logistics Officer and verify transfer/purchase access.

## Step 12 — Deployment

Backend:
- Set `DATABASE_URL`
- Set `JWT_SECRET`
- Set `CLIENT_URL`
- Deploy to Render/Railway.

Frontend:
- Set `VITE_API_BASE_URL`
- Deploy to Netlify/Vercel.

Before production, replace demo passwords, use a strong JWT secret, configure CORS to exact production origins, enable HTTPS and review authorization rules.
