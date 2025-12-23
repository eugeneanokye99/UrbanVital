import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Save, 
  Printer, 
  Check,
  Loader2,
  Package,
  Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../assets/urbanvital-logo.png";
import { fetchPatients, fetchPharmacyItems, createInvoice, processPayment, addInvoiceItem } from "../../services/api";

export default function PharmacyPOS() {
  // 1. Access Shared State from Layout
  const { setSales } = useOutletContext<any>(); 
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  // New states for API data
  const [patients, setPatients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchInventoryData();
    fetchPatientsData();
  }, []);
  

  
  const fetchInventoryData = async () => {
    
    setLoadingInventory(true);
    try {
      const data = await fetchPharmacyItems();
      if (data && data.length > 0) {
        setInventory(data);
      }  else {
        setInventory([]);
      }
    } catch (error) {
      console.error("Inventory fetch error:", error);
      setInventory([]);
    } finally {
      setLoadingInventory(false);
      setHasInitialLoad(true);
    }
  };
  
  const fetchPatientsData = async (searchTerm = "") => {
    setLoadingPatients(true);
    try {
      const params: any = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      const data = await fetchPatients(params);
      if (data.results && data.results.length > 0) {
        setPatients(data.results);
      } else if (data.length > 0) {
        setPatients(data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Patients fetch error:", error);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // --- LOGIC ---

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
      return fullName.includes(patientQuery.toLowerCase()) || 
             phone.includes(patientQuery);
    });
  }, [patientQuery, patients]);

  // --- ACTIONS ---

  const addToCart = (drug: any) => {
    const price = drug.selling_price || drug.price;
    const stock = drug.current_stock || drug.stock || 0;
    
    const existingItem = cart.find(item => item.id === drug.id);
    if (existingItem) {
        if (existingItem.qty < stock) {
            setCart(cart.map(item => 
              item.id === drug.id ? { ...item, qty: item.qty + 1 } : item
            ));
            toast.success(`Added another ${drug.name}`);
        } else {
            toast.error(`Insufficient stock`);
        }
    } else {
        if (stock > 0) {
            setCart([...cart, { 
              ...drug, 
              qty: 1, 
              price: price,
              original_stock: stock 
            }]);
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
            
            if (newQty > stock) {
                toast.error("Max stock reached");
                return item;
            }
            return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const selectPatient = (patient: any) => {
      setSelectedPatient(patient);
      setPatientQuery(`${patient.first_name || ''} ${patient.last_name || ''}`.trim());
      setShowPatientSuggestions(false);
  };

  // --- RECORDING SALE TO HISTORY & BACKEND ---

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    try {
      // 1. Create invoice in backend
      const invoiceData = {
        patient: selectedPatient?.id || null,
        status: 'Paid',
        payment_method: paymentMethod,
        notes: `Pharmacy POS sale - ${cart.length} items`,
      };
      
      const invoiceResponse = await createInvoice(invoiceData);
      const invoiceId = invoiceResponse.id;
      
      // 2. Add invoice items (cart items)
      for (const item of cart) {
        try {
          await addInvoiceItem(invoiceId, {
            service_item: null,
            description: item.name,
            quantity: item.qty,
            unit_price: item.price,
            discount: 0,
          });
        } catch (itemError) {
          console.error("Failed to add item to invoice:", itemError);
        }
      }
      
      // 3. Process payment if amount > 0
      const totalAmount = calculateTotal();
      if (totalAmount > 0) {
        await processPayment(invoiceId, {
          amount: totalAmount,
          payment_method: paymentMethod,
          reference: `POS-${Date.now()}`,
          notes: "Pharmacy POS sale",
        });
      }
      
      // 5. Prepare receipt and history record
      const now = new Date();
      const newReceiptId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const historyRecord = {
        id: newReceiptId,
        invoice_id: invoiceId,
        date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patient: selectedPatient ? `${selectedPatient.first_name || ''} ${selectedPatient.last_name || ''}`.trim() : (patientQuery || "Walk-in Customer"),
        items: cart.map(i => i.name).join(", "),
        amount: totalAmount,
        method: paymentMethod,
        pharmacist: "Pharm. Mensah"
      };
      
      // 6. Update the global "Shared Brain"
      setSales((prev: any) => [historyRecord, ...prev]);
      
      // 7. Set Receipt Modal Data
      setReceiptData({
        ...historyRecord,
        patientPhone: selectedPatient ? selectedPatient.phone : "N/A",
        cartItems: [...cart],
        invoiceId: invoiceId
      });
      
      setShowReceipt(true);
      toast.success("Sale Completed & Recorded!");
      
    } catch (error) {
      console.error("Sale completion error:", error);
      toast.error("Failed to complete sale. Please try again.");
    }
  };

  const handleSearchPatients = (query: string) => {
    setPatientQuery(query);
    setShowPatientSuggestions(true);
    if (selectedPatient) setSelectedPatient(null);
    
    if (query.trim()) {
      fetchPatientsData(query);
    } else {
      setPatients([]);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-receipt");
    const originalContents = document.body.innerHTML;
    if (printContent) {
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); 
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setCart([]);
    setReceiptData(null);
    setSelectedPatient(null);
    setPatientQuery("");
    setPaymentMethod("Cash");
    setSearchQuery("");
  };

  // Show loading state initially
  if (!hasInitialLoad) {
    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#073159] mx-auto mb-4" />
          <p className="text-gray-600">Loading pharmacy system...</p>
        </div>
      </div>
    );
  }

  // Show nothing if no inventory data
  if (inventory.length === 0 && !loadingInventory) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 relative">
      
      {/* LEFT: Search & Results */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Patient Search */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative z-10">
          <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <User size={16} /> Patient Information
          </h2>
          <div className="relative">
            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-[#073159] focus-within:ring-2 focus-within:ring-blue-50 transition-all">
              <input 
                type="text" 
                placeholder="Search patient name or phone..." 
                className="w-full p-3 bg-transparent outline-none"
                value={patientQuery}
                onChange={(e) => handleSearchPatients(e.target.value)}
              />
              {selectedPatient ? (
                <button 
                  onClick={() => {
                    setSelectedPatient(null); 
                    setPatientQuery("");
                  }} 
                  className="p-3 text-green-600 hover:text-green-700"
                  title="Clear patient selection"
                >
                  <Check size={20} />
                </button>
              ) : loadingPatients ? (
                <div className="p-3 text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <div className="p-3 text-gray-400">
                  <Users size={20} />
                </div>
              )}
            </div>

            {showPatientSuggestions && patientQuery && !selectedPatient && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                {loadingPatients ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Searching patients...
                  </div>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => selectPatient(p)} 
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center group transition-colors"
                    >
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-[#073159]">
                          {p.first_name || ''} {p.last_name || ''}
                        </p>
                        <p className="text-xs text-gray-500">{p.phone || 'No phone'}</p>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {p.payment_mode || "Cash"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    <Users size={16} className="inline mr-2 opacity-50" />
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drug Search */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search drug name..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#073159] focus:ring-2 focus:ring-blue-50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loadingInventory}
            />
            {loadingInventory && (
              <div className="absolute right-4 top-3.5">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            {loadingInventory ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Loader2 size={48} className="animate-spin opacity-20" />
                <p className="text-xs">Loading inventory...</p>
              </div>
            ) : searchQuery && filteredDrugs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Search size={48} className="opacity-20" />
                <p className="text-xs">No items found for "{searchQuery}"</p>
              </div>
            ) : !searchQuery && inventory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Package size={48} className="opacity-20" />
                <p className="text-xs">Inventory is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(searchQuery ? filteredDrugs : inventory).map((drug: any) => {
                  const price = drug.selling_price || drug.price || 0;
                  const stock = drug.current_stock || drug.stock || 0;
                  const isOutOfStock = stock === 0;
                  const isLowStock = stock > 0 && stock < 10;
                  
                  return (
                    <div 
                      key={drug.id} 
                      onClick={() => !isOutOfStock && addToCart(drug)} 
                      className={`group flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-all ${
                        isOutOfStock 
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                          : 'border-gray-100 hover:bg-blue-50 hover:border-blue-100 active:scale-[0.99]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 group-hover:text-[#073159] truncate">
                          {drug.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{drug.category || "General"}</span>
                          <span className="text-gray-300">•</span>
                          <span className={
                            isOutOfStock ? "text-red-500 font-bold" :
                            isLowStock ? "text-orange-500 font-bold" :
                            "text-green-500"
                          }>
                            {stock} {drug.unit_of_measure || 'units'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-[#073159] whitespace-nowrap">
                          ₵{price}
                        </p>
                        <button 
                          className={`text-[10px] border px-2 py-1 rounded shadow-sm transition-colors mt-1 whitespace-nowrap ${
                            isOutOfStock 
                              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" 
                              : "bg-white border-gray-200 group-hover:bg-[#073159] group-hover:text-white hover:shadow"
                          }`}
                          disabled={isOutOfStock}
                        >
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-[#073159] text-white flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <ShoppingCart size={20} /> Current Sale
            </h2>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {cart.length} Item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <ShoppingCart size={48} className="opacity-20" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs text-gray-500">Add items from the inventory</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-in slide-in-from-bottom-2 fade-in"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        ₵{item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button 
                          onClick={() => updateQty(item.id, -1)} 
                          className="p-1.5 hover:text-red-500 transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-700">
                          {item.qty}
                        </span>
                        <button 
                          onClick={() => updateQty(item.id, 1)} 
                          className="p-1.5 hover:text-green-600 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-sm text-[#073159] w-[70px] text-right whitespace-nowrap">
                        ₵{(item.price * item.qty)}
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 bg-white border-t border-gray-100">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Payment Method</p>
              <div className="grid grid-cols-4 gap-2">
                {["Cash", "MoMo", "Card", "Insurance"].map(method => (
                  <button 
                    key={method} 
                    onClick={() => setPaymentMethod(method)} 
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      paymentMethod === method 
                        ? "bg-teal-50 border-teal-500 text-teal-700 shadow-sm" 
                        : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-gray-500 font-medium text-sm">Total Payable</p>
                {selectedPatient && (
                  <p className="text-xs text-gray-400 mt-1">
                    Patient: {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                )}
              </div>
              <span className="text-3xl font-bold text-[#073159]">
                ₵{calculateTotal()}
              </span>
            </div>
            
            <button 
              onClick={handleCompleteSale} 
              disabled={cart.length === 0}
              className="w-full py-4 bg-[#073159] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-[#062a4d] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.98]"
            >
              <Save size={20} /> Complete Sale
            </button>
          </div>
        </div>
      </div>

      {/* --- RECEIPT MODAL --- */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-300">
            <div id="printable-receipt" className="p-8 bg-white text-gray-800 font-mono text-sm">
              <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                <img src={logo} alt="Logo" className="h-10 mx-auto mb-2 grayscale" />
                <h2 className="font-bold text-lg uppercase tracking-wide">UrbanVital Pharmacy</h2>
                <p className="text-[10px] text-gray-500">Loc: Kejetia opp. Maternal Hospital</p>
                <p className="text-[10px] text-gray-500">Tel: +233 59 792 7089</p>
              </div>

              <div className="mb-4 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span> 
                  <span>{receiptData.date} {receiptData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Receipt #:</span> 
                  <span className="font-bold">{receiptData.id}</span>
                </div>
                {receiptData.invoiceId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Invoice #:</span> 
                    <span>{receiptData.invoiceId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span> 
                  <span className="font-bold max-w-[200px] truncate">{receiptData.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span> 
                  <span>{receiptData.patientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Method:</span> 
                  <span className="font-medium">{receiptData.method}</span>
                </div>
              </div>

              <table className="w-full mb-4 text-xs">
                <thead className="border-b border-gray-300">
                  <tr className="text-left">
                    <th className="py-1 font-medium">Item</th>
                    <th className="py-1 text-center font-medium">Qty</th>
                    <th className="py-1 text-right font-medium">Price</th>
                    <th className="py-1 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.cartItems.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1.5">{item.name}</td>
                      <td className="py-1.5 text-center">{item.qty}</td>
                      <td className="py-1.5 text-right">₵{item.price}</td>
                      <td className="py-1.5 text-right">₵{(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-300 pt-3 mb-4 flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>₵{receiptData.amount}</span>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-500 mb-1">
                  This receipt is computer generated
                </p>
                <p className="text-[10px] text-gray-500">
                  Thank you for your patronage!
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 no-print">
              <button 
                onClick={handleCloseReceipt} 
                className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handlePrint} 
                className="flex-1 py-2.5 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 transition-colors hover:shadow-lg"
              >
                <Printer size={18} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}