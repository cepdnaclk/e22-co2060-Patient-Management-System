import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Users, CalendarCheck, Clock, FileText, ArrowUpRight } from "lucide-react";
import { adminPatientsService } from "../../../services/adminPatientsService";
import api from "../../../services/axiosClient";

const ReceptionistOverview = () => {
  const [patientsCount, setPatientsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          adminPatientsService.listPatients(),
          api.get("/api/appointments")
        ]);
        
        setPatientsCount(Array.isArray(patientsRes) ? patientsRes.length : 0);
        
        const appts = appointmentsRes.data;
        let aCount = 0;
        if (Array.isArray(appts)) aCount = appts.length;
        else if (Array.isArray(appts?.items)) aCount = appts.items.length;
        else if (Array.isArray(appts?.content)) aCount = appts.content.length;
        setAppointmentsCount(aCount);
        
      } catch (err) {
        console.error("Error fetching overview stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Patients", value: patientsCount, icon: Users, color: "text-sky-600", bg: "bg-sky-100" },
    { label: "Today's Appointments", value: appointmentsCount, icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Pending Walk-ins", value: "12", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Unpaid Invoices", value: "5", icon: FileText, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Quick summary of today's hospital operations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-md shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">{s.label}</div>
                <div className="text-2xl font-bold text-slate-900">
                  {loading ? "..." : s.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader className="p-6 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Registrations</h2>
            <button className="text-sm font-medium text-sky-600 flex items-center gap-1 hover:text-sky-700">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p>No recent registrations found.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader className="p-6 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Upcoming Appointments</h2>
            <button className="text-sm font-medium text-emerald-600 flex items-center gap-1 hover:text-emerald-700">
              View Schedule <ArrowUpRight className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 text-center text-slate-500">
              <CalendarCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p>No upcoming appointments found for today.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistOverview;
