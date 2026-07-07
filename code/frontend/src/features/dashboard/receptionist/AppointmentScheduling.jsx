import React, { useState, useEffect } from "react";
import { receptionistService } from "../../../services/receptionistService";
import { Calendar, User, Clock, Trash2, AlertCircle, CheckCircle, List, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  // Calendar state
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  // Form State
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [reason, setReason] = useState("");

  // Status
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appts, docs, pats] = await Promise.all([
        receptionistService.listAppointments(),
        receptionistService.listDoctors(),
        receptionistService.listPatients(),
      ]);
      setAppointments(appts.data || appts.data?.content || []);
      setDoctors(docs.data || []);
      setPatients(pats.data || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load necessary data from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Calendar helpers ---
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const apptsOnDate = (y, m, d) => {
    const pad = (n) => String(n).padStart(2, "0");
    const target = `${y}-${pad(m + 1)}-${pad(d)}`;
    return appointments.filter((a) => a.appointmentDateTime && a.appointmentDateTime.startsWith(target));
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
    setSelectedDate(null);
  };

  const handleDateClick = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${calYear}-${pad(calMonth + 1)}-${pad(d)}`;
    setSelectedDate(dateStr);
    setDate(dateStr);
  };

  const isToday = (d) => {
    const today = new Date();
    return d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  };

  // --- Calendar grid ---
  const renderCalendar = () => {
    const totalDays = daysInMonth(calYear, calMonth);
    const startDay = firstDayOfMonth(calYear, calMonth);
    const cells = [];

    for (let i = 0; i < startDay; i++) cells.push(<div key={`empty-${i}`} />);

    for (let d = 1; d <= totalDays; d++) {
      const appts = apptsOnDate(calYear, calMonth, d);
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isSelected = selectedDate === dateStr;
      cells.push(
        <button
          key={d}
          onClick={() => handleDateClick(d)}
          className={`relative p-2 text-sm rounded-lg transition-colors text-left min-h-[70px] border ${
            isSelected
              ? "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-200"
              : isToday(d)
              ? "bg-indigo-50 border-indigo-200"
              : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
          }`}
        >
          <span className={`font-medium text-xs ${isSelected ? "text-indigo-700" : isToday(d) ? "text-indigo-600" : "text-slate-600"}`}>
            {d}
          </span>
          {appts.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {appts.slice(0, 2).map((a) => {
                const timeStr = a.appointmentDateTime ? new Date(a.appointmentDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <div key={a.id} className="text-[10px] leading-tight px-1 py-0.5 rounded bg-indigo-100 text-indigo-700 truncate">
                    {timeStr} {a.patientName?.split(" ")[0]}
                  </div>
                );
              })}
              {appts.length > 2 && <div className="text-[10px] text-slate-400 pl-1">+{appts.length - 2} more</div>}
            </div>
          )}
        </button>
      );
    }
    return cells;
  };

  // --- Selected date appointments ---
  const selectedDateAppts = selectedDate
    ? appointments.filter((a) => a.appointmentDateTime && a.appointmentDateTime.startsWith(selectedDate))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!patientId || !doctorId || !date || !time) {
      setError("Please fill out all required fields.");
      return;
    }

    const appointmentDateTime = `${date}T${time}:00`;
    const payload = {
      patientId: parseInt(patientId, 10),
      doctorId: parseInt(doctorId, 10),
      appointmentDateTime,
      durationMinutes: parseInt(duration, 10),
      reason: reason.trim() || null,
    };

    setSaving(true);
    try {
      await receptionistService.createAppointment(payload);
      setSuccess("Appointment successfully scheduled.");
      setPatientId(""); setDoctorId(""); setDate(""); setTime(""); setDuration("30"); setReason("");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to schedule appointment.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setError(""); setSuccess("");
    try {
      await receptionistService.cancelAppointment(id);
      setSuccess("Appointment cancelled successfully.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Appointment Scheduling</h1>
        </div>
        <div className="flex bg-slate-200 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 text-green-700 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Schedule Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg shadow-sm p-5 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Schedule a Visit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" required>
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" required>
                <option value="">-- Select Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.firstName} {d.lastName} {d.specialization ? `(${d.specialization})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time <span className="text-red-500">*</span></label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">1 Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                rows="3" placeholder="Brief description for the visit..." />
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
              {saving ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </form>
        </div>

        {/* Main Content - List or Calendar */}
        <div className="lg:col-span-2">
          {viewMode === "list" ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                <h2 className="text-lg font-semibold text-slate-800">Upcoming Appointments</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {appointments.length} Total
                </span>
              </div>
              <div className="p-0 overflow-x-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-slate-500">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No appointments scheduled yet.</div>
                ) : (
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">Date & Time</th>
                        <th className="px-6 py-3">Patient</th>
                        <th className="px-6 py-3">Doctor</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {appointments.map((appt) => {
                        const dateObj = new Date(appt.appointmentDateTime);
                        const isInvalidDate = isNaN(dateObj.getTime());
                        const dateDisplay = isInvalidDate ? "Invalid Date" : dateObj.toLocaleDateString();
                        const timeDisplay = isInvalidDate ? "" : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-slate-900 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" /> {dateDisplay}
                              </div>
                              <div className="text-slate-500 text-xs flex items-center gap-1.5 mt-1">
                                <Clock className="w-4 h-4 text-slate-400" /> {timeDisplay}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                <User className="w-4 h-4 text-slate-400" />
                                {appt.patientName || `ID: ${appt.patientId}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-700">Dr. {appt.doctorName || appt.doctorId}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                appt.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                appt.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                appt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {appt.status || "SCHEDULED"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {appt.status === 'SCHEDULED' && (
                                <button onClick={() => handleCancel(appt.id)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-end gap-1 w-full"
                                  title="Cancel Appointment">
                                  <Trash2 className="w-4 h-4" /> Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* Calendar View */
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h2 className="text-lg font-bold text-slate-800">
                    {MONTHS[calMonth]} {calYear}
                  </h2>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </div>

              {selectedDate && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Appointments on {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </h3>
                  </div>
                  <div className="p-0">
                    {selectedDateAppts.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">No appointments on this date.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {selectedDateAppts.map((a) => {
                          const t = a.appointmentDateTime ? new Date(a.appointmentDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                          return (
                            <div key={a.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{t} — {a.patientName}</p>
                                  <p className="text-xs text-slate-500">Dr. {a.doctorName} {a.reason ? `| ${a.reason}` : ""}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                                  a.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  a.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-red-50 text-red-700 border-red-200'}`}>
                                  {a.status}
                                </span>
                                {a.status === 'SCHEDULED' && (
                                  <button onClick={() => handleCancel(a.id)} className="text-red-500 hover:text-red-700 p-1" title="Cancel">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduling;
