import React, { useState } from "react";
import { Receipt, Search, CheckCircle2, User, Loader2, Trash2, Plus, Building } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { billingService } from "../../../services/billingService";
import PatientSearch from "../doctor/PatientSearch.jsx";

export default function ReceptionistBilling() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billItems, setBillItems] = useState([
    { id: "new-" + Date.now(), name: "Consultation Fee", unitPrice: 0, qty: 1 }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const handleQtyChange = (index, newQty) => {
    setBillItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, qty: Math.max(1, parseInt(newQty) || 1) } : item
    ));
  };

  const handlePriceChange = (index, newPrice) => {
    setBillItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, unitPrice: Math.max(0, parseFloat(newPrice) || 0) } : item
    ));
  };

  const handleNameChange = (index, newName) => {
    setBillItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, name: newName } : item
    ));
  };

  const handleRemoveRow = (index) => {
    setBillItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddRow = () => {
    setBillItems(prev => [
      ...prev, 
      { id: "new-" + Date.now(), name: "", unitPrice: 0, qty: 1 }
    ]);
  };

  const handleSendToBilling = async () => {
    if (!selectedPatient || billItems.length === 0) return;
    setIsSending(true);
    try {
      const payload = billItems.filter(i => i.name.trim() && i.unitPrice > 0).map(item => ({
        patientId: selectedPatient.id,
        department: "RECEPTION",
        description: item.name,
        quantity: item.qty,
        unitPrice: item.unitPrice
      }));
      
      if (payload.length === 0) {
        alert("Please add at least one valid fee.");
        setIsSending(false);
        return;
      }
      
      await billingService.addPendingItems(payload);
      setActionMsg("Fees sent to billing staff successfully!");
      setTimeout(() => {
        setActionMsg("");
        setSelectedPatient(null);
        setBillItems([{ id: "new-" + Date.now(), name: "Consultation Fee", unitPrice: 0, qty: 1 }]);
      }, 2000);
    } catch (err) {
      console.error("Failed to send to billing", err);
      alert("Failed to send costs to billing staff.");
    } finally {
      setIsSending(false);
    }
  };

  const totalAmount = billItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-sky-600" />
            Add Consultation Fees
          </h1>
          <p className="text-sm text-slate-500 mt-1">Add consultation fees and send them to the billing staff.</p>
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-sm h-full">
            <CardHeader title="1. Select Patient" />
            <CardContent className="p-6">
              {!selectedPatient ? (
                <PatientSearch onSelectPatient={setSelectedPatient} />
              ) : (
                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl relative">
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="absolute top-2 right-2 text-sky-400 hover:text-sky-600 p-1 text-sm font-semibold"
                  >
                    Change
                  </button>
                  <h4 className="font-bold text-sky-900">{selectedPatient.firstName} {selectedPatient.lastName}</h4>
                  <p className="text-sm text-sky-700 mt-1">
                    ID: {selectedPatient.patientId || selectedPatient.displayId} • {selectedPatient.mobileNumber || selectedPatient.user?.mobileNumber || "No Phone"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Card className="border-none shadow-sm shadow-slate-200/50 h-full">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 bg-white rounded-t-xl flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Fee Details</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4"/> Patient ID: <span className="font-medium text-slate-700">#{selectedPatient.id}</span>
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fees</h3>
                    <button 
                      onClick={handleAddRow}
                      className="text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3"/> Add Fee
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[500px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold w-1/2">Description</th>
                          <th className="px-4 py-3 font-semibold text-right w-[15%]">Qty</th>
                          <th className="px-4 py-3 font-semibold text-right w-1/4">Unit Price</th>
                          <th className="px-3 py-3 w-[10%]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billItems.map((item, idx) => (
                          <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <input 
                                type="text"
                                className={inputClass}
                                value={item.name}
                                onChange={(e) => handleNameChange(idx, e.target.value)}
                                placeholder="e.g. Consultation Fee"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number" 
                                min="1" 
                                className={inputClass + " text-center"}
                                value={item.qty}
                                onChange={(e) => handleQtyChange(idx, e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClass + " text-right"}
                                value={item.unitPrice}
                                onChange={(e) => handlePriceChange(idx, e.target.value)}
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button 
                                onClick={() => handleRemoveRow(idx)} 
                                disabled={billItems.length === 1}
                                className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-right font-bold text-slate-700">Total:</td>
                          <td colSpan={2} className="px-4 py-4 text-right font-bold text-sky-600 text-lg">
                            Rs. {totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button 
                      variant="primary"
                      onClick={handleSendToBilling}
                      disabled={isSending}
                      icon={isSending ? Loader2 : Receipt}
                      className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isSending ? "Sending..." : "Send to Billing Staff"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 min-h-[400px]">
              <Receipt className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-medium text-slate-600">No Patient Selected</p>
              <p className="text-sm mt-1">Select a patient to add consultation fees.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
