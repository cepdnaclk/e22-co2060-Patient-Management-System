import React, { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { 
  UserCircle, Trash2, Save, AlertCircle, CheckCircle2, UserCog, Mail, Phone 
} from "lucide-react";

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

const getRoleColor = (role) => {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "purple";
    case "DOCTOR":
      return "emerald";
    case "NURSE":
      return "blue";
    case "PATIENT":
      return "amber";
    default:
      return "slate";
  }
};

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
    setError("");
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
    setError("");
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
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-7 h-7 text-indigo-600" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">View, update roles, or manage system access</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No users found in the system.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Access</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="font-bold text-slate-600">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                          <Badge variant={getRoleColor(user.role)} className="mt-1 text-[10px] px-1.5 py-0">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5" />
                          {user.mobileNumber || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={roleEdits[user.id] || user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Save}
                          onClick={() => handleSaveRole(user.id)}
                          disabled={roleEdits[user.id] === user.role}
                        >
                          Save
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;
