import React, { useEffect, useState } from "react";
import { managementService } from "../../../services/managementService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  Stethoscope, Save, AlertCircle, CheckCircle2, Pencil, Search, X
} from "lucide-react";

const MgmtDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Edit modal
  const [editDoctor, setEditDoctor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(doctors);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        doctors.filter(
          (d) =>
            d.firstName?.toLowerCase().includes(q) ||
            d.lastName?.toLowerCase().includes(q) ||
            d.specialization?.toLowerCase().includes(q) ||
            d.hospital?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, doctors]);

  const loadDoctors = () => {
    setLoading(true);
    managementService
      .fetchDoctors()
      .then((data) => setDoctors(data))
      .catch(() => setError("Failed to load doctors"))
      .finally(() => setLoading(false));
  };

  const openEdit = (doctor) => {
    setEditDoctor(doctor);
    setEditForm({
      specialization: doctor.specialization || "",
      hospital: doctor.hospital || "",
      department: doctor.department || "",
      consultationFee: doctor.consultationFee || "",
      bio: doctor.bio || "",
      isAvailable: doctor.isAvailable ?? true,
      mobileNumber: doctor.mobileNumber || "",
      licenseNumber: doctor.licenseNumber || "",
    });
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value,
    }));
  };

  const handleSaveEdit = () => {
    if (!editDoctor) return;
    setSaving(true);
    setError("");

    const payload = {
      ...editForm,
      consultationFee: editForm.consultationFee ? parseFloat(editForm.consultationFee) : null,
    };

    managementService
      .updateDoctor(editDoctor.id, payload)
      .then((updated) => {
        setDoctors((prev) => prev.map((d) => (d.id === editDoctor.id ? updated : d)));
        setEditDoctor(null);
        setActionMsg("Doctor profile updated successfully!");
        setTimeout(() => setActionMsg(""), 3000);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to update doctor";
        setError(msg);
      })
      .finally(() => setSaving(false));
  };

  const inputStyles =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow text-slate-800 text-sm";
  const labelStyles = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-emerald-600" />
            Manage Doctors
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update doctor profiles, specializations, fees, and availability
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      {error && !editDoctor && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading doctors...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>{search ? "No doctors match your search." : "No doctors found."}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">License</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hospital</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bio</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0 border border-emerald-200/50">
                          <span className="font-bold text-emerald-700 text-sm">
                            {doc.firstName?.charAt(0)}{doc.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Dr. {doc.firstName} {doc.lastName}</p>
                          <p className="text-xs text-slate-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                        {doc.specialization || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{doc.mobileNumber || "—"}</td>
                    <td className="p-4 text-sm text-slate-600 font-mono">{doc.licenseNumber || "—"}</td>
                    <td className="p-4 text-sm text-slate-600">{doc.hospital || "—"}</td>
                    <td className="p-4 text-sm text-slate-600">{doc.department || "—"}</td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      {doc.consultationFee ? `Rs. ${doc.consultationFee.toLocaleString()}` : "—"}
                    </td>
                    <td className="p-4 text-sm text-slate-500 max-w-[200px] truncate" title={doc.bio || ""}>
                      {doc.bio || "—"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        doc.isAvailable
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${doc.isAvailable ? "bg-green-500" : "bg-slate-400"}`}></span>
                        {doc.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="soft"
                        size="sm"
                        icon={Pencil}
                        onClick={() => openEdit(doc)}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Edit Doctor Modal */}
      <Modal isOpen={!!editDoctor} onClose={() => setEditDoctor(null)} title="Edit Doctor Profile">
        {editDoctor && (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <p className="text-sm font-medium text-emerald-800">
                Editing: <span className="font-bold">Dr. {editDoctor.firstName} {editDoctor.lastName}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Specialization</label>
                <select name="specialization" value={editForm.specialization} onChange={handleEditChange} className={inputStyles}>
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </div>
              <div>
                <label className={labelStyles}>Mobile Number</label>
                <input type="tel" name="mobileNumber" value={editForm.mobileNumber} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>License Number</label>
                <input type="text" name="licenseNumber" value={editForm.licenseNumber} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Hospital</label>
                <input type="text" name="hospital" value={editForm.hospital} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Department</label>
                <input type="text" name="department" value={editForm.department} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Consultation Fee (Rs.)</label>
                <input type="number" name="consultationFee" value={editForm.consultationFee} onChange={handleEditChange} className={inputStyles} min="0" />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyles}>Bio</label>
                <textarea name="bio" value={editForm.bio} onChange={handleEditChange} rows={3} className={inputStyles + " resize-none"} placeholder="Doctor's professional biography..." />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={editForm.isAvailable}
                    onChange={handleEditChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Available for appointments</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setEditDoctor(null)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                isLoading={saving}
                icon={Save}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-500/20"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MgmtDoctorsList;
