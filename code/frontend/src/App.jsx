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
import AmbientOrbs from "./components/AmbientOrbs.jsx";
import NavbarLanding from "./components/NavbarLanding.jsx";

function App() {
  const location = useLocation();

  // Define the paths where you want the Landing Navbar
  const landingPaths = ["/", "/signup", "/login","/about","/contact","/faq"];
  const isLandingPage = landingPaths.includes(location.pathname);

  return (
    <div className="app-shell">
      <AmbientOrbs />
      <div className="app-surface">
        {/* Conditional Navbar Rendering */}
        {isLandingPage ? <NavbarLanding /> : <Navbar />}

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
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminDashboard />
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
  );
}

export default App;
