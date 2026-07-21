import React, { useState, useEffect } from "react";
import { Pill, CheckCircle, Clock, AlertCircle, Plus, X } from "lucide-react";
import { nurseDashboardService } from "../../../services/nurseDashboardService";

export default function MARCard({ patient }) {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "Daily",
    icd10Code: ""
  });

  useEffect(() => {
    async function loadMeds() {
      if (!patient?.id) {
        setMeds([]);
        return;
      }
      setLoading(true);
      try {
        const [orders, prescriptions] = await Promise.all([
          nurseDashboardService.getPatientMedications(patient.id),
          nurseDashboardService.getPatientPrescriptions(patient.id),
        ]);

        const orderMeds = (orders || []).map((o) => ({
          id: `order-${o.id}`,
          source: "order",
          medicationName: o.medicationName || o.name,
          dosage: o.dosage || o.dose,
          frequency: o.frequency,
          dueTime: o.dueTime || o.frequency,
          urgency: o.urgency || "normal",
          currentStatus: o.currentStatus || "pending",
          prescriber: null,
        }));

        const rxMeds = (prescriptions || []).map((r) => ({
          id: `rx-${r.id}`,
          source: "prescription",
          medicationName: r.treatment || r.description?.split("\n")[0] || "Prescription",
          dosage: "As prescribed",
          frequency: "As prescribed",
          dueTime: "—",
          urgency: "normal",
          currentStatus: r.isFulfilled ? "given" : "pending",
          prescriber: r.doctorName || "Doctor",
          description: r.description,
        }));

        setMeds([...orderMeds, ...rxMeds]);
      } catch (error) {
        console.error("Failed to fetch meds", error);
      } finally {
        setLoading(false);
      }
    }
    loadMeds();
  }, [patient?.id]);

  const toggleAdminister = async (id) => {
    const med = meds.find(m => m.id === id);
    if (!med) return;
    
    // Optimistic UI update
    const newStatus = med.currentStatus === 'given' ? 'pending' : 'given';
    setMeds(meds.map(m => m.id === id ? { ...m, currentStatus: newStatus } : m));
    
    try {
      if (newStatus === 'given') {
         await nurseDashboardService.administerMedication({
           orderId: med.id,
           status: 'GIVEN',
           notes: 'Administered from dashboard'
         });
      }
    } catch (error) {
      console.error("Failed to record administration", error);
      // Revert on error
      setMeds(meds.map(m => m.id === id ? { ...m, currentStatus: med.currentStatus } : m));
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!patient?.id) return;
    try {
      const newOrder = await nurseDashboardService.createMedicationOrder({
        patientId: patient.id,
        ...formData
      });
      setMeds([newOrder, ...meds]);
      setIsModalOpen(false);
      setFormData({ medicationName: "", dosage: "", frequency: "Daily", icd10Code: "" });
    } catch (error) {
      console.error("Failed to add medication", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-blue-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            Medication Administration (MAR)
          </h3>
          <p className="text-xs text-blue-700 mt-1 font-medium">
             {patient ? `For ${patient.firstName} ${patient.lastName}` : "No patient selected"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={!patient}
            className="flex items-center gap-1.5 text-xs font-bold bg-white text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Med
          </button>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {meds.filter(m => m.currentStatus === 'pending').length} Due
          </span>
        </div>
      </div>
      
      <div className="p-0 flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-5 py-3">Medication</th>
              <th className="px-5 py-3">Dose / Route</th>
              <th className="px-5 py-3">Schedule</th>
              <th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meds.length === 0 && (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-slate-500">
                  {loading ? "Loading medications..." : "No active medications for this patient."}
                </td>
              </tr>
            )}
            {meds.map(med => (
              <tr key={med.id} className={`transition-colors hover:bg-slate-50/50 ${med.currentStatus === 'given' ? 'bg-slate-50/50 opacity-60' : ''}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${med.currentStatus === 'given' ? 'bg-slate-200 text-slate-400' : med.source === 'prescription' ? 'bg-purple-100 text-purple-600' : med.urgency === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Pill className="w-4 h-4" />
                     </div>
                     <div>
                       <p className={`font-bold ${med.currentStatus === 'given' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{med.medicationName || med.name}</p>
                       {med.source === 'prescription' && med.prescriber && (
                         <span className="text-[10px] text-purple-600 font-medium">Prescribed by Dr. {med.prescriber}</span>
                       )}
                       {med.source === 'order' && (
                         <span className="text-[10px] text-blue-500 font-medium">Nurse-added</span>
                       )}
                       {med.urgency === 'high' && med.currentStatus === 'pending' && (
                         <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                           <AlertCircle className="w-3 h-3" /> Overdue
                         </span>
                       )}
                     </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-700">{med.dosage || med.dose}</p>
                  <p className="text-xs text-slate-500">{med.source === 'prescription' ? 'Rx' : 'PO'}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-700">{med.dueTime}</p>
                  <p className="text-xs text-slate-500">{med.frequency}</p>
                </td>
                <td className="px-5 py-4 text-center">
                  {med.source === 'order' ? (
                    <button 
                      onClick={() => toggleAdminister(med.id)}
                      disabled={med.currentStatus === 'given'}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mx-auto ${
                        med.currentStatus === 'given' 
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-sm'
                      }`}
                    >
                      {med.currentStatus === 'given' ? (
                        <>Given <CheckCircle className="w-4 h-4" /></>
                      ) : (
                        <>Administer</>
                      )}
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      med.currentStatus === 'given' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {med.currentStatus === 'given' ? 'Fulfilled' : 'Pending'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Medication Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMedication} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Medication Name</label>
                <input required type="text" placeholder="e.g. Amoxicillin" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.medicationName} onChange={e => setFormData({...formData, medicationName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dosage</label>
                  <input required type="text" placeholder="e.g. 500mg" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
                  <select required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                    <option value="Daily">Daily</option>
                    <option value="BID (Twice daily)">BID (Twice daily)</option>
                    <option value="TID (Three times daily)">TID (Three times daily)</option>
                    <option value="q8h (Every 8 hours)">q8h (Every 8 hours)</option>
                    <option value="PRN (As needed)">PRN (As needed)</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">Add Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
