import api from "./axiosClient";

const toTitleCase = (value) =>
  (value || "")
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeRecordTypeLabel = (recordType) => {
  const normalized = (recordType || "").toString().trim().toUpperCase();
  if (!normalized) return "Record";
  if (normalized === "LAB_RESULT") return "Lab Result";
  if (normalized === "CLINICAL_NOTE") return "Clinical Note";
  if (normalized === "DIAGNOSIS") return "Diagnosis";
  if (normalized === "NOTE") return "Note";
  if (normalized === "PROCEDURE") return "Procedure";
  if (normalized === "ALLERGY") return "Allergy";
  return toTitleCase(normalized.replaceAll("_", " "));
};

const mapUiTypeToApiType = (recordType) => {
  const normalized = (recordType || "").toString().trim().toUpperCase();
  if (normalized === "LAB RESULT") return "LAB_RESULT";
  if (normalized === "CLINICAL NOTE") return "CLINICAL_NOTE";
  return normalized || "NOTE";
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "N/A";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const formatPatient = (patient) => ({
  id: patient.id,
  displayId: `PMS-${String(patient.id).padStart(5, "0")}`,
  name: `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
  age: calculateAge(patient.dateOfBirth),
  gender: patient.gender || "N/A",
  bloodGroup: patient.bloodType || "N/A",
  admittedDate: patient.admissionDate
    ? new Date(patient.admissionDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : patient.createdAt
      ? new Date(patient.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A",
  primaryDoctor: patient.primaryDoctor || "Assigned Doctor",
  avatar: `https://i.pravatar.cc/160?u=patient-${patient.id}`,
  allergies: patient.allergies || "None",
  bloodPressure: patient.bloodPressure || "N/A",
  heartRate: patient.heartRate ?? null,
  temperature: patient.temperature ?? null,
  oxygenSaturation: patient.oxygenSaturation ?? null,
  respiratoryRate: patient.respiratoryRate ?? null,
  height: patient.height ?? null,
  weight: patient.weight ?? null,
  lastVitalsUpdate: patient.lastVitalsUpdate || null,
});

const formatRecord = (record) => ({
  id: record.id,
  date: record.createdAt
    ? new Date(record.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A",
  type: normalizeRecordTypeLabel(record.recordType),
  title: record.diagnosis || record.testName || record.treatment || "Medical Record",
  description:
    record.description || record.treatment || record.testResult || "No details",
  doctor: record.doctorName || "Doctor",
});

export const patientRecordService = {
  async getAllPatients() {
    const { data } = await api.get("/api/patients");
    return (data || []).map(formatPatient);
  },

  async getPatientRecords(patientId) {
    if (!patientId) return [];
    const { data } = await api.get(`/api/medical-records/patient/${patientId}`);
    return (data || []).map(formatRecord);
  },

  async getPatientDetails(patientId) {
    if (!patientId) return null;
    const { data } = await api.get(`/api/patients/${patientId}`);
    return formatPatient(data);
  },

  async createMedicalRecord(patientId, recordInput, doctorId = null) {
    const apiType = mapUiTypeToApiType(recordInput.type);
    const isPrescription = apiType === "PRESCRIPTION";
    const payload = {
      patientId,
      doctorId,
      recordType: apiType,
      description: recordInput.description,
      diagnosis: apiType === "DIAGNOSIS" ? recordInput.title : null,
      treatment: apiType === "PROCEDURE" || isPrescription ? recordInput.title : null,
      testName: apiType === "LAB_RESULT" ? recordInput.title : null,
    };

    const { data } = await api.post("/api/medical-records", payload);
    return formatRecord(data);
  },
};
