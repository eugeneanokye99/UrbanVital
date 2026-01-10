import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  History,
  DollarSign,
  FileText,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  fetchServiceItems,
  fetchPatients,
  fetchPendingInvoices,
  addInvoiceItem,
  createInvoice
} from "../../services/api";
import toast from "react-hot-toast";

export default function ClinicianBilling() {
  const [services, setServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search state
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Form state
  const [form, setForm] = useState({
    serviceId: "",
    amount: "",
    notes: ""
  });

  const loadData = async () => {
    try {
      const [servicesData, invoicesData] = await Promise.all([
        fetchServiceItems(),
        fetchPendingInvoices()
      ]);
      setServices(servicesData.results || servicesData);
      setInvoices(invoicesData.results || invoicesData);
    } catch (error) {
      console.error("Failed to load billing data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatients([]);
      return;
    }
    const timer = setTimeout(async () => {
      const data = await fetchPatients({ search: patientSearch });
      setPatients(data.results || data);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (!form.serviceId) {
      toast.error("Please select a service");
      return;
    }

    setSubmitting(true);
    try {
      // Find or create invoice for this patient
      let invoice = invoices.find(inv => inv.patient?.id === selectedPatient.id);

      if (!invoice) {
        // Create new invoice if none pending
        invoice = await createInvoice({
          patient: selectedPatient.id,
          status: 'Pending'
        });
      }

      const service = services.find(s => s.id === parseInt(form.serviceId));

      await addInvoiceItem(invoice.id, {
        service_item: parseInt(form.serviceId),
        description: service?.name || "Service Charge",
        quantity: 1,
        unit_price: parseFloat(form.amount),
        notes: form.notes
      });

      toast.success("Billing item added successfully");
      setForm({ serviceId: "", amount: "", notes: "" });
      setSelectedPatient(null);
      setPatientSearch("");
      loadData();
    } catch (error) {
      console.error("Billing failed", error);
      toast.error("Failed to add billing item");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#073159] animate-spin" />
      </div>
    );
  }

  const totalBilledToday = invoices.reduce((acc, inv) => acc + (parseFloat(inv.total_amount) || 0), 0);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-xl md:text-2xl font-bold text-[#073159] mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6 md:w-7 md:h-7" /> Service Billing
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* --- LEFT: Add New Charge Form --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-6 text-[#073159]">
                <Plus className="w-5 h-5" />
                <h2 className="font-bold text-lg">Add Billable Item</h2>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient Name / MRN</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search patient..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all text-sm"
                      value={selectedPatient ? selectedPatient.name : patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        if (selectedPatient) setSelectedPatient(null);
                      }}
                    />
                    {patients.length > 0 && !selectedPatient && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {patients.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedPatient(p);
                              setPatients([]);
                            }}
                            className="w-full text-left p-3 hover:bg-blue-50 text-sm border-b border-gray-50"
                          >
                            {p.name || `${p.first_name} ${p.last_name}`} ({p.mrn})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Type</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none cursor-pointer text-sm"
                    value={form.serviceId}
                    onChange={(e) => {
                      const s = services.find(sv => sv.id === parseInt(e.target.value));
                      setForm({ ...form, serviceId: e.target.value, amount: s ? s.price : "" });
                    }}
                  >
                    <option value="">Select Service</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost (GHS)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-500 font-bold">₵</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all font-mono font-medium text-sm"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all text-sm"
                    placeholder="Additional details for cashier..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#073159] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#062a4d] transition-transform active:scale-95 text-sm md:text-base disabled:bg-gray-400"
                >
                  {submitting ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "Add to Invoice"}
                </button>
              </form>
            </div>
          </div>

          {/* --- RIGHT: Recent History --- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg"><DollarSign size={20} /></div>
                <div>
                  <p className="text-xs text-green-800 font-bold uppercase">Pending Billings</p>
                  <p className="text-xl font-bold text-green-900">₵ {totalBilledToday.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><FileText size={20} /></div>
                <div>
                  <p className="text-xs text-blue-800 font-bold uppercase">Pending Invoices</p>
                  <p className="text-xl font-bold text-blue-900">{invoices.length}</p>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <History className="w-4 h-4 text-gray-400" />
                <h3 className="font-bold text-gray-700 text-sm">Active Patient Invoices</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Patient</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {invoices.length > 0 ? invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{invoice.invoice_number}</td>
                        <td className="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">{invoice.patient_name || invoice.patient?.name}</td>
                        <td className="px-6 py-3 font-bold text-gray-800">₵{parseFloat(invoice.total_amount).toFixed(2)}</td>
                        <td className="px-6 py-3 text-right whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${invoice.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400">
                          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-10" />
                          No pending invoices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}