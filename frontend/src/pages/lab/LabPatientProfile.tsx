import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Droplet, 
  Dna, 
  Edit2, 
  Save, 
  History, 
  Activity,
  Calendar,
  Clock,
  ChevronDown
} from "lucide-react";

export default function LabPatientProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient;

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3); // Start by showing 3 records
  const [labData, setLabData] = useState({
    bloodGroup: patient?.bloodGroup || "",
    genotype: patient?.genotype || "",
    g6pd: "Normal",
    sickling: "Negative"
  });

  // --- MOCK HISTORY DATA (Expanded) ---
  const history = [
    { id: "REQ-1092", test: "Full Blood Count", date: "24 Oct 2025", time: "10:30 AM", result: "Abnormal", tech: "Alex" },
    { id: "REQ-1088", test: "Malaria RDT", date: "10 Sep 2025", time: "09:15 AM", result: "Negative", tech: "Sarah" },
    { id: "REQ-1085", test: "Widal (Typhoid)", date: "10 Sep 2025", time: "09:15 AM", result: "Reactive 1:80", tech: "Sarah" },
    { id: "REQ-1040", test: "Urinalysis", date: "12 Jan 2025", time: "02:45 PM", result: "Normal", tech: "Kofi" },
    { id: "REQ-1035", test: "Lipid Profile", date: "05 Dec 2024", time: "08:30 AM", result: "High Chol.", tech: "Alex" },
    { id: "REQ-1011", test: "Fasting Blood Sugar", date: "11 Nov 2024", time: "07:00 AM", result: "5.4 mmol/L", tech: "Sarah" },
    { id: "REQ-0998", test: "Hepatitis B Profile", date: "01 Oct 2024", time: "11:20 AM", result: "Negative", tech: "Kofi" },
  ];

  const handleViewReport = (record: any) => {
    // Pass both the specific record AND the patient bio-data
    navigate("/lab/labresult-view", { state: { record, patient } });
  };

  // --- HANDLER ---
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3); // Load 3 more at a time
  };

  if (!patient) return <div className="p-8 text-center text-gray-500">Patient data not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-[#073159] text-sm font-bold transition-colors w-fit"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Database
      </button>

      {/* Header Card */}
      <div className="bg-[#073159] text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/20 flex-shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold break-words">{patient.name}</h1>
            <p className="text-blue-200 opacity-80 text-sm sm:text-base">{patient.mrn} • {patient.gender}, {patient.age} Years</p>
          </div>
        </div>
        
        {/* Admin Stats */}
        <div className="w-full sm:w-auto flex justify-between sm:block border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0 sm:text-right">
          <div>
            <p className="text-xs uppercase font-bold text-blue-300">Total Lab Visits</p>
            <p className="text-2xl sm:text-3xl font-bold">{history.length}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* --- LEFT: PERMANENT BIO-DATA --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                <Activity size={18} className="text-[#073159]" />
                Bio-Lab Profile
              </h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-[#073159] hover:underline flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm hover:shadow-md transition-all"
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
                    className="w-full p-2.5 border rounded-lg bg-blue-50 outline-none focus:border-[#073159] text-sm"
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
                    {labData.bloodGroup === "--" || !labData.bloodGroup ? "Not Set" : labData.bloodGroup}
                  </div>
                )}
              </div>

              {/* Genotype */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Genotype</label>
                {isEditing ? (
                  <select 
                    className="w-full p-2.5 border rounded-lg bg-blue-50 outline-none focus:border-[#073159] text-sm"
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
                    {labData.genotype === "--" || !labData.genotype ? "Not Set" : labData.genotype}
                  </div>
                )}
              </div>

              {/* Other Data */}
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

          {/* Visit Frequency */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-800 text-sm mb-3">Visit Summary</h3>
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">First Visit:</span>
                    <span className="font-medium">{history[history.length - 1].date}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Visit:</span>
                    <span className="font-medium">{history[0].date}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg. Visits/Year:</span>
                    <span className="font-medium">4</span>
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT: TEST LOGS (HISTORY) --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <History size={18} className="text-[#073159]" />
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Lab Work Log</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {/* Slice the history array based on visibleCount */}
              {history.slice(0, visibleCount).map((record) => (
                <div key={record.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between hover:bg-gray-50 transition-colors gap-4 group">
                  
                  {/* Date & Time */}
                  <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 text-xs text-gray-500 min-w-[100px]">
                     <div className="flex items-center gap-1 font-bold text-gray-700">
                        <Calendar size={14} /> {record.date}
                     </div>
                     <div className="flex items-center gap-1">
                        <Clock size={14} /> {record.time}
                     </div>
                  </div>

                  {/* Test Details */}
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-[#073159] text-sm">{record.test}</h4>
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{record.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                         <span className="text-gray-500">Result:</span>
                         <span className={`font-bold ${
                            record.result === "Normal" || record.result === "Negative" 
                            ? "text-green-600" 
                            : "text-orange-600"
                         }`}>
                            {record.result}
                         </span>
                      </div>
                  </div>
                  
{/* Tech & Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <p className="text-xs text-gray-400">Tech: {record.tech}</p>
                    
                    {/* UPDATED BUTTON */}
                    <button 
                      onClick={() => handleViewReport(record)}
                      className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    >
                      View Full Report
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
            
            {/* Functional Load More Button */}
            {visibleCount < history.length && (
              <div className="p-4 border-t border-gray-100 text-center bg-gray-50/30">
                <button 
                  onClick={handleLoadMore}
                  className="text-sm font-bold text-[#073159] hover:text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                  <ChevronDown size={16} /> Load Older Records
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}