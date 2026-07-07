import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  Users,
  CalendarCheck,
  Clock,
  CalendarRange,
  Trash2,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  User
} from "lucide-react";
import { receptionistService } from "../../../services/receptionistService";

const ReceptionistOverview = ({ setActiveSection }) => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  // Live clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Detailed appointment view modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Live Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [patientsRes, appointmentsRes, doctorsRes] = await Promise.allSettled([
        receptionistService.listPatients(),
        receptionistService.listAppointments(),
        receptionistService.listDoctors()
      ]);

      let loadFailed = true;

      if (patientsRes.status === "fulfilled") {
        setPatients(Array.isArray(patientsRes.value.data) ? patientsRes.value.data : []);
        loadFailed = false;
      } else {
        console.error("Error fetching patients:", patientsRes.reason);
      }

      if (appointmentsRes.status === "fulfilled") {
        const appts = appointmentsRes.value.data;
        let aList = [];
        if (Array.isArray(appts)) aList = appts;
        else if (Array.isArray(appts?.items)) aList = appts.items;
        else if (Array.isArray(appts?.content)) aList = appts.content;
        setAppointments(aList);
        loadFailed = false;
      } else {
        console.error("Error fetching appointments:", appointmentsRes.reason);
      }

      if (doctorsRes.status === "fulfilled") {
        setDoctors(Array.isArray(doctorsRes.value.data) ? doctorsRes.value.data : []);
        loadFailed = false;
      } else {
        console.error("Error fetching doctors:", doctorsRes.reason);
      }

      if (loadFailed) {
        setError("Failed to load dashboard data. Please make sure the backend server is running and database is accessible.");
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("An unexpected error occurred while loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check if a date string represents today's local date
  const isToday = (dateTimeStr) => {
    if (!dateTimeStr) return false;
    const apptDate = new Date(dateTimeStr);
    const today = new Date();
    return (
      apptDate.getDate() === today.getDate() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getFullYear() === today.getFullYear()
    );
  };

  // Derived stats
  const patientsCount = patients.length;
  const appointmentsCount = appointments.length;
  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => isToday(a.appointmentDateTime));
  }, [appointments]);
  const todayCount = todayAppointments.length;
  const doctorsCount = doctors.length;

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setCancelError("");
    setCancelSuccess("");
    setCancelling(true);
    try {
      await receptionistService.cancelAppointment(id);
      setCancelSuccess("Appointment cancelled successfully!");
      
      // Update local state instead of full reload to prevent modal flashing
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment(prev => ({ ...prev, status: "CANCELLED" }));
      }
      setTimeout(() => setCancelSuccess(""), 4000);
    } catch (err) {
      setCancelError("Failed to cancel appointment. Please try again.");
      setTimeout(() => setCancelError(""), 4000);
    } finally {
      setCancelling(false);
    }
  };

  // Card items configurations
  const statsConfig = [
    {
      id: "patients",
      label: "Total Patients",
      value: patientsCount,
      icon: Users,
      color: "text-sky-600",
      bg: "bg-sky-100",
      targetSection: "register"
    },
    {
      id: "appointments",
      label: "Total Appointments",
      value: appointmentsCount,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      targetSection: "appointments"
    },
    {
      id: "today",
      label: "Today's Appointments",
      value: todayCount,
      icon: CalendarRange,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      targetSection: "appointments"
    },
    {
      id: "doctors",
      label: "Total Doctors",
      value: doctorsCount,
      icon: Stethoscope,
      color: "text-amber-600",
      bg: "bg-amber-100",
      targetSection: "appointments"
    }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      {/* Header section with live clock by the side */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Quick summary of today's hospital operations.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm text-slate-700">
          <Clock className="w-5 h-5 text-sky-600 animate-pulse" />
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-xs text-slate-500 font-semibold tracking-wider">
              {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Global alert notifications */}
      {cancelSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in duration-300">
          <p className="text-sm">{cancelSuccess}</p>
        </div>
      )}
      {cancelError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{cancelError}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards Grid - Navigates to corresponding sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((s) => (
          <Card
            key={s.id}
            onClick={() => setActiveSection && setActiveSection(s.targetSection)}
            className="border border-slate-100 shadow-md shadow-slate-200/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:border-slate-200"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">
                  {loading ? "..." : s.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Registrations Card */}
        <Card className="border-none shadow-md shadow-slate-200/50 overflow-hidden">
          <CardHeader className="p-6 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                Recent Registrations
              </h2>
              <p className="text-[11px] text-slate-400">Newly registered patient accounts</p>
            </div>

          </CardHeader>
          <CardContent className="p-0">
            {patients.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm">No recent registrations.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {patients.slice(-5).reverse().map((p) => (
                  <div key={p.id} className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs">
                        {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-slate-400 truncate">Account: {p.email || <span className="text-slate-300 italic">No email</span>}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {p.patientId || `ID: ${p.id}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments Card */}
        <Card className="border-none shadow-md shadow-slate-200/50 overflow-hidden">
          <CardHeader className="p-6 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-500" />
                Upcoming Appointments
              </h2>
              <p className="text-[11px] text-slate-400">Brief overview of scheduled appointments (Click to view details)</p>
            </div>

          </CardHeader>
          <CardContent className="p-0">
            {appointments.filter(a => a.status === 'SCHEDULED').length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <CalendarCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm">No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments
                  .filter((a) => a.status === "SCHEDULED" && a.appointmentDateTime && new Date(a.appointmentDateTime) > new Date())
                  .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime))
                  .slice(0, 5)
                  .map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)}
                      className="px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                            {a.patientName || `Patient #${a.patientId}`}
                          </p>
                          <p className="text-xs text-slate-400">Dr. {a.doctorName || `Doctor #${a.doctorId}`}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {a.appointmentDateTime ? new Date(a.appointmentDateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "TBD"}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-1">
                          {a.appointmentDateTime ? new Date(a.appointmentDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ""}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={selectedAppointment !== null}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
        maxWidth="max-w-md"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            
            {/* Main Info */}
            <div className="flex items-start justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
                <h3 className="text-base font-bold text-slate-800">{selectedAppointment.patientName}</h3>
                <p className="text-xs text-slate-500">ID: {selectedAppointment.patientId}</p>
              </div>
              <Badge 
                variant={
                  selectedAppointment.status === 'SCHEDULED' ? 'info' : 
                  selectedAppointment.status === 'COMPLETED' ? 'success' : 
                  selectedAppointment.status === 'CANCELLED' ? 'error' : 'neutral'
                }
                className="text-[10px] px-2 py-0.5 font-bold"
              >
                {selectedAppointment.status || "SCHEDULED"}
              </Badge>
            </div>

            {/* Grid details */}
            <div className="space-y-4">
              
              {/* Doctor */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Assigned Doctor</p>
                  <p className="text-sm font-semibold text-slate-800">Dr. {selectedAppointment.doctorName}</p>
                  <p className="text-xs text-slate-500">{selectedAppointment.doctorSpecialization}</p>
                </div>
              </div>

              {/* Time & Duration */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Date & Time</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedAppointment.appointmentDateTime 
                      ? new Date(selectedAppointment.appointmentDateTime).toLocaleString(undefined, {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                      : "TBD"}
                  </p>
                  {selectedAppointment.durationMinutes && (
                    <p className="text-xs text-slate-500 mt-0.5">Duration: {selectedAppointment.durationMinutes} minutes</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400">Reason for Visit</p>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                    {selectedAppointment.reason || <span className="italic text-slate-400">No reason specified.</span>}
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              {selectedAppointment.status === "SCHEDULED" && (
                <Button
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  variant="secondary"
                  disabled={cancelling}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Appointment
                </Button>
              )}
              <Button
                onClick={() => setSelectedAppointment(null)}
                variant="secondary"
                className="w-full text-slate-600 border-slate-200"
              >
                Close
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default ReceptionistOverview;
