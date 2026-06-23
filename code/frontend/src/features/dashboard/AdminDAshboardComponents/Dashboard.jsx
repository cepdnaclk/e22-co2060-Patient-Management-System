import React, { useState, useEffect } from "react";
import api from "../../../services/axiosClient";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { 
  Users, UserPlus, Stethoscope, Activity, 
  Settings, Download, RefreshCw, ChevronRight, ShieldCheck 
} from "lucide-react";

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    activeNurses: 0,
    totalAppointments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/v1/admin/stats");
        setStatsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load dashboard statistics");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { id: 1, label: "Total Users", value: statsData.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, label: "Active Doctors", value: statsData.activeDoctors, icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
    { id: 3, label: "Active Nurses", value: statsData.activeNurses, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
    { id: 4, label: "Appointments", value: statsData.totalAppointments, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const recentActivities = [
    { id: 1, action: "New Doctor Added", timestamp: "2 hours ago", status: "Success" },
    { id: 2, action: "New Nurse Added", timestamp: "4 hours ago", status: "Success" },
    { id: 3, action: "System Backup", timestamp: "1 day ago", status: "Completed" },
    { id: 4, action: "User Report Generated", timestamp: "2 days ago", status: "Completed" },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-500 mt-1">High-level metrics and recent administrative activities.</p>
        </div>
        <Button variant="secondary" icon={RefreshCw}>Refresh Data</Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className="border-none shadow-md shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{loading ? "..." : s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Section */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md shadow-slate-200/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Audit Logs</h2>
              <Button variant="ghost" size="sm" className="text-indigo-600 font-medium">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{activity.action}</p>
                        <p className="text-xs text-slate-500 font-medium">{activity.timestamp}</p>
                      </div>
                    </div>
                    <Badge variant={activity.status === "Success" ? "success" : "blue"}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-md shadow-slate-200/50 h-full">
            <CardHeader title="Administrative Tasks" />
            <CardContent className="p-6 space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-indigo-700">Generate Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-emerald-700">User Analytics</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-amber-700">Permissions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
              </button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;