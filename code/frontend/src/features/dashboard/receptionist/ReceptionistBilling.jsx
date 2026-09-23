import React, { useState, useEffect } from "react";
import { Receipt, Loader2, Plus, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { billingService } from "../../../services/billingService";
import { adminPatientsService } from "../../../services/adminPatientsService"; // For fetching patient details if needed
import api from "../../../services/axiosClient";

export default function ReceptionistBilling({ setActiveSection }) {
  const [patientsWithPending, setPatientsWithPending] = useState([]);
  const [patientDetails, setPatientDetails] = useState({});
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  const [pendingItems, setPendingItems] = useState([]);
  const [additionalItems, setAdditionalItems] = useState([]);
  
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch patients with pending items
  useEffect(() => {
    fetchPendingPatients();
  }, []);

  const fetchPendingPatients = async () => {
    setLoadingList(true);
    try {
      const patientIds = await billingService.getPatientsWithPendingItems();
      setPatientsWithPending(patientIds);
      
      // Fetch details for each patient
      const detailsMap = {};
      for (const id of patientIds) {
        try {
          const { data } = await api.get(`/api/patients/${id}`);
          detailsMap[id] = data;
        } catch (e) {
          console.error("Failed to fetch patient details for ID:", id);
        }
      }
      setPatientDetails(detailsMap);
    } catch (err) {
      console.error("Failed to fetch patients with pending items", err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch pending items when a patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      fetchPendingItems(selectedPatientId);
      setAdditionalItems([]); // reset
      setDiscount(0);
      setTax(0);
      setNotes("");
    }
  }, [selectedPatientId]);

  const fetchPendingItems = async (patientId) => {
    setLoadingItems(true);
    try {
      const items = await billingService.getPendingItemsByPatient(patientId);
      setPendingItems(items);
    } catch (err) {
      console.error("Failed to fetch pending items", err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddAdditionalItem = () => {
    setAdditionalItems([
      ...additionalItems, 
      { id: "add-" + Date.now(), description: "", quantity: 1, unitPrice: 0, itemType: "OTHER" }
    ]);
  };

  const handleRemoveAdditionalItem = (id) => {
    setAdditionalItems(additionalItems.filter(i => i.id !== id));
  };

  const handleAdditionalItemChange = (id, field, value) => {
    setAdditionalItems(additionalItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const pendingSubtotal = pendingItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const additionalSubtotal = additionalItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const subtotal = pendingSubtotal + additionalSubtotal;
  const total = subtotal - Number(discount) + Number(tax);

  const handleGenerateInvoice = async () => {
    if (!selectedPatientId) return;

    // Filter valid additional items
    const validAdditional = additionalItems.filter(i => i.description.trim() && Number(i.unitPrice) > 0);
    
    // Combine pending and additional
    const finalItems = [
      ...pendingItems.map(p => ({
        description: `[${p.department}] ${p.description}`,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        itemType: p.department === "PHARMACY" ? "MEDICINE" : (p.department === "LAB" ? "LAB_TEST" : "OTHER")
      })),
      ...validAdditional.map(a => ({
        description: a.description,
        quantity: Number(a.quantity),
        unitPrice: Number(a.unitPrice),
        itemType: a.itemType
      }))
    ];

    if (finalItems.length === 0) {
      alert("No valid items to bill.");
      return;
    }

    setSaving(true);
    try {
      const newInvoice = await billingService.createInvoice({
        patientId: selectedPatientId,
        items: finalItems,
        discount: Number(discount),
        tax: Number(tax),
        notes: notes,
        paymentMethod: "CASH" // Or let them select
      });
      
      // Generate Print View
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${newInvoice.invoiceNumber || 'Receipt'}</title>
              <style>
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                h1 { color: #0ea5e9; margin-bottom: 0; }
                .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                table { w-full; width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
                th { background-color: #f8fafc; font-weight: 600; }
                .totals { margin-top: 30px; width: 300px; float: right; }
                .totals p { display: flex; justify-content: space-between; margin: 5px 0; }
                .total-line { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h1>FrontDesk Hospital</h1>
                  <p>123 Medical Center Drive<br/>City, State 12345</p>
                </div>
                <div style="text-align: right;">
                  <h2>INVOICE</h2>
                  <p><strong>Invoice #:</strong> ${newInvoice.invoiceNumber || 'N/A'}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Patient ID:</strong> PMS-${String(selectedPatientId).padStart(5, '0')}</p>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align:center;">Qty</th>
                    <th style="text-align:right;">Unit Price</th>
                    <th style="text-align:right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${finalItems.map(i => `
                    <tr>
                      <td>${i.description}</td>
                      <td style="text-align:center;">${i.quantity}</td>
                      <td style="text-align:right;">Rs. ${Number(i.unitPrice).toFixed(2)}</td>
                      <td style="text-align:right;">Rs. ${(Number(i.quantity) * Number(i.unitPrice)).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totals">
                <p><span>Subtotal:</span> <span>Rs. ${subtotal.toFixed(2)}</span></p>
                <p><span>Discount:</span> <span>- Rs. ${Number(discount).toFixed(2)}</span></p>
                <p><span>Tax:</span> <span>+ Rs. ${Number(tax).toFixed(2)}</span></p>
                <p class="total-line"><span>Total Due:</span> <span>Rs. ${total.toFixed(2)}</span></p>
              </div>

              <div style="clear: both; margin-top: 60px; text-align: center; color: #666; font-size: 0.9em;">
                <p>Thank you for choosing FrontDesk Hospital.</p>
                <p>Please keep this invoice for your records.</p>
              </div>
              <script>
                window.onload = () => { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert("Invoice created! Please allow popups to print the invoice.");
      }

      setSelectedPatientId(null);
      fetchPendingPatients(); // Refresh list after print
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Main Billing Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Consolidate costs from Pharmacy, Lab, and generate final invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patients with Pending Bills */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-sm min-h-[500px]">
            <CardHeader title="Pending Patients" />
            <div className="p-4 space-y-2">
              {loadingList ? (
                <div className="flex justify-center p-8 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : patientsWithPending.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p>All clear! No pending bills.</p>
                </div>
              ) : (
                patientsWithPending.map(id => {
                  const patient = patientDetails[id];
                  const isActive = selectedPatientId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedPatientId(id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isActive 
                          ? "bg-sky-50 border-sky-200 shadow-sm" 
                          : "bg-white border-slate-200 hover:border-sky-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="font-semibold text-slate-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : `Patient ID: ${id}`}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 flex justify-between items-center">
                        <span>{patient?.patientId || "N/A"}</span>
                        <ArrowRight className={`w-4 h-4 ${isActive ? "text-sky-500" : "text-slate-300"}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Items & Generation */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedPatientId ? (
            <Card className="border-none shadow-sm min-h-[500px] flex flex-col items-center justify-center text-slate-400 p-8">
              <Receipt className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-medium text-slate-600">No Patient Selected</p>
              <p className="text-sm mt-1">Select a patient from the left to view pending costs and generate an invoice.</p>
            </Card>
          ) : (
            <>
              <Card className="border-none shadow-sm">
                <CardHeader title="Pending Costs from Departments" />
                <CardContent className="p-0">
                  {loadingItems ? (
                    <div className="flex justify-center p-8 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : pendingItems.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No pending items found for this patient.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-y border-slate-200">
                            <th className="py-3 px-4">Dept</th>
                            <th className="py-3 px-4">Item Description</th>
                            <th className="py-3 px-4 w-20 text-center">Qty</th>
                            <th className="py-3 px-4 w-32 text-right">Unit Price</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {pendingItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                  item.department === 'PHARMACY' ? 'bg-emerald-100 text-emerald-700' :
                                  item.department === 'LAB' ? 'bg-cyan-100 text-cyan-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {item.department}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                              <td className="py-3 px-4 text-center">{item.quantity}</td>
                              <td className="py-3 px-4 text-right">{(item.unitPrice || 0).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right font-semibold text-slate-900">
                                {(item.totalPrice || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader title="Additional Costs (Optional)" />
                <CardContent className="p-0">
                  <div className="overflow-x-auto p-6 pt-0">
                    <table className="w-full text-left border-collapse mt-4">
                      <thead>
                        <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="pb-3 pr-2 w-1/3">Item Description</th>
                          <th className="pb-3 px-2">Type</th>
                          <th className="pb-3 px-2 w-20 text-center">Qty</th>
                          <th className="pb-3 px-2 w-32 text-right">Unit Price</th>
                          <th className="pb-3 px-2 text-right">Amount</th>
                          <th className="pb-3 pl-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {additionalItems.map((item) => (
                          <tr key={item.id} className="group">
                            <td className="py-3 pr-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleAdditionalItemChange(item.id, "description", e.target.value)}
                                className={inputClass}
                                placeholder="e.g. Consultation Fee"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <select
                                value={item.itemType}
                                onChange={(e) => handleAdditionalItemChange(item.id, "itemType", e.target.value)}
                                className={inputClass}
                              >
                                <option value="CONSULTATION">Consultation</option>
                                <option value="PROCEDURE">Procedure</option>
                                <option value="BED_CHARGE">Bed Charge</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleAdditionalItemChange(item.id, "quantity", e.target.value)}
                                className={inputClass}
                              />
                            </td>
                            <td className="py-3 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleAdditionalItemChange(item.id, "unitPrice", e.target.value)}
                                className={inputClass}
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 px-2 text-right font-medium text-slate-700">
                              {((Number(item.quantity) * Number(item.unitPrice)) || 0).toFixed(2)}
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <button
                                onClick={() => handleRemoveAdditionalItem(item.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-start">
                      <Button variant="soft" onClick={handleAddAdditionalItem} icon={Plus} className="text-sm">
                        Add Custom Charge
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adjustments & Totals */}
              <Card className="border-none shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 space-y-4 border-r border-slate-100">
                    <h3 className="font-semibold text-slate-800">Adjustments & Notes</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Discount (Rs.)</label>
                      <input 
                        type="number" min="0" value={discount}
                        onChange={(e) => setDiscount(e.target.value)} className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tax (Rs.)</label>
                      <input 
                        type="number" min="0" value={tax}
                        onChange={(e) => setTax(e.target.value)} className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                      <textarea 
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                        className={`${inputClass} resize-y min-h-[60px]`} placeholder="Additional billing notes..."
                      />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 flex flex-col justify-end space-y-2">
                    <div className="flex justify-between w-full text-sm text-slate-600">
                      <span>Pending Departments:</span>
                      <span>Rs. {pendingSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full text-sm text-slate-600">
                      <span>Additional Charges:</span>
                      <span>Rs. {additionalSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full text-sm text-slate-600">
                      <span>Discount:</span>
                      <span className="text-emerald-600">- Rs. {Number(discount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full text-sm text-slate-600 pb-3 border-b border-slate-200">
                      <span>Tax:</span>
                      <span>+ Rs. {Number(tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full text-xl font-bold text-slate-900 pt-2">
                      <span>Final Total:</span>
                      <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-6 mt-auto">
                      <Button 
                        variant="primary" 
                        onClick={handleGenerateInvoice} 
                        disabled={saving}
                        icon={saving ? Loader2 : Receipt}
                        className={`w-full bg-sky-600 hover:bg-sky-700 shadow-sky-500/20 py-3 text-base ${saving ? "opacity-70" : ""}`}
                      >
                        {saving ? "Generating Final Invoice..." : "Generate Final Invoice"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
