import React, { useEffect, useState } from "react";
import { labTechnicianService } from "../../../services/labTechnicianService";
import { fileUploadService } from "../../../services/fileUploadService";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  FlaskRoundIcon as Flask, ClipboardList, AlertCircle, CheckCircle2, Search, X, Save, Loader2, Eye, User, FileText, Microscope, FileIcon, FileImage
} from "lucide-react";

const LabTestQueue = () => {
  const [tests, setTests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [resultForm, setResultForm] = useState({ testResult: "", description: "" });
  const [resultAttachment, setResultAttachment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    let list = tests;
    if (filterStatus === "pending") list = list.filter((t) => !t.testResult);
    else if (filterStatus === "completed") list = list.filter((t) => t.testResult);

    if (!search.trim()) {
      setFiltered(list);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        list.filter(
          (t) =>
            t.testName?.toLowerCase().includes(q) ||
            t.doctorName?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, tests, filterStatus]);

  const loadTests = () => {
    setLoading(true);
    labTechnicianService
      .getAllLabTests()
      .then((data) => setTests(data))
      .catch(() => setError("Failed to load lab tests"))
      .finally(() => setLoading(false));
  };

  const openResultEntry = (test) => {
    setSelectedTest(test);
    setResultForm({
      testResult: test.testResult || "",
      description: test.description || "",
    });
    setResultAttachment(null);
    setError("");
  };

  const handleSaveResult = async () => {
    if (!selectedTest) return;
    if (!resultForm.testResult.trim()) {
      setError("Test result is required");
      return;
    }

    setSaving(true);
    try {
      let attachmentUrl = selectedTest.attachmentUrl || null;
      if (resultAttachment) {
        const uploadResult = await fileUploadService.uploadFile(resultAttachment);
        attachmentUrl = uploadResult.fileName;
      }

      await labTechnicianService.updateLabResult(
        selectedTest.id,
        resultForm.testResult,
        resultForm.description,
        attachmentUrl
      );
      setActionMsg("Lab result saved successfully!");
      setSelectedTest(null);
      loadTests();
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lab result");
    } finally {
      setSaving(false);
    }
  };

  const filters = [
    { id: "all", label: "All Tests" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
  ];

  const inputStyles =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-shadow text-slate-800 text-sm";
  const labelStyles = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Microscope className="w-7 h-7 text-cyan-600" />
            Lab Test Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View and enter results for laboratory tests
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-shadow"
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

      {error && !selectedTest && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === f.id
                ? "bg-cyan-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-4" />
              <p className="text-slate-500">Loading lab tests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Flask className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>{search ? "No tests match your search." : "No lab tests found."}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient ID</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attachment</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-sky-100 flex items-center justify-center shrink-0 border border-cyan-200/50">
                          <Flask className="w-5 h-5 text-cyan-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{test.testName || "Lab Test"}</p>
                          <p className="text-xs text-slate-400">{test.description?.split("\n")[0] || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-slate-600">#{test.patientId}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{test.doctorName}</td>
                    <td className="p-4 text-sm text-slate-700 max-w-[200px] truncate">
                      {test.testResult || "—"}
                    </td>
                    <td className="p-4">
                      {test.attachmentUrl ? (
                        <a href={fileUploadService.getFileUrl(test.attachmentUrl)} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200 transition-colors">
                          {fileUploadService.isImage(test.attachmentUrl) ? <FileImage className="w-3 h-3" /> : <FileIcon className="w-3 h-3" />}
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {test.testResult ? (
                        <Badge variant="success" className="text-xs">Completed</Badge>
                      ) : (
                        <Badge variant="warning" className="text-xs">Pending</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="soft"
                        size="sm"
                        icon={test.testResult ? Eye : ClipboardList}
                        onClick={() => openResultEntry(test)}
                        className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                      >
                        {test.testResult ? "View" : "Enter Result"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Result Entry Modal */}
      <Modal
        isOpen={!!selectedTest}
        onClose={() => setSelectedTest(null)}
        title={selectedTest?.testName || "Lab Test Result"}
      >
        {selectedTest && (
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span className="font-medium text-slate-800">Test: {selectedTest.testName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-cyan-600" />
                <span>Patient ID: #{selectedTest.patientId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="w-4 h-4 text-cyan-600" />
                <span>Doctor: {selectedTest.doctorName}</span>
              </div>
            </div>

            <div>
              <label className={labelStyles}>Test Result *</label>
              <textarea
                name="testResult"
                value={resultForm.testResult}
                onChange={(e) => setResultForm((p) => ({ ...p, testResult: e.target.value }))}
                rows={3}
                className={inputStyles + " resize-none"}
                placeholder="Enter the lab test result (e.g., Positive, 120 mg/dL, etc.)"
              />
            </div>

            <div>
              <label className={labelStyles}>Additional Notes</label>
              <textarea
                name="description"
                value={resultForm.description}
                onChange={(e) => setResultForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className={inputStyles + " resize-none"}
                placeholder="Any additional notes or observations..."
              />
            </div>

            <div>
              <label className={labelStyles}>Attachment (PDF / Image)</label>
              {selectedTest.attachmentUrl && (
                <div className="mb-3">
                  {fileUploadService.isImage(selectedTest.attachmentUrl) ? (
                    <a href={fileUploadService.getFileUrl(selectedTest.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <img src={fileUploadService.getFileUrl(selectedTest.attachmentUrl)} alt="Attachment" className="max-h-36 rounded-xl border border-slate-200" />
                    </a>
                  ) : (
                    <a href={fileUploadService.getFileUrl(selectedTest.attachmentUrl)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                      <FileIcon className="w-3.5 h-3.5" /> View Existing Attachment
                    </a>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-sm text-slate-500">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif"
                    className="hidden"
                    onChange={(e) => setResultAttachment(e.target.files[0] || null)}
                  />
                  {resultAttachment ? resultAttachment.name : (selectedTest.attachmentUrl ? "Replace attachment..." : "Attach result file...")}
                </label>
                {resultAttachment && (
                  <button onClick={() => setResultAttachment(null)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">✕</button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedTest(null)} className="px-6">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveResult}
                isLoading={saving}
                icon={Save}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 shadow-cyan-500/20"
              >
                {selectedTest.testResult ? "Update Result" : "Save Result"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabTestQueue;
