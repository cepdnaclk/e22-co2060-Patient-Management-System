import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";

const ROLE_OPTIONS = [
  "SUPER_ADMIN",
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "LAB_TECHNICIAN",
  "BILLING_STAFF",
  "PATIENT",
];

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [roleEdits, setRoleEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    adminService
      .fetchUsers()
      .then((data) => {
        setUsers(data);
        const nextRoles = {};
        data.forEach((u) => {
          nextRoles[u.id] = u.role;
        });
        setRoleEdits(nextRoles);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (id, value) => {
    setRoleEdits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveRole = (id) => {
    const role = roleEdits[id];
    if (!role) return;

    setActionMsg("");
    adminService
      .updateUserRole(id, role)
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
        setActionMsg("Role updated successfully");
        setTimeout(() => setActionMsg(""), 2000);
      })
      .catch(() => setError("Failed to update role"));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this user?")) return;

    setActionMsg("");
    adminService
      .deleteUser(id)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setActionMsg("User deleted successfully");
        setTimeout(() => setActionMsg(""), 2000);
      })
      .catch(() => setError("Failed to delete user"));
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-gray-600">View, update roles, or delete users</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      {actionMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {actionMsg}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading users...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Mobile</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-800">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-4 text-sm text-gray-800">{user.email}</td>
                  <td className="p-4 text-sm text-gray-800">{user.mobileNumber}</td>
                  <td className="p-4 text-sm text-gray-800">
                    <select
                      value={roleEdits[user.id] || user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md"
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm text-gray-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveRole(user.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersList;
