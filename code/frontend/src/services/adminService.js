import api from "./axiosClient";

export const adminService = {
  fetchStats: async () => {
    const { data } = await api.get("/api/v1/admin/stats");
    return data;
  },

  fetchRoleCounts: async () => {
    const { data } = await api.get("/api/v1/admin/role-counts");
    return data;
  },

  fetchUsers: async () => {
    const { data } = await api.get("/api/v1/admin/users");
    return data;
  },

  createUser: async (payload) => {
    const { data } = await api.post("/api/v1/admin/users", payload);
    return data;
  },

  updateUserRole: async (id, role) => {
    const { data } = await api.patch(`/api/v1/admin/users/${id}/role`, { role });
    return data;
  },

  deleteUser: async (id) => {
    await api.delete(`/api/v1/admin/users/${id}`);
  },
};
