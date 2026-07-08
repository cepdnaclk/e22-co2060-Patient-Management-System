import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";
import {
  LayoutDashboard, Users, Stethoscope, HeartPulse, UserPlus, FileText,
  Menu, X, Shield, Sun, Moon, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MgmtOverview from "./ManagementDashboardComponents/MgmtOverview";
import MgmtUsersList from "./ManagementDashboardComponents/MgmtUsersList";
import MgmtDoctorsList from "./ManagementDashboardComponents/MgmtDoctorsList";
import MgmtProfileApprovals from "./ManagementDashboardComponents/MgmtProfileApprovals";
import AddUser from "./AdminDAshboardComponents/AddUser";

const sectionLabels = {
  overview: "Overview",
  doctors: "Manage Doctors",
  nurses: "Manage Nurses",
  patients: "Manage Patients",
  approvals: "Profile Approvals",
  addUser: "Add Staff",
};

const ManagementDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [section, setSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "doctors", label: "Manage Doctors", icon: Stethoscope },
    { id: "nurses", label: "Manage Nurses", icon: HeartPulse },
    { id: "patients", label: "Manage Patients", icon: Users },
    { id: "approvals", label: "Profile Approvals", icon: FileText },
    { id: "addUser", label: "Add Staff", icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-slate-900 border-r border-slate-800
        transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Mgmt<span className="text-violet-400">Panel</span></span>
          </div>
          <div className="flex items-center gap-1">
            <button className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Management</p>
            {menuItems.map((item) => {
              const active = section === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                    active
                      ? "bg-violet-500 text-white shadow-md shadow-violet-500/20"
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
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold border border-violet-500/30">
              {user?.email?.charAt(0).toUpperCase() || "M"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Management</p>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-violet-600 rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">Mgmt<span className="text-violet-600">Panel</span></span>
            </div>
            <div className="hidden lg:block">
              <span className="font-semibold text-slate-900 text-sm">{sectionLabels[section] || section}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || "M"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">Management</p>
                <p className="text-xs text-slate-500 leading-tight">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-red-100 ml-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {section === "overview" && <MgmtOverview />}
          {section === "doctors" && <MgmtDoctorsList />}
          {section === "nurses" && <MgmtUsersList roleFilter="NURSE" />}
          {section === "patients" && <MgmtUsersList roleFilter="PATIENT" />}
          {section === "approvals" && <MgmtProfileApprovals />}
          {section === "addUser" && <AddUser />}
        </div>
      </main>
    </div>
  );
};

export default ManagementDashboard;
