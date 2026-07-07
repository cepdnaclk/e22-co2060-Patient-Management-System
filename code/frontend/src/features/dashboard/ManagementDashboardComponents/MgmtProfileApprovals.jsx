import React, { useEffect, useState } from "react";
import { profileChangeService } from "../../../services/profileChangeService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  FileText, CheckCircle2, XCircle, Clock, AlertCircle, Search, Loader2, Eye, Mail, Phone, User
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
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [selected, setSelected] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(requests);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        requests.filter(
          (r) =>
            r.userFirstName?.toLowerCase().includes(q) ||
            r.userLastName?.toLowerCase().includes(q) ||
            r.userEmail?.toLowerCase().includes(q) ||
            r.targetRole?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, requests]);

  const loadRequests = () => {
    setLoading(true);
    profileChangeService
      .getAllRequests()
      .then((data) => setRequests(data))
      .catch(() => setError("Failed to load profile change requests"))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    setProcessing(true);
    try {
      await profileChangeService.approveRequest(id, reviewNotes);
      setActionMsg("Request approved successfully!");
      setSelected(null);
      setReviewNotes("");
      loadRequests();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    setProcessing(true);
    try {
      await profileChangeService.rejectRequest(id, reviewNotes);
      setActionMsg("Request rejected.");
      setSelected(null);
      setReviewNotes("");
      loadRequests();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject");
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

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-violet-600" />
            Profile Change Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve/reject profile change requests from doctors and nurses
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search requests..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-shadow" />
        </div>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5" /> {actionMsg}
        </div>
      )}
      {error && !selected && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
              <p className="text-slate-500">Loading requests...</p>
            </div>
          ) : filtered.length === 0 ? (
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
                {filtered.map((req) => (
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
                        onClick={() => { setSelected(req); setReviewNotes(""); setError(""); }}
                        className="bg-violet-50 text-violet-700 hover:bg-violet-100">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)}
        title={selected ? `Profile Change - ${selected.userFirstName} ${selected.userLastName}` : ""}>
        {selected && (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{selected.userFirstName} {selected.userLastName}</span>
                <Badge variant={selected.targetRole === "DOCTOR" ? "emerald" : "blue"} className="text-xs">{selected.targetRole}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{selected.userEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Submitted: {new Date(selected.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Proposed Changes</h4>
              {renderDiff(selected.proposedChanges)}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Review Notes</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional notes about your decision..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-20 resize-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelected(null)} className="px-6">Cancel</Button>
              {selected.status === "PENDING" && (
                <>
                  <Button variant="outline" onClick={() => handleReject(selected.id)}
                    disabled={processing} className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    icon={processing ? Loader2 : XCircle}>
                    Reject
                  </Button>
                  <Button variant="primary" onClick={() => handleApprove(selected.id)}
                    disabled={processing} className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    icon={processing ? Loader2 : CheckCircle2}>
                    Approve
                  </Button>
                </>
              )}
              {selected.status !== "PENDING" && (
                <span className="text-sm text-slate-500 py-2">This request has already been {selected.status.toLowerCase()}.</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MgmtProfileApprovals;
