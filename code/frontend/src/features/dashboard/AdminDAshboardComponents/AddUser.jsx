import React, { useState } from "react";
import { adminService } from "../../../services/adminService";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { UserPlus, ShieldCheck, CheckCircle2, AlertCircle, Stethoscope, Activity, FileText } from "lucide-react";

const AddStaff = () => {
  const [role, setRole] = useState(""); // "" = not selected yet

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    // Reset form when role changes
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      mobileNumber: formData.phone,
      role: role.toUpperCase(),
    };

    setIsSaving(true);
    adminService
      .createUser(payload)
      .then(async (createdUser) => {
        // If the role is Doctor, also create the Doctor profile
        if (role === "doctor") {
          try {
            await adminService.createDoctorProfile(createdUser.id, {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              mobileNumber: formData.phone,
              specialization: formData.specialization,
              licenseNumber: formData.licenseNumber,
              isAvailable: true,
              hospital: "General Hospital",
            });
          } catch (docErr) {
            console.error("Failed to create doctor profile:", docErr);
            throw new Error("User created, but failed to create Doctor profile.");
          }
        }
        
        setSubmitted(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          specialization: "",
          licenseNumber: "",
          experience: "",
          availability: "",
          certification: "",
          department: "",
          shift: "",
        });
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err.message || "Failed to add user";
        setError(msg);
      })
      .finally(() => setIsSaving(false));
  };

  const isDoctor = role === "doctor";
  const isNurse = role === "nurse";

  const inputStyles = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow text-slate-800 text-sm";
  const labelStyles = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-indigo-600" />
            Add Staff Member
          </h1>
          <p className="text-sm text-slate-500 mt-1">Register a new doctor or nurse to the system with their credentials and specialization details.</p>
        </div>
      </div>

      {submitted && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold">Success!</p>
            <p className="text-sm">{role === "doctor" ? "Doctor" : "Nurse"} profile has been created and credentials have been generated.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold">Registration Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="bg-indigo-600 h-2 w-full"></div>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Role Selection section */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                Staff Role & Access Level
              </h3>
              <div className="max-w-md">
                <label className={labelStyles}>
                  Select Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={role}
                    onChange={handleRoleChange}
                    required
                    className={`${inputStyles} appearance-none pr-10`}
                  >
                    <option value="">-- Choose a staff role --</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="lab_technician">Lab Technician</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {role && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Personal & Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyles}>First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputStyles} placeholder={isDoctor ? "John" : "Jane"} />
                    </div>
                    <div>
                      <label className={labelStyles}>Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputStyles} placeholder="Doe" />
                    </div>
                    <div>
                      <label className={labelStyles}>Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputStyles} placeholder="name@hospital.com" />
                    </div>
                    <div>
                      <label className={labelStyles}>Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputStyles} placeholder="+94 7X XXX XXXX" />
                    </div>
                    <div className="md:col-span-2 max-w-md">
                      <label className={labelStyles}>Temporary Password</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} className={inputStyles} placeholder="At least 8 characters" />
                      <p className="text-xs text-slate-500 mt-1.5">User will be prompted to change this upon first login.</p>
                    </div>
                  </div>
                </div>

                {/* Doctor Specific Info */}
                {isDoctor && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Stethoscope className="w-5 h-5 text-emerald-500" />
                      Professional Credentials (Doctor)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100/50">
                      <div>
                        <label className={labelStyles}>Specialization</label>
                        <select name="specialization" value={formData.specialization} onChange={handleChange} required className={inputStyles}>
                          <option value="">Select Specialization</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="General Medicine">General Medicine</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Surgery">Surgery</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelStyles}>Medical License Number</label>
                        <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className={inputStyles} placeholder="LIC123456" />
                      </div>
                      <div>
                        <label className={labelStyles}>Years of Experience</label>
                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} required min="0" className={inputStyles} placeholder="10" />
                      </div>
                      <div>
                        <label className={labelStyles}>Availability Status</label>
                        <select name="availability" value={formData.availability} onChange={handleChange} required className={inputStyles}>
                          <option value="">Select Availability</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Visiting/Contract</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nurse Specific Info */}
                {isNurse && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Professional Credentials (Nurse)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50">
                      <div>
                        <label className={labelStyles}>Certification Level</label>
                        <select name="certification" value={formData.certification} onChange={handleChange} required className={inputStyles}>
                          <option value="">Select Certification</option>
                          <option value="RN">Registered Nurse (RN)</option>
                          <option value="LPN">Licensed Practical Nurse (LPN)</option>
                          <option value="CNA">Certified Nursing Assistant (CNA)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelStyles}>License Number</label>
                        <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className={inputStyles} placeholder="LIC789456" />
                      </div>
                      <div>
                        <label className={labelStyles}>Years of Experience</label>
                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} required min="0" className={inputStyles} placeholder="5" />
                      </div>
                      <div>
                        <label className={labelStyles}>Assigned Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} required className={inputStyles}>
                          <option value="">Select Department</option>
                          <option value="ICU">Intensive Care Unit (ICU)</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Surgery">Surgery</option>
                          <option value="General Ward">General Ward</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 max-w-md">
                        <label className={labelStyles}>Typical Shift</label>
                        <select name="shift" value={formData.shift} onChange={handleChange} required className={inputStyles}>
                          <option value="">Select Shift</option>
                          <option value="Morning">Morning (6 AM - 2 PM)</option>
                          <option value="Evening">Evening (2 PM - 10 PM)</option>
                          <option value="Night">Night (10 PM - 6 AM)</option>
                          <option value="Flexible">Flexible/Rotating</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <Button type="button" variant="outline" className="px-8" onClick={() => setRole("")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="flex-1 px-8 capitalize">
                    {isSaving ? "Creating Account..." : `Register ${role.replace("_", " ")}`}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStaff;