import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { patientDashboardService } from "../../services/patientDashboardService";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [section, setSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeMedications: 0,
    allergiesCount: 0,
    profileStatus: "Incomplete",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setStats(data.stats);
      } catch (loadError) {
        if (!isMounted) return;

        setError(
          loadError.response?.data?.message ||
            loadError.message ||
            "Failed to load patient dashboard data.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const latestRecords = useMemo(() => records.slice(0, 5), [records]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "details", label: "My Details" },
    { id: "records", label: "Medical Records" },
  ];

  const renderDashboardSection = () => (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Patient Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your account and health data</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
          <p className="text-sm text-gray-500">Patient ID</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {loading ? "..." : patient?.patientId || "N/A"}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
          <p className="text-sm text-gray-500">Medical Records</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {loading ? "..." : stats.totalRecords}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
          <p className="text-sm text-gray-500">Current Medications</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {loading ? "..." : stats.activeMedications}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
          <p className="text-sm text-gray-500">Profile Status</p>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {loading ? "..." : stats.profileStatus}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-lg font-medium mb-3">Profile Summary</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium text-slate-800">Name:</span>{" "}
              {loading ? "Loading..." : patient?.fullName || "N/A"}
            </p>
            <p>
              <span className="font-medium text-slate-800">Email:</span>{" "}
              {loading ? "Loading..." : patient?.email || "N/A"}
            </p>
            <p>
              <span className="font-medium text-slate-800">Primary Doctor:</span>{" "}
              {loading ? "Loading..." : patient?.primaryDoctor || "N/A"}
            </p>
            <p>
              <span className="font-medium text-slate-800">Blood Type:</span>{" "}
              {loading ? "Loading..." : patient?.bloodType || "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-lg font-medium mb-3">Recent Medical Records</h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading records...</p>
            ) : latestRecords.length ? (
              latestRecords.map((record) => (
                <div key={record.id} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-800">{record.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {record.type} • {record.date}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No records available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsSection = () => (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-xl shadow p-6 [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
        <h1 className="text-2xl font-semibold text-slate-800">My Details</h1>
        <p className="text-sm text-gray-600 mt-1">Patient profile and contact information</p>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading details...</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="font-medium text-slate-800">Full Name:</span> {patient?.fullName || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Patient ID:</span> {patient?.patientId || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Date of Birth:</span> {patient?.dateOfBirth || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Age:</span> {patient?.age || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Gender:</span> {patient?.gender || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Blood Type:</span> {patient?.bloodType || "N/A"}</p>
            </div>

            <div className="space-y-2">
              <p><span className="font-medium text-slate-800">Email:</span> {patient?.email || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Mobile:</span> {patient?.mobileNumber || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Address:</span> {patient?.address || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Primary Doctor:</span> {patient?.primaryDoctor || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Admission Status:</span> {patient?.admissionStatus || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Last Updated:</span> {patient?.updatedAt || "N/A"}</p>
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-medium text-slate-800">Emergency Contact</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p><span className="font-medium text-slate-800">Name:</span> {patient?.emergencyContactName || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Phone:</span> {patient?.emergencyContactPhone || "N/A"}</p>
              <p><span className="font-medium text-slate-800">Relation:</span> {patient?.emergencyContactRelation || "N/A"}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
            <h2 className="text-lg font-medium text-slate-800">Health Summary</h2>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p><span className="font-medium text-slate-800">Allergies:</span> {patient?.allergies || "None listed"}</p>
              <p><span className="font-medium text-slate-800">Current Medications:</span> {patient?.currentMedications || "None listed"}</p>
              <p><span className="font-medium text-slate-800">Medical History:</span> {patient?.medicalHistory || "No medical history provided."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecordsSection = () => (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-xl shadow p-6 [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]">
        <h1 className="text-2xl font-semibold text-slate-800">Medical Records</h1>
        <p className="text-sm text-gray-600 mt-1">Your recent clinical history and notes</p>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading records...</p>
        ) : records.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Doctor</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="odd:bg-slate-50 align-top">
                    <td className="py-2 pr-4 text-sm text-gray-700">{record.date}</td>
                    <td className="py-2 pr-4 text-sm text-gray-700">{record.type}</td>
                    <td className="py-2 pr-4 text-sm text-gray-700">{record.doctorName}</td>
                    <td className="py-2 pr-4 text-sm text-slate-800 font-medium">{record.title}</td>
                    <td className="py-2 text-sm text-gray-700">{record.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-500">No medical records found.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative bg-[#f7f6f9] min-h-screen">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}
      <div className="flex items-start">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-full min-h-screen bg-white shadow-lg p-6 transition-transform duration-300 lg:static lg:translate-x-0 lg:w-[250px] lg:min-h-screen ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-800">Patient Panel</h2>
          <p className="text-xs text-gray-500 mt-1 break-all">{user?.email || ""}</p>

          <nav className="mt-6 space-y-2">
            {menuItems.map((item) => {
              const active = section === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-[#F0F8FF] text-green-800"
                      : "text-slate-800 hover:bg-[#F0F8FF]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="w-full">
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-slate-700"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Patient Panel</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
          {section === "dashboard" && renderDashboardSection()}
          {section === "details" && renderDetailsSection()}
          {section === "records" && renderRecordsSection()}
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
