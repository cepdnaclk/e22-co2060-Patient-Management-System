import React, { useState } from 'react';

const PrescriptionEditor = ({
  patientName = "Rajesh Kumar",
  patientId = "PMS-00421",
  onSavePrescription,
  saving = false,
}) => {
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice a day",
      duration: "5 days",
      notes: "Take after meals"
    },
    {
      id: 2,
      name: "Amoxicillin",
      dosage: "250mg",
      frequency: "Three times a day",
      duration: "7 days",
      notes: "Finish the course"
    },
    {
      id: 3,
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "Once a day",
      duration: "3 days",
      notes: "Take with water"
    }
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
      {
        id: newId,
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: ""
      }
    ]);
  };

  const deleteMedicine = (id) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const savePrescription = async () => {
    const validMedicines = medicines.filter(
      (med) => med.name.trim() || med.dosage.trim() || med.frequency.trim() || med.duration.trim() || med.notes.trim(),
    );

    if (validMedicines.length === 0) {
      alert("Please add at least one medicine before saving.");
      return;
    }

    if (onSavePrescription) {
      await onSavePrescription(validMedicines);
      return;
    }

    console.log("Prescription Saved:", validMedicines);
    alert("Prescription saved successfully for " + patientName + "!");
  };

  const cancel = () => {
    if (confirm("Discard this prescription?")) {
      // reset or close modal
      alert("Prescription cancelled.");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl"></div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">New Prescription</h2>
            <p className="text-slate-500 text-sm">{patientName} • {patientId}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-100 text-slate-600 uppercase text-xs tracking-widest">
              <th className="py-4 px-6 text-left font-medium">Medicine Name</th>
              <th className="py-4 px-6 text-left font-medium">Dosage</th>
              <th className="py-4 px-6 text-left font-medium">Frequency</th>
              <th className="py-4 px-6 text-left font-medium">Duration</th>
              <th className="py-4 px-6 text-left font-medium">Notes</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700 text-sm">
            {medicines.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleChange(med.id, "name", e.target.value)}
                    className="w-full bg-transparent focus:outline-none border-b border-transparent focus:border-blue-400 px-1 py-1 rounded"
                    placeholder="Medicine name"
                  />
                </td>
                <td className="py-4 px-6">
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleChange(med.id, "dosage", e.target.value)}
                    className="w-full bg-transparent focus:outline-none border-b border-transparent focus:border-blue-400 px-1 py-1 rounded"
                    placeholder="e.g. 500mg"
                  />
                </td>
                <td className="py-4 px-6">
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleChange(med.id, "frequency", e.target.value)}
                    className="w-full bg-transparent focus:outline-none border-b border-transparent focus:border-blue-400 px-1 py-1 rounded"
                    placeholder="e.g. Twice a day"
                  />
                </td>
                <td className="py-4 px-6">
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleChange(med.id, "duration", e.target.value)}
                    className="w-full bg-transparent focus:outline-none border-b border-transparent focus:border-blue-400 px-1 py-1 rounded"
                    placeholder="e.g. 5 days"
                  />
                </td>
                <td className="py-4 px-6">
                  <input
                    type="text"
                    value={med.notes}
                    onChange={(e) => handleChange(med.id, "notes", e.target.value)}
                    className="w-full bg-transparent focus:outline-none border-b border-transparent focus:border-blue-400 px-1 py-1 rounded"
                    placeholder="Special instructions"
                  />
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => deleteMedicine(med.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={addMedicine}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all active:scale-95"
        >
           Add Medicine
        </button>

        <div className="flex gap-3">
          <button
            onClick={cancel}
            className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={savePrescription}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium transition-all active:scale-95"
          >
             {saving ? "Saving..." : "Save Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionEditor;