import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Table, TableHead, TableRow, TableHeader, TableCell } from "../../../components/ui/Table.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import {
  Users, Calendar, AlertTriangle, FileText, ArrowRight,
  Plus, ChevronRight, ChevronLeft, X, Phone, HeartPulse,
  Clock, User, Activity,
} from "lucide-react";
import AppointmentCalendar from "./AppointmentCalendar.jsx";
import PatientVitalsCard from "../NurseDashboardComponents/PatientVitalsCard.jsx";
import MARCard from "../NurseDashboardComponents/MARCard.jsx";

/* ─── helpers ─────────────────────────────────────────────────── */
const formatTime = (dateTime) => {
  if (!dateTime) return "--:--";
  return new Date(dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateTime) => {
  if (!dateTime) return "--";
  return new Date(dateTime).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

/* ─── Inline Calendar Panel ────────────────────────────────────── */
function AppointmentCalendarPanel({ allAppointments, onClose }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const selectedDateAppointments = selectedDate
    ? allAppointments.filter((a) => {
        if (!a.appointmentDateTime) return false;
        const d = new Date(a.appointmentDateTime);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : [];

  return (
    <div className="mt-4 rounded-2xl border border-violet-100 bg-white shadow-lg shadow-violet-100/40 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-semibold text-slate-800">Appointment Calendar</span>
          <Badge variant="info" className="text-[11px] px-2 bg-violet-100 text-violet-700">
            {allAppointments.length} total
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Calendar */}
        <div className="lg:col-span-2 p-4">
          <AppointmentCalendar
            appointments={allAppointments}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Day detail */}
        <div className="p-4 flex flex-col gap-3">
          {selectedDate ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-800">
                  {selectedDate.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
                </span>
                <Badge variant={selectedDateAppointments.length ? "info" : "gray"} className="text-[11px]">
                  {selectedDateAppointments.length} appt{selectedDateAppointments.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {selectedDateAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Calendar className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No appointments</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                  {selectedDateAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex flex-col gap-1.5 hover:border-violet-200 hover:bg-violet-50/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-bold text-violet-700">
                            {apt.patientName?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{apt.patientName || "Unknown"}</span>
                        </div>
                        <Badge
                          variant={
                            apt.status === "COMPLETED" ? "success" :
                            apt.status === "CANCELLED" ? "gray" : "info"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {apt.status || "SCHEDULED"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pl-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(apt.appointmentDateTime)}</span>
                        {apt.reason && <span className="truncate">{apt.reason}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 gap-3">
              <Calendar className="w-10 h-10 opacity-20" />
              <p className="text-sm text-center">Click a date on the calendar<br />to see appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Critical Patients Panel ───────────────────────────── */
function CriticalPatientsPanel({ criticalPatients, onClose, onNavigate }) {
  return (
    <div className="mt-4 rounded-2xl border border-red-100 bg-white shadow-lg shadow-red-100/40 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-slate-800">Critical Patients</span>
          <Badge variant="danger" className="text-[11px] px-2 bg-red-100 text-red-700">
            {criticalPatients.length} critical
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {criticalPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
          <HeartPulse className="w-10 h-10 opacity-20" />
          <p className="text-sm">No critical patients at this time</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {criticalPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => onNavigate?.("records", patient)}
              className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex flex-col gap-3 hover:border-red-400 hover:bg-red-50 hover:shadow-md hover:shadow-red-100 hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              {/* Name + avatar row */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-red-200 group-hover:scale-110 transition-transform">
                  {(patient.firstName || patient.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {patient.firstName && patient.lastName
                      ? `${patient.firstName} ${patient.lastName}`
                      : patient.name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {patient.email || "No email"}
                  </p>
                </div>
                <span className="flex-shrink-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                </span>
              </div>

              {/* Info rows */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                {patient.mobileNumber && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    {patient.mobileNumber}
                  </span>
                )}
                {patient.bloodGroup && (
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-red-400 shrink-0" />
                    Blood: <strong className="text-red-600">{patient.bloodGroup}</strong>
                  </span>
                )}
                {patient.dateOfBirth && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    DOB: {formatDate(patient.dateOfBirth)}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-[11px] font-semibold text-red-600 group-hover:text-red-700 flex items-center gap-1 transition-colors">
                  Open Account <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] text-red-400 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                  CRITICAL
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {criticalPatients.length > 0 && (
        <div className="px-4 pb-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => onNavigate?.("records")}
          >
            Go to Patients <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function DoctorOverview({
  stats, appointments, allAppointments = [], criticalPatients = [], allPatients = [],
  loading, error, onUpdateStatus, onNavigate, isNurse,
}) {
  const [expandedPanel, setExpandedPanel] = useState(null); // "calendar" | "critical" | null
  const [selectedNursePatient, setSelectedNursePatient] = useState(null);

  // Initialize selected patient for nurses
  React.useEffect(() => {
    if (isNurse && !selectedNursePatient && allPatients?.length > 0) {
      setSelectedNursePatient(allPatients[0]);
    }
  }, [isNurse, allPatients, selectedNursePatient]);

  const togglePanel = (panel) =>
    setExpandedPanel((prev) => (prev === panel ? null : panel));

  const statCards = [
    {
      id: 1, label: "Total Patients",      value: stats?.patients ?? 0,         icon: Users,         color: "blue",    panel: null,       section: "records",
    },
    {
      id: 2, label: "Appointments Today",  value: stats?.appointmentsToday ?? 0, icon: Calendar,      color: "emerald", panel: "calendar", section: null,
    },
    {
      id: 3, label: "Active Appointments", value: stats?.activeAppointments ?? 0,icon: Calendar,      color: "blue",    panel: "calendar", section: null,
    },
    {
      id: 4, label: "Critical Alerts",     value: stats?.criticalAlerts ?? 0,    icon: AlertTriangle, color: "red",     panel: "critical", section: null,
    },
    {
      id: 5, label: "Medical Records",     value: stats?.records ?? 0,           icon: FileText,      color: "purple",  panel: null,       section: "records",
    },
  ];

  const colorMap = {
    blue:    { icon: "bg-blue-50 text-blue-600",    border: "hover:border-blue-300",    active: "border-blue-300 bg-blue-50/30" },
    emerald: { icon: "bg-emerald-50 text-emerald-600", border: "hover:border-emerald-300", active: "border-emerald-300 bg-emerald-50/30" },
    red:     { icon: "bg-red-50 text-red-600",      border: "hover:border-red-300",     active: "border-red-300 bg-red-50/30" },
    purple:  { icon: "bg-purple-50 text-purple-600",border: "hover:border-purple-300",  active: "border-purple-300 bg-purple-50/30" },
  };

  const filteredStatCards = isNurse 
    ? statCards.filter(c => c.id !== 2 && c.id !== 3)
    : statCards;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening today.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const cm = colorMap[card.color];
          const isActive = card.panel && expandedPanel === card.panel;

          const handleClick = () => {
            if (card.panel) togglePanel(card.panel);
            else if (card.section) onNavigate?.(card.section);
          };

          return (
            <button
              key={card.id}
              onClick={handleClick}
              className={`group w-full text-left rounded-2xl border bg-white shadow-md shadow-slate-200/50
                transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] cursor-pointer
                ${isActive ? cm.active + " shadow-lg" : "border-slate-100 " + cm.border}`}
            >
              <div className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${cm.icon} transition-transform group-hover:scale-110 ${isActive ? "scale-110" : ""}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {loading ? (
                      <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </h3>
                </div>
                {card.panel ? (
                  <ChevronRight
                    className={`w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all shrink-0 ${
                      isActive ? "rotate-90 text-slate-500" : ""
                    }`}
                  />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Expanded: Appointment Calendar ── */}
      {expandedPanel === "calendar" && (
        <AppointmentCalendarPanel
          allAppointments={allAppointments}
          onClose={() => setExpandedPanel(null)}
        />
      )}

      {/* ── Expanded: Critical Patients ── */}
      {expandedPanel === "critical" && (
        <CriticalPatientsPanel
          criticalPatients={criticalPatients}
          onClose={() => setExpandedPanel(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* ── Today's Table + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        {!isNurse ? (
        <>
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md shadow-slate-200/50 flex flex-col">
            <CardHeader
              title="Today's Appointments"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => togglePanel("calendar")}
                >
                  {expandedPanel === "calendar" ? "Hide Calendar" : "Full Calendar"}{" "}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              }
            />
            <div className="p-0 flex-1 overflow-x-auto">
              <Table className="border-0 shadow-none rounded-none">
                <TableHead>
                  <TableRow>
                    <TableHeader>Time</TableHeader>
                    <TableHeader>Patient</TableHeader>
                    <TableHeader>Reason</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right">Action</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Calendar className="w-8 h-8 mb-2 opacity-50" />
                          <p>Loading appointments...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : appointments?.length ? (
                    appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium text-slate-900">
                          {formatTime(apt.appointmentDateTime)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              {apt.patientName ? apt.patientName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span className="font-medium text-slate-700">{apt.patientName || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 max-w-[200px] truncate">
                          {apt.reason || "General Consultation"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={apt.status === "COMPLETED" ? "success" : apt.status === "CANCELLED" ? "gray" : "info"}>
                            {apt.status || "SCHEDULED"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {apt.status !== "COMPLETED" && apt.status !== "CANCELLED" ? (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => onUpdateStatus(apt.id, "COMPLETED")} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                Complete
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => onUpdateStatus(apt.id, "CANCELLED")} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">--</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Calendar className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-base font-medium text-slate-600">No appointments</p>
                          <p className="text-sm mt-1">You have no appointments scheduled for today.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
        {/* Quick Actions */}
        <div>
          <Card className="h-full border-none shadow-md shadow-slate-200/50">
            <CardHeader title="Quick Actions" />
            <CardContent className="p-5 flex flex-col gap-3">
              <Button
                variant="soft"
                className="w-full justify-start py-3"
                icon={Plus}
                onClick={() => onNavigate?.("records")}
              >
                New Prescription
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start py-3"
                icon={FileText}
                onClick={() => onNavigate?.("records")}
              >
                Add Clinical Note
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start py-3"
                icon={Users}
                onClick={() => onNavigate?.("records")}
              >
                View Patients
              </Button>
              {stats?.criticalAlerts > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start py-3 text-red-600 border-red-200 hover:bg-red-50"
                  icon={AlertTriangle}
                  onClick={() => togglePanel("critical")}
                >
                  Critical Alerts ({stats.criticalAlerts})
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        </>
        ) : (
          <div className="lg:col-span-3 flex flex-col gap-4">
             <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                   <User className="w-5 h-5 text-violet-500" />
                   Select Patient:
                </span>
                <select 
                  className="border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 min-w-[200px]"
                  value={selectedNursePatient?.id || ""}
                  onChange={(e) => {
                    const p = allPatients.find(cp => cp.id === parseInt(e.target.value));
                    if (p) setSelectedNursePatient(p);
                  }}
                >
                  {allPatients.length === 0 && <option value="">No patients available</option>}
                  {allPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.name || "Unknown")}
                    </option>
                  ))}
                </select>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PatientVitalsCard patient={selectedNursePatient} />
                <MARCard patient={selectedNursePatient} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
