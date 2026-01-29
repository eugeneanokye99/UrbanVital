import { useState, useMemo, useEffect } from "react";

import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Printer,
  Check,
  Loader2,
  Package,
  Footprints,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../assets/urbanvital-logo.png";
import { fetchPatients, fetchPharmacyItems, createInvoice, processPayment, addInvoiceItem } from "../../services/api";

export default function PharmacyPOS() {
  // No longer need setSales from context 

  // --- States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [pharmacistName, setPharmacistName] = useState("Pharm. Staff");
  const [processingSale, setProcessingSale] = useState(false);

  // Patient / Walk-in States
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInId, setWalkInId] = useState("");

  // Receipt States
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);


  // API Data States
  const [patients, setPatients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    fetchInventoryData();
    fetchPatientsData();

    // Retrieve User
    try {
      const rawUser = localStorage.getItem("user") || localStorage.getItem("auth") || localStorage.getItem("userInfo");
      if (rawUser) {
        let foundName = null;
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(rawUser);
          const userObj = parsed.user || parsed.data || parsed;
          foundName =
            userObj.name ||
            userObj.fullName ||
            userObj.full_name ||
            (userObj.first_name && userObj.last_name ? `${userObj.first_name} ${userObj.last_name}` : null) ||
            userObj.username ||
            userObj.email;
        } catch (e) {
          // If parse fails, assume it's a plain string name
          foundName = rawUser;
        }

        if (foundName && typeof foundName === 'string') {
          setPharmacistName(foundName);
        }
      }
    } catch (error) {
      console.error("POS: Error loading user", error);
    }
  }, []);

  const fetchInventoryData = async () => {
    try {
      const data = await fetchPharmacyItems();
      setInventory(data || []);
    } catch (error) {
      setInventory([]);
    } finally {
      setHasInitialLoad(true);
    }
  };

  const fetchPatientsData = async (searchTerm = "") => {
    setLoadingPatients(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      const data = await fetchPatients(params);
      if (data.results) setPatients(data.results);
      else if (Array.isArray(data)) setPatients(data);
      else setPatients([]);
    } catch (error) {
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // --- Logic ---
  const filteredDrugs = useMemo(() => {
    if (!searchQuery) return [];
    return inventory.filter((drug: any) =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, inventory]);

  const filteredPatients = useMemo(() => {
    if (!patientQuery) return [];
    return patients.filter(p => {
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const phone = p.phone || '';
      return fullName.includes(patientQuery.toLowerCase()) || phone.includes(patientQuery);
    });
  }, [patientQuery, patients]);

  // --- Actions ---
  const handleToggleCustomerType = (type: 'registered' | 'walkin') => {
    if (type === 'walkin') {
      const id = `WI-${Date.now().toString().slice(-6)}`;
      setIsWalkIn(true);
      setWalkInId(id);
      setSelectedPatient(null);
      setPatientQuery("");
      toast("Switched to Walk-in Mode", { icon: "👣" });
    } else {
      setIsWalkIn(false);
      setWalkInId("");
    }
  };

  const addToCart = (drug: any) => {
    const price = drug.selling_price || drug.price;
    const stock = drug.current_stock || drug.stock || 0;
    const existingItem = cart.find(item => item.id === drug.id);

    if (existingItem) {
      if (existingItem.qty < stock) {
        setCart(cart.map(item => item.id === drug.id ? { ...item, qty: item.qty + 1 } : item));
        toast.success(`Added another ${drug.name}`);
      } else {
        toast.error(`Insufficient stock`);
      }
    } else {
      if (stock > 0) {
        setCart([...cart, { ...drug, qty: 1, price: price, original_stock: stock }]);
        toast.success("Added to cart");
        setSearchQuery("");
      } else {
        toast.error("Out of Stock");
      }
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        const stockItem = inventory.find((i: any) => i.id === id);
        const stock = stockItem?.current_stock || stockItem?.stock || 0;
        if (newQty > stock) { toast.error("Max stock reached"); return item; }
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id));
  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const selectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setPatientQuery(`${patient.first_name || ''} ${patient.last_name || ''}`.trim());
    setShowPatientSuggestions(false);
  };

  const handleSearchPatients = (query: string) => {
    setPatientQuery(query);
    setShowPatientSuggestions(true);
    if (selectedPatient) setSelectedPatient(null);
    if (query.trim()) fetchPatientsData(query);
    else setPatients([]);
  };

  // --- COMPLETE SALE ---
  const handleCompleteSale = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!selectedPatient && !isWalkIn) return toast.error("Please select a patient or Walk-in");

    setProcessingSale(true);

    try {
      // Map frontend payment method to backend values
      const paymentMethodMap: { [key: string]: string } = {
        "Cash": "Cash",
        "Mobile Money": "Mobile Money",
        "Card": "Card",
        "Insurance": "Insurance"
      };

      const backendPaymentMethod = paymentMethodMap[paymentMethod] || "Cash";

      const invoiceData = {
        patient: selectedPatient?.id || null,
        walkin_id: isWalkIn ? walkInId : null,
        status: 'Paid',
        payment_method: backendPaymentMethod,
        notes: isWalkIn ? `Pharmacy Sale - Walk-in (${walkInId})` : `Pharmacy Sale - Registered Patient`,
      };

      const invoiceResponse = await createInvoice(invoiceData);
      const invoiceId = invoiceResponse.id;

      for (const item of cart) {
        await addInvoiceItem(invoiceId, {
          description: item.name,
          quantity: item.qty,
          unit_price: item.price,
          discount: 0,
        });
      }

      const totalAmount = calculateTotal();
      await processPayment(invoiceId, {
        amount: totalAmount,
        payment_method: backendPaymentMethod,
        reference: `POS-${Date.now()}`,
        notes: "Pharmacy Sale"
      });

      // Prepare receipt data
      const now = new Date();
      const customerName = isWalkIn ? "Walk-in Customer" : `${selectedPatient.first_name} ${selectedPatient.last_name}`;

      setReceiptData({
        id: invoiceResponse.invoice_number || `INV-${invoiceId}`,
        invoice_id: invoiceId,
        date: now.toLocaleDateString('en-GB'),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patient: customerName,
        patientPhone: selectedPatient ? selectedPatient.phone : (isWalkIn ? `Ref: ${walkInId}` : "N/A"),
        items: cart.map(i => i.name).join(", "),
        cartItems: [...cart],
        amount: totalAmount,
        method: paymentMethod,
        pharmacist: pharmacistName,
        invoiceId: invoiceId
      });

      // --- RESET POS STATE AUTOMATICALLY ---
      setCart([]);
      setSearchQuery("");
      setSelectedPatient(null);
      setPatientQuery("");
      if (isWalkIn) {
        // Compute new Walk-in ID for next customer
        setWalkInId(`WI-${Date.now().toString().slice(-6)}`);
      }

      setShowReceipt(true);
      toast.success("Sale Completed! Ready for next.");

    } catch (error) {
      console.error(error);
      toast.error("Transaction Failed");
    } finally {
      setProcessingSale(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt-container');
    if (!printContent) return;

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                        @page { size: 80mm auto; margin: 0; }
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            margin: 0; 
                            padding: 20px 10px; 
                            width: 80mm; 
                            background: white;
                            color: black;
                            font-size: 11px;
                        }
                        img { display: block; margin: 0 auto; max-width: 100%; grayscale: 100%; opacity: 0.9; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                        th { border-bottom: 1px solid black; text-align: left; padding: 5px 0; }
                        td { padding: 3px 0; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .uppercase { text-transform: uppercase; }
                        .border-t-2 { border-top: 2px solid black; }
                        .no-print { display: none !important; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
      doc.close();

      // Print and cleanup
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }

    // Remove iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCart([]);
    setReceiptData(null);
    setSelectedPatient(null);
    setPatientQuery("");
    setPaymentMethod("Cash");
    setSearchQuery("");
    if (isWalkIn) {
      const id = `WI-${Date.now().toString().slice(-6)}`;
      setWalkInId(id);
    }
  };

  if (!hasInitialLoad) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /> Loading System...</div>;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 relative">


      {/* LEFT: Search & Results */}
      <div className="flex-1 flex flex-col gap-6">

        {/* CUSTOMER SELECTION */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleToggleCustomerType('registered')}
              disabled={processingSale}
              className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${!isWalkIn
                ? "border-[#073159] bg-blue-50 text-[#073159]"
                : "border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              <User size={20} /> Registered Patient
            </button>
            <button
              onClick={() => handleToggleCustomerType('walkin')}
              disabled={processingSale}
              className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${isWalkIn
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              <Footprints size={20} /> Walk-in Customer
            </button>
          </div>

          <div className="relative">
            {isWalkIn ? (
              <div className="w-full p-4 border-2 border-teal-100 bg-teal-50/50 rounded-xl flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-600 text-white rounded-lg"><Footprints size={20} /></div>
                  <div>
                    <p className="font-bold text-teal-800 text-lg">Guest Customer</p>
                    <p className="text-sm text-teal-600 font-mono">ID: {walkInId}</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white text-teal-600 px-3 py-1 rounded-full border border-teal-200">Active</span>
              </div>
            ) : (
              <div className="flex items-center border border-gray-300 rounded-xl bg-white focus-within:border-[#073159] focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <div className="p-3 text-gray-400"><Search size={20} /></div>
                <input
                  type="text"
                  placeholder="Search patient by name or phone..."
                  className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 font-medium"
                  value={patientQuery}
                  onChange={(e) => handleSearchPatients(e.target.value)}
                  disabled={processingSale}
                />
                {selectedPatient && !processingSale && (
                  <button onClick={() => { setSelectedPatient(null); setPatientQuery(""); }} className="p-3 text-red-500 hover:bg-red-50 rounded-r-xl"><X size={20} /></button>
                )}
              </div>
            )}
            {!isWalkIn && showPatientSuggestions && patientQuery && !selectedPatient && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                {loadingPatients ? (
                  <div className="p-4 text-center text-gray-400 text-sm"><Loader2 size={16} className="animate-spin inline mr-2" /> Searching database...</div>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map(p => (
                    <div key={p.id} onClick={() => selectPatient(p)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-[#073159]">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-gray-500">{p.phone || 'No phone'} • {p.gender || 'N/A'}</p>
                      </div>
                      <Check className="text-blue-600 opacity-0 group-hover:opacity-100" size={16} />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">No registered patients found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DRUG LIST */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#073159] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={processingSale}
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {searchQuery || inventory.length > 0 ? (
              <div className="space-y-2">
                {(searchQuery ? filteredDrugs : inventory).map((drug: any) => {
                  const price = drug.selling_price || drug.price || 0;
                  const stock = drug.current_stock || drug.stock || 0;
                  const isOutOfStock = stock === 0;
                  return (
                    <div key={drug.id} onClick={() => !isOutOfStock && !processingSale && addToCart(drug)} className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all ${isOutOfStock ? 'opacity-60 bg-gray-50' : processingSale ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-200 border-gray-100 shadow-sm hover:shadow-md'}`}>
                      <div>
                        <h3 className="font-bold text-gray-800">{drug.name}</h3>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{drug.category || "Gen"}</span>
                          <span className={`${isOutOfStock ? 'text-red-600 font-bold' : 'text-green-600 font-medium'}`}>{stock} in stock</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#073159] text-lg">₵{price}</p>
                        {isOutOfStock && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">SOLD OUT</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400"><Package size={48} className="opacity-20 mb-2" /><p>No items found</p></div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: CART & PAYMENT */}
      <div className="w-full lg:w-[420px] flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex-1 flex flex-col overflow-hidden h-full">
          <div className="p-5 border-b border-gray-100 bg-[#073159] text-white flex justify-between items-center shadow-md z-10">
            <h2 className="font-bold flex items-center gap-2 text-lg"><ShoppingCart size={20} /> Sales Cart</h2>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">{cart.length} Items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><ShoppingCart size={32} className="opacity-40" /></div>
                <p className="font-medium">Your cart is empty</p>
                <p className="text-xs">Select items from the inventory to begin.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-in slide-in-from-right-4 duration-300">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500">₵{item.price} / unit</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-lg border border-gray-200">
                      <button disabled={processingSale} onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-gray-200 rounded-l-lg disabled:opacity-50"><Minus size={12} /></button>
                      <span className="w-8 text-center text-sm font-bold flex items-center justify-center bg-white">{item.qty}</span>
                      <button disabled={processingSale} onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-gray-200 rounded-r-lg disabled:opacity-50"><Plus size={12} /></button>
                    </div>
                    <p className="font-bold text-sm text-[#073159] w-16 text-right">₵{(item.price * item.qty).toFixed(2)}</p>
                    <button disabled={processingSale} onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Method</p>
              <div className="grid grid-cols-4 gap-2">
                {["Cash", "MoMo",].map(m => (
                  <button key={m} disabled={processingSale} onClick={() => setPaymentMethod(m)} className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${paymentMethod === m ? "bg-[#073159] border-[#073159] text-white shadow-md transform scale-105" : "border-gray-200 text-gray-600 hover:bg-gray-50"} disabled:opacity-50 disabled:pointer-events-none`}>{m}</button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end mb-6 pt-4 border-t border-dashed border-gray-200">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Payable</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isWalkIn ? `Walk-in: ${walkInId}` : (selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : "Select Customer")}
                </p>
              </div>
              <span className="text-4xl font-extrabold text-[#073159]">₵{calculateTotal()}</span>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || (!selectedPatient && !isWalkIn) || processingSale}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {processingSale ? (
                <><Loader2 size={24} className="animate-spin" /> Processing...</>
              ) : (
                <><Check size={24} strokeWidth={3} /> Complete Sale</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- THERMAL RECEIPT MODAL --- */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 receipt-overlay">
          <div className="bg-white rounded-none shadow-2xl w-[380px] overflow-hidden flex flex-col max-h-[90vh]" id="printable-receipt-container">

            {/* Print Area - Strictly Styled for POS */}
            <div className="p-8 bg-white text-black font-mono text-xs leading-relaxed overflow-y-auto">
              <div className="text-center mb-6">
                <img src={logo} alt="UrbanVital" className="h-12 mx-auto mb-2 grayscale opacity-90 block" />
                <h2 className="font-bold text-base uppercase tracking-widest text-black mb-1">UrbanVital Pharmacy</h2>
                <p className="text-gray-600">Kejetia, Kumasi - Ghana</p>
                <p className="text-gray-600">Tel: +233 59 792 7089</p>
                <p className="mt-2 border-t border-b border-black py-1 font-bold">{receiptData.id}</p>
              </div>

              <div className="mb-4 space-y-1 text-[11px] uppercase">
                <div className="flex justify-between"><span>Date:</span><span>{receiptData.date} {receiptData.time}</span></div>
                <div className="flex justify-between"><span>Customer:</span><span className="font-bold">{receiptData.patient}</span></div>
                <div className="flex justify-between"><span>Method:</span><span>{receiptData.method}</span></div>
              </div>

              <table className="w-full mb-4 border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="py-1 text-left">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.cartItems.map((i: any, x: number) => (
                    <tr key={x}>
                      <td className="py-1">{i.name}</td>
                      <td className="py-1 text-center">{i.qty}</td>
                      <td className="py-1 text-right">{i.price * i.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-black pt-2 flex justify-between font-bold text-lg mb-6">
                <span>TOTAL</span>
                <span>₵{receiptData.amount}</span>
              </div>

              <div className="text-center text-[10px] space-y-1">
                <p>Thank you for your purchase!</p>
                <p>Returns accepted within 24hrs with receipt.</p>
                <p className="font-bold">Served by: {receiptData.pharmacist}</p>
              </div>
            </div>

            {/* Modal Actions (Hidden in Print) */}
            <div className="p-4 bg-gray-100 flex gap-3 border-t border-gray-200 no-print">
              <button onClick={handleCloseReceipt} className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Close</button>
              <button onClick={handlePrint} className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#062a4d] shadow-lg transition-colors"><Printer size={18} /> Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}