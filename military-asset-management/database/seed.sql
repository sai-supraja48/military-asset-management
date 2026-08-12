-- Run schema.sql first.
INSERT INTO bases (name, location) VALUES
('Fort Alpha', 'North Zone'),
('Fort Bravo', 'East Zone'),
('Fort Charlie', 'South Zone');

INSERT INTO equipment_types (name, category) VALUES
('Utility Vehicle', 'VEHICLE'),
('Service Weapon', 'WEAPON'),
('Training Ammunition', 'AMMUNITION'),
('Field Radio', 'OTHER');

INSERT INTO assets (base_id, equipment_type_id, quantity)
SELECT b.id, e.id, q.quantity
FROM (VALUES
    ('Fort Alpha','Utility Vehicle',20),
    ('Fort Alpha','Service Weapon',120),
    ('Fort Alpha','Training Ammunition',5000),
    ('Fort Alpha','Field Radio',40),
    ('Fort Bravo','Utility Vehicle',12),
    ('Fort Bravo','Service Weapon',80),
    ('Fort Bravo','Training Ammunition',3000),
    ('Fort Bravo','Field Radio',25),
    ('Fort Charlie','Utility Vehicle',10),
    ('Fort Charlie','Service Weapon',60),
    ('Fort Charlie','Training Ammunition',2500),
    ('Fort Charlie','Field Radio',20)
) AS q(base_name, equipment_name, quantity)
JOIN bases b ON b.name = q.base_name
JOIN equipment_types e ON e.name = q.equipment_name
ON CONFLICT (base_id, equipment_type_id) DO UPDATE SET quantity = EXCLUDED.quantity;
