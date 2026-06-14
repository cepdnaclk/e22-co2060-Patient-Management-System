import React, { useEffect, useMemo, useState } from "react";
import { adminPatientsService } from "../../../services/adminPatientsService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { 
  Users, Search, UserPlus, Edit2, Trash2, X, AlertCircle, Save, Calendar, Phone, Activity
} from "lucide-react";

const emptyPatient = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  gender: "",
  dateOfBirth: "",
  bloodType: "",
  address: "",
  primaryDoctor: "",
  admissionStatus: "",
};

const PatientsManager = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState(emptyPatient);

  const loadPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminPatientsService.listPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
          "Failed to load patients. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return patients;

    return patients.filter((patient) => {
      const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`
        .trim()
        .toLowerCase();
      const email = (patient.email || "").toLowerCase();
      const id = `${patient.id ?? ""}`.toLowerCase();
      const patientId = (patient.patientId || "").toLowerCase();
      return (
        fullName.includes(trimmed) ||
        email.includes(trimmed) ||
        id.includes(trimmed) ||
        patientId.includes(trimmed)
      );
    });
  }, [patients, query]);

  const openCreateModal = () => {
    setEditingPatient(null);
    setForm(emptyPatient);
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      mobileNumber: patient.mobileNumber || "",
      gender: patient.gender || "",
      dateOfBirth: patient.dateOfBirth || "",
      bloodType: patient.bloodType || "",
      address: patient.address || "",
      primaryDoctor: patient.primaryDoctor || "",
      admissionStatus: patient.admissionStatus || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingPatient?.id) {
        const updated = await adminPatientsService.updatePatient(
          editingPatient.id,
          form,
        );
        setPatients((prev) =>
          prev.map((item) => (item.id === editingPatient.id ? updated : item)),
        );
      } else {
        const created = await adminPatientsService.createPatient(form);
        setPatients((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          "Unable to save patient. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm("Delete this patient record?")) return;

    setError("");
    try {
      await adminPatientsService.deletePatient(patientId);
      setPatients((prev) => prev.filter((item) => item.id !== patientId));
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          "Failed to delete patient. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Patient Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage patient profiles, contact details, and admission status.
          </p>
        </div>
        <Button onClick={openCreateModal} icon={UserPlus}>
          Add Patient
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, or ID..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
        />
      </div>

      {/* Table */}
      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No patients found matching your search.</p>
            </div>
          ) : (
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {patient.firstName?.charAt(0) || ""}{patient.lastName?.charAt(0) || ""}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {patient.patientId || `ID: ${patient.id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="space-y-1">
                        <div className="truncate max-w-[200px]" title={patient.email}>{patient.email || "N/A"}</div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5" />
                          {patient.mobileNumber || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex gap-2 mb-1">
                        {patient.bloodType && <Badge variant="red" className="text-[10px] py-0">{patient.bloodType}</Badge>}
                        {patient.gender && <Badge variant="slate" className="text-[10px] py-0">{patient.gender}</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        DOB: {patient.dateOfBirth || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <Badge variant={patient.admissionStatus === "Admitted" ? "blue" : patient.admissionStatus === "Discharged" ? "emerald" : "slate"}>
                        {patient.admissionStatus || "Unknown"}
                      </Badge>
                      {patient.primaryDoctor && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Dr. {patient.primaryDoctor}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Edit2}
                          onClick={() => openEditModal(patient)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(patient.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingPatient ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <UserPlus className="w-5 h-5 text-indigo-500" />}
                {editingPatient ? "Edit Patient Record" : "Register New Patient"}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">First Name <span className="text-red-500">*</span></label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                    <input
                      name="mobileNumber"
                      value={form.mobileNumber}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Blood Type</label>
                    <select
                      name="bloodType"
                      value={form.bloodType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Admission Status</label>
                    <select
                      name="admissionStatus"
                      value={form.admissionStatus}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Registered">Registered</option>
                      <option value="Admitted">Admitted</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Primary Doctor</label>
                  <input
                    name="primaryDoctor"
                    value={form.primaryDoctor}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Dr. Smith"
                  />
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" form="patient-form" disabled={saving} icon={Save} className="w-full sm:w-auto">
                {saving ? "Saving..." : editingPatient ? "Save Changes" : "Register Patient"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManager;
