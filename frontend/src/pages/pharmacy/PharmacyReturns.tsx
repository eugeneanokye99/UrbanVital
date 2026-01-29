import { useState, useMemo, useEffect } from "react";
import {
  RotateCcw,
  Search,
  Plus,
  Filter,
  Save,
  X, AlertTriangle,
  ArrowRightLeft,
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchInventoryAdjustments,
  createInventoryAdjustment,
  fetchPharmacyItems
} from "../../services/api";

export default function PharmacyReturns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  // Load data
  useEffect(() => {
    loadReturns();
    loadInventoryItems();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const data = await fetchInventoryAdjustments();
      setReturns(data || []);
    } catch (error) {
      console.error('Error loading returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const data = await fetchPharmacyItems();
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  // --- Filter Logic ---
  const filteredReturns = useMemo(() => {
    return returns.filter(item => {
      const matchesSearch = (item.inventory_item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.adjustment_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "All" ? true : item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, filterStatus]);

  // --- Handlers ---
  const handleLogReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.target as HTMLFormElement);

    try {
      const adjustmentData = {
        inventory_item: Number(formData.get("inventory_item")),
        batch_number: String(formData.get("batch")),
        quantity: Number(formData.get("qty")),
        adjustment_type: String(formData.get("type")),
        reason: String(formData.get("reason")),
      };

      await createInventoryAdjustment(adjustmentData);
      toast.success("Return logged successfully");
      setIsModalOpen(false);
      loadReturns(); // Reload data
    } catch (error) {
      console.error('Error creating adjustment:', error);
      toast.error("Failed to log return");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Pending": return "bg-orange-100 text-orange-700";
      case "Disposed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 text-[#073159]" />
            Returns & Adjustments
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Log damaged goods, expired stock, or customer returns.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#073159] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-[#062a4d] transition-all active:scale-95"
        >
          <Plus size={18} /> Log New Return
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Pending Approval</p>
            <h3 className="text-2xl font-extrabold text-orange-600">{returns.filter(r => r.status === 'Pending').length}</h3>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><AlertTriangle size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Damaged/Expired</p>
            <h3 className="text-2xl font-extrabold text-red-600">{returns.filter(r => r.adjustment_type === 'Damaged' || r.adjustment_type === 'Expired').length}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><X size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Customer Returns</p>
            <h3 className="text-2xl font-extrabold text-blue-600">{returns.filter(r => r.adjustment_type === 'Customer Return').length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ArrowRightLeft size={24} /></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search return ID or drug name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#073159] outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-gray-400 hidden sm:block" size={18} />
          <select
            className="w-full sm:w-auto p-2 border rounded-lg text-sm outline-none focus:border-[#073159]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Drug Details</th>
                <th className="px-6 py-4">Type & Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /> Loading...</td></tr>
              ) : filteredReturns.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No records found.</td></tr>
              ) : (
                filteredReturns.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[#073159] font-bold text-xs">{item.adjustment_id}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{item.inventory_item_name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} | Batch: {item.batch_number || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-medium text-gray-700">{item.adjustment_type}</span>
                      <span className="text-xs text-gray-500 italic">"{item.reason}"</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-[#073159] p-2 hover:bg-gray-100 rounded-lg">
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- LOG RETURN MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white">
              <h3 className="font-bold flex items-center gap-2">
                <RotateCcw size={18} /> Log Product Return
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleLogReturn} className="p-6 space-y-4">

              {/* Drug Selection */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Drug Name *</label>
                <select
                  name="inventory_item"
                  className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]"
                  required
                >
                  <option value="">Select item...</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Batch Number</label>
                  <input name="batch" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" placeholder="e.g. BTC-101" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Quantity</label>
                  <input name="qty" type="number" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" placeholder="0" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Return Type</label>
                <select name="type" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]">
                  <option value="Damaged">Damaged / Broken</option>
                  <option value="Expired">Expired Stock</option>
                  <option value="Customer Return">Customer Return (Restock)</option>
                  <option value="Error">Dispensing Error</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Reason / Notes</label>
                <textarea name="reason" rows={3} className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" placeholder="Describe why this is being returned..." required></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Submit Log</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}