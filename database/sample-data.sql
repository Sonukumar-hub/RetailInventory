-- StockSmart Sample Data
-- Safe to re-run (uses INSERT IGNORE)

USE stocksmart;

-- Roles
INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'System Administrator'),
(2, 'ROLE_INVENTORY_MANAGER', 'Inventory Manager'),
(3, 'ROLE_STAFF', 'Staff Member');

-- Users (passwords are BCrypt hashed, plain: Admin@123, Manager@123, Staff@123)
INSERT IGNORE INTO users (id, username, email, password, first_name, last_name, active) VALUES
(1, 'admin',   'admin@stocksmart.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7S', 'System',  'Admin',   TRUE),
(2, 'manager', 'manager@stocksmart.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Inventory','Manager', TRUE),
(3, 'staff',   'staff@stocksmart.com',   '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohbm8ZMirrdrYdDjTm8k5P8M5cK', 'Staff',   'User',    TRUE);

-- Note: admin password = Admin@123, manager = Manager@123, staff = Staff@123
-- CHANGE THESE PASSWORDS before any production use!

INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3),
(3, 3);

-- Categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1,  'Electronics',       'Electronic devices and accessories'),
(2,  'Clothing',          'Apparel and fashion items'),
(3,  'Food & Beverages',  'Grocery and drink products'),
(4,  'Home & Kitchen',    'Household and kitchen appliances'),
(5,  'Sports & Outdoor',  'Sports equipment and outdoor gear'),
(6,  'Books & Stationery','Books, notebooks, and office supplies'),
(7,  'Toys & Games',      'Children toys and board games'),
(8,  'Health & Beauty',   'Personal care and health products');

-- Locations
INSERT IGNORE INTO locations (id, name, type, address, city, state, country, active) VALUES
(1, 'Main Warehouse',       'WAREHOUSE', '12 Industrial Park Road', 'Mumbai',    'Maharashtra', 'India', TRUE),
(2, 'Downtown Store',       'STORE',     '45 MG Road',              'Bangalore', 'Karnataka',   'India', TRUE),
(3, 'North Branch Store',   'STORE',     '78 Connaught Place',      'Delhi',     'Delhi',        'India', TRUE),
(4, 'South Distribution Hub','WAREHOUSE','22 Anna Nagar',           'Chennai',   'Tamil Nadu',  'India', TRUE);

-- Suppliers
INSERT IGNORE INTO suppliers (id, name, contact_person, email, phone, address, city, state, country, active) VALUES
(1, 'TechVision Distributors',  'Rajesh Kumar',   'rajesh@techvision.com',  '+91-9876543210', '56 Tech Park', 'Pune',      'Maharashtra', 'India', TRUE),
(2, 'FashionHub Wholesale',     'Priya Sharma',   'priya@fashionhub.com',   '+91-9876543211', '34 Garment St','Surat',     'Gujarat',     'India', TRUE),
(3, 'GroceryPlus Suppliers',    'Mohan Das',      'mohan@groceryplus.com',  '+91-9876543212', '12 Market Rd', 'Hyderabad', 'Telangana',   'India', TRUE),
(4, 'HomeStyle Imports',        'Anita Verma',    'anita@homestyle.com',    '+91-9876543213', '90 Commerce Rd','Noida',    'UP',          'India', TRUE),
(5, 'SportZone International',  'Vikram Singh',   'vikram@sportzone.com',   '+91-9876543214', '7 Stadium View', 'Mumbai',  'Maharashtra', 'India', TRUE);

