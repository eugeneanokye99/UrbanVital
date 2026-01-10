import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Search,
  Wallet,
  FileText,
  Calculator,
  X,
  Loader2,
  CreditCard,
  Smartphone,
  Shield,
  Plus,
  History,
} from "lucide-react";
import {
  fetchPendingInvoices,
  processPayment,
  fetchServiceItems,
  addInvoiceItem,
  createInvoice,
  fetchPatients
} from "../../services/api";

export default function StaffBilling() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState("");

  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);

  // Patient Search State (for adding new charges)
  const [patientSearch, setPatientSearch] = useState("");
  const [foundPatients, setFoundPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [submittingCharge, setSubmittingCharge] = useState(false);

  // Quick Charge Form State
  const [quickCharge, setQuickCharge] = useState({
    serviceId: "",
    amount: "",
    description: "",
    quantity: 1,
    notes: ""
  });

  // Fetch initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoadingInvoices(true);
    try {
      const [invoicesData, servicesData] = await Promise.all([
        fetchPendingInvoices(),
        fetchServiceItems()
      ]);
      setInvoices(invoicesData || []);
      setServiceItems(servicesData.results || servicesData || []);
    } catch (error) {
      console.error("Error refreshing billing data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Search patients as user types
  useEffect(() => {
    if (patientSearch.length < 2) {
      setFoundPatients([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await fetchPatients({ search: patientSearch });
        setFoundPatients(data.results || data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleAddQuickCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (!quickCharge.serviceId && !quickCharge.description) {
      toast.error("Please select a service or enter a description");
      return;
    }

    setSubmittingCharge(true);
    try {
      // 1. Find or Create Invoice
      let invoice = invoices.find(inv =>
        (inv.patient?.id === selectedPatient.id || inv.patient_id === selectedPatient.id) &&
        (inv.status === 'Pending' || inv.status === 'Partially Paid')
      );

      if (!invoice) {
        invoice = await createInvoice({
          patient: selectedPatient.id,
          status: 'Pending',
          notes: `Invoice created at front desk`
        });
      }

      // 2. Add Item
      const service = serviceItems.find(s => s.id.toString() === quickCharge.serviceId);

      await addInvoiceItem(invoice.id, {
        service_item: quickCharge.serviceId ? parseInt(quickCharge.serviceId) : null,
        description: quickCharge.description || service?.name || "Service Item",
        quantity: quickCharge.quantity,
        unit_price: parseFloat(quickCharge.amount) || service?.price || 0,
        notes: quickCharge.notes
      });

      toast.success("Charge added successfully");

      // 3. Reset and Refresh
      resetQuickCharge();
      setShowAddChargeModal(false);
      refreshData();

      // Auto-select the invoice we just added to
      const updatedInvoices = await fetchPendingInvoices();
      const match = updatedInvoices.find((inv: any) => inv.id === invoice.id);
      if (match) setSelectedInvoice(match);

    } catch (error: any) {
      console.error("Error adding charge:", error);
      toast.error(error.response?.data?.error || "Failed to add charge");
    } finally {
      setSubmittingCharge(false);
    }
  };

  const resetQuickCharge = () => {
    setQuickCharge({
      serviceId: "",
      amount: "",
      description: "",
      quantity: 1,
      notes: ""
    });
    setSelectedPatient(null);
    setPatientSearch("");
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;

    if (paymentMethod === "Cash" && parseFloat(amountTendered || "0") < parseFloat(selectedInvoice.balance || selectedInvoice.total_amount || 0)) {
      toast.error("Amount tendered is less than balance due!");
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        amount: paymentMethod === "Cash" ? parseFloat(amountTendered) : parseFloat(selectedInvoice.balance || selectedInvoice.total_amount),
        payment_method: paymentMethod === "MoMo" ? "Mobile Money" : paymentMethod,
        reference: `Payment for INV#${selectedInvoice.invoice_number}`,
      };

      await processPayment(selectedInvoice.id, paymentData);
      toast.success(`Payment of ₵${paymentData.amount} processed successfully!`);

      // Refresh
      refreshData();
      setAmountTendered("");

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      (inv.patient_name || inv.patient?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.patient_mrn || inv.patient?.mrn || "").toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  const changeDue = selectedInvoice && amountTendered
    ? parseFloat(amountTendered) - parseFloat(selectedInvoice.balance || selectedInvoice.total_amount || 0)
    : 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 px-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Billing & Payments
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Accept payments, bill services, and manage patient balances.
          </p>
        </div>
        <button
          onClick={() => setShowAddChargeModal(true)}
          className="px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-all shadow-md flex items-center gap-2 text-sm font-bold"
        >
          <Plus size={18} /> Add New Charge
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

        {/* LEFT: INVOICE QUEUE */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[350px] lg:h-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search patient or invoice..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none text-sm transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingInvoices ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span className="text-sm">Loading queue...</span>
              </div>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group border-l-4 ${selectedInvoice?.id === inv.id
                      ? "bg-blue-50 border-l-[#073159]"
                      : "border-l-transparent"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">
                        {inv.patient_name || inv.patient?.name || "Walk-in Patient"}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        #{inv.invoice_number} • {inv.patient_mrn || "No MRN"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {formatDate(inv.invoice_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#073159]">
                        ₵{parseFloat(inv.balance || inv.total_amount).toFixed(2)}
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          inv.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                <History size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No pending invoices</p>
                <button
                  onClick={() => setShowAddChargeModal(true)}
                  className="text-[#073159] text-xs font-bold mt-2 hover:underline"
                >
                  Create New Charge
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PAYMENT TERMINAL */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[500px] overflow-hidden">
          {selectedInvoice ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Payment Header */}
              <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Payment Terminal</h2>
                  <p className="text-xs text-gray-500">
                    Patient: <span className="font-bold text-gray-700">{selectedInvoice.patient_name || selectedInvoice.patient?.name}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Balance Due</p>
                  <p className="text-2xl font-black text-[#073159]">
                    ₵{parseFloat(selectedInvoice.balance || selectedInvoice.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                {/* Items Breakdown */}
                <div className="flex-1 p-5 overflow-y-auto border-r border-gray-100 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      Invoice Breakdown
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedInvoice.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">{item.description || item.service_item_name}</p>
                          <p className="text-[10px] text-gray-400">
                            {item.quantity} × ₵{parseFloat(item.unit_price).toFixed(2)}
                            {parseFloat(item.discount) > 0 && ` • Discount: ₵${item.discount}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">₵{parseFloat(item.total_price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}

                    {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                      <div className="text-center py-12 text-gray-300">
                        <FileText size={40} className="mx-auto mb-2 opacity-10" />
                        <p className="text-xs">No items currently on this invoice</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold">₵{parseFloat(selectedInvoice.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="font-medium">Amount Paid</span>
                      <span className="font-bold">₵{parseFloat(selectedInvoice.amount_paid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-800">Grand Total Due</span>
                      <span className="font-black text-red-600">₵{parseFloat(selectedInvoice.balance).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Method Selector */}
                <div className="w-full xl:w-[350px] p-5 bg-gray-50/50 flex flex-col gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose Method</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Cash', icon: CreditCard, label: 'Cash' },
                        { id: 'MoMo', icon: Smartphone, label: 'MoMo' },
                        { id: 'Insurance', icon: Shield, label: 'Insurance' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === m.id
                              ? "bg-[#073159] border-[#073159] text-white shadow-lg"
                              : "bg-white border-transparent text-gray-500 hover:border-gray-200"
                            }`}
                        >
                          <m.icon size={18} />
                          <span className="text-[10px] font-bold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'Cash' ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Amount Received</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-3 text-gray-400 font-bold">₵</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#073159] outline-none font-bold text-xl transition-all"
                            value={amountTendered}
                            onChange={(e) => setAmountTendered(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-[#073159] rounded-2xl text-white flex justify-between items-center shadow-lg shadow-blue-900/20">
                        <div>
                          <p className="text-[10px] font-bold text-blue-300 uppercase">Change Due</p>
                          <p className="text-xl font-black">₵{Math.max(0, changeDue).toFixed(2)}</p>
                        </div>
                        <Calculator className="opacity-20" size={32} />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center py-10">
                      <p className="text-sm text-gray-400 italic">Enter reference in the terminal for {paymentMethod} transactions.</p>
                    </div>
                  )}

                  <button
                    onClick={handleProcessPayment}
                    disabled={loading || (paymentMethod === 'Cash' && changeDue < 0) || parseFloat(selectedInvoice.balance) <= 0}
                    className="w-full py-4 bg-[#073159] text-white rounded-2xl font-bold shadow-xl hover:bg-[#062a4d] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> Process Payment</>}
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full py-2 text-gray-400 text-xs font-medium hover:text-gray-600 flex items-center justify-center gap-1"
                  >
                    <FileText size={14} /> Print Receipt
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Wallet className="text-gray-300" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-700">Payment Center</h3>
              <p className="max-w-xs text-sm text-gray-500 mt-2">
                Select an invoice from the queue on the left to process a payment, view breakdown, or print receipts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ADD NEW CHARGE MODAL (Like Clinician Side) */}
      {showAddChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-[#073159] text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Add New Charge</h3>
                <p className="text-sm text-blue-200">Bill any patient for services/items</p>
              </div>
              <button onClick={() => { setShowAddChargeModal(false); resetQuickCharge(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddQuickCharge} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Search */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">1. Find Patient</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Name, MRN, or Phone..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#073159] focus:bg-white outline-none transition-all text-sm font-medium"
                      value={selectedPatient ? (selectedPatient.name || `${selectedPatient.first_name} ${selectedPatient.last_name}`) : patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        if (selectedPatient) setSelectedPatient(null);
                      }}
                    />
                    {foundPatients.length > 0 && !selectedPatient && (
                      <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-48 overflow-y-auto overflow-x-hidden">
                        {foundPatients.map(p => (
                          <div
                            key={p.id}
                            onClick={() => { setSelectedPatient(p); setFoundPatients([]); }}
                            className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 flex justify-between items-center group"
                          >
                            <div>
                              <p className="font-bold text-sm text-gray-800">{p.name || `${p.first_name} ${p.last_name}`}</p>
                              <p className="text-[11px] text-gray-500">{p.mrn} • {p.phone}</p>
                            </div>
                            <Plus size={16} className="text-gray-300 group-hover:text-[#073159]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">2. Select Service</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#073159] focus:bg-white outline-none transition-all text-sm font-medium cursor-pointer appearance-none"
                    value={quickCharge.serviceId}
                    onChange={(e) => {
                      const s = serviceItems.find(sv => sv.id.toString() === e.target.value);
                      setQuickCharge({
                        ...quickCharge,
                        serviceId: e.target.value,
                        amount: s ? s.price : quickCharge.amount,
                        description: s ? s.name : quickCharge.description
                      });
                    }}
                  >
                    <option value="">Choose a service catalog item...</option>
                    {serviceItems.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₵{s.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description / Notes</label>
                  <input
                    type="text"
                    placeholder="Specific item description or details..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#073159] focus:bg-white outline-none transition-all text-sm"
                    value={quickCharge.description}
                    onChange={(e) => setQuickCharge({ ...quickCharge, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Charge Amount (GHS)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#073159] focus:bg-white outline-none transition-all text-sm font-bold text-[#073159]"
                    value={quickCharge.amount}
                    onChange={(e) => setQuickCharge({ ...quickCharge, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => { setShowAddChargeModal(false); resetQuickCharge(); }}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submittingCharge || !selectedPatient || (!quickCharge.serviceId && !quickCharge.description)}
                  className="flex-[2] py-4 bg-[#073159] text-white rounded-2xl font-black shadow-xl hover:bg-[#062a4d] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                >
                  {submittingCharge ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Add to Patient Invoice</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}