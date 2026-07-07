import api from "./axiosClient";

export const receptionistService = {
  registerPatient(form) {
    const payload = {
      firstName: form.firstName?.trim() || "",
      lastName: form.lastName?.trim() || "",
      email: form.email?.trim() || "",
      mobileNumber: form.mobileNumber?.trim() || "",
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender?.trim() || "",
      bloodType: form.bloodType?.trim() || "",
      address: form.address?.trim() || "",
      emergencyContactName: form.emergencyContactName?.trim() || "",
      emergencyContactPhone: form.emergencyContactPhone?.trim() || "",
      emergencyContactRelation: form.emergencyContactRelation?.trim() || "",
    };
    return api.post("/api/patients/register", payload);
  },

  createAppointment(data) {
    return api.post("/api/appointments", data);
  },

  cancelAppointment(id) {
    return api.put(`/api/appointments/${id}/cancel`);
  },

  listDoctors() {
    return api.get("/api/doctors");
  },

  listPatients() {
    return api.get("/api/patients");
  },

  listAppointments() {
    return api.get("/api/appointments");
  },
};
