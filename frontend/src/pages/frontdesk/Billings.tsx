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
  UserPlus,
  Users,
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
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showPatientSelectModal, setShowPatientSelectModal] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const [newService, setNewService] = useState({
    service_item: "",
    description: "",
    quantity: 1,
    unit_price: 0,
  });

  // Fetch pending invoices, service items, and patients on component mount
  useEffect(() => {
    getPendingInvoices();
    getServiceItems();
    getPatients();
  }, []);

  const getPendingInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const data = await fetchPendingInvoices();
      setInvoices(data || []);
      if (data.length > 0 && !selectedInvoice) {
        setSelectedInvoice(data[0]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const getServiceItems = async () => {
    try {
      const data = await fetchServiceItems();
      setServiceItems(data || []);
    } catch (error) {
      console.error("Error fetching service items:", error);
    }
  };

  const getPatients = async () => {
    try {
      const data = await fetchPatients();
      setPatients(data.results || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.patient_mrn?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter patients for selection modal
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.mrn?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.phone?.includes(patientSearch)
  );

  const changeDue = selectedInvoice && amountTendered
    ? parseFloat(amountTendered) - parseFloat(selectedInvoice.total_amount || 0)
    : 0;

  const handleCreateInvoice = async () => {
    setShowPatientSelectModal(true);
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientSelectModal(false);
    createNewInvoiceForPatient(patient);
  };

  const createNewInvoiceForPatient = async (patient: any) => {
    setCreatingInvoice(true);
    try {
      const invoiceData = {
        patient: patient.id,
        payment_method: "Cash",
        notes: `New invoice for ${patient.name}`,
      };

       await createInvoice(invoiceData);
      toast.success(`Invoice created for ${patient.name}`);
      
      // Refresh invoices list and select the new invoice
      await getPendingInvoices();
      
      // Find and select the new invoice
      const updatedInvoices = await fetchPendingInvoices();
      const createdInvoice = updatedInvoices.find((inv: any) => 
        inv.patient === patient.id && inv.status === 'Pending'
      );
      
      if (createdInvoice) {
        setSelectedInvoice(createdInvoice);
      }
      
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.response?.data?.error || "Failed to create invoice");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) {
      toast.error("No invoice selected");
      return;
    }
    
    if (paymentMethod === "Cash" && parseFloat(amountTendered || "0") < parseFloat(selectedInvoice.total_amount || 0)) {
      toast.error("Amount tendered is less than total!");
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        amount: paymentMethod === "Cash" ? parseFloat(amountTendered) : parseFloat(selectedInvoice.total_amount),
        payment_method: paymentMethod === "MoMo" ? "Mobile Money" : paymentMethod,
        reference: `Payment for ${selectedInvoice.invoice_number}`,
      };

      const result = await processPayment(selectedInvoice.id, paymentData);
      
      toast.success(`Payment processed successfully!`);
      
      // Show receipt if available
      if (result.receipt) {
        setIsReceiptModalOpen(true);
      }
      
      // Refresh invoices list
      getPendingInvoices();
      
      // Reset form
      setAmountTendered("");
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!selectedInvoice || !newService.service_item) return;
    
    try {
      const serviceItem = serviceItems.find(item => item.id.toString() === newService.service_item);
      
      const itemData = {
        service_item: parseInt(newService.service_item),
        description: newService.description || serviceItem?.name,
        quantity: newService.quantity,
        unit_price: newService.unit_price || serviceItem?.price,
      };

      await addInvoiceItem(selectedInvoice.id, itemData);
      
      toast.success("Service added successfully!");
      
      // Refresh invoice data
      const updatedInvoices = await fetchPendingInvoices();
      setInvoices(updatedInvoices || []);
      
      // Update selected invoice
      const updatedInvoice = updatedInvoices.find((inv: any) => inv.id === selectedInvoice.id);
      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      }
      
      // Reset form
      setNewService({
        service_item: "",
        description: "",
        quantity: 1,
        unit_price: 0,
      });
      setShowAddServiceModal(false);
      
    } catch (error: any) {
      console.error("Error adding service:", error);
      toast.error(error.response?.data?.error || "Failed to add service");
    }
  };


  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get invoice items from the selected invoice
  const getInvoiceItems = () => {
    if (!selectedInvoice?.items) return [];
    return selectedInvoice.items;
  };

  // Get patient name for display
  const getPatientName = (patient: any) => {
    if (patient.name) return patient.name;
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient';
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Billing & Payments
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage invoices, receive payments, and issue receipts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateInvoice}
            disabled={creatingInvoice}
            className="px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-70"
          >
            {creatingInvoice ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            New Invoice
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT: INVOICE QUEUE */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[300px] lg:h-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Find patient invoice..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingInvoices ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 text-[#073159] animate-spin" />
                <span className="ml-2 text-sm text-gray-600">Loading invoices...</span>
              </div>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group ${
                    selectedInvoice?.id === invoice.id
                      ? "bg-blue-50 border-l-4 border-l-[#073159]"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          selectedInvoice?.id === invoice.id
                            ? "text-[#073159]"
                            : "text-gray-800"
                        }`}
                      >
                        {invoice.patient_name || "Unknown Patient"}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {invoice.patient_mrn || invoice.invoice_number}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(invoice.invoice_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-[#073159]">
                        ₵{parseFloat(invoice.total_amount || 0).toFixed(2)}
                      </span>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-400 text-sm">
                  {search ? 'No invoices found' : 'No pending invoices'}
                </p>
                {!search && (
                  <button
                    onClick={handleCreateInvoice}
                    disabled={creatingInvoice}
                    className="mt-3 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors text-sm font-medium disabled:opacity-70"
                  >
                    {creatingInvoice ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Creating...
                      </span>
                    ) : (
                      'Create First Invoice'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PAYMENT TERMINAL */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[500px] overflow-hidden">
          {selectedInvoice ? (
            <div className="flex-1 flex flex-col h-full">
              
              {/* Invoice Header */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white z-10">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    Invoice Details
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Bill ID: #{selectedInvoice.invoice_number}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      selectedInvoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedInvoice.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Due: {formatDate(selectedInvoice.invoice_date)}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 bg-blue-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">
                    Total Due
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-[#073159]">
                    ₵{parseFloat(selectedInvoice.total_amount || 0).toFixed(2)}
                  </p>
                  {selectedInvoice.amount_paid > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Paid: ₵{parseFloat(selectedInvoice.amount_paid || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                
                {/* Breakdown List */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto border-r-0 xl:border-r border-gray-100 bg-gray-50/30 min-h-[200px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <FileText size={16} /> Itemized Breakdown
                    </h3>
                    <button
                      onClick={() => setShowAddServiceModal(true)}
                      className="text-xs px-3 py-1 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors"
                    >
                      Add Service
                    </button>
                  </div>
                  
                  {getInvoiceItems().length > 0 ? (
                    <div className="space-y-3">
                      {getInvoiceItems().map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm p-3 bg-white border border-gray-100 rounded-lg"
                        >
                          <div>
                            <span className="text-gray-700 font-medium">
                              {item.description || item.service_item_name}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.service_item_code && `Code: ${item.service_item_code}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 block">
                              ₵{parseFloat(item.total_price || 0).toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {item.quantity} x ₵{parseFloat(item.unit_price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-400">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="text-gray-400" size={20} />
                      </div>
                      <p>No items added to this invoice yet.</p>
                      <button
                        onClick={() => setShowAddServiceModal(true)}
                        className="mt-2 text-[#073159] text-sm font-bold hover:underline"
                      >
                        Add First Item
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-800 font-bold">
                        ₵{parseFloat(selectedInvoice.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    {selectedInvoice.amount_paid > 0 && (
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Amount Paid</span>
                        <span className="text-green-600 font-bold">
                          ₵{parseFloat(selectedInvoice.amount_paid || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-300">
                      <span className="text-gray-700 font-bold">Balance</span>
                      <span className={`font-bold text-lg ${
                        parseFloat(selectedInvoice.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₵{parseFloat(selectedInvoice.balance || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Action Area */}
                <div className="w-full xl:w-[400px] p-4 md:p-6 bg-white flex flex-col border-t xl:border-t-0 border-gray-100 overflow-y-auto">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 flex-shrink-0">
                    <button
                      onClick={() => setPaymentMethod("Cash")}
                      className={`p-2 md:p-3 rounded-xl border text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === "Cash"
                          ? "bg-[#073159] text-white border-[#073159]"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <CreditCard size={16} />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod("MoMo")}
                      className={`p-2 md:p-3 rounded-xl border text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === "MoMo"
                          ? "bg-[#073159] text-white border-[#073159]"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Smartphone size={16} />
                      MoMo
                    </button>
                    <button
                      onClick={() => setPaymentMethod("Insurance")}
                      className={`p-2 md:p-3 rounded-xl border text-xs font-bold transition-colors flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === "Insurance"
                          ? "bg-[#073159] text-white border-[#073159]"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Shield size={16} />
                      Insurance
                    </button>
                  </div>

                  {paymentMethod === "Cash" && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-4 mb-6 flex-shrink-0">
                      <div>
                        <label className="text-xs font-bold text-green-700 uppercase">
                          Amount Tendered
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-3 text-green-600 font-bold">
                            ₵
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 outline-none text-lg font-bold text-green-900 bg-white"
                            placeholder="0.00"
                            value={amountTendered}
                            onChange={(e) => setAmountTendered(e.target.value)}
                            min={parseFloat(selectedInvoice.balance || 0)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-200">
                        <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                          <Calculator size={16} /> Change Due:
                        </span>
                        <span
                          className={`text-xl font-bold ${
                            changeDue < 0 ? "text-red-500" : "text-green-800"
                          }`}
                        >
                          ₵{changeDue >= 0 ? changeDue.toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3 pb-2">
                    <button
                      onClick={handleProcessPayment}
                      disabled={
                        loading ||
                        (paymentMethod === "Cash" && changeDue < 0) ||
                        parseFloat(selectedInvoice.balance || 0) <= 0
                      }
                      className="w-full py-4 bg-[#073159] text-white rounded-xl font-bold shadow-lg hover:bg-[#062a4d] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} /> 
                          {parseFloat(selectedInvoice.balance || 0) <= 0 ? 'Already Paid' : 'Confirm Payment'}
                        </>
                      )}
                    </button>
                    
                    {parseFloat(selectedInvoice.balance || 0) > 0 && (
                      <div className="text-center text-xs text-gray-500">
                        Balance: ₵{parseFloat(selectedInvoice.balance || 0).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <p className="text-lg font-medium text-gray-700">Select an invoice</p>
              <p className="text-sm text-gray-500 mt-2">
                Choose an invoice from the list to view details and process payment.
              </p>
              <button
                onClick={handleCreateInvoice}
                disabled={creatingInvoice}
                className="mt-4 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors text-sm font-medium disabled:opacity-70"
              >
                {creatingInvoice ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Creating Invoice...
                  </span>
                ) : (
                  'Create New Invoice'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Patient Selection Modal */}
      {showPatientSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} /> Select Patient for Invoice
              </h3>
              <button
                onClick={() => setShowPatientSelectModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search patients by name, MRN, or phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#073159] outline-none"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors rounded-lg mb-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#073159] font-bold text-sm mr-3">
                          {getPatientName(patient).charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">
                            {getPatientName(patient)}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {patient.mrn} • {patient.phone}
                            {patient.gender && ` • ${patient.gender}`}
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-[#073159] text-white text-xs rounded-lg hover:bg-[#062a4d] transition-colors">
                        Select
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-400 text-sm">
                    {patientSearch ? 'No patients found' : 'No patients available'}
                  </p>
                  {!patientSearch && (
                    <p className="text-xs text-gray-500 mt-2">
                      Register patients first to create invoices
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Add Service/Item</h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Service Item
                </label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none"
                  value={newService.service_item}
                  onChange={(e) => {
                    setNewService({...newService, service_item: e.target.value});
                    const selected = serviceItems.find(item => item.id.toString() === e.target.value);
                    if (selected) {
                      setNewService(prev => ({
                        ...prev,
                        description: selected.name,
                        unit_price: selected.price
                      }));
                    }
                  }}
                >
                  <option value="">Select a service...</option>
                  {serviceItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ₵{item.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Service description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none"
                    value={newService.quantity}
                    onChange={(e) => setNewService({...newService, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Unit Price (₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none"
                    value={newService.unit_price}
                    onChange={(e) => setNewService({...newService, unit_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={!newService.service_item}
                  className="px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors disabled:opacity-50"
                >
                  Add to Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL - You'll need to update this to use real receipt data */}
      {/* For now, it uses the same structure but you should update it when you implement receipts */}
    </div>
  );
}