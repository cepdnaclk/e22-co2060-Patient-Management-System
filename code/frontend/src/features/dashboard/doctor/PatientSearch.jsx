import React, { useState, useEffect, useRef } from "react";
import { Search, User, Phone, FileText, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import api from "../../../services/axiosClient";

export default function PatientSearch({ onSelectPatient }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [allPatients, setAllPatients] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAllPatients = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/patients');
        const patients = data?.content || data || [];
        console.log("PatientSearch loaded patients:", patients);
        setAllPatients(patients);
        setResults(patients);
      } catch (err) {
        console.error("PatientSearch failed to load patients:", err);
        setError("Failed to load patients.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPatients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter patients locally when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(allPatients);
      return;
    }
    const term = query.toLowerCase();
    const filtered = allPatients.filter(p => {
      const fName = String(p.firstName || "");
      const lName = String(p.lastName || "");
      const pId = String(p.patientId || p.displayId || p.id || "");
      const phone = String(p.mobileNumber || (p.user && p.user.mobileNumber) || "");
      const nic = String(p.nic || "");
      
      return fName.toLowerCase().includes(term) ||
             lName.toLowerCase().includes(term) ||
             pId.toLowerCase().includes(term) ||
             phone.includes(term) ||
             nic.toLowerCase().includes(term);
    });
    setResults(filtered);
  }, [query, allPatients]);

  const handleSelect = (patient) => {
    setIsOpen(false);
    setQuery(""); // Reset search query so next time it shows all patients
    if (onSelectPatient) onSelectPatient(patient);
  };

  return (
    <div className="w-full max-w-3xl relative" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Search patients by name, NIC, or phone..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full bg-white border border-slate-200 rounded-full py-4 pl-12 pr-12 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || error || (query.length >= 2 && !loading && results.length === 0)) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-2xl shadow-slate-900/10 border-slate-200">
          <CardContent className="p-2">
            {error ? (
              <div className="p-4 text-center text-sm text-red-600 font-medium">{error}</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center text-slate-500">
                <User className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-medium text-slate-700 mb-1">No patients found</p>
                <p className="text-sm">Try searching with a different term.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {results.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelect(patient)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {patient.patientId && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {patient.patientId}
                            </span>
                          )}
                          {(patient.mobileNumber || patient.user?.mobileNumber) && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {patient.mobileNumber || patient.user.mobileNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4 self-end sm:self-auto flex items-center gap-3">
                      {patient.admissionStatus === "ADMITTED" && (
                        <Badge variant="warning">In-Patient</Badge>
                      )}
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
