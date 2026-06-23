import React, { useState, useEffect } from "react";
import { 
  Pill, AlertTriangle, Activity, PackageOpen, CheckCircle2 
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { pharmacyService } from "../../../services/pharmacyService";

export default function PharmacistOverview({ onNavigate }) {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockCount: 0,
    pendingPrescriptions: 0,
    fulfilledToday: 0
  });
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const allMeds = await pharmacyService.getAllMedicines();
        const lowStock = await pharmacyService.getLowStockMedicines();
        const pending = await pharmacyService.getPendingPrescriptions();
        const fulfilled = await pharmacyService.getFulfilledPrescriptions();
        
        // Count fulfilled today
        const today = new Date().toISOString().split('T')[0];
        const fulfilledToday = fulfilled.filter(p => p.updatedAt?.startsWith(today)).length;

        setStats({
          totalMedicines: allMeds.length,
          lowStockCount: lowStock.length,
          pendingPrescriptions: pending.length,
          fulfilledToday
        });
        
        setLowStockMeds(lowStock.slice(0, 5)); // Show top 5 low stock
      } catch (error) {
        console.error("Error fetching pharmacy overview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pharmacy Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time inventory and prescription metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md shadow-emerald-900/5 hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Medicines</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.totalMedicines}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-none shadow-md shadow-red-900/5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          onClick={() => onNavigate("inventory")}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
              <p className="text-xl font-bold text-red-600">{loading ? "..." : stats.lowStockCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-none shadow-md shadow-blue-900/5 hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          onClick={() => onNavigate("queue")}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Rx</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.pendingPrescriptions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-teal-900/5 hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Fulfilled Today</p>
              <p className="text-xl font-bold text-slate-900">{loading ? "..." : stats.fulfilledToday}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50/50 rounded-t-xl">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Critical Low Stock
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-500">Loading alerts...</div>
              ) : lowStockMeds.length > 0 ? (
                <div className="space-y-4">
                  {lowStockMeds.map(med => (
                    <div key={med.id} className="flex justify-between items-center p-4 bg-white border border-red-100 rounded-xl shadow-sm">
                      <div>
                        <h4 className="font-semibold text-slate-900">{med.name}</h4>
                        <p className="text-sm text-slate-500">{med.genericName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="error" className="text-sm">{med.stockQuantity} in stock</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PackageOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Inventory looks healthy!</p>
                  <p className="text-sm text-slate-400">No medicines are currently running low.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
