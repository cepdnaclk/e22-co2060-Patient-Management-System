import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ============================================================================
// Logic from patientDashboardService.js
// ============================================================================
const formatDashboardDate = (value, options = {}) => {
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

const formatDashboardDateTime = (value) => {
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

const dashboardTitleCase = (value) =>
  (value || "")
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeDashboardRecordTypeLabel = (recordType) => {
  const normalized = (recordType || "").toString().trim().toUpperCase();
  if (!normalized) return "Record";
  return dashboardTitleCase(normalized.replaceAll("_", " "));
};

const calculateDashboardAge = (dateOfBirth, referenceDate = new Date()) => {
  if (!dateOfBirth) return "N/A";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "N/A";

  const today = referenceDate;
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
  age: calculateDashboardAge(patient.dateOfBirth),
  bloodType: patient.bloodType || "N/A",
  address: patient.address || "N/A",
  primaryDoctor: patient.primaryDoctor || "N/A",
  admissionReason: patient.admissionReason || "N/A",
  admissionStatus: patient.admissionStatus || "N/A",
  dateOfBirth: formatDashboardDate(patient.dateOfBirth),
  admissionDate: formatDashboardDateTime(patient.admissionDate),
  dischargeDate: formatDashboardDateTime(patient.dischargeDate),
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
  updatedAt: formatDashboardDateTime(patient.updatedAt),
});

const mapRecord = (record) => ({
  id: record.id,
  date: formatDashboardDateTime(record.createdAt),
  type: normalizeDashboardRecordTypeLabel(record.recordType),
  doctorName: record.doctorName || "N/A",
  title:
    record.diagnosis || record.testName || record.treatment || "Medical Record",
  description:
    record.description || record.testResult || record.treatment || "No details",
});


// ============================================================================
// Logic from patientRecordService.js
// ============================================================================
const toRecordTitleCase = (value) =>
  (value || "")
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeRecordTypeLabel = (recordType) => {
  const normalized = (recordType || "").toString().trim().toUpperCase();
  if (!normalized) return "Record";
  if (normalized === "LAB_RESULT") return "Lab Result";
  if (normalized === "CLINICAL_NOTE") return "Clinical Note";
  if (normalized === "DIAGNOSIS") return "Diagnosis";
  if (normalized === "NOTE") return "Note";
  if (normalized === "PROCEDURE") return "Procedure";
  if (normalized === "ALLERGY") return "Allergy";
  return toRecordTitleCase(normalized.replaceAll("_", " "));
};

const mapUiTypeToApiType = (recordType) => {
  const normalized = (recordType || "").toString().trim().replace(/_/g, " ").toUpperCase();
  if (normalized === "LAB RESULT" || normalized === "LAB TEST") return "LAB_RESULT";
  if (normalized === "CLINICAL NOTE") return "CLINICAL_NOTE";
  return normalized || "NOTE";
};

const calculateRecordAge = (dateOfBirth) => {
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

const formatPatient = (patient) => ({
  id: patient.id,
  displayId: `PMS-${String(patient.id).padStart(5, "0")}`,
  firstName: patient.firstName || "",
  lastName: patient.lastName || "",
  name: `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
  age: calculateRecordAge(patient.dateOfBirth),
  gender: patient.gender || "N/A",
  bloodGroup: patient.bloodType || "N/A",
  admittedDate: patient.admissionDate
    ? new Date(patient.admissionDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : patient.createdAt
      ? new Date(patient.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A",
  primaryDoctor: patient.primaryDoctor || "Assigned Doctor",
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent((patient.firstName || 'P') + '+' + (patient.lastName || 'M'))}&background=random&size=160&bold=true`,
  allergies: patient.allergies || "None",
  bloodPressure: patient.bloodPressure || "N/A",
  heartRate: patient.heartRate ?? null,
  temperature: patient.temperature ?? null,
  oxygenSaturation: patient.oxygenSaturation ?? null,
  respiratoryRate: patient.respiratoryRate ?? null,
  height: patient.height ?? null,
  weight: patient.weight ?? null,
  lastVitalsUpdate: patient.lastVitalsUpdate || null,
  criticalStatus: !!patient.criticalStatus,
});

const formatRecord = (record) => ({
  id: record.id,
  date: record.createdAt
    ? new Date(record.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A",
  type: normalizeRecordTypeLabel(record.recordType),
  recordType: record.recordType,
  title: (record.recordType === "NOTE" && record.description)
    ? record.description.split("\n\n")[0]
    : record.diagnosis || record.testName || record.treatment || "Nursing Note",
  description:
    record.description || record.treatment || record.testResult || "No details",
  doctor: record.doctorName || "System",
  testName: record.testName || null,
  testResult: record.testResult || null,
  attachmentUrl: record.attachmentUrl || null,
  isFulfilled: record.isFulfilled || false,
});


// ============================================================================
// TEST SUITES
// ============================================================================

describe("Patient Dashboard Service: Mapping Suite", () => {
  const fullPatientData = {
    id: 101,
    patientId: "P-10101",
    firstName: "Arthur",
    lastName: "Dent",
    email: "arthur@earth.org",
    mobileNumber: "+4412345678",
    gender: "MALE",
    dateOfBirth: "1980-05-15",
    bloodType: "A_POSITIVE",
    address: "West Country, UK",
    primaryDoctor: "Dr. Trillian",
    admissionReason: "Hyper-drive shock",
    admissionStatus: "ADMITTED",
    admissionDate: "2026-09-01T08:30:00Z",
    dischargeDate: null,
    allergies: "Vogon Poetry, Peanuts",
    currentMedications: "Tea, Aspirin",
    medicalHistory: "Frequent bouts of panic",
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 36.8,
    oxygenSaturation: 99.0,
    respiratoryRate: 16,
    height: 180,
    weight: 75,
    emergencyContactName: "Ford Prefect",
    emergencyContactPhone: "+4498765432",
    emergencyContactRelation: "Friend",
    updatedAt: "2026-09-20T10:00:00Z",
  };

  it("mapPatient accurately transforms full patient profile", () => {
    const mapped = mapPatient(fullPatientData);

    assert.equal(mapped.id, 101);
    assert.equal(mapped.patientId, "P-10101");
    assert.equal(mapped.fullName, "Arthur Dent");
    assert.equal(mapped.email, "arthur@earth.org");
    assert.equal(mapped.allergies, "Vogon Poetry, Peanuts");
    assert.equal(mapped.bloodPressure, "120/80");
    assert.equal(mapped.heartRate, 72);
    assert.equal(mapped.oxygenSaturation, 99.0);
    assert.equal(mapped.emergencyContactName, "Ford Prefect");
    assert.notEqual(mapped.age, "N/A");
  });

  it("mapPatient handles sparse/empty patient data with defensive fallbacks", () => {
    const sparseData = { id: 7 };
    const mapped = mapPatient(sparseData);

    assert.equal(mapped.id, 7);
    assert.equal(mapped.patientId, "PMS-00007"); // Auto-padded fallback
    assert.equal(mapped.fullName, "N/A");
    assert.equal(mapped.email, "N/A");
    assert.equal(mapped.allergies, "None listed");
    assert.equal(mapped.currentMedications, "None listed");
    assert.equal(mapped.medicalHistory, "No medical history provided.");
    assert.equal(mapped.age, "N/A");
    assert.equal(mapped.heartRate, "N/A");
    assert.equal(mapped.updatedAt, "N/A");
  });

  it("calculateDashboardAge computes correct age based on month and date boundaries", () => {
    const refDate = new Date(2026, 8, 25); // 25 September 2026
    // Birthday already happened this year
    const agePassed = calculateDashboardAge("1990-03-10", refDate);
    assert.equal(agePassed, 36);

    // Birthday hasn't happened yet this year
    const ageUpcoming = calculateDashboardAge("1990-11-20", refDate);
    assert.equal(ageUpcoming, 35);

    // Invalid date
    assert.equal(calculateDashboardAge("invalid-date", refDate), "N/A");
    assert.equal(calculateDashboardAge(null, refDate), "N/A");
  });

  it("mapRecord formats clinical, diagnosis, and lab records with fallbacks", () => {
    const diagnosisRecord = {
      id: 501,
      createdAt: "2026-09-10T14:20:00Z",
      recordType: "DIAGNOSIS",
      doctorName: "Dr. Who",
      diagnosis: "Mild Concussion",
      description: "Rest and observation for 48 hours",
    };

    const mapped = mapRecord(diagnosisRecord);
    assert.equal(mapped.id, 501);
    assert.equal(mapped.type, "Diagnosis");
    assert.equal(mapped.doctorName, "Dr. Who");
    assert.equal(mapped.title, "Mild Concussion");
    assert.equal(mapped.description, "Rest and observation for 48 hours");
  });

  it("mapRecord falls back to testResult / testName when diagnosis is absent", () => {
    const labRecord = {
      id: 502,
      createdAt: "2026-09-12T09:00:00Z",
      recordType: "LAB_RESULT",
      testName: "Full Blood Count",
      testResult: "WBC normal, RBC normal",
    };

    const mapped = mapRecord(labRecord);
    assert.equal(mapped.type, "Lab Result");
    assert.equal(mapped.title, "Full Blood Count");
    assert.equal(mapped.description, "WBC normal, RBC normal");
    assert.equal(mapped.doctorName, "N/A");
  });
});

describe("Patient Record Service: Formatting Suite", () => {
  it("normalizeRecordTypeLabel returns standardized human-readable strings", () => {
    assert.equal(normalizeRecordTypeLabel("LAB_RESULT"), "Lab Result");
    assert.equal(normalizeRecordTypeLabel("CLINICAL_NOTE"), "Clinical Note");
    assert.equal(normalizeRecordTypeLabel("DIAGNOSIS"), "Diagnosis");
    assert.equal(normalizeRecordTypeLabel("NOTE"), "Note");
    assert.equal(normalizeRecordTypeLabel("PROCEDURE"), "Procedure");
    assert.equal(normalizeRecordTypeLabel("ALLERGY"), "Allergy");
    assert.equal(normalizeRecordTypeLabel("UNKNOWN_CUSTOM_TYPE"), "Unknown Custom Type");
    assert.equal(normalizeRecordTypeLabel(""), "Record");
    assert.equal(normalizeRecordTypeLabel(null), "Record");
  });

  it("mapUiTypeToApiType maps human UI selectors to backend API enums", () => {
    assert.equal(mapUiTypeToApiType("Lab Result"), "LAB_RESULT");
    assert.equal(mapUiTypeToApiType("LAB TEST"), "LAB_RESULT");
    assert.equal(mapUiTypeToApiType("Clinical Note"), "CLINICAL_NOTE");
    assert.equal(mapUiTypeToApiType("Prescription"), "PRESCRIPTION");
    assert.equal(mapUiTypeToApiType(""), "NOTE");
  });

  it("formatPatient formats displayId, avatar, and defaults correctly", () => {
    const raw = {
      id: 42,
      firstName: "Sarah",
      lastName: "Jane",
      dateOfBirth: "1995-04-12",
      bloodType: "O_POSITIVE",
      admissionDate: "2026-08-15T10:00:00Z",
      criticalStatus: 1,
      heartRate: 80,
    };

    const formatted = formatPatient(raw);
    assert.equal(formatted.id, 42);
    assert.equal(formatted.displayId, "PMS-00042");
    assert.equal(formatted.name, "Sarah Jane");
    assert.equal(formatted.criticalStatus, true);
    assert.equal(formatted.heartRate, 80);
    assert.equal(formatted.bloodGroup, "O_POSITIVE");
    assert.ok(formatted.avatar.includes("Sarah%2BJane"));
  });

  it("formatPatient handles missing admissionDate by falling back to createdAt or N/A", () => {
    const rawWithCreated = { id: 10, createdAt: "2026-07-20T12:00:00Z" };
    const res1 = formatPatient(rawWithCreated);
    assert.ok(res1.admittedDate.includes("2026"));

    const emptyRaw = { id: 11 };
    const res2 = formatPatient(emptyRaw);
    assert.equal(res2.admittedDate, "N/A");
    assert.equal(res2.criticalStatus, false);
    assert.equal(res2.primaryDoctor, "Assigned Doctor");
  });

  it("formatRecord extracts first paragraph as title for NOTE record types", () => {
    const noteRecord = {
      id: 701,
      createdAt: "2026-09-15T08:00:00Z",
      recordType: "NOTE",
      description: "Shift Handover Summary\n\nPatient rested comfortably overnight without incident.",
      doctorName: "Nurse Joy",
    };

    const formatted = formatRecord(noteRecord);
    assert.equal(formatted.title, "Shift Handover Summary");
    assert.equal(formatted.description, "Shift Handover Summary\n\nPatient rested comfortably overnight without incident.");
    assert.equal(formatted.doctor, "Nurse Joy");
  });

  it("formatRecord preserves attachmentUrl and isFulfilled properties", () => {
    const labRecord = {
      id: 702,
      createdAt: "2026-09-18T11:00:00Z",
      recordType: "LAB_RESULT",
      testName: "ECG 12-Lead",
      attachmentUrl: "/uploads/lab-reports/ecg.pdf",
      isFulfilled: true,
    };

    const formatted = formatRecord(labRecord);
    assert.equal(formatted.attachmentUrl, "/uploads/lab-reports/ecg.pdf");
    assert.equal(formatted.isFulfilled, true);
    assert.equal(formatted.type, "Lab Result");
  });
});
