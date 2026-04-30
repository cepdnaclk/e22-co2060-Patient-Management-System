import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { authService } from "../../services/authService";

const ROLE_ROUTES = {
  SUPER_ADMIN: "/dashboard/superadmin",
  ADMIN: "/dashboard/admin",
  DOCTOR: "/dashboard/doctor",
  NURSE: "/dashboard/nurse",
  RECEPTIONIST: "/dashboard/receptionist",
  BILLING_STAFF: "/dashboard/billingstaff",
  PHARMACIST: "/dashboard/pharmacist",
  LAB_TECHNICIAN: "/dashboard/labtechnician",
  PATIENT: "/dashboard/patient",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { saveLogin } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side password match check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Basic mobile number format check
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setError("Enter a valid mobile number (e.g. +94771234567).");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup(
        firstName,
        lastName,
        email,
        password,
        mobileNumber,
      );

      // Save token + user — this logs them in immediately
      saveLogin(data.token, data.user);

      // Redirect to the right dashboard based on role
      // Signup always creates PATIENT — so goes to /dashboard/patient
      const redirectPath = ROLE_ROUTES[data.user.role] || "/dashboard";
      navigate(redirectPath);
    } catch (err) {
      // Shows backend message e.g. "This email is already registered."
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reusable input class
  const inputClass =
    "bg-slate-100 focus:bg-transparent w-full text-sm text-slate-900 " +
    "px-4 py-2.5 rounded-sm border border-gray-200 " +
    "focus:border-blue-600 outline-0 transition-all";

  return (
    <div>
      {/* Header */}
      <div
        className="text-center bg-linear-to-r from-blue-800 to-blue-400
                            min-h-44 sm:p-6 p-4 flex flex-col items-center justify-center"
      >
        <h1 className="sm:text-3xl text-2xl text-white font-medium mt-3">
          Create your free account
        </h1>
        <p className="text-white text-sm mt-2 mb-10">
          Already have an account?
          <NavLink to="/login" className="underline font-semibold">
            Sign in
          </NavLink>
        </p>
      </div>

      {/* Form Card */}
      <div className="mx-4 sm:mx-6 mb-8 -mt-16">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl max-md:max-w-xl mx-auto bg-white
                               shadow-[0_2px_13px_-6px_rgba(0,0,0,0.4)]
                               sm:p-8 p-4 rounded-md"
        >
          {/* Error Banner */}
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-600
                                        px-4 py-3 rounded-md mb-6 text-sm"
            >
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            className="w-full px-4 py-2.5 flex items-center justify-center
                                   rounded-md text-slate-900 text-sm font-medium
                                   cursor-pointer bg-slate-100 hover:bg-slate-200
                                   transition-all"
          >
            <img src="/google-48.png" alt="Google" className="w-6 h-6 mr-2" />
            Continue with Google
          </button>

          {/* Divider */}
          <div
            className="my-6 flex items-center
                                    before:flex-1 before:border-t before:border-neutral-300
                                    after:flex-1  after:border-t  after:border-neutral-300"
          >
            <p className="mx-4 text-center text-slate-500 text-sm">Or</p>
          </div>

          {/* Fields Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                First Name
              </label>
              <input
                type="text"
                required
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Last Name
              </label>
              <input
                type="text"
                required
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                placeholder="+94771234567"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-5 text-sm font-medium rounded-sm
                                       cursor-pointer text-white bg-blue-600
                                       hover:bg-blue-700 disabled:opacity-50
                                       disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
