import React, { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2, User, FileText, Clock } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { pharmacyService } from "../../../services/pharmacyService";

export default function PrescriptionQueue() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("PENDING"); // PENDING or FULFILLED

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      if (filter === "PENDING") {
        const data = await pharmacyService.getPendingPrescriptions();
        setPrescriptions(data);
      } else {
        const data = await pharmacyService.getFulfilledPrescriptions();
        setPrescriptions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [filter]);

  const handleFulfill = async (id) => {
    if (window.confirm("Mark this prescription as fulfilled? Ensure you have dispensed the medicine.")) {
      try {
        await pharmacyService.fulfillPrescription(id);
        loadPrescriptions();
      } catch (err) {
        alert("Failed to fulfill prescription");
      }
    }
  };

  const filtered = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Review and fulfill doctor prescriptions.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-xl w-max">
          <button 
            onClick={() => setFilter("PENDING")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === "PENDING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter("FULFILLED")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === "FULFILLED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Fulfilled
          </button>
        </div>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by patient, doctor, or medicine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>
            ) : filtered.length > 0 ? (
              filtered.map((record) => (
                <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={record.isFulfilled ? "success" : "warning"}>
                            {record.isFulfilled ? "Fulfilled" : "Pending Fulfillment"}
                          </Badge>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3"/> {new Date(record.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Patient: {record.patientName}</h3>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4"/> Prescription Details
                      </h4>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-slate-200">
                        {record.description}
                      </p>
                      {record.treatment && (
                        <p className="text-sm text-slate-600 mt-3">
                          <span className="font-semibold text-slate-700">Instructions:</span> {record.treatment}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <User className="w-4 h-4"/> Prescribed by {record.doctorName}
                    </div>
                  </div>

                  <div className="md:w-48 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    {!record.isFulfilled ? (
                      <Button onClick={() => handleFulfill(record.id)} className="w-full h-12 text-sm bg-blue-600 hover:bg-blue-700" icon={CheckCircle2}>
                        Mark Fulfilled
                      </Button>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 className="w-6 h-6"/>
                        </div>
                        <p className="text-sm font-bold text-emerald-700">Dispensed</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(record.updatedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-lg">No prescriptions found.</p>
                <p className="text-sm text-slate-400">The queue is currently empty.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
