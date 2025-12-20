import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom"; 
import { 
  Pill, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye, 
} from "lucide-react";

interface PharmacyContextType {
    globalSearch: string;
    prescriptions?: any[]; // Receive global list
    markAsDispensed: (id: string) => void;
}

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // 1. Get Location for highlight state
  
  // 2. Get Global Data
  const { globalSearch, prescriptions } = useOutletContext<PharmacyContextType>(); 
  
  const [activeTab, setActiveTab] = useState("pending");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // 3. Highlighting Logic (From Alerts Page)
  useEffect(() => {
    if (location.state?.highlight) {
        // Search by patient name since alert message usually contains it
        const itemToHighlight = prescriptions?.find(p => 
            p.patient.toLowerCase().includes(location.state.highlight.toLowerCase())
        );

        if (itemToHighlight) {
            // Switch to the correct tab if needed
            if (itemToHighlight.dispenseStatus === "Dispensed") {
                setActiveTab("history");
            } else {
                setActiveTab("pending");
            }

            setHighlightedId(itemToHighlight.id);
            
            // Remove highlight after 3 seconds
            setTimeout(() => setHighlightedId(null), 3000);
        }
    }
  }, [location.state, prescriptions]);

  // 4. Filter Logic (Tab + Search)
  const filteredList = prescriptions?.filter(p => {
    // Tab Filter
    const matchesTab = activeTab === "pending" ? p.dispenseStatus === "Pending" : p.dispenseStatus === "Dispensed";
    
    // Search Filter (Global)
    const searchLower = globalSearch.toLowerCase();
    const matchesSearch = 
        p.patient.toLowerCase().includes(searchLower) || 
        p.mrn.toLowerCase().includes(searchLower) ||
        p.id.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  const handleReview = (rx: any) => {
    navigate("/pharmacy/prescription-review", { state: { prescription: rx } });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-[#073159]" />
            Pharmacy Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Overview of pending prescriptions.</p>
        </div>
        
        <div className="flex w-full sm:w-auto bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "pending" ? "bg-[#073159] text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Pending Queue
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "history" ? "bg-[#073159] text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredList?.map((rx) => {
            const isHighlighted = rx.id === highlightedId;

            return (
                <div 
                    key={rx.id} 
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-500 ${
                        isHighlighted 
                        ? "border-yellow-400 ring-2 ring-yellow-200 bg-yellow-50 transform scale-[1.02]" 
                        : "border-gray-100 hover:shadow-md"
                    }`}
                >
                    
                    {/* Header Section */}
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                        <div className="overflow-hidden pr-2">
                            <h3 className="font-bold text-base sm:text-lg text-[#073159] truncate">{rx.patient}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500">{rx.mrn}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            {rx.paymentStatus === "Paid" ? (
                                <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ml-auto w-fit">
                                    <CheckCircle size={10} /> Paid
                                </span>
                            ) : (
                                <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ml-auto w-fit">
                                    <XCircle size={10} /> Unpaid
                                </span>
                            )}
                            <span className="text-[10px] sm:text-xs text-gray-400 mt-1 block flex items-center justify-end gap-1">
                                <Clock size={10} /> {rx.time}
                            </span>
                        </div>
                    </div>

                    {/* Body: List of Drugs */}
                    <div className="p-4 sm:p-5 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Prescription ({rx.doctor})</p>
                        <ul className="space-y-1.5 sm:space-y-2">
                            {rx.items.slice(0, 3).map((item: string, i: number) => (
                                <li key={i} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#073159] flex-shrink-0"></div>
                                    <span className="truncate">{item}</span>
                                </li>
                            ))}
                            {rx.items.length > 3 && (
                                <li className="text-xs text-gray-400 italic pl-3">+ {rx.items.length - 3} more items...</li>
                            )}
                        </ul>
                    </div>

                    {/* Footer Action */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        {activeTab === "pending" ? (
                            <button 
                                onClick={() => handleReview(rx)}
                                className="bg-[#073159] text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#062a4d] flex items-center gap-2 shadow-lg shadow-blue-900/10 w-full justify-center active:scale-95 transition-all"
                            >
                                <Eye size={16} /> Review & Dispense
                            </button>
                        ) : (
                            <button disabled className="text-green-600 font-bold text-xs sm:text-sm flex items-center gap-2 w-full justify-center">
                                <CheckCircle size={16} /> Already Dispensed
                            </button>
                        )}
                    </div>

                </div>
            );
        })}
      </div>
      
      {filteredList?.length === 0 && (
        <div className="text-center py-20 opacity-50">
            <Pill size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No items found matching "{globalSearch}".</p>
        </div>
      )}

    </div>
  );
}