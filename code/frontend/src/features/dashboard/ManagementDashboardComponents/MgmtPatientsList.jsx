import React, { useEffect, useMemo, useState } from "react";
import { managementService } from "../../../services/managementService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  Users, Mail, Phone, AlertCircle, Pencil, Eye, Search, X,
  Calendar, Activity, UserCog, Pill, AlertTriangle, Ambulance, Hash
} from "lucide-react";

const getAdmissionStatusColor = (status) => {
  switch (status) {
    case "ADMITTED": return "emerald";
    case "DISCHARGED": return "slate";
    case "WAITING": return "amber";
    case "ICU": return "red";
    default: return "slate";
  }
};

const getBloodTypeColor = (type) => {
  if (!type) return "slate";
  const upper = type.toUpperCase();
  if (upper.includes("POS") || upper.includes("+")) return "emerald";
  if (upper.includes("NEG") || upper.includes("-")) return "red";
  return "blue";
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs font-semibold text-slate-500 w-36 shrink-0 uppercase tracking-wider">{label}</span>
    <span className="text-sm text-slate-800">{value || "—"}</span>
  </div>
);

const SectionHeader = (props) => {
  const Icon = props.icon;
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 first:pt-0">
      <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-emerald-700" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{props.title}</h3>
    </div>
  );
};

const MgmtPatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailPatient, setDetailPatient] = useState(null);

  const loadPatients = () => {
    managementService
      .fetchPatients()
      .then((data) => setPatients(data))
      .catch(() => setError("Failed to load patients"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(q) ||
        p.lastName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.mobileNumber?.toLowerCase().includes(q) ||
        p.patientId?.toLowerCase().includes(q)
    );
  }, [search, patients]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { return dateStr; }
  };

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
            <Users className="w-7 h-7 text-emerald-600" />
            Manage Patients
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage patient profiles, vitals, admissions, and medical records
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading patients...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>{search ? "No patients match your search." : "No patients found."}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Type</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admission</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Doctor</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0 border border-emerald-200/50">
                          <span className="font-bold text-emerald-700 text-sm">
                            {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-400">{p.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-medium">
                        {p.patientId || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[160px]">{p.email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {p.mobileNumber || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {p.bloodType ? (
                        <Badge variant={getBloodTypeColor(p.bloodType)} className="text-xs px-2 py-0.5">
                          {p.bloodType}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Badge variant={getAdmissionStatusColor(p.admissionStatus)} className="text-xs px-2 py-0.5">
                          {p.admissionStatus || "—"}
                        </Badge>
                        {p.admissionDate && (
                          <p className="text-xs text-slate-400">{formatDate(p.admissionDate)}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {p.primaryDoctor || "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="soft"
                          size="sm"
                          icon={Eye}
                          onClick={() => setDetailPatient(p)}
                          className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          View
                        </Button>
                        <Button
                          variant="soft"
                          size="sm"
                          icon={Pencil}
                          onClick={() => {}}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          Edit
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

      {/* Patient Detail Modal */}
      <Modal isOpen={!!detailPatient} onClose={() => setDetailPatient(null)} title="Patient Details">
        {detailPatient && (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            <SectionHeader icon={UserCog} title="Personal Information" />
            <div className="pl-8">
              <DetailRow label="First Name" value={detailPatient.firstName} />
              <DetailRow label="Last Name" value={detailPatient.lastName} />
              <DetailRow label="Email" value={detailPatient.email} />
              <DetailRow label="Mobile" value={detailPatient.mobileNumber} />
              <DetailRow label="Date of Birth" value={formatDate(detailPatient.dateOfBirth)} />
              <DetailRow label="Gender" value={detailPatient.gender} />
              <DetailRow label="Address" value={detailPatient.address} />
            </div>

            <SectionHeader icon={Hash} title="Identifiers" />
            <div className="pl-8">
              <DetailRow label="Patient ID" value={detailPatient.patientId} />
              <DetailRow label="User ID" value={detailPatient.userId} />
            </div>

            <SectionHeader icon={Activity} title="Vitals" />
            <div className="pl-8">
              <DetailRow label="Blood Type" value={detailPatient.bloodType} />
              <DetailRow label="Blood Pressure" value={detailPatient.bloodPressure} />
              <DetailRow label="Heart Rate" value={detailPatient.heartRate ? `${detailPatient.heartRate} bpm` : null} />
              <DetailRow label="Temperature" value={detailPatient.temperature ? `${detailPatient.temperature}°C` : null} />
              <DetailRow label="Oxygen Saturation" value={detailPatient.oxygenSaturation ? `${detailPatient.oxygenSaturation}%` : null} />
              <DetailRow label="Respiratory Rate" value={detailPatient.respiratoryRate ? `${detailPatient.respiratoryRate} /min` : null} />
              <DetailRow label="Height" value={detailPatient.height ? `${detailPatient.height} cm` : null} />
              <DetailRow label="Weight" value={detailPatient.weight ? `${detailPatient.weight} kg` : null} />
              <DetailRow label="Last Vitals Update" value={formatDateTime(detailPatient.lastVitalsUpdate)} />
            </div>

            <SectionHeader icon={Ambulance} title="Admission" />
            <div className="pl-8">
              <DetailRow label="Admission Date" value={formatDateTime(detailPatient.admissionDate)} />
              <DetailRow label="Admission Reason" value={detailPatient.admissionReason} />
              <DetailRow label="Admission Status" value={detailPatient.admissionStatus} />
              <DetailRow label="Discharge Date" value={formatDateTime(detailPatient.dischargeDate)} />
              <DetailRow label="Primary Doctor" value={detailPatient.primaryDoctor} />
            </div>

            <SectionHeader icon={AlertTriangle} title="Emergency Contact" />
            <div className="pl-8">
              <DetailRow label="Name" value={detailPatient.emergencyContactName} />
              <DetailRow label="Phone" value={detailPatient.emergencyContactPhone} />
              <DetailRow label="Relation" value={detailPatient.emergencyContactRelation} />
            </div>

            <SectionHeader icon={Pill} title="Medical History" />
            <div className="pl-8">
              <DetailRow label="Medical History" value={detailPatient.medicalHistory} />
              <DetailRow label="Allergies" value={detailPatient.allergies} />
              <DetailRow label="Current Medications" value={detailPatient.currentMedications} />
            </div>

            <SectionHeader icon={Calendar} title="System Info" />
            <div className="pl-8">
              <DetailRow label="Created At" value={formatDateTime(detailPatient.createdAt)} />
              <DetailRow label="Updated At" value={formatDateTime(detailPatient.updatedAt)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MgmtPatientsList;