-- Products
INSERT IGNORE INTO products (id, sku, name, description, category_id, barcode, unit_of_measure, cost_price, selling_price, reorder_level, active) VALUES
(1,  'ELEC-001', 'Wireless Bluetooth Headphones',    'Premium over-ear headphones with ANC',        1, '8901234567890', 'UNIT', 1500.00, 2499.00, 10, TRUE),
(2,  'ELEC-002', 'USB-C Charging Cable 2m',          'Braided USB-C to USB-A cable',                1, '8901234567891', 'UNIT',   80.00,  199.00, 50, TRUE),
(3,  'ELEC-003', 'Mechanical Keyboard RGB',          'Tenkeyless mechanical keyboard',              1, '8901234567892', 'UNIT', 2200.00, 3499.00,  5, TRUE),
(4,  'CLOT-001', 'Men\'s Cotton Polo Shirt',         '100% cotton polo shirt, various sizes',       2, '8901234567893', 'UNIT',  280.00,  599.00, 20, TRUE),
(5,  'CLOT-002', 'Women\'s Denim Jacket',            'Classic blue denim jacket',                   2, '8901234567894', 'UNIT',  650.00, 1299.00, 15, TRUE),
(6,  'FOOD-001', 'Premium Basmati Rice 5kg',         'Long grain aged basmati rice',                3, '8901234567895', 'BAG',   220.00,  380.00, 30, TRUE),
(7,  'FOOD-002', 'Organic Green Tea (100 bags)',      'Premium Darjeeling green tea',                3, '8901234567896', 'BOX',   150.00,  299.00, 40, TRUE),
(8,  'HOME-001', 'Stainless Steel Pressure Cooker 5L','Heavy-duty pressure cooker',                 4, '8901234567897', 'UNIT',  800.00, 1499.00, 10, TRUE),
(9,  'HOME-002', 'Non-stick Cookware Set 5pcs',      'Granite-coated non-stick pans and pots',      4, '8901234567898', 'SET',  1200.00, 2199.00,  8, TRUE),
(10, 'SPRT-001', 'Yoga Mat Anti-slip 6mm',           'Eco-friendly TPE yoga mat',                   5, '8901234567899', 'UNIT',  350.00,  699.00, 15, TRUE),
(11, 'SPRT-002', 'Resistance Bands Set (5 bands)',   'Progressive resistance exercise bands',        5, '8901234567900', 'SET',   200.00,  449.00, 20, TRUE),
(12, 'BOOK-001', 'Clean Code by Robert C. Martin',   'Landmark programming book',                   6, '9780132350884', 'UNIT',  450.00,  799.00, 10, TRUE),
(13, 'HLTH-001', 'Vitamin C 1000mg (60 tablets)',    'High-potency Vitamin C supplement',           8, '8901234567901', 'BOX',   180.00,  349.00, 25, TRUE),
(14, 'ELEC-004', 'Smart LED Desk Lamp',              'Touch-control LED lamp with USB charging',    1, '8901234567902', 'UNIT',  600.00, 1099.00, 10, TRUE),
(15, 'TOY-001',  'LEGO Classic Creative Set',        '1000-piece creative building set',            7, '5702016369618', 'UNIT', 1800.00, 2999.00,  5, TRUE);

-- Supplier-Product associations
INSERT IGNORE INTO supplier_products (supplier_id, product_id, unit_cost, lead_time_days) VALUES
(1, 1, 1450.00, 7), (1, 2, 75.00, 3), (1, 3, 2100.00, 10), (1, 14, 580.00, 7),
(2, 4, 260.00, 5),  (2, 5, 620.00, 7),
(3, 6, 210.00, 2),  (3, 7, 140.00, 2),
(4, 8, 780.00, 5),  (4, 9, 1150.00, 7),
(5, 10, 330.00, 4), (5, 11, 185.00, 3),
(1, 15, 1750.00, 14);

-- Inventory (product_id, location_id, on_hand, reserved)
INSERT IGNORE INTO inventory (product_id, location_id, quantity_on_hand, quantity_reserved) VALUES
-- Main Warehouse
(1, 1, 85, 0), (2, 1, 300, 0), (3, 1, 40, 0), (4, 1, 150, 0), (5, 1, 80, 0),
(6, 1, 200, 0),(7, 1, 180, 0), (8, 1, 60, 0), (9, 1, 45, 0),  (10, 1, 120, 0),
(11,1, 100, 0),(12,1, 55, 0),  (13,1, 90, 0), (14,1, 70, 0),  (15,1, 30, 0),
-- Downtown Store
(1, 2, 12, 0), (2, 2, 80, 0), (3, 2, 8, 0),  (4, 2, 45, 0),  (5, 2, 20, 0),
(6, 2, 35, 0), (7, 2, 40, 0), (8, 2, 15, 0), (13,2, 25, 0),  (14,2, 18, 0),
-- North Branch Store
(1, 3, 8, 0),  (2, 3, 60, 0), (4, 3, 30, 0), (6, 3, 25, 0),  (10,3, 22, 0),
(11,3, 18, 0), (12,3, 12, 0), (13,3, 15, 0),
-- South Distribution Hub
(2, 4, 200, 0),(4, 4, 100, 0),(6, 4, 150, 0),(7, 4, 120, 0), (8, 4, 40, 0),
(9, 4, 30, 0), (11,4, 60, 0), (13,4, 50, 0);

