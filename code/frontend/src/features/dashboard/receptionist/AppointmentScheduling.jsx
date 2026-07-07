import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Calendar as CalendarIcon, Clock, User, Plus, Search, X, AlertCircle, CheckCircle2, Stethoscope, Trash2 } from "lucide-react";
import { receptionistService } from "../../../services/receptionistService";

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDateTime: "",
    durationMinutes: 30,
    reason: "",
  });

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await receptionistService.listAppointments();
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

  const openCreateModal = async () => {
    setError("");
    setSuccess("");
    setForm({ patientId: "", doctorId: "", appointmentDateTime: "", durationMinutes: 30, reason: "" });
    try {
      const [docRes, patRes] = await Promise.all([
        receptionistService.listDoctors(),
        receptionistService.listPatients(),
      ]);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      setPatients(Array.isArray(patRes.data) ? patRes.data : []);
      setShowModal(true);
    } catch (err) {
      setError("Failed to load doctors or patients list");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await receptionistService.createAppointment({
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDateTime: form.appointmentDateTime,
        durationMinutes: parseInt(form.durationMinutes),
        reason: form.reason,
      });
      setSuccess("Appointment created successfully!");
      setShowModal(false);
      loadAppointments();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create appointment");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await receptionistService.cancelAppointment(id);
      loadAppointments();
    } catch (err) {
      setError("Failed to cancel appointment");
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const q = searchQuery.toLowerCase();
    const pName = (appt.patientName || "").toLowerCase();
    const dName = (appt.doctorName || "").toLowerCase();
    return pName.includes(q) || dName.includes(q);
  });

  const inputStyles = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow text-slate-800 text-sm";
  const labelStyles = "block text-sm font-semibold text-slate-700 mb-1.5";

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
        <Button onClick={openCreateModal} icon={Plus} className="bg-indigo-600 hover:bg-indigo-700">
          New Appointment
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

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
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">Dr. {appt.doctorName || `Doctor #${appt.doctorId}`}</span>
                        </div>
                        <div className="text-xs text-slate-500 ml-6">{appt.doctorSpecialization}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={appt.status === 'SCHEDULED' ? 'blue' : appt.status === 'COMPLETED' ? 'emerald' : appt.status === 'CANCELLED' ? 'red' : 'slate'}>
                          {appt.status || "SCHEDULED"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {appt.status === 'SCHEDULED' && (
                          <Button onClick={() => handleCancel(appt.id)} variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Appointment</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className={labelStyles}>Patient <span className="text-red-500">*</span></label>
                <select name="patientId" value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})} required className={inputStyles}>
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyles}>Doctor <span className="text-red-500">*</span></label>
                <select name="doctorId" value={form.doctorId} onChange={(e) => setForm({...form, doctorId: e.target.value})} required className={inputStyles}>
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName} - {d.specialization}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyles}>Date & Time <span className="text-red-500">*</span></label>
                <input type="datetime-local" name="appointmentDateTime" value={form.appointmentDateTime} onChange={(e) => setForm({...form, appointmentDateTime: e.target.value})} required className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Duration (minutes)</label>
                <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={(e) => setForm({...form, durationMinutes: e.target.value})} min={15} max={120} step={15} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Reason for Visit</label>
                <textarea name="reason" value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} rows={2} className={`${inputStyles} resize-none`} placeholder="Optional reason for the appointment" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  {saving ? "Creating..." : "Create Appointment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduling;
