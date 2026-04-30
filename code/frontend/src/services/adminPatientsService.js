import api from "./axiosClient";

const normalizePatientPayload = (form) => ({
  firstName: form.firstName?.trim() || "",
  lastName: form.lastName?.trim() || "",
  email: form.email?.trim() || "",
  mobileNumber: form.mobileNumber?.trim() || "",
  gender: form.gender?.trim() || "",
  dateOfBirth: form.dateOfBirth || null,
  bloodType: form.bloodType?.trim() || "",
  address: form.address?.trim() || "",
  primaryDoctor: form.primaryDoctor?.trim() || "",
  admissionStatus: form.admissionStatus?.trim() || "",
});

export const adminPatientsService = {
  async listPatients() {
    const { data } = await api.get("/api/patients");
    return data || [];
  },

  async createPatient(form) {
    const payload = normalizePatientPayload(form);
    const { data } = await api.post("/api/patients", payload);
    return data;
  },

  async updatePatient(id, form) {
    const payload = normalizePatientPayload(form);
    const { data } = await api.put(`/api/patients/${id}`, payload);
    return data;
  },

  async deletePatient(id) {
    await api.delete(`/api/patients/${id}`);
  },
};
