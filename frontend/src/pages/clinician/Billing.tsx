import { 
  CreditCard, 
  Plus, 
  History, 
  DollarSign, 
  FileText,
  Search
} from "lucide-react";
import ClinicianSidebar from "../../components/ClinicianSidebar";
import ClinicianNavbar from "../../components/ClinicianNavbar";

export default function ClinicianBilling() {
  //const [activeTab, setActiveTab] = useState("add"); // add or history

  // Mock Data
  const recentCharges = [
    { id: 101, patient: "Williams Boampong", service: "Detention / Observation", amount: 150.00, status: "Pending", time: "10:30 AM" },
    { id: 102, patient: "Sarah Mensah", service: "Wound Dressing (Large)", amount: 80.00, status: "Paid", time: "09:15 AM" },
    { id: 103, patient: "Emmanuel Osei", service: "General Consultation", amount: 100.00, status: "Paid", time: "08:45 AM" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <ClinicianSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClinicianNavbar />
        
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

                  <form className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient Name / MRN</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search patient..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Type</label>
                      <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none cursor-pointer text-sm">
                        <option>General Consultation</option>
                        <option>Specialist Review</option>
                        <option>Wound Dressing</option>
                        <option>Suturing</option>
                        <option>Home Visit</option>
                        <option>Detention (Per Hour)</option>
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
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes (Optional)</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all text-sm"
                        placeholder="Additional details for cashier..."
                      ></textarea>
                    </div>

                    <button className="w-full bg-[#073159] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#062a4d] transition-transform active:scale-95 text-sm md:text-base">
                      Add to Invoice
                    </button>
                  </form>
                </div>
              </div>

              {/* --- RIGHT: Recent History --- */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Stats Cards: Stack on mobile, grid on tablet+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg"><DollarSign size={20}/></div>
                    <div>
                      <p className="text-xs text-green-800 font-bold uppercase">Total Billed Today</p>
                      <p className="text-xl font-bold text-green-900">₵ 330.00</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><FileText size={20}/></div>
                    <div>
                      <p className="text-xs text-blue-800 font-bold uppercase">Items Added</p>
                      <p className="text-xl font-bold text-blue-900">3</p>
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                    <History className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-gray-700 text-sm">Today's Transactions</h3>
                  </div>
                  
                  {/* Responsive Table Wrapper */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                          <th className="px-6 py-3">Time</th>
                          <th className="px-6 py-3">Patient</th>
                          <th className="px-6 py-3">Service</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {recentCharges.map((charge) => (
                          <tr key={charge.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{charge.time}</td>
                            <td className="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">{charge.patient}</td>
                            <td className="px-6 py-3 text-gray-600">{charge.service}</td>
                            <td className="px-6 py-3 font-bold text-gray-800">₵{charge.amount.toFixed(2)}</td>
                            <td className="px-6 py-3 text-right whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                charge.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {charge.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}