import Signup from "./features/auth/Signup.jsx";
import Login from "./features/auth/Login.jsx";
import "./App.css";
import Home from "./pages/Home.jsx";
import Aboutus from "./pages/Aboutus.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import FAQ from "./pages/FAQ.jsx";
import DoctorDashboard from "./features/dashboard/DoctorDashboard.jsx";
import PatientDashboard from "./features/dashboard/PatientDashboard.jsx";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import AdminDashboard from "./features/dashboard/AdminDashboard.jsx";
import ReceptionistDashboard from "./features/dashboard/ReceptionistDashboard.jsx";
import PharmacistDashboard from "./features/dashboard/PharmacistDashboard.jsx";
import LabTechnicianDashboard from "./features/dashboard/LabTechnicianDashboard.jsx";
import ManagementDashboard from "./features/dashboard/ManagementDashboard.jsx";
import AmbientOrbs from "./components/AmbientOrbs.jsx";
import NavbarLanding from "./components/NavbarLanding.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  const location = useLocation();

  // Define the paths where you want the Landing Navbar
  const landingPaths = ["/", "/signup", "/login", "/about", "/contact", "/faq"];
  const isLandingPage = landingPaths.includes(location.pathname);
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-shell">
        <AmbientOrbs />
        <div className="app-surface">
          {/* Conditional Navbar Rendering */}
          {!isAuthPage && (isLandingPage ? <NavbarLanding /> : <Navbar />)}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Aboutus />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboards and Protected Routes */}
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute
                  allowedRoles={["DOCTOR", "NURSE", "ADMIN", "SUPER_ADMIN"]}
                >
                  <DoctorDashboard />
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
              path="/unauthorized"
              element={
                <div className="text-center p-16">
                  <h1 className="text-2xl font-bold text-red-600">
                    Access Denied
                  </h1>
                  <p>You do not have permission to view this page.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;