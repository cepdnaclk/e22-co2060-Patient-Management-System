import React, { useState } from "react";

const Dashboard = () => {

  const stats = [
    { id: 1, label: "Total Users", value: 542 },
    { id: 2, label: "Active Doctors", value: 42 },
    { id: 3, label: "Active Nurses", value: 28 },
    { id: 4, label: "Appointments", value: 312 },
  ];

  const recentActivities = [
    { id: 1, action: "New Doctor Added", timestamp: "2 hours ago", status: "Success" },
    { id: 2, action: "New Nurse Added", timestamp: "4 hours ago", status: "Success" },
    { id: 3, action: "System Backup", timestamp: "1 day ago", status: "Completed" },
    { id: 4, action: "User Report Generated", timestamp: "2 days ago", status: "Completed" },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-sm text-gray-500 mb-2">{s.label}</div>
            <div className="text-3xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-green-600 mt-2">Updated now</div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-col space-y-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Generate System Report
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              View User Analytics
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Manage Permissions
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;