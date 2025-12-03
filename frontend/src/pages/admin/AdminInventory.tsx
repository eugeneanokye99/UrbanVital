import { useState, useMemo } from "react";
import { 
  Search, 
  Package, 
  Filter, 
  Download, 
  AlertTriangle, 
  DollarSign, 
  TrendingDown, 
  Calendar 
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminInventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Mock Inventory Data
  const inventory = [
    { id: 1, name: "Paracetamol 500mg", category: "Analgesic", stock: 450, minLevel: 100, price: 1.50, value: 675.00, expiry: "2026-05-20", status: "Good" },
    { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 12, minLevel: 50, price: 15.00, value: 180.00, expiry: "2025-12-10", status: "Low Stock" },
    { id: 3, name: "Artemether-Lum.", category: "Antimalarial", stock: 80, minLevel: 30, price: 35.00, value: 2800.00, expiry: "2024-02-15", status: "Expiring" },
    { id: 4, name: "Ciprofloxacin", category: "Antibiotic", stock: 0, minLevel: 20, price: 12.50, value: 0.00, expiry: "2025-08-01", status: "Out of Stock" },
    { id: 5, name: "Multivitamin Syrup", category: "Supplement", stock: 200, minLevel: 50, price: 25.00, value: 5000.00, expiry: "2026-01-01", status: "Good" },
  ];

  // Filter Logic
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      if (filter === "Low") return (item.status === "Low Stock" || item.status === "Out of Stock") && matchesSearch;
      if (filter === "Expiring") return item.status === "Expiring" && matchesSearch;
      return matchesSearch;
    });
  }, [inventory, search, filter]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            
            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
                  <Package className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
                  Pharmacy Inventory Oversight
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">
                  Monitor stock levels, valuation, and expiration risks.
                </p>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#073159] rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm shadow-sm">
                <Download size={18} />
                <span>Export Audit Report</span>
              </button>
            </div>

            {/* --- Financial & Risk Stats --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                title="Total Valuation" 
                value="GH₵ 8,655" 
                icon={<DollarSign size={20} />} 
                color="bg-green-50 text-green-600"
                subtext="Asset Value"
              />
              <StatCard 
                title="Total Items" 
                value="742" 
                icon={<Package size={20} />} 
                color="bg-blue-50 text-blue-600"
                subtext="Across 5 Categories"
              />
              <StatCard 
                title="Low Stock Alert" 
                value="2" 
                icon={<TrendingDown size={20} />} 
                color="bg-red-50 text-red-600"
                subtext="Requires Reorder"
              />
              <StatCard 
                title="Expiring Soon" 
                value="1" 
                icon={<Calendar size={20} />} 
                color="bg-orange-50 text-orange-600"
                subtext="Within 90 Days"
              />
            </div>

            {/* --- Inventory Table --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search drug name or category..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                   <Filter size={18} className="text-gray-400 hidden md:block" />
                   {['All', 'Low', 'Expiring'].map((f) => (
                     <button 
                       key={f}
                       onClick={() => setFilter(f)}
                       className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                         filter === f ? "bg-[#073159] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                       }`}
                     >
                       {f === 'All' ? 'All Stock' : f === 'Low' ? 'Low Stock' : 'Expiring'}
                     </button>
                   ))}
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Drug Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Unit Price</th>
                      <th className="px-6 py-4">Total Value</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#073159]">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Exp: {item.expiry}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.category}</td>
                        <td className="px-6 py-4">
                           <div className="w-full max-w-[120px]">
                              <div className="flex justify-between text-xs mb-1">
                                 <span className="font-bold">{item.stock}</span>
                                 <span className="text-gray-400">/ {item.stock + 100}</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${
                                       item.status === "Low Stock" || item.status === "Out of Stock" ? "bg-red-500" : "bg-green-500"
                                    }`} 
                                    style={{ width: `${(item.stock / (item.stock + 100)) * 100}%` }}
                                 ></div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                           ₵{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                           ₵{item.value.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredInventory.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-sm">
                   No inventory items found matching your filters.
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, color, subtext }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:-translate-y-1">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-[#073159]">{value}</h3>
                <p className="text-[10px] text-gray-400 mt-1">{subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Out of Stock") return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1">Empty</span>;
  if (status === "Low Stock") return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1"><TrendingDown size={10}/> Low</span>;
  if (status === "Expiring") return <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1"><AlertTriangle size={10}/> Expiring</span>;
  return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Good</span>;
}