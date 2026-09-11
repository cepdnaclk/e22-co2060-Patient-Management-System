INSERT INTO medicines (name, generic_name, manufacturer, stock_quantity, unit_price, created_at, updated_at) VALUES 
('Paracetamol (Panadol) 500mg', 'Paracetamol', 'SL Pharma', 500, 3.00, NOW(), NOW()),
('Amoxicillin 250mg', 'Amoxicillin', 'SL Pharma', 500, 2.00, NOW(), NOW()),
('Amoxicillin 500mg', 'Amoxicillin', 'SL Pharma', 500, 6.00, NOW(), NOW()),
('Augmentin 625mg', 'Amoxicillin + Clavulanic Acid', 'SL Pharma', 500, 4.50, NOW(), NOW()),
('Ibuprofen 400mg', 'Ibuprofen', 'SL Pharma', 500, 3.00, NOW(), NOW()),
('Metformin 500mg', 'Metformin', 'SL Pharma', 500, 4.00, NOW(), NOW()),
('Atorvastatin 20mg', 'Atorvastatin', 'SL Pharma', 500, 2.00, NOW(), NOW()),
('Losartan 50mg', 'Losartan', 'SL Pharma', 500, 4.00, NOW(), NOW()),
('Omeprazole 20mg', 'Omeprazole', 'SL Pharma', 500, 2.00, NOW(), NOW()),
('Pantoprazole 40mg', 'Pantoprazole', 'SL Pharma', 500, 3.00, NOW(), NOW()),
('Salbutamol 4mg', 'Salbutamol', 'SL Pharma', 500, 1.50, NOW(), NOW()),
('Cetirizine 10mg', 'Cetirizine', 'SL Pharma', 500, 1.50, NOW(), NOW()),
('Chlorpheniramine (Piriton) 4mg', 'Chlorpheniramine', 'SL Pharma', 500, 2.00, NOW(), NOW()),
('Ciprofloxacin 500mg', 'Ciprofloxacin', 'SL Pharma', 500, 2.00, NOW(), NOW()),
('Azithromycin 500mg', 'Azithromycin', 'SL Pharma', 500, 5.00, NOW(), NOW()),
('Diclofenac Sodium 50mg', 'Diclofenac Sodium', 'SL Pharma', 500, 6.00, NOW(), NOW()),
('Vitamin C 500mg', 'Ascorbic Acid', 'SL Pharma', 500, 1.00, NOW(), NOW()),
('Folic Acid 5mg', 'Folic Acid', 'SL Pharma', 500, 1.00, NOW(), NOW()),
('Domperidone 10mg', 'Domperidone', 'SL Pharma', 500, 2.50, NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET 
unit_price = EXCLUDED.unit_price,
updated_at = NOW();
