import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Search, 
  FlaskConical, 
  AlertTriangle, 
  MinusCircle, 
  Package,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  fetchLabItems, 
  partialUpdateInventoryItem 
} from "../../services/api";

export default function LabInventory() {
  // Get global search from Layout
  const { globalSearch, setGlobalSearch } = useOutletContext<{ 
      globalSearch: string; 
      setGlobalSearch: (s: string) => void 
  }>();

  // Local search state (synced with global)
  const [localSearch, setLocalSearch] = useState(globalSearch);

  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [usageAmount, setUsageAmount] = useState<number>(1);

  // API State
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Lab Inventory from backend
  useEffect(() => {
    loadLabInventory();
  }, []);

  const loadLabInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchLabItems();
      setInventory(data || []);
    } catch (err: any) {
      console.error("Error loading lab inventory:", err);
      setError("Failed to load lab inventory");
      toast.error("Failed to load lab inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // Sync Local Input with Global Search Context
  useEffect(() => {
      setLocalSearch(globalSearch);
  }, [globalSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      setGlobalSearch(val); // Update navbar search too
  };

  // Filter Inventory based on search
  const filteredInventory = useMemo(() => {
      return inventory.filter(item => 
          item.name.toLowerCase().includes(localSearch.toLowerCase())
      );
  }, [inventory, localSearch]);

  // Calculate stock status
  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) return "Out of Stock";
    if (item.current_stock <= item.minimum_stock) return "Low Stock";
    return "Good";
  };

  const getStatusColor = (status: string) => {
    if (status === "Out of Stock") return "text-red-600 bg-red-50";
    if (status === "Low Stock") return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };

  const handleOpenDeduct = (item: any) => {
    setSelectedItem(item);
    setUsageAmount(1);
    setIsDeductModalOpen(true);
  };

  const handleDeductStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (usageAmount > selectedItem.current_stock) {
        toast.error("Cannot deduct more than available stock!");
        return;
    }

    try {
      // Update stock via API
      const newStock = selectedItem.current_stock - usageAmount;
      await partialUpdateInventoryItem(selectedItem.id, {
        current_stock: newStock
      });

      // Update local state
      setInventory(prev => prev.map(item => {
          if (item.id === selectedItem.id) {
              return { ...item, current_stock: newStock };
          }
          return item;
      }));

      toast.success("Stock Usage Logged");
      setIsDeductModalOpen(false);
    } catch (err) {
      console.error("Error updating stock:", err);
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <FlaskConical className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Lab Inventory
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Monitor reagents & consumables. (Read Only / Deduct)
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-[#073159] animate-spin" />
          <p className="text-gray-500">Loading lab inventory...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Inventory</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24}/></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {inventory.filter(i => getStockStatus(i) === "Low Stock").length}
              </h3>
              <p className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24}/></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{inventory.length}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase">Total Items</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Item ID</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#073159]">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">{item.item_id}</td>
                        <td className="px-6 py-4 font-medium">
                          {item.current_stock} <span className="text-xs text-gray-400">{item.unit_of_measure}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-600">{item.expiry_date || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                              onClick={() => handleOpenDeduct(item)}
                              className="bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Log Usage"
                              disabled={item.current_stock === 0}
                          >
                              <MinusCircle size={14} /> Deduct
                          </button>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                  <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                          No items found matching "{localSearch}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Deduct Stock Modal */}
      {isDeductModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-orange-600 text-white">
                      <h3 className="font-bold flex items-center gap-2">
                         <MinusCircle size={18} /> Log Usage
                      </h3>
                      <button onClick={() => setIsDeductModalOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleDeductStock} className="p-6 space-y-6">
                      <div className="text-center">
                          <p className="text-gray-500 text-sm mb-1">Item:</p>
                          <p className="font-bold text-[#073159] text-lg leading-tight mb-2">{selectedItem.name}</p>
                          <p className="text-sm font-medium text-gray-400 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                            Current Stock: {selectedItem.current_stock} {selectedItem.unit_of_measure}
                          </p>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block text-center">Quantity Used</label>
                          <div className="flex justify-center">
                            <input 
                                type="number" 
                                min="1" 
                                max={selectedItem.current_stock}
                                value={usageAmount}
                                onChange={(e) => setUsageAmount(parseInt(e.target.value))}
                                className="w-24 p-3 text-center text-2xl font-bold border-2 border-orange-200 rounded-xl bg-orange-50 focus:bg-white focus:border-orange-500 outline-none transition-all" 
                                autoFocus
                            />
                          </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setIsDeductModalOpen(false)} 
                            className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg transition-transform active:scale-95"
                          >
                              Confirm
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}