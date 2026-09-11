import Signup from "./features/auth/Signup.jsx";
import Login from "./features/auth/Login.jsx";
import "./App.css";
import Home from "./pages/Home.jsx";
import Aboutus from "./pages/Aboutus.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import FAQ from "./pages/FAQ.jsx";
import DoctorDashboard from "./features/dashboard/DoctorDashboard.jsx";
import NurseDashboard from "./features/dashboard/NurseDashboard.jsx";
import PatientDashboard from "./features/dashboard/PatientDashboard.jsx";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import AdminDashboard from "./features/dashboard/AdminDashboard.jsx";
import ReceptionistDashboard from "./features/dashboard/ReceptionistDashboard.jsx";
import PharmacistDashboard from "./features/dashboard/PharmacistDashboard.jsx";
import LabTechnicianDashboard from "./features/dashboard/LabTechnicianDashboard.jsx";
import ManagementDashboard from "./features/dashboard/ManagementDashboard.jsx";
import BillingStaffDashboard from "./features/dashboard/BillingStaffDashboard.jsx";
import AmbientOrbs from "./components/AmbientOrbs.jsx";
import NavbarLanding from "./components/NavbarLanding.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const AuthWrapper = GOOGLE_CLIENT_ID ? GoogleOAuthProvider : ({ children }) => <>{children}</>;
const authWrapperProps = GOOGLE_CLIENT_ID ? { clientId: GOOGLE_CLIENT_ID } : {};

