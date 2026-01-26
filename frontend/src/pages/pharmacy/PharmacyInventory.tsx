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
  Loader2,
  AlertCircle,
  Database,
  RefreshCw,
  Pill,
  AlertTriangle,
  X,
  CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  fetchPharmacyItems, 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        setTimeout(() => setHighlightedId(null), 3000);
      }
    }
  }, [location.state, inventory]);

  // Load data
  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const pharmacyData = await fetchPharmacyItems();
      setInventory(pharmacyData || []);
    } catch (error: any) {
      console.error("Error loading pharmacy inventory:", error);
      setError("Failed to load inventory data.");
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadData();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    setGlobalSearch(val);
  };

  // Calculate statistics
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
    link.setAttribute("download", `pharmacy_inventory_view_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Inventory exported");
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div></td>
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
            View current stock levels and expiry dates.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button 
            onClick={handleExport}
            disabled={filteredInventory.length === 0}
            className="bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export List
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
          value={loading ? <Loader2 className="animate-spin h-6 w-6" /> : inventory.length.toString()}
          icon={<Pill size={20} />} 
          color="bg-blue-50 text-blue-600"
          loading={loading}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={loading ? <Loader2 className="animate-spin h-6 w-6" /> : calculatedStats.lowStock.toString()}
          icon={<TrendingDown size={20} />} 
          color="bg-red-50 text-red-600"
          loading={loading}
        />
        <StatCard 
          title="Expiring Soon" 
          value={loading ? <Loader2 className="animate-spin h-6 w-6" /> : calculatedStats.expiringSoon.toString()}
          icon={<Calendar size={20} />} 
          color="bg-orange-50 text-orange-600"
          loading={loading}
        />
        <StatCard 
          title="Total Value" 
          value={loading ? <Loader2 className="animate-spin h-6 w-6" /> : formatCurrency(calculatedStats.totalValue)}
          icon={<DollarSign size={20} />} 
          color="bg-green-50 text-green-600"
          loading={loading}
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
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter size={18} className="text-gray-400 hidden md:block flex-shrink-0" />
            {['All', 'Low', 'Expiring'].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                disabled={loading}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                renderLoadingSkeleton()
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item: any) => {
                  const statusInfo = getStockStatusInfo(item);
                  const isHighlighted = item.id === highlightedId;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-all duration-500 ${
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
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="text-center text-gray-400">
                      <Database size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No pharmacy items found</p>
                      <p className="text-sm">
                        {localSearch 
                          ? `No items match "${localSearch}"` 
                          : "Inventory is empty."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Helper Components
function StatCard({ title, value, icon, color, loading }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md">
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
  else icon = <CheckCircle size={10} />;
  
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${color}`}>
      {icon} {text}
    </span>
  );
}