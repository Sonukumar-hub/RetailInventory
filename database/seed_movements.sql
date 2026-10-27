USE stocksmart;

INSERT IGNORE INTO inventory_movements (id, product_id, location_id, movement_type, quantity, quantity_before, quantity_after, reference_id, reference_type, reason, created_by, created_at) VALUES
(1, 1, 1, 'RECEIPT', 50, 35, 85, 1, 'PURCHASE_ORDER', 'PO-2024-0001 initial shipment received', 1, NOW() - INTERVAL 12 HOUR),
(2, 3, 1, 'RECEIPT', 20, 20, 40, 1, 'PURCHASE_ORDER', 'PO-2024-0001 keyboard batch received', 1, NOW() - INTERVAL 10 HOUR),
(3, 1, 2, 'SALE', -1, 13, 12, 1, 'SALES_ORDER', 'SO-2024-0001 retail checkout', 3, NOW() - INTERVAL 6 HOUR),
(4, 2, 2, 'TRANSFER_IN', 30, 50, 80, 1, 'TRANSFER', 'Inter-store transfer from Mumbai Warehouse', 2, NOW() - INTERVAL 4 HOUR),
(5, 7, 1, 'ADJUSTMENT', -5, 185, 180, NULL, 'MANUAL', 'Annual inventory audit cycle count discrepancy', 2, NOW() - INTERVAL 2 HOUR),
(6, 4, 3, 'SALE', -2, 32, 30, 3, 'SALES_ORDER', 'SO-2024-0003 customer pickup', 3, NOW() - INTERVAL 1 HOUR);
