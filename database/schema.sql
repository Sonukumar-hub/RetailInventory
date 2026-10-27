-- StockSmart: Retail Inventory Optimization System
-- Database Schema
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS stocksmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stocksmart;

-- ============================================================
-- USERS AND ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    first_name   VARCHAR(100),
    last_name    VARCHAR(100),
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    sku             VARCHAR(100)   NOT NULL UNIQUE,
    name            VARCHAR(255)   NOT NULL,
    description     TEXT,
    category_id     BIGINT,
    barcode         VARCHAR(100)   UNIQUE,
    unit_of_measure VARCHAR(50)    NOT NULL DEFAULT 'UNIT',
    cost_price      DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
    selling_price   DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
    reorder_level   INT            NOT NULL DEFAULT 0,
    active          BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_products_sku (sku),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_category (category_id),
    INDEX idx_products_active (active)
);

-- ============================================================
-- LOCATIONS (Stores / Warehouses)
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    type        VARCHAR(50)  NOT NULL DEFAULT 'WAREHOUSE',
    address     VARCHAR(500),
    city        VARCHAR(100),
    state       VARCHAR(100),
    country     VARCHAR(100),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_locations_active (active)
);

-- ============================================================
-- INVENTORY (Stock per Product per Location)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id              BIGINT  AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT  NOT NULL,
    location_id     BIGINT  NOT NULL,
    quantity_on_hand INT     NOT NULL DEFAULT 0,
    quantity_reserved INT   NOT NULL DEFAULT 0,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_inventory_product_location (product_id, location_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_inventory_product (product_id),
    INDEX idx_inventory_location (location_id),
    CONSTRAINT chk_inventory_on_hand CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_inventory_reserved CHECK (quantity_reserved >= 0)
);

-- ============================================================
-- INVENTORY MOVEMENTS (Audit Trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_movements (
    id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT        NOT NULL,
    location_id     BIGINT        NOT NULL,
    movement_type   VARCHAR(50)   NOT NULL,   -- RECEIPT, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, SALE, RETURN
    quantity        INT           NOT NULL,
    quantity_before INT           NOT NULL,
    quantity_after  INT           NOT NULL,
    reference_id    BIGINT,                   -- PO id, SO id, or transfer batch id
    reference_type  VARCHAR(50),              -- PURCHASE_ORDER, SALES_ORDER, TRANSFER, MANUAL
    reason          VARCHAR(500),
    created_by      BIGINT,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL,
    INDEX idx_movement_product  (product_id),
    INDEX idx_movement_location (location_id),
    INDEX idx_movement_type     (movement_type),
    INDEX idx_movement_created  (created_at),
    INDEX idx_movement_reference (reference_id, reference_type)
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email          VARCHAR(100),
    phone          VARCHAR(50),
    address        VARCHAR(500),
    city           VARCHAR(100),
    state          VARCHAR(100),
    country        VARCHAR(100),
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_suppliers_active (active)
);

-- Supplier-Product associations
CREATE TABLE IF NOT EXISTS supplier_products (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    supplier_id     BIGINT         NOT NULL,
    product_id      BIGINT         NOT NULL,
    supplier_sku    VARCHAR(100),
    unit_cost       DECIMAL(15,2),
    lead_time_days  INT,
    UNIQUE KEY uq_supplier_product (supplier_id, product_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    order_number    VARCHAR(50)    NOT NULL UNIQUE,
    supplier_id     BIGINT         NOT NULL,
    location_id     BIGINT         NOT NULL,
    status          VARCHAR(50)    NOT NULL DEFAULT 'DRAFT',
    order_date      DATE           NOT NULL,
    expected_date   DATE,
    total_amount    DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
    notes           TEXT,
    created_by      BIGINT,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL,
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_status (status),
    INDEX idx_po_order_date (order_date)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id                  BIGINT         AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id   BIGINT         NOT NULL,
    product_id          BIGINT         NOT NULL,
    quantity_ordered    INT            NOT NULL,
    quantity_received   INT            NOT NULL DEFAULT 0,
    unit_cost           DECIMAL(15,2)  NOT NULL,
    line_total          DECIMAL(15,2)  NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)        REFERENCES products(id)        ON DELETE RESTRICT,
    INDEX idx_poi_order (purchase_order_id),
    CONSTRAINT chk_poi_qty_ordered   CHECK (quantity_ordered > 0),
    CONSTRAINT chk_poi_qty_received  CHECK (quantity_received >= 0)
);

-- ============================================================
-- SALES ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    order_number    VARCHAR(50)    NOT NULL UNIQUE,
    location_id     BIGINT         NOT NULL,
    customer_name   VARCHAR(255),
    customer_email  VARCHAR(100),
    status          VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    order_date      DATE           NOT NULL,
    total_amount    DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
    notes           TEXT,
    created_by      BIGINT,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by)  REFERENCES users(id)     ON DELETE SET NULL,
    INDEX idx_so_location  (location_id),
    INDEX idx_so_status    (status),
    INDEX idx_so_order_date (order_date)
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    sales_order_id  BIGINT         NOT NULL,
    product_id      BIGINT         NOT NULL,
    quantity        INT            NOT NULL,
    unit_price      DECIMAL(15,2)  NOT NULL,
    line_total      DECIMAL(15,2)  NOT NULL,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)     REFERENCES products(id)     ON DELETE RESTRICT,
    INDEX idx_soi_order (sales_order_id),
    CONSTRAINT chk_soi_qty CHECK (quantity > 0)
);
