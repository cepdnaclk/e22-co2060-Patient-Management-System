import React, { useEffect, useState } from "react";
import { managementService } from "../../../services/managementService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  UserCog, Mail, Phone, Save, AlertCircle, CheckCircle2, Pencil, Search, X
} from "lucide-react";

const ROLE_OPTIONS = [
  "MANAGEMENT", "DOCTOR", "NURSE", "RECEPTIONIST",
  "PHARMACIST", "LAB_TECHNICIAN", "BILLING_STAFF", "PATIENT",
];

const getRoleColor = (role) => {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "purple";
    case "MANAGEMENT":
      return "violet";
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

const MgmtUsersList = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        users.filter(
          (u) =>
            u.firstName?.toLowerCase().includes(q) ||
            u.lastName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  const loadUsers = () => {
    setLoading(true);
    managementService
      .fetchUsers()
      .then((data) => setUsers(data))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
      role: user.role || "",
      isActive: true,
      password: "",
    });
    setError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    setSaving(true);
    setError("");

    const payload = { ...editForm };
    if (!payload.password) delete payload.password;

    managementService
      .updateUser(editUser.id, payload)
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === editUser.id ? updated : u)));
        setEditUser(null);
        setActionMsg("User updated successfully!");
        setTimeout(() => setActionMsg(""), 3000);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to update user";
        setError(msg);
      })
      .finally(() => setSaving(false));
  };

  const inputStyles =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-shadow text-slate-800 text-sm";
  const labelStyles = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-7 h-7 text-violet-600" />
            Manage Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit user profiles, change roles, and update contact details (Admin accounts are protected)
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-shadow"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          {actionMsg}
        </div>
      )}

      {error && !editUser && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium animate-in fade-in zoom-in-95 duration-300">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading users...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>{search ? "No users match your search." : "No users found."}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0 border border-violet-200/50">
                          <span className="font-bold text-violet-700 text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-400">ID: {user.id}</p>
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
                      <Badge variant={getRoleColor(user.role)} className="text-xs px-2 py-0.5">
                        {user.role?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="soft"
                        size="sm"
                        icon={Pencil}
                        onClick={() => openEdit(user)}
                        className="bg-violet-50 text-violet-700 hover:bg-violet-100"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User Details">
        {editUser && (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>First Name</label>
                <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Last Name</label>
                <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Email</label>
                <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Mobile Number</label>
                <input type="tel" name="mobileNumber" value={editForm.mobileNumber} onChange={handleEditChange} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Role</label>
                <select name="role" value={editForm.role} onChange={handleEditChange} className={inputStyles}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyles}>New Password <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="password" name="password" value={editForm.password} onChange={handleEditChange} className={inputStyles} placeholder="Leave blank to keep current" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setEditUser(null)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                isLoading={saving}
                icon={Save}
                className="flex-1 bg-violet-600 hover:bg-violet-700 focus:ring-violet-500 shadow-violet-500/20"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MgmtUsersList;
