SELECT 
    'customers' AS table_name, COUNT(*) AS total_records FROM customers
UNION ALL
SELECT 
    'products' AS table_name, COUNT(*) AS total_records FROM products
UNION ALL
SELECT 
    'orders' AS table_name, COUNT(*) AS total_records FROM orders
UNION ALL
SELECT 
    'order_items' AS table_name, COUNT(*) AS total_records FROM order_items

UNION ALL

-- Grand Total Row
SELECT 
    '--- GRAND TOTAL ---' AS table_name, 
    (SELECT COUNT(*) FROM customers) + 
    (SELECT COUNT(*) FROM products) + 
    (SELECT COUNT(*) FROM orders) + 
    (SELECT COUNT(*) FROM order_items) AS total_records;