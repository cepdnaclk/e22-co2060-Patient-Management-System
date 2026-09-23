import React, { useState, useEffect } from "react";
import { Receipt, Search, FileText, CheckCircle2, User, Loader2, Trash2, Plus, Microscope } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { labTechnicianService } from "../../../services/labTechnicianService";
import { billingService } from "../../../services/billingService";

export default function LabBilling() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tests = await labTechnicianService.getAllLabTests();
        const completedTests = tests.filter(t => t.testResult);
        setLabTests(completedTests.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTest) {
      setBillItems([]);
      return;
    }

    const items = [];
    
    // Auto-populate with the selected lab test
    items.push({ 
      id: "test-" + Date.now(),
      name: selectedTest.testName || "Generic Lab Test", 
      unitPrice: 0,
      qty: 1
    });

    setBillItems(items);
  }, [selectedTest]);

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
      {
        id: "new-" + Date.now(),
        name: "",
        unitPrice: 0,
        qty: 1
      }
    ]);
  };

  const handleSendToReception = async () => {
    if (!selectedTest || billItems.length === 0) return;
    setIsSending(true);
    try {
      const payload = billItems.map(item => ({
        patientId: selectedTest.patientId,
        department: "LAB",
        description: item.name || "Lab Test",
        quantity: item.qty,
        unitPrice: item.unitPrice
      }));
      await billingService.addPendingItems(payload);
      setActionMsg("Costs sent to reception successfully!");
      setTimeout(() => {
        setActionMsg("");
        setSelectedTest(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to send to reception", err);
      alert("Failed to send costs to reception.");
    } finally {
      setIsSending(false);
    }
  };

  const totalAmount = billItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);

  const q = search.toLowerCase();
  const filtered = labTests.filter(t => 
    String(t.patientId ?? "").toLowerCase().includes(q) ||
    t.testName?.toLowerCase().includes(q) ||
    t.doctorName?.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-cyan-600" />
            Lab Test Billing
          </h1>
          <p className="text-sm text-slate-500 mt-1">Calculate and send costs to reception for laboratory tests.</p>
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Lab Tests */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-md shadow-slate-200/50 h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search tests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-sm outline-none transition-all"
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
                    onClick={() => setSelectedTest(record)}
                    className={`p-3 rounded-xl mb-2 cursor-pointer transition-all border ${selectedTest?.id === record.id ? 'bg-cyan-50 border-cyan-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{record.testName || "Lab Test"}</h4>
                      <Badge variant="success" className="text-[10px]">Completed</Badge>
                    </div>
                    <div className="text-xs text-slate-500">Patient #{record.patientId} &bull; Dr. {record.doctorName}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(record.updatedAt).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">No lab tests found.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Billing Details */}
        <div className="lg:col-span-2">
          {selectedTest ? (
            <Card className="border-none shadow-md shadow-slate-200/50 h-full">
              <CardContent className="p-0">
                <div className="p-6 border-b border-slate-100 bg-white rounded-t-xl flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Billing Statement</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <User className="w-4 h-4"/> Patient ID: <span className="font-medium text-slate-700">#{selectedTest.patientId}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">Record #{selectedTest.id}</p>
                    <p className="text-xs text-slate-500">{new Date(selectedTest.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4"/> Test Details
                    </h3>
                    <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap"><span className="font-semibold">Test Name:</span> {selectedTest.testName || "N/A"}</p>
                    {selectedTest.description && (
                      <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap mt-2"><span className="font-semibold">Description:</span> {selectedTest.description}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Itemized Tests</h3>
                    <button 
                      onClick={handleAddRow}
                      className="text-xs font-semibold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3"/> Add Item
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold w-2/5">Test Name</th>
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
                              <input 
                                type="text"
                                className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none shadow-sm bg-white text-sm"
                                value={item.name}
                                onChange={(e) => handleNameChange(idx, e.target.value)}
                                placeholder="Enter test name..."
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-500 text-xs">Rs.</span>
                                <input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-20 p-1.5 text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none shadow-sm transition-all bg-white"
                                  value={item.unitPrice}
                                  onChange={(e) => handlePriceChange(idx, e.target.value)}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number" 
                                min="1" 
                                className="w-16 p-1.5 text-right border border-slate-200 rounded-md focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none shadow-sm transition-all bg-white"
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
                          <td colSpan={2} className="px-4 py-4 text-right font-bold text-cyan-600 text-lg">
                            Rs. {totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={handleSendToReception}
                      disabled={isSending}
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Receipt className="w-4 h-4"/>}
                      {isSending ? "Sending..." : "Send to Reception"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 min-h-[400px]">
              <Receipt className="w-16 h-16 mb-4 text-slate-300" />
              <p className="font-medium text-slate-600">No Test Selected</p>
              <p className="text-sm mt-1">Select a lab test from the list to view its billing details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
