import api from "./axiosClient";

export const billingService = {
  // Get summary (revenue, outstanding)
  async getSummary() {
    const { data } = await api.get("/api/invoices/summary");
    return data;
  },

  async getAllInvoices(page = 0, size = 10) {
    const { data } = await api.get(`/api/invoices?page=${page}&size=${size}`);
    return data;
  },

  async getInvoicesByPatient(patientId, page = 0, size = 10) {
    const { data } = await api.get(`/api/invoices/patient/${patientId}?page=${page}&size=${size}`);
    return data;
  },

  async createInvoice(payload) {
    const { data } = await api.post("/api/invoices", payload);
    return data;
  },

  async recordPayment(invoiceId, paymentData) {
    // paymentData: { amount: number, paymentMethod: string }
    const { data } = await api.post(`/api/invoices/${invoiceId}/pay`, paymentData);
    return data;
  },

  async getInvoiceById(invoiceId) {
    const { data } = await api.get(`/api/invoices/${invoiceId}`);
    return data;
  },

  // ── PENDING BILL ITEMS ──────────────────────────────────────────────────
  async addPendingItems(payload) {
    // payload: Array of { patientId, department, description, quantity, unitPrice }
    const { data } = await api.post("/api/billing/pending-items", payload);
    return data;
  },

  async getPatientsWithPendingItems() {
    const { data } = await api.get("/api/billing/pending-items/patients");
    return data;
  },

  async getPendingItemsByPatient(patientId) {
    const { data } = await api.get(`/api/billing/pending-items/patient/${patientId}`);
    return data;
  }
};
