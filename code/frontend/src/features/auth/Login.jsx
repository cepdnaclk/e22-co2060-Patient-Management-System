import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { authService } from "../../services/authService";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Activity, ShieldCheck, Users, Clock } from "lucide-react";

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

const benefits = [
  { icon: ShieldCheck, text: "HIPAA-compliant & fully encrypted" },
  { icon: Users, text: "Role-based access for every team member" },
  { icon: Clock, text: "Real-time data, 99.9% uptime guaranteed" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 8000);
    return () => clearTimeout(t);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authService.login(email, password);
      saveLogin(data.accessToken, data.refreshToken, data.user);
      navigate(ROLE_ROUTES[data.user.role] || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Branding ─────────────────────────────────── */}
      <div className="hidden lg:flex w-[45%] xl:w-[42%] flex-col bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        {/* geometric accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative flex flex-col h-full p-12">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 self-start">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-white text-lg tracking-tight">
              Patient<span className="text-blue-400">MS</span>
            </span>
          </NavLink>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-6 inline-flex">
              <span className="px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/25 rounded-full uppercase tracking-wider">
                Trusted by 500+ clinicians
              </span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-[1.08] mb-5">
              Your patients,<br />always in safe<br />hands.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm mb-10">
              Access your secure healthcare portal and manage patient records with confidence.
            </p>

            <div className="space-y-3.5">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/25 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer quote */}
          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm italic leading-relaxed">
              "PatientMS cut our admin time in half. It's now indispensable."
            </p>
            <p className="text-slate-600 text-xs mt-2 font-medium">— Dr. Kumari Silva, Chief of Medicine</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[400px]">

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
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-medium text-slate-400 uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Google Sign-In */}
          <a
            href={`${import.meta.env.VITE_API_URL || "http://localhost:8082"}/oauth2/authorization/google`}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </a>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <NavLink to="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4">
                Create one free
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}