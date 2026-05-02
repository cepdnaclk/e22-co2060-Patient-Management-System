import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { authService } from "../../services/authService";

const ROLE_ROUTES = {
  SUPER_ADMIN: "/dashboard/admin",
  ADMIN: "/dashboard/admin",
  DOCTOR: "/dashboard/doctor",
  NURSE: "/dashboard/nurse",
  RECEPTIONIST: "/dashboard/receptionist",
  BILLING_STAFF: "/dashboard/billingstaff",
  PHARMACIST: "/dashboard/pharmacist",
  LAB_TECHNICIAN: "/dashboard/labtechnician",
  PATIENT: "/dashboard/patient",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 8000);
      return () => clearTimeout(timer); // cleanup if component unmounts
    }
  }, [error]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authService.login(email, password);
      saveLogin(data.token, data.user);

      const redirectPath = ROLE_ROUTES[data.user.role] || "/dashboard";
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent min-h-screen">
      <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl w-full">
          {/* Left Side — Branding */}
          <div className="max-w-lg max-md:mx-auto max-md:text-center glass-panel p-6 sm:p-8 rounded-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-slate-900">
              Secure Your Health
            </h1>
            <p className="text-sm mt-6 text-slate-600">
              Don't have an account?{" "}
              <NavLink
                to="/signup"
                className="text-blue-600 underline font-semibold ml-1"
              >
                Register here
              </NavLink>
            </p>
          </div>

          {/* Right Side — Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl px-6 py-10 sm:px-8 sm:py-12 max-w-md md:ml-auto
                                   max-md:mx-auto w-full"
          >
            <h2 className="text-slate-900 text-3xl font-bold mb-8">Sign in</h2>

            {/* Error Banner */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-600
                                            px-4 py-3 rounded-md mb-6 text-sm"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="bg-white/80 focus:bg-white w-full text-sm
                                               px-4 py-3 rounded-md outline-blue-600 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="bg-white/80 focus:bg-white w-full text-sm
                                               px-4 py-3 rounded-md outline-blue-600 transition-all"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-6 text-sm font-medium rounded-md
                                           text-white bg-blue-600 hover:bg-blue-700
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           transition-all cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            {/* Divider */}
            <p className="my-6 text-sm text-slate-600 text-center">
              or continue with
            </p>

            {/* Google */}
            <div className="flex justify-center">
              <button
                type="button"
                className="border-0 outline-none cursor-pointer p-2
                                           hover:bg-gray-100 rounded-full transition-all"
              >
                <img
                  src="/google-48.png"
                  alt="Google Login"
                  className="w-7 h-7"
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
