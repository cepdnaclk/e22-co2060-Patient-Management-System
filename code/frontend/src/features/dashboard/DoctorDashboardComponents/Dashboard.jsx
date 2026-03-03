import React from "react";

const formatTime = (dateTime) => {
  if (!dateTime) return "--:--";
  const date = new Date(dateTime);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Dashboard = ({ stats, appointments, loading, error }) => {
  const statCards = [
    { id: 1, label: "Patients", value: stats?.patients ?? 0 },
    {
      id: 2,
      label: "Appointments Today",
      value: stats?.appointmentsToday ?? 0,
    },
    { id: 3, label: "Critical Alerts", value: stats?.criticalAlerts ?? 0 },
    { id: 4, label: "Medical Records", value: stats?.records ?? 0 },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of today's activity</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-4 rounded shadow flex flex-col justify-between [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)]"
          >
            <div>
              <div className="text-sm text-gray-500">{card.label}</div>
              <div className="text-2xl font-bold">
                {loading ? "..." : card.value}
              </div>
            </div>
            <div className="text-xs text-green-600 mt-3">
              {loading ? "Loading" : "Updated now"}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)] overflow-hidden">
          <h2 className="text-lg font-medium mb-3">Today's Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="py-2">Time</th>
                  <th className="py-2">Patient</th>
                  <th className="py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-2 text-sm text-gray-500" colSpan={3}>
                      Loading appointments...
                    </td>
                  </tr>
                ) : appointments?.length ? (
                  appointments.map((appointment) => (
                    <tr key={appointment.id} className="odd:bg-slate-50">
                      <td className="py-2">
                        {formatTime(appointment.appointmentDateTime)}
                      </td>
                      <td className="py-2">{appointment.patientName || "N/A"}</td>
                      <td className="py-2">{appointment.reason || "General"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 text-sm text-gray-500" colSpan={3}>
                      No appointments for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)] overflow-hidden">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="flex flex-col space-y-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Create Prescription
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded">
              Add Patient Note
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded">
              Message Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;