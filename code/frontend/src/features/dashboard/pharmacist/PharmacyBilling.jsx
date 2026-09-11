import React, { useState, useEffect } from "react";
import { Receipt, Search, FileText, CheckCircle2, User, Loader2, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { pharmacyService } from "../../../services/pharmacyService";

export default function PharmacyBilling() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRx, setSelectedRx] = useState(null);
  const [billItems, setBillItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rxData, medData] = await Promise.all([
          pharmacyService.getFulfilledPrescriptions(),
          pharmacyService.getAllMedicines()
        ]);
        setPrescriptions(rxData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        setMedicines(medData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedRx) {
      setBillItems([]);
      return;
    }

    const description = selectedRx.description;
    const items = [];
    
    if (description) {
      const descLower = description.toLowerCase();
      medicines.forEach(med => {
        if (med.name && descLower.includes(med.name.toLowerCase())) {
          let qty = 1;
          const regex = new RegExp(`${med.name.toLowerCase()}[^0-9]*([0-9]+)`, 'i');
          const match = descLower.match(regex);
          if (match && match[1]) {
             qty = parseInt(match[1], 10);
             if (qty > 100) qty = 1; 
          }
          items.push({ 
            id: med.id || med.name,
            name: med.name, 
            genericName: med.genericName,
            unitPrice: med.unitPrice || 0,
            qty
          });
        }
      });

      if (items.length === 0) {
         items.push({
           id: "generic",
           name: "Generic Dispensing / Custom Formula",
           genericName: "N/A",
           unitPrice: 15.00,
           qty: 1
         });
      }
    }
    setBillItems(items);
  }, [selectedRx, medicines]);

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

  const handleMedicineChange = (index, medicineId) => {
    const selectedMed = medicines.find(m => m.id === parseInt(medicineId, 10));
    if (selectedMed) {
      setBillItems(prev => prev.map((item, idx) => 
        idx === index ? {
          ...item,
          id: selectedMed.id,
          name: selectedMed.name,
          genericName: selectedMed.genericName,
          unitPrice: selectedMed.unitPrice || 0,
        } : item
      ));
    }
  };

  const handleRemoveRow = (index) => {
    setBillItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddRow = () => {
    setBillItems(prev => [
      ...prev, 
      {
        id: "new-" + Date.now(),
        name: "",
        genericName: "",
        unitPrice: 0,
        qty: 1
      }
    ]);
  };

  const totalAmount = billItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);

  const q = search.toLowerCase();
  const filtered = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(q) ||
    String(p.patientId ?? "").includes(q) ||
    p.doctorName?.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription Billing</h1>
          <p className="text-sm text-slate-500 mt-1">Calculate and view costs for issued medicines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Fulfilled Prescriptions */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-md shadow-slate-200/50 h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div>
              ) : filtered.length > 0 ? (
                filtered.map((record) => (
                  <div 
                    key={record.id} 
                    onClick={() => setSelectedRx(record)}
                    className={`p-3 rounded-xl mb-2 cursor-pointer transition-all border ${selectedRx?.id === record.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{record.patientName}</h4>
                      <Badge variant="success" className="text-[10px]">Dispensed</Badge>
                    </div>
                    <div className="text-xs text-slate-500">Rx ID: {record.id} &bull; Dr. {record.doctorName}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(record.updatedAt).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No dispensed prescriptions found.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Billing Details */}
        <div className="lg:col-span-2">
          {selectedRx ? (
            <Card className="border-none shadow-md shadow-slate-200/50 h-full">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 bg-white rounded-t-xl flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Billing Statement</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4"/> Patient: <span className="font-medium text-slate-700">{selectedRx.patientName}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">Rx #{selectedRx.id}</p>
                    <p className="text-xs text-slate-500">{new Date(selectedRx.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4"/> Original Prescription
                    </h3>
                    <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap">{selectedRx.description}</p>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Itemized Medicines</h3>
                    <button 
                      onClick={handleAddRow}
                      className="text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3"/> Add Item
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold w-2/5">Medicine</th>
                          <th className="px-4 py-3 font-semibold text-right w-1/5">Unit Price</th>
                          <th className="px-4 py-3 font-semibold text-right w-[15%]">Qty</th>
                          <th className="px-4 py-3 font-semibold text-right w-1/5">Total</th>
                          <th className="px-3 py-3 w-[5%]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billItems.map((item, idx) => (
                          <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <select 
                                className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm bg-white text-sm"
                                value={item.id || ""}
                                onChange={(e) => handleMedicineChange(idx, e.target.value)}
                              >
                                <option value="" disabled>Select Medicine...</option>
                                {medicines.map(m => (
                                  <option key={m.id} value={m.id}>{m.name} {m.genericName ? `(${m.genericName})` : ''}</option>
                                ))}
                                {item.id === "generic" && <option value="generic">Generic Dispensing / Custom Formula</option>}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-500 text-xs">Rs.</span>
                                <input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-20 p-1.5 text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm transition-all bg-white"
                                  value={item.unitPrice}
                                  onChange={(e) => handlePriceChange(idx, e.target.value)}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number" 
                                min="1" 
                                className="w-16 p-1.5 text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-sm transition-all bg-white"
                                value={item.qty}
                                onChange={(e) => handleQtyChange(idx, e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                              Rs. {(item.unitPrice * item.qty).toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button 
                                onClick={() => handleRemoveRow(idx)} 
                                className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Remove item"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-right font-bold text-slate-700">Total Amount Due:</td>
                          <td colSpan={2} className="px-4 py-4 text-right font-bold text-emerald-600 text-lg">
                            Rs. {totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                      <Receipt className="w-4 h-4"/>
                      Generate Invoice
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 min-h-[400px]">
              <Receipt className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-medium text-slate-600">No Prescription Selected</p>
              <p className="text-sm mt-1">Select a dispensed prescription from the list to view its billing details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
