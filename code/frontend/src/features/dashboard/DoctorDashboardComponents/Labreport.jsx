import React, { useState, useEffect } from 'react';
import PatientSearch from "../doctor/PatientSearch.jsx";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { FileText, FlaskConical, CheckCircle2, FileSearch } from "lucide-react";
import { patientRecordService } from "../../../services/patientRecordService";

export default function LabReports() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [labRecords, setLabRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPatient) return;
    const fetchLabs = async () => {
      setLoading(true);
      try {
        const records = await patientRecordService.getPatientRecords(selectedPatient.id);
        const labs = records.filter(r => r.type === "LAB_TEST");
        setLabRecords(labs);
      } catch (err) {
        console.error("Failed to load lab records");
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [selectedPatient]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleApprove = async (recordId) => {
    try {
      const record = labRecords.find(r => r.id === recordId);
      if (!record) return;
      
      await patientRecordService.updateMedicalRecord(recordId, {
        ...record,
        isFulfilled: true
      });
      
      setLabRecords(prev => prev.map(r => r.id === recordId ? { ...r, isFulfilled: true } : r));
      alert("Lab report approved successfully.");
    } catch (err) {
      alert("Failed to approve lab report.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lab Reports Review</h1>
        <p className="text-sm text-slate-500 mt-1">Review and approve pending laboratory results for your patients.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Find Patient</h3>
        <PatientSearch onSelectPatient={handleSelectPatient} />
      </div>

      {selectedPatient && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <Card className="border-none shadow-md shadow-slate-200/50 max-w-4xl mx-auto">
            <CardHeader className="pb-0 border-b border-slate-100 mb-4">
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-6 h-6 text-purple-600" />
                  Lab Orders for {selectedPatient.name}
                </h3>
                <Badge variant="purple">{labRecords.length} Total</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading lab orders...</div>
              ) : labRecords.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center text-slate-400">
                  <FileSearch className="w-12 h-12 mb-4 opacity-30" />
                  <p className="font-medium text-slate-600 text-lg">No lab orders found</p>
                  <p className="text-sm mt-1 text-slate-500">This patient does not have any pending or completed lab tests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {labRecords.map(report => (
                    <div key={report.id} className={`bg-white border rounded-2xl p-5 transition-all ${report.isFulfilled ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-purple-300 shadow-sm"}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{new Date(report.createdAt).toLocaleDateString()}</span>
                          <span className="font-bold text-lg text-slate-800">{report.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {report.isFulfilled ? (
                            <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Approved</Badge>
                          ) : (
                            <Badge variant="warning">Pending Review</Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700">
                        <span className="font-semibold text-slate-900 block mb-1">Clinical Notes / Instructions:</span>
                        {report.description}
                      </div>

                      {!report.isFulfilled && (
                        <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            icon={CheckCircle2} 
                            onClick={() => handleApprove(report.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                          >
                            Mark as Approved
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}