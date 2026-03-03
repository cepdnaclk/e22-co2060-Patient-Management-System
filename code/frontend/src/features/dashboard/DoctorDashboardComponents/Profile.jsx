import React from "react";

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
};

const Profile = ({ doctor, loading, error }) => {
  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow p-6 text-gray-600">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-2xl font-semibold">
          Dr. {doctor?.firstName || ""} {doctor?.lastName || ""}
        </h1>
        <p className="text-gray-600 mt-1">{doctor?.specialization || "N/A"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <h2 className="text-lg font-medium">Contact</h2>
          <p className="text-sm text-gray-600">Email: {doctor?.email || "N/A"}</p>
          <p className="text-sm text-gray-600">
            Mobile: {doctor?.mobileNumber || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Availability: {doctor?.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <h2 className="text-lg font-medium">Professional</h2>
          <p className="text-sm text-gray-600">
            License Number: {doctor?.licenseNumber || "N/A"}
          </p>
          <p className="text-sm text-gray-600">Hospital: {doctor?.hospital || "N/A"}</p>
          <p className="text-sm text-gray-600">
            Department: {doctor?.department || "N/A"}
          </p>
          <p className="text-sm text-gray-600">
            Consultation Fee: {formatCurrency(doctor?.consultationFee)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <h2 className="text-lg font-medium mb-2">Bio</h2>
        <p className="text-sm text-gray-600">{doctor?.bio || "No bio available."}</p>
      </div>
    </div>
  );
};

export default Profile;