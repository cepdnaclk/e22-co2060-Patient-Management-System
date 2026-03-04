import React, { useState } from 'react';
// import { 
//   FaUser, FaPhone, FaEnvelope, FaCalendarAlt, 
//   FaPrescriptionBottleMedical, FaFlask, FaEdit, 
//   FaHeartbeat, FaPlus, FaTrash, FaFilePdf 
// } from 'react-icons/fa';

const LabReports = () => {
  const [activeLabTab, setActiveLabTab] = useState("all");
  // ==================== MEDICAL HISTORY RECORDS ====================
  const [historyRecords, setHistoryRecords] = useState([
    {
      id: 1,
      date: "23 Feb 2026",
      type: "Diagnosis",
      title: "Type 2 Diabetes Mellitus",
      description: "HbA1c 6.8% (improved from 7.9%). Stable on current medication.",
      doctor: "Dr. A. Perera"
    },
    {
      id: 2,
      date: "20 Feb 2026",
      type: "Admission Note",
      title: "Routine Follow-up",
      description: "Admitted for annual diabetes review. No acute complaints.",
      doctor: "Dr. A. Perera"
    }
  ]);

  // ==================== LAB REPORTS ====================
  const [labReports, setLabReports] = useState([
    {
      id: 101,
      date: "23 Feb 2026",
      test: "HbA1c",
      result: "6.8%",
      normalRange: "< 6.5%",
      status: "Borderline",
      file: "HbA1c_23Feb.pdf"
    },
    {
      id: 102,
      date: "20 Feb 2026",
      test: "Complete Blood Count",
      result: "WBC 7.2 ×10^9/L",
      normalRange: "4.0 - 11.0",
      status: "Normal",
      file: "CBC_20Feb.pdf"
    },
    {
      id: 103,
      date: "15 Feb 2026",
      test: "Fasting Blood Sugar",
      result: "112 mg/dL",
      normalRange: "70 - 99",
      status: "High",
      file: "FBS_15Feb.pdf"
    }
  ]);

  const [newHistory, setNewHistory] = useState({
    date: new Date().toISOString().slice(0,10),
    type: "Note",
    title: "",
    description: "",
    doctor: "Dr. A. Perera"
  });

  const [newLab, setNewLab] = useState({
    date: new Date().toISOString().slice(0,10),
    test: "",
    result: "",
    normalRange: "",
    status: "Normal"
  });

  const addHistoryRecord = () => {
    if (!newHistory.title || !newHistory.description) return alert("Title & Description required");
    const record = {
      id: Date.now(),
      ...newHistory,
      date: new Date(newHistory.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    };
    setHistoryRecords([record, ...historyRecords]);
    setNewHistory({ date: new Date().toISOString().slice(0,10), type: "Note", title: "", description: "", doctor: "Dr. A. Perera" });
  };

  const addLabReport = () => {
    if (!newLab.test || !newLab.result) return alert("Test name & Result required");
    const report = {
      id: Date.now(),
      ...newLab,
      date: new Date(newLab.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    };
    setLabReports([report, ...labReports]);
    setNewLab({ date: new Date().toISOString().slice(0,10), test: "", result: "", normalRange: "", status: "Normal" });
  };

  const deleteItem = (type, id) => {
    if (confirm(`Delete this ${type}?`)) {
      if (type === 'history') setHistoryRecords(prev => prev.filter(r => r.id !== id));
      if (type === 'lab') setLabReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const filteredLabReports = labReports.filter((report) => {
    if (activeLabTab === "all") return true;
    if (activeLabTab === "normal") return report.status === "Normal";
    return report.status !== "Normal";
  });

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      {/* Patient Header (same as before) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl p-8 mb-10 flex items-center gap-8">
        <img src="https://i.pravatar.cc/160?u=rajeshkumar" alt="Rajesh Kumar" className="w-40 h-40 rounded-3xl object-cover ring-8 ring-white/30" />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold">Rajesh Kumar</h1>
            <span className="bg-emerald-400 text-emerald-900 px-6 py-1.5 rounded-3xl text-sm font-semibold flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-900 rounded-full animate-pulse" /> Active
            </span>
          </div>
          <p className="text-2xl mt-2 opacity-90">PMS-00421 • 52 years • Male • B+</p>
          <p className="mt-3 text-lg opacity-75">Admitted: 20 February 2026 • Primary Doctor: Dr. A. Perera</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">

          {/* Personal Info + Vitals (unchanged) */}
          {/* ... (same as previous version) ... */}

          {/* MEDICAL HISTORY - scrollable */}
         

          {/* ==================== NEW LAB REPORTS SECTION ==================== */}
          <div className="bg-white rounded-3xl shadow p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                🧪 Lab Reports
              </h2>
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {filteredLabReports.length} / {labReports.length} reports
              </span>
            </div>

            <div className="mb-6 w-max flex gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveLabTab("all")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 transition-all ${
                  activeLabTab === "all"
                    ? "text-purple-700 font-semibold border-purple-700"
                    : "text-slate-600 font-medium border-transparent hover:text-purple-700"
                }`}
              >
                All Reports
              </button>
              <button
                type="button"
                onClick={() => setActiveLabTab("normal")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 transition-all ${
                  activeLabTab === "normal"
                    ? "text-purple-700 font-semibold border-purple-700"
                    : "text-slate-600 font-medium border-transparent hover:text-purple-700"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setActiveLabTab("abnormal")}
                className={`text-[15px] text-center py-2.5 px-5 border-b-2 transition-all ${
                  activeLabTab === "abnormal"
                    ? "text-purple-700 font-semibold border-purple-700"
                    : "text-slate-600 font-medium border-transparent hover:text-purple-700"
                }`}
              >
                Abnormal
              </button>
            </div>

            {/* Add New Lab Report Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
              <p className="text-sm font-medium mb-3 text-slate-600">Upload / Add New Lab Report</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input 
                  type="date" 
                  value={newLab.date}
                  onChange={e => setNewLab({...newLab, date: e.target.value})}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Test Name (e.g. HbA1c)"
                  value={newLab.test}
                  onChange={e => setNewLab({...newLab, test: e.target.value})}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm col-span-2"
                />
                <input 
                  type="text" 
                  placeholder="Result (e.g. 6.8%)"
                  value={newLab.result}
                  onChange={e => setNewLab({...newLab, result: e.target.value})}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
                />
                <button 
                  onClick={addLabReport}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-medium flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  {/* <FaPlus /> */} Add Report
                </button>
              </div>
              <div className="flex gap-4 mt-4">
                <input 
                  type="text" 
                  placeholder="Normal Range (optional)"
                  value={newLab.normalRange}
                  onChange={e => setNewLab({...newLab, normalRange: e.target.value})}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm"
                />
                <select 
                  value={newLab.status}
                  onChange={e => setNewLab({...newLab, status: e.target.value})}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm w-40"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                  <option value="Borderline">Borderline</option>
                </select>
              </div>
            </div>

            {/* Scrollable Lab Reports List */}
            <div className="max-h-[460px] overflow-y-auto pr-2 space-y-4 custom-scroll">
              {filteredLabReports.map(report => (
                <div key={report.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-purple-200 transition group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full">{report.date}</span>
                      <span className="font-semibold text-lg">{report.test}</span>
                    </div>
                    <button 
                      onClick={() => deleteItem('lab', report.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      {/* <FaTrash /> */} delete
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Result</p>
                      <p className="font-semibold">{report.result}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Normal Range</p>
                      <p className="font-medium text-slate-600">{report.normalRange || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <span className={`inline-block px-4 py-1 rounded-3xl text-xs font-medium
                        ${report.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 
                          report.status === 'High' || report.status === 'Low' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`📄 Opening ${report.file} ...`)}
                    className="mt-5 flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {/* <FaFilePdf /> */} View / Download PDF Report
                  </button>
                </div>
              ))}
              {filteredLabReports.length === 0 && (
                <p className="text-center text-slate-400 py-12">
                  No lab reports in this tab.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR - Quick Actions (unchanged) */}
        {/* ... same as previous ... */}
      </div>
    </div>
  );
};

export default LabReports;