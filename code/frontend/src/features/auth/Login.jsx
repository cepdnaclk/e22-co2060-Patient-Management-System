import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { authService } from "../../services/authService";
import { Mail, Lock, UserCircle2, ArrowRight } from "lucide-react";

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
      const timer = setTimeout(() => setError(""), 8000);
      return () => clearTimeout(timer);
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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 ">
      {/* Background Glows (Inspired by the purple/blue swirls in image_03ec62.jpg) */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-60" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side — Branding & Welcome (Mirroring the 'Welcome' text in the image) */}
        <div className="hidden md:flex flex-col items-start justify-center p-8">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4">
            Welcome.
          </h1>
          <p className="text-slate-500 text-lg max-w-sm leading-relaxed mb-8">
            Access your secure healthcare portal and manage your patient records efficiently.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
            <div className="w-10 h-[1px] bg-slate-300"></div>
            PATIENT MANAGEMENT SYSTEM
          </div>
        </div>

        {/* Right Side — Glassmorphism Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 transition-all">
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4 border border-slate-100">
                <UserCircle2 size={40} className="text-blue-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs text-center">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="USERNAME / EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/60 focus:bg-white border border-slate-200 rounded-full py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/60 focus:bg-white border border-slate-200 rounded-full py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-xs font-semibold text-blue-600 hover:underline underline-offset-4">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                {loading ? "Verifying..." : "Login"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-200/50 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <NavLink to="/signup" className="text-blue-600 font-bold hover:underline">
                  Register here
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}