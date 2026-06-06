# Ropa con Historia — Product Specification

## Overview

Web application for managing a second-hand clothing market. It enables suppliers (proveedores) to schedule appointments and track their earnings, while administrators manage products, appointments, and balances.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + TypeScript + Vite         |
| Backend    | Node.js + NestJS + TypeScript     |
| Database   | PostgreSQL                        |
| ORM        | Prisma                            |
| Auth       | JWT (access + refresh tokens)     |
| Styling    | Tailwind CSS                      |

---

## User Roles

### Proveedor (Supplier)
A registered supplier who brings clothing to the market. They can:
- Book appointments (to drop off clothing or collect earnings)
- View their listed products and each product's current state
- View their current balance based on sales
- Request a return (devolución) of a product

### Administrador (Admin)
The market manager. They can:
- Manage all suppliers (create, view, deactivate)
- Load/register products per supplier
- Update product states (which affects supplier balances)
- Manage appointments
- Manage and adjust supplier balances

---

## Functional Requirements

### 1. Authentication & Users

- Suppliers can self-register or be created by an admin
- Login with email + password
- Role-based access control: `ADMIN` | `PROVEEDOR`
- JWT-based session management

**Supplier profile fields:**
- Name
- Email
- Phone
- Earnings percentage config (e.g. 60% credit, 40% cash)
- Active / Inactive status

---

### 2. Appointments (Turnos)

Suppliers request appointments for two purposes:
- **Drop-off**: bringing clothing to the market
- **Collection**: picking up earnings

**Appointment states:**
- `PENDIENTE` — requested, not yet confirmed
- `CONFIRMADO` — confirmed by admin
- `COMPLETADO` — appointment has taken place
- `CANCELADO` — cancelled by either party

**Supplier can:**
- Request a new appointment (selecting type and preferred date/time)
- View their upcoming and past appointments
- Cancel a pending appointment

**Admin can:**
- View all appointments
- Confirm, complete, or cancel any appointment
- Manually create appointments on behalf of a supplier

---

### 3. Products & States

Products are registered by the admin on behalf of a supplier.

**Product fields:**
- Name / description
- Category (optional)
- Listed price
- Supplier (owner)
- State

**Product states:**
- `EN_VENTA` — available for sale
- `VENDIDO` — sold (triggers balance calculation)
- `PAGADO` — earnings paid out to supplier
- `DEVUELTO` — returned to supplier
- `CANCELADO` — removed from sale without return

**State transitions (admin only):**
```
EN_VENTA → VENDIDO → PAGADO
EN_VENTA → DEVUELTO
EN_VENTA → CANCELADO
```

When a product moves to `VENDIDO`, the system automatically calculates and updates the supplier's balance based on their configured earnings percentage.

---

### 4. Sales & Transactions

**Sale (Venta):**
- Represents one or more products sold together (shopping cart model)
- Created by admin when recording a sale

**Sale fields:**
- List of products
- Total sale amount
- Date
- Associated supplier(s)

**Sale detail:**
- Per-product: listed price, supplier cut, admin cut

> Note: A single sale may include products from multiple suppliers. Each supplier's balance is updated independently.

---

### 5. Balance (Saldo)

Each supplier has a running balance derived from their sold products.

**Balance calculation:**
```
supplier_earnings = product_price * (supplier_percentage / 100)
```

The supplier's configured percentage splits earnings into:
- **Credit** (usable at the market)
- **Cash** (payable on collection)

Example: 60% credit / 40% cash on a $1000 sale → $600 credit, $400 cash.

**Balance states per transaction:**
- `PENDIENTE` — earned but not yet collected
- `COBRADO` — collected by the supplier
- `USADO` — used as credit in the market

**Admin can:**
- Mark balance as collected (COBRADO) when supplier comes in
- Manually adjust balance (with a required note/reason)
- View full transaction history per supplier

**Supplier can:**
- View current available balance (credit + cash breakdown)
- View history of earnings and payouts

---

### 6. Returns (Devoluciones)

A supplier can request a return for a product currently in `EN_VENTA` state.

- Supplier submits a return request
- Admin reviews and approves/rejects
- On approval: product moves to `DEVUELTO`, no balance impact
- On rejection: product stays in current state

