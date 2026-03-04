import React, { useState } from "react";

const Stats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const stats = [
    { id: 1, label: "Total Users", value: 542, change: "+12%", icon: "👥" },
    { id: 2, label: "Active Doctors", value: 42, change: "+5%", icon: "👨‍⚕️" },
    { id: 3, label: "Active Nurses", value: 28, change: "+3%", icon: "👩‍⚕️" },
    { id: 4, label: "Total Appointments", value: 312, change: "+18%", icon: "📅" },
  ];

  const doctorsBySpecialization = [
    { name: "Cardiology", count: 8, percentage: 19 },
    { name: "Neurology", count: 6, percentage: 14 },
    { name: "Orthopedics", count: 7, percentage: 17 },
    { name: "General Medicine", count: 12, percentage: 29 },
    { name: "Pediatrics", count: 5, percentage: 12 },
    { name: "Surgery", count: 4, percentage: 9 },
  ];

  const nursesByDepartment = [
    { name: "ICU", count: 6, percentage: 21 },
    { name: "Emergency", count: 5, percentage: 18 },
    { name: "Cardiology", count: 4, percentage: 14 },
    { name: "Pediatrics", count: 3, percentage: 11 },
    { name: "Surgery", count: 5, percentage: 18 },
    { name: "General Ward", count: 5, percentage: 18 },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">System Statistics</h1>
        <p className="text-sm text-gray-600">Comprehensive overview of hospital management metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{s.icon}</div>
              <span className="text-green-600 text-sm font-semibold">{s.change}</span>
            </div>
            <div className="text-sm text-gray-500 mb-1">{s.label}</div>
            <div className="text-3xl font-bold text-gray-800">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctors by Specialization */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Doctors by Specialization</h2>
          <div className="space-y-4">
            {doctorsBySpecialization.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">{item.count} doctors</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nurses by Department */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Nurses by Department</h2>
          <div className="space-y-4">
            {nursesByDepartment.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">{item.count} nurses</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg. Consultations/Day</h3>
          <p className="text-3xl font-bold text-gray-800">45</p>
          <p className="text-xs text-gray-500 mt-2">Across all departments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Bed Occupancy Rate</h3>
          <p className="text-3xl font-bold text-gray-800">78%</p>
          <p className="text-xs text-gray-500 mt-2">Current utilization</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Patient Satisfaction</h3>
          <p className="text-3xl font-bold text-gray-800">4.7/5</p>
          <p className="text-xs text-gray-500 mt-2">Average rating</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;