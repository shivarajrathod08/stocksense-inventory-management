-- =============================================================
-- V1__initial_schema.sql
-- StockSense IMS — Initial Database Schema
-- =============================================================

-- -----------------------------------------------
-- ROLES
-- -----------------------------------------------
CREATE TABLE roles (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_STAFF');

-- -----------------------------------------------
-- USERS
-- -----------------------------------------------
CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- USER ROLES (join)
-- -----------------------------------------------
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- -----------------------------------------------
-- WAREHOUSES
-- -----------------------------------------------
CREATE TABLE warehouses (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    address      TEXT,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- LOCATIONS  (sub-locations within a warehouse)
-- -----------------------------------------------
CREATE TABLE locations (
    id           BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    code         VARCHAR(50),
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (warehouse_id, name)
);

-- -----------------------------------------------
-- CATEGORIES
-- -----------------------------------------------
CREATE TABLE categories (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- -----------------------------------------------
-- SUPPLIERS
-- -----------------------------------------------
CREATE TABLE suppliers (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    email        VARCHAR(150),
    phone        VARCHAR(30),
    address      TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- PRODUCTS
-- -----------------------------------------------
CREATE TABLE products (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    sku           VARCHAR(100) NOT NULL UNIQUE,
    category_id   BIGINT REFERENCES categories(id),
    unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'units',
    description   TEXT,
    reorder_point INTEGER NOT NULL DEFAULT 10,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);

-- -----------------------------------------------
-- INVENTORY  (stock quantity per product + location)
-- -----------------------------------------------
CREATE TABLE inventory (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id),
    location_id BIGINT NOT NULL REFERENCES locations(id),
    quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);

-- -----------------------------------------------
-- RECEIPTS  (incoming stock documents)
-- -----------------------------------------------
CREATE TABLE receipts (
    id              BIGSERIAL PRIMARY KEY,
    reference       VARCHAR(100) NOT NULL UNIQUE,
    supplier_id     BIGINT REFERENCES suppliers(id),
    destination_id  BIGINT NOT NULL REFERENCES locations(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',   -- DRAFT, VALIDATED, CANCELED
    notes           TEXT,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    validated_by    BIGINT REFERENCES users(id),
    validated_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- RECEIPT ITEMS
-- -----------------------------------------------
CREATE TABLE receipt_items (
    id           BIGSERIAL PRIMARY KEY,
    receipt_id   BIGINT NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id   BIGINT NOT NULL REFERENCES products(id),
    quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);

-- -----------------------------------------------
-- DELIVERIES  (outgoing stock documents)
-- -----------------------------------------------
CREATE TABLE deliveries (
    id           BIGSERIAL PRIMARY KEY,
    reference    VARCHAR(100) NOT NULL UNIQUE,
    source_id    BIGINT NOT NULL REFERENCES locations(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'DRAFT',   -- DRAFT, VALIDATED, CANCELED
    notes        TEXT,
    created_by   BIGINT NOT NULL REFERENCES users(id),
    validated_by BIGINT REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- DELIVERY ITEMS
-- -----------------------------------------------
CREATE TABLE delivery_items (
    id          BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_delivery_items_delivery ON delivery_items(delivery_id);

-- -----------------------------------------------
-- TRANSFERS  (internal stock movements)
-- -----------------------------------------------
CREATE TABLE transfers (
    id              BIGSERIAL PRIMARY KEY,
    reference       VARCHAR(100) NOT NULL UNIQUE,
    source_id       BIGINT NOT NULL REFERENCES locations(id),
    destination_id  BIGINT NOT NULL REFERENCES locations(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT, COMPLETED, CANCELED
    notes           TEXT,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    completed_by    BIGINT REFERENCES users(id),
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_transfer_locations CHECK (source_id <> destination_id)
);

-- -----------------------------------------------
-- TRANSFER ITEMS
-- -----------------------------------------------
CREATE TABLE transfer_items (
    id          BIGSERIAL PRIMARY KEY,
    transfer_id BIGINT NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX idx_transfer_items_transfer ON transfer_items(transfer_id);

-- -----------------------------------------------
-- STOCK ADJUSTMENTS
-- -----------------------------------------------
CREATE TABLE stock_adjustments (
    id                 BIGSERIAL PRIMARY KEY,
    reference          VARCHAR(100) NOT NULL UNIQUE,
    product_id         BIGINT NOT NULL REFERENCES products(id),
    location_id        BIGINT NOT NULL REFERENCES locations(id),
    recorded_quantity  INTEGER NOT NULL,
    counted_quantity   INTEGER NOT NULL CHECK (counted_quantity >= 0),
    difference         INTEGER NOT NULL,   -- counted - recorded (can be negative)
    reason             TEXT,
    status             VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT, APPLIED, CANCELED
    created_by         BIGINT NOT NULL REFERENCES users(id),
    applied_by         BIGINT REFERENCES users(id),
    applied_at         TIMESTAMP,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- STOCK LEDGER  (immutable audit trail)
-- -----------------------------------------------
CREATE TABLE stock_ledger (
    id                  BIGSERIAL PRIMARY KEY,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    product_id          BIGINT NOT NULL REFERENCES products(id),
    sku                 VARCHAR(100) NOT NULL,
    operation_type      VARCHAR(30) NOT NULL,  -- RECEIPT, DELIVERY, TRANSFER_OUT, TRANSFER_IN, ADJUSTMENT
    reference_id        BIGINT,
    reference_type      VARCHAR(30),
    source_location_id  BIGINT REFERENCES locations(id),
    dest_location_id    BIGINT REFERENCES locations(id),
    quantity_change     INTEGER NOT NULL,
    resulting_quantity  INTEGER NOT NULL,
    performed_by_id     BIGINT REFERENCES users(id)
);

CREATE INDEX idx_ledger_product ON stock_ledger(product_id);
CREATE INDEX idx_ledger_created_at ON stock_ledger(created_at DESC);
CREATE INDEX idx_ledger_operation ON stock_ledger(operation_type);
