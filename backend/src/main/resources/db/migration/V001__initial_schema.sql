-- V001__initial_schema.sql
-- Baseline schema: core reference tables only.
-- Inventory balance, movements, reservations, and operation tables
-- are deliberately excluded — they require dedicated design work.
--
-- Conventions:
--   • UUID primary keys (gen_random_uuid()).
--   • created_at / updated_at TIMESTAMPTZ audit columns on every table.

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE app_user (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(100) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Catalog ─────────────────────────────────────────────────────────────────
CREATE TABLE category (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    parent_id  UUID         REFERENCES category(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE unit_of_measure (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL UNIQUE,
    symbol     VARCHAR(20)  NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sku         VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID         REFERENCES category(id) ON DELETE SET NULL,
    uom_id      UUID        NOT NULL REFERENCES unit_of_measure(id),
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Warehouse ────────────────────────────────────────────────────────────────
CREATE TABLE warehouse (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code       VARCHAR(50)  NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    address    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE location (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID        NOT NULL REFERENCES warehouse(id),
    code         VARCHAR(100) NOT NULL,
    name         VARCHAR(255) NOT NULL,
    parent_id    UUID         REFERENCES location(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (warehouse_id, code)
);
