const http = require('http');

const commonDrugs = [
  { name: "Paracetamol (Panadol) 500mg", price: 3.00, genericName: "Paracetamol" },
  { name: "Amoxicillin 250mg", price: 2.00, genericName: "Amoxicillin" },
  { name: "Amoxicillin 500mg", price: 6.00, genericName: "Amoxicillin" },
  { name: "Augmentin 625mg", price: 4.50, genericName: "Amoxicillin + Clavulanic Acid" },
  { name: "Ibuprofen 400mg", price: 3.00, genericName: "Ibuprofen" },
  { name: "Metformin 500mg", price: 4.00, genericName: "Metformin" },
  { name: "Atorvastatin 20mg", price: 2.00, genericName: "Atorvastatin" },
  { name: "Losartan 50mg", price: 4.00, genericName: "Losartan" },
  { name: "Omeprazole 20mg", price: 2.00, genericName: "Omeprazole" },
  { name: "Pantoprazole 40mg", price: 3.00, genericName: "Pantoprazole" },
  { name: "Salbutamol 4mg", price: 1.50, genericName: "Salbutamol" },
  { name: "Cetirizine 10mg", price: 1.50, genericName: "Cetirizine" },
  { name: "Chlorpheniramine (Piriton) 4mg", price: 2.00, genericName: "Chlorpheniramine" },
  { name: "Ciprofloxacin 500mg", price: 2.00, genericName: "Ciprofloxacin" },
  { name: "Azithromycin 500mg", price: 5.00, genericName: "Azithromycin" },
  { name: "Diclofenac Sodium 50mg", price: 6.00, genericName: "Diclofenac Sodium" },
  { name: "Vitamin C 500mg", price: 1.00, genericName: "Ascorbic Acid" },
  { name: "Folic Acid 5mg", price: 1.00, genericName: "Folic Acid" },
  { name: "Domperidone 10mg", price: 2.50, genericName: "Domperidone" }
];

async function updateMedicines() {
  const fetch = (await import('node-fetch')).default;
  
  // Get all existing medicines
  const res = await fetch('http://localhost:8080/api/pharmacy/medicines');
  const existingMeds = await res.json();
  
  for (const drug of commonDrugs) {
    const existing = existingMeds.find(m => m.name === drug.name);
    
    const payload = {
      name: drug.name,
      genericName: drug.genericName,
      manufacturer: "SL Pharma",
      stockQuantity: existing ? existing.stockQuantity : 500,
      unitPrice: drug.price,
      expiryDate: "2027-12-31"
    };

    if (existing) {
      // Update
      console.log(`Updating ${drug.name}...`);
      await fetch(`http://localhost:8080/api/pharmacy/medicines/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create
      console.log(`Adding ${drug.name}...`);
      await fetch('http://localhost:8080/api/pharmacy/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  }
  console.log("Done updating medicines.");
}

updateMedicines().catch(console.error);
