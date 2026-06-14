import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Calendar as CalendarIcon, Clock, User, Plus, Search } from "lucide-react";
import api from "../../../services/axiosClient";

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/appointments");
      let data = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data?.items)) data = res.data.items;
      else if (Array.isArray(res.data?.content)) data = res.data.content;
      
      setAppointments(data);
    } catch (err) {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appt) => {
    const q = searchQuery.toLowerCase();
    const pName = (appt.patientName || "").toLowerCase();
    const dName = (appt.doctorName || "").toLowerCase();
    return pName.includes(q) || dName.includes(q);
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-600" />
            Appointment Scheduling
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and schedule patient appointments with doctors.</p>
        </div>
        <Button icon={Plus} className="bg-indigo-600 hover:bg-indigo-700">
          New Appointment
        </Button>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient or doctor name..."
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-sm"
        />
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">{error}</div>}

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading schedule...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No appointments found.</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => {
                  const dateStr = appt.appointmentDateTime ? new Date(appt.appointmentDateTime).toLocaleString() : "TBD";
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          {dateStr}
                        </div>
                        {appt.durationMinutes && <div className="text-xs text-slate-500 mt-1 ml-6">{appt.durationMinutes} mins</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{appt.patientName || `Patient #${appt.patientId}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className="font-medium">Dr. {appt.doctorName || `Doctor #${appt.doctorId}`}</span>
                        <div className="text-xs text-slate-500">{appt.doctorSpecialization}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={appt.status === 'SCHEDULED' ? 'blue' : appt.status === 'COMPLETED' ? 'emerald' : appt.status === 'CANCELLED' ? 'red' : 'slate'}>
                          {appt.status || "SCHEDULED"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="mr-2">Reschedule</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentScheduling;
