# StockSmart Architecture & System Design

## 1. System Architecture Overview

StockSmart follows a modern, enterprise multi-tiered architecture with strict separation of concerns, transactional integrity, and stateless JWT authentication.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Angular 22)"]
        UI["Responsive Enterprise UI (Bootstrap 5)"]
        Components["Feature Components (19 Views)"]
        AuthInterceptor["Auth Interceptor (JWT Bearer)"]
        APIServices["Typed API Services"]
    end

    subgraph Backend["Backend Layer (Spring Boot 3.3.5 / Java 21 LTS)"]
        Security["Spring Security & JWT Filter"]
        Controllers["REST Controllers (/api/*)"]
        Services["Domain Services (Business Logic)"]
        Repos["Spring Data JPA Repositories"]
    end

    subgraph Persistence["Persistence Layer (MySQL 8.0)"]
        DB[(stocksmart Relational Database)]
        Tables["Products, Inventory, Orders, Audit Logs"]
    end

    UI --> Components
    Components --> APIServices
    APIServices --> AuthInterceptor
    AuthInterceptor -->|HTTP / JSON with JWT| Security
    Security --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos -->|HikariCP / JDBC| DB
```

## 2. Inventory Consistency & Atomic Transactions

A central tenet of retail inventory optimization is strict mathematical consistency:
- **Quantity Non-Negativity:** Database constraints (`CHECK (quantity_on_hand >= 0)`) and service-layer validation prevent negative stock under any condition.
- **Pessimistic Concurrency Locking:** The `InventoryRepository` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)` during stock adjustments, transfers, and sales order fulfillment to eliminate race conditions and overselling.
- **Atomic Multi-Location Transfers:** A stock transfer atomically decreases source quantity and increases destination quantity within a single `@Transactional` boundary. If either step fails, the entire transaction is rolled back.
- **Auditable Movement Ledger:** Every change in inventory (RECEIPT, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, SALE) produces an immutable record in `inventory_movements` capturing `quantity_before`, `quantity_after`, user ID, and mandatory reason.

```mermaid
sequenceDiagram
    autonumber
    actor Mgr as Inventory Manager
    participant Ctrl as InventoryController
    participant Svc as InventoryService
    participant Repo as InventoryRepository
    participant MvRepo as InventoryMovementRepository
    participant DB as MySQL Database

    Mgr->>Ctrl: POST /api/inventory/transfer {sourceId, destId, productId, qty}
    Ctrl->>Svc: transferStock(request)
    activate Svc
    Note over Svc,DB: Open DB Transaction (@Transactional)
    Svc->>Repo: findByProductIdAndLocationIdForUpdate(src, prod) [Pessimistic Lock]
    Repo-->>Svc: srcInventory (onHand=50, reserved=0)
    Svc->>Svc: Validate availableQuantity >= qty
    Svc->>Repo: save(srcInventory.onHand = 30)
    Svc->>Repo: findByProductIdAndLocationIdForUpdate(dest, prod) [Pessimistic Lock]
    Repo-->>Svc: destInventory (onHand=10)
    Svc->>Repo: save(destInventory.onHand = 30)
    Svc->>MvRepo: save(TRANSFER_OUT movement: -20)
    Svc->>MvRepo: save(TRANSFER_IN movement: +20)
    Note over Svc,DB: Commit Transaction
    Svc-->>Ctrl: 200 OK
    deactivate Svc
    Ctrl-->>Mgr: Success Response
```

## 3. Role-Based Access Control (RBAC)

The system enforces three security roles:
1. **ROLE_ADMIN:** Complete system access, including `/api/users/**` for account provisioning, user deactivation, and system-wide configurations.
2. **ROLE_INVENTORY_MANAGER:** Full operational control over catalog management, purchase order approval, receiving shipments, stock adjustments, and multi-location transfers.
3. **ROLE_STAFF:** Read access to product catalog and inventory lookups; permission to create customer sales orders at point of fulfillment.

## 4. Hardware Integration Architecture (Future Scope)

- **Optical Barcode Scanners:** Implemented. Supports USB HID keyboard wedge emulation and input scanning.
- **RFID Gate Readers:** Architecture design includes an event-driven sidecar consumer (`/api/inventory/rfid-events`) for EPC Gen2 RFID tags, planned for future IoT expansion.
