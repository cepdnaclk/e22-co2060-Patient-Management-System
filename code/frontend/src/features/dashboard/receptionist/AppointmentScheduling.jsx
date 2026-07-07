import React, { useState, useEffect } from "react";
import { receptionistService } from "../../../services/receptionistService";
import { Calendar, User, Clock, Trash2, AlertCircle, CheckCircle } from "lucide-react";

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!patientId || !doctorId || !date || !time) {
      setError("Please fill out all required fields.");
      return;
    }

    // Backend expects 'yyyy-MM-ddTHH:mm:ss'
    const appointmentDateTime = `${date}T${time}:00`;

    const payload = {
      patientId: parseInt(patientId, 10),
      doctorId: parseInt(doctorId, 10),
      appointmentDateTime: appointmentDateTime,
      durationMinutes: parseInt(duration, 10),
      reason: reason.trim() || null,
    };

    setSaving(true);
    try {
      await receptionistService.createAppointment(payload);
      setSuccess("Appointment successfully scheduled.");
      // Reset form
      setPatientId("");
      setDoctorId("");
      setDate("");
      setTime("");
      setDuration("30");
      setReason("");
      
      // Reload list
      await loadData();
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError(err?.response?.data?.message || err.message || "Failed to schedule appointment.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setError("");
    setSuccess("");
    try {
      await receptionistService.cancelAppointment(id);
      setSuccess("Appointment cancelled successfully.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel appointment.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <Calendar className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-slate-800">Appointment Scheduling</h1>
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
        
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg shadow-sm p-5 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Schedule a Visit</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
              >
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">1 Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason / Notes
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                rows="3"
                placeholder="Brief description for the visit..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {saving ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm">
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
                        <td className="px-6 py-4 text-slate-700">
                          Dr. {appt.doctorName || appt.doctorId}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                            ${appt.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              appt.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                              appt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-slate-50 text-slate-700 border-slate-200'}`}
                          >
                            {appt.status || "SCHEDULED"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {appt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleCancel(appt.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-end gap-1 w-full"
                              title="Cancel Appointment"
                            >
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

      </div>
    </div>
  );
};

export default AppointmentScheduling;
