import React, { useState, useEffect } from "react";
import PatientSearch from "./PatientSearch.jsx";
import PatientRecordList from "./PatientRecordList.jsx";
import MedicalRecordForm from "./MedicalRecordForm.jsx";
import New_Prescription from "../DoctorDashboardComponents/Pharmacy.jsx";
import { patientRecordService } from "../../../services/patientRecordService";
import { useAuth } from "../../auth/AuthContext";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Activity, Droplet, User, Ruler, Weight, AlertTriangle, HeartPulse, Thermometer, Wind, Gauge, Save, Loader2 } from "lucide-react";

export default function PatientProfile({ onUpdate, initialPatient }) {
  const { user, isNurse } = useAuth();
  const doctorName = user ? `Dr. ${user.firstName} ${user.lastName}` : "System";
  const doctorId = user?.id || null;

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [labTestName, setLabTestName] = useState("");
  const [labTestNotes, setLabTestNotes] = useState("");
  const [vitals, setVitals] = useState({ bloodPressure: "", heartRate: "", temperature: "", oxygenSaturation: "", respiratoryRate: "" });
  const [savingVitals, setSavingVitals] = useState(false);

  // Auto-select a patient when navigated from the critical alerts panel
  useEffect(() => {
    if (initialPatient) {
      handleSelectPatient(initialPatient);
    }
  }, [initialPatient?.id]);

  const handleOrderLabTest = async () => {
    if (!selectedPatient || !labTestName.trim()) return;

    try {
      const createdRecord = await patientRecordService.createMedicalRecord(
        selectedPatient.id,
        {
          date: new Date().toISOString().slice(0, 10),
          type: "LAB_TEST",
          title: labTestName,
          description: labTestNotes || "No clinical notes provided",
          isFulfilled: false,
        },
        doctorId
      );

      setRecords((prev) => [createdRecord, ...prev]);
      setShowLabModal(false);
      setLabTestName("");
      setLabTestNotes("");
      alert("Lab Test ordered successfully.");
    } catch (err) {
      alert("Failed to order Lab Test.");
    }
  };

  const handleSaveVitals = async () => {
    if (!selectedPatient) return;
    setSavingVitals(true);
    try {
      const payload = {};
      if (vitals.bloodPressure) payload.bloodPressure = vitals.bloodPressure;
      if (vitals.heartRate) payload.heartRate = Number(vitals.heartRate);
      if (vitals.temperature) payload.temperature = Number(vitals.temperature);
      if (vitals.oxygenSaturation) payload.oxygenSaturation = Number(vitals.oxygenSaturation);
      if (vitals.respiratoryRate) payload.respiratoryRate = Number(vitals.respiratoryRate);
      const updatedPatient = await patientRecordService.updatePatientVitals(selectedPatient.id, payload);
      setSelectedPatient(updatedPatient);
      setVitals({ bloodPressure: "", heartRate: "", temperature: "", oxygenSaturation: "", respiratoryRate: "" });
      alert("Vitals updated successfully.");
    } catch (err) {
      alert("Failed to update vitals.");
    } finally {
      setSavingVitals(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingRecords(true);
    try {
      const [fetchedRecords, detailedPatient] = await Promise.all([
        patientRecordService.getPatientRecords(patient.id),
        patientRecordService.getPatientDetails(patient.id),
      ]);

      if (detailedPatient) {
        setSelectedPatient(detailedPatient);
      }
      setRecords(fetchedRecords || []);
    } catch (error) {
      console.error("Failed to load patient details", error);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleToggleCritical = async () => {
    if (!selectedPatient) return;
    try {
      const updatedPatient = await patientRecordService.toggleCriticalStatus(
        selectedPatient.id,
        !selectedPatient.criticalStatus
      );
      setSelectedPatient(updatedPatient);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      alert("Failed to update critical status.");
    }
  };

  const handleSaveRecord = async (newRecord) => {
    if (!selectedPatient) return;

    // newRecord should contain 'type', 'title', 'description'
    const createdRecord = await patientRecordService.createMedicalRecord(
      selectedPatient.id,
      newRecord,
      doctorId
    );

    if (createdRecord) {
      setRecords((prev) => [createdRecord, ...prev]);
    }
  };

  const handleSavePrescription = async (medicines) => {
    if (!selectedPatient?.id) return;

    const normalizedMedicines = medicines.filter(
      (m) => m.name?.trim() || m.dosage?.trim() || m.frequency?.trim() || m.duration?.trim() || m.notes?.trim()
    );

    if (normalizedMedicines.length === 0) {
      alert("Please add at least one medicine before saving.");
      return;
    }

    const title = normalizedMedicines.map((m) => m.name?.trim()).filter(Boolean).slice(0, 2).join(", ") || "Prescription";
    const description = normalizedMedicines
      .map((m, i) => {
        const parts = [
          m.name?.trim(),
          m.dosage?.trim(),
          m.frequency?.trim(),
          m.duration?.trim(),
          m.notes?.trim() ? `Notes: ${m.notes.trim()}` : "",
        ].filter(Boolean);
        return `${i + 1}. ${parts.join(" | ")}`;
      })
      .join("\n");

    setSavingPrescription(true);
    try {
      const createdRecord = await patientRecordService.createMedicalRecord(
        selectedPatient.id,
        {
          date: new Date().toISOString().slice(0, 10),
          type: "PRESCRIPTION",
          title,
          description,
        },
        doctorId
      );

      setRecords((prev) => [createdRecord, ...prev]);
      alert("Prescription saved successfully.");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to save prescription.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setSavingPrescription(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Records</h1>
          <p className="text-sm text-slate-500 mt-1">Search patients to view or update their medical profiles.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Find Patient</h3>
          <PatientSearch onSelectPatient={handleSelectPatient} />
        </div>

        {selectedPatient && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            {/* Patient Header Card */}
            <div className={`rounded-3xl shadow-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden transition-colors duration-500 text-white ${selectedPatient.criticalStatus ? 'bg-gradient-to-r from-red-600 to-rose-700 shadow-red-200/50' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold ring-4 ring-white/30 shrink-0 z-10 backdrop-blur-sm">
                {selectedPatient.name?.charAt(0).toUpperCase() || "?"}
              </div>

              <div className="flex-1 text-center sm:text-left z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <h2 className="text-3xl sm:text-4xl font-bold">{selectedPatient.name}</h2>
                    {selectedPatient.admissionStatus === "ADMITTED" ? (
                      <Badge className="bg-amber-400 text-amber-900 border-amber-300">In-Patient</Badge>
                    ) : (
                      <Badge className="bg-emerald-400 text-emerald-900 border-emerald-300">Out-Patient</Badge>
                    )}
                    {selectedPatient.criticalStatus && (
                      <Badge className="bg-red-900 text-red-100 border-red-800 animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> CRITICAL
                      </Badge>
                    )}
                  </div>

                  <button
                    onClick={handleToggleCritical}
                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${selectedPatient.criticalStatus ? 'bg-white text-red-700 hover:bg-red-50' : 'bg-red-500 hover:bg-red-400 text-white border border-red-400'}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {selectedPatient.criticalStatus ? "Remove Critical Flag" : "Mark as Critical"}
                  </button>
                </div>
                <p className="text-blue-100 text-lg mb-4">
                  {selectedPatient.displayId || selectedPatient.patientId || `ID: ${selectedPatient.id}`} • {selectedPatient.age || "N/A"} years • {selectedPatient.gender || "N/A"}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-red-300" /> Blood: <span className="font-semibold">{selectedPatient.bloodGroup || "N/A"}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-blue-200" /> Height: <span className="font-semibold">{selectedPatient.height ? `${selectedPatient.height} cm` : "N/A"}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
                    <Weight className="w-4 h-4 text-emerald-200" /> Weight: <span className="font-semibold">{selectedPatient.weight ? `${selectedPatient.weight} kg` : "N/A"}</span>
                  </div>
                </div>
              </div>

              {selectedPatient.allergies && (
                <div className="absolute bottom-4 right-6 text-sm bg-red-500/20 backdrop-blur-md border border-red-400/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 z-10">
                  <span className="font-semibold">Allergies:</span> {selectedPatient.allergies}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-[600px]">
                  <PatientRecordList records={records} loading={loadingRecords} />
                </div>
                {!isNurse && (
                  <div id="prescription-section">
                    <New_Prescription
                      patientName={selectedPatient.name}
                      patientId={selectedPatient.displayId || selectedPatient.patientId}
                      onSavePrescription={handleSavePrescription}
                      saving={savingPrescription}
                    />
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 space-y-6">
                <MedicalRecordForm
                  patient={selectedPatient}
                  onSaveRecord={handleSaveRecord}
                  doctorName={doctorName}
                  isNurse={isNurse}
                />
                {isNurse && (
                  <Card className="border-none shadow-md shadow-slate-200/50">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-red-500" /> Record Vitals
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Blood Pressure</label>
                          <input type="text" placeholder="e.g. 120/80" value={vitals.bloodPressure}
                            onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Heart Rate (bpm)</label>
                            <input type="number" placeholder="72" value={vitals.heartRate}
                              onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°C)</label>
                            <input type="number" step="0.1" placeholder="36.6" value={vitals.temperature}
                              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">O₂ Sat (%)</label>
                            <input type="number" step="0.1" placeholder="98" value={vitals.oxygenSaturation}
                              onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Resp Rate (breaths/min)</label>
                            <input type="number" placeholder="16" value={vitals.respiratoryRate}
                              onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none" />
                          </div>
                        </div>
                        <button onClick={handleSaveVitals} disabled={savingVitals}
                          className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-xl font-medium hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                          {savingVitals ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {savingVitals ? "Saving..." : "Save Vitals"}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {!isNurse && (
                  <Card className="border-none shadow-md shadow-slate-200/50">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" /> Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => document.getElementById("prescription-section")?.scrollIntoView({ behavior: "smooth" })}
                          className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 py-3 rounded-xl font-medium transition-colors"
                        >
                          Write Prescription
                        </button>
                        <button
                          onClick={() => setShowLabModal(true)}
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
                        >
                          Order Lab Test
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {showLabModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLabModal(false)} />
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Order Lab Test</h3>
                <p className="text-sm text-slate-500 mt-1">Request a laboratory test for {selectedPatient?.name}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Test Name / Panel</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={labTestName}
                    onChange={(e) => setLabTestName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Clinical Notes / Instructions</label>
                  <textarea
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24 resize-none"
                    placeholder="e.g. Fasting required for 12 hours..."
                    value={labTestNotes}
                    onChange={(e) => setLabTestNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setShowLabModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderLabTest}
                  disabled={!labTestName.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Submit Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


