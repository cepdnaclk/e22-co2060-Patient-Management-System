import api from "./axiosClient";

export const profileChangeService = {
  async submitChange(proposedChanges) {
    const { data } = await api.post("/api/profile-changes", { proposedChanges });
    return data;
  },

  async getMyRequests() {
    const { data } = await api.get("/api/profile-changes/my");
    return data;
  },

  async getPendingRequests() {
    const { data } = await api.get("/api/profile-changes/pending");
    return data;
  },

  async getAllRequests() {
    const { data } = await api.get("/api/profile-changes");
    return data;
  },

  async approveRequest(id, reviewNotes = "") {
    const { data } = await api.put(`/api/profile-changes/${id}/approve`, { reviewNotes });
    return data;
  },

  async rejectRequest(id, reviewNotes = "") {
    const { data } = await api.put(`/api/profile-changes/${id}/reject`, { reviewNotes });
    return data;
  },
};
