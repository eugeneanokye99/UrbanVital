import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  Activity,
  ArrowRight,
  Clock,
  Stethoscope,
  CreditCard,
  UserPlus,
  MoreHorizontal,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  fetchDashboardSummary,
  fetchPatientStats,
  fetchInventoryStats,
  fetchPendingInvoices,
  fetchBillingStats,
  fetchActiveVisits,
  fetchAllStaff
} from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // State for all data
  const [analytics, setAnalytics] = useState({
    revenue: 0,
    revenueChange: "+0%",
    patients: 0,
    patientsChange: "+0%",
    drugs: 0,
  });

  const [liveStats, setLiveStats] = useState({
    waitingRoom: 0,
    doctorsActive: 0,
    triageQueue: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ]);

  const [loading, setLoading] = useState({
    dashboard: true,
    patients: true,
    inventory: true,
    billing: true,
    visits: true,
    alerts: true
  });

  const [error, setError] = useState<string | null>(null);
  const [onDutyStaff] = useState<any[]>([]);

  // Fetch all dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setError(null);
        
        // Load multiple data sources in parallel
        const [
          dashboardSummary,
          patientStats,
          inventoryStats,
          billingStats,
          activeVisits,
          lowStockItems
        ] = await Promise.all([
          fetchDashboardSummary().catch(() => ({})),
          fetchPatientStats().catch(() => ({})),
          fetchInventoryStats().catch(() => ({ total_items: 0, total_value: 0, low_stock: 0, out_of_stock: 0, expiring_soon: 0 })),
          fetchBillingStats().catch(() => ({})),
          fetchActiveVisits().catch(() => []),
          fetchAllStaff().catch(() => [])
        ]);

        // Set analytics
        setAnalytics({
          revenue: billingStats.total_revenue || dashboardSummary.revenue || 0,
          revenueChange: "+0%", // You can calculate this from historical data
          patients: patientStats.total_patients || patientStats.count || 0,
          patientsChange: "+0%", // Calculate from historical data
          drugs: inventoryStats.total_items || 0,
        });

        // Set live stats
        setLiveStats({
          waitingRoom: activeVisits.length || 0,
          doctorsActive:  0,
          triageQueue: activeVisits.filter((visit: any) => visit.priority === "High" || visit.status === "Waiting").length || 0
        });

        // Set recent transactions (pending invoices)
        const pendingInvoices = await fetchPendingInvoices().catch(() => []);
        const transactions = pendingInvoices.slice(0, 3).map((invoice: any) => ({
          id: invoice.id,
          patient: invoice.patient_name || `Patient ${invoice.patient_id}`,
          service: invoice.items?.[0]?.description || "General Service",
          amount: invoice.total_amount || 0,
          status: invoice.payment_status === "PAID" ? "Paid" : "Pending",
          method: invoice.payment_method || "Cash"
        }));
        setRecentTransactions(transactions);

        // Set recent activity (alerts)
        const alerts = [];
        
        // Add inventory alerts
        if (lowStockItems.length > 0) {
          alerts.push({
            id: 1,
            type: "critical",
            title: "Stockout Alert",
            message: `${lowStockItems.length} items are low on stock.`,
            action: "View Inventory"
          });
        }

        
        setRecentActivity(alerts);

        // Set on duty staff (first 3 active staff)

        // Set weekly data (you might need to fetch actual weekly data)
        // For now, using mock data with real values
        setWeeklyData([
          { day: "Mon", value: Math.floor(Math.random() * 3000) },
          { day: "Tue", value: Math.floor(Math.random() * 3000) },
          { day: "Wed", value: Math.floor(Math.random() * 3000) },
          { day: "Thu", value: Math.floor(Math.random() * 3000) },
          { day: "Fri", value: Math.floor(Math.random() * 3000) },
          { day: "Sat", value: Math.floor(Math.random() * 3000) },
          { day: "Sun", value: Math.floor(Math.random() * 3000) },
        ]);

        // Reset loading states
        setLoading({
          dashboard: false,
          patients: false,
          inventory: false,
          billing: false,
          visits: false,
          alerts: false
        });

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Failed to load dashboard data. Some features may be limited.");
        
        // Reset loading states on error
        setLoading({
          dashboard: false,
          patients: false,
          inventory: false,
          billing: false,
          visits: false,
          alerts: false
        });
      }
    };

    loadDashboardData();
  }, []);

  const maxWeekly = Math.max(...weeklyData.map((d) => d.value));

  const handleRefresh = () => {
    setLoading({
      dashboard: true,
      patients: true,
      inventory: true,
      billing: true,
      visits: true,
      alerts: true
    });
    setError(null);
    
    // Reload data
    setTimeout(() => {
      const loadDashboardData = async () => {
        try {
          // Simulate API calls with actual data or defaults
          const inventoryStats = await fetchInventoryStats().catch(() => ({ total_items: 0 }));
          const patientStats = await fetchPatientStats().catch(() => ({ total_patients: 0 }));
          
          setAnalytics(prev => ({
            ...prev,
            drugs: inventoryStats.total_items || 0,
            patients: patientStats.total_patients || 0
          }));
          
          setLoading(prev => ({
            ...prev,
            dashboard: false,
            inventory: false,
            patients: false
          }));
        } catch (error) {
          console.error("Error refreshing data:", error);
          setLoading(prev => ({
            ...prev,
            dashboard: false,
            inventory: false,
            patients: false
          }));
        }
      };
      
      loadDashboardData();
    }, 1000);
  };

  // Check if any data is still loading
  const isLoading = Object.values(loading).some(value => value);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
              <Loader2 size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* --- Header & Quick Actions --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-full lg:w-auto">
          <h2 className="text-xl md:text-2xl font-bold text-[#073159]">
            Admin Dashboard
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-gray-500 mt-1 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
            <span className="text-green-600 font-medium flex items-center gap-1 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Clinic Open
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={() => navigate("/admin/register")} 
            disabled={isLoading}
            className="flex-1 lg:flex-none flex justify-center items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-[#073159] animate-spin mr-3" />
          <span className="text-lg text-gray-600">Loading dashboard data...</span>
        </div>
      )}

      {/* --- Clinic Pulse (Live Status) --- */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden min-h-[160px]">
              <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-1">Patients Waiting</p>
                  <h3 className="text-3xl font-bold">{liveStats.waitingRoom}</h3>
                  <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                    <Clock size={12} /> Avg wait: 14 mins
                  </div>
              </div>
              <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Active Doctors</p>
                    <h3 className="text-2xl font-bold text-[#073159] mt-1">
                      {liveStats.doctorsActive} <span className="text-sm text-gray-400 font-normal">/ {onDutyStaff.length + 2}</span>
                    </h3>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Stethoscope className="text-green-600 w-5 h-5" />
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: `${(liveStats.doctorsActive / (onDutyStaff.length + 2)) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px] sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Triage Queue</p>
                    <h3 className="text-2xl font-bold text-[#073159] mt-1">{liveStats.triageQueue}</h3>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Activity className="text-orange-600 w-5 h-5" />
                  </div>
                </div>
                {liveStats.triageQueue > 0 ? (
                  <p className="text-xs text-orange-600 mt-2 font-medium bg-orange-50 w-fit px-2 py-1 rounded">Requires attention</p>
                ) : (
                  <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 w-fit px-2 py-1 rounded">All clear</p>
                )}
            </div>
          </div>

          {/* --- Key Financial Metrics --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <MetricCard 
              title="Total Revenue" 
              value={`GH₵ ${analytics.revenue.toLocaleString()}`}
              change={analytics.revenueChange}
              positive={true}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
              color="bg-green-50"
            />
            <MetricCard 
              title="Total Visits" 
              value={analytics.patients.toString()}
              change={analytics.patientsChange}
              positive={true}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-50"
            />
            <MetricCard 
              title="Inventory Count" 
              value={analytics.drugs.toString()}
              subtext="Stock Items"
              icon={<Package className="w-6 h-6 text-purple-600" />}
              color="bg-purple-50"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            
            {/* Left Column: Charts (Span 2) */}
            <div className="xl:col-span-2 space-y-6 md:space-y-8">
              
              {/* Revenue Chart */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                      Weekly Income
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400">Cash vs Insurance</p>
                  </div>
                  <button className="text-gray-400 hover:text-[#073159] p-3 -mr-2 rounded-full hover:bg-gray-50 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="w-full h-48 md:h-64 overflow-hidden relative">
                  <svg viewBox="0 0 600 220" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#073159" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#073159" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="0" y1={40 + i * 40} x2="600" y2={40 + i * 40} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
                    ))}
                    
                    {/* Area Fill */}
                    <path
                      d={`M 0 200 ` + weeklyData.map((d, i) => {
                          const x = (i / (weeklyData.length - 1)) * 600;
                          const y = 200 - (d.value / (maxWeekly || 1)) * 140;
                          return `L ${x} ${y}`;
                        }).join(" ") + ` L 600 200 Z`}
                      fill="url(#gradientRevenue)"
                    />

                    {/* Line Path */}
                    <path
                      d={weeklyData.map((d, i) => {
                          const x = (i / (weeklyData.length - 1)) * 600;
                          const y = 200 - (d.value / (maxWeekly || 1)) * 140;
                          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                        }).join(" ")}
                      fill="none"
                      stroke="#073159"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#073159]" />
                    Recent Transactions
                  </h3>
                  <button className="text-xs md:text-sm font-medium text-blue-600 hover:underline py-2 px-3 hover:bg-blue-50 rounded-lg">View All</button>
                </div>
                {recentTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Patient</th>
                          <th className="px-6 py-3 font-semibold">Service</th>
                          <th className="px-6 py-3 font-semibold">Amount</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{tx.patient}</td>
                            <td className="px-6 py-4 text-gray-600">{tx.service}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">GH₵ {tx.amount}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tx.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No recent transactions</p>
                    <p className="text-sm">Transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Alerts & Side Widgets (Span 1) */}
            <div className="space-y-6 md:space-y-8">
              
              {/* Alerts Widget */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                    <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                    Action Center
                  </h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    recentActivity.length > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}>
                    {recentActivity.length}
                  </span>
                </div>
                
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-xl border border-l-4 transition-all hover:translate-x-1 ${
                          alert.type === 'critical' ? 'bg-red-50 border-red-200 border-l-red-500' : 
                          'bg-orange-50 border-orange-200 border-l-orange-500'
                        }`}
                      >
                        <h4 className="font-bold text-gray-800 text-sm mb-1">{alert.title}</h4>
                        <p className="text-xs text-gray-600 mb-3">{alert.message}</p>
                        <button className="text-xs font-bold text-[#073159] flex items-center gap-1 hover:gap-2 transition-all py-2 px-1 -ml-1 rounded hover:bg-black/5 w-fit">
                          {alert.action} <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No alerts</p>
                    <p className="text-sm">All systems are operational</p>
                  </div>
                )}
              </div>

              {/* Quick Staff List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-sm md:text-base">On Duty Now</h3>
                {onDutyStaff.length > 0 ? (
                  <div className="space-y-4">
                    {onDutyStaff.map((staff, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#073159] text-xs font-bold">
                          {(staff.username || "Staff").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{staff.username || "Staff Member"}</p>
                          <p className="text-xs text-gray-500">{staff.role || "Staff"}</p>
                        </div>
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No staff on duty</p>
                    <p className="text-sm">Staff members will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Reusable Metric Card Component ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  color: string;
  subtext?: string;
  className?: string;
}

function MetricCard({ icon, title, value, change, positive, color, subtext, className }: MetricCardProps) {
  return (
    <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md cursor-pointer active:scale-98 ${className}`}>
      <div>
        <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-[#073159]">{value}</h3>
        
        <div className="flex items-center mt-3 gap-2">
           {change ? (
             <>
               <span className={`flex items-center gap-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {positive ? <TrendingUp size={12}/> : <TrendingDown size={12} />}
                 {change}
               </span>
               <span className="text-[10px] md:text-xs text-gray-400">vs last month</span>
             </>
           ) : (
             <span className="text-xs text-gray-400">{subtext}</span>
           )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}