-- Purchase Orders
INSERT IGNORE INTO purchase_orders (id, order_number, supplier_id, location_id, status, order_date, expected_date, total_amount, created_by) VALUES
(1, 'PO-2024-0001', 1, 1, 'RECEIVED',          '2024-10-01', '2024-10-08', 145000.00, 1),
(2, 'PO-2024-0002', 3, 1, 'RECEIVED',          '2024-10-05', '2024-10-07', 24500.00,  2),
(3, 'PO-2024-0003', 2, 2, 'PARTIALLY_RECEIVED','2024-10-15', '2024-10-22', 44100.00,  2),
(4, 'PO-2024-0004', 5, 3, 'ORDERED',           '2024-10-20', '2024-10-30', 18450.00,  1),
(5, 'PO-2024-0005', 4, 4, 'DRAFT',             '2024-10-25', '2024-11-05', 52000.00,  1);

INSERT IGNORE INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, line_total) VALUES
(1, 1, 50, 50, 1450.00, 72500.00),
(1, 3, 20, 20, 2100.00, 42000.00),
(1, 14,30, 30,  580.00, 17400.00),
(1, 2, 100,100,  75.00,  7500.00),
(2, 6, 50, 50,  210.00, 10500.00),
(2, 7, 100,100, 140.00, 14000.00),
(3, 4, 100, 60, 260.00, 26000.00),
(3, 5, 50,  20, 620.00, 31000.00),
(4, 10, 50,  0, 330.00, 16500.00),
(4, 11, 30,  0, 185.00,  5550.00),
(5,  8, 30,  0, 780.00, 23400.00),
(5,  9, 25,  0,1150.00, 28750.00);

-- Sales Orders
INSERT IGNORE INTO sales_orders (id, order_number, location_id, customer_name, customer_email, status, order_date, total_amount, created_by) VALUES
(1, 'SO-2024-0001', 2, 'Arjun Mehta',    'arjun@email.com',   'COMPLETED',  '2024-10-10', 5197.00, 3),
(2, 'SO-2024-0002', 2, 'Sunita Rao',     'sunita@email.com',  'COMPLETED',  '2024-10-12', 2498.00, 3),
(3, 'SO-2024-0003', 3, 'Dev Patel',      'dev@email.com',     'COMPLETED',  '2024-10-18', 1298.00, 3),
(4, 'SO-2024-0004', 2, 'Kavya Nair',     'kavya@email.com',   'PROCESSING', '2024-10-22', 4997.00, 2),
(5, 'SO-2024-0005', 3, 'Ravi Shankar',   'ravi@email.com',    'PENDING',    '2024-10-25', 2148.00, 3);

INSERT IGNORE INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, line_total) VALUES
(1, 1,  1, 2499.00, 2499.00),
(1, 13, 2,  349.00,  698.00),
(1, 7,  5,  299.00, 1495.00),
(1, 2,  2,  199.00,  398.00),
(2, 8,  1, 1499.00, 1499.00),
(2, 10, 1,  699.00,  699.00),
(2, 11, 1,  449.00,  449.00),
(3, 4,  2,  599.00, 1198.00),
(3, 2,  2,  199.00,  398.00),
(4, 1,  2, 2499.00, 4998.00),
(5, 6,  3,  380.00, 1140.00),
(5, 7,  2,  299.00,  598.00),
(5, 13, 1,  349.00,  349.00);
