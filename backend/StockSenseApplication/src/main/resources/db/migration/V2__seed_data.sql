-- =============================================================
-- V2__seed_data.sql
-- StockSense IMS — Demo / Seed Data
-- For development and hackathon demo use only.
-- =============================================================

-- Warehouses
INSERT INTO warehouses (name, address) VALUES
    ('Main Warehouse',       '12 Industrial Park, Hyderabad'),
    ('Production Facility',  '45 Fab Zone, Secunderabad'),
    ('Distribution Center',  '88 Logistics Hub, Gachibowli');

-- Locations
INSERT INTO locations (warehouse_id, name, code) VALUES
    (1, 'Receiving Bay',    'MW-RCV'),
    (1, 'Rack A',           'MW-RA'),
    (1, 'Rack B',           'MW-RB'),
    (1, 'Cold Storage',     'MW-CS'),
    (2, 'Production Floor', 'PF-01'),
    (2, 'Quality Control',  'PF-QC'),
    (3, 'Dispatch Bay',     'DC-DSP'),
    (3, 'Staging Area',     'DC-STG');

-- Categories
INSERT INTO categories (name) VALUES
    ('Raw Materials'),
    ('Finished Goods'),
    ('Electronics'),
    ('Packaging'),
    ('Safety Equipment');

-- Suppliers
INSERT INTO suppliers (name, contact_name, email, phone) VALUES
    ('Hyderabad Steel Works',  'Ramesh Kumar',   'ramesh@hswsteel.in',      '+91-9876543210'),
    ('TechParts India',        'Priya Sharma',   'priya@techparts.co.in',   '+91-9845612345'),
    ('PackMart Solutions',     'Anand Rao',      'anand@packmart.in',       '+91-9901234567'),
    ('SafeGear Supplies',      'Meera Patel',    'meera@safegear.in',       '+91-9812345678');

-- Products
INSERT INTO products (name, sku, category_id, unit_of_measure, description, reorder_point) VALUES
    ('Steel Rods (12mm)',    'RAW-SR-12',    1, 'kg',     'Mild steel rods 12mm diameter',          50),
    ('Steel Rods (20mm)',    'RAW-SR-20',    1, 'kg',     'Mild steel rods 20mm diameter',          50),
    ('Industrial Bolts M10', 'RAW-BOLT-M10', 1, 'units',  'M10 hex bolts grade 8.8',                200),
    ('Industrial Bolts M16', 'RAW-BOLT-M16', 1, 'units',  'M16 hex bolts grade 8.8',                100),
    ('Office Chair (Ergo)',  'FG-CHAIR-ERG', 2, 'units',  'Ergonomic office chair with lumbar support', 5),
    ('Steel Cabinet 3-Door', 'FG-CAB-3D',   2, 'units',  'Heavy-duty 3-door steel cabinet',        3),
    ('Circuit Breaker 16A',  'ELEC-CB-16A',  3, 'units',  '16A single-pole circuit breaker',        20),
    ('Power Cable 2.5mm',    'ELEC-PC-25',   3, 'meters', 'Copper power cable 2.5mm²',              100),
    ('Corrugated Box L',     'PKG-BOX-L',    4, 'units',  'Large corrugated shipping box',          200),
    ('Bubble Wrap Roll',     'PKG-BW-R',     4, 'meters', 'Anti-static bubble wrap 50m roll',       50),
    ('Safety Helmet (Blue)', 'SAF-HLM-B',   5, 'units',  'Class A safety helmet EN 397',           15),
    ('Safety Gloves (XL)',   'SAF-GLV-XL',   5, 'pairs',  'Cut-resistant Level 5 safety gloves',    30);

-- Inventory (starting stock across locations)
INSERT INTO inventory (product_id, location_id, quantity) VALUES
    (1,  2, 500),   -- Steel Rods 12mm → Rack A Main Warehouse
    (2,  2, 300),   -- Steel Rods 20mm → Rack A
    (3,  2, 1200),  -- M10 Bolts → Rack A
    (4,  3, 800),   -- M16 Bolts → Rack B
    (5,  3, 25),    -- Office Chairs → Rack B
    (6,  3, 12),    -- Steel Cabinets → Rack B
    (7,  3, 45),    -- Circuit Breakers → Rack B
    (8,  2, 400),   -- Power Cable → Rack A
    (9,  4, 600),   -- Corrugated Boxes → Cold Storage
    (10, 4, 20),    -- Bubble Wrap → Cold Storage
    (11, 5, 80),    -- Safety Helmets → Production Floor
    (12, 5, 150),   -- Safety Gloves → Production Floor
    (3,  5, 200),   -- M10 Bolts also at Production Floor
    (4,  5, 100),   -- M16 Bolts also at Production Floor
    (1,  7, 100),   -- Steel Rods 12mm → Distribution Center
    (9,  7, 300);   -- Corrugated Boxes → Distribution Center