function App() {
  const location = useLocation();

  // Define the paths where you want the Landing Navbar
  const landingPaths = ["/", "/signup", "/login", "/about", "/contact", "/faq"];
  const isLandingPage = landingPaths.includes(location.pathname);
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <AuthWrapper {...authWrapperProps}>
      <div className="app-shell">
        <AmbientOrbs />
        <div className="app-surface">
          {/* Conditional Navbar Rendering */}
          {!isAuthPage && isLandingPage && <NavbarLanding />}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Aboutus />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Doctor Dashboard — ROUTING FIX: Removed NURSE from allowedRoles.
                Nurses now have their own dedicated dashboard below.
                See: docs/learning/04-spa-routing-patterns.md */}
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute
                  allowedRoles={["DOCTOR", "ADMIN", "SUPER_ADMIN"]}
                >
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            {/* NEW: Nurse Dashboard — previously nurses shared the Doctor Dashboard.
                Each role should have its own tailored view. */}
            <Route
              path="/dashboard/nurse"
              element={
                <ProtectedRoute
                  allowedRoles={["NURSE", "ADMIN", "SUPER_ADMIN"]}
                >
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute allowedRoles={["PATIENT"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "MANAGEMENT"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/management"
              element={
                <ProtectedRoute allowedRoles={["MANAGEMENT"]}>
                  <ManagementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/receptionist"
              element={
                <ProtectedRoute allowedRoles={["RECEPTIONIST", "ADMIN", "SUPER_ADMIN"]}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/pharmacist"
              element={
                <ProtectedRoute allowedRoles={["PHARMACIST", "ADMIN", "SUPER_ADMIN"]}>
                  <PharmacistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/labtechnician"
              element={
                <ProtectedRoute allowedRoles={["LAB_TECHNICIAN", "ADMIN", "SUPER_ADMIN"]}>
                  <LabTechnicianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/billingstaff"
              element={
                <ProtectedRoute allowedRoles={["BILLING_STAFF", "ADMIN", "SUPER_ADMIN"]}>
                  <BillingStaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <div className="w-screen h-screen bg-white flex flex-col items-center justify-center p-4">
                  <div className="relative w-full max-w-md h-64 flex justify-center items-end mb-8">
                    {/* SVG Graphic */}
                    <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Background Buildings (Grey) */}
                      <rect x="60" y="100" width="40" height="80" fill="#f0f0f0" />
                      <rect x="80" y="120" width="60" height="60" fill="#e8e8e8" />
                      <rect x="160" y="60" width="50" height="120" fill="#f0f0f0" />
                      <rect x="230" y="40" width="60" height="140" fill="#f0f0f0" />
                      <rect x="280" y="80" width="40" height="100" fill="#e8e8e8" />
                      <rect x="300" y="110" width="50" height="70" fill="#f0f0f0" />
                      
                      {/* Floating Pink Lines */}
                      <line x1="70" y1="70" x2="110" y2="70" stroke="#ff8da1" strokeWidth="2" strokeLinecap="round" />
                      <line x1="90" y1="120" x2="130" y2="120" stroke="#ff8da1" strokeWidth="2" strokeLinecap="round" />
                      <line x1="260" y1="50" x2="280" y2="50" stroke="#ff8da1" strokeWidth="2" strokeLinecap="round" />
                      <line x1="290" y1="70" x2="310" y2="70" stroke="#ff8da1" strokeWidth="2" strokeLinecap="round" />
                      <line x1="300" y1="30" x2="340" y2="30" stroke="#ff8da1" strokeWidth="2" strokeLinecap="round" />
                      <line x1="280" y1="100" x2="320" y2="100" stroke="#ff8da1" strokeWidth="2" strokeLinecap="round" />

                      {/* Ground Line */}
                      <line x1="40" y1="180" x2="360" y2="180" stroke="#ff8da1" strokeWidth="2" />

                      {/* No Entry Sign */}
                      <line x1="200" y1="180" x2="200" y2="80" stroke="#ff8da1" strokeWidth="4" />
                      <circle cx="200" cy="70" r="15" fill="white" stroke="#ff8da1" strokeWidth="2" />
                      <text x="200" y="68" fontSize="6" fill="#ff8da1" textAnchor="middle" fontWeight="bold">NO</text>
                      <text x="200" y="75" fontSize="5" fill="#ff8da1" textAnchor="middle" fontWeight="bold">ENTRY</text>
                      
                      <path d="M190 180 L210 180 L205 175 L195 175 Z" fill="#ff8da1" />

                      {/* Left Barrier */}
                      <rect x="130" y="140" width="60" height="15" fill="#ffe0e6" stroke="#ff8da1" strokeWidth="1.5" />
                      <rect x="130" y="160" width="60" height="15" fill="#ffe0e6" stroke="#ff8da1" strokeWidth="1.5" />
                      {/* Barrier legs */}
                      <line x1="140" y1="140" x2="140" y2="180" stroke="#ff8da1" strokeWidth="2.5" />
                      <line x1="180" y1="140" x2="180" y2="180" stroke="#ff8da1" strokeWidth="2.5" />
                      <line x1="140" y1="135" x2="140" y2="140" stroke="#ff8da1" strokeWidth="2.5" />
                      <line x1="180" y1="135" x2="180" y2="140" stroke="#ff8da1" strokeWidth="2.5" />
                      {/* Barrier stripes */}
                      <line x1="135" y1="155" x2="145" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="145" y1="155" x2="155" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="155" y1="155" x2="165" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="165" y1="155" x2="175" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="175" y1="155" x2="185" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="135" y1="175" x2="145" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="145" y1="175" x2="155" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="155" y1="175" x2="165" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="165" y1="175" x2="175" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="175" y1="175" x2="185" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <circle cx="140" cy="135" r="2" fill="#ff8da1" />
                      <circle cx="180" cy="135" r="2" fill="#ff8da1" />

                      {/* Right Barrier */}
                      <rect x="210" y="140" width="60" height="15" fill="#ffe0e6" stroke="#ff8da1" strokeWidth="1.5" />
                      <rect x="210" y="160" width="60" height="15" fill="#ffe0e6" stroke="#ff8da1" strokeWidth="1.5" />
                      {/* Barrier legs */}
                      <line x1="220" y1="140" x2="220" y2="180" stroke="#ff8da1" strokeWidth="2.5" />
                      <line x1="260" y1="140" x2="260" y2="180" stroke="#ff8da1" strokeWidth="2.5" />
                      <line x1="220" y1="135" x2="220" y2="140" stroke="#ff8da1" strokeWidth="2.5" />
                      <line x1="260" y1="135" x2="260" y2="140" stroke="#ff8da1" strokeWidth="2.5" />
                      {/* Barrier stripes */}
                      <line x1="215" y1="155" x2="225" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="225" y1="155" x2="235" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="235" y1="155" x2="245" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="245" y1="155" x2="255" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="255" y1="155" x2="265" y2="140" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="215" y1="175" x2="225" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="225" y1="175" x2="235" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="235" y1="175" x2="245" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="245" y1="175" x2="255" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <line x1="255" y1="175" x2="265" y2="160" stroke="#ff8da1" strokeWidth="1" />
                      <circle cx="220" cy="135" r="2" fill="#ff8da1" />
                      <circle cx="260" cy="135" r="2" fill="#ff8da1" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold mb-3" style={{ color: '#ff708d' }}>
                      Access Denied
                    </h1>
                    <p className="text-gray-400 text-base mb-1">You currently does not have access to this page.</p>
                    <p className="text-gray-400 text-base">Please try again later.</p>
                  </div>
                </div>
              }
            />
            {/* 404 CATCH-ALL ROUTE — Must be LAST in the Routes list.
                The path="*" wildcard matches any URL that wasn't matched above.
                Without this, users visiting /dashboard/typo see a blank page.
                See: docs/learning/04-spa-routing-patterns.md */}
            <Route
              path="*"
              element={
                <div className="text-center p-16">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">
                    Page Not Found
                  </h2>
                  <p className="text-gray-400 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Go Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App;