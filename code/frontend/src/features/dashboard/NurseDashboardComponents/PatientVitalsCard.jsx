import React, { useState, useEffect } from "react";
import { Activity, ArrowUp, ArrowDown, Clock, X } from "lucide-react";
import { nurseDashboardService } from "../../../services/nurseDashboardService";

export default function PatientVitalsCard({ patient }) {
  const [vitalsData, setVitalsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: ""
  });

  useEffect(() => {
    async function loadVitals() {
      if (!patient?.id) {
        setVitalsData(null);
        return;
      }
      setLoading(true);
      try {
        const records = await nurseDashboardService.getPatientVitals(patient.id);
        if (records && records.length > 0) {
          setVitalsData(records[0]);
        } else {
          setVitalsData(null);
        }
      } catch (error) {
        console.error("Failed to fetch vitals", error);
      } finally {
        setLoading(false);
      }
    }
    loadVitals();
  }, [patient?.id]);

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!patient?.id) return;
    try {
      const newVitals = await nurseDashboardService.recordVitals({
        patientId: patient.id,
        ...formData
      });
      setVitalsData(newVitals);
      setIsModalOpen(false);
      setFormData({ bloodPressure: "", heartRate: "", temperature: "", oxygenSaturation: "", respiratoryRate: "" });
    } catch (error) {
      console.error("Failed to record vitals", error);
    }
  };

  // Convert backend data to display format
  const vitals = [
    { label: "Blood Pressure", value: vitalsData?.bloodPressure || "N/A", unit: "mmHg", trend: "stable", isAbnormal: false },
    { label: "Heart Rate", value: vitalsData?.heartRate || "N/A", unit: "bpm", trend: "stable", isAbnormal: false },
    { label: "Temperature", value: vitalsData?.temperature || "N/A", unit: "°F", trend: "stable", isAbnormal: vitalsData?.temperature > 100 },
    { label: "SpO2", value: vitalsData?.oxygenSaturation || "N/A", unit: "%", trend: "stable", isAbnormal: vitalsData?.oxygenSaturation < 95 },
    { label: "Resp Rate", value: vitalsData?.respiratoryRate || "N/A", unit: "bpm", trend: "stable", isAbnormal: false },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-4 border-b border-teal-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-teal-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Current Vitals
          </h3>
          <p className="text-xs text-teal-700 mt-1 font-medium">
             {patient ? `For ${patient.firstName} ${patient.lastName}` : "No patient selected"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-100/50 px-2.5 py-1 rounded-full border border-teal-200/50">
           <Clock className="w-3.5 h-3.5" />
           2 hrs ago
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-4">
        {vitals.map((vital, idx) => (
          <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${vital.isAbnormal ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <span className="text-sm font-semibold text-slate-600">{vital.label}</span>
            <div className="flex items-center gap-3">
               <div className="text-right">
                 <span className={`text-lg font-bold ${vital.isAbnormal ? 'text-red-600' : 'text-slate-800'}`}>
                   {vital.value}
                 </span>
                 <span className="text-xs text-slate-500 ml-1">{vital.unit}</span>
               </div>
               <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                 vital.trend === 'up' && vital.isAbnormal ? 'bg-red-100 text-red-600' : 
                 vital.trend === 'down' && vital.isAbnormal ? 'bg-red-100 text-red-600' :
                 vital.trend === 'up' ? 'bg-orange-100 text-orange-600' : 
                 vital.trend === 'down' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
               }`}>
                 {vital.trend === 'up' ? <ArrowUp className="w-3.5 h-3.5" /> : 
                  vital.trend === 'down' ? <ArrowDown className="w-3.5 h-3.5" /> : <span className="text-xl leading-none -mt-2">-</span>}
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!patient}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm shadow-teal-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
           <Activity className="w-4 h-4" />
           Record New Vitals
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Record Vitals</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordVitals} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Pressure (mmHg)</label>
                  <input required type="text" placeholder="120/80" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.bloodPressure} onChange={e => setFormData({...formData, bloodPressure: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Heart Rate (bpm)</label>
                  <input required type="number" placeholder="72" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.heartRate} onChange={e => setFormData({...formData, heartRate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Temperature (°F)</label>
                  <input required type="number" step="0.1" placeholder="98.6" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                  <input required type="number" placeholder="98" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.oxygenSaturation} onChange={e => setFormData({...formData, oxygenSaturation: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Respiratory Rate (bpm)</label>
                  <input required type="number" placeholder="16" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.respiratoryRate} onChange={e => setFormData({...formData, respiratoryRate: e.target.value})} />
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl">Save Vitals</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
