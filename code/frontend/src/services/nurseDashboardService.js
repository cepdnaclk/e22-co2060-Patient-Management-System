import api from "./axiosClient";

export const nurseDashboardService = {
  
  // --- Vitals ---
  
  async getPatientVitals(patientId) {
    if (!patientId) return [];
    const response = await api.get(`/api/nurse/vitals/patient/${patientId}`);
    return response.data || [];
  },

  async recordVitals(data) {
    const response = await api.post('/api/nurse/vitals', data);
    return response.data;
  },

  // --- Prescriptions from doctors ---

  async getPatientPrescriptions(patientId) {
    if (!patientId) return [];
    const response = await api.get(`/api/medical-records/patient/${patientId}`);
    const all = response.data || [];
    return all.filter((r) => r.recordType === "PRESCRIPTION");
  },

  // --- MAR (Medication Administration Record) ---

  async getPatientMedications(patientId) {
    if (!patientId) return [];
    const response = await api.get(`/api/nurse/medications/patient/${patientId}`);
    return response.data || [];
  },

  async createMedicationOrder(data) {
    const response = await api.post('/api/nurse/medications', data);
    return response.data;
  },

  async administerMedication(data) {
    const response = await api.post('/api/nurse/medications/administer', data);
    return response.data;
  },

  // --- Clinical Orders ---

  async getPatientClinicalOrders(patientId) {
    if (!patientId) return [];
    const response = await api.get(`/api/nurse/orders/patient/${patientId}`);
    return response.data || [];
  },

  async completeClinicalOrder(orderId, userId) {
    const response = await api.put(`/api/nurse/orders/${orderId}/complete`, null, {
      params: { userId }
    });
    return response.data;
  }
};
