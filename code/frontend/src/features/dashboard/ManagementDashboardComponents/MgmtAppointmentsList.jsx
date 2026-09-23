import React, { useEffect, useMemo, useState } from "react";
import { managementService } from "../../../services/managementService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Search, X, CalendarCheck, Clock, UserCircle, Stethoscope, FileText, AlertCircle } from "lucide-react";

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "SCHEDULED": return "blue";
    case "COMPLETED": return "emerald";
    case "CANCELLED": return "red";
    case "NO_SHOW": return "amber";
    default: return "slate";
  }
};

const MgmtAppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = () => {
    managementService
      .fetchAllAppointments()
      .then((data) => setAppointments(data))
      .catch(() => setError("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return appointments;
    const q = search.toLowerCase();
    return appointments.filter(
      (a) =>
        a.patientName?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
    );
  }, [search, appointments]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-amber-600" />
            All Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View all appointments across the system
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading appointments...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>{search ? "No appointments match your search." : "No appointments found."}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">{a.patientName}</p>
                          <p className="text-xs text-slate-500">{a.patientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="font-medium text-slate-800">{a.doctorName}</p>
                          <p className="text-xs text-slate-500">{a.doctorSpecialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock className="w-4 h-4 text-blue-400" />
                        {formatDateTime(a.appointmentDateTime)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 ml-6">{a.durationMinutes} mins</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600 max-w-xs">
                        <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="truncate">{a.reason || "—"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(a.status)} className="text-xs px-2 py-0.5">
                        {a.status?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MgmtAppointmentsList;
