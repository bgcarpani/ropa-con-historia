<p align="center">
  <img src="frontend/src/assets/Logo RCH sin fondo-09.png" alt="Ropa con Historia" width="260" />
</p>

<h1 align="center">Ropa con Historia</h1>

<p align="center">
  Web application for managing a second-hand clothing market — appointments, products, sales, and supplier balances.
</p>

---

## What it does

**Ropa con Historia** connects clothing suppliers with a market administrator through two distinct roles:

- **Proveedor (Supplier)** — books drop-off and collection appointments, tracks their listed products and current balance.
- **Administrador (Admin)** — manages suppliers, registers products, records sales, updates product states, and handles balance payouts.

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 18 + TypeScript + Vite    |
| Backend  | NestJS + TypeScript             |
| Database | PostgreSQL + Prisma ORM         |
| Auth     | JWT (access + refresh tokens)   |
| Styling  | Tailwind CSS                    |

## Project Structure

```
ropa-con-historia/
├── backend/     # NestJS REST API
└── frontend/    # React + Vite SPA 
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Backend

```bash
cd backend
cp .env.example .env   # fill in your DATABASE_URL and JWT secrets
npm install
npx prisma migrate dev
npm run start:dev
```

API available at

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if needed
npm install
npm run dev
```

App available at 

## Key Features

- Role-based access control (`ADMIN` / `PROVEEDOR`) enforced server-side via JWT
- Product state machine: `EN_VENTA → VENDIDO → PAGADO`, with automatic balance calculation on sale
- Supplier balance split into **credit** (usable at the market) and **cash** (paid on collection)
- Appointment scheduling with admin confirmation flow (`PENDIENTE → CONFIRMADO → COMPLETADO`)
- Return request workflow: supplier submits, admin approves or rejects
