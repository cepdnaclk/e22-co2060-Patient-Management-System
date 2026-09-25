import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";
import { patientDashboardService } from "../../services/patientDashboardService";
import { Card, CardContent, CardHeader } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  LayoutDashboard, UserCircle, FileText, Pill,
  Menu, X, Activity, Droplet, Ruler, Weight, Calendar, Clock, ChevronRight,
  CreditCard, CheckCircle2, AlertCircle, Receipt, Sun, Moon, LogOut,
  FileIcon, FileImage, FlaskConical, Hourglass, Plus, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fileUploadService } from "../../services/fileUploadService";
import NotificationBell from "../../components/NotificationBell.jsx";

const sectionLabels = {
  dashboard: "Overview",
  details: "My Profile",
  records: "Medical History",
  appointments: "Appointments",
  billing: "My Bills",
};

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeMedications: 0,
    allergiesCount: 0,
    profileStatus: "Incomplete",
    upcomingAppointments: 0,
    unpaidBills: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fileInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMedsModalOpen, setIsMedsModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "General Checkup",
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const openBookingModal = async () => {
    setIsBookingModalOpen(true);
    setBookingError("");
    setBookingSuccess("");
    if (doctorsList.length === 0) {
      setLoadingDoctors(true);
      try {
        const docs = await patientDashboardService.getDoctors();
        setDoctorsList(docs);
        if (docs.length > 0) {
          setBookingForm((prev) => ({ ...prev, doctorId: String(docs[0].id) }));
        }
      } catch (err) {
        console.error("Failed to load doctors list", err);
      } finally {
        setLoadingDoctors(false);
      }
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.date || !bookingForm.time) {
      setBookingError("Please select doctor, appointment date, and time.");
      return;
    }
    setIsBooking(true);
    setBookingError("");
    try {
      await patientDashboardService.bookAppointment({
        patientId: patient?.id,
        doctorId: Number(bookingForm.doctorId),
        appointmentDateTime: `${bookingForm.date}T${bookingForm.time}:00`,
        durationMinutes: 30,
        reason: bookingForm.reason || "General Checkup",
        status: "SCHEDULED"
      });
      setBookingSuccess("Appointment booked successfully!");
      // Refresh dashboard data to update upcoming appointments count and list
      const data = await patientDashboardService.getDashboardData(user);
      setAppointments(data.appointments);
      setStats(data.stats);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess("");
        setBookingForm({
          doctorId: doctorsList[0]?.id ? String(doctorsList[0].id) : "",
          date: "",
          time: "",
          reason: "General Checkup",
        });
      }, 1200);
    } catch (err) {
      setBookingError(err?.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const parseDateForInput = (dateStr) => {
    if (!dateStr || dateStr === "N/A") return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  const startEditingProfile = () => {
    setProfileForm({
      dateOfBirth: parseDateForInput(patient?.dateOfBirth),
      gender: patient?.gender === "N/A" ? "" : patient?.gender,
      bloodType: patient?.bloodType === "N/A" ? "" : patient?.bloodType,
      email: patient?.email === "N/A" ? "" : patient?.email,
      mobileNumber: patient?.mobileNumber === "N/A" ? "" : patient?.mobileNumber,
      address: patient?.address === "N/A" ? "" : patient?.address,
      emergencyContactName: patient?.emergencyContactName === "N/A" ? "" : patient?.emergencyContactName,
      emergencyContactPhone: patient?.emergencyContactPhone === "N/A" ? "" : patient?.emergencyContactPhone,
      emergencyContactRelation: patient?.emergencyContactRelation === "N/A" ? "" : patient?.emergencyContactRelation,
    });
    setIsEditingProfile(true);
    setError("");
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    setProfileForm({});
    setError("");
  };

  const handleProfileFormChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    setError("");
    try {
      const payload = {
        patientId: patient.patientId !== "N/A" ? patient.patientId : null,
        userId: user?.id,
        firstName: patient.firstName !== "N/A" ? patient.firstName : null,
        lastName: patient.lastName !== "N/A" ? patient.lastName : null,
        dateOfBirth: profileForm.dateOfBirth || null,
        gender: profileForm.gender || null,
        bloodType: profileForm.bloodType || null,
        email: profileForm.email || null,
        mobileNumber: profileForm.mobileNumber || null,
        address: profileForm.address || null,
        bloodPressure: patient.bloodPressure !== "N/A" ? patient.bloodPressure : null,
        heartRate: patient.heartRate !== "N/A" ? patient.heartRate : null,
        temperature: patient.temperature !== "N/A" ? patient.temperature : null,
        oxygenSaturation: patient.oxygenSaturation !== "N/A" ? patient.oxygenSaturation : null,
        respiratoryRate: patient.respiratoryRate !== "N/A" ? patient.respiratoryRate : null,
        height: patient.height !== "N/A" ? patient.height : null,
        weight: patient.weight !== "N/A" ? patient.weight : null,
        emergencyContactName: profileForm.emergencyContactName || null,
        emergencyContactPhone: profileForm.emergencyContactPhone || null,
        emergencyContactRelation: profileForm.emergencyContactRelation || null,
        medicalHistory: patient.medicalHistory !== "No medical history provided." ? patient.medicalHistory : null,
        allergies: patient.allergies !== "None listed" ? patient.allergies : null,
        currentMedications: patient.currentMedications !== "None listed" ? patient.currentMedications : null,
        primaryDoctor: patient.primaryDoctor !== "N/A" ? patient.primaryDoctor : null,
      };

      const updatedRawPatient = await patientDashboardService.updatePatientProfile(patient.id, payload);
      const data = await patientDashboardService.getDashboardData(user);
      setPatient(data.patient);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err?.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await fileUploadService.uploadFile(file, "profile-pictures");
      const payload = {
        patientId: patient.patientId !== "N/A" ? patient.patientId : null,
        userId: user?.id,
        profilePictureUrl: url,
      };
      await patientDashboardService.updatePatientProfile(patient.id, payload);
      const data = await patientDashboardService.getDashboardData(user);
      setPatient(data.patient);
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      alert("Failed to upload profile picture");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!user?.id) {
        setError("Unable to identify logged-in patient.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await patientDashboardService.getDashboardData(user);

        if (!isMounted) return;

        setPatient(data.patient);
        setRecords(data.records);
        setAppointments(data.appointments || []);
        setInvoices(data.invoices || []);
        setStats(data.stats);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.response?.data?.message || loadError.message || "Failed to load patient dashboard data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, [user?.id]);

  const latestRecords = useMemo(() => records.slice(0, 5), [records]);
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(app => (app.status || "SCHEDULED") === "SCHEDULED")
      .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
  }, [appointments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "details", label: "My Profile", icon: UserCircle },
    { id: "records", label: "Medical History", icon: FileText },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "billing", label: "My Bills", icon: Receipt },
  ];

  const renderDashboardSection = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {patient?.fullName?.split(' ')[0] || user?.firstName || 'Patient'}!</h1>
          <p className="text-sm text-slate-500 mt-1">Here is the latest update on your health profile.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md shadow-blue-900/5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer" onClick={() => setSection("appointments")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming Visits</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.upcomingAppointments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-purple-900/5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer" onClick={() => setSection("records")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Medical Records</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.totalRecords}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-emerald-900/5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer" onClick={() => setIsMedsModalOpen(true)}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Meds</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.activeMedications}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-amber-900/5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer" onClick={() => setSection("billing")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unpaid Bills</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.unpaidBills}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vitals & Upcoming */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-md shadow-slate-200/50 bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-100 mb-4">Vital Signs</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2"><Droplet className="w-4 h-4 text-red-300" /> Blood Type</div>
                  <span className="font-bold">{loading ? "..." : patient?.bloodType || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2"><Ruler className="w-4 h-4 text-blue-200" /> Height</div>
                  <span className="font-bold">{loading ? "..." : patient?.height ? `${patient.height} cm` : "N/A"}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2"><Weight className="w-4 h-4 text-emerald-200" /> Weight</div>
                  <span className="font-bold">{loading ? "..." : patient?.weight ? `${patient.weight} kg` : "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md shadow-slate-200/50 flex flex-col max-h-[400px]">
            <CardHeader title="Upcoming Appointments" />
            <CardContent className="p-6 pt-0 overflow-y-auto hide-scrollbar space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((app) => (
                  <div key={app.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-4 shrink-0">
                    <div className="bg-blue-50 text-blue-600 rounded-xl p-3 flex flex-col items-center justify-center min-w-[70px]">
                      <span className="text-xs font-bold uppercase">
                        {new Date(app.appointmentDateTime).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-bold">
                        {new Date(app.appointmentDateTime).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{app.reason || "Checkup"}</h4>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>
                          {new Date(app.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          &nbsp;with Dr. {app.doctorName || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">No upcoming appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recent Records */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md shadow-slate-200/50 flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Recent Medical Records</h3>
              <Button variant="ghost" size="sm" className="text-blue-600 font-medium" onClick={() => setSection("records")}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">Loading records...</div>
                ) : latestRecords.length > 0 ? (
                  latestRecords.map((record) => (
                    <div key={record.id} className="p-5 hover:bg-slate-50 transition-colors flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${record.recordType?.includes("LAB") ? "bg-purple-100" : "bg-slate-100"}`}>
                        {record.recordType?.includes("LAB") ? <FlaskConical className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5 text-slate-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-slate-800 truncate">{record.title}</h4>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">{record.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{record.description}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {record.recordType?.includes("LAB") ? (
                            <>
                              <Badge variant={record.testResult ? "success" : "warning"}>
                                {record.testResult ? "Completed" : "Pending"}
                              </Badge>
                              {record.attachmentUrl && (
                                <a href={fileUploadService.getFileUrl(record.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                                  {fileUploadService.isImage(record.attachmentUrl) ? <FileImage className="w-3 h-3" /> : <FileIcon className="w-3 h-3" />}
                                  Attachment
                                </a>
                              )}
                            </>
                          ) : (
                            <Badge variant={record.type?.toUpperCase() === "PRESCRIPTION" ? "success" : "blue"}>{record.type}</Badge>
                          )}
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <UserCircle className="w-3.5 h-3.5" /> {record.doctorName || "Doctor"}
                          </span>
                        </div>
                        {record.recordType?.includes("LAB") && record.testResult && (
                          <p className="text-xs text-purple-700 font-medium mt-1.5 bg-purple-50 inline-block px-2 py-0.5 rounded">Result: {record.testResult}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center flex flex-col items-center">
                    <FileText className="w-12 h-12 text-slate-200 mb-3" />
                    <p className="text-slate-500 font-medium">No medical records found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderDetailsSection = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal and emergency contact information.</p>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-sky-500"></div>
        <div className="px-6 pb-6 relative">
          <div 
            className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-4xl font-bold text-blue-600 absolute -top-12 cursor-pointer group relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {patient?.profilePictureUrl ? (
              <img src={patient.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              patient?.fullName?.charAt(0).toUpperCase() || "P"
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium text-center">Change<br/>Photo</span>
            </div>
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Hourglass className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div className="pt-16 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{patient?.fullName || "N/A"}</h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="gray">{patient?.patientId || "ID: N/A"}</Badge>
                {patient?.admissionStatus === "ADMITTED" ? (
                  <Badge variant="warning">In-Patient</Badge>
                ) : (
                  <Badge variant="success">Out-Patient</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader
            title="Personal Information"
            action={
              !isEditingProfile && (
                <button
                  onClick={startEditingProfile}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit Details
                </button>
              )
            }
          />
          <CardContent className="p-6 space-y-4">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Gender</label>
                    <select name="gender" value={profileForm.gender} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Blood Type</label>
                    <select name="bloodType" value={profileForm.bloodType} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900">
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Email Address</label>
                    <input type="email" name="email" value={profileForm.email} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Mobile Number</label>
                    <input type="text" name="mobileNumber" value={profileForm.mobileNumber} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Home Address</label>
                    <input type="text" name="address" value={profileForm.address} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                  </div>
                </div>
                <hr className="border-slate-100" />
                <h4 className="text-slate-700 font-semibold mb-2">Emergency Contact</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Name</label>
                    <input type="text" name="emergencyContactName" value={profileForm.emergencyContactName || ""} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Phone</label>
                      <input type="text" name="emergencyContactPhone" value={profileForm.emergencyContactPhone || ""} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Relation</label>
                      <input type="text" name="emergencyContactRelation" value={profileForm.emergencyContactRelation || ""} onChange={handleProfileFormChange} className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 justify-end">
                  <button onClick={cancelEditingProfile} disabled={isSavingProfile} className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50">Cancel</button>
                  <button onClick={saveProfile} disabled={isSavingProfile} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Date of Birth</p>
                    <p className="font-semibold text-slate-900">{patient?.dateOfBirth || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Age</p>
                    <p className="font-semibold text-slate-900">{patient?.age || "N/A"} years</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Gender</p>
                    <p className="font-semibold text-slate-900">{patient?.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Blood Type</p>
                    <p className="font-semibold text-slate-900">{patient?.bloodType || "N/A"}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Email Address</p>
                    <p className="font-semibold text-slate-900">{patient?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Mobile Number</p>
                    <p className="font-semibold text-slate-900">{patient?.mobileNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Home Address</p>
                    <p className="font-semibold text-slate-900">{patient?.address || "N/A"}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardHeader title="Emergency Contact" />
            <CardContent className="p-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-900">{patient?.emergencyContactName || "Not Provided"}</p>
                <div className="flex gap-4 mt-2 text-sm text-red-800">
                  <p>📞 {patient?.emergencyContactPhone || "N/A"}</p>
                  <p>👥 {patient?.emergencyContactRelation || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardHeader title="Hospital Details" />
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Primary Doctor</span>
                <span className="font-semibold text-slate-900">{patient?.primaryDoctor || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Last Updated</span>
                <span className="font-semibold text-slate-900">{patient?.updatedAt || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRecordsSection = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medical History</h1>
          <p className="text-sm text-slate-500 mt-1">Complete log of your clinical notes, prescriptions, and lab results.</p>
        </div>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading records...</div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-4 px-6 whitespace-nowrap">Date</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Doctor</th>
                    <th className="py-4 px-6">Title & Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors align-top group">
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                          {record.date}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col items-start gap-2">
                          {record.recordType?.includes("LAB") ? (
                            <>
                              <Badge variant="blue">{record.type}</Badge>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${record.testResult ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                {record.testResult ? "Completed" : "Pending"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Badge variant={record.type?.toUpperCase() === "PRESCRIPTION" ? "success" : "blue"}>{record.type}</Badge>
                              {record.type?.toUpperCase() === "PRESCRIPTION" && record.isFulfilled !== undefined && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${record.isFulfilled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  }`}>
                                  {record.isFulfilled ? "Dispensed" : "Pending Pharmacy"}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {record.doctorName?.charAt(0) || "D"}
                          </div>
                          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{record.doctorName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{record.title}</h4>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{record.description}</p>

                        {record.recordType?.includes("LAB") && record.testResult && (
                          <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-2.5">
                            <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">Result</p>
                            <p className="text-sm font-medium text-slate-800 mt-0.5">{record.testResult}</p>
                          </div>
                        )}

                        {record.attachmentUrl && (
                          <div className="mt-2">
                            {fileUploadService.isImage(record.attachmentUrl) ? (
                              <a href={fileUploadService.getFileUrl(record.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="inline-block">
                                <img src={fileUploadService.getFileUrl(record.attachmentUrl)} alt="Lab attachment" className="max-h-36 rounded-lg border border-slate-200 hover:shadow-md transition-shadow" />
                              </a>
                            ) : (
                              <a href={fileUploadService.getFileUrl(record.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                                <FileIcon className="w-3.5 h-3.5" />
                                View PDF
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No Records Found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">Your medical history is currently empty. Future clinical notes and prescriptions will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view your upcoming and past doctor visits.</p>
        </div>
        <button
          onClick={openBookingModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading appointments...</div>
          ) : appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-4 px-6 whitespace-nowrap">Date & Time</th>
                    <th className="py-4 px-6">Doctor</th>
                    <th className="py-4 px-6">Reason</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime)).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0 border border-blue-100">
                            <span className="text-[10px] font-bold uppercase leading-none">{new Date(app.appointmentDateTime).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-sm font-bold leading-none mt-0.5">{new Date(app.appointmentDateTime).getDate()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{new Date(app.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-xs text-slate-500">Duration: {app.durationMinutes} mins</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-700">Dr. {app.doctorName || "Unknown"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-700">{app.reason || "Checkup"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            (app.status || "SCHEDULED") === "COMPLETED" ? "success" :
                              (app.status || "SCHEDULED") === "SCHEDULED" || app.status === "CONFIRMED" ? "info" :
                              app.status === "PENDING" ? "warning" :
                              app.status === "REJECTED" || app.status === "CANCELLED" ? "error" :
                                "neutral"
                          }
                        >
                          {app.status || "SCHEDULED"}
                        </Badge>
                        {app.status === "REJECTED" && app.declineReason && (
                          <p className="text-xs text-red-600 mt-1 font-medium bg-red-50 p-1 rounded">Reason: {app.declineReason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No Appointments</h3>
              <p className="text-slate-500 mt-1 max-w-sm">You do not have any past or upcoming appointments scheduled.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Bills</h1>
          <p className="text-sm text-slate-500 mt-1">Review your hospital invoices and payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-1">
          <Card className="border-none shadow-md shadow-slate-200/50">
            <CardHeader title="Invoice History" />
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-slate-500 font-medium">Loading invoices...</div>
              ) : invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="py-4 px-6 whitespace-nowrap">Invoice #</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="text-sm font-semibold text-blue-600">{inv.invoiceNumber}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-slate-600">{new Date(inv.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={inv.status === "PAID" ? "success" : inv.status === "PARTIALLY_PAID" ? "warning" : inv.status === "CANCELLED" ? "error" : "neutral"}>
                              {inv.status || "ISSUED"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              View Breakdown
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">No Bills Found</h3>
                  <p className="text-slate-500 mt-1 max-w-sm">You have no invoices on your record.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Itemized Departmental Breakdown Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{selectedInvoice.invoiceNumber}</h3>
                  <Badge variant={selectedInvoice.status === "PAID" ? "success" : selectedInvoice.status === "PARTIALLY_PAID" ? "warning" : "neutral"}>
                    {selectedInvoice.status || "ISSUED"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Issued on: {new Date(selectedInvoice.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department Breakdown Table */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Departmental Breakdown</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedInvoice.items || []).length > 0 ? (
                      selectedInvoice.items.map((item, idx) => {
                        const dept = item.itemType === "MEDICINE" || item.description?.includes("[PHARMACY]") ? "Pharmacy"
                          : item.itemType === "LAB_TEST" || item.description?.includes("[LAB]") ? "Laboratory"
                          : item.itemType === "CONSULTATION" || item.description?.includes("[RECEPTION]") ? "Consultation"
                          : "Clinical";
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${
                                dept === "Pharmacy" ? "bg-emerald-100 text-emerald-800"
                                : dept === "Laboratory" ? "bg-purple-100 text-purple-800"
                                : "bg-sky-100 text-sky-800"
                              }`}>
                                {dept}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-800">{item.description}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-900">{formatCurrency(item.totalPrice || (item.quantity * item.unitPrice))}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-slate-500">General Consultation Service</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedInvoice.totalAmount + (selectedInvoice.discount || 0) - (selectedInvoice.tax || 0))}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- {formatCurrency(selectedInvoice.discount)}</span>
                </div>
              )}
              {selectedInvoice.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span>+ {formatCurrency(selectedInvoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Paid Amount:</span>
                <span>{formatCurrency(selectedInvoice.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Remaining Balance Due:</span>
                <span>{formatCurrency(selectedInvoice.balanceDue != null ? selectedInvoice.balanceDue : (selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0)))}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedInvoice(null)} className="px-5">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px]
        bg-slate-900 border-r border-slate-800
        transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">Patient<span className="text-blue-400">Portal</span></span>
          </div>
          <div className="flex items-center gap-1">
            <button className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Navigation</p>
            {menuItems.map((item) => {
              const active = section === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${active
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-slate-400"}`} />
                  {item.label}

                  {item.id === "billing" && stats.unpaidBills > 0 && (
                    <span className="ml-auto bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      {stats.unpaidBills}
                    </span>
                  )}
                  {item.id === "appointments" && stats.upcomingAppointments > 0 && (
                    <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                      {stats.upcomingAppointments}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{patient?.fullName || "Patient"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Bar (visible on all screen sizes) */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">Patient<span className="text-blue-600">Portal</span></span>
            </div>
            <div className="hidden lg:block">
              <span className="font-semibold text-slate-900 text-sm">{sectionLabels[section] || section}</span>
            </div>
          </div>
          {/* Right */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{patient?.fullName || user?.firstName || "Patient"}</p>
                <p className="text-xs text-slate-500 leading-tight">Patient</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {section === "dashboard" && renderDashboardSection()}
          {section === "details" && renderDetailsSection()}
          {section === "records" && renderRecordsSection()}
          {section === "appointments" && renderAppointmentsSection()}
          {section === "billing" && renderBillingSection()}
        </div>

        {/* Book Appointment Modal */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Book Doctor Appointment
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Schedule a consultation with hospital doctors</p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="p-6 flex flex-col gap-4">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {bookingSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor</label>
                  {loadingDoctors ? (
                    <div className="py-2 text-xs text-slate-400">Loading available doctors...</div>
                  ) : doctorsList.length === 0 ? (
                    <div className="py-2 text-xs text-amber-600">No doctors currently available</div>
                  ) : (
                    <select
                      required
                      value={bookingForm.doctorId}
                      onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {doctorsList.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          Dr. {doc.firstName || ""} {doc.lastName || ""} {doc.specialization ? `(${doc.specialization})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                    <input
                      required
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Fever, Follow-up consultation, Routine checkup"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBooking || Boolean(bookingSuccess)}
                    className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {isBooking ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      {/* Active Meds Modal */}
      {isMedsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsMedsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-500" /> Current Medications
              </h2>
              <button onClick={() => setIsMedsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {patient?.currentMedications && patient.currentMedications !== "None listed" ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800">
                  <p className="whitespace-pre-wrap leading-relaxed">{patient.currentMedications}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Pill className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500">You are not currently taking any medications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
