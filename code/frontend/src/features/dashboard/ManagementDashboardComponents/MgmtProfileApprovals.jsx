import React, { useEffect, useState } from "react";
import { profileChangeService } from "../../../services/profileChangeService";
import { authService } from "../../../services/authService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  FileText, UserPlus, CheckCircle2, XCircle, Clock, AlertCircle, Search, Loader2, Eye, Mail, Phone, User, Shield
} from "lucide-react";

const statusBadge = (status) => {
  switch (status) {
    case "PENDING": return <Badge variant="warning" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
    case "APPROVED": return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
    case "REJECTED": return <Badge variant="danger" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
    default: return null;
  }
};

const MgmtProfileApprovals = () => {
  const [tab, setTab] = useState("changes");

  // Profile change requests
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Pending signups
  const [pendingSignups, setPendingSignups] = useState([]);
  const [filteredSignups, setFilteredSignups] = useState([]);

  // Shared state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredRequests(requests);
      setFilteredSignups(pendingSignups);
    } else {
      const q = search.toLowerCase();
      setFilteredRequests(
        requests.filter(
          (r) =>
            r.userFirstName?.toLowerCase().includes(q) ||
            r.userLastName?.toLowerCase().includes(q) ||
            r.userEmail?.toLowerCase().includes(q) ||
            r.targetRole?.toLowerCase().includes(q)
        )
      );
      setFilteredSignups(
        pendingSignups.filter(
          (u) =>
            u.firstName?.toLowerCase().includes(q) ||
            u.lastName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, requests, pendingSignups]);

  const loadAll = () => {
    setLoading(true);
    setError("");
    Promise.all([
      profileChangeService.getAllRequests().catch(() => []),
      authService.fetchPendingSignups().catch(() => []),
    ])
      .then(([reqs, signups]) => {
        setRequests(reqs);
        setPendingSignups(signups);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  };

  const handleApproveChange = async (id) => {
    setProcessing(true);
    try {
      await profileChangeService.approveRequest(id, reviewNotes);
      setActionMsg("Request approved successfully!");
      setSelectedRequest(null);
      setReviewNotes("");
      loadAll();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectChange = async (id) => {
    setProcessing(true);
    try {
      await profileChangeService.rejectRequest(id, reviewNotes);
      setActionMsg("Request rejected.");
      setSelectedRequest(null);
      setReviewNotes("");
      loadAll();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveSignup = async (userId) => {
    setProcessing(true);
    setError("");
    try {
      await authService.approveSignup(userId);
      setActionMsg("Patient signup approved! Profile created.");
      loadAll();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve signup");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSignup = async (userId) => {
    setProcessing(true);
    setError("");
    try {
      await authService.rejectSignup(userId);
      setActionMsg("Patient signup rejected.");
      loadAll();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject signup");
    } finally {
      setProcessing(false);
    }
  };

  const parseChanges = (json) => {
    try { return JSON.parse(json); } catch { return {}; }
  };

  const renderDiff = (proposedJson) => {
    const changes = parseChanges(proposedJson);
    return (
      <div className="grid grid-cols-2 gap-2 text-sm">
        {Object.entries(changes).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
            <span className="text-slate-900">{String(val)}</span>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "changes", label: "Profile Changes", icon: FileText, count: requests.filter((r) => r.status === "PENDING").length },
    { id: "signups", label: "New Patient Signups", icon: UserPlus, count: pendingSignups.length },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-violet-600" />
            Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve profile changes and new patient signups
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-shadow" />
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5" /> {actionMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white text-violet-700 border border-b-white border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === t.id ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-slate-500">Loading...</p>
            </div>
          ) : tab === "changes" ? (
            <>
              {filteredRequests.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>{search ? "No requests match your search." : "No profile change requests found."}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requestor</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center shrink-0">
                              <span className="font-bold text-violet-700 text-sm">
                                {req.userFirstName?.charAt(0)}{req.userLastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{req.userFirstName} {req.userLastName}</p>
                              <p className="text-xs text-slate-400">{req.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={req.targetRole === "DOCTOR" ? "emerald" : "blue"} className="text-xs">
                            {req.targetRole}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">{statusBadge(req.status)}</td>
                        <td className="p-4 text-right">
                          <Button variant="soft" size="sm" icon={Eye}
                            onClick={() => { setSelectedRequest(req); setReviewNotes(""); setError(""); }}
                            className="bg-violet-50 text-violet-700 hover:bg-violet-100">
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              {filteredSignups.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>{search ? "No signups match your search." : "No pending patient signups."}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSignups.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0 border border-amber-200/50">
                              <span className="font-bold text-amber-700 text-sm">
                                {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-slate-400">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-3.5 h-3.5" />
                              {u.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3.5 h-3.5" />
                              {u.mobileNumber || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="warning" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={XCircle}
                              onClick={() => handleRejectSignup(u.id)}
                              disabled={processing}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleApproveSignup(u.id)}
                              disabled={processing}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Profile Change Review Modal */}
      <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? `Profile Change - ${selectedRequest.userFirstName} ${selectedRequest.userLastName}` : ""}>
        {selectedRequest && (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{selectedRequest.userFirstName} {selectedRequest.userLastName}</span>
                <Badge variant={selectedRequest.targetRole === "DOCTOR" ? "emerald" : "blue"} className="text-xs">{selectedRequest.targetRole}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{selectedRequest.userEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Proposed Changes</h4>
              {renderDiff(selectedRequest.proposedChanges)}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Review Notes</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes about your decision..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-20 resize-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedRequest(null)} className="px-6">Cancel</Button>
              {selectedRequest.status === "PENDING" && (
                <>
                  <Button variant="outline" onClick={() => handleRejectChange(selectedRequest.id)}
                    disabled={processing} className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    icon={processing ? Loader2 : XCircle}>
                    Reject
                  </Button>
                  <Button variant="primary" onClick={() => handleApproveChange(selectedRequest.id)}
                    disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    icon={processing ? Loader2 : CheckCircle2}>
                    Approve
                  </Button>
                </>
              )}
              {selectedRequest.status !== "PENDING" && (
                <span className="text-sm text-slate-500 py-2">This request has already been {selectedRequest.status.toLowerCase()}.</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MgmtProfileApprovals;
