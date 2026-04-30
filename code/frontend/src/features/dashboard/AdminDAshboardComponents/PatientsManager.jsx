import { useEffect, useMemo, useState } from "react";
import { adminPatientsService } from "../../../services/adminPatientsService";

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
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Patient Records</h1>
          <p className="text-sm text-slate-600">
            Manage patient profiles, contact details, and admission status.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Add Patient
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, or ID"
          className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading patients...</div>
        ) : (
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Primary Doctor</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {patient.patientId || `ID: ${patient.id}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {patient.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {patient.mobileNumber || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {patient.dateOfBirth || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {patient.admissionStatus || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {patient.primaryDoctor || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(patient)}
                        className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(patient.id)}
                        className="px-3 py-1 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredPatients.length && !loading && (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingPatient ? "Edit Patient" : "Add Patient"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-slate-600">
                First Name
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-sm text-slate-600">
                Last Name
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-sm text-slate-600">
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-600">
                Mobile
                <input
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-600">
                Gender
                <input
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-600">
                Date of Birth
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-600">
                Blood Type
                <input
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-slate-600">
                Admission Status
                <input
                  name="admissionStatus"
                  value={form.admissionStatus}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="text-sm text-slate-600 block mt-4">
              Address
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-slate-600 block mt-4">
              Primary Doctor
              <input
                name="primaryDoctor"
                value={form.primaryDoctor}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-md border border-slate-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60"
              >
                {saving
                  ? editingPatient
                    ? "Saving..."
                    : "Creating..."
                  : editingPatient
                    ? "Save Changes"
                    : "Create Patient"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientsManager;
