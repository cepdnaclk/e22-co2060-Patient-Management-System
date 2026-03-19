import React, { useState } from "react";
// import { userService } from "../../../../services/userService";
import { userService } from "../../../services/userService";
const AddStaff = () => {
  const [role, setRole] = useState(""); // "" = not selected yet
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // Doctor-specific
    specialization: "",
    licenseNumber: "",
    experience: "",
    availability: "",
    // Nurse-specific
    certification: "",
    department: "",
    shift: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    // Reset form when role changes
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialization: "",
      licenseNumber: "",
      experience: "",
      availability: "",
      certification: "",
      department: "",
      shift: "",
    });
    setSubmitted(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!role) {
      setError("Please select a staff role.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const userRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.phone,
        password,
        role: role.toUpperCase(),
      };

      const createdUser = await userService.createUser(userRequest);

      if (role === "doctor") {
        await userService.createDoctorProfile(createdUser.id, {
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          hospital: formData.department || "General Hospital",
          department: formData.department || "General",
          consultationFee: 0,
          bio: "Doctor profile created from admin dashboard",
          isAvailable: true,
        });
      }

      setSuccessMessage(`${role === "doctor" ? "Doctor" : "Nurse"} registered successfully.`);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add staff. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = role === "doctor";
  const isNurse = role === "nurse";

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Add Staff Member</h1>
        <p className="text-sm text-gray-600">
          Register a new doctor or nurse to the system
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center text-sm">
            {successMessage}
          </div>
        )}
        {submitted && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center font-medium">
            ✓ {role === "doctor" ? "Doctor" : "Nurse"} added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection - always visible */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Select Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={role}
              onChange={handleRoleChange}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">-- Select Role --</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
            </select>
            {/* custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center transform translate-y-[9px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 transform rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Common fields - shown for both roles */}
          {role && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={isDoctor ? "John" : "Jane"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+94-71-234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Choose a secure password"
                />
              </div>

              {/* ── Doctor specific fields ── */}
              {isDoctor && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="LIC123456"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── Nurse specific fields ── */}
              {isNurse && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ICU"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Shift
                      </label>
                      <input
                        type="text"
                        name="shift"
                        value={formData.shift}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Morning"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit buttons - only shown when role is selected */}
              {role && (
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                  >
                    {loading ? "Saving..." : `Add ${isDoctor ? "Doctor" : "Nurse"}`}
                  </button>
                  <button
                    type="reset"
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Clear Form
                  </button>
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddStaff;