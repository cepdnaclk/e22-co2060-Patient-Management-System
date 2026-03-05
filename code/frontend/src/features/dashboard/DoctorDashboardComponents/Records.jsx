import React, { useEffect, useState } from 'react';
import { patientRecordService } from '../../../services/patientRecordService';
import New_Prescription from './Pharmacy';
// import { 
//   FaUser, FaPhone, FaEnvelope, FaCalendarAlt, 
//   FaPrescriptionBottleMedical, FaFlask, FaEdit, 
//   FaHeartbeat, FaPlus, FaTrash 
// } from 'react-icons/fa';

const PatientProfile = () => {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [activeRecordsTab, setActiveRecordsTab] = useState("all");
  const [historyRecords, setHistoryRecords] = useState([
    {
      id: 1,
      date: "N/A",
      type: "Record",
      title: "No record selected",
      description: "Search and select a patient to load medical records.",
      doctor: "System"
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "Note",
    title: "",
    description: "",
    doctor: "Dr. A. Perera"
  });

  const addNewRecord = async () => {
    if (!newRecord.title || !newRecord.description) {
      alert("Please fill Title and Description");
      return;
    }
    if (!selectedPatient?.id) {
      setSearchError("Select a patient before adding a record.");
      return;
    }

    setSavingRecord(true);
    try {
      const createdRecord = await patientRecordService.createMedicalRecord(
        selectedPatient.id,
        newRecord,
      );
      setHistoryRecords((previousRecords) => [createdRecord, ...previousRecords]);
      setNewRecord({
        date: new Date().toISOString().slice(0, 10),
        type: "Note",
        title: "",
        description: "",
        doctor: "Dr. A. Perera",
      });
      setSearchError("");
    } catch (error) {
      setSearchError(error.response?.data?.message || "Failed to create medical record.");
    } finally {
      setSavingRecord(false);
    }
  };

  const searchPatient = () => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      setSearchError("Please enter patient ID or name.");
      setSelectedPatient(null);
      return;
    }

    const found = patients.find(
      (patient) =>
        String(patient.id).toLowerCase() === query ||
        patient.displayId.toLowerCase() === query ||
        patient.name.toLowerCase().includes(query),
    );

    if (!found) {
      setSearchError("Patient not found. Try a valid ID or name.");
      setSelectedPatient(null);
      return;
    }

    setSearchError("");
    selectPatient(found);
  };

  const selectPatient = async (patient) => {
    setSearchText(patient.displayId || String(patient.id));
    setSearchError("");
    setSelectedPatient(patient);

    setLoadingRecords(true);
    try {
      const [records, detailedPatient] = await Promise.all([
        patientRecordService.getPatientRecords(patient.id),
        patientRecordService.getPatientDetails(patient.id),
      ]);
      if (detailedPatient) {
        setSelectedPatient(detailedPatient);
      }
      setHistoryRecords(
        records.length
          ? records
          : [
              {
                id: Date.now(),
                date: "N/A",
                type: "Record",
                title: "No records found",
                description: "This patient has no medical records yet.",
                doctor: "System",
              },
            ],
      );
    } catch (error) {
      setHistoryRecords([
        {
          id: Date.now(),
          date: "N/A",
          type: "Error",
          title: "Failed to load records",
          description:
            error.response?.data?.message || "Unable to fetch patient medical records.",
          doctor: "System",
        },
      ]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const cancelSearch = () => {
    setSearchText("");
    setSearchError("");
    setSelectedPatient(null);
    setHistoryRecords([
      {
        id: Date.now(),
        date: "N/A",
        type: "Record",
        title: "No record selected",
        description: "Search and select a patient to load medical records.",
        doctor: "System",
      },
    ]);
  };

  const handleSavePrescription = async (medicines) => {
    if (!selectedPatient?.id) {
      setSearchError("Select a patient before adding a prescription.");
      return;
    }

    const normalizedMedicines = medicines.filter(
      (medicine) =>
        medicine.name?.trim() ||
        medicine.dosage?.trim() ||
        medicine.frequency?.trim() ||
        medicine.duration?.trim() ||
        medicine.notes?.trim(),
    );

    if (normalizedMedicines.length === 0) {
      alert("Please add at least one medicine before saving.");
      return;
    }

    const title =
      normalizedMedicines
        .map((medicine) => medicine.name?.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join(", ") || "Prescription";

    const description = normalizedMedicines
      .map((medicine, index) => {
        const parts = [
          medicine.name?.trim(),
          medicine.dosage?.trim(),
          medicine.frequency?.trim(),
          medicine.duration?.trim(),
          medicine.notes?.trim() ? `Notes: ${medicine.notes.trim()}` : "",
        ].filter(Boolean);

        return `${index + 1}. ${parts.join(" | ")}`;
      })
      .join("\n");

    setSavingPrescription(true);
    try {
      const createdRecord = await patientRecordService.createMedicalRecord(
        selectedPatient.id,
        {
          date: new Date().toISOString().slice(0, 10),
          type: "Prescription",
          title,
          description,
          doctor: "Dr. A. Perera",
        },
      );

      setHistoryRecords((previousRecords) => [createdRecord, ...previousRecords]);
      setSearchError("");
      alert("Prescription saved successfully.");
    } catch (error) {
      setSearchError(error.response?.data?.message || "Failed to save prescription.");
    } finally {
      setSavingPrescription(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPatients = async () => {
      setLoadingPatients(true);
      try {
        const data = await patientRecordService.getAllPatients();
        if (!isMounted) return;
        setPatients(data);
      } catch (error) {
        if (!isMounted) return;
        setSearchError(
          error.response?.data?.message || "Failed to load patients list.",
        );
      } finally {
        if (isMounted) {
          setLoadingPatients(false);
        }
      }
    };

    loadPatients();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHistoryRecords = historyRecords.filter((record) => {
    const normalizedType = (record.type || "").toLowerCase();
    const normalizedTitle = (record.title || "").toLowerCase();
    const isLabRecord = normalizedType.includes("lab");
    const isPrescriptionRecord =
      normalizedType.includes("prescription") ||
      normalizedTitle.includes("prescription");

    if (activeRecordsTab === "all") {
      return !isPrescriptionRecord;
    }

    if (activeRecordsTab === "clinical") {
      return !isLabRecord && !isPrescriptionRecord;
    }

    if (activeRecordsTab === "lab") {
      return isLabRecord;
    }

    return isPrescriptionRecord;
  });

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <p className="text-sm font-medium text-slate-700 mb-3">
          Search patient first to view profile and records
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchPatient();
            }}
            placeholder="Enter Patient ID (e.g. PMS-00001) or Name"
            className="md:col-span-3 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
          />
          <button
            onClick={searchPatient}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 text-sm font-medium"
          >
            Search Patient
          </button>
          <button
            onClick={cancelSearch}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl px-4 py-3 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
        {searchError && (
          <p className="mt-3 text-sm text-red-600">{searchError}</p>
        )}

        {!selectedPatient && (
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Patient List
            </div>
            <div className="divide-y divide-slate-200">
              {loadingPatients ? (
                <p className="px-4 py-3 text-sm text-slate-500">Loading patients...</p>
              ) : patients.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500">No patients found.</p>
              ) : (
                patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => selectPatient(patient)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                >
                  <p className="text-sm font-medium text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.displayId}</p>
                </button>
              )))}
            </div>
          </div>
        )}
      </div>

      {!selectedPatient ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
          Enter a patient ID or name, then click Search to display patient profile.
        </div>
      ) : (
        <>
      {/* Patient Header Banner - Same as before */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-8 mb-10 flex items-center gap-8">
        <img 
          src={selectedPatient.avatar}
          alt={selectedPatient.name}
          className="w-40 h-40 rounded-3xl object-cover ring-8 ring-white/30"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold">{selectedPatient.name}</h1>
            <span className="bg-emerald-400 text-emerald-900 px-6 py-1.5 rounded-3xl text-sm font-semibold flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-900 rounded-full animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-2xl mt-2 opacity-90">
            {selectedPatient.displayId} • {selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.bloodGroup}
          </p>
          <p className="mt-3 text-lg opacity-75">
            Admitted: {selectedPatient.admittedDate} • Primary Doctor: {selectedPatient.primaryDoctor}
          </p>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-8 text-sm">
          <div className="text-right">
            <div className="text-4xl font-semibold">{selectedPatient.height ?? "N/A"}</div>
            <div className="opacity-75 text-xs">cm Height</div>
          </div>
          <div>
            <div className="text-4xl font-semibold">{selectedPatient.weight ?? "N/A"}</div>
            <div className="opacity-75 text-xs">kg Weight</div>
          </div>
          <div className="text-right col-span-2">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur px-6 py-3 rounded-3xl">
              <span>Allergies:</span>
              <span className="font-bold text-red-200">{selectedPatient.allergies || "None"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Information + Vitals + Recent Activity (same as before) */}
          

          {/* Current Vitals (same) */}
          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              Current Vitals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-semibold text-red-600">{selectedPatient.bloodPressure || "N/A"}</div>
                <div className="text-sm text-slate-500 mt-1">Blood Pressure</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-semibold">{selectedPatient.heartRate ?? "N/A"}</div>
                <div className="text-sm text-slate-500 mt-1">Heart Rate <span className="text-xs">bpm</span></div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-semibold">{selectedPatient.temperature ?? "N/A"}</div>
                <div className="text-sm text-slate-500 mt-1">Temperature <span className="text-xs">°C</span></div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-semibold text-blue-600">{selectedPatient.oxygenSaturation != null ? `${selectedPatient.oxygenSaturation}%` : "N/A"}</div>
                <div className="text-sm text-slate-500 mt-1">O₂ Saturation</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="w-max flex gap-2">
              <button
                type="button"
                onClick={() => setActiveRecordsTab("all")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 cursor-pointer transition-all ${
                  activeRecordsTab === "all"
                    ? "text-blue-700 font-semibold border-blue-700"
                    : "text-slate-600 font-medium border-transparent hover:text-blue-700"
                }`}
              >
                All Records
              </button>
              <button
                type="button"
                onClick={() => setActiveRecordsTab("clinical")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 cursor-pointer transition-all ${
                  activeRecordsTab === "clinical"
                    ? "text-blue-700 font-semibold border-blue-700"
                    : "text-slate-600 font-medium border-transparent hover:text-blue-700"
                }`}
              >
                Clinical Notes
              </button>
              <button
                type="button"
                onClick={() => setActiveRecordsTab("lab")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 cursor-pointer transition-all ${
                  activeRecordsTab === "lab"
                    ? "text-blue-700 font-semibold border-blue-700"
                    : "text-slate-600 font-medium border-transparent hover:text-blue-700"
                }`}
              >
                Lab Results
              </button>
              <button
                type="button"
                onClick={() => setActiveRecordsTab("prescription")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 cursor-pointer transition-all ${
                  activeRecordsTab === "prescription"
                    ? "text-blue-700 font-semibold border-blue-700"
                    : "text-slate-600 font-medium border-transparent hover:text-blue-700"
                }`}
              >
                Prescription History
              </button>
            </div>

            <p className="text-sm text-slate-600 mt-4">
              {activeRecordsTab === "all" &&
                "Showing all medical history entries."}
              {activeRecordsTab === "clinical" &&
                "Showing diagnosis, notes, and non-lab clinical records."}
              {activeRecordsTab === "lab" &&
                "Showing only records with lab result type."}
              {activeRecordsTab === "prescription" &&
                "Showing only prescription history entries."}
            </p>
          </div>

          {activeRecordsTab === "prescription" ? (
            <>
              <div className="bg-white rounded-3xl shadow p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-3">
                    Prescription History
                  </h2>
                  <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                    {filteredHistoryRecords.length} entries
                  </span>
                </div>

                <div className="max-h-[320px] overflow-y-auto pr-2 custom-scroll space-y-4">
                  {loadingRecords && (
                    <p className="text-sm text-slate-500">Loading prescriptions...</p>
                  )}
                  {!loadingRecords && filteredHistoryRecords.map((record) => (
                    <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full">{record.date}</span>
                            <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{record.type}</span>
                          </div>
                          <p className="font-semibold text-lg mt-2">{record.title}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 mt-3 leading-relaxed whitespace-pre-line">{record.description}</p>
                      <p className="text-xs text-slate-400 mt-4">Added by {record.doctor}</p>
                    </div>
                  ))}
                </div>

                {!loadingRecords && filteredHistoryRecords.length === 0 && (
                  <p className="text-center text-slate-400 py-8">
                    No prescription history found for this patient.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl shadow p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  Medical History & Records
                </h2>
                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                  {filteredHistoryRecords.length} / {historyRecords.length} entries
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                <p className="text-sm font-medium mb-3 text-slate-600">Add New Record</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    type="date" 
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  />
                  <select 
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                    className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Note">Clinical Note</option>
                    <option value="Lab Result">Lab Result</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Allergy">Allergy Update</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Title (e.g. Hypertension)"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                    className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  />
                  <button 
                    onClick={addNewRecord}
                    disabled={!selectedPatient || loadingRecords || savingRecord}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    {/* <FaPlus /> */} {savingRecord ? "Saving..." : "Add Record"}
                  </button>
                </div>
                <textarea 
                  placeholder="Detailed description / notes..."
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                  className="mt-4 w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm h-20 resize-y min-h-[60px]"
                />
              </div>

              <div className="max-h-[460px] overflow-y-auto pr-2 custom-scroll space-y-4">
                {loadingRecords && (
                  <p className="text-sm text-slate-500">Loading records...</p>
                )}
                {!loadingRecords && filteredHistoryRecords.map((record) => (
                  <div key={record.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full">{record.date}</span>
                          <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{record.type}</span>
                        </div>
                        <p className="font-semibold text-lg mt-2">{record.title}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 mt-3 leading-relaxed">{record.description}</p>
                    <p className="text-xs text-slate-400 mt-4">Added by {record.doctor}</p>
                  </div>
                ))}
              </div>

              {filteredHistoryRecords.length === 0 && (
                <p className="text-center text-slate-400 py-12">
                  No records in this tab. Add one above.
                </p>
              )}
            </div>
          )}
          <New_Prescription
                patientName={selectedPatient.name}
                patientId={selectedPatient.displayId}
                onSavePrescription={handleSavePrescription}
                saving={savingPrescription}
              />
        </div>

        

        {/* Right Sidebar - Quick Actions (same as before) */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => alert('New Prescription')} className="flex flex-col items-center justify-center gap-3 py-7 bg-blue-50 hover:bg-blue-100 rounded-3xl transition-all active:scale-95">
                {/* <FaPrescriptionBottleMedical size={32} className="text-blue-600" /> */}
                <span className="font-medium text-sm">New Prescription</span>
              </button>
              <button onClick={() => alert('Book Appointment')} className="flex flex-col items-center justify-center gap-3 py-7 bg-emerald-50 hover:bg-emerald-100 rounded-3xl transition-all active:scale-95">
                {/* <FaCalendarAlt size={32} className="text-emerald-600" /> */}
                <span className="font-medium text-sm">Book Appointment</span>
              </button>
              <button onClick={() => alert("Order Lab Test")} className="flex flex-col items-center justify-center gap-3 py-7 bg-violet-50 hover:bg-violet-100 rounded-3xl transition-all active:scale-95">
                {/* <FaFlask size={32} className="text-violet-600" /> */}
                <span className="font-medium text-sm">Order Lab Test</span>
              </button>
              <button onClick={() => alert('Edit Profile')} className="flex flex-col items-center justify-center gap-3 py-7 bg-amber-50 hover:bg-amber-100 rounded-3xl transition-all active:scale-95">
                {/* <FaEdit size={32} className="text-amber-600" /> */}
                <span className="font-medium text-sm">Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Next Appointment & Insurance (same) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow">
            <p className="text-blue-200 text-sm mb-1">NEXT APPOINTMENT</p>
            <p className="text-3xl font-bold">Tomorrow<br />10:30 AM</p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center text-3xl">🩺</div>
              <div>
                <p className="font-medium">Dr. A. Perera</p>
                <p className="text-blue-100 text-sm">Diabetes Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-8 text-sm">
            <h2 className="font-semibold text-xl mb-6">Insurance &amp; Billing</h2>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400">Policy Status</p>
                <p className="font-semibold text-emerald-600">Active — ABC Health Insurance</p>
              </div>
              <div>
                <p className="text-slate-400">Last Bill</p>
                <p className="font-semibold">LKR 12,450 <span className="text-emerald-500 font-medium">(Paid 22 Feb)</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
      )}
    
    </div>
  );
};

export default PatientProfile;