import api from "./axiosClient";

const isToday = (isoDateTime) => {
  if (!isoDateTime) return false;
  const date = new Date(isoDateTime);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const isActiveStatus = (status) => {
  const normalized = (status || "").toUpperCase();
  return normalized !== "CANCELLED" && normalized !== "COMPLETED";
};

export const doctorDashboardService = {
  async getDashboardData(userId) {
    if (!userId) {
      throw new Error("Missing logged-in user id");
    }

    const { data: doctor } = await api.get(`/api/doctors/user/${userId}`);

    const [appointmentsResponse, patientsResponse, recordsResponse] =
      await Promise.all([
        api.get(`/api/appointments/doctor/${doctor.id}`),
        api.get("/api/patients"),
        api.get(`/api/medical-records/doctor/${doctor.id}`),
      ]);

    const appointments = appointmentsResponse.data || [];
    const patients = patientsResponse.data || [];
    const records = recordsResponse.data || [];

    const todaysAppointments = appointments.filter((appointment) =>
      isToday(appointment.appointmentDateTime),
    );

    const activeAppointments = appointments.filter((appointment) =>
      isActiveStatus(appointment.status),
    );

    const criticalAlerts = patients.filter((patient) => 
      patient.criticalStatus === true
    );

    return {
      doctor,
      stats: {
        patients: patients.length,
        appointmentsToday: todaysAppointments.length,
        activeAppointments: activeAppointments.length,
        criticalAlerts: criticalAlerts.length,
        records: records.length,
      },
      appointments: todaysAppointments,
    };
  },

  async updateAppointmentStatus(appointmentId, status) {
    const { data } = await api.put(`/api/appointments/${appointmentId}`, { status });
    return data;
  }
};
