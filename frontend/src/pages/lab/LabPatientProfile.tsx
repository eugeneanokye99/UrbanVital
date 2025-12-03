import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Droplet, 
  Dna, 
  Edit2, 
  Save, 
  History, 
  FileText,
  Activity
} from "lucide-react";
import LabSidebar from "../../components/LabSidebar";
import LabNavbar from "../../components/LabNavbar";

export default function LabPatientProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;

  // State for Editing "Permanent" Lab Data
  const [isEditing, setIsEditing] = useState(false);
  const [labData, setLabData] = useState({
    bloodGroup: patient?.bloodGroup || "",
    genotype: patient?.genotype || "",
    g6pd: "Normal",
    sickling: "Negative"
  });

  // Mock History
  const history = [
    { id: 1, test: "Full Blood Count", date: "24 Oct 2025", result: "Abnormal", tech: "Alex" },
    { id: 2, test: "Malaria RDT", date: "10 Sep 2025", result: "Negative", tech: "Sarah" },
    { id: 3, test: "Widal (Typhoid)", date: "10 Sep 2025", result: "Reactive 1:80", tech: "Sarah" },
  ];

  if (!patient) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <LabSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <LabNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:text-[#073159] mb-4 text-sm font-bold transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Database
            </button>

            {/* Header Card: Stack on Mobile, Row on Desktop */}
            <div className="bg-[#073159] text-white p-6 rounded-2xl shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/20 flex-shrink-0">
                        {patient.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">{patient.name}</h1>
                        <p className="text-blue-200 opacity-80 text-sm sm:text-base">{patient.mrn} • {patient.gender}, {patient.age} Years</p>
                    </div>
                </div>
                
                {/* Stats */}
                <div className="w-full sm:w-auto flex justify-between sm:block border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 sm:text-right">
                    <div>
                        <p className="text-xs uppercase font-bold text-blue-300">Total Tests</p>
                        <p className="text-2xl sm:text-3xl font-bold">14</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* --- LEFT: PERMANENT DATA --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Activity size={18} className="text-[#073159]" />
                                Bio-Lab Profile
                            </h3>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-xs font-bold text-[#073159] hover:underline flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm"
                            >
                                {isEditing ? <Save size={14}/> : <Edit2 size={14}/>}
                                {isEditing ? "Save" : "Edit"}
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Blood Group */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Blood Group</label>
                                {isEditing ? (
                                    <select 
                                        className="w-full p-2.5 border rounded-lg bg-blue-50 outline-none focus:border-[#073159]"
                                        value={labData.bloodGroup}
                                        onChange={(e) => setLabData({...labData, bloodGroup: e.target.value})}
                                    >
                                        <option value="--">Select...</option>
                                        <option value="O+">O Positive</option>
                                        <option value="O-">O Negative</option>
                                        <option value="A+">A Positive</option>
                                        <option value="AB+">AB Positive</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                        <Droplet className="text-red-500" size={20} />
                                        {labData.bloodGroup === "--" ? "Not Set" : labData.bloodGroup}
                                    </div>
                                )}
                            </div>

                            {/* Genotype */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Genotype</label>
                                {isEditing ? (
                                    <select 
                                        className="w-full p-2.5 border rounded-lg bg-blue-50 outline-none focus:border-[#073159]"
                                        value={labData.genotype}
                                        onChange={(e) => setLabData({...labData, genotype: e.target.value})}
                                    >
                                        <option value="--">Select...</option>
                                        <option value="AA">AA</option>
                                        <option value="AS">AS</option>
                                        <option value="SS">SS</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                        <Dna className="text-purple-500" size={20} />
                                        {labData.genotype === "--" ? "Not Set" : labData.genotype}
                                    </div>
                                )}
                            </div>

                            {/* Others - 1 col mobile, 2 col sm+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">G6PD</label>
                                    <p className="font-medium text-green-600 mt-1">{labData.g6pd}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Sickling</label>
                                    <p className="font-medium text-gray-800 mt-1">{labData.sickling}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: TEST HISTORY --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <History size={18} className="text-[#073159]" />
                            <h3 className="font-bold text-gray-800">Test History</h3>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {history.map((record) => (
                                <div key={record.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                    
                                    {/* Left: Test Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{record.test}</h4>
                                            <p className="text-xs text-gray-500">{record.date} • Tech: {record.tech}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Right: Status & Action */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            record.result === "Normal" || record.result === "Negative" 
                                            ? "bg-green-100 text-green-700" 
                                            : "bg-orange-100 text-orange-700"
                                        }`}>
                                            {record.result}
                                        </span>
                                        <button className="text-xs text-[#073159] font-bold mt-0 sm:mt-1 hover:underline">
                                            View Report
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 text-center">
                            <button className="text-sm font-bold text-[#073159] hover:underline">
                                Load Older Records
                            </button>
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