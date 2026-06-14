import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Users, UserCheck, Stethoscope, Calendar, TrendingUp, HeartPulse, Activity } from "lucide-react";

const Stats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    activeNurses: 0,
    totalAppointments: 0,
  });
  const [roleCounts, setRoleCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([adminService.fetchStats(), adminService.fetchRoleCounts()])
      .then(([stats, roles]) => {
        setStatsData(stats);
        setRoleCounts(roles);
      })
      .catch(() => setError("Failed to load statistics"))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { id: 1, label: "Total Users", value: statsData.totalUsers, change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { id: 2, label: "Active Doctors", value: statsData.activeDoctors, change: "+5%", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-100" },
    { id: 3, label: "Active Nurses", value: statsData.activeNurses, change: "+3%", icon: HeartPulse, color: "text-pink-600", bg: "bg-pink-100" },
    { id: 4, label: "Total Appointments", value: statsData.totalAppointments, change: "+18%", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  const [doctorsBySpecialization, setDoctorsBySpecialization] = useState([]);
  const [nursesByDepartment, setNursesByDepartment] = useState([
    { name: "ICU", count: 6, percentage: 21 },
    { name: "Emergency", count: 5, percentage: 18 },
    { name: "General Ward", count: 18, percentage: 61 },
  ]);

  useEffect(() => {
    import("../../../services/axiosClient").then((module) => {
      const api = module.default;
      api.get("/api/doctors").then((res) => {
        const doctors = res.data;
        const total = doctors.length || 1;
        const specCounts = {};
        doctors.forEach((d) => {
          const spec = d.specialization || "General Medicine";
          specCounts[spec] = (specCounts[spec] || 0) + 1;
        });
        const specArr = Object.keys(specCounts).map((spec) => ({
          name: spec,
          count: specCounts[spec],
          percentage: Math.round((specCounts[spec] / total) * 100),
        })).sort((a,b) => b.count - a.count);
        setDoctorsBySpecialization(specArr);
      }).catch(console.error);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            System Statistics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Comprehensive overview of hospital management metrics</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.id} className="border-none shadow-md shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {s.change}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">{s.label}</div>
                <div className="text-3xl font-bold text-slate-900">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && <div className="text-sm text-slate-500">Loading statistics...</div>}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors by Specialization */}
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader className="p-6 pb-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-500" />
              Doctors by Specialization
            </h2>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-5">
              {doctorsBySpecialization.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{item.count} doctors</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 text-right">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nurses by Department */}
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader className="p-6 pb-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-500" />
              Nurses by Department
            </h2>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-5">
              {nursesByDepartment.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{item.count} nurses</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-pink-500 h-full rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 text-right">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Summary & Additional Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-none shadow-md shadow-slate-200/50">
          <CardHeader className="p-6 pb-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              User Role Summary
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {roleCounts.map((item) => (
                <div key={item.role} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{item.role}</div>
                  <div className="text-2xl font-bold text-slate-800">{item.count}</div>
                </div>
              ))}
              {roleCounts.length === 0 && !loading && (
                <div className="col-span-full text-center p-4 text-slate-500 text-sm">No role counts available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-none shadow-md shadow-slate-200/50 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-indigo-100 mb-1">Avg. Consultations/Day</h3>
              <p className="text-3xl font-bold text-white">45</p>
              <p className="text-xs text-indigo-200 mt-2">Across all departments</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md shadow-slate-200/50 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-emerald-100 mb-1">Bed Occupancy Rate</h3>
              <p className="text-3xl font-bold text-white">78%</p>
              <p className="text-xs text-emerald-200 mt-2">Current utilization</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md shadow-slate-200/50 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-amber-100 mb-1">Patient Satisfaction</h3>
              <p className="text-3xl font-bold text-white">4.7/5</p>
              <p className="text-xs text-amber-200 mt-2">Average rating</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;