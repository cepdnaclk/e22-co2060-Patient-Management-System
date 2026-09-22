import React, { useState, useEffect } from "react";
import { ClipboardList, CheckSquare, Square, Loader2, FileText } from "lucide-react";
import { nurseDashboardService } from "../../../services/nurseDashboardService";
import { patientRecordService } from "../../../services/patientRecordService";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function ClinicalOrdersCard({ patient, isInline = false }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [newOrderText, setNewOrderText] = useState("");

  // Load clinical orders from the backend API
  useEffect(() => {
    async function loadOrders() {
      if (!patient?.id) {
        setOrders([]);
        return;
      }
      setLoading(true);
      try {
        const [ordersData, recordsData] = await Promise.all([
          nurseDashboardService.getPatientClinicalOrders(patient.id).catch(() => []),
          patientRecordService.getPatientRecords(patient.id).catch(() => [])
        ]);

        const notes = recordsData.filter(r => 
          r.recordType === "NOTE" || 
          r.recordType === "CLINICAL_NOTE" || 
          r.type === "Note" || 
          r.type === "Clinical Note"
        );

        const noteOrders = notes.map(n => ({
          id: `note-${n.id}`,
          description: n.description || n.title,
          type: "DOCTOR'S NOTE",
          status: "NOTE",
          doctor: n.doctor
        }));

        setOrders([...(ordersData || []), ...noteOrders]);
      } catch (error) {
        console.error("Failed to fetch clinical orders", error);
        // Fallback to empty — nurse will see "No active orders"
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [patient?.id]);

  const toggleOrder = async (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status === "COMPLETED") return;

    // Optimistic UI update
    setOrders(
      orders.map((o) =>
        o.id === id ? { ...o, status: "COMPLETED" } : o
      )
    );

    try {
      await nurseDashboardService.completeClinicalOrder(id, user?.id);
    } catch (error) {
      console.error("Failed to complete clinical order", error);
      // Revert on error
      setOrders(
        orders.map((o) =>
          o.id === id ? { ...o, status: order.status } : o
        )
      );
    }
  };

  const handleAddOrder = () => {
    if (!newOrderText.trim()) return;
    const newOrder = {
      id: Date.now(),
      description: newOrderText,
      type: "CLINICAL",
      status: "PENDING"
    };
    setOrders(prev => [newOrder, ...prev]);
    setNewOrderText("");
    setIsAddingOrder(false);
  };

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className={isInline ? "flex flex-col h-full" : "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1"}>
      <div className={isInline ? "px-3 py-3 border-b border-slate-100 flex items-center justify-between" : "bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-blue-100 flex items-center justify-between"}>
        <h3 className={`font-bold flex items-center gap-2 ${isInline ? "text-slate-800 text-sm" : "text-blue-900"}`}>
          <ClipboardList className={isInline ? "w-4 h-4 text-blue-600" : "w-5 h-5 text-blue-600"} />
          Clinical Orders
        </h3>
        <div className="flex items-center gap-2">
          <span className={isInline ? "text-[10px] font-bold bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider" : "text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider"}>
            {pendingCount} Pending
          </span>
          <button 
            onClick={() => setIsAddingOrder(!isAddingOrder)}
            className="text-[10px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-2 py-1 rounded-full uppercase tracking-wider"
          >
            {isAddingOrder ? "Cancel" : "+ Add"}
          </button>
        </div>
      </div>

      {isAddingOrder && (
        <div className="p-3 bg-blue-50/50 border-b border-blue-100 flex flex-col gap-2">
          <input
            type="text"
            value={newOrderText}
            onChange={(e) => setNewOrderText(e.target.value)}
            placeholder="Type new clinical order..."
            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleAddOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
            >
              Save Order
            </button>
          </div>
        </div>
      )}

      <div className="p-2 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-6 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No active clinical orders for this patient.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => toggleOrder(order.id)}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors group ${order.type !== "DOCTOR'S NOTE" ? "hover:bg-slate-50 cursor-pointer" : "bg-indigo-50/50 hover:bg-indigo-100/50 mb-2 border border-indigo-100/50 cursor-pointer"}`}
            >
              <div className="mt-0.5 text-slate-400 group-hover:text-blue-500 transition-colors">
                {order.status === "COMPLETED" ? (
                  <CheckSquare className="w-5 h-5 text-blue-500" />
                ) : order.type === "DOCTOR'S NOTE" ? (
                  <FileText className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${
                    order.status === "COMPLETED"
                      ? "text-slate-500 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {order.description || order.orderDescription || "Clinical Order"}
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {order.type || order.orderType || "ORDER"} {order.doctor && order.doctor !== "System" ? `• BY ${order.doctor}` : ""}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
