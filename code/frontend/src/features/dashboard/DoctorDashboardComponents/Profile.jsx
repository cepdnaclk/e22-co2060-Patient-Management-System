import React, { useState, useEffect } from "react";
import { profileChangeService } from "../../../services/profileChangeService";
import { useAuth } from "../../auth/AuthContext";
import { Pencil, X, Save, Clock, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
  }).format(amount);
};

const statusBadge = (status) => {
  switch (status) {
    case "PENDING": return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> Pending</span>;
    case "APPROVED": return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
    case "REJECTED": return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="w-3 h-3" /> Rejected</span>;
    default: return null;
  }
};

const Profile = ({ doctor, loading, error }) => {
  const { isNurse } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [myRequests, setMyRequests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    profileChangeService.getMyRequests()
      .then(setMyRequests)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (doctor) {
      setForm({
        firstName: doctor.firstName || "",
        lastName: doctor.lastName || "",
        email: doctor.email || "",
        mobileNumber: doctor.mobileNumber || "",
        specialization: doctor.specialization || "",
        hospital: doctor.hospital || "",
        department: doctor.department || "",
        consultationFee: doctor.consultationFee ?? "",
        bio: doctor.bio || "",
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMsg("");
    try {
      await profileChangeService.submitChange(JSON.stringify(form));
      setMsg("Profile change submitted for management approval.");
      setEditing(false);
      const requests = await profileChangeService.getMyRequests();
      setMyRequests(requests);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to submit change.");
    } finally {
      setSaving(false);
    }
  };

  const pendingRequest = myRequests.find((r) => r.status === "PENDING");
  const lastRequest = myRequests[0];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow p-6 text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">{error}</div>
      </div>
    );
  }

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isNurse ? "" : "Dr. "}{doctor?.firstName || ""} {doctor?.lastName || ""}
          </h1>
          <p className="text-slate-500 mt-1">{doctor?.specialization || (isNurse ? "Nurse" : "Doctor")}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-xl font-medium hover:bg-violet-100 transition-colors">
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {msg && (
        <div className={`flex items-center gap-2 p-4 rounded-xl border font-medium animate-in fade-in ${
          msg.includes("submitted") || msg.includes("success")
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {msg.includes("submitted") || msg.includes("success") ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {msg}
        </div>
      )}

      {pendingRequest && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800">
            You have a <strong>pending</strong> profile change request submitted on{" "}
            {new Date(pendingRequest.createdAt).toLocaleDateString()}.
            Wait for management approval before submitting another.
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editing ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
            <button onClick={() => setEditing(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mobile Number</label>
              <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className={inputClass} />
            </div>
            {!isNurse && (
              <>
                <div>
                  <label className={labelClass}>Specialization</label>
                  <input name="specialization" value={form.specialization} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Hospital</label>
                  <input name="hospital" value={form.hospital} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Consultation Fee ($)</label>
                  <input name="consultationFee" type="number" step="0.01" value={form.consultationFee} onChange={handleChange} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea name="bio" rows="3" value={form.bio} onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all resize-y" />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button onClick={() => setEditing(false)}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving || !!pendingRequest}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Contact & Professional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
              <h2 className="text-lg font-bold text-slate-800">Contact</h2>
              <p className="text-sm text-slate-600"><span className="font-medium">Email:</span> {doctor?.email || "N/A"}</p>
              <p className="text-sm text-slate-600"><span className="font-medium">Mobile:</span> {doctor?.mobileNumber || "N/A"}</p>
              <p className="text-sm text-slate-600">
                <span className="font-medium">Availability:</span>{" "}
                <span className={doctor?.isAvailable ? "text-emerald-600" : "text-red-500"}>
                  {doctor?.isAvailable ? "Available" : "Unavailable"}
                </span>
              </p>
            </div>
            {!isNurse && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
                <h2 className="text-lg font-bold text-slate-800">Professional</h2>
                <p className="text-sm text-slate-600"><span className="font-medium">License:</span> {doctor?.licenseNumber || "N/A"}</p>
                <p className="text-sm text-slate-600"><span className="font-medium">Hospital:</span> {doctor?.hospital || "N/A"}</p>
                <p className="text-sm text-slate-600"><span className="font-medium">Department:</span> {doctor?.department || "N/A"}</p>
                <p className="text-sm text-slate-600"><span className="font-medium">Fee:</span> {formatCurrency(doctor?.consultationFee)}</p>
              </div>
            )}
          </div>

          {!isNurse && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Bio</h2>
              <p className="text-sm text-slate-600">{doctor?.bio || "No bio available."}</p>
            </div>
          )}

          {/* Change Requests */}
          {myRequests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-500" /> Profile Change History
              </h2>
              <div className="space-y-3">
                {myRequests.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="text-sm">
                      <span className="font-medium text-slate-800">
                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {req.reviewNotes && <p className="text-slate-500 mt-0.5">Note: {req.reviewNotes}</p>}
                    </div>
                    {statusBadge(req.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
