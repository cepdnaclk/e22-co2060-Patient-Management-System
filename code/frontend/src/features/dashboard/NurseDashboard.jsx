import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Moon, Sun, LogOut, Menu, X, Users, Activity, FileText, Bell } from "lucide-react";
import AssignedPatientsList from "./NurseDashboardComponents/AssignedPatientsList.jsx";
import PatientVitalsCard from "./NurseDashboardComponents/PatientVitalsCard.jsx";
import MARCard from "./NurseDashboardComponents/MARCard.jsx";
import ClinicalOrdersCard from "./NurseDashboardComponents/ClinicalOrdersCard.jsx";
import { patientRecordService } from "../../services/patientRecordService";

const ACCENT = {
  bg: "bg-teal-500",
  shadow: "shadow-teal-500/20",
  text: "text-teal-400",
  activeBg: "bg-teal-500",
  iconBg: "bg-teal-500/20",
  border: "border-teal-500/30",
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
};

export default function NurseDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsList, setPatientsList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const pts = await patientRecordService.getAllPatients();
        const mapped = pts.map((p) => ({
          id: p.id,
          name: p.name,
          firstName: p.name.split(" ")[0] || "",
          lastName: p.name.split(" ").slice(1).join(" ") || "",
          room: p.admissionStatus || "Registered",
          age: p.age,
          diagnosis: "N/A",
          status: p.criticalStatus ? "Critical" : "Stable",
          allergies: p.allergies || "None",
        }));
        setPatientsList(mapped);
        if (mapped.length > 0 && !selectedPatient) {
          setSelectedPatient(mapped[0]);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setListLoading(false);
      }
    }
    loadPatients();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* ── Sidebar: Assigned Patients ── */}
      <aside className={`w-[320px] bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-20 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full fixed h-full shadow-2xl"}`}>
        <div className="p-4 border-b border-slate-200 bg-slate-900 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${ACCENT.bg} rounded-lg flex items-center justify-center`}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Nurse<span className="text-teal-400">Station</span>
            </span>
          </div>
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 lg:hidden">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Content (Patients) */}
        <div className="flex-1 overflow-y-auto">
          <AssignedPatientsList
            patients={mockPatients}
            selectedPatient={selectedPatient}
            onSelect={setSelectedPatient}
          />
        </div>
        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Shift Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-red-100 ml-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${ACCENT.iconBg} flex items-center justify-center font-bold text-teal-700`}>
                {user?.email?.charAt(0).toUpperCase() || "N"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">Nurse {user?.firstName || "Duty"}</p>
                <p className="text-xs text-slate-500">Nurse</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Patient Header Banner */}
            {selectedPatient ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                        ${selectedPatient.status === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                        selectedPatient.status === 'Needs Attention' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'}
                     `}>
                      {selectedPatient.status}
                    </span>
                  </div>
                  <div className="text-slate-500 text-sm flex items-center gap-4 flex-wrap">
                    <span className="font-medium text-slate-700">{selectedPatient.room}</span>
                    <span>•</span>
                    <span>{selectedPatient.age} yrs</span>
                    <span>•</span>
                    <span>Dx: <strong className="text-slate-700">{selectedPatient.diagnosis}</strong></span>
                  </div>
                </div>

                {/* Allergies Inline Alert */}
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 md:min-w-[200px]">
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Allergies</p>
                  <p className="text-sm text-rose-900 font-medium">
                    {selectedPatient.allergies}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center text-slate-500">
                Select a patient to view details.
              </div>
            )}

            {/* Main Grid: Vitals & MAR */}
            {selectedPatient && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Vitals */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                  <PatientVitalsCard patient={selectedPatient} />
                  <ClinicalOrdersCard patient={selectedPatient} />
                </div>

                {/* Right Column: MAR & Notes */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                  <MARCard patient={selectedPatient} />

                  {/* Notifications / Quick Notes Panel */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" /> Handover & Notes
                      </h3>
                      <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">Add Note</button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                      <p><strong>08:00 AM (Previous Shift):</strong> Patient had a restless night. Complained of mild pain in lower back. Administered PRN medication at 03:00 AM with good effect.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
