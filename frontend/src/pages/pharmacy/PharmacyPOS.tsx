import { useState, useMemo } from "react";
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
  Check} from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../assets/urbanvital-logo.png";

export default function PharmacyPOS() {
  // 1. Access Shared State from Layout
  const { setSales, inventory: globalInventory } = useOutletContext<any>(); 
  
  // Use global inventory if available, otherwise use mock data
  const inventory = useMemo(() => {
    return globalInventory?.length > 0 ? globalInventory : [
        { id: 1, name: "Paracetamol 500mg", price: 1.50, stock: 450, category: "Pain Relief" },
        { id: 2, name: "Amoxicillin 500mg", price: 15.00, stock: 12, category: "Antibiotic" },
        { id: 3, name: "Artemether-Lumefantrine", price: 35.00, stock: 80, category: "Antimalarial" },
        { id: 4, name: "Multivitamin Syrup", price: 25.00, stock: 200, category: "Supplement" },
        { id: 5, name: "Ciprofloxacin 500mg", price: 12.50, stock: 5, category: "Antibiotic" },
      ];
  }, [globalInventory]);

  const mockPatients = [
    { id: "P001", name: "Sarah Mensah", phone: "054 123 4567", type: "Insurance" },
    { id: "P002", name: "Emmanuel Osei", phone: "020 987 6543", type: "Registered" },
    { id: "P003", name: "Ama Kyei", phone: "055 555 5555", type: "Private" },
    { id: "P004", name: "John Doe", phone: "024 000 0000", type: "Registered" },
  ];

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // --- LOGIC ---

  const filteredDrugs = useMemo(() => {
    if (!searchQuery) return [];
    return inventory.filter((drug: any) => 
      drug.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, inventory]);

  const filteredPatients = useMemo(() => {
    if (!patientQuery) return [];
    return mockPatients.filter(p => 
        p.name.toLowerCase().includes(patientQuery.toLowerCase()) || 
        p.phone.includes(patientQuery)
    );
  }, [patientQuery]);

  // --- ACTIONS ---

  const addToCart = (drug: any) => {
    const existingItem = cart.find(item => item.id === drug.id);
    if (existingItem) {
        if (existingItem.qty < drug.stock) {
            setCart(cart.map(item => item.id === drug.id ? { ...item, qty: item.qty + 1 } : item));
            toast.success(`Added another ${drug.name}`);
        } else {
            toast.error(`Insufficient stock`);
        }
    } else {
        if (drug.stock > 0) {
            setCart([...cart, { ...drug, qty: 1 }]);
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
            if (newQty > stockItem.stock) {
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
      setPatientQuery(patient.name);
      setShowPatientSuggestions(false);
  };

  // --- RECORDING SALE TO HISTORY ---

  const handleCompleteSale = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    
    const now = new Date();
    const newReceiptId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Prepare entry for the History Log
    const historyRecord = {
        id: newReceiptId,
        date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        patient: selectedPatient ? selectedPatient.name : (patientQuery || "Walk-in Customer"),
        items: cart.map(i => i.name).join(", "), // Flatten drug names for the table
        amount: calculateTotal(),
        method: paymentMethod,
        pharmacist: "Pharm. Mensah"
    };

    // 3. Update the global "Shared Brain"
    setSales((prev: any) => [historyRecord, ...prev]);

    // 4. Set Receipt Modal Data
    setReceiptData({
        ...historyRecord,
        patientPhone: selectedPatient ? selectedPatient.phone : "N/A",
        cartItems: [...cart] // Keep the detailed array for the receipt table
    });

    setShowReceipt(true);
    toast.success("Sale Recorded & Logged!");
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
  };

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
                        onChange={(e) => {
                            setPatientQuery(e.target.value);
                            setShowPatientSuggestions(true);
                            if(selectedPatient) setSelectedPatient(null);
                        }}
                    />
                    {selectedPatient ? <button onClick={() => {setSelectedPatient(null); setPatientQuery("")}} className="p-3 text-green-600"><Check size={20} /></button> : <div className="p-3 text-gray-400"><Search size={20} /></div>}
                </div>

                {showPatientSuggestions && patientQuery && !selectedPatient && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map(p => (
                                <div key={p.id} onClick={() => selectPatient(p)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center group">
                                    <div><p className="font-bold text-gray-800 group-hover:text-[#073159]">{p.name}</p><p className="text-xs text-gray-500">{p.phone}</p></div>
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{p.type}</span>
                                </div>
                            ))
                        ) : <div className="p-4 text-center text-gray-400 text-sm">New patient detected.</div>}
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
                    placeholder="Search inventory..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#073159] focus:ring-2 focus:ring-blue-50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {(!searchQuery ? inventory : filteredDrugs).map((drug: any) => (
                    <div key={drug.id} onClick={() => addToCart(drug)} className="group flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 cursor-pointer transition-all active:scale-[0.99]">
                        <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-[#073159]">{drug.name}</h3>
                            <div className="flex gap-2 text-xs text-gray-500"><span>{drug.category}</span><span>•</span><span className={drug.stock < 20 ? "text-red-500 font-bold" : ""}>{drug.stock} left</span></div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[#073159]">₵{drug.price.toFixed(2)}</p>
                            <button className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm group-hover:bg-[#073159] group-hover:text-white transition-colors">Add</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-[#073159] text-white flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><ShoppingCart size={20} /> Current Sale</h2>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{cart.length} Items</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2"><ShoppingCart size={48} className="opacity-20" /><p className="text-xs">Cart is empty</p></div> : 
                    cart.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-in slide-in-from-bottom-2 fade-in">
                            <div className="flex-1"><h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4><p className="text-xs text-gray-500">@{item.price.toFixed(2)}</p></div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-gray-100 rounded-lg">
                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-red-500"><Minus size={14} /></button>
                                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-green-600"><Plus size={14} /></button>
                                </div>
                                <p className="font-bold text-sm text-[#073159] w-[60px] text-right">₵{(item.price * item.qty).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className="p-5 bg-white border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {["Cash", "MoMo", "Card"].map(method => (
                        <button key={method} onClick={() => setPaymentMethod(method)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${paymentMethod === method ? "bg-teal-50 border-teal-500 text-teal-700" : "border-gray-200 text-gray-500"}`}>{method}</button>
                    ))}
                </div>
                <div className="flex justify-between items-end mb-4"><span className="text-gray-500 font-medium">Total Payable</span><span className="text-3xl font-bold text-[#073159]">₵{calculateTotal().toFixed(2)}</span></div>
                <button onClick={handleCompleteSale} disabled={cart.length === 0} className="w-full py-4 bg-[#073159] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-[#062a4d] transition-all disabled:opacity-50">
                    <Save size={20} /> Complete Sale
                </button>
            </div>
        </div>
      </div>

      {/* --- RECEIPT MODAL --- */}
      {showReceipt && receiptData && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-200">
                  <div id="printable-receipt" className="p-8 bg-white text-gray-800 font-mono text-sm">
                      <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
                          <img src={logo} alt="Logo" className="h-10 mx-auto mb-2 grayscale" />
                          <h2 className="font-bold text-lg uppercase tracking-wide">UrbanVital Pharmacy</h2>
                          <p className="text-[10px] text-gray-500">Loc: Kejetia opp. Maternal Hospital</p>
                          <p className="text-[10px] text-gray-500">Tel: +233 59 792 7089</p>
                      </div>

                      <div className="mb-4 text-xs space-y-1">
                          <div className="flex justify-between"><span>Date:</span> <span>{receiptData.date} {receiptData.time}</span></div>
                          <div className="flex justify-between"><span>Receipt #:</span> <span>{receiptData.id}</span></div>
                          <div className="flex justify-between"><span>Customer:</span> <span className="font-bold">{receiptData.patient}</span></div>
                          <div className="flex justify-between"><span>Method:</span> <span>{receiptData.method}</span></div>
                      </div>

                      <table className="w-full mb-4 text-xs">
                          <thead className="border-b border-gray-300"><tr className="text-left"><th className="py-1">Item</th><th className="py-1 text-center">Qty</th><th className="py-1 text-right">Price</th></tr></thead>
                          <tbody>
                              {receiptData.cartItems.map((item: any, idx: number) => (
                                  <tr key={idx}><td className="py-1">{item.name}</td><td className="py-1 text-center">{item.qty}</td><td className="py-1 text-right">{item.price.toFixed(2)}</td></tr>
                              ))}
                          </tbody>
                      </table>

                      <div className="border-t border-dashed border-gray-300 pt-2 mb-4 flex justify-between text-lg font-bold">
                          <span>TOTAL</span><span>₵{receiptData.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-center text-[10px] text-gray-500">Thank you for your patronage!</p>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 no-print">
                      <button onClick={handleCloseReceipt} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Close</button>
                      <button onClick={handlePrint} className="flex-1 py-2.5 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2"><Printer size={18} /> Print</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}