import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle, 
  CalendarClock,
  MoreVertical
} from "lucide-react";
import ClinicianSidebar from "../../components/ClinicianSidebar";
import ClinicianNavbar from "../../components/ClinicianNavbar";

export default function ClinicianFollowUp() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Mock Data
  const followUps = [
    { id: 1, name: "Emmanuel Osei", reason: "Wound Dressing", date: "Today", time: "10:00 AM", phone: "054 555 1234", status: "Due" },
    { id: 2, name: "Sarah Mensah", reason: "BP Check / Review", date: "Today", time: "02:00 PM", phone: "020 999 8888", status: "Due" },
    { id: 3, name: "John Doe", reason: "Malaria Test Review", date: "Yesterday", time: "09:00 AM", phone: "024 111 2222", status: "Missed" },
  ];

  const filteredList = activeTab === "upcoming" 
    ? followUps.filter(f => f.status === "Due") 
    : followUps.filter(f => f.status === "Missed");

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <ClinicianSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClinicianNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-2">
                  <CalendarClock className="w-8 h-8 text-[#073159]" />
                  Patient Follow-Ups
                </h1>
                <p className="text-gray-500 mt-1">Manage return visits and scheduled reviews.</p>
              </div>
              <button className="bg-[#073159] text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 hover:bg-[#062a4d] transition-all flex items-center gap-2">
                <Calendar size={18} /> Schedule New
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button 
                onClick={() => setActiveTab("upcoming")}
                className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "upcoming" ? "border-[#073159] text-[#073159]" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Upcoming & Due
              </button>
              <button 
                onClick={() => setActiveTab("missed")}
                className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "missed" ? "border-red-500 text-red-500" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Missed Appointments <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">1</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 transition-transform hover:-translate-y-1">
                    
                    {/* Left: Info */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                        item.status === "Missed" ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#073159]"
                      }`}>
                        {item.date === "Today" ? "24" : "23"}
                        <span className="text-[10px] font-normal ml-0.5 mt-2">SEP</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                           <span className="font-medium text-[#073159]">{item.reason}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                      <button className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Phone size={16} /> Call
                      </button>
                      
                      {item.status === "Missed" ? (
                        <button className="flex-1 md:flex-none px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 flex items-center justify-center gap-2">
                           Reschedule
                        </button>
                      ) : (
                        <button className="flex-1 md:flex-none px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> Check In
                        </button>
                      )}
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={20} />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p>No appointments found in this tab.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}