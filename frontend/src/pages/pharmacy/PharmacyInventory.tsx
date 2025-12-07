import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { 
  Pill, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Package, 
  TrendingDown,
  X,
  Save
} from "lucide-react";
import PharmacyNavbar from "../../components/PharmacyNavbar";
import PharmacySidebar from "../../components/PharmacySidebar";

export default function PharmacyInventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // All, Low, Expiring
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // --- MOCK DATABASE ---
  const [inventory, setInventory] = useState([
    { id: 1, name: "Paracetamol 500mg", category: "Analgesic", stock: 450, minLevel: 100, price: 1.50, expiry: "2026-05-20", batch: "BATCH-001" },
    { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 12, minLevel: 50, price: 15.00, expiry: "2025-12-10", batch: "BATCH-099" },
    { id: 3, name: "Artemether-Lum.", category: "Antimalarial", stock: 80, minLevel: 30, price: 35.00, expiry: "2024-02-15", batch: "BATCH-X12" }, // Expiring
    { id: 4, name: "Ciprofloxacin", category: "Antibiotic", stock: 0, minLevel: 20, price: 12.50, expiry: "2025-08-01", batch: "BATCH-882" },
    { id: 5, name: "Multivitamin Syrup", category: "Supplement", stock: 200, minLevel: 50, price: 25.00, expiry: "2026-01-01", batch: "BATCH-777" },
  ]);

  // --- SMART STATUS LOGIC ---
  const getStatus = (item: any) => {
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    const monthsUntilExpiry = (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (item.stock === 0) return "Out of Stock";
    if (monthsUntilExpiry <= 3) return "Expiring Soon"; 
    if (item.stock <= item.minLevel) return "Low Stock";
    return "Good";
  };

  // --- FILTERING ---
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const status = getStatus(item);
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      
      if (filter === "Low") return (status === "Low Stock" || status === "Out of Stock") && matchesSearch;
      if (filter === "Expiring") return status === "Expiring Soon" && matchesSearch;
      return matchesSearch;
    });
  }, [inventory, search, filter]);

  // --- HANDLERS ---
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null); 
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setInventory(prev =>
      prev.map(i => (i.id === editingItem.id ? { ...i, ...editingItem } : i))
    );
    toast.success(editingItem ? "Stock Updated Successfully" : "New Drug Added to Inventory");
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <PharmacySidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <PharmacyNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header: Stack on Mobile, Row on Desktop */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[#073159]" />
                  Pharmacy Inventory
                </h1>
                <p className="text-sm sm:text-base text-gray-500">Manage drug stocks, prices, and expiry alerts.</p>
              </div>
              <button 
                onClick={handleAddNew}
                className="w-full sm:w-auto bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-[#062a4d] transition-transform active:scale-95 text-sm sm:text-base"
              >
                <Plus size={18} /> Add New Stock
              </button>
            </div>

            {/* Alert / Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Pill size={24}/></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{inventory.length}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Products</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><TrendingDown size={24}/></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {inventory.filter(i => i.stock <= i.minLevel).length}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={24}/></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                      {inventory.filter(i => getStatus(i) === "Expiring Soon").length}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 uppercase">Expiring Soon</p>
                </div>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row gap-4 justify-between">
                <div className="relative flex-1 w-full lg:max-w-md">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search drug name..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 w-full lg:w-auto">
                  {['All', 'Low', 'Expiring'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex-1 lg:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                        filter === f 
                        ? "bg-[#073159] text-white shadow-md" 
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {f === "All" ? "All" : f === "Low" ? "Low Stock" : "Expiring"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Container - Allow Scroll on Mobile */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-4">Drug Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Unit Price</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredInventory.map((item) => {
                        const status = getStatus(item);
                        return (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-[#073159]">{item.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{item.batch}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.category}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-8">{item.stock}</span>
                                        {/* Visual Bar */}
                                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    status === "Out of Stock" ? "bg-gray-200" :
                                                    status === "Low Stock" ? "bg-red-500" : 
                                                    "bg-green-500"
                                                }`} 
                                                style={{ width: `${Math.min((item.stock / 500) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-700">₵{item.price.toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono text-gray-600">{item.expiry}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Stock"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>

        {/* --- ADD / EDIT STOCK MODAL (Responsive) --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white">
                        <h3 className="font-bold flex items-center gap-2">
                            {editingItem ? <Edit size={18} /> : <Plus size={18} />}
                            {editingItem ? "Update Stock" : "Add Drug"}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Drug Name</label>
                            <input type="text" defaultValue={editingItem?.name} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <select className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none">
                                    <option>Antibiotic</option>
                                    <option>Analgesic</option>
                                    <option>Supplement</option>
                                    <option>Antimalarial</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Batch Number</label>
                                <input type="text" defaultValue={editingItem?.batch} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" placeholder="e.g. BTC-001" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Current Stock</label>
                                <input type="number" defaultValue={editingItem?.stock} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none font-bold text-gray-800" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase text-red-500">Low Alert Level</label>
                                <input type="number" defaultValue={editingItem?.minLevel || 20} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Price (₵)</label>
                                <input type="number" step="0.01" defaultValue={editingItem?.price} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                            <input type="date" defaultValue={editingItem?.expiry} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg">
                                <Save size={18} /> Save Record
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Out of Stock") return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><X size={10}/> Empty</span>;
  if (status === "Low Stock") return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><TrendingDown size={10}/> Low</span>;
  if (status === "Expiring Soon") return <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><AlertTriangle size={10}/> Expiring</span>;
  return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold uppercase w-fit">Good</span>;
}