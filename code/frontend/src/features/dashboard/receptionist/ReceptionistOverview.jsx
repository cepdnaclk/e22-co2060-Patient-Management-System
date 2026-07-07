import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Users, CalendarCheck, Clock, CalendarRange, ArrowUpRight } from "lucide-react";
import { receptionistService } from "../../../services/receptionistService";

const ReceptionistOverview = () => {
  const [patientsCount, setPatientsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          receptionistService.listPatients(),
          receptionistService.listAppointments()
        ]);

        const pts = Array.isArray(patientsRes.data) ? patientsRes.data : [];
        setPatientsCount(pts.length);
        setRecentPatients(pts.slice(-5).reverse());

        const appts = appointmentsRes.data;
        let aList = [];
        if (Array.isArray(appts)) aList = appts;
        else if (Array.isArray(appts?.items)) aList = appts.items;
        else if (Array.isArray(appts?.content)) aList = appts.content;
        setAppointmentsCount(aList.length);

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const todayAppts = aList.filter((a) => a.appointmentDateTime && a.appointmentDateTime.slice(0, 10) === todayStr);
        setTodayCount(todayAppts.length);

        const upcoming = aList
          .filter((a) => a.status === "SCHEDULED" && a.appointmentDateTime && new Date(a.appointmentDateTime) > today)
          .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
          .slice(0, 5);
        setUpcomingAppts(upcoming);
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
    { label: "Total Appointments", value: appointmentsCount, icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Today's Appointments", value: todayCount, icon: CalendarRange, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Today's Date", value: new Date().toLocaleDateString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
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
          </CardHeader>
          <CardContent className="p-0">
            {recentPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p>No recent registrations.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPatients.map((p) => (
                  <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                      {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-500 truncate">{p.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader className="p-6 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Upcoming Appointments</h2>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingAppts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CalendarCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p>No upcoming appointments.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppts.map((a) => (
                  <div key={a.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.patientName}</p>
                      <p className="text-xs text-slate-500">Dr. {a.doctorName} — {a.appointmentDateTime ? new Date(a.appointmentDateTime).toLocaleString() : "TBD"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistOverview;
