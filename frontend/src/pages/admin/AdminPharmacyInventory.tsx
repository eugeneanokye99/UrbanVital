import { useState, useMemo, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  Search, 
  Package, 
  Download, 
  DollarSign, 
  TrendingDown, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,  
  Loader2,
  RefreshCw,
  ArrowLeft,
  Lock,       // New Icon
  Unlock      // New Icon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  fetchPharmacyItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getStockStatusInfo,
  formatCurrency,
  formatDate
} from "../../services/api"; 

export default function AdminPharmacyInventory() {
  const navigate = useNavigate();
  const { globalSearch, setGlobalSearch } = useOutletContext<{ 
      globalSearch: string; 
      setGlobalSearch: (s: string) => void 
  }>();

  const [localSearch, setLocalSearch] = useState(globalSearch);
  const [filter, setFilter] = useState("All");
  
  // API State
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalSearch(globalSearch); }, [globalSearch]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPharmacyItems();
      setInventory(data || []);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Network Error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculatedStats = useMemo(() => {
    if (!inventory.length) return { lowStock: 0, expiringSoon: 0, totalValue: 0 };
    
    const totalValue = inventory.reduce((sum, item) => {
      const stock = Number(item.current_stock) || 0;
      const price = Number(item.selling_price) || 0;
      return sum + (stock * price);
    }, 0);

    return {
      lowStock: inventory.filter(i => i.current_stock <= i.minimum_stock).length,
      expiringSoon: inventory.filter(i => getStockStatusInfo(i).text === 'Expiring Soon').length,
      totalValue: totalValue
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item: any) => {
      const matchesSearch = item.name?.toLowerCase().includes(localSearch.toLowerCase()) || 
                            item.item_id?.toLowerCase().includes(localSearch.toLowerCase());
      
      const statusInfo = getStockStatusInfo(item);
      
      // Filter Logic
      if (filter === "Low") return (statusInfo.text === 'Low Stock' || statusInfo.text === 'Out of Stock') && matchesSearch;
      if (filter === "Expiring") return statusInfo.text === 'Expiring Soon' && matchesSearch;
      if (filter === "Locked") return item.is_locked === true && matchesSearch; // New Filter Option
      
      return matchesSearch;
    });
  }, [inventory, localSearch, filter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const expiryValue = formData.get("expiry") ? String(formData.get("expiry")) : undefined;
      // Block past expiry date on frontend
      if (expiryValue) {
        const expiryDate = new Date(expiryValue);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (expiryDate < today) {
          toast.error("Expiry date cannot be in the past.");
          setSaving(false);
          return;
        }
      }
      const currentStock = parseFloat(formData.get("stock") as string) || 0;
      const minStock = parseFloat(formData.get("minLevel") as string) || 0;
      const costPrice = parseFloat(formData.get("costPrice") as string) || 0;
      const sellingPrice = parseFloat(formData.get("sellingPrice") as string) || 0;

      const itemData: any = {
        name: String(formData.get("name")),
        department: "PHARMACY",
        manufacturer: String(formData.get("manufacturer") || ""),
        current_stock: currentStock,
        minimum_stock: minStock,
        unit_of_measure: String(formData.get("unit")),
        unit_cost: costPrice,
        selling_price: sellingPrice,
        manufacturing_date: formData.get("mfgDate") ? String(formData.get("mfgDate")) : undefined,
        expiry_date: expiryValue,
        is_active: true,
        is_locked: editingItem ? editingItem.is_locked : false // Preserve lock state on edit
      };

      if (editingItem) {
        const updated = await updateInventoryItem(editingItem.id, itemData);
        setInventory(prev => prev.map(i => i.id === editingItem.id ? updated : i));
        toast.success("Drug updated successfully");
      } else {
        const created = await createInventoryItem(itemData);
        const safeCreated = {
            ...created,
            current_stock: Number(created.current_stock) || currentStock,
            selling_price: Number(created.selling_price) || sellingPrice
        };
        setInventory(prev => [...prev, safeCreated]);
        toast.success("New drug added to stock");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save item";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // --- NEW: Toggle Lock Status ---
  const handleToggleLock = async (item: any) => {
    const newLockStatus = !item.is_locked;
    const action = newLockStatus ? "Locked" : "Unlocked";
    
    // Optimistic UI Update
    const originalInventory = [...inventory];
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, is_locked: newLockStatus } : i));

    try {
        await updateInventoryItem(item.id, { ...item, is_locked: newLockStatus });
        toast.success(`${item.name} has been ${action}`);
    } catch (error: any) {
        // Revert on failure
        setInventory(originalInventory);
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          `Failed to ${action.toLowerCase()} item`;
        toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("Delete this drug from inventory?")) return;
      try {
          await deleteInventoryItem(id);
          setInventory(prev => prev.filter(i => i.id !== id));
          toast.success("Deleted successfully");
      } catch (err: any) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete";
        toast.error(message);
      }
  };

  const handleExport = () => {
      if(!filteredInventory.length) return toast.error("No data");
      const csvContent = "Item ID,Name,Manufacturer,Stock,Min,Unit,Cost,Price,Mfg Date,Expiry,Locked\n" + 
        filteredInventory.map(i => `"${i.item_id}","${i.name}","${i.manufacturer || ''}",${i.current_stock},${i.minimum_stock},${i.unit_of_measure},${i.unit_cost},${i.selling_price},${i.manufacturing_date},${i.expiry_date},${i.is_locked ? 'Yes' : 'No'}`).join("\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([csvContent], {type: "text/csv"}));
      link.download = `pharmacy_stock_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => navigate("/admin/inventory")} 
            className="mt-1 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            title="Back to Hub"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-2">
              <Package className="w-8 h-8" /> Pharmacy Inventory
            </h1>
            <p className="text-gray-500 mt-1">Manage pharmaceutical stock, prices, and expiry dates.</p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto ml-11 sm:ml-0">
            <button onClick={loadData} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-[#073159] hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="px-4 py-2 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center gap-2 shadow-lg">
                <Plus size={18} /> Add Drug
            </button>
            <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                <Download size={18} /> Export
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Drugs" value={inventory.length} icon={<Package size={20} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Low Stock" value={calculatedStats.lowStock} icon={<TrendingDown size={20} />} color="bg-red-50 text-red-600" />
        <StatCard title="Expiring Soon" value={calculatedStats.expiringSoon} icon={<Calendar size={20} />} color="bg-orange-50 text-orange-600" />
        <StatCard title="Inventory Value" value={formatCurrency(calculatedStats.totalValue)} icon={<DollarSign size={20} />} color="bg-green-50 text-green-600" />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 justify-between bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search drugs by name or ID..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#073159] outline-none"
                    value={localSearch}
                    onChange={(e) => { setLocalSearch(e.target.value); setGlobalSearch(e.target.value); }}
                />
            </div>
            <div className="flex gap-2">
                {['All', 'Low', 'Expiring', 'Locked'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === f ? "bg-[#073159] text-white" : "bg-white border text-gray-600"}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                        <th className="px-6 py-4">Drug Name</th>
                        <th className="px-6 py-4">Stock Level</th>
                        <th className="px-6 py-4">Manufacturer</th>
                        <th className="px-6 py-4">Unit Price</th>
                        <th className="px-6 py-4">Expiry</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading pharmacy data...</td></tr>
                    ) : filteredInventory.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">No drugs found.</td></tr>
                    ) : (
                        filteredInventory.map((item) => (
                            <tr key={item.id} className={`group transition-colors ${item.is_locked ? "bg-gray-50/80" : "hover:bg-blue-50/30"}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {item.is_locked && <Lock size={14} className="text-red-500" />}
                                        <div className={`font-bold ${item.is_locked ? "text-gray-500" : "text-[#073159]"}`}>{item.name}</div>
                                    </div>
                                    <div className="text-xs text-gray-400 ml-5 md:ml-0">{item.item_id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium">{item.current_stock}</span> <span className="text-xs text-gray-500">{item.unit_of_measure}</span>
                                    <div className="text-[10px] text-gray-400">Min: {item.minimum_stock}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.manufacturer || '-'}</td>
                                <td className="px-6 py-4 font-mono font-medium text-gray-700">{formatCurrency(item.selling_price)}</td>
                                <td className="px-6 py-4 font-mono text-gray-600">{formatDate(item.expiry_date)}</td>
                                <td className="px-6 py-4 text-center"><StatusBadge status={getStockStatusInfo(item)} /></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        
                                        {/* Lock Toggle Button */}
                                        <button 
                                            onClick={() => handleToggleLock(item)} 
                                            className={`p-2 rounded-lg transition-colors ${item.is_locked ? "text-green-600 hover:bg-green-50" : "text-orange-500 hover:bg-orange-50"}`}
                                            title={item.is_locked ? "Unlock Item" : "Lock Item"}
                                        >
                                            {item.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                                        </button>

                                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {/* (Modal code remains identical to previous version) */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b flex justify-between items-center bg-[#073159] text-white shrink-0">
                      <h3 className="font-bold">{editingItem ? "Edit Drug" : "Add New Drug"}</h3>
                      <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                      {/* Name */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Drug Name *</label>
                        <input name="name" defaultValue={editingItem ? editingItem.name ?? "" : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required />
                      </div>
                      {/* Manufacturer */}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Manufacturer</label>
                        <input name="manufacturer" defaultValue={editingItem ? editingItem.manufacturer ?? "" : ""} placeholder="e.g. Pfizer, Tobinco" className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold text-gray-500 uppercase">Stock *</label><input name="stock" type="number" defaultValue={editingItem ? editingItem.current_stock ?? "" : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required /></div>
                          <div><label className="text-xs font-bold text-gray-500 uppercase">Min Alert *</label><input name="minLevel" type="number" defaultValue={editingItem ? editingItem.minimum_stock ?? "" : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required /></div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Unit *</label>
                          <select name="unit" defaultValue={editingItem ? editingItem.unit_of_measure ?? "TAB" : "TAB"} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]">
                              <option value="TAB">Tablet</option><option value="CAP">Capsule</option><option value="BTL">Bottle</option><option value="SYR">Syrup</option><option value="AMP">Ampoule</option><option value="CRM">Cream</option>
                          </select>
                      </div>
                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Mfg Date</label>
                            <input name="mfgDate" type="date" defaultValue={editingItem ? (editingItem.manufacturing_date ? editingItem.manufacturing_date.substring(0,10) : "") : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                            <input name="expiry" type="date" defaultValue={editingItem ? (editingItem.expiry_date ? editingItem.expiry_date.substring(0,10) : "") : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" />
                          </div>
                      </div>
                      {/* Prices */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Cost Price (₵)</label>
                            <input name="costPrice" type="number" step="0.01" defaultValue={editingItem ? (editingItem.unit_cost !== undefined && editingItem.unit_cost !== null ? editingItem.unit_cost : "") : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Selling Price (₵) *</label>
                            <input name="sellingPrice" type="number" step="0.01" defaultValue={editingItem ? (editingItem.selling_price !== undefined && editingItem.selling_price !== null ? editingItem.selling_price : "") : ""} className="w-full p-2 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required />
                          </div>
                      </div>
                      <button type="submit" disabled={saving} className="w-full py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex justify-center items-center gap-2 mt-4">{saving && <Loader2 className="animate-spin" size={18}/>} Save Drug</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

// Reuse Helper Components
function StatCard({ title, value, icon, color }: any) {
    return <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-start shadow-sm"><div><p className="text-xs font-bold text-gray-500 uppercase mb-1">{title}</p><h3 className="text-2xl font-bold text-[#073159]">{value}</h3></div><div className={`p-3 rounded-xl ${color}`}>{icon}</div></div>;
}
function StatusBadge({ status }: any) {
    // Show 'Expired' if status.text is 'EXPIRED'
    let displayText = status.text;
    if (status.text === 'EXPIRED') displayText = 'Expired';
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{displayText}</span>;
}