import { useState, useMemo, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
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
  Save,
  ListPlus
} from "lucide-react";

export default function PharmacyInventory() {
  const location = useLocation(); 

  // 1. Get Global Search
  const { globalSearch, setGlobalSearch } = useOutletContext<{ 
      globalSearch: string; 
      setGlobalSearch: (s: string) => void 
  }>();

  // 2. Local State
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const [filter, setFilter] = useState("All"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // 3. Dynamic Categories State
  const [categories, setCategories] = useState(["Antibiotic", "Analgesic", "Supplement", "Antimalarial", "Antihypertensive"]);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // 4. Highlighting Logic
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // --- MOCK DATABASE ---
  const [inventory, setInventory] = useState([
    { id: 1, name: "Paracetamol 500mg", category: "Analgesic", stock: 450, minLevel: 100, price: 1.50, expiry: "2026-05-20", batch: "BATCH-001" },
    { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 12, minLevel: 50, price: 15.00, expiry: "2025-12-10", batch: "BATCH-099" },
    { id: 3, name: "Artemether-Lum.", category: "Antimalarial", stock: 80, minLevel: 30, price: 35.00, expiry: "2024-02-15", batch: "BATCH-X12" }, 
    { id: 4, name: "Ciprofloxacin", category: "Antibiotic", stock: 0, minLevel: 20, price: 12.50, expiry: "2025-08-01", batch: "BATCH-882" },
    { id: 5, name: "Multivitamin Syrup", category: "Supplement", stock: 200, minLevel: 50, price: 25.00, expiry: "2026-01-01", batch: "BATCH-777" },
  ]);

  // Sync state when global search changes
  useEffect(() => {
      setLocalSearch(globalSearch);
  }, [globalSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      setGlobalSearch(val);
  };

  // Handle Highlighting from Alerts Page
  useEffect(() => {
    if (location.state?.highlight) {
        const itemToHighlight = inventory.find(i => 
            i.name.toLowerCase().includes(location.state.highlight.toLowerCase())
        );

        if (itemToHighlight) {
            setHighlightedId(itemToHighlight.id);
            // Auto-clear highlight after 3 seconds
            setTimeout(() => setHighlightedId(null), 3000);
        }
    }
  }, [location.state, inventory]);

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
      const matchesSearch = item.name.toLowerCase().includes(localSearch.toLowerCase());
      
      if (filter === "Low") return (status === "Low Stock" || status === "Out of Stock") && matchesSearch;
      if (filter === "Expiring") return status === "Expiring Soon" && matchesSearch;
      return matchesSearch;
    });
  }, [inventory, localSearch, filter]);

  // --- HANDLERS ---
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewCategoryMode(false);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem({ category: categories[0] }); // Default to first category
    setNewCategoryMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
      if (window.confirm("Are you sure you want to delete this item?")) {
          setInventory(prev => prev.filter(i => i.id !== id));
          toast.success("Item removed from inventory");
      }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle New Category Creation
    let finalCategory = editingItem.category;
    if (newCategoryMode && newCategoryName.trim() !== "") {
        finalCategory = newCategoryName;
        if (!categories.includes(finalCategory)) {
            setCategories([...categories, finalCategory]); // Add to list
        }
    }

    const itemToSave = { ...editingItem, category: finalCategory };

    if (editingItem.id) {
        // Update Existing
        setInventory(prev => prev.map(i => (i.id === editingItem.id ? { ...i, ...itemToSave } : i)));
        toast.success("Stock Updated Successfully");
    } else {
        // Add New
        const newItem = { ...itemToSave, id: Date.now() }; 
        setInventory(prev => [...prev, newItem]);
        toast.success("New Drug Added to Inventory");
    }
    setIsModalOpen(false);
    setNewCategoryName(""); // Reset
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search drug name..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Low', 'Expiring'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
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

        {/* Table Container */}
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
              {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                      const status = getStatus(item);
                      // Apply Highlight Style if ID matches
                      const isHighlighted = item.id === highlightedId;

                      return (
                          <tr 
                            key={item.id} 
                            className={`transition-all duration-500 group ${
                                isHighlighted 
                                ? "bg-yellow-100 border-l-4 border-yellow-500 shadow-md scale-[1.01]" 
                                : "hover:bg-blue-50/30"
                            }`}
                          >
                              <td className="px-6 py-4">
                                  <p className="font-bold text-[#073159]">{item.name}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{item.batch}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{item.category}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold w-8">{item.stock}</span>
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
                                      <button 
                                          onClick={() => handleDelete(item.id)}
                                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      );
                  })
              ) : (
                  <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                          No items found matching "{localSearch}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT STOCK MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white shrink-0">
                      <h3 className="font-bold flex items-center gap-2">
                          {editingItem.id ? <Edit size={18} /> : <Plus size={18} />}
                          {editingItem.id ? "Update Stock" : "Add Drug"}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  
                  {/* Modal Body */}
                  <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Drug Name</label>
                          <input 
                            type="text" 
                            defaultValue={editingItem?.name} 
                            onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                            className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all" 
                            required 
                          />
                      </div>
                      
                      {/* --- DYNAMIC CATEGORY SECTION --- */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <button 
                                    type="button"
                                    onClick={() => setNewCategoryMode(!newCategoryMode)}
                                    className="text-[10px] text-[#073159] font-bold hover:underline flex items-center gap-1"
                                >
                                    {newCategoryMode ? "Select Existing" : <><ListPlus size={10}/> Create New</>}
                                </button>
                              </div>
                              
                              {newCategoryMode ? (
                                  <input 
                                    type="text"
                                    placeholder="Enter new category..."
                                    className="w-full p-2.5 border rounded-xl bg-white focus:border-[#073159] outline-none animate-in fade-in"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    autoFocus
                                  />
                              ) : (
                                  <select 
                                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none"
                                    value={editingItem?.category}
                                    onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                                  >
                                      {categories.map(cat => (
                                          <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                  </select>
                              )}
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Batch Number</label>
                              <input type="text" defaultValue={editingItem?.batch} onChange={e => setEditingItem({...editingItem, batch: e.target.value})} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" placeholder="e.g. BTC-001" />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Current Stock</label>
                              <input type="number" defaultValue={editingItem?.stock} onChange={e => setEditingItem({...editingItem, stock: parseInt(e.target.value)})} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none font-bold text-gray-800" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase text-red-500">Low Alert Level</label>
                              <input type="number" defaultValue={editingItem?.minLevel || 20} onChange={e => setEditingItem({...editingItem, minLevel: parseInt(e.target.value)})} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">Price (₵)</label>
                              <input type="number" step="0.01" defaultValue={editingItem?.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                          <input type="date" defaultValue={editingItem?.expiry} onChange={e => setEditingItem({...editingItem, expiry: e.target.value})} className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none" required />
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
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Out of Stock") return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><X size={10}/> Empty</span>;
  if (status === "Low Stock") return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><TrendingDown size={10}/> Low</span>;
  if (status === "Expiring Soon") return <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><AlertTriangle size={10}/> Expiring</span>;
  return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-bold uppercase w-fit">Good</span>;
}