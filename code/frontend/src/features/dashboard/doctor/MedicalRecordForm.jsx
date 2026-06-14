import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { FileText, Save, Loader2 } from "lucide-react";

export default function MedicalRecordForm({ patient, onSaveRecord, doctorName, loading }) {
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: "Note",
    title: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRecord.title || !newRecord.description) {
      alert("Please fill out Title and Description.");
      return;
    }

    setSaving(true);
    try {
      await onSaveRecord(newRecord);
      setNewRecord({
        date: new Date().toISOString().slice(0, 10),
        type: "Note",
        title: "",
        description: "",
      });
    } catch (err) {
      // Error is handled by parent
    } finally {
      setSaving(false);
    }
  };

  if (!patient) return null;

  return (
    <Card className="border-none shadow-md shadow-slate-200/50">
      <CardHeader title="Add New Clinical Record" />
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Record Type</label>
              <select
                value={newRecord.type}
                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="Diagnosis">Diagnosis</option>
                <option value="Note">Clinical Note</option>
                <option value="Procedure">Procedure</option>
                <option value="Allergy">Allergy Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Follow-up Checkup"
              value={newRecord.title}
              onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Notes</label>
            <textarea
              placeholder="Enter clinical observations, diagnosis, or procedure details..."
              value={newRecord.description}
              onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-32 resize-y focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || loading}
              icon={saving ? Loader2 : Save}
              className={saving ? "opacity-70" : ""}
            >
              {saving ? "Saving Record..." : "Save Record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
