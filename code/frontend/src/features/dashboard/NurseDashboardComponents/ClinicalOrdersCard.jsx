import React, { useState } from "react";
import { ClipboardList, CheckSquare, Square } from "lucide-react";

export default function ClinicalOrdersCard({ patient }) {
  // Mock data for clinical orders
  const [orders, setOrders] = useState([
    { id: 1, type: "LAB", description: "Complete Blood Count (CBC)", status: "PENDING" },
    { id: 2, type: "NURSING", description: "Change wound dressing", status: "PENDING" },
    { id: 3, type: "DIET", description: "Clear liquid diet only", status: "COMPLETED" },
  ]);

  const toggleOrder = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: o.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : o));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 border-b border-orange-100 flex items-center justify-between">
        <h3 className="font-bold text-orange-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-orange-600" />
          Clinical Orders
        </h3>
        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {orders.filter(o => o.status === 'PENDING').length} Pending
        </span>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto">
        {orders.map(order => (
          <div 
            key={order.id} 
            onClick={() => toggleOrder(order.id)}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
          >
             <button className="mt-0.5 text-slate-400 group-hover:text-orange-500 transition-colors">
                {order.status === 'COMPLETED' ? (
                   <CheckSquare className="w-5 h-5 text-orange-500" />
                ) : (
                   <Square className="w-5 h-5" />
                )}
             </button>
             <div>
                <p className={`font-semibold text-sm ${order.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                   {order.description}
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                   {order.type} ORDER
                </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
