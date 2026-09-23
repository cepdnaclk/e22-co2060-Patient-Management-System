import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope, LogOut, Menu, X, Users, Activity,
  FileText, Bell, AlertTriangle, Heart, Thermometer,
  Loader2, UserCircle, LayoutDashboard, ClipboardList,
  Pencil, Save, Clock, CheckCircle2, Search, ChevronDown
} from "lucide-react";
import AssignedPatientsList from "./NurseDashboardComponents/AssignedPatientsList.jsx";
import PatientVitalsCard from "./NurseDashboardComponents/PatientVitalsCard.jsx";
import MARCard from "./NurseDashboardComponents/MARCard.jsx";
import ClinicalOrdersCard from "./NurseDashboardComponents/ClinicalOrdersCard.jsx";
import { patientRecordService } from "../../services/patientRecordService";
import { profileChangeService } from "../../services/profileChangeService";
import NotificationBell from "../../components/NotificationBell.jsx";

// ── Accent theme (blue) for the Nurse dashboard ──────────────────
const ACCENT = {
  bg: "bg-blue-600",
  bgHover: "hover:bg-blue-700",
  shadow: "shadow-blue-500/20",
  text: "text-blue-500",
  textActive: "text-white",
  activeBg: "bg-blue-600",
  iconBg: "bg-blue-50",
  border: "border-blue-200",
};

// ── Sidebar navigation items ─────────────────────────────────────
const menuItems = [
  { id: "dashboard", label: "Shift Overview", icon: LayoutDashboard },
  { id: "tasks", label: "Clinical Tasks", icon: ClipboardList },
  { id: "patients", label: "All Patients", icon: Users },
  { id: "profile", label: "My Profile", icon: UserCircle },
];

const sectionLabels = {
  dashboard: "Shift Overview",
  tasks: "Clinical Tasks",
  patients: "All Patients",
  profile: "My Profile",
};

// ── Helper: calculate age from DoB ──────────────────────────────
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  const birthDate = new Date(dateOfBirth);
  if (isNaN(birthDate.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  )
    age -= 1;
  return age;
};

