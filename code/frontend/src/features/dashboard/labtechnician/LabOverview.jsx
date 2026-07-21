import React, { useEffect, useState } from "react";
import { labTechnicianService } from "../../../services/labTechnicianService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { FlaskRoundIcon as Flask, ClipboardList, Clock, Activity } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card className="border-none shadow-md shadow-slate-200/50">
    <CardContent className="p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LabOverview = ({ onNavigate }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    labTechnicianService.getAllLabTests()
      .then((tests) => {
        setStats({
          total: tests.length,
          pending: tests.filter((t) => !t.testResult).length,
          completed: tests.filter((t) => t.testResult).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Flask className="w-7 h-7 text-cyan-600" />
          Lab Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">Overview of lab test activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Total Lab Tests" value={loading ? "..." : stats.total} color="bg-cyan-500" />
        <StatCard icon={Clock} label="Pending Results" value={loading ? "..." : stats.pending} color="bg-amber-500" />
        <StatCard icon={Activity} label="Completed" value={loading ? "..." : stats.completed} color="bg-emerald-500" />
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50 bg-gradient-to-br from-cyan-50 to-sky-50">
        <CardContent className="p-8 text-center">
          <Flask className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Lab Technician Panel</h2>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto">
            View pending lab test requests, enter test results, and manage laboratory records.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onNavigate("queue")}
              className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
            >
              View Lab Queue
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabOverview;
