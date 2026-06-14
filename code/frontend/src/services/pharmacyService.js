import api from "./axiosClient";

export const pharmacyService = {
  getAllMedicines: async () => {
    const response = await api.get('/api/pharmacy/medicines');
    return response.data;
  },

  getLowStockMedicines: async () => {
    const response = await api.get('/api/pharmacy/medicines/low-stock');
    return response.data;
  },

  addMedicine: async (medicineData) => {
    const response = await api.post('/api/pharmacy/medicines', medicineData);
    return response.data;
  },

  updateMedicine: async (id, medicineData) => {
    const response = await api.put(`/api/pharmacy/medicines/${id}`, medicineData);
    return response.data;
  },

  deleteMedicine: async (id) => {
    await api.delete(`/api/pharmacy/medicines/${id}`);
  },

  getPendingPrescriptions: async () => {
    // We get all prescriptions and filter for those not yet fulfilled
    const response = await api.get('/api/medical-records/type/PRESCRIPTION');
    const allPrescriptions = response.data || [];
    return allPrescriptions.filter(p => !p.isFulfilled);
  },

  getFulfilledPrescriptions: async () => {
    const response = await api.get('/api/medical-records/type/PRESCRIPTION');
    const allPrescriptions = response.data || [];
    return allPrescriptions.filter(p => p.isFulfilled);
  },

  fulfillPrescription: async (id) => {
    const response = await api.put(`/api/medical-records/${id}/fulfill`);
    return response.data;
  }
};