---

## Data Models (simplified)

```
User
  id, name, email, passwordHash, role, phone
  creditPercentage, cashPercentage
  active, createdAt

Product
  id, name, description, category
  price, state
  supplierId → User
  saleId → Sale (nullable)
  createdAt, updatedAt

Appointment (Turno)
  id, supplierId → User
  type: DROP_OFF | COLLECTION
  state: PENDIENTE | CONFIRMADO | COMPLETADO | CANCELADO
  scheduledAt, notes, createdAt

Sale (Venta)
  id, createdAt, adminId → User
  products → Product[]

BalanceTransaction
  id, supplierId → User
  amount, type: CREDIT | CASH
  state: PENDIENTE | COBRADO | USADO
  productId → Product (nullable)
  note, createdAt

ReturnRequest (Devolución)
  id, supplierId → User
  productId → Product
  state: PENDIENTE | APROBADA | RECHAZADA
  reason, adminNote, createdAt
```

---

## API Endpoints (REST)

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
```

### Users (Admin only)
```
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

### Products
```
GET    /products                  (admin: all | supplier: own)
GET    /products/:id
POST   /products                  (admin only)
PATCH  /products/:id/state        (admin only)
DELETE /products/:id              (admin only)
```

### Appointments (Turnos)
```
GET    /appointments              (admin: all | supplier: own)
GET    /appointments/:id
POST   /appointments              (supplier: request | admin: create)
PATCH  /appointments/:id/state    (admin: confirm/complete/cancel | supplier: cancel)
```

### Sales (Ventas)
```
GET    /sales                     (admin: all | supplier: own)
GET    /sales/:id
POST   /sales                     (admin only)
```

### Balance
```
GET    /balance/:supplierId        (admin or own supplier)
GET    /balance/:supplierId/history
PATCH  /balance/transactions/:id   (admin only — mark as cobrado/usado)
POST   /balance/:supplierId/adjust  (admin only — manual adjustment)
```

### Returns (Devoluciones)
```
GET    /returns                    (admin: all | supplier: own)
POST   /returns                    (supplier only)
PATCH  /returns/:id/state          (admin only)
```

---

## Design & Branding

### Logo

The official logo is located at `frontend/src/assets/Logo RCH sin fondo-09.png`. It must be displayed on the login page.

### Color Palette

All UI components must use these CSS custom properties:

```css
:root {
  --primary-color: #008081;
  --primary-hover-color: #005d5d;
  --secondary-color: #8E8F32;
  --secondary-hover-color: #676924;
  --terciary-color: #E5E3CA;
  --terciary-hover-color: #cac8b2;
}
```

| Variable                  | Hex       | Usage                              |
|---------------------------|-----------|------------------------------------|
| `--primary-color`         | `#008081` | Primary actions, buttons, links    |
| `--primary-hover-color`   | `#005d5d` | Hover state for primary elements   |
| `--secondary-color`       | `#8E8F32` | Secondary actions and accents      |
| `--secondary-hover-color` | `#676924` | Hover state for secondary elements |
| `--terciary-color`        | `#E5E3CA` | Backgrounds, cards, subtle fills   |
| `--terciary-hover-color`  | `#cac8b2` | Hover state for tertiary elements  |

---

## Frontend Pages

### Shared
- Login page

### Supplier (Proveedor)
- Dashboard: balance summary + upcoming appointments
- My Products: list with state badges, filter by state
- My Balance: credit/cash breakdown, transaction history
- Appointments: upcoming list + book new appointment form
- Return Request: form to request a product return

### Admin
- Dashboard: daily sales summary, pending appointments, recent activity
- Suppliers: list, create, view/edit supplier profile
- Products: list all products, register new product, update state
- Sales: record new sale (multi-product cart), view sale history
- Appointments: calendar or list view, manage states
- Balance: per-supplier balance management, manual adjustments

---

## Future Features (Out of Scope v1)

- Supplier-facing item catalog with photos
- QR code per product for quick state updates
- Email / WhatsApp notifications for appointment confirmations
- Reporting / export (CSV, PDF) for sales and earnings
- Mobile-optimized PWA
- Online payment integration
