import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { FileText, FlaskConical, Pill, Stethoscope, Clock, FileIcon, FileImage, Hourglass } from "lucide-react";
import { fileUploadService } from "../../../services/fileUploadService";

export default function PatientRecordList({ records, loading }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRecords = records.filter((record) => {
    const type = (record.recordType || record.type || "").toLowerCase();
    const title = (record.title || "").toLowerCase();

    const isLab = type.includes("lab");
    const isPrescription = type.includes("prescription") || title.includes("prescription");

    if (activeFilter === "all") return true;
    if (activeFilter === "clinical") return !isLab && !isPrescription;
    if (activeFilter === "lab") return isLab;
    if (activeFilter === "prescription") return isPrescription;
    return true;
  });

  const getIconForType = (record) => {
    const t = (record.recordType || record.type || "").toLowerCase();
    const txt = (record.title || "").toLowerCase();
    if (t.includes("lab")) return <FlaskConical className="w-5 h-5 text-purple-600" />;
    if (t.includes("prescription") || txt.includes("prescription")) return <Pill className="w-5 h-5 text-emerald-600" />;
    return <Stethoscope className="w-5 h-5 text-blue-600" />;
  };

  const getBadgeVariant = (record) => {
    const t = (record.recordType || record.type || "").toLowerCase();
    const txt = (record.title || "").toLowerCase();
    if (t.includes("lab")) return record.testResult ? "success" : "warning";
    if (t.includes("prescription") || txt.includes("prescription")) return "success";
    return "info";
  };

  const getBadgeLabel = (record) => {
    const t = (record.recordType || record.type || "").toLowerCase();
    if (t.includes("lab")) return record.testResult ? "Completed" : "Pending";
    if (t.includes("prescription")) return "Prescription";
    return record.type || record.recordType || "Record";
  };

  const tabs = [
    { id: "all", label: "All Records" },
    { id: "clinical", label: "Clinical Notes" },
    { id: "lab", label: "Lab Results" },
    { id: "prescription", label: "Prescriptions" },
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
            filteredRecords.map((record) => {
              const isLab = (record.recordType || record.type || "").toLowerCase().includes("lab");
              const isPending = isLab && !record.testResult;


              return (
                <div
                  key={record.id}
                  className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all duration-200 group ${
                    isPending ? "border-amber-200 hover:border-amber-300" : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border transition-colors ${
                        isPending
                          ? "bg-amber-50 border-amber-100 group-hover:bg-amber-100"
                          : "bg-slate-50 border-slate-100 group-hover:bg-white"
                      }`}>
                        {getIconForType(record)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{record.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          {record.date} • Dr. {record.doctor}
                          {isLab && record.testName && (
                            <span className="text-purple-500 font-semibold">• {record.testName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && <Hourglass className="w-4 h-4 text-amber-500 animate-pulse" />}
                      <Badge variant={getBadgeVariant(record)} className="text-xs">
                        {getBadgeLabel(record)}
                      </Badge>
                    </div>
                  </div>

                  <div className="pl-[52px] space-y-3">
                    {isLab && record.testResult && (
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Test Result</p>
                        <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{record.testResult}</p>
                      </div>
                    )}

                    {record.description && (
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {record.description}
                      </p>
                    )}

                    {record.attachmentUrl && (
                      <div>
                        {fileUploadService.isImage(record.attachmentUrl) ? (
                          <a
                            href={fileUploadService.getFileUrl(record.attachmentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img
                              src={fileUploadService.getFileUrl(record.attachmentUrl)}
                              alt="Lab attachment"
                              className="max-h-48 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                            />
                          </a>
                        ) : (
                          <a
                            href={fileUploadService.getFileUrl(record.attachmentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            <FileIcon className="w-4 h-4" />
                            View PDF Attachment
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
