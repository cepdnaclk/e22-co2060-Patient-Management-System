import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope, LogOut, Menu, X, Users, Activity,
  FileText, Bell, AlertTriangle, Heart, Thermometer,
  Loader2, UserCircle, LayoutDashboard, ClipboardList
} from "lucide-react";
import AssignedPatientsList from "./NurseDashboardComponents/AssignedPatientsList.jsx";
import PatientVitalsCard from "./NurseDashboardComponents/PatientVitalsCard.jsx";
import MARCard from "./NurseDashboardComponents/MARCard.jsx";
import ClinicalOrdersCard from "./NurseDashboardComponents/ClinicalOrdersCard.jsx";
import { patientRecordService } from "../../services/patientRecordService";
import NotificationBell from "../../components/NotificationBell.jsx";

// ── Accent theme (teal) for the Nurse dashboard ──────────────────
const ACCENT = {
  bg: "bg-teal-500",
  bgHover: "hover:bg-teal-600",
  shadow: "shadow-teal-500/20",
  text: "text-teal-400",
  textActive: "text-white",
  activeBg: "bg-teal-500",
  iconBg: "bg-teal-500/20",
  border: "border-teal-500/30",
};

// ── Sidebar navigation items ─────────────────────────────────────
const menuItems = [
  { id: "dashboard", label: "Shift Overview", icon: LayoutDashboard },
  { id: "patients", label: "All Patients", icon: Users },
  { id: "profile", label: "My Profile", icon: UserCircle },
];

const sectionLabels = {
  dashboard: "Shift Overview",
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
              Nurse<span className="text-teal-400">Station</span>
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
                  filterStatus === "ALL" ? "bg-teal-600/30 border-teal-400" : "bg-slate-800 hover:bg-slate-700 border-transparent"
                }`}
              >
                <Users className="w-4 h-4 text-teal-400" />
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
                Nurse<span className="text-teal-600">Station</span>
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
            />
          )}

          {/* ═══ SECTION: All Patients (full list) ═══ */}
          {section === "patients" && (
            <AllPatientsSection
              patientsList={patientsList}
              selectedPatient={selectedPatient}
              onSelectPatient={handleSelectPatient}
              listLoading={listLoading}
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
}) {
  const filteredPatients = patientsList.filter(p => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "CRITICAL") return p.status === "Critical";
    if (filterStatus === "STABLE") return p.status !== "Critical";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Error banner ── */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
          {loadError}
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={totalPatients}
          color="teal"
          isActive={filterStatus === "ALL"}
          onClick={() => setFilterStatus("ALL")}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Alerts"
          value={criticalCount}
          color="red"
          isActive={filterStatus === "CRITICAL"}
          onClick={() => setFilterStatus("CRITICAL")}
        />
        <StatCard
          icon={Heart}
          label="Stable"
          value={stableCount}
          color="emerald"
          isActive={filterStatus === "STABLE"}
          onClick={() => setFilterStatus("STABLE")}
        />
      </div>

      {/* ── Two-column layout: Patient list + Detail panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Patients list */}
        <div className="xl:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col xl:sticky xl:top-24 h-[600px] xl:h-[calc(100vh-160px)]">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Assigned Patients
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AssignedPatientsList
              patients={filteredPatients}
              selectedPatient={selectedPatient}
              onSelect={onSelectPatient}
              loading={listLoading}
            />
          </div>
        </div>

        {/* Right: Selected patient detail */}
        <div className="xl:col-span-9 space-y-6">
          {/* Patient Header Banner */}
          {selectedPatient ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedPatient.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      selectedPatient.status === "Critical"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : selectedPatient.status === "Needs Attention"
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {selectedPatient.status}
                  </span>
                  {/* ── Critical Status Toggle ── */}
                  <button
                    onClick={() => onToggleCritical(selectedPatient)}
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border-2 transition-colors ${
                      selectedPatient.status === "Critical"
                        ? "border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        : "border-red-400 text-red-700 bg-red-50 hover:bg-red-100"
                    }`}
                    title={selectedPatient.status === "Critical" ? "Mark patient as stable" : "Mark patient as critical"}
                  >
                    {selectedPatient.status === "Critical" ? "✓ Mark Stable" : "⚠ Mark Critical"}
                  </button>
                </div>
                <div className="text-slate-500 text-sm flex items-center gap-4 flex-wrap">
                  <span className="font-medium text-slate-700">
                    {selectedPatient.room}
                  </span>
                  <span>•</span>
                  <span>{selectedPatient.age} yrs</span>
                  <span>•</span>
                  <span>{selectedPatient.gender}</span>
                  <span>•</span>
                  <span>
                    Blood:{" "}
                    <strong className="text-slate-700">
                      {selectedPatient.bloodGroup}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Allergies Inline Alert */}
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 md:min-w-[200px]">
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">
                  Allergies
                </p>
                <p className="text-sm text-rose-900 font-medium">
                  {selectedPatient.allergies}
                </p>
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

          {/* Main Grid: Vitals, Clinical Orders, MAR, Notes */}
          {selectedPatient && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Vitals + Clinical Orders */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <PatientVitalsCard patient={selectedPatient} />
                <ClinicalOrdersCard patient={selectedPatient} />
              </div>

              {/* Right Column: MAR & Notes */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <MARCard patient={selectedPatient} />

                {/* Handover & Notes Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Handover & Notes
                    </h3>
                    <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                      Add Note
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                    <p>
                      <strong>08:00 AM (Previous Shift):</strong> Patient had a
                      restless night. Complained of mild pain in lower back.
                      Administered PRN medication at 03:00 AM with good effect.
                    </p>
                  </div>
                </div>
              </div>
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
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = patientsList.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">All Patients</h2>
        <span className="text-sm text-slate-500">
          {patientsList.length} patients total
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
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
                    ? "bg-teal-50 border-teal-300 shadow-md shadow-teal-100"
                    : "bg-white border-slate-200 hover:border-teal-200 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className={`font-bold ${
                      isSelected ? "text-teal-900" : "text-slate-800"
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
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-2xl font-bold text-teal-700 border-2 border-teal-200">
            {user?.email?.charAt(0).toUpperCase() || "N"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {`${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                "Nurse"}
            </h3>
            <p className="text-sm text-slate-500">Registered Nurse</p>
          </div>
        </div>
        <div className="space-y-4">
          <ProfileRow label="Email" value={user?.email || "N/A"} />
          <ProfileRow label="Role" value="NURSE" />
          <ProfileRow label="Mobile" value={user?.mobileNumber || "N/A"} />
          <ProfileRow
            label="Account Status"
            value={user?.isActive ? "Active" : "Inactive"}
          />
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
    teal: {
      bg: "bg-teal-50 border-teal-100",
      activeBg: "bg-teal-100 border-teal-400 shadow-md shadow-teal-200/50",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    red: {
      bg: "bg-red-50 border-red-100",
      activeBg: "bg-red-100 border-red-400 shadow-md shadow-red-200/50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    emerald: {
      bg: "bg-emerald-50 border-emerald-100",
      activeBg: "bg-emerald-100 border-emerald-400 shadow-md shadow-emerald-200/50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  };
  const c = colorMap[color] || colorMap.teal;

  return (
    <button
      onClick={onClick}
      style={{ transform: "none" }}
      className={`text-left rounded-2xl p-5 border-2 shadow-sm cursor-pointer focus:outline-none ${isActive ? c.activeBg : c.bg}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center shadow-sm`}
        >
          <Icon className={`w-5 h-5 ${c.iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900">{value}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
        </div>
      </div>
    </button>
  );
}
