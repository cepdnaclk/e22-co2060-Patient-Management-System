import React from "react";
import { Search, Filter, AlertTriangle } from "lucide-react";

import React, { useState } from "react";
import { Search, Filter, AlertTriangle, Loader2 } from "lucide-react";

export default function AssignedPatientsList({ patients, selectedPatient, onSelect, loading }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
          <span>Patients ({patients.length})</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No patients found.</div>
        ) : filtered.map((patient) => {
          const isSelected = selectedPatient?.id === patient.id;
          return (
            <button
              key={patient.id}
              onClick={() => onSelect(patient)}
              className={`w-full text-left p-4 border-b border-slate-100 transition-all duration-200 ${
                isSelected 
                  ? "bg-teal-50 border-l-4 border-l-teal-500" 
                  : "hover:bg-slate-50 border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold ${isSelected ? "text-teal-900" : "text-slate-800"}`}>
                  {patient.name}
                </span>
                {patient.status === 'Critical' && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">{patient.room}</p>
              
              <div className="flex gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                  ${patient.status === 'Critical' ? 'bg-red-100 text-red-700' : 
                    patient.status === 'Needs Attention' ? 'bg-orange-100 text-orange-700' : 
                    'bg-emerald-100 text-emerald-700'}
                `}>
                  {patient.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
