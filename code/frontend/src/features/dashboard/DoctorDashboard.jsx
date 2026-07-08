import { useState, useEffect } from "react";
import DoctorOverview from "./doctor/DoctorOverview.jsx";
import Pharmacy from "./DoctorDashboardComponents/Pharmacy.jsx";
import ReportAndAnalytics from "./DoctorDashboardComponents/ReportAndAnalytics.jsx";
import Profile from "./DoctorDashboardComponents/Profile.jsx";
import PatientProfile from "./doctor/PatientProfile.jsx";
import LabReports from "./DoctorDashboardComponents/Labreport.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";
import { doctorDashboardService } from "../../services/doctorDashboardService";
import {
  LayoutDashboard, UserCircle, Users, FlaskConical,
  Menu, X, Stethoscope, Bell, Sun, Moon, LogOut, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ACCENT = {
  bg: "bg-violet-500",
  bgHover: "hover:bg-violet-600",
  shadow: "shadow-violet-500/20",
  text: "text-violet-400",
  textActive: "text-white",
  activeBg: "bg-violet-500",
  iconBg: "bg-violet-500/20",
  border: "border-violet-500/30",
  ringFocus: "focus:ring-violet-500",
  badge: "bg-violet-100 text-violet-700",
};

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile",   label: "My Profile",  icon: UserCircle },
  { id: "records",   label: "Patients",    icon: Users },
  { id: "labreports",label: "Lab Reports", icon: FlaskConical },
];

const sectionLabels = {
  dashboard: "Dashboard",
  profile: "My Profile",
  records: "Patients",
  labreports: "Lab Reports",
};

const DoctorDashboard = () => {
  const { user, logout, isNurse } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [customMenus, setCustomMenus] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    patients: 0,
    appointmentsToday: 0,
    criticalAlerts: 0,
    records: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [criticalPatients, setCriticalPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [section, setSection] = useState("dashboard");
  const [targetPatient, setTargetPatient] = useState(null);

  const handleSectionChange = (nextSection) => {
    setSection(nextSection);
    setIsSidebarOpen(false);
  };

  const handleNavigateToPatient = (nextSection, patient) => {
    setTargetPatient(patient || null);
    setSection(nextSection);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const addMenu = (e) => {
    e.preventDefault();
    const label = newMenuLabel.trim();
    if (!label) return;
    setCustomMenus((c) => [...c, label]);
    setNewMenuLabel("");
    setIsModalOpen(false);
  };

  const loadDashboardData = async () => {
    if (!user?.id) {
      setLoadingDashboard(false);
      setDashboardError("Unable to identify logged in doctor.");
      return;
    }
    setLoadingDashboard(true);
    setDashboardError("");
    try {
      const data = await doctorDashboardService.getDashboardData(user.id);
      setDoctor(data.doctor);
      setStats(data.stats);
      setAppointments(data.appointments);
      setAllAppointments(data.allAppointments || []);
      setCriticalPatients(data.criticalPatients || []);
      setAllPatients(data.allPatients || []);
    } catch (error) {
      setDashboardError(error.response?.data?.message || "Failed to load doctor dashboard data.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await doctorDashboardService.updateAppointmentStatus(id, status);
      loadDashboardData();
    } catch (err) {
      console.error("Failed to update appointment", err);
      alert("Failed to update appointment status: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

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
            <div className={`w-8 h-8 ${ACCENT.bg} rounded-lg flex items-center justify-center shadow-lg ${ACCENT.shadow}`}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              {isNurse ? "Nurse" : "Doctor"}<span className="text-violet-400">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full ${ACCENT.iconBg} flex items-center justify-center ${ACCENT.text} font-bold border ${ACCENT.border}`}>
              {user?.email?.charAt(0).toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {doctor?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || (isNurse ? "Nurse" : "Doctor")}
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
              <div className={`w-7 h-7 ${ACCENT.bg} rounded-md flex items-center justify-center`}>
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                {isNurse ? "Nurse" : "Doctor"}<span className="text-violet-600">Hub</span>
              </span>
            </div>
            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-900">{sectionLabels[section] || section}</span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className={`w-8 h-8 rounded-full ${ACCENT.iconBg} flex items-center justify-center ${ACCENT.text} font-bold text-sm border ${ACCENT.border}`}>
                {user?.email?.charAt(0).toUpperCase() || "D"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{doctor?.fullName || user?.firstName || "Doctor"}</p>
                <p className="text-xs text-slate-500 leading-tight">{isNurse ? "Nurse" : "Doctor"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {section === "dashboard" && (
            <DoctorOverview
              stats={stats}
              appointments={appointments}
              allAppointments={allAppointments}
              criticalPatients={criticalPatients}
              allPatients={allPatients}
              loading={loadingDashboard}
              error={dashboardError}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onNavigate={handleNavigateToPatient}
              isNurse={isNurse}
            />
          )}
          {section === "reportsandanalytics" && <ReportAndAnalytics />}
          {section === "profile" && (
            <Profile
              doctor={doctor}
              loading={loadingDashboard}
              error={dashboardError}
            />
          )}
          {section === "records" && <PatientProfile onUpdate={loadDashboardData} initialPatient={targetPatient} />}
          {section === "labreports" && <LabReports />}
        </div>
      </main>

      {/* Create menu modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setIsModalOpen(false)}
          />
          <form
            onSubmit={addMenu}
            className="relative bg-white rounded-2xl p-6 w-full max-w-md z-10 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-3">Create Menu</h3>
            <input
              value={newMenuLabel}
              onChange={(e) => setNewMenuLabel(e.target.value)}
              placeholder="Menu label"
              className="w-full border border-slate-200 p-2.5 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
