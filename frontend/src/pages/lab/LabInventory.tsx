import { useState } from "react";
import { 
  Search, 
  FlaskConical, 
  AlertTriangle, 
  Plus, 
  Package,
  Calendar
} from "lucide-react";
import LabSidebar from "../../components/LabSidebar";
import LabNavbar from "../../components/LabNavbar";

export default function LabInventory() {
  const [search, setSearch] = useState("");

  // Mock Inventory Data
  const inventory = [
    { id: 1, name: "Malaria RDT Kits", category: "Test Kits", quantity: 15, unit: "Boxes", minLevel: 10, expiry: "2025-12-01", status: "Good" },
    { id: 2, name: "FBC Reagent (Diluent)", category: "Reagents", quantity: 2, unit: "Bottles", minLevel: 5, expiry: "2026-01-15", status: "Low Stock" },
    { id: 3, name: "Urine Containers", category: "Consumables", quantity: 500, unit: "Pcs", minLevel: 100, expiry: "N/A", status: "Good" },
    { id: 4, name: "Lipid Profile Strips", category: "Reagents", quantity: 0, unit: "Packs", minLevel: 2, expiry: "2025-10-20", status: "Out of Stock" },
    { id: 5, name: "EDTA Tubes (Purple)", category: "Consumables", quantity: 45, unit: "Packs", minLevel: 50, expiry: "2024-11-01", status: "Expired" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <LabSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <LabNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header: Stack on Mobile, Row on Desktop */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
                  <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-[#073159]" />
                  Inventory Management
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Track reagents, consumables, and expiry dates.</p>
              </div>
              <button className="w-full sm:w-auto bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#062a4d] shadow-lg text-sm sm:text-base transition-transform active:scale-95">
                <Plus size={18} /> Add New Item
              </button>
            </div>

            {/* Stats: 1 Col Mobile -> 3 Col Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24}/></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">2</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={24}/></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">1</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">Expiring Soon</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24}/></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">145</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Items</p>
                </div>
              </div>
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search inventory..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Table with Horizontal Scroll */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#073159]">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 font-medium">
                          {item.quantity} <span className="text-xs text-gray-400">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">{item.expiry}</td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Low Stock") return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Low Stock</span>;
  if (status === "Out of Stock") return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Empty</span>;
  if (status === "Expired") return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold line-through decoration-red-500 whitespace-nowrap">Expired</span>;
  return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Good</span>;
}