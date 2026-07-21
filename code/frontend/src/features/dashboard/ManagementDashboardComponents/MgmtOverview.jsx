import React, { useEffect, useState } from "react";
import { managementService } from "../../../services/managementService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import {
  Users, Stethoscope, HeartPulse, CalendarCheck, TrendingUp, Shield
} from "lucide-react";

const MgmtOverview = () => {
  const [stats, setStats] = useState(null);
  const [roleCounts, setRoleCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      managementService.fetchStats(),
      managementService.fetchRoleCounts(),
    ])
      .then(([statsData, roleData]) => {
        setStats(statsData);
        setRoleCounts(roleData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Doctors",
      value: stats?.activeDoctors ?? 0,
      icon: Stethoscope,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Nurses",
      value: stats?.activeNurses ?? 0,
      icon: HeartPulse,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Appointments",
      value: stats?.totalAppointments ?? 0,
      icon: CalendarCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const getRoleIcon = (role) => {
    switch (role) {
      case "DOCTOR": return "🩺";
      case "NURSE": return "💉";
      case "PATIENT": return "🏥";
      case "PHARMACIST": return "💊";
      case "RECEPTIONIST": return "📋";
      case "MANAGEMENT": return "👔";
      case "LAB_TECHNICIAN": return "🔬";
      default: return "👤";
    }
  };

  // Filter out admin roles since management can't manage them
  const managedRoles = roleCounts.filter(
    (r) => r.role !== "ADMIN" && r.role !== "SUPER_ADMIN"
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-7 h-7 text-violet-600" />
          Management Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor system metrics and manage staff across your organization
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-none shadow-md shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="text-xl font-bold text-slate-900">{card.value.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Distribution */}
      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            Staff Distribution (Your Scope)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {managedRoles.map((item) => (
              <div
                key={item.role}
                className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
              >
                <div className="text-2xl mb-1">{getRoleIcon(item.role)}</div>
                <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {item.role?.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-violet-900 mb-1">Management Access Level</h3>
            <p className="text-sm text-violet-700/80">
              You can view and edit all user and doctor details <strong>except</strong> Administrator accounts. 
              Admin and Super Admin profiles are protected and can only be managed by other Admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MgmtOverview;
