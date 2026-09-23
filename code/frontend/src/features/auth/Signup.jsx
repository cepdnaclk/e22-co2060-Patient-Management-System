import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { authService } from "../../services/authService";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Activity,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/* password strength */
function strength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const COLORS = [
  "",
  "bg-red-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-emerald-500",
];
const LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const LTEXTS = [
  "",
  "text-red-600",
  "text-amber-600",
  "text-blue-600",
  "text-emerald-600",
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { saveLogin } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const pwd = form.password;
  const str = strength(pwd);
  const match = form.confirmPassword && pwd === form.confirmPassword;
  const noMatch = form.confirmPassword && pwd !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (pwd !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(form.mobileNumber)) {
      setError("Enter a valid mobile number (e.g. +94771234567).");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.signup(
        form.firstName,
        form.lastName,
        form.email,
        form.password,
        form.mobileNumber,
      );
      saveLogin(data.accessToken, data.refreshToken, data.user);
      navigate(ROLE_ROUTES[data.user.role] || "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 " +
    "rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none " +
    "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ───────────────────────────────────────────── */}
      <div className="hidden lg:flex w-[38%] xl:w-[36%] flex-col bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-600/15 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative flex flex-col h-full p-12">
          {/* <NavLink to="/" className="flex items-center gap-2.5 self-start">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              Patient<span className="text-blue-400">MS</span>
            </span>
          </NavLink> */}

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-[1.08] mb-5">
              Smarter
              <br />
              healthcare
              <br />
              management.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-xs mb-10">
              Create your account and start managing hospital operations smarter from
              day one.
            </p>

            <div className="space-y-3">
              {[
                "Real-time patient triage",
                "Integrated lab management",
                "Automated billing & invoicing",
                "Role-based access control",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-xs">
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="text-blue-400 font-semibold hover:underline underline-offset-4"
              >
                Sign in here
              </NavLink>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        <div className="min-h-full flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[480px]">
            {/* Mobile logo */}
            <NavLink to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-900 dark:text-white tracking-tight">
                Patient<span className="text-blue-600">MS</span>
              </span>
            </NavLink>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Create your account
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Already registered?{" "}
                <NavLink
                  to="/login"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4"
                >
                  Sign in
                </NavLink>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <div className="flex justify-center mb-6">
              {GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const data = await authService.googleLogin(credentialResponse.credential);
                      saveLogin(data.accessToken, data.refreshToken, data.user);
                      navigate(ROLE_ROUTES[data.user.role] || "/dashboard");
                    } catch (err) {
                      setError(err.response?.data?.message || "Google sign-up failed.");
                    }
                  }}
                  onError={() => setError("Google sign-up failed. Please try again.")}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="300"
                  locale="en"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setError("Google Sign-Up requires a Client ID in your .env file.")}
                  className="w-full max-w-[300px] flex items-center justify-center gap-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-[15px] rounded-md transition-all shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  Sign up with Google
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400 font-medium shrink-0">
                or register with email
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="John"
                      value={form.firstName}
                      onChange={set("firstName")}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Last name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Smith"
                      value={form.lastName}
                      onChange={set("lastName")}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="john@hospital.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+94771234567"
                    value={form.mobileNumber}
                    onChange={set("mobileNumber")}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    value={pwd}
                    onChange={set("password")}
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Strength meter */}
                {pwd && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i <= str ? COLORS[str] : "bg-slate-200 dark:bg-slate-700"}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${LTEXTS[str]}`}>
                      {LABELS[str]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    className={inputClass + " pr-11"}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {match && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                  </p>
                )}
                {noMatch && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1.5">
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
              By signing up you agree to our{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
