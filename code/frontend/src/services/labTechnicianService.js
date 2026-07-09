import api from "./axiosClient";

const normalizeRecord = (record) => ({
  id: record.id,
  patientId: record.patientId,
  doctorId: record.doctorId,
  doctorName: record.doctorName || "N/A",
  recordType: record.recordType,
  testName: record.testName || "",
  testResult: record.testResult || "",
  description: record.description || "",
  diagnosis: record.diagnosis || "",
  treatment: record.treatment || "",
  isFulfilled: record.isFulfilled || false,
  attachmentUrl: record.attachmentUrl || null,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const normalizePatient = (patient) => ({
  id: patient.id,
  patientId: patient.patientId,
  firstName: patient.firstName || "",
  lastName: patient.lastName || "",
  name: `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
  email: patient.email,
  mobileNumber: patient.mobileNumber,
  gender: patient.gender,
  dateOfBirth: patient.dateOfBirth,
  bloodType: patient.bloodType,
});

export const labTechnicianService = {
  async getPendingLabTests() {
    const { data } = await api.get("/api/medical-records/type/LAB_RESULT");
    return (data || []).map(normalizeRecord);
  },

  async getAllLabTests() {
    const { data } = await api.get("/api/medical-records");
    return (data || [])
      .filter((r) => r.recordType === "LAB_RESULT")
      .map(normalizeRecord);
  },

  async getPatientLabTests(patientId) {
    const { data } = await api.get(`/api/medical-records/patient/${patientId}`);
    return (data || [])
      .filter((r) => r.recordType === "LAB_RESULT")
      .map(normalizeRecord);
  },

  async createLabResult(patientId, testName, testResult, description = "", doctorId = null, attachmentUrl = null) {
    const payload = {
      patientId,
      doctorId,
      recordType: "LAB_RESULT",
      testName,
      testResult,
      description,
      attachmentUrl,
    };
    const { data } = await api.post("/api/medical-records", payload);
    return normalizeRecord(data);
  },

  async updateLabResult(id, testResult, description, attachmentUrl = null) {
    const payload = { testResult, description };
    if (attachmentUrl) payload.attachmentUrl = attachmentUrl;
    const { data } = await api.put(`/api/medical-records/${id}`, payload);
    return normalizeRecord(data);
  },

  async getPatientDetails(patientId) {
    const { data } = await api.get(`/api/patients/${patientId}`);
    return normalizePatient(data);
  },

  async getAllPatients() {
    const { data } = await api.get("/api/patients");
    return (data || []).map(normalizePatient);
  },
};
