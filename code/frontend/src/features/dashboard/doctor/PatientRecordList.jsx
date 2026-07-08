import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { FileText, FlaskConical, Pill, Stethoscope, Clock } from "lucide-react";

export default function PatientRecordList({ records, loading }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRecords = records.filter((record) => {
    const type = (record.type || record.recordType || "").toLowerCase();
    const title = (record.title || "").toLowerCase();
    
    const isLab = type.includes("lab");
    const isPrescription = type.includes("prescription") || title.includes("prescription");
    
    if (activeFilter === "all") return true;
    if (activeFilter === "clinical") return !isLab && !isPrescription;
    if (activeFilter === "lab") return isLab;
    if (activeFilter === "prescription") return isPrescription;
    return true;
  });

  const getIconForType = (type, title) => {
    const t = (type || "").toLowerCase();
    const txt = (title || "").toLowerCase();
    if (t.includes("lab")) return <FlaskConical className="w-5 h-5 text-purple-600" />;
    if (t.includes("prescription") || txt.includes("prescription")) return <Pill className="w-5 h-5 text-emerald-600" />;
    return <Stethoscope className="w-5 h-5 text-blue-600" />;
  };

  const getBadgeVariant = (type, title) => {
    const t = (type || "").toLowerCase();
    const txt = (title || "").toLowerCase();
    if (t.includes("lab")) return "purple";
    if (t.includes("prescription") || txt.includes("prescription")) return "success";
    return "info";
  };

  const tabs = [
    { id: "all", label: "All Records" },
    { id: "clinical", label: "Clinical Notes" },
    { id: "lab", label: "Lab Results" },
    { id: "prescription", label: "Prescriptions" }
  ];

  return (
    <Card noPadding className="border-none shadow-md shadow-slate-200/50 h-full flex flex-col">
      <CardHeader className="pb-0 border-b-0">
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                activeFilter === tab.id 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 flex flex-col items-center text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p>Loading medical records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center text-slate-400">
              <FileText className="w-12 h-12 mb-4 opacity-30" />
              <p className="font-medium text-slate-600 text-lg">No records found</p>
              <p className="text-sm">There are no medical records matching this filter.</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div 
                key={record.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                      {getIconForType(record.recordType || record.type, record.title)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{record.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {record.date} • Dr. {record.doctor}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(record.recordType || record.type, record.title)}>
                    {record.recordType || record.type}
                  </Badge>
                </div>
                <div className="pl-[52px]">
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {record.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
