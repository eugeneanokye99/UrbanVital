import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; // 1. Import Context Hook
import { 
  Search, 
  Package, 
  Filter, 
  Download, 
  AlertTriangle, 
  DollarSign, 
  TrendingDown, 
  Calendar,
  FlaskConical,
  Plus,
  Edit,
  Trash2,
  X,
  Save
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminInventory() {
  // 2. Get Global Search Context
  const { globalSearch, setGlobalSearch } = useOutletContext<{ 
      globalSearch: string; 
      setGlobalSearch: (s: string) => void 
  }>();

  const [activeTab, setActiveTab] = useState<"pharmacy" | "lab">("pharmacy");
  const [localSearch, setLocalSearch] = useState(globalSearch); // Local state for input
  const [filter, setFilter] = useState("All");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Sync Global Search to Local State
  useEffect(() => {
      setLocalSearch(globalSearch);
  }, [globalSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      setGlobalSearch(val); // Updates Navbar too
  };

  // --- MOCK DATA ---
  const [pharmacyStock, setPharmacyStock] = useState([
    { id: 1, name: "Paracetamol 500mg", category: "Analgesic", stock: 450, minLevel: 100, price: 1.50, expiry: "2026-05-20", status: "Good" },
    { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 12, minLevel: 50, price: 15.00, expiry: "2025-12-10", status: "Low Stock" },
    { id: 3, name: "Artemether-Lum.", category: "Antimalarial", stock: 80, minLevel: 30, price: 35.00, expiry: "2024-02-15", status: "Expiring" },
  ]);

  const [labStock, setLabStock] = useState([
    { id: 101, name: "Malaria RDT Kits", category: "Test Kits", stock: 15, minLevel: 10, unit: "Boxes", expiry: "2025-12-01", status: "Good" },
    { id: 102, name: "FBC Reagent (Diluent)", category: "Reagents", stock: 2, minLevel: 5, unit: "Bottles", expiry: "2026-01-15", status: "Low Stock" },
    { id: 103, name: "Microscope Slides", category: "Consumables", stock: 500, minLevel: 100, unit: "Pcs", expiry: "N/A", status: "Good" },
  ]);

  // Determine current dataset
  const currentData = activeTab === "pharmacy" ? pharmacyStock : labStock;

  // --- HANDLERS ---

  const handleAddNew = () => {
    setEditingItem(null); 
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Are you sure you want to delete this item? This cannot be undone.")) {
        if(activeTab === "pharmacy") {
            setPharmacyStock(prev => prev.filter(i => i.id !== id));
        } else {
            setLabStock(prev => prev.filter(i => i.id !== id));
        }
        toast.success("Item deleted successfully.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const id = editingItem ? editingItem.id : Date.now();
    const stock = Number(formData.get("stock"));
    const minLevel = Number(formData.get("minLevel"));
    
    let status = "Good";
    if (stock === 0) status = "Out of Stock";
    else if (stock <= minLevel) status = "Low Stock";

    const baseItem = {
        id,
        name: String(formData.get("name") || ""),
        category: String(formData.get("category") || ""),
        stock,
        minLevel,
        expiry: String(formData.get("expiry") || ""),
        status
    };

    if (activeTab === "pharmacy") {
        const newItem = {
            ...baseItem,
            price: Number(formData.get("price") || 0),
        };

        if (editingItem) {
            setPharmacyStock(prev => prev.map(i => i.id === newItem.id ? newItem : i));
            toast.success("Pharmacy item updated");
        } else {
            setPharmacyStock(prev => [...prev, newItem]);
            toast.success("Added to Pharmacy Inventory");
        }
    } else {
        const newItem = {
            ...baseItem,
            unit: String(formData.get("unit") || "Units"),
        };

        if (editingItem) {
            setLabStock(prev => prev.map(i => i.id === newItem.id ? newItem : i));
            toast.success("Lab item updated");
        } else {
            setLabStock(prev => [...prev, newItem]);
            toast.success("Added to Lab Inventory");
        }
    }
    setIsModalOpen(false);
  };

  // Filter Logic (Now uses `localSearch` which is synced with Global)
  const filteredInventory = useMemo(() => {
    return currentData.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(localSearch.toLowerCase());
      if (filter === "Low") return (item.status === "Low Stock" || item.status === "Out of Stock") && matchesSearch;
      if (filter === "Expiring") return item.status === "Expiring" && matchesSearch;
      return matchesSearch;
    });
  }, [currentData, localSearch, filter]);

  // --- CSV EXPORT HANDLER ---
  const handleExport = () => {
      if (filteredInventory.length === 0) {
          toast.error("No data to export");
          return;
      }

      const headers = activeTab === "pharmacy" 
        ? ["Item Name", "Category", "Stock Level", "Min Level", "Unit Price", "Expiry Date", "Status"]
        : ["Item Name", "Category", "Stock Level", "Min Level", "Unit Type", "Expiry Date", "Status"];

      const csvRows = filteredInventory.map((item: any) => {
          if (activeTab === "pharmacy") {
              return [
                  `"${item.name}"`, 
                  item.category,
                  item.stock,
                  item.minLevel,
                  item.price.toFixed(2),
                  item.expiry,
                  item.status
              ];
          } else {
              return [
                  `"${item.name}"`,
                  item.category,
                  item.stock,
                  item.minLevel,
                  item.unit,
                  item.expiry,
                  item.status
              ];
          }
      });

      const csvString = [
          headers.join(","), 
          ...csvRows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${activeTab}_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${activeTab === 'pharmacy' ? 'Pharmacy' : 'Lab'} inventory exported as CSV!`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Master Inventory Control
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage assets across Pharmacy and Laboratory departments.
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleAddNew}
                className="bg-[#073159] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-[#062a4d] transition-transform active:scale-95 text-sm"
            >
                <Plus size={18} /> Add New Item
            </button>
            <button 
                onClick={handleExport}
                className="bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm active:scale-95 transition-all"
            >
                <Download size={18} /> Export CSV
            </button>
        </div>
      </div>

      {/* --- Department Switcher --- */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
          <button 
            onClick={() => setActiveTab("pharmacy")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "pharmacy" ? "bg-white text-[#073159] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
              <Package size={16} /> Pharmacy Stock
          </button>
          <button 
            onClick={() => setActiveTab("lab")}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "lab" ? "bg-white text-[#073159] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
              <FlaskConical size={16} /> Lab Inventory
          </button>
      </div>

      {/* --- Stats Cards (Dynamic based on Tab) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Items" 
          value={currentData.length.toString()} 
          icon={<Package size={20} />} 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Low Stock" 
          value={currentData.filter((i: any) => i.status === "Low Stock").length.toString()} 
          icon={<TrendingDown size={20} />} 
          color="bg-red-50 text-red-600"
        />
        <StatCard 
          title="Expiring Soon" 
          value={currentData.filter((i: any) => i.status === "Expiring").length.toString()} 
          icon={<Calendar size={20} />} 
          color="bg-orange-50 text-orange-600"
        />
        {activeTab === "pharmacy" && (
            <StatCard 
            title="Total Value" 
            value={`GH₵ ${pharmacyStock.reduce((acc, i) => acc + (i.price * i.stock), 0).toFixed(2)}`} 
            icon={<DollarSign size={20} />} 
            color="bg-green-50 text-green-600"
            />
        )}
      </div>

      {/* --- Unified Inventory Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab} items...`}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Filter size={18} className="text-gray-400 hidden md:block flex-shrink-0" />
              {['All', 'Low', 'Expiring'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                    filter === f ? "bg-[#073159] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f === 'All' ? 'All Stock' : f}
                </button>
              ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Level</th>
                {activeTab === "pharmacy" && <th className="px-6 py-4">Unit Price</th>}
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredInventory.map((item: any) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-[#073159]">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 font-medium">
                      {item.stock} <span className="text-xs text-gray-400">{activeTab === "lab" ? item.unit : ""}</span>
                  </td>
                  {activeTab === "pharmacy" && (
                      <td className="px-6 py-4 text-gray-700">₵{item.price.toFixed(2)}</td>
                  )}
                  <td className="px-6 py-4 font-mono text-gray-600">{item.expiry}</td>
                  <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                              <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
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

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white">
                      <h3 className="font-bold flex items-center gap-2">
                          {editingItem ? <Edit size={18} /> : <Plus size={18} />}
                          {editingItem ? `Edit ${activeTab === 'pharmacy' ? 'Drug' : 'Item'}` : `Add to ${activeTab === 'pharmacy' ? 'Pharmacy' : 'Lab'}`}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                          <input name="name" type="text" defaultValue={editingItem?.name} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159] transition-all" required />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                              <input name="category" type="text" defaultValue={editingItem?.category} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                              <input name="expiry" type="date" defaultValue={editingItem?.expiry} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Current Stock</label>
                              <input name="stock" type="number" defaultValue={editingItem?.stock} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none font-bold text-gray-800" required />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase text-red-500">Min. Level Alert</label>
                              <input name="minLevel" type="number" defaultValue={editingItem?.minLevel || 10} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                          </div>
                      </div>

                      {/* Conditional Fields based on Tab */}
                      {activeTab === "pharmacy" ? (
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Selling Price (₵)</label>
                              <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
                          </div>
                      ) : (
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Unit Type</label>
                              <select name="unit" defaultValue={editingItem?.unit || "Pcs"} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none">
                                  <option value="Pcs">Pieces</option>
                                  <option value="Boxes">Boxes</option>
                                  <option value="Bottles">Bottles</option>
                                  <option value="Kits">Kits</option>
                              </select>
                          </div>
                      )}

                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                          <button type="submit" className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg">
                              <Save size={18} /> Save Item
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}

// Reusable Helper Components
function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md cursor-pointer hover:-translate-y-1">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-[#073159]">{value}</h3>
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