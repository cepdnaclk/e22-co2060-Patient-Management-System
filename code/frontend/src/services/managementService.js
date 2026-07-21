import api from "./axiosClient";

export const managementService = {
  // ── User Management ──
  fetchUsers: async () => {
    const { data } = await api.get("/api/v1/admin/users");
    return data;
  },

  updateUser: async (id, payload) => {
    const { data } = await api.put(`/api/v1/management/users/${id}`, payload);
    return data;
  },

  updateUserRole: async (id, role) => {
    const { data } = await api.patch(`/api/v1/admin/users/${id}/role`, { role });
    return data;
  },

  deleteUser: async (id) => {
    await api.delete(`/api/v1/admin/users/${id}`);
  },

  createUser: async (payload) => {
    const { data } = await api.post("/api/v1/admin/users", payload);
    return data;
  },

  // ── Patient Management ──
  fetchPatients: async () => {
    const { data } = await api.get("/api/patients");
    return data;
  },

  // ── Doctor Management ──
  fetchDoctors: async () => {
    const { data } = await api.get("/api/doctors");
    return data;
  },

  updateDoctor: async (id, payload) => {
    const { data } = await api.put(`/api/v1/management/doctors/${id}`, payload);
    return data;
  },

  createDoctorProfile: async (userId, payload) => {
    const { data } = await api.post(`/api/doctors?userId=${userId}`, payload);
    return data;
  },

  // ── Stats (reuses admin endpoint — MANAGEMENT has access) ──
  fetchStats: async () => {
    const { data } = await api.get("/api/v1/admin/stats");
    return data;
  },

  fetchRoleCounts: async () => {
    const { data } = await api.get("/api/v1/admin/role-counts");
    return data;
  },
};
