# Ropa con Historia — Claude Code Guide

## Project Overview

Second-hand clothing market management app. Two roles: **Proveedor** (supplier) and **Administrador** (admin). Suppliers schedule appointments and track earnings; admins manage products, sales, appointments, and balances.

Full spec: `SPEC.md`

---

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React + TypeScript + Vite     |
| Backend  | Node.js + NestJS + TypeScript |
| Database | PostgreSQL                    |
| ORM      | Prisma                        |
| Auth     | JWT (access + refresh tokens) |
| Styling  | Tailwind CSS                  |

---

## Monorepo Structure (intended)

```
ropa-con-historia/
  backend/       # NestJS app
  frontend/      # React + Vite app
  SPEC.md
  CLAUDE.md
```

---

## Domain Language

Use Spanish names for domain entities (matching the business):

| Code name           | Meaning                          |
|---------------------|----------------------------------|
| `Proveedor`         | Supplier                         |
| `Turno`             | Appointment                      |
| `Venta`             | Sale                             |
| `Saldo`             | Balance                          |
| `Devolución`        | Return request                   |
| `BalanceTransaction`| Individual credit/cash entry     |

---

## User Roles

- `ADMIN` — full access; manages everything
- `PROVEEDOR` — scoped access; sees only their own data

Role is stored in JWT and enforced server-side via NestJS guards.

---

## Product State Machine

Valid transitions (admin only):

```
EN_VENTA → VENDIDO   → PAGADO
EN_VENTA → DEVUELTO
EN_VENTA → CANCELADO
```

When a product moves to `VENDIDO`, automatically calculate and create `BalanceTransaction` records for that supplier using their `creditPercentage` / `cashPercentage`.

---

## Balance Calculation

```
supplier_earnings = product_price * (supplier_percentage / 100)
credit_amount     = supplier_earnings * (creditPercentage / 100)
cash_amount       = supplier_earnings * (cashPercentage / 100)
```

Two `BalanceTransaction` rows are created per sold product: one `CREDIT`, one `CASH`, both starting as `PENDIENTE`.

---

## Appointment States

`PENDIENTE → CONFIRMADO → COMPLETADO`  
`PENDIENTE → CANCELADO` (either party)  
`CONFIRMADO → CANCELADO` (admin only)

Appointment types: `DROP_OFF` | `COLLECTION`

---

## Return Request Flow

1. Supplier submits request (product must be `EN_VENTA`)
2. Admin approves → product moves to `DEVUELTO`, no balance impact
3. Admin rejects → product stays in current state

---

## API Conventions

- REST endpoints under `/api/v1/`
- Role enforcement via NestJS `@Roles()` guard + `RolesGuard`
- Suppliers automatically scoped to their own data — never trust `supplierId` from the request body; derive it from the JWT
- Patch endpoints for state transitions use `/state` sub-resource (e.g. `PATCH /products/:id/state`)

---

## Key Constraints

- A single `Venta` (sale) can include products from multiple suppliers; each supplier's balance is updated independently
- `creditPercentage + cashPercentage` must equal 100 for each supplier
- Balance manual adjustments require a `note` field (non-nullable)
- Deactivated (`active: false`) suppliers cannot log in or book appointments
