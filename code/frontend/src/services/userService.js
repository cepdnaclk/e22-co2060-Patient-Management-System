import api from "./axiosClient";

export const userService = {
  async createUser(createUserRequest) {
    const { data } = await api.post("/api/users", createUserRequest);
    return data;
  },

  async createDoctorProfile(userId, doctorDto) {
    const { data } = await api.post(`/api/doctors?userId=${userId}`, doctorDto);
    return data;
  },
};
