import React, { useState } from "react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { UserPlus, CheckCircle2, AlertCircle, FileText, User } from "lucide-react";
import { adminPatientsService } from "../../../services/adminPatientsService";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    dateOfBirth: "",
    bloodType: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [registeredPatientId, setRegisteredPatientId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        admissionStatus: "Registered"
      };
      
      const created = await adminPatientsService.createPatient(payload);
      setRegisteredPatientId(created.patientId || `ID-${created.id}`);
      setSubmitted(true);
      setFormData({
        firstName: "", lastName: "", email: "", mobileNumber: "", gender: "", 
        dateOfBirth: "", bloodType: "", address: "", 
        emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: ""
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to register patient. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyles = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-shadow text-slate-800 text-sm";
  const labelStyles = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-sky-600" />
          Patient Registration
        </h1>
        <p className="text-sm text-slate-500 mt-1">Register a new patient into the hospital system.</p>
      </div>

      {submitted && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-lg">Registration Successful!</p>
            <p className="text-sm mt-1">Patient has been registered. System generated ID: <span className="font-bold bg-emerald-100 px-2 py-0.5 rounded">{registeredPatientId}</span></p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card className="border-none shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="bg-sky-500 h-2 w-full"></div>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-5 h-5 text-sky-500" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyles}>First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputStyles} placeholder="John" />
                </div>
                <div>
                  <label className={labelStyles}>Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputStyles} placeholder="Doe" />
                </div>
                <div>
                  <label className={labelStyles}>Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className={inputStyles} />
                </div>
                <div>
                  <label className={labelStyles}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputStyles}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyles}>Blood Type</label>
                  <select name="bloodType" value={formData.bloodType} onChange={handleChange} className={inputStyles}>
                    <option value="">Select Type</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyles}>Mobile Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required className={inputStyles} placeholder="+1 555-0123" />
                </div>
                <div>
                  <label className={labelStyles}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyles} placeholder="patient@example.com" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelStyles}>Home Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className={`${inputStyles} resize-none`} placeholder="123 Main St, City, Country" />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
              <h3 className="text-md font-bold text-amber-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Emergency Contact (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyles}>Name</label>
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className={inputStyles} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className={labelStyles}>Relationship</label>
                  <input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} className={inputStyles} placeholder="Spouse, Parent..." />
                </div>
                <div>
                  <label className={labelStyles}>Phone</label>
                  <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className={inputStyles} placeholder="+1 555-0987" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" className="px-8" onClick={() => setFormData({
                firstName: "", lastName: "", email: "", mobileNumber: "", gender: "", 
                dateOfBirth: "", bloodType: "", address: "", 
                emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: ""
              })}>
                Clear Form
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 px-8 bg-sky-600 hover:bg-sky-700">
                {isSaving ? "Registering Patient..." : "Register Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRegistration;
