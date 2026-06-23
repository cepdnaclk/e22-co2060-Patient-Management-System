import api from "./axiosClient";

const formatDate = (value, options = {}) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const titleCase = (value) =>
  (value || "")
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeRecordTypeLabel = (recordType) => {
  const normalized = (recordType || "").toString().trim().toUpperCase();
  if (!normalized) return "Record";
  return titleCase(normalized.replaceAll("_", " "));
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "N/A";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const mapPatient = (patient) => ({
  id: patient.id,
  patientId: patient.patientId || `PMS-${String(patient.id).padStart(5, "0")}`,
  fullName: `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "N/A",
  firstName: patient.firstName || "",
  lastName: patient.lastName || "",
  email: patient.email || "N/A",
  mobileNumber: patient.mobileNumber || "N/A",
  gender: patient.gender || "N/A",
  age: calculateAge(patient.dateOfBirth),
  bloodType: patient.bloodType || "N/A",
  address: patient.address || "N/A",
  primaryDoctor: patient.primaryDoctor || "N/A",
  admissionReason: patient.admissionReason || "N/A",
  admissionStatus: patient.admissionStatus || "N/A",
  dateOfBirth: formatDate(patient.dateOfBirth),
  admissionDate: formatDateTime(patient.admissionDate),
  dischargeDate: formatDateTime(patient.dischargeDate),
  allergies: patient.allergies || "None listed",
  currentMedications: patient.currentMedications || "None listed",
  medicalHistory: patient.medicalHistory || "No medical history provided.",
  bloodPressure: patient.bloodPressure || "N/A",
  heartRate: patient.heartRate ?? "N/A",
  temperature: patient.temperature ?? "N/A",
  oxygenSaturation: patient.oxygenSaturation ?? "N/A",
  respiratoryRate: patient.respiratoryRate ?? "N/A",
  height: patient.height ?? "N/A",
  weight: patient.weight ?? "N/A",
  emergencyContactName: patient.emergencyContactName || "N/A",
  emergencyContactPhone: patient.emergencyContactPhone || "N/A",
  emergencyContactRelation: patient.emergencyContactRelation || "N/A",
  updatedAt: formatDateTime(patient.updatedAt),
});

const mapRecord = (record) => ({
  id: record.id,
  date: formatDateTime(record.createdAt),
  type: normalizeRecordTypeLabel(record.recordType),
  doctorName: record.doctorName || "N/A",
  title:
    record.diagnosis || record.testName || record.treatment || "Medical Record",
  description:
    record.description || record.testResult || record.treatment || "No details",
});

export const patientDashboardService = {
  async getDashboardData(userOrUserId) {
    const userObject =
      userOrUserId && typeof userOrUserId === "object" ? userOrUserId : null;

    const userIds = [
      userObject?.id,
      userObject?.userId,
      userObject?.userID,
      userObject?.uid,
      !userObject ? userOrUserId : undefined,
    ].filter((value) => value !== undefined && value !== null && value !== "");

    const patientIds = [
      userObject?.patientId,
      userObject?.patientID,
      userObject?.id,
      userObject?.userId,
      !userObject ? userOrUserId : undefined,
    ].filter((value) => value !== undefined && value !== null && value !== "");

    if (!userIds.length && !patientIds.length) {
      throw new Error("Missing logged-in user id");
    }

    let patientData = null;
    let lastLookupError = null;

    for (const userId of userIds) {
      try {
        const response = await api.get(`/api/patients/user/${userId}`);
        patientData = response.data;
        break;
      } catch (error) {
        lastLookupError = error;
      }
    }

    if (!patientData) {
      for (const patientId of patientIds) {
        try {
          const response = await api.get(`/api/patients/${patientId}`);
          patientData = response.data;
          break;
        } catch (error) {
          lastLookupError = error;
        }
      }
    }

    if (!patientData) {
      const status = lastLookupError?.response?.status;
      if (status === 404) {
        throw new Error(
          "Patient profile not found. Please ask admin to create/link your patient profile.",
        );
      }

      throw new Error(
        lastLookupError?.response?.data?.message ||
          "Unable to load patient profile right now.",
      );
    }

    const patient = mapPatient(patientData);

    const [recordsRes, appointmentsRes, invoicesRes] = await Promise.allSettled([
      api.get(`/api/medical-records/patient/${patient.id}`),
      api.get(`/api/appointments/patient/${patient.id}`),
      api.get(`/api/invoices/patient/${patient.id}`)
    ]);

    const recordsData = recordsRes.status === "fulfilled" ? recordsRes.value.data : [];
    const appointmentsData = appointmentsRes.status === "fulfilled" ? appointmentsRes.value.data : [];
    // Invoices are paginated, so they are in .data.content
    const invoicesData = invoicesRes.status === "fulfilled" ? (invoicesRes.value.data.content || []) : [];

    const records = (recordsData || []).map(mapRecord);

    const stats = {
      totalRecords: records.length,
      activeMedications:
        patient.currentMedications && patient.currentMedications !== "None listed"
          ? patient.currentMedications.split(",").filter((item) => item.trim()).length
          : 0,
      allergiesCount:
        patient.allergies && patient.allergies !== "None listed"
          ? patient.allergies.split(",").filter((item) => item.trim()).length
          : 0,
      profileStatus:
        patient.updatedAt !== "N/A" ? "Updated" : "Incomplete",
      upcomingAppointments: appointmentsData.filter(app => new Date(app.appointmentDate) >= new Date() && app.status !== "CANCELLED").length,
      unpaidBills: invoicesData.filter(inv => inv.paymentStatus !== "PAID").length,
    };

    return {
      patient,
      records,
      appointments: appointmentsData,
      invoices: invoicesData,
      stats,
    };
  },
};

