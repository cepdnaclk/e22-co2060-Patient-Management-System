import { Card, CardHeader, CardContent } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";
import { 
  Calendar, FilePlus, Download, Users, Bed, Star, 
  TrendingUp, TrendingDown, FileText, FileSpreadsheet 
} from "lucide-react";

export default function ReportAndAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Performance Overview • General Hospital</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <span>1 Feb - 24 Feb 2026</span>
          </div>
          <Button variant="primary" icon={FilePlus}>
            New Report
          </Button>
          <Button variant="secondary" icon={Download}>
            Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md shadow-blue-900/5 hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Visits</p>
                <p className="text-4xl font-bold mt-2 text-slate-900">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-emerald-600 text-sm mt-4 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +22% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-purple-900/5 hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Avg. Length of Stay</p>
                <p className="text-4xl font-bold mt-2 text-slate-900">3.2 <span className="text-base font-normal text-slate-400">days</span></p>
              </div>
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <Bed className="w-6 h-6" />
              </div>
            </div>
            <p className="text-emerald-600 text-sm mt-4 font-medium flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> −0.4 days vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-amber-900/5 hover:-translate-y-1 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">Patient Satisfaction</p>
                <p className="text-4xl font-bold mt-2 text-slate-900 flex items-center gap-2">
                  94% <span className="text-amber-400 text-2xl tracking-tighter">★★★★☆</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4 font-medium">Based on 892 responses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-full border-none shadow-md shadow-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center w-full">
                <h3 className="font-bold text-slate-900 text-lg">Daily Patient Visits</h3>
                <select className="bg-slate-50 border border-slate-200 rounded-xl text-sm px-4 py-2 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option>Last 30 days</option>
                  <option>This Month</option>
                  <option>Last Quarter</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-72 flex items-end gap-2 pt-6 border-t border-slate-100 relative group">
                <div className="flex-1 h-32 bg-blue-100 hover:bg-blue-200 rounded-t-lg transition-colors relative cursor-pointer"><div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">120</div></div>
                <div className="flex-1 h-48 bg-blue-200 hover:bg-blue-300 rounded-t-lg transition-colors"></div>
                <div className="flex-1 h-52 bg-blue-300 hover:bg-blue-400 rounded-t-lg transition-colors"></div>
                <div className="flex-1 h-64 bg-blue-400 hover:bg-blue-500 rounded-t-lg transition-colors"></div>
                <div className="flex-1 h-72 bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-colors relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-600 rounded-full shadow-md"></div>
                </div>
                <div className="flex-1 h-60 bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-colors"></div>
                
                <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200"></div>
                <div className="text-xs font-medium text-slate-400 absolute -bottom-7 left-0 w-full flex justify-between px-2">
                  <span>1 Feb</span><span>8 Feb</span><span>15 Feb</span><span>24 Feb</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md shadow-slate-200/50">
            <CardHeader title="Top Conditions (Feb 2026)" />
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64 relative mb-4">
                <div className="w-56 h-56 rounded-full" style={{ background: 'conic-gradient(#1e40af 0deg 120deg, #3b82f6 120deg 200deg, #60a5fa 200deg 260deg, #93c5fd 260deg 310deg, #bfdbfe 310deg 360deg)' }}></div>
                <div className="absolute w-40 h-40 bg-white rounded-full flex items-center justify-center text-center shadow-inner">
                  <div>
                    <p className="text-4xl font-bold text-slate-900">1,247</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">Total Cases</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-3 h-3 bg-blue-800 rounded-full shadow-sm"></div>
                  <span className="text-slate-600 font-medium">Diabetes</span>
                  <span className="ml-auto font-bold text-slate-900">34%</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-600 font-medium">Hypertension</span>
                  <span className="ml-auto font-bold text-slate-900">27%</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
                  <span className="text-slate-600 font-medium">Pregnancy</span>
                  <span className="ml-auto font-bold text-slate-900">18%</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-3 h-3 bg-blue-300 rounded-full shadow-sm"></div>
                  <span className="text-slate-600 font-medium">Cardiac</span>
                  <span className="ml-auto font-bold text-slate-900">12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold text-slate-900 text-lg">Recent Generated Reports</h3>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              View all reports →
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Name</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Generated By</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-slate-800">Monthly Revenue Summary</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">Feb 2026</td>
                  <td className="py-4 px-6 text-slate-700 text-sm font-medium">Dr. A. Perera</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">24 Feb 2026</td>
                  <td className="py-4 px-6"><Badge variant="success">Completed</Badge></td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" icon={FileText} className="text-blue-600 hover:bg-blue-50">PDF</Button>
                      <Button variant="ghost" size="sm" icon={FileSpreadsheet} className="text-emerald-600 hover:bg-emerald-50">CSV</Button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-slate-800">Patient Admission Trends</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">Jan - Feb 2026</td>
                  <td className="py-4 px-6 text-slate-700 text-sm font-medium">System Admin</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">23 Feb 2026</td>
                  <td className="py-4 px-6"><Badge variant="success">Completed</Badge></td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" icon={FileText} className="text-blue-600 hover:bg-blue-50">PDF</Button>
                      <Button variant="ghost" size="sm" icon={FileSpreadsheet} className="text-emerald-600 hover:bg-emerald-50">CSV</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
