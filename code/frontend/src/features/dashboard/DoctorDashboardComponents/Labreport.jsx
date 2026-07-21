import React, { useState, useEffect, useRef, useCallback } from 'react';
import PatientSearch from "../doctor/PatientSearch.jsx";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Modal } from "../../../components/ui/Modal.jsx";
import {
  FileText, FlaskConical, CheckCircle2, FileSearch,
  Plus, Upload, X, Image as ImageIcon, Eye, Trash2,
  Loader2, AlertCircle, FileUp
} from "lucide-react";
import api from "../../../services/axiosClient";
import { useAuth } from "../../auth/AuthContext.jsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function LabReports() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [labRecords, setLabRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    testName: "",
    description: "",
    testResult: "",
  });
  const [attachedImages, setAttachedImages] = useState([]); // array of { file, preview, base64 }
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch lab records for selected patient
  const fetchLabRecords = useCallback(async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/medical-records/patient/${selectedPatient.id}`);
      const records = data || [];
      // Filter for LAB_TEST and LAB_RESULT types
      const labs = records.filter(r => {
        const type = (r.recordType || "").toUpperCase();
        return type === "LAB_TEST" || type === "LAB_RESULT";
      });
      setLabRecords(labs);
    } catch (err) {
      console.error("Failed to load lab records", err);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    fetchLabRecords();
  }, [fetchLabRecords]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  // ── Approve handler ──
  const handleApprove = async (recordId) => {
    try {
      await api.put(`/api/medical-records/${recordId}`, { isFulfilled: true });
      setLabRecords(prev => prev.map(r => r.id === recordId ? { ...r, isFulfilled: true } : r));
    } catch (err) {
      alert("Failed to approve lab report.");
    }
  };

  // ── Image handling ──
  const processFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert(`Unsupported file type: ${file.type}. Please upload JPEG, PNG, WebP, or GIF.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedImages(prev => [...prev, {
        file,
        preview: URL.createObjectURL(file),
        base64: e.target.result
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(processFile);
    e.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  };

  const removeImage = (index) => {
    setAttachedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // ── Form submission ──
  const resetForm = () => {
    setFormData({ testName: "", description: "", testResult: "" });
    attachedImages.forEach(img => URL.revokeObjectURL(img.preview));
    setAttachedImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.testName.trim()) {
      alert("Please enter a test name.");
      return;
    }

    setSubmitting(true);
    try {
      // Build the attachmentUrl as a JSON array of base64 images (or single string)
      let attachmentUrl = null;
      if (attachedImages.length === 1) {
        attachmentUrl = attachedImages[0].base64;
      } else if (attachedImages.length > 1) {
        attachmentUrl = JSON.stringify(attachedImages.map(img => img.base64));
      }

      const payload = {
        patientId: selectedPatient.id,
        doctorId: user?.id || null,
        recordType: "LAB_RESULT",
        testName: formData.testName.trim(),
        description: formData.description.trim() || null,
        testResult: formData.testResult.trim() || null,
        attachmentUrl,
      };

      await api.post("/api/medical-records", payload);

      // Refresh the list
      await fetchLabRecords();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to create lab report", err);
      alert("Failed to create lab report. " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helper: Parse attachmentUrl to get image array ──
  const getImages = (attachmentUrl) => {
    if (!attachmentUrl) return [];
    // Check if it's a JSON array
    if (attachmentUrl.startsWith("[")) {
      try {
        return JSON.parse(attachmentUrl);
      } catch {
        return [attachmentUrl];
      }
    }
    // Single base64 or URL
    return [attachmentUrl];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lab Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, approve, and add laboratory reports for your patients.
        </p>
      </div>

      {/* Patient Search */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Find Patient</h3>
        <PatientSearch onSelectPatient={handleSelectPatient} />
      </div>

      {/* Selected Patient Section */}
      {selectedPatient && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <Card className="border-none shadow-md shadow-slate-200/50 max-w-5xl mx-auto">
            <CardHeader className="pb-0 border-b border-slate-100 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-6 h-6 text-purple-600" />
                  Lab Reports — {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <div className="flex items-center gap-3">
                  <Badge variant="purple">{labRecords.length} Total</Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setShowAddModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md shadow-purple-500/20"
                  >
                    Add Lab Report
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-12 flex flex-col items-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
                  <p>Loading lab reports...</p>
                </div>
              ) : labRecords.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center text-slate-400">
                  <FileSearch className="w-12 h-12 mb-4 opacity-30" />
                  <p className="font-medium text-slate-600 text-lg">No lab reports found</p>
                  <p className="text-sm mt-1 text-slate-500">Click "Add Lab Report" to create one for this patient.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {labRecords.map(report => {
                    const images = getImages(report.attachmentUrl);
                    return (
                      <div
                        key={report.id}
                        className={`bg-white border rounded-2xl p-5 transition-all ${
                          report.isFulfilled
                            ? "border-emerald-200 bg-emerald-50/30"
                            : "border-slate-200 hover:border-purple-300 shadow-sm"
                        }`}
                      >
                        {/* Report Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                              {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                            <span className="font-bold text-lg text-slate-800">
                              {report.testName || report.diagnosis || "Lab Report"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {report.isFulfilled ? (
                              <Badge variant="success" className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Approved
                              </Badge>
                            ) : (
                              <Badge variant="warning">Pending Review</Badge>
                            )}
                          </div>
                        </div>

                        {/* Test Result */}
                        {report.testResult && (
                          <div className="bg-purple-50 p-4 rounded-xl text-sm text-purple-800 mb-3 border border-purple-100">
                            <span className="font-semibold text-purple-900 block mb-1">Test Result:</span>
                            <p className="whitespace-pre-wrap">{report.testResult}</p>
                          </div>
                        )}

                        {/* Description / Notes */}
                        {report.description && (
                          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 mb-3">
                            <span className="font-semibold text-slate-900 block mb-1">Clinical Notes / Instructions:</span>
                            <p className="whitespace-pre-wrap">{report.description}</p>
                          </div>
                        )}

                        {/* Attached Images */}
                        {images.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5" /> Attached Images ({images.length})
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {images.map((imgSrc, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setLightboxImage(imgSrc)}
                                  className="group relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-purple-400 transition-all shadow-sm hover:shadow-md"
                                >
                                  <img
                                    src={imgSrc}
                                    alt={`Lab attachment ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Approve Button */}
                        {!report.isFulfilled && (
                          <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                            <Button
                              variant="primary"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleApprove(report.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                            >
                              Mark as Approved
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Add Lab Report Modal ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add Lab Report"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Info Bar */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-sm">
              {selectedPatient?.firstName?.charAt(0)}{selectedPatient?.lastName?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-purple-900 text-sm">
                {selectedPatient?.firstName} {selectedPatient?.lastName}
              </p>
              <p className="text-xs text-purple-600">Patient ID: {selectedPatient?.id}</p>
            </div>
          </div>

          {/* Test Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Test Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.testName}
              onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
              placeholder="e.g., Complete Blood Count (CBC), Lipid Panel..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* Test Result */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Test Result
            </label>
            <textarea
              value={formData.testResult}
              onChange={(e) => setFormData(prev => ({ ...prev, testResult: e.target.value }))}
              placeholder="Enter test results, values, ranges..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Clinical Notes / Instructions
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes, observations, or instructions..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Image Upload Zone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              Attach Images
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
                ${dragActive
                  ? "border-purple-500 bg-purple-50 scale-[1.01]"
                  : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  dragActive ? "bg-purple-200 text-purple-700" : "bg-slate-100 text-slate-400"
                }`}>
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {dragActive ? "Drop images here" : "Drag & drop images or click to browse"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    JPEG, PNG, WebP, GIF — Max 5MB per file
                  </p>
                </div>
              </div>
            </div>

            {/* Image Previews */}
            {attachedImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {attachedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm"
                  >
                    <img
                      src={img.preview}
                      alt={`Attachment ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={submitting ? Loader2 : FlaskConical}
              isLoading={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md shadow-purple-500/20"
            >
              {submitting ? "Saving..." : "Save Lab Report"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Image Lightbox ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Lab report image"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}