import React, { useState, useEffect } from "react";
import { Pill, Search, Plus, Loader2, Save, X, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { pharmacyService } from "../../../services/pharmacyService";

export default function InventoryManager() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const [formData, setFormData] = useState({
    name: "", genericName: "", manufacturer: "", stockQuantity: "", unitPrice: "", expiryDate: ""
  });

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getAllMedicines();
      setMedicines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleOpenModal = (med = null) => {
    if (med) {
      setEditingMed(med);
      setFormData({
        name: med.name,
        genericName: med.genericName,
        manufacturer: med.manufacturer,
        stockQuantity: med.stockQuantity,
        unitPrice: med.unitPrice,
        expiryDate: med.expiryDate || ""
      });
    } else {
      setEditingMed(null);
      setFormData({ name: "", genericName: "", manufacturer: "", stockQuantity: "", unitPrice: "", expiryDate: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await pharmacyService.updateMedicine(editingMed.id, formData);
      } else {
        await pharmacyService.addMedicine(formData);
      }
      setIsModalOpen(false);
      loadMedicines();
    } catch (error) {
      alert("Failed to save medicine");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await pharmacyService.deleteMedicine(id);
        loadMedicines();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const filteredMeds = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage medicines, stock levels, and pricing.</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>Add Medicine</Button>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name or generic name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-4 px-6">Medicine</th>
                  <th className="py-4 px-6">Manufacturer</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Expiry</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                ) : filteredMeds.length > 0 ? (
                  filteredMeds.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{med.name}</div>
                        <div className="text-xs text-slate-500">{med.genericName}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{med.manufacturer}</td>
                      <td className="py-4 px-6">
                        {med.stockQuantity <= 10 ? (
                          <Badge variant="error">{med.stockQuantity} Low Stock</Badge>
                        ) : (
                          <span className="font-medium text-slate-700">{med.stockQuantity} units</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">Rs. {med.unitPrice?.toFixed(2)}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{med.expiryDate || 'N/A'}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(med)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(med.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-500">No medicines found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-900">{editingMed ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Generic Name</label>
                    <input type="text" value={formData.genericName} onChange={(e) => setFormData({...formData, genericName: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                    <input type="text" value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
                    <input required type="number" min="0" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (Rs) *</label>
                    <input required type="number" step="0.01" min="0" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" icon={Save}>Save Medicine</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
