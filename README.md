# StockSense — Modular Inventory Management System

A domain-driven, modular-monolith inventory system.

| Layer       | Technology                                                    |
|-------------|---------------------------------------------------------------|
| Frontend    | React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui       |
| State       | TanStack Query · React Router · React Hook Form · Zod         |
| Backend     | Java 25 · Spring Boot 4.1.x · Maven · modular-monolith        |
| Persistence | PostgreSQL 17 · Spring Data JPA · Flyway migrations           |
| Auth        | Spring Security (session-based; with CSRF protection) |
| Testing     | Testcontainers + `@ServiceConnection` (no static DB URL)      |
| Dev infra   | Docker Compose (postgres · backend · frontend)                |

---

## Quick start (Docker Compose)

```bash
# 1. Copy the env template — edit credentials if you want
cp .env.example .env

# 2. Build images and start all three services
docker compose up --build
```

| Service       | URL                                       |
|---------------|-------------------------------------------|
| Frontend      | <http://localhost:5173>                   |
| Backend API   | <http://localhost:8080>                   |
| Swagger UI    | <http://localhost:8080/swagger-ui.html>   |
| Actuator      | <http://localhost:8080/actuator/health>   |

---

## Local hot-reload development

### Backend (Spring Boot)

Requires: Java 25, Maven.

```bash
# Start Postgres only (skip backend/frontend Docker builds)
docker compose up postgres -d

# Run Spring Boot with the local profile
cd backend
SPRING_PROFILES_ACTIVE=local \
POSTGRES_HOST=localhost \
POSTGRES_PORT=5432 \
POSTGRES_DB=stocksense \
POSTGRES_USER=stocksense \
POSTGRES_PASSWORD=changeme_secret \
mvn spring-boot:run
```

Or run `TestStockSenseApplication.main()` from your IDE — it spins up a
Testcontainers Postgres automatically (no local Postgres needed).

### Frontend (Vite)

Requires: Bun.

```bash
cd frontend
bun install
bun run dev
```

API calls from `localhost:5173` proxy to `localhost:8080` automatically (see
`vite.config.ts`). No `http://localhost:8080` is hardcoded in frontend code.

---

## Module / package structure

```
com.stocksense
├── auth/                   # Session auth & CSRF
├── users/                  # User domain
├── partner/                # Business partners
├── catalog/
│   ├── product/            # Product aggregate
│   ├── category/           # Category taxonomy
│   └── uom/                # Units of measure
├── warehouse/
│   ├── warehouse/          # Warehouse aggregate
│   └── location/           # Stock locations
├── inventory/
│   ├── balance/            # On-hand balances
│   ├── movement/           # Stock ledger
│   ├── posting/            # Inventory posting logic
│   └── reservation/        # Soft-locks
├── operations/
│   ├── core/               # Shared operation logic
│   ├── receipt/            # Goods receipts
│   ├── delivery/           # Deliveries
│   ├── transfer/           # Transfers
│   └── adjustment/         # Adjustments
├── dashboard/              # Dashboard metrics
├── reporting/              # Reports
├── audit/                  # Audit log
├── health/                 # GET /api/health
└── config/                 # SecurityConfig, OpenApiConfig
```

---

## Database migrations

Files in `backend/src/main/resources/db/migration/`.

| Migration file                   | Tables created                                                  |
|----------------------------------|-----------------------------------------------------------------|
| `V001__initial_schema.sql`       | `app_user`, `category`, `unit_of_measure`, `product`, `warehouse`, `location` |
| `V002__inventory_core.sql`       | `business_partner`, `reorder_rule`, `inventory_operation`, `operation_line`, `inventory_adjustment_detail`, `stock_movement`, `inventory_balance`, `reservation`, `audit_log` |
| `V003__auth_user_management.sql` | `password_reset_challenge`                                      |
| `V004__warehouse_requirements.sql`| *(Alters location constraints)*                                 |
| `V005__operation_references.sql` | `operation_sequence`                                            |
| `V006__delivery_details.sql`     | `delivery_detail`                                               |

All tables use UUID primary keys and `created_at` / `updated_at TIMESTAMPTZ` audit columns.

---

## Publicly accessible endpoints (no auth required)

| Endpoint             | Who calls it                           |
|----------------------|----------------------------------------|
| `GET /api/health`    | Frontend landing page (via Vite proxy) |
| `GET /actuator/health` | Docker Compose / orchestration healthcheck |
| `GET /swagger-ui/**` | Developers                             |
| `GET /v3/api-docs/**`| Developers / API clients               |

Everything else requires authentication (enforced by `SecurityConfig`).

---

## Branching rules (post-scaffold)

- `main` — initial scaffold commit only (this commit is the exception).
- All further work: **one feature branch per domain, atomic commits**.
- Merge to `main` via PR.