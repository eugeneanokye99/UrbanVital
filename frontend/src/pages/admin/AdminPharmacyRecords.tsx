import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  Eye,
  Clock,
  X,
  //   Download,
  Pill,
  CreditCard,
  User,
  ShoppingBag,
  UserCheck, // Icon for Registered
  UserPlus // Icon for Walk-In
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchPharmacySalesHistory } from "../../services/api";



export default function AdminPharmacyRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewingSale, setViewingSale] = useState<any>(null);

  useEffect(() => {
    loadPharmacySales();
  }, []);

  const loadPharmacySales = async () => {
    setLoading(true);
    try {
      const data = await fetchPharmacySalesHistory();
      // Transform backend data to match UI format
      const transformedData = (data || []).map((sale: any) => ({
        id: sale.id,
        patient: sale.patient,
        patientType: sale.is_walkin ? "Walk-In" : "Registered",
        doctor: sale.pharmacist || "-",
        pharmacist: sale.pharmacist || "-", // Add explicit pharmacist field
        date: `${sale.date} ${sale.time}`,
        items: sale.items.split(',').length,
        total: sale.amount,
        payment: sale.method,
        status: sale.status || "Dispensed",
        drugs: sale.items_detail || sale.items.split(',').map((item: string) => ({
          name: item.trim(),
          qty: 1,
          price: 0
        }))
      }));
      setRecords(transformedData);
    } catch (error) {
      console.error('Error loading pharmacy sales:', error);
      toast.error('Failed to load pharmacy sales');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchSearch =
        record.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "All" ? true : record.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [records, searchQuery, statusFilter]);

  //   const handlePrintReceipt = () => {
  //     toast.success("Downloading Receipt...");
  //   };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dispensed": return "bg-green-100 text-green-700 border-green-200";
      case "Pending": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Partial": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentColor = (mode: string) => {
    return mode === "Insurance" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Pill className="w-8 h-8" /> Pharmacy Sales Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">Audit trail of all dispensed medications and sales.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search patient, doctor or ID..."
              className="pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:border-[#073159] outline-none w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 border rounded-xl bg-white outline-none focus:border-[#073159] font-medium text-gray-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Dispensed">Dispensed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Patient / Type</th>
                <th className="px-6 py-4">Items / Cost</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading pharmacy records...</td></tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[#073159] font-bold">{record.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{record.patient}</div>

                      {/* --- Patient Type Badge --- */}
                      <div className="flex items-center gap-1 mt-1">
                        {record.patientType === "Registered" ? (
                          <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                            <UserCheck size={10} /> Registered
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold border border-orange-100">
                            <UserPlus size={10} /> Walk-In
                          </span>
                        )}
                        {record.doctor !== "-" && <span className="text-xs text-gray-400 ml-1">• Dr: {record.doctor}</span>}
                      </div>

                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">₵{record.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{record.items} items</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getPaymentColor(record.payment)}`}>
                        {record.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {record.date.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1 text-gray-400">
                        <Clock size={12} /> {record.date.split(' ')[1]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewingSale(record)}
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag size={32} className="opacity-20" />
                      <p>No sales records found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW SALE MODAL --- */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-[#073159]">Sale Details</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(viewingSale.status)}`}>
                    {viewingSale.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Transaction ID: <span className="font-mono text-gray-700">{viewingSale.id}</span></p>
              </div>
              <button onClick={() => setViewingSale(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Patient</span>
                  <p className="font-bold text-gray-800 flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> {viewingSale.patient}
                  </p>
                  {/* Modal Badge */}
                  <div className="mt-1 inline-block">
                    {viewingSale.patientType === "Registered" ? (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Registered</span>
                    ) : (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">Walk-In</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Pharmacist</span>
                  <p className="font-bold text-gray-800">{viewingSale.pharmacist}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Payment Method</span>
                  <p className="font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard size={14} className="text-green-500" /> {viewingSale.payment}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Date</span>
                  <p className="font-bold text-gray-800">{viewingSale.date}</p>
                </div>
              </div>

              {/* Drugs List */}
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-2 flex justify-between">
                <span>Item Description</span>
                <span>Subtotal</span>
              </h4>
              <div className="space-y-3 mb-6">
                {viewingSale.drugs.map((drug: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800">{drug.name}</p>
                      <p className="text-xs text-gray-500">Qty: {drug.qty} x ₵{drug.price.toFixed(2)}</p>
                    </div>
                    <span className="font-mono font-bold text-gray-700">
                      ₵{(drug.qty * drug.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="flex justify-end border-t border-gray-100 pt-4">
                <div className="text-right">
                  <span className="text-sm text-gray-500 mr-4">Total Amount:</span>
                  <span className="text-2xl font-bold text-[#073159]">₵{viewingSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setViewingSale(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors"
              >
                Close
              </button>


              {/* <button 
                    onClick={handlePrintReceipt}
                    className="px-5 py-2.5 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] shadow-lg flex items-center gap-2"
                >
                    <Download size={18} /> Print Receipt
                </button> */}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}