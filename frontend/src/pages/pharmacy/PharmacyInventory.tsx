import { useState, useMemo, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { 
  Search, 
  Package, 
  Filter, 
  Download, 
  DollarSign, 
  TrendingDown, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  Database,
  RefreshCw,
  Pill,
  ListPlus,
  AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  fetchPharmacyItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getStockStatusInfo,
  formatCurrency,
  formatDate,
  calculateTotalInventoryValue
} from "../../services/api";

export default function PharmacyInventory() {
  const location = useLocation();
  
  // Get Global Search Context
  const { globalSearch, setGlobalSearch } = useOutletContext<{ 
      globalSearch: string; 
      setGlobalSearch: (s: string) => void 
  }>();

  const [localSearch, setLocalSearch] = useState(globalSearch);
  const [filter, setFilter] = useState("All");
  
  // API State
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    inventory: true,
    save: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Dynamic Categories State
  const [categories, setCategories] = useState(["Antibiotic", "Analgesic", "Supplement", "Antimalarial", "Antihypertensive"]);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Highlighting Logic
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // Sync Global Search to Local State
  useEffect(() => {
    setLocalSearch(globalSearch);
  }, [globalSearch]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle Highlighting from Alerts Page
  useEffect(() => {
    if (location.state?.highlight) {
      const itemToHighlight = inventory.find(i => 
        i.name?.toLowerCase().includes(location.state.highlight.toLowerCase())
      );

      if (itemToHighlight) {
        setHighlightedId(itemToHighlight.id);
        // Auto-clear highlight after 3 seconds
        setTimeout(() => setHighlightedId(null), 3000);
      }
    }
  }, [location.state, inventory]);

  // Load all required data
  const loadData = async () => {
    try {
      setError(null);
      setLoading(prev => ({ ...prev, inventory: true }));

      // Load pharmacy inventory
      const pharmacyData = await fetchPharmacyItems();
      setInventory(pharmacyData || []);

    } catch (error: any) {
      console.error("Error loading pharmacy inventory:", error);
      setError("Failed to load pharmacy inventory. Please try again.");
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(prev => ({ ...prev, inventory: true }));
    loadData();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setGlobalSearch(val);
  };

  // Calculate statistics from current data
  const calculatedStats = useMemo(() => {
    if (!inventory.length) return { lowStock: 0, expiringSoon: 0, totalValue: 0 };
    
    const lowStock = inventory.filter(item => {
      const status = getStockStatusInfo(item);
      return status.text === 'Low Stock' || status.text === 'Out of Stock';
    }).length;
    
    const expiringSoon = inventory.filter(item => {
      const status = getStockStatusInfo(item);
      return status.text === 'Expiring Soon';
    }).length;
    
    const totalValue = calculateTotalInventoryValue(inventory);
    
    return { lowStock, expiringSoon, totalValue };
  }, [inventory]);

  // Filter Logic
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    
    return inventory.filter((item: any) => {
      const matchesSearch = item.name?.toLowerCase().includes(localSearch.toLowerCase()) || 
                           item.item_id?.toLowerCase().includes(localSearch.toLowerCase());
      
      const statusInfo = getStockStatusInfo(item);
      
      if (filter === "Low") {
        return (statusInfo.text === 'Low Stock' || statusInfo.text === 'Out of Stock') && matchesSearch;
      }
      if (filter === "Expiring") {
        return statusInfo.text === 'Expiring Soon' && matchesSearch;
      }
      return matchesSearch;
    });
  }, [inventory, localSearch, filter]);

  // Handlers
  const handleAddNew = () => {
    setEditingItem({ category: categories[0] });
    setNewCategoryMode(false);
    setNewCategoryName("");
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setNewCategoryMode(false);
    setNewCategoryName("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item? This cannot be undone.")) {
      return;
    }

    try {
      await deleteInventoryItem(id);
      
      // Update local state
      setInventory(prev => prev.filter(i => i.id !== id));
      
      toast.success("Item deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Handle New Category Creation
      let finalCategory = formData.get("category") as string;
      if (newCategoryMode && newCategoryName.trim() !== "") {
        finalCategory = newCategoryName;
        if (!categories.includes(finalCategory)) {
          setCategories([...categories, finalCategory]);
        }
      }

      // Item data for the backend
      const itemData: any = {
        name: String(formData.get("name") || ""),
        department: "PHARMACY",
        current_stock: Number(formData.get("stock") || 0),
        minimum_stock: Number(formData.get("minLevel") || 10),
        unit_of_measure: String(formData.get("unit") || "PCS"),
        selling_price: Number(formData.get("price") || 0),
        expiry_date: formData.get("expiry") ? String(formData.get("expiry")) : undefined,
        batch_number: String(formData.get("batch") || ""),
        category: finalCategory,
        is_active: true
      };

      if (editingItem && editingItem.id) {
        // Update existing item
        const updatedItem = await updateInventoryItem(editingItem.id, itemData);
        
        // Update local state
        setInventory(prev => prev.map(i => i.id === editingItem.id ? updatedItem : i));
        
        toast.success("Stock updated successfully");
      } else {
        // Create new item
        const newItem = await createInventoryItem(itemData);
        
        // Update local state
        setInventory(prev => [...prev, newItem]);
        
        toast.success("New drug added to inventory");
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      setNewCategoryMode(false);
      setNewCategoryName("");
    } catch (error: any) {
      console.error("Error saving item:", error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to save item";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // CSV Export Handler
  const handleExport = () => {
    if (filteredInventory.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Item ID", "Name", "Category", "Batch", "Stock", "Min Stock", "Unit", "Price", "Expiry Date", "Status"];

    const csvRows = filteredInventory.map((item: any) => {
      const statusInfo = getStockStatusInfo(item);
      
      return [
        `"${item.item_id || ''}"`,
        `"${item.name || ''}"`,
        `"${item.category || ''}"`,
        `"${item.batch_number || ''}"`,
        item.current_stock || 0,
        item.minimum_stock || 0,
        item.unit_of_measure || 'PCS',
        item.selling_price || 0,
        item.expiry_date || 'N/A',
        statusInfo.text,
      ];
    });

    const csvString = [
      headers.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pharmacy_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Pharmacy inventory exported as CSV!");
  };

  // Loading skeleton for table
  const renderLoadingSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2 mt-2"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-end gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Pharmacy Inventory
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage drug stocks, prices, and expiry alerts.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loading.inventory}
            className="bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={loading.inventory ? "animate-spin" : ""} />
            Refresh
          </button>
          <button 
            onClick={handleAddNew}
            className="bg-[#073159] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-[#062a4d] transition-transform active:scale-95 text-sm"
          >
            <Plus size={18} /> Add New Stock
          </button>
          <button 
            onClick={handleExport}
            disabled={filteredInventory.length === 0}
            className="bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

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
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Products" 
          value={loading.inventory ? <Loader2 className="animate-spin h-6 w-6" /> : inventory.length.toString()}
          icon={<Pill size={20} />} 
          color="bg-blue-50 text-blue-600"
          loading={loading.inventory}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={loading.inventory ? <Loader2 className="animate-spin h-6 w-6" /> : calculatedStats.lowStock.toString()}
          icon={<TrendingDown size={20} />} 
          color="bg-red-50 text-red-600"
          loading={loading.inventory}
        />
        <StatCard 
          title="Expiring Soon" 
          value={loading.inventory ? <Loader2 className="animate-spin h-6 w-6" /> : calculatedStats.expiringSoon.toString()}
          icon={<Calendar size={20} />} 
          color="bg-orange-50 text-orange-600"
          loading={loading.inventory}
        />
        <StatCard 
          title="Total Value" 
          value={loading.inventory ? <Loader2 className="animate-spin h-6 w-6" /> : formatCurrency(calculatedStats.totalValue)}
          icon={<DollarSign size={20} />} 
          color="bg-green-50 text-green-600"
          loading={loading.inventory}
        />
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search drug name..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm disabled:opacity-50"
              value={localSearch}
              onChange={handleSearchChange}
              disabled={loading.inventory}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter size={18} className="text-gray-400 hidden md:block flex-shrink-0" />
            {['All', 'Low', 'Expiring'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                disabled={loading.inventory}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50 ${
                  filter === f ? "bg-[#073159] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === 'All' ? 'All' : f === 'Low' ? 'Low Stock' : 'Expiring'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Drug Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading.inventory ? (
                renderLoadingSkeleton()
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item: any) => {
                  const statusInfo = getStockStatusInfo(item);
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
                        <div className="font-bold text-[#073159]">{item.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.item_id && `ID: ${item.item_id}`}
                          {item.batch_number && ` | Batch: ${item.batch_number}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.category || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="font-bold w-8">{item.current_stock || 0}</span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                statusInfo.text === 'Out of Stock' ? "bg-gray-200" :
                                statusInfo.text === 'Low Stock' ? "bg-red-500" : 
                                "bg-green-500"
                              }`} 
                              style={{ width: `${Math.min(((item.current_stock || 0) / 500) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: {item.minimum_stock || 0} ({item.unit_of_measure || 'PCS'})
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">
                          {formatCurrency(item.selling_price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {formatDate(item.expiry_date || 'N/A')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge statusInfo={statusInfo} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Stock"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
                  <td colSpan={7} className="px-6 py-12">
                    <div className="text-center text-gray-400">
                      <Database size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No pharmacy items found</p>
                      <p className="text-sm mb-4">
                        {localSearch 
                          ? `No items match "${localSearch}"` 
                          : "No pharmacy items available. Add your first drug!"}
                      </p>
                      <button 
                        onClick={handleAddNew}
                        className="bg-[#073159] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#062a4d] transition-colors inline-flex items-center gap-2"
                      >
                        <Plus size={16} /> Add First Drug
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white">
              <h3 className="font-bold flex items-center gap-2">
                {editingItem?.id ? <Edit size={18} /> : <Plus size={18} />}
                {editingItem?.id ? "Update Stock" : "Add Drug"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="p-1 hover:bg-white/20 rounded-full disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Drug Name *</label>
                <input 
                  name="name" 
                  type="text" 
                  defaultValue={editingItem?.name}
                  className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159] transition-all"
                  required 
                  disabled={saving}
                />
              </div>

              {/* Dynamic Category Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <button 
                      type="button"
                      onClick={() => setNewCategoryMode(!newCategoryMode)}
                      disabled={saving}
                      className="text-[10px] text-[#073159] font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {newCategoryMode ? "Select Existing" : <><ListPlus size={10}/> Create New</>}
                    </button>
                  </div>
                  
                  {newCategoryMode ? (
                    <input 
                      type="text"
                      placeholder="Enter new category..."
                      className="w-full p-2.5 border rounded-xl bg-white focus:border-[#073159] outline-none animate-in fade-in disabled:opacity-50"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                      disabled={saving}
                    />
                  ) : (
                    <select 
                      name="category"
                      className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
                      defaultValue={editingItem?.category || categories[0]}
                      disabled={saving}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Batch Number</label>
                  <input 
                    name="batch" 
                    type="text" 
                    defaultValue={editingItem?.batch_number}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
                    placeholder="e.g. BTC-001"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Current Stock</label>
                  <input 
                    name="stock" 
                    type="number" 
                    defaultValue={editingItem?.current_stock || 0}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none font-bold text-gray-800 disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase text-red-500">Low Alert Level</label>
                  <input 
                    name="minLevel" 
                    type="number" 
                    min="0"
                    defaultValue={editingItem?.minimum_stock || 20}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Price (₵)</label>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01"
                    min="0"
                    defaultValue={editingItem?.selling_price || 0}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Unit Type</label>
                  <select 
                    name="unit" 
                    defaultValue={editingItem?.unit_of_measure || "PCS"}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
                    disabled={saving}
                  >
                    <option value="PCS">Pieces</option>
                    <option value="BOX">Boxes</option>
                    <option value="BTL">Bottles</option>
                    <option value="KIT">Kits</option>
                    <option value="TAB">Tablets</option>
                    <option value="CAP">Capsules</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                  <input 
                    name="expiry" 
                    type="date" 
                    defaultValue={editingItem?.expiry_date}
                    className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white outline-none disabled:opacity-50"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Record
                    </>
                  )}
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
function StatCard({ title, value, icon, color, loading }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md cursor-pointer hover:-translate-y-1">
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase mb-1">{title}</p>
        <h3 className={`text-2xl font-bold text-[#073159] ${loading ? 'flex items-center' : ''}`}>
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ statusInfo }: { statusInfo: any }) {
  const { text, color } = statusInfo;
  
  let icon;
  if (text === 'Out of Stock') icon = <X size={10} />;
  else if (text === 'Low Stock') icon = <TrendingDown size={10} />;
  else if (text === 'Expiring Soon') icon = <AlertTriangle size={10} />;
  else if (text === 'Expired') icon = '⏰';
  else icon = '✅';
  
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${color}`}>
      {icon} {text}
    </span>
  );
}