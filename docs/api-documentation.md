# StockSmart REST API Documentation

Base URL: `http://localhost:8080/api`
Interactive Swagger UI: `http://localhost:8080/api/swagger-ui.html`
OpenAPI Specification: `http://localhost:8080/api/v3/api-docs`

---

## Authentication Endpoints

### 1. User Login
- **URL:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "username": "admin",
  "email": "admin@stocksmart.com",
  "roles": ["ROLE_ADMIN", "ROLE_INVENTORY_MANAGER", "ROLE_STAFF"]
}
```

---

## Products Catalog Endpoints

### 2. Search & List Products
- **URL:** `GET /api/products?search=wireless&categoryId=1&page=0&size=20&sort=name&dir=asc`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Paginated `ProductResponse` objects.

### 3. Create Product
- **URL:** `POST /api/products`
- **Roles:** `ADMIN`, `INVENTORY_MANAGER`
- **Request Body:**
```json
{
  "sku": "ELEC-100",
  "name": "Wireless Charging Pad 15W",
  "description": "Fast Qi wireless charging pad",
  "categoryId": 1,
  "barcode": "8901234567999",
  "unitOfMeasure": "UNIT",
  "costPrice": 450.00,
  "sellingPrice": 899.00,
  "reorderLevel": 15
}
```

### 4. Barcode / SKU Scan Lookup
- **URL:** `GET /api/products/search/barcode?value=8901234567890`
- **Response:** Product details matching exact barcode or SKU.

---

## Multi-Location Inventory Endpoints

### 5. Get Inventory at Location
- **URL:** `GET /api/inventory/location/{locationId}?page=0&size=20`

### 6. Adjust Stock Level
- **URL:** `POST /api/inventory/adjust`
- **Roles:** `ADMIN`, `INVENTORY_MANAGER`
- **Request Body:**
```json
{
  "productId": 1,
  "locationId": 1,
  "quantity": -2,
  "reason": "Damaged unit during warehouse forklift transit"
}
```

### 7. Atomic Inter-Location Transfer
- **URL:** `POST /api/inventory/transfer`
- **Roles:** `ADMIN`, `INVENTORY_MANAGER`
- **Request Body:**
```json
{
  "productId": 1,
  "sourceLocationId": 1,
  "destinationLocationId": 2,
  "quantity": 10,
  "reason": "Replenishment for Downtown branch promotion"
}
```

---

## Purchase Orders Endpoints

### 8. Create Purchase Order
- **URL:** `POST /api/purchase-orders`
- **Roles:** `ADMIN`, `INVENTORY_MANAGER`

### 9. Receive Items Against PO
- **URL:** `POST /api/purchase-orders/{id}/receive`
- **Request Body:**
```json
{
  "items": [
    { "itemId": 1, "quantityReceived": 25 },
    { "itemId": 2, "quantityReceived": 10 }
  ]
}
```

---

## Sales Orders Endpoints

### 10. Create Sales Order
- **URL:** `POST /api/sales-orders`
- **Roles:** `ADMIN`, `INVENTORY_MANAGER`, `STAFF`

### 11. Change Status (Fulfill / Deduct Stock)
- **URL:** `PATCH /api/sales-orders/{id}/status?status=COMPLETED`
- **Roles:** `ADMIN`, `INVENTORY_MANAGER`
- **Effect:** Deducts stock atomically and writes audit trail record.

---

## Dashboard KPIs Endpoint

### 12. Get Executive Metrics
- **URL:** `GET /api/dashboard/kpis`
- **Response (200 OK):**
```json
{
  "totalActiveProducts": 15,
  "totalLocations": 4,
  "totalInventoryUnits": 2420,
  "lowStockCount": 3,
  "outOfStockCount": 0,
  "totalSuppliers": 5,
  "pendingPurchaseOrders": 3,
  "totalSalesOrders": 5,
  "totalRevenue": 16138.00
}
```
