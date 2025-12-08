import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  CreditCard,
  Wallet,
  Activity
} from "lucide-react";

export default function AdminFinance() {
  const [dateRange, setDateRange] = useState("This Week");

  // Mock Transactions
  const transactions = [
    { id: "TRX-991", date: "24 Oct", desc: "Pharmacy Sales", category: "Revenue", amount: 4500, status: "Cleared" },
    { id: "TRX-992", date: "24 Oct", desc: "Supplier Payment (Drugs)", category: "Expense", amount: -1200, status: "Cleared" },
    { id: "TRX-993", date: "23 Oct", desc: "Lab Services", category: "Revenue", amount: 2100, status: "Cleared" },
    { id: "TRX-994", date: "23 Oct", desc: "Maintenance Repair", category: "Expense", amount: -350, status: "Pending" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Financial Overview
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Track revenue, expenses, and clinic profitability.</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select 
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
               className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-[#073159] appearance-none"
            >
               <option>Today</option>
               <option>This Week</option>
               <option>This Month</option>
               <option>This Year</option>
            </select>
            {/* Custom chevron could go here if appearance-none is used */}
          </div>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] text-sm font-bold shadow-md transition-transform active:scale-95">
            <Download size={16} /> Report
          </button>
        </div>
      </div>

      {/* --- Metrics Cards --- */}
      {/* 1 col mobile -> 2 cols tablet -> 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <FinanceCard title="Total Revenue" value="GH₵ 24,500" change="+12.5%" icon={<Wallet size={20}/>} color="bg-green-50 text-green-600" />
        <FinanceCard title="Total Expenses" value="GH₵ 8,200" change="+4.1%" icon={<CreditCard size={20}/>} color="bg-red-50 text-red-600" trend="down" />
        <FinanceCard title="Net Profit" value="GH₵ 16,300" change="+15.2%" icon={<TrendingUp size={20}/>} color="bg-blue-50 text-blue-600" />
        <FinanceCard title="Pending Claims" value="GH₵ 3,450" subtext="Insurance" icon={<Activity size={20}/>} color="bg-orange-50 text-orange-600" />
      </div>

      {/* --- Main Content Split --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Col: Revenue Breakdown (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h3 className="font-bold text-base md:text-lg text-gray-800 mb-6">Revenue Trends & Sources</h3>
          
          {/* Chart Container */}
          <div className="h-48 w-full mb-8 overflow-hidden relative">
              <svg viewBox="0 0 600 150" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M0 100 Q 150 20 300 80 T 600 40" fill="none" stroke="#073159" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                  <path d="M0 100 Q 150 20 300 80 T 600 40 V 150 H 0 Z" fill="url(#grad1)" opacity="0.1" />
                  <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#073159" stopOpacity="1" />
                          <stop offset="100%" stopColor="#073159" stopOpacity="0" />
                      </linearGradient>
                  </defs>
              </svg>
          </div>

          {/* Department Breakdown Bars */}
          <div className="space-y-5">
              <BreakdownBar label="Consultation Fees" amount="GH₵ 10,200" percent={45} color="bg-[#073159]" />
              <BreakdownBar label="Pharmacy Sales" amount="GH₵ 8,400" percent={35} color="bg-teal-500" />
              <BreakdownBar label="Laboratory Services" amount="GH₵ 5,900" percent={20} color="bg-purple-500" />
          </div>
        </div>

        {/* Right Col: Recent Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[500px] lg:h-auto">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-800 text-base md:text-lg">Recent Activity</h3>
              <button className="text-xs font-bold text-[#073159] hover:underline">View All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full shrink-0 ${tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                              {tx.amount > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          </div>
                          <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{tx.desc}</p>
                              <p className="text-xs text-gray-500 truncate">{tx.date} • {tx.category}</p>
                          </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                          <p className={`text-sm font-bold ${tx.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                              {tx.amount > 0 ? "+" : ""}GH₵ {Math.abs(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400">{tx.status}</p>
                      </div>
                  </div>
              ))}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center shrink-0">
              <button className="w-full py-2.5 text-sm font-bold text-[#073159] border border-gray-200 rounded-xl bg-white hover:bg-gray-100 transition-colors">
                  Add Expense
              </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// --- Helper Components ---

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
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    )
}