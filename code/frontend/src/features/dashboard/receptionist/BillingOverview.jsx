import React, { useState, useEffect } from "react";
import { 
  CreditCard, TrendingUp, AlertCircle, Plus, 
  FileText, Search, Loader2, ArrowRight, CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { billingService } from "../../../services/billingService";
import CreateInvoice from "./CreateInvoice.jsx";

export default function BillingOverview() {
  const [view, setView] = useState("list"); // 'list' or 'create'
  const [summary, setSummary] = useState({ totalRevenue: 0, outstandingInvoices: 0 });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, invData] = await Promise.all([
        billingService.getSummary(),
        billingService.getAllInvoices(0, 50)
      ]);
      setSummary(sumData);
      setInvoices(invData.content || []);
    } catch (err) {
      console.error("Failed to fetch billing data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") {
      fetchDashboardData();
    }
  }, [view]);

  const handlePayment = async (invoiceId) => {
    const amount = prompt("Enter payment amount:");
    if (!amount) return;
    try {
      await billingService.recordPayment(invoiceId, { amount: parseFloat(amount), paymentMethod: "CASH" });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to record payment");
    }
  };

  if (view === "create") {
    return <CreateInvoice onBack={() => setView("list")} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Invoicing</h1>
          <p className="text-sm text-slate-500 mt-1">Manage hospital revenue, invoices, and payments.</p>
        </div>
        <Button onClick={() => setView("create")} icon={Plus} className="bg-sky-600 hover:bg-sky-700">
          Create New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-md shadow-emerald-500/10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <TrendingUp className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-emerald-50">Total Revenue</h3>
            </div>
            <p className="text-4xl font-bold tracking-tight">
              Rs. {summary.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-amber-500/10 bg-gradient-to-br from-amber-500 to-orange-500 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <AlertCircle className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-amber-50">Outstanding Invoices</h3>
            </div>
            <p className="text-4xl font-bold tracking-tight">
              {summary.outstandingInvoices || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card className="border-none shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Invoices</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="p-4 whitespace-nowrap">Invoice ID</th>
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap">Patient ID</th>
                  <th className="p-4 whitespace-nowrap">Amount</th>
                  <th className="p-4 whitespace-nowrap">Due</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No invoices found.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">
                        INV-{String(inv.id).padStart(5, '0')}
                      </td>
                      <td className="p-4 text-slate-600">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-600">
                        PMS-{String(inv.patientId).padStart(5, '0')}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        Rs. {inv.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-semibold text-amber-600">
                        Rs. {inv.balanceDue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        {inv.status === "PAID" ? (
                          <Badge variant="success">Paid</Badge>
                        ) : inv.status === "PARTIAL" ? (
                          <Badge variant="warning">Partial</Badge>
                        ) : (
                          <Badge variant="error">Pending</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {inv.status !== "PAID" ? (
                          <button 
                            onClick={() => handlePayment(inv.id)}
                            className="text-sky-600 hover:text-sky-700 font-medium text-sm flex items-center justify-end gap-1 w-full"
                          >
                            Pay <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-emerald-500 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
