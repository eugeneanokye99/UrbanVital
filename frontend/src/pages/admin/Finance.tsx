import { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  CreditCard,
  Wallet,
  Activity,
  Plus,
  X,
  Save,
  Loader2
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts"; 
import { toast } from "react-hot-toast";
import logo from "../../assets/urbanvital-logo.png";
import api from "../../services/api"; // Assuming your axios instance is here

export default function AdminFinance() {
  const [dateRange, setDateRange] = useState("This Month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Transactions State ---
  const [transactions, setTransactions] = useState<any[]>([]);

  // --- 2. Fetch Data from Backend ---
  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      // Endpoint logic: range can be "Today", "This Week", etc.
      const response = await api.get(`/admin/finance?range=${dateRange}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load financial records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange]);

  // --- 3. Metrics & Analytics Calculation ---
  const metrics = useMemo(() => {
    const revenue = transactions
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => acc + t.amount, 0)
    );

    const sources = {
      consultation: transactions.filter(t => t.category === "Consultation").reduce((acc, t) => acc + t.amount, 0),
      pharmacy: transactions.filter(t => t.category === "Pharmacy").reduce((acc, t) => acc + t.amount, 0),
      lab: transactions.filter(t => t.category === "Laboratory").reduce((acc, t) => acc + t.amount, 0),
    };

    const barData = [{ name: dateRange, Revenue: revenue, Expenses: expenses }];

    return { revenue, expenses, profit: revenue - expenses, sources, barData };
  }, [transactions, dateRange]);

  // --- 4. Handlers ---
  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const expenseData = {
      desc: formData.get("desc") as string,
      amount: -Math.abs(Number(formData.get("amount"))), // Always save as negative
      category: formData.get("category") as string,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      await api.post("/admin/finance/expense", expenseData);
      toast.success("Expense recorded successfully");
      setIsModalOpen(false);
      fetchFinanceData(); // Refresh list
    } catch (error) {
      toast.error("Failed to record expense");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("pos-report-content");
    const originalContents = document.body.innerHTML;
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Financial Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">Live accounting synced from all departments.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select 
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value)}
             className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-[#073159] appearance-none"
          >
             <option>Today</option>
             <option>This Week</option>
             <option>This Month</option>
             <option>This Year</option>
          </select>
          <button 
            onClick={() => setShowPrintPreview(true)}
            disabled={isLoading || transactions.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] text-sm font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50"
          >
            <Printer size={16} /> Report
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <FinanceCard title="Total Revenue" value={isLoading ? "..." : `GH₵ ${metrics.revenue.toLocaleString()}`} change="+12.5%" icon={<Wallet size={20}/>} color="bg-green-50 text-green-600" />
        <FinanceCard title="Total Expenses" value={isLoading ? "..." : `GH₵ ${metrics.expenses.toLocaleString()}`} change="+2.1%" icon={<CreditCard size={20}/>} color="bg-red-50 text-red-600" trend="down" />
        <FinanceCard title="Net Profit" value={isLoading ? "..." : `GH₵ ${metrics.profit.toLocaleString()}`} change="+5.4%" icon={<TrendingUp size={20}/>} color="bg-blue-50 text-blue-600" />
        <FinanceCard title="Pending Claims" value="GH₵ 4,200" subtext="Insurance" icon={<Activity size={20}/>} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h3 className="font-bold text-base md:text-lg text-gray-800 mb-6">Revenue Trends & Sources</h3>
          
          {/* Chart Section */}
          <div className="h-64 w-full mb-8 overflow-hidden relative bg-gray-50 rounded-xl p-4 flex items-center justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin" />
                    <p className="text-xs">Fetching analytics...</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                        <Legend iconType="circle" />
                        <Bar dataKey="Revenue" fill="#073159" radius={[6, 6, 0, 0]} barSize={50} />
                        <Bar dataKey="Expenses" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-5">
              <BreakdownBar label="Consultation Fees" amount={`GH₵ ${metrics.sources.consultation}`} percent={metrics.revenue > 0 ? (metrics.sources.consultation / metrics.revenue) * 100 : 0} color="bg-[#073159]" />
              <BreakdownBar label="Pharmacy Sales" amount={`GH₵ ${metrics.sources.pharmacy}`} percent={metrics.revenue > 0 ? (metrics.sources.pharmacy / metrics.revenue) * 100 : 0} color="bg-teal-500" />
              <BreakdownBar label="Laboratory Services" amount={`GH₵ ${metrics.sources.lab}`} percent={metrics.revenue > 0 ? (metrics.sources.lab / metrics.revenue) * 100 : 0} color="bg-purple-500" />
          </div>
        </div>

        {/* Right Col: Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[550px] lg:h-auto">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">Recent Activity</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
                <div className="space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 animate-pulse rounded-xl" />)}
                </div>
            ) : transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Activity className="h-8 w-8 text-gray-200 mb-2" />
                    <p className="text-xs italic">No activity for this period</p>
                </div>
            ) : (
                transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-full shrink-0 ${tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                {tx.amount > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{tx.desc}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{tx.category}</p>
                            </div>
                        </div>
                        <p className={`text-sm font-bold shrink-0 ml-2 ${tx.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                            {tx.amount > 0 ? "+" : ""}₵{Math.abs(tx.amount).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 text-sm font-bold text-[#073159] border border-gray-200 rounded-xl bg-white hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                  <Plus size={16} /> Add Expense
              </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white">
                      <h3 className="font-bold flex items-center gap-2"><CreditCard size={18} /> Record New Expense</h3>
                      <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                          <input name="desc" type="text" placeholder="e.g. Facility Rent" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Amount (GHS)</label>
                              <input name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                              <select name="category" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none">
                                  <option>Utilities</option>
                                  <option>Medical Supplies</option>
                                  <option>Salaries</option>
                                  <option>Maintenance</option>
                                  <option>Other</option>
                              </select>
                          </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg">
                          <Save size={18} /> Save Expense
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* POS Receipt Modal (As defined in your logic) */}
      {showPrintPreview && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-200">
                  <div id="pos-report-content" className="p-8 bg-white text-gray-800 font-mono text-xs leading-relaxed">
                      <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
                          <img src={logo} alt="Logo" className="h-10 mx-auto mb-2 grayscale" />
                          <h2 className="font-bold text-sm uppercase">UrbanVital Health Centre</h2>
                          <p>Financial Report</p>
                          <p className="mt-2 font-bold uppercase underline">Period: {dateRange}</p>
                      </div>
                      <div className="border-y border-dashed border-gray-400 py-2 mb-4">
                          <div className="flex justify-between font-bold"><span>REVENUE:</span><span>₵{metrics.revenue.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold"><span>EXPENSES:</span><span>₵{metrics.expenses.toFixed(2)}</span></div>
                          <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t"><span>PROFIT:</span><span>₵{metrics.profit.toFixed(2)}</span></div>
                      </div>
                      <p className="font-bold mb-1 underline">Breakdown:</p>
                      <div className="space-y-1 mb-6">
                          <div className="flex justify-between"><span>Consult:</span><span>₵{metrics.sources.consultation.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Pharmacy:</span><span>₵{metrics.sources.pharmacy.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Lab:</span><span>₵{metrics.sources.lab.toFixed(2)}</span></div>
                      </div>
                      <div className="text-center border-t border-dashed border-gray-400 pt-4">
                          <p className="font-bold italic uppercase">End of Report</p>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                      <button onClick={() => setShowPrintPreview(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600">Cancel</button>
                      <button onClick={handlePrint} className="flex-1 py-2.5 bg-[#073159] text-white rounded-xl font-bold flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// --- Helper Components (FinanceCard, BreakdownBar) ---
// ... (The implementation you provided previously remains identical)

function FinanceCard({ title, value, change, icon, color, trend = "up", subtext }: any) {
  return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
              {change && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {trend === "up" ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {change}
                  </span>
              )}
          </div>
          <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">{title}</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">{value}</h3>
              {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
          </div>
      </div>
  )
}

function BreakdownBar({ label, amount, percent, color }: any) {
  return (
      <div>
          <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">{label}</span>
              <span className="font-bold text-gray-900">{amount}</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
          </div>
      </div>
  )
}