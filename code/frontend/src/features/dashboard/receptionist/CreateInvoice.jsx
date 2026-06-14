import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, Receipt, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import PatientSearch from "../doctor/PatientSearch.jsx";
import { billingService } from "../../../services/billingService";

export default function CreateInvoice({ onBack }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [items, setItems] = useState([
    { id: 1, description: "", quantity: 1, unitPrice: "", itemType: "CONSULTATION" }
  ]);
  
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");

  const handleAddItem = () => {
    const newId = Math.max(0, ...items.map(i => i.id)) + 1;
    setItems([...items, { id: newId, description: "", quantity: 1, unitPrice: "", itemType: "OTHER" }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const total = subtotal - Number(discount) + Number(tax);

  const handleSave = async () => {
    if (!selectedPatient) {
      alert("Please select a patient first.");
      return;
    }

    const validItems = items.filter(i => i.description.trim() && Number(i.unitPrice) > 0);
    if (validItems.length === 0) {
      alert("Please add at least one valid item with a description and unit price.");
      return;
    }

    setSaving(true);
    try {
      await billingService.createInvoice({
        patientId: selectedPatient.id,
        appointmentId: null, // Optional for now
        items: validItems.map(i => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          itemType: i.itemType
        })),
        discount: Number(discount),
        tax: Number(tax),
        notes: notes,
        paymentMethod: "CASH" // Defaulting to Cash for generation, payment happens later
      });
      alert("Invoice created successfully!");
      onBack();
    } catch (err) {
      console.error(err);
      alert("Failed to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all";

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generate Invoice</h1>
          <p className="text-sm text-slate-500 mt-1">Create a new bill for a patient.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient & Options */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader title="1. Select Patient" />
            <CardContent className="p-6">
              {!selectedPatient ? (
                <PatientSearch onSelectPatient={setSelectedPatient} />
              ) : (
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl relative">
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="absolute top-2 right-2 text-sky-400 hover:text-sky-600 p-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Change
                  </button>
                  <h4 className="font-bold text-sky-900">{selectedPatient.firstName} {selectedPatient.lastName}</h4>
                  <p className="text-sm text-sky-700 mt-1">
                    ID: {selectedPatient.patientId || selectedPatient.displayId} • {selectedPatient.mobileNumber || selectedPatient.user?.mobileNumber || "No Phone"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader title="3. Adjustments & Notes" />
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount (Rs.)</label>
                <input 
                  type="number" 
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax (Rs.)</label>
                <input 
                  type="number" 
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputClass} resize-y min-h-[80px]`}
                  placeholder="Additional billing notes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Invoice Items & Total */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader title="2. Invoice Items" />
            <CardContent className="p-0">
              <div className="overflow-x-auto p-6 pt-0">
                <table className="w-full text-left border-collapse mt-4">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="pb-3 pr-2 w-1/3">Item Description</th>
                      <th className="pb-3 px-2">Type</th>
                      <th className="pb-3 px-2 w-20">Qty</th>
                      <th className="pb-3 px-2 w-32">Unit Price</th>
                      <th className="pb-3 px-2 text-right">Amount</th>
                      <th className="pb-3 pl-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-3 pr-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Consultation Fee"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={item.itemType}
                            onChange={(e) => handleItemChange(item.id, "itemType", e.target.value)}
                            className={inputClass}
                          >
                            <option value="CONSULTATION">Consultation</option>
                            <option value="MEDICINE">Medicine</option>
                            <option value="LAB_TEST">Lab Test</option>
                            <option value="PROCEDURE">Procedure</option>
                            <option value="BED_CHARGE">Bed Charge</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                            className={inputClass}
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                            className={inputClass}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-slate-700">
                          {((Number(item.quantity) * Number(item.unitPrice)) || 0).toFixed(2)}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length === 1}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-start">
                  <Button variant="soft" onClick={handleAddItem} icon={Plus} className="text-sm">
                    Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <div className="bg-slate-50 p-6 border-t border-slate-200 rounded-b-2xl flex flex-col items-end space-y-2">
              <div className="flex justify-between w-full max-w-xs text-sm text-slate-600">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-sm text-slate-600">
                <span>Discount:</span>
                <span className="text-emerald-600">- Rs. {Number(discount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-sm text-slate-600 pb-3 border-b border-slate-200">
                <span>Tax:</span>
                <span>+ Rs. {Number(tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-xl font-bold text-slate-900 pt-1">
                <span>Total:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onBack}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              disabled={saving || !selectedPatient}
              icon={saving ? Loader2 : Receipt}
              className={`bg-sky-600 hover:bg-sky-700 shadow-sky-500/20 ${saving ? "opacity-70" : ""}`}
            >
              {saving ? "Generating Invoice..." : "Generate Invoice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
