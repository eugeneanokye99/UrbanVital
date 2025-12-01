import { useState } from "react";
import { 
  User, 
  Clock, 
  Save, 
  Activity, 
  Thermometer, 
  Heart, 
  FileText 
} from "lucide-react";
import ClinicianSidebar from "../../components/ClinicianSidebar";
import ClinicianNavbar from "../../components/ClinicianNavbar";

export default function ClinicianConsulting() {
  const [activeTab, setActiveTab] = useState("notes"); // notes, history, labs

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <ClinicianSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClinicianNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            
            {/* --- LEFT: Waiting Queue --- */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#073159] mb-4 flex items-center gap-2">
                  <Clock size={18} /> Waiting Room (4)
                </h2>
                <div className="space-y-3">
                  {/* Active Patient Card */}
                  <div className="p-4 rounded-xl bg-[#073159] text-white shadow-lg cursor-pointer transform scale-[1.02]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">Williams Boampong</h3>
                      <span className="bg-white/20 text-xs px-2 py-0.5 rounded">Now</span>
                    </div>
                    <p className="text-blue-200 text-sm mb-2">Fever, Headache (3 Days)</p>
                    <div className="flex gap-2 text-xs font-mono opacity-80">
                      <span>BP: 120/80</span> • <span>Temp: 38.2°C</span>
                    </div>
                  </div>

                  {/* Waiting Patient Card */}
                  <div className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all bg-white">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800">Sarah Mensah</h3>
                      <span className="text-xs text-gray-500">10m wait</span>
                    </div>
                    <p className="text-gray-500 text-sm">General Checkup</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RIGHT: Active Consultation --- */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-[#073159] flex items-center justify-center font-bold">W</div>
                  <div>
                    <h2 className="font-bold text-lg text-[#073159]">Williams Boampong</h2>
                    <p className="text-xs text-gray-500">Male • 23 Yrs • UV-2025-0421</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 font-medium">History</button>
                   <button className="px-4 py-2 bg-[#073159] text-white text-sm rounded-lg hover:bg-[#062a4d] flex items-center gap-2 font-medium shadow-md">
                      <Save size={16} /> Save Visit
                   </button>
                </div>
              </div>

              {/* Consultation Form */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Vitals Summary (ReadOnly or Editable) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 text-red-600 mb-1"><Heart size={16}/> <span className="text-xs font-bold uppercase">Pulse</span></div>
                    <p className="font-bold text-xl text-gray-800">88 <span className="text-xs font-normal text-gray-500">bpm</span></p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-1"><Thermometer size={16}/> <span className="text-xs font-bold uppercase">Temp</span></div>
                    <p className="font-bold text-xl text-gray-800">38.2 <span className="text-xs font-normal text-gray-500">°C</span></p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1"><Activity size={16}/> <span className="text-xs font-bold uppercase">BP</span></div>
                    <p className="font-bold text-xl text-gray-800">120/80</p>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chief Complaint & History</label>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#073159] outline-none min-h-[100px] text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Patient complains of..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis</label>
                    <input 
                      type="text"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="e.g. Malaria, Acute Gastritis"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Prescription & Plan</label>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#073159] outline-none min-h-[100px] text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Rx: Paracetamol 500mg..."
                    ></textarea>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                     <input type="checkbox" id="admit" className="w-4 h-4 text-[#073159] rounded border-gray-300 focus:ring-[#073159]" />
                     <label htmlFor="admit" className="text-sm text-gray-700 font-medium">Admit Patient</label>
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