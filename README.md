# StockSmart — Retail Inventory Optimization System

> **A production-quality full-stack academic and portfolio system demonstrating enterprise inventory management, multi-location distribution, transactional integrity, optical barcode scanning, and KPI analytics.**

---

## 1. System Overview

StockSmart is designed for modern retail chains and distribution networks operating multiple warehouses and physical retail stores. It addresses the critical challenges of modern inventory management:
- Preventing stockouts and overstocks through automated reorder threshold monitoring.
- Managing inventory at the **product × location** granularity rather than global totals.
- Guaranteeing atomic, race-condition-free stock transfers across stores and fulfillment centers.
- Maintaining an auditable, immutable ledger of all stock movements with mandatory reasons.
- Streamlining supplier procurement through structured Purchase Order receiving and customer fulfillment via Sales Orders.

---

## 2. Technology Stack

### Backend
- **Language:** Java 21 LTS (Eclipse Temurin)
- **Framework:** Spring Boot 3.3.5
- **Persistence:** Spring Data JPA with Hibernate ORM
- **Security:** Spring Security 6 with stateless JWT (HS256)
- **Database:** MySQL 8.0 (with connection pooling via HikariCP)
- **API Documentation:** SpringDoc OpenAPI 3 / Swagger UI 5
- **Testing:** JUnit 5, Mockito, AssertJ, Spring WebMvcTest, H2 in-memory DB

### Frontend
- **Framework:** Angular 22.2
- **Language:** TypeScript 5.6
- **State & Architecture:** Signals, Reactive Forms, Component Input Binding
- **Styling:** Bootstrap 5.3 & Bootstrap Icons
- **HTTP Client:** Angular `provideHttpClient` with functional `authInterceptor`

---

## 3. Directory Structure

```
StockSmart/
├── backend/
│   ├── pom.xml
│   ├── src/main/java/com/stocksmart/
│   │   ├── config/            # SecurityConfig, JpaConfig, OpenApiConfig
│   │   ├── controller/        # Auth, Products, Inventory, Orders, Dashboard, Users
│   │   ├── dto/               # Type-safe Records for requests & responses
│   │   ├── entity/            # JPA Entities with pessimistic locks & constraints
│   │   ├── exception/         # Centralized GlobalExceptionHandler
│   │   ├── repository/        # Spring Data JPA interfaces
│   │   ├── security/          # JwtTokenProvider, JwtAuthenticationFilter
│   │   └── service/           # Layered transactional domain logic
│   └── src/test/java/         # Comprehensive Unit & Controller Test Suites
├── frontend/
│   ├── package.json
│   ├── angular.json
│   └── src/app/
│       ├── core/              # AuthService, ApiService, Guards, Interceptors, Models
│       ├── layout/            # Navbar, Sidebar, Root Layout
│       └── features/          # 19 Dedicated Pages & Views
├── database/
│   ├── schema.sql             # Full DDL with indexes, checks & FK constraints
│   ├── sample-data.sql        # Realistic demo dataset
│   └── init-db.ps1            # One-click database initializer
├── docs/
│   ├── architecture.md        # Deep-dive architectural documentation & sequence flows
│   └── api-documentation.md   # Complete REST API reference
├── run-backend.ps1            # One-click backend launcher
├── run-frontend.ps1           # One-click frontend launcher
├── .env.example               # Safe environment configuration template
└── README.md
```

---

## 4. Prerequisites

1. **Java Development Kit:** JDK 21 LTS (configured at `C:\tools\jdk-21\jdk-21.0.12.1+1` or in PATH)
2. **Build Tool:** Apache Maven 3.9+ (configured at `C:\tools\apache-maven-3.9.6\bin` or in PATH)
3. **Node.js:** Node.js v20+ and npm
4. **MySQL Database:** MySQL Server 8.0 running on `localhost:3306`

---

## 5. Quick Start Instructions

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env` and set your MySQL password:
```bash
cp .env.example .env
```
Edit `.env`:
```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stocksmart
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

### Step 2: Initialize MySQL Database
Run the provided PowerShell database initializer:
```powershell
.\database\init-db.ps1 -Password "your_mysql_password"
```
Or execute directly with the MySQL command line client:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample-data.sql
```

### Step 3: Run the Backend
```powershell
.\run-backend.ps1
```
*API running at:* `http://localhost:8080/api`  
*Swagger Documentation:* `http://localhost:8080/api/swagger-ui.html`

### Step 4: Run the Frontend
In a new terminal window:
```powershell
.\run-frontend.ps1
```
*Access UI at:* `http://localhost:4200`

---

## 6. Pre-Configured Demo Accounts

| Username | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | `ROLE_ADMIN` | Full system access, User Management, Global settings |
| `manager` | `Manager@123` | `ROLE_INVENTORY_MANAGER` | Products, Stock Adjustments, Transfers, POs & SOs |
| `staff` | `Staff@123` | `ROLE_STAFF` | Catalog search, Barcode scan, Create Customer Sales |

---

## 7. Automated Testing & Verification

Run the full automated test suite using Maven:
```powershell
$env:JAVA_HOME = "C:\tools\jdk-21\jdk-21.0.12.1+1"
$env:PATH = "C:\tools\jdk-21\jdk-21.0.12.1+1\bin;C:\tools\apache-maven-3.9.6\bin;" + $env:PATH
cd backend
mvn test
```

Build the Angular frontend:
```bash
cd frontend
npx ng build
```

---

## 8. Key Business Rules & Quality Assurance

1. **Negative Stock Prevention:** Enforced at both the database level via table CHECK constraints and at the service level with custom `InsufficientStockException` handling.
2. **Atomic Inventory Transfers:** Uses pessimistic locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`) to guarantee thread-safe stock deduction at source and increment at destination.
3. **Audit Trail Compliance:** Every stock modification (whether receipt, adjustment, or sale) requires an audit log capturing user ID, timestamp, before/after values, and a mandatory business justification.
4. **Order State Machine:** Purchase Orders progress through `DRAFT -> ORDERED -> PARTIALLY_RECEIVED -> RECEIVED` with strict receiving validation. Sales Orders enforce stock availability before reserving or completing sales.

---

## 9. Hardware & Integration Roadmap

- **Optical Barcode Scanners:** Fully functional via USB keyboard emulation and the built-in Barcode Scanner module (`/barcode-search`).
- **Camera-Based Mobile Scanning:** Supported through HTML5 input hooks.
- **RFID Gate Readers:** Planned future enhancement for automated pallet and RFID tag detection.
