import React from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Table, TableHead, TableRow, TableHeader, TableCell } from "../../../components/ui/Table.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Users, Calendar, AlertTriangle, FileText, ArrowRight, Plus } from "lucide-react";

const formatTime = (dateTime) => {
  if (!dateTime) return "--:--";
  const date = new Date(dateTime);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function DoctorOverview({ stats, appointments, loading, error, onUpdateStatus }) {
  const statCards = [
    { id: 1, label: "Total Patients", value: stats?.patients ?? 0, icon: Users, color: "blue" },
    { id: 2, label: "Appointments Today", value: stats?.appointmentsToday ?? 0, icon: Calendar, color: "emerald" },
    { id: 3, label: "Active Appointments", value: stats?.activeAppointments ?? 0, icon: Calendar, color: "blue" },
    { id: 4, label: "Critical Alerts", value: stats?.criticalAlerts ?? 0, icon: AlertTriangle, color: "red" },
    { id: 5, label: "Medical Records", value: stats?.records ?? 0, icon: FileText, color: "purple" },
  ];

  const getColorClasses = (color) => {
    const classes = {
      blue: "bg-blue-50 text-blue-600",
      emerald: "bg-emerald-50 text-emerald-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
    };
    return classes[color];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's happening today.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.id} hover className="border-none shadow-md shadow-slate-200/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${getColorClasses(card.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {loading ? (
                      <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md shadow-slate-200/50 flex flex-col">
            <CardHeader 
              title="Today's Appointments" 
              action={
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              }
            />
            <div className="p-0 flex-1 overflow-x-auto">
              <Table className="border-0 shadow-none rounded-none">
                <TableHead>
                  <TableRow>
                    <TableHeader>Time</TableHeader>
                    <TableHeader>Patient</TableHeader>
                    <TableHeader>Reason</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right">Action</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Calendar className="w-8 h-8 mb-2 opacity-50" />
                          <p>Loading appointments...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : appointments?.length ? (
                    appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium text-slate-900">
                          {formatTime(apt.appointmentDateTime)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              {apt.patientName ? apt.patientName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span className="font-medium text-slate-700">{apt.patientName || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 max-w-[200px] truncate">
                          {apt.reason || "General Consultation"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={apt.status === "COMPLETED" ? "success" : apt.status === "CANCELLED" ? "gray" : "info"}>
                            {apt.status || "SCHEDULED"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {apt.status !== "COMPLETED" && apt.status !== "CANCELLED" ? (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => onUpdateStatus(apt.id, "COMPLETED")} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                Complete
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => onUpdateStatus(apt.id, "CANCELLED")} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">--</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Calendar className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-base font-medium text-slate-600">No appointments</p>
                          <p className="text-sm mt-1">You have no appointments scheduled for today.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full border-none shadow-md shadow-slate-200/50">
            <CardHeader title="Quick Actions" />
            <CardContent className="p-5 flex flex-col gap-3">
              <Button variant="soft" className="w-full justify-start py-3" icon={Plus}>
                New Prescription
              </Button>
              <Button variant="secondary" className="w-full justify-start py-3" icon={FileText}>
                Add Clinical Note
              </Button>
              <Button variant="secondary" className="w-full justify-start py-3" icon={Users}>
                Register Patient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
