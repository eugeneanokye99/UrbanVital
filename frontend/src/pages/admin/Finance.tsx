import { useState, useMemo, useEffect, type FormEvent } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  CreditCard,
  Wallet,
  Activity,
  Plus,
  X,
  Save,
  Loader2,
  Filter,
  LineChart as LineChartIcon
} from "lucide-react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts"; 
import { toast } from "react-hot-toast";
import logo from "../../assets/urbanvital-logo.png";
import api from "../../services/api";

export default function AdminFinance() {
  const [dateRange, setDateRange] = useState("This Month");
  const [selectedDept, setSelectedDept] = useState("All Departments"); // New State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/finance/transactions?range=${dateRange}`);
      setTransactions(response.data || []); 
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Unable to connect to financial server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange]);

  // --- Multi-Level Filter & Metrics Logic ---
  const metrics = useMemo(() => {
    // 1. Filter by Department first
    const deptFiltered = transactions.filter(t => 
      selectedDept === "All Departments" ? true : t.category === selectedDept
    );

    const revenue = deptFiltered.filter(t => t.amount > 0).reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = Math.abs(deptFiltered.filter(t => t.amount < 0).reduce((acc, t) => acc + Number(t.amount), 0));
    
    // 2. Line Chart Data (Daily Grouping)
    const dailyMap: { [key: string]: number } = {};
    deptFiltered.filter(t => t.amount > 0).forEach(t => {
        const date = t.date.split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + t.amount;
    });

    const lineData = Object.keys(dailyMap)
        .sort()
        .map(date => ({
            date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            Revenue: dailyMap[date]
        }));

    // 3. Department Breakdown (Always use full data for the progress bars)
    const sources = {
        consultation: transactions.filter(t => t.category === "Consultation").reduce((acc, t) => acc + Number(t.amount), 0),
        pharmacy: transactions.filter(t => t.category === "Pharmacy").reduce((acc, t) => acc + Number(t.amount), 0),
        lab: transactions.filter(t => t.category === "Laboratory").reduce((acc, t) => acc + Number(t.amount), 0),
    };

    const barData = [{ name: selectedDept, Revenue: revenue, Expenses: expenses }];

    return { revenue, expenses, profit: revenue - expenses, sources, barData, lineData, deptFiltered };
  }, [transactions, dateRange, selectedDept]);

  // Handlers (AddExpense, Print) remain the same...
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

  function handleAddExpense(_event: FormEvent<HTMLFormElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <span className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl">₵</span>
            Financial Oversight
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* NEW: Department Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <Filter size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 text-sm font-bold rounded-xl outline-none focus:border-[#073159] w-full"
            >
                <option>All Departments</option>
                <option>Consultation</option>
                <option>Pharmacy</option>
                <option>Laboratory</option>
            </select>
          </div>

          <select 
             value={dateRange}
             onChange={(e) => setDateRange(e.target.value)}
             className="bg-white border border-gray-200 text-sm font-bold px-4 py-2.5 rounded-xl outline-none"
          >
             <option>Today</option>
             <option>This Week</option>
             <option>This Month</option>
             <option>This Year</option>
          </select>
          
          <button onClick={() => setShowPrintPreview(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl font-bold">
            <Printer size={16} /> Report
          </button>
        </div>
      </div>

      {/* Daily Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase text-xs tracking-wider">
            <LineChartIcon size={18} className="text-teal-500" /> 
            {selectedDept} - Daily Revenue Trend
        </h3>
        <div className="h-72 w-full">
            {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-300"><Loader2 className="animate-spin" /></div>
            ) : metrics.lineData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Activity size={32} className="mb-2 opacity-20" />
                    <p className="text-sm italic">No records found for this department in the selected period</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.lineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Line 
                            type="monotone" 
                            dataKey="Revenue" 
                            stroke="#2DD4BF" 
                            strokeWidth={3} 
                            dot={{fill: '#2DD4BF', strokeWidth: 2, r: 4}} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Metrics Cards (Update based on department selection) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceCard title={`${selectedDept} Revenue`} value={`₵${metrics.revenue.toLocaleString()}`} icon={<Wallet size={20}/>} color="bg-green-50 text-green-600" />
        <FinanceCard title={`${selectedDept} Expenses`} value={`₵${metrics.expenses.toLocaleString()}`} icon={<CreditCard size={20}/>} color="bg-red-50 text-red-600" />
        <FinanceCard title="Net Profit" value={`₵${metrics.profit.toLocaleString()}`} icon={<TrendingUp size={20}/>} color="bg-blue-50 text-blue-600" />
        <FinanceCard title="Clinic Health" value={metrics.profit > 0 ? "Healthy" : "Deficit"} subtext="Financial Status" icon={<Activity size={20}/>} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Department Comparison Bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-6">Global Revenue Share</h3>
          <div className="space-y-6">
              <BreakdownBar label="Consultations" amount={`₵${metrics.sources.consultation}`} percent={metrics.revenue > 0 ? (metrics.sources.consultation / metrics.revenue) * 100 : 0} color="bg-[#073159]" />
              <BreakdownBar label="Pharmacy" amount={`₵${metrics.sources.pharmacy}`} percent={metrics.revenue > 0 ? (metrics.sources.pharmacy / metrics.revenue) * 100 : 0} color="bg-teal-500" />
              <BreakdownBar label="Laboratory" amount={`₵${metrics.sources.lab}`} percent={metrics.revenue > 0 ? (metrics.sources.lab / metrics.revenue) * 100 : 0} color="bg-purple-500" />
          </div>
        </div>

        {/* Transactions List (Filtered by Dept) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[450px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800">{selectedDept} History</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {metrics.deptFiltered.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-gray-300 italic text-xs text-center p-4">No recent activity for this criteria.</div>
             ) : (
                metrics.deptFiltered.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="min-w-0 flex items-center gap-3">
                            <div className={`p-2 rounded-full shrink-0 ${tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                {tx.amount > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-bold text-gray-800 truncate">{tx.desc}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{tx.category}</p>
                            </div>
                        </div>
                        <p className={`text-sm font-bold shrink-0 ml-2 ${tx.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                            ₵{Math.abs(tx.amount).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center shrink-0">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 text-sm font-bold text-[#073159] border border-gray-200 rounded-xl bg-white hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                  <Plus size={16} /> Add Expense
              </button>
          </div>
        </div>
      </div>

      {/* --- ADD EXPENSE MODAL --- */}
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
                          <input name="desc" type="text" placeholder="e.g. Office Supplies" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:bg-white" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Amount (GHS)</label>
                              <input name="amount" type="number" step="0.01" placeholder="0.00" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:bg-white" required />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                              <select name="category" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white">
                                  <option>Utilities</option>
                                  <option>Medical Supplies</option>
                                  <option>Salaries</option>
                                  <option>Other</option>
                              </select>
                          </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg">
                          <Save size={18} /> Save Transaction
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* --- PRINT MODAL --- */}
      {showPrintPreview && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                  <div id="pos-report-content" className="p-8 bg-white text-gray-800 font-mono text-xs leading-relaxed">
                      <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
                          <img src={logo} alt="Logo" className="h-10 mx-auto mb-2 grayscale" />
                          <h2 className="font-bold text-sm uppercase">UrbanVital Health Centre</h2>
                          <p>Financial Summary</p>
                          <p className="mt-2 font-bold uppercase underline">Period: {dateRange}</p>
                      </div>
                      <div className="border-y border-dashed border-gray-400 py-2 mb-4">
                          <div className="flex justify-between font-bold"><span>REVENUE:</span><span>₵{metrics.revenue.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold"><span>EXPENSES:</span><span>₵{metrics.expenses.toFixed(2)}</span></div>
                          <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t"><span>PROFIT:</span><span>₵{metrics.profit.toFixed(2)}</span></div>
                      </div>
                      <div className="text-center border-t border-dashed border-gray-400 pt-4">
                          <p className="font-bold italic">Generated on {new Date().toLocaleDateString()}</p>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                      <button onClick={() => setShowPrintPreview(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600">Close</button>
                      <button onClick={handlePrint} className="flex-1 py-2.5 bg-[#073159] text-white rounded-xl font-bold flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// --- Internal Helper Components ---
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