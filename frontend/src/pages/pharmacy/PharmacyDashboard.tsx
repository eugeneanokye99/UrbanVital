import { useState } from "react";
import { 
  Pill, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  ShoppingBag,
} from "lucide-react";

export default function PharmacyDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  // Mock Prescriptions
  const prescriptions = [
    { 
      id: 1, 
      patient: "Williams Boampong", 
      mrn: "UV-2025-0421", 
      doctor: "Dr. Asante", 
      items: ["Paracetamol 1g", "Amoxicillin 500mg", "Multivitamin"],
      paymentStatus: "Paid", 
      dispenseStatus: "Pending",
      time: "10:45 AM"
    },
    { 
      id: 2, 
      patient: "Sarah Mensah", 
      mrn: "UV-2025-0422", 
      doctor: "Dr. Asante", 
      items: ["Artemether-Lumefantrine"],
      paymentStatus: "Unpaid", 
      dispenseStatus: "Pending",
      time: "10:30 AM"
    },
    { 
      id: 3, 
      patient: "Emmanuel Osei", 
      mrn: "UV-2025-0423", 
      doctor: "Dr. Mensah", 
      items: ["Atorvastatin 20mg"],
      paymentStatus: "Paid", 
      dispenseStatus: "Dispensed",
      time: "09:15 AM"
    },
    { 
      id: 4, 
      patient: "Ama Kyei", 
      mrn: "UV-2025-0424", 
      doctor: "Dr. Mensah", 
      items: ["Ciprofloxacin 500mg"],
      paymentStatus: "Paid", 
      dispenseStatus: "Pending",
      time: "08:45 AM"
    },
  ];

  // Filter Logic
  const filteredList = prescriptions.filter(p => {
    const matchesTab = activeTab === "pending" ? p.dispenseStatus === "Pending" : p.dispenseStatus === "Dispensed";
    const matchesSearch = p.patient.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header - Stacked on mobile, Row on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Pill className="w-6 h-6 sm:w-8 sm:h-8 text-[#073159]" />
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Manage prescriptions & stock.</p>
        </div>
        
        {/* Tabs - Full width on mobile */}
        <div className="flex w-full sm:w-auto bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button 
            onClick={() => setActiveTab("pending")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "pending" ? "bg-[#073159] text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === "history" ? "bg-[#073159] text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Search Bar - Responsive width */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-3 text-gray-400" size={18} />
        <input 
            type="text" 
            placeholder="Search patient or MRN..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#073159] outline-none shadow-sm text-sm"
        />
      </div>

      {/* Responsive Grid: 1 col mobile -> 2 col tablet -> 3 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredList.map((rx) => (
            <div key={rx.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                
                {/* Card Header */}
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

                {/* Rx Items */}
                <div className="p-4 sm:p-5 flex-1">
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase mb-2 sm:mb-3">Prescription ({rx.doctor})</p>
                    <ul className="space-y-1.5 sm:space-y-2">
                        {rx.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#073159] flex-shrink-0"></div>
                                <span className="truncate">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    {rx.dispenseStatus === "Pending" ? (
                        rx.paymentStatus === "Paid" ? (
                            <button className="bg-[#073159] text-white px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#062a4d] flex items-center gap-2 shadow-lg shadow-blue-900/10 w-full justify-center sm:w-auto active:scale-95 transition-transform">
                                <ShoppingBag size={14} /> Dispense
                            </button>
                        ) : (
                            <button disabled className="bg-gray-200 text-gray-400 px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 cursor-not-allowed w-full justify-center sm:w-auto">
                                <AlertCircle size={14} /> Awaiting Payment
                            </button>
                        )
                    ) : (
                        <button disabled className="text-green-600 font-bold text-xs sm:text-sm flex items-center gap-2 w-full justify-center sm:w-auto">
                            <CheckCircle size={16} /> Dispensed
                        </button>
                    )}
                </div>

            </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-20 opacity-50">
            <Pill size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No prescriptions found in this queue.</p>
        </div>
      )}

    </div>
  );
}