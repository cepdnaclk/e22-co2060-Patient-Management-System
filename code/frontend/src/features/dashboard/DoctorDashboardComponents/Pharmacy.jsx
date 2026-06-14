import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Plus, Trash2, Save, X, Pill } from "lucide-react";

// Common Sri Lankan Drugs Database for Autocomplete
const COMMON_DRUGS = [
  "Paracetamol (Panadol) 500mg", "Amoxicillin 250mg", "Amoxicillin 500mg", "Augmentin 625mg", 
  "Ibuprofen 400mg", "Metformin 500mg", "Atorvastatin 20mg", "Losartan 50mg", 
  "Omeprazole 20mg", "Pantoprazole 40mg", "Salbutamol 4mg", "Cetirizine 10mg", 
  "Chlorpheniramine (Piriton) 4mg", "Ciprofloxacin 500mg", "Azithromycin 500mg", 
  "Diclofenac Sodium 50mg", "Vitamin C 500mg", "Folic Acid 5mg", "Domperidone 10mg"
];

const COMMON_DOSAGES = ["1 Tablet", "2 Tablets", "5ml Syrup", "10ml Syrup", "1 Capsule"];
const COMMON_FREQUENCIES = ["Twice a day (bd)", "Three times a day (tds)", "Once a day (od)", "At night (nocte)", "When required (prn)"];
const COMMON_DURATIONS = ["3 days", "5 days", "1 week", "2 weeks", "1 month"];

const PrescriptionEditor = ({
  patientName = "Unknown Patient",
  patientId = "",
  onSavePrescription,
  saving = false,
}) => {
  const [medicines, setMedicines] = useState([
    { id: 1, name: "", dosage: "", frequency: "", duration: "", notes: "" }
  ]);

  const handleChange = (id, field, value) => {
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const addMedicine = () => {
    const newId = Math.max(0, ...medicines.map(m => m.id)) + 1;
    setMedicines([
      ...medicines,
      { id: newId, name: "", dosage: "", frequency: "", duration: "", notes: "" }
    ]);
  };

  const deleteMedicine = (id) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(med => med.id !== id));
    }
  };

  const savePrescription = async () => {
    const validMedicines = medicines.filter(
      (med) => med.name.trim() || med.dosage.trim() || med.frequency.trim() || med.duration.trim() || med.notes.trim()
    );

    if (validMedicines.length === 0) {
      alert("Please add at least one medicine before saving.");
      return;
    }

    if (onSavePrescription) {
      await onSavePrescription(validMedicines);
      // Reset after save
      setMedicines([{ id: 1, name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
      return;
    }

    alert(`Prescription saved successfully for ${patientName}!`);
  };

  const cancel = () => {
    if (confirm("Discard this prescription?")) {
      setMedicines([{ id: 1, name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
    }
  };

  const inputClass = "w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition-all shadow-sm";

  return (
    <Card className="border-none shadow-xl shadow-blue-900/5">
      <CardHeader 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">New Prescription</h2>
              <p className="text-sm text-slate-500 font-normal mt-0.5">{patientName} {patientId ? `• ${patientId}` : ''}</p>
            </div>
          </div>
        }
      />
      
      {/* Datalists for autocomplete */}
      <datalist id="drug-names">
        {COMMON_DRUGS.map((drug, i) => <option key={i} value={drug} />)}
      </datalist>
      <datalist id="dosages">
        {COMMON_DOSAGES.map((dosage, i) => <option key={i} value={dosage} />)}
      </datalist>
      <datalist id="frequencies">
        {COMMON_FREQUENCIES.map((freq, i) => <option key={i} value={freq} />)}
      </datalist>
      <datalist id="durations">
        {COMMON_DURATIONS.map((dur, i) => <option key={i} value={dur} />)}
      </datalist>

      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="pb-3 px-2">Medicine (SL DB)</th>
                <th className="pb-3 px-2">Dosage</th>
                <th className="pb-3 px-2">Frequency</th>
                <th className="pb-3 px-2">Duration</th>
                <th className="pb-3 px-2">Instructions</th>
                <th className="pb-3 px-2 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((med) => (
                <tr key={med.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-2 min-w-[200px]">
                    <input
                      type="text"
                      list="drug-names"
                      value={med.name}
                      onChange={(e) => handleChange(med.id, "name", e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Paracetamol"
                    />
                  </td>
                  <td className="py-3 px-2 min-w-[120px]">
                    <input
                      type="text"
                      list="dosages"
                      value={med.dosage}
                      onChange={(e) => handleChange(med.id, "dosage", e.target.value)}
                      className={inputClass}
                      placeholder="e.g. 500mg"
                    />
                  </td>
                  <td className="py-3 px-2 min-w-[150px]">
                    <input
                      type="text"
                      list="frequencies"
                      value={med.frequency}
                      onChange={(e) => handleChange(med.id, "frequency", e.target.value)}
                      className={inputClass}
                      placeholder="e.g. bd"
                    />
                  </td>
                  <td className="py-3 px-2 min-w-[120px]">
                    <input
                      type="text"
                      list="durations"
                      value={med.duration}
                      onChange={(e) => handleChange(med.id, "duration", e.target.value)}
                      className={inputClass}
                      placeholder="e.g. 5 days"
                    />
                  </td>
                  <td className="py-3 px-2 min-w-[180px]">
                    <input
                      type="text"
                      value={med.notes}
                      onChange={(e) => handleChange(med.id, "notes", e.target.value)}
                      className={inputClass}
                      placeholder="Take after meals"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      disabled={medicines.length === 1}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
          <Button variant="soft" onClick={addMedicine} icon={Plus} className="w-full sm:w-auto">
            Add Another Medicine
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={cancel} icon={X} className="w-full sm:w-auto">
              Clear
            </Button>
            <Button 
              variant="primary" 
              onClick={savePrescription} 
              disabled={saving} 
              icon={Save}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 focus:ring-emerald-500"
            >
              {saving ? "Saving..." : "Save Prescription"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionEditor;