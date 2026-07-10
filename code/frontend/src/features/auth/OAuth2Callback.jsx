import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const ROLE_ROUTES = {
  SUPER_ADMIN: "/dashboard/admin",
  ADMIN: "/dashboard/admin",
  MANAGEMENT: "/dashboard/management",
  DOCTOR: "/dashboard/doctor",
  NURSE: "/dashboard/doctor",
  RECEPTIONIST: "/dashboard/receptionist",
  BILLING_STAFF: "/dashboard/billingstaff",
  PHARMACIST: "/dashboard/pharmacist",
  LAB_TECHNICIAN: "/dashboard/labtechnician",
  PATIENT: "/dashboard/patient",
};

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");

    if (!accessToken || !refreshToken || !userParam) {
      setError("Invalid OAuth2 response. Missing tokens.");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      saveLogin(accessToken, refreshToken, user);
      navigate(ROLE_ROUTES[user.role] || "/dashboard", { replace: true });
    } catch {
      setError("Failed to process login. Please try again.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Sign-In Failed</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <a href="/login" className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
}