// ═════════════════════════════════════════════════════════════════
// NURSE DASHBOARD — Main component
// ═════════════════════════════════════════════════════════════════
export default function NurseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────
  const [section, setSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsList, setPatientsList] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const handleSaveVitals = (updatedVitals) => {
    // Simulate updating patient vitals locally
    const updatedPatient = { ...selectedPatient, ...updatedVitals };
    setSelectedPatient(updatedPatient);
    setPatientsList(pts => pts.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  // ── Load all patients on mount ─────────────────────────────────
  useEffect(() => {
    async function loadPatients() {
      setListLoading(true);
      setLoadError("");
      try {
        const pts = await patientRecordService.getAllPatients();
        const mapped = pts.map((p) => ({
          id: p.id,
          name: p.name,
          firstName: p.firstName || p.name.split(" ")[0] || "",
          lastName: p.lastName || p.name.split(" ").slice(1).join(" ") || "",
          room: p.admittedDate !== "N/A" ? "Admitted" : "Outpatient",
          age: p.age,
          gender: p.gender || "N/A",
          bloodGroup: p.bloodGroup || "N/A",
          diagnosis: "N/A",
          status: p.criticalStatus ? "Critical" : "Stable",
          allergies: p.allergies || "None",
          bloodPressure: p.bloodPressure || "N/A",
          heartRate: p.heartRate,
          temperature: p.temperature,
          oxygenSaturation: p.oxygenSaturation,
          respiratoryRate: p.respiratoryRate,
        }));
        setPatientsList(mapped);
        if (mapped.length > 0 && !selectedPatient) {
          setSelectedPatient(mapped[0]);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
        setLoadError("Failed to load patients. Please try again.");
      } finally {
        setListLoading(false);
      }
    }
    loadPatients();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSectionChange = (nextSection) => {
    setSection(nextSection);
    setIsSidebarOpen(false);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    // If on the "patients" view (list-only), switch to the dashboard to see details
    if (section === "patients") {
      setSection("dashboard");
    }
  };

  const handleToggleCritical = async (patient) => {
    try {
      const newStatus = patient.status !== "Critical";
      await patientRecordService.toggleCriticalStatus(patient.id, newStatus);
      // Update local state
      setPatientsList(prev => prev.map(p =>
        p.id === patient.id ? { ...p, status: newStatus ? "Critical" : "Stable" } : p
      ));
      if (selectedPatient?.id === patient.id) {
        setSelectedPatient(prev => ({ ...prev, status: newStatus ? "Critical" : "Stable" }));
      }
    } catch (err) {
      console.error("Failed to toggle critical status:", err);
      alert("Failed to update patient status. Please try again.");
    }
  };

  const handleSidebarFilter = (filter) => {
    setFilterStatus(filter);
    setSection("dashboard");
    setIsSidebarOpen(false);
  };

  // ── Derived stats ──────────────────────────────────────────────
  const totalPatients = patientsList.length;
  const criticalCount = patientsList.filter(
    (p) => p.status === "Critical"
  ).length;
  const stableCount = totalPatients - criticalCount;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px]
          bg-slate-900 border-r border-slate-800
          transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 ${ACCENT.bg} rounded-lg flex items-center justify-center shadow-lg ${ACCENT.shadow}`}
            >
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Nurse<span className="text-blue-400">Station</span>
            </span>
          </div>
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Navigation
            </p>
            {menuItems.map((item) => {
              const active = section === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                    active
                      ? `${ACCENT.activeBg} text-white shadow-md ${ACCENT.shadow}`
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`}
                  />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Quick Stats in sidebar */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
              Shift Summary
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleSidebarFilter("ALL")}
                style={{ transform: "none" }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors border ${
                  filterStatus === "ALL" ? "bg-blue-600/30 border-blue-400" : "bg-slate-800 hover:bg-slate-700 border-transparent"
                }`}
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300 flex-1 text-left">
                  Total Patients
                </span>
                <span className="text-sm font-bold text-white">
                  {totalPatients}
                </span>
              </button>
              <button
                onClick={() => handleSidebarFilter("CRITICAL")}
                style={{ transform: "none" }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors border ${
                  filterStatus === "CRITICAL" ? "bg-red-600/30 border-red-400" : "bg-slate-800 hover:bg-slate-700 border-transparent"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-300 flex-1 text-left">Critical</span>
                <span className="text-sm font-bold text-red-400">
                  {criticalCount}
                </span>
              </button>
              <button
                onClick={() => handleSidebarFilter("STABLE")}
                style={{ transform: "none" }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors border ${
                  filterStatus === "STABLE" ? "bg-emerald-600/30 border-emerald-400" : "bg-slate-800 hover:bg-slate-700 border-transparent"
                }`}
              >
                <Heart className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300 flex-1 text-left">Stable</span>
                <span className="text-sm font-bold text-emerald-400">
                  {stableCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-full ${ACCENT.iconBg} flex items-center justify-center ${ACCENT.text} font-bold border ${ACCENT.border}`}
            >
              {user?.email?.charAt(0).toUpperCase() || "N"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                  "Nurse"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          {/* Left: mobile menu + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Logo for mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              <div
                className={`w-7 h-7 ${ACCENT.bg} rounded-md flex items-center justify-center`}
              >
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                Nurse<span className="text-blue-600">Station</span>
              </span>
            </div>
            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-900">
                {sectionLabels[section] || section}
              </span>
            </div>
          </div>

          {/* Right: user info + sign out */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div
                className={`w-8 h-8 rounded-full ${ACCENT.iconBg} flex items-center justify-center ${ACCENT.text} font-bold text-sm border ${ACCENT.border}`}
              >
                {user?.email?.charAt(0).toUpperCase() || "N"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.firstName || "Nurse"}
                </p>
                <p className="text-xs text-slate-500 leading-tight">Nurse</p>
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

        {/* Dynamic Content */}
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto">
          {/* ═══ SECTION: Shift Overview (Dashboard) ═══ */}
          {section === "dashboard" && (
            <ShiftOverview
              patientsList={patientsList}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatient}
              listLoading={listLoading}
              loadError={loadError}
              totalPatients={totalPatients}
              criticalCount={criticalCount}
              stableCount={stableCount}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onToggleCritical={handleToggleCritical}
              onSaveVitals={handleSaveVitals}
              onNavigateToPatients={(filter) => {
                setFilterStatus(filter);
                setSection("patients");
              }}
            />
          )}

          {/* ═══ SECTION: Clinical Tasks ═══ */}
          {section === "tasks" && (
            <ClinicalTasksSection
              patientsList={patientsList}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatient}
              listLoading={listLoading}
            />
          )}

          {/* ═══ SECTION: All Patients (full list) ═══ */}
          {section === "patients" && (
            <AllPatientsSection
              patientsList={patientsList}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatient}
              listLoading={listLoading}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          )}

          {/* ═══ SECTION: My Profile ═══ */}
          {section === "profile" && (
            <NurseProfile user={user} />
          )}
        </div>
      </main>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Shift Overview — the main working dashboard
// ═════════════════════════════════════════════════════════════════
function ShiftOverview({
  patientsList,
  selectedPatient,
  onSelectPatient,
  listLoading,
  loadError,
  totalPatients,
  criticalCount,
  stableCount,
  filterStatus,
  setFilterStatus,
  onToggleCritical,
  onSaveVitals,
  onNavigateToPatients,
}) {
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [editedVitals, setEditedVitals] = useState({});
  const [vitalsLastUpdated, setVitalsLastUpdated] = useState("Today, 08:00 AM");
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSaveVitals = () => {
    if (onSaveVitals) onSaveVitals(editedVitals);
    setVitalsLastUpdated(`Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setIsEditingVitals(false);
  };
  const filteredPatients = patientsList.filter(p => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "CRITICAL") return p.status === "Critical";
    if (filterStatus === "STABLE") return p.status !== "Critical";
    return true;
  });

  const filteredSearchPatients = filteredPatients.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── Error banner ── */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
          {loadError}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shift Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here is a quick summary of your assigned patients for this shift.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={totalPatients}
          color="blue"
          isActive={filterStatus === "ALL"}
          onClick={() => onNavigateToPatients("ALL")}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Alerts"
          value={criticalCount}
          color="red"
          isActive={filterStatus === "CRITICAL"}
          onClick={() => onNavigateToPatients("CRITICAL")}
        />
        <StatCard
          icon={Heart}
          label="Stable"
          value={stableCount}
          color="emerald"
          isActive={filterStatus === "STABLE"}
          onClick={() => onNavigateToPatients("STABLE")}
        />
      </div>

      <div className="mt-12 space-y-6">
        {/* ── Full Width Search Bar ── */}
        <div className="relative z-50">
          <div className="relative flex items-center">
             <Search className="w-5 h-5 absolute left-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search and select an assigned patient..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => setIsDropdownOpen(true)}
               className="w-full pl-12 pr-12 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition-all font-medium"
             />
             <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="absolute right-4 p-2 text-slate-400 hover:text-slate-600 focus:outline-none">
               <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
             </button>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-y-auto max-h-[400px] divide-y divide-slate-100">
              {filteredSearchPatients.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No patients found matching your search.</div>
              ) : (
                filteredSearchPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      onSelectPatient(patient);
                      setIsDropdownOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{patient.name}</div>
                      <div className="text-sm text-slate-500 mt-0.5">Room: {patient.room || "N/A"} • ID: {patient.displayId || patient.id}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 ${
                        patient.status === "Critical"
                          ? "bg-red-900 text-red-100 border-red-800"
                          : patient.status === "Needs Attention"
                          ? "bg-amber-400 text-amber-900 border-amber-300"
                          : "bg-emerald-400 text-emerald-900 border-emerald-300"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Selected patient detail ── */}
        <div className="w-full space-y-6">
          {/* Patient Header Banner */}
          {selectedPatient ? (
            <div className={`rounded-3xl shadow-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden transition-colors duration-500 text-white ${
              selectedPatient.status === "Critical" 
                ? "bg-gradient-to-r from-red-600 to-rose-700 shadow-red-200/50" 
                : "bg-gradient-to-r from-blue-600 to-indigo-700"
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              
              <div className="flex-1 flex flex-col gap-4 z-10 w-full text-center sm:text-left">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <h2 className="text-2xl sm:text-3xl font-bold">
                        {selectedPatient.name}
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 ${
                          selectedPatient.status === "Critical"
                            ? "bg-red-900 text-red-100 border-red-800 animate-pulse"
                            : selectedPatient.status === "Needs Attention"
                            ? "bg-amber-400 text-amber-900 border-amber-300"
                            : "bg-emerald-400 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {selectedPatient.status}
                      </span>
                      
                      {/* ── Critical Status Toggle ── */}
                      <button
                        onClick={() => onToggleCritical(selectedPatient)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                          selectedPatient.status === "Critical"
                            ? "bg-white text-red-700 hover:bg-red-50"
                            : "bg-red-500 hover:bg-red-400 text-white border border-red-400"
                        }`}
                        title={selectedPatient.status === "Critical" ? "Mark patient as stable" : "Mark patient as critical"}
                      >
                        {selectedPatient.status === "Critical" ? "✓ Mark Stable" : "⚠ Mark Critical"}
                      </button>
                    </div>
                  </div>
                  <p className="text-blue-100 text-base mb-4 mt-2">
                    {selectedPatient.room} • {selectedPatient.age} yrs • {selectedPatient.gender}
                  </p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2">
                      Blood: <span className="font-semibold">{selectedPatient.bloodGroup}</span>
                    </div>
                  </div>
                </div>
              </div>

            {/* Patient Vitals & Info Panel */}
            <div className="flex-1 lg:flex-none w-full lg:w-[560px] bg-white/10 rounded-2xl p-4 sm:p-5 mt-4 sm:mt-0 relative backdrop-blur-sm border border-white/10 shadow-inner z-10 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-blue-50 text-xs tracking-wide uppercase">Current Vitals</h3>
                    <p className="text-[10px] text-blue-200 mt-0.5">Last updated: {vitalsLastUpdated}</p>
                  </div>
                  {!isEditingVitals ? (
                    <button
                      onClick={() => {
                        setEditedVitals({
                          bloodPressure: selectedPatient.bloodPressure || "",
                          heartRate: selectedPatient.heartRate || "",
                          temperature: selectedPatient.temperature || "",
                          oxygenSaturation: selectedPatient.oxygenSaturation || "",
                          allergies: selectedPatient.allergies || ""
                        });
                        setIsEditingVitals(true);
                      }}
                      className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition font-medium text-white"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingVitals(false)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition text-white">Cancel</button>
                      <button onClick={handleSaveVitals} className="text-xs bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full transition font-bold text-white shadow-lg shadow-emerald-500/20">Save</button>
                    </div>
                  )}
                </div>

                {!isEditingVitals ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4 text-sm">
                    <div><span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-0.5">BP</span><span className="font-semibold text-sm">{selectedPatient.bloodPressure || "N/A"}</span></div>
                    <div><span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-0.5">HR</span><span className="font-semibold text-sm">{selectedPatient.heartRate ? `${selectedPatient.heartRate} bpm` : "N/A"}</span></div>
                    <div><span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-0.5">Temp</span><span className="font-semibold text-sm">{selectedPatient.temperature ? `${selectedPatient.temperature} °C` : "N/A"}</span></div>
                    <div><span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-0.5">O2 Sat</span><span className="font-semibold text-sm">{selectedPatient.oxygenSaturation ? `${selectedPatient.oxygenSaturation}%` : "N/A"}</span></div>
                    <div className="col-span-4"><span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-0.5">Allergies</span><span className="font-semibold text-sm text-white">{selectedPatient.allergies || "None"}</span></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-3 text-sm">
                    <div>
                      <span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-1">BP (mmHg)</span>
                      <input type="text" value={editedVitals.bloodPressure} onChange={e => setEditedVitals({...editedVitals, bloodPressure: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-white/50 text-sm" placeholder="120/80" />
                    </div>
                    <div>
                      <span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-1">HR (bpm)</span>
                      <input type="text" value={editedVitals.heartRate} onChange={e => setEditedVitals({...editedVitals, heartRate: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-white/50 text-sm" placeholder="72" />
                    </div>
                    <div>
                      <span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-1">Temp (°C)</span>
                      <input type="text" value={editedVitals.temperature} onChange={e => setEditedVitals({...editedVitals, temperature: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-white/50 text-sm" placeholder="37.0" />
                    </div>
                    <div>
                      <span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-1">O2 Sat (%)</span>
                      <input type="text" value={editedVitals.oxygenSaturation} onChange={e => setEditedVitals({...editedVitals, oxygenSaturation: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-white/50 text-sm" placeholder="98" />
                    </div>
                    <div className="col-span-4">
                      <span className="text-blue-200/80 text-[10px] uppercase tracking-wider block mb-1">Allergies</span>
                      <input type="text" value={editedVitals.allergies} onChange={e => setEditedVitals({...editedVitals, allergies: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-white/50 text-sm" placeholder="None" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center text-slate-500">
              {listLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading patients...
                </div>
              ) : (
                "Select a patient from the list to view their details."
              )}
            </div>
          )}

          {/* Main Layout: MAR (Full Width) */}
          {selectedPatient && (
            <div className="flex flex-col gap-6 mt-6">
              {/* Full Width MAR Card */}
              <MARCard patient={selectedPatient} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SUB-COMPONENT: All Patients Section — full list view
// ═════════════════════════════════════════════════════════════════
function AllPatientsSection({
  patientsList,
  selectedPatient,
  onSelectPatient,
  listLoading,
  filterStatus,
  setFilterStatus,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = patientsList.filter((p) => {
    if (filterStatus === "CRITICAL" && p.status !== "Critical") return false;
    if (filterStatus === "STABLE" && p.status === "Critical") return false;
    return p.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">All Patients</h2>
        <span className="text-sm text-slate-500">
          {filtered.length} {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""} patients total
        </span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilterStatus("ALL")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === "ALL" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>All</button>
        <button onClick={() => setFilterStatus("CRITICAL")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === "CRITICAL" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>Critical</button>
        <button onClick={() => setFilterStatus("STABLE")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === "STABLE" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>Stable</button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Patient cards grid */}
      {listLoading ? (
        <div className="flex items-center justify-center p-8 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading patients...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No patients found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => {
            const isSelected = selectedPatient?.id === patient.id;
            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-50 border-blue-300 shadow-md shadow-blue-100"
                    : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`font-bold ${
                      isSelected ? "text-blue-900" : "text-slate-800"
                    }`}
                  >
                    {patient.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      patient.status === "Critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Age: {patient.age} • {patient.gender}
                  </p>
                  <p>Blood Type: {patient.bloodGroup}</p>
                  <p className="text-rose-600 font-medium">
                    Allergies: {patient.allergies}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Nurse Profile
// ═════════════════════════════════════════════════════════════════
function NurseProfile({ user }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [myRequests, setMyRequests] = useState([]);
  
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    mobileNumber: user?.mobileNumber || "",
  });

  useEffect(() => {
    profileChangeService.getMyRequests()
      .then(setMyRequests)
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setSaving(true);
    setMsg("");
    try {
      await profileChangeService.submitChange(JSON.stringify(form));
      setMsg("Profile change submitted for management approval.");
      setEditing(false);
      const requests = await profileChangeService.getMyRequests();
      setMyRequests(requests);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to submit change.");
    } finally {
      setSaving(false);
    }
  };

  const pendingRequest = myRequests.find(r => r.status === "PENDING");
  const lastRequest = myRequests[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-black">My Profile</h2>
        {pendingRequest && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" /> Update Pending Approval
          </span>
        )}
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-sm font-medium ${msg.includes("Failed") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 border-2 border-blue-200">
              {user?.email?.charAt(0).toUpperCase() || "N"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Nurse"}
              </h3>
              <p className="text-sm text-slate-500">Registered Nurse</p>
            </div>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              disabled={!!pendingRequest}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
              {editing ? (
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900">{user?.firstName || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
              {editing ? (
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900">{user?.lastName || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
              <p className="text-sm font-medium text-slate-900">{user?.email || "N/A"}</p>
              <p className="text-[10px] text-slate-400">Email cannot be changed.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Mobile Number</label>
              {editing ? (
                <input
                  type="text"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900">{user?.mobileNumber || "N/A"}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
              <p className="text-sm font-medium text-slate-900">NURSE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Stat Card — NO transition-all to prevent rotation
// ═════════════════════════════════════════════════════════════════
function StatCard({ icon: Icon, label, value, color, isActive, onClick }) {
  const colorMap = {
    blue: { icon: "bg-blue-50 text-blue-600", border: "hover:border-blue-300", active: "border-blue-300 bg-blue-50/30" },
    red: { icon: "bg-red-50 text-red-600", border: "hover:border-red-300", active: "border-red-300 bg-red-50/30" },
    emerald: { icon: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-300", active: "border-emerald-300 bg-emerald-50/30" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl border bg-white shadow-md shadow-slate-200/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] cursor-pointer focus:outline-none ${isActive ? c.active + " shadow-lg" : "border-transparent " + c.border}`}
    >
      <div className="py-8 px-5 flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${c.icon} transition-transform group-hover:scale-110 ${isActive ? "scale-110" : ""}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
        </div>
      </div>
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Clinical Tasks Section
// ═════════════════════════════════════════════════════════════════
function ClinicalTasksSection({
  patientsList,
  selectedPatient,
  onSelectPatient,
  listLoading,
}) {
  const [notesByPatient, setNotesByPatient] = useState({});
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedPatient) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " (Current Shift)";
    
    setNotesByPatient(prev => {
      const existing = prev[selectedPatient.id] || [];
      return {
        ...prev,
        [selectedPatient.id]: [{ id: Date.now(), time: timeStr, text: newNote }, ...existing]
      };
    });
    setNewNote("");
    setIsAddingNote(false);
  };

  const currentNotes = selectedPatient ? (notesByPatient[selectedPatient.id] || []) : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start h-[calc(100vh-120px)]">
      {/* Left: Patients list */}
      <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-black flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            Task Assignments
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AssignedPatientsList
            patients={patientsList}
            selectedPatient={selectedPatient}
            onSelect={onSelectPatient}
            loading={listLoading}
          />
        </div>
      </div>

      {/* Right: Selected patient's tasks */}
      <div className="xl:col-span-9 space-y-6 flex flex-col h-full">
        {selectedPatient ? (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {selectedPatient.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Clinical Tasks and Handover Notes
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  selectedPatient.status === "Critical"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : selectedPatient.status === "Needs Attention"
                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {selectedPatient.status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
              <ClinicalOrdersCard patient={selectedPatient} isInline={false} />
              
              {/* Handover & Notes Panel */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-blue-100 flex items-center justify-between">
                  <h3 className="font-bold text-blue-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Handover & Notes
                  </h3>
                  <button 
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-3 py-1 rounded-full uppercase tracking-wider"
                  >
                    {isAddingNote ? "Cancel" : "Add Note"}
                  </button>
                </div>
                <div className="p-5 flex-1 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                  {isAddingNote && (
                    <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex flex-col gap-3 animate-in slide-in-from-top-2">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Type handover note here..."
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
                      />
                      <div className="flex justify-end">
                        <button onClick={handleAddNote} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors">
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {currentNotes.length === 0 ? (
                    <div className="text-sm text-slate-400 text-center py-4">No handover notes yet.</div>
                  ) : (
                    currentNotes.map(note => (
                      <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-600">
                        <p>
                          <strong className="text-slate-800">{note.time}:</strong> {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center text-slate-500 h-full flex flex-col items-center justify-center">
            {listLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading tasks...
              </div>
            ) : (
              "Select a patient from the list to view their clinical tasks."
            )}
          </div>
        )}
      </div>
    </div>
  );
}
