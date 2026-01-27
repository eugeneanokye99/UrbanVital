import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Activity, 
  Thermometer, 
  Heart, 
  Wind,
  Search,
  User,
  ChevronRight
} from "lucide-react";
import VitalsSummaryModal from "../../components/VitalsSummaryModal"; // Adjust path as needed

// Mock Data
const MOCK_HISTORY = [
  { id: 1, patientName: "Kwame Mensah", mrn: "PAT-001", date: "2023-10-25", time: "09:30 AM", bp: "145/95", pulse: "72", temp: "36.5", spo2: "98", resp: "16", weight: "70.5", recordedBy: "Nurse Ama", notes: "Patient complained of slight headache." },
  { id: 2, patientName: "Ama Osei", mrn: "PAT-002", date: "2023-10-25", time: "10:15 AM", bp: "110/70", pulse: "68", temp: "38.2", spo2: "99", resp: "18", weight: "62.0", recordedBy: "Nurse John", notes: "High temp observed." },
  { id: 3, patientName: "Kwame Mensah", mrn: "PAT-001", date: "2023-09-12", time: "02:15 PM", bp: "125/82", pulse: "75", temp: "36.7", spo2: "99", resp: "18", weight: "71.0", recordedBy: "Nurse John" },
  { id: 4, patientName: "Sarah Smith", mrn: "PAT-004", date: "2023-08-05", time: "10:00 AM", bp: "118/78", pulse: "70", temp: "36.4", spo2: "98", resp: "16", weight: "70.2", recordedBy: "Nurse Ama" },
];

export default function VitalsHistory() {
  const navigate = useNavigate();
  
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- Modal State ---
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setHistory(MOCK_HISTORY); 
      setFilteredHistory(MOCK_HISTORY);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
        setFilteredHistory(history);
    } else {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = history.filter(record => 
            record.patientName.toLowerCase().includes(lowerTerm) ||
            record.mrn.toLowerCase().includes(lowerTerm) ||
            record.date.includes(lowerTerm)
        );
        setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-[#073159]">Vitals History Log</h1>
                <p className="text-gray-500 text-sm">All recorded vitals across all patients</p>
            </div>
        </div>

        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, MRN, or date..." 
                className="w-full pl-10 p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#073159] transition-all"
            />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
            <div className="p-12 text-center text-gray-500">Loading history...</div>
        ) : filteredHistory.length > 0 ? (
            filteredHistory.map((record) => (
                <div 
                    key={record.id} 
                    onClick={() => setSelectedRecord(record)} // Open Modal on Click
                    className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative"
                >
                    
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 border-b border-gray-50 pb-3 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 text-[#073159] flex items-center justify-center font-bold group-hover:bg-[#073159] group-hover:text-white transition-colors">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-[#073159]">{record.patientName}</h3>
                                <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">{record.mrn}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 font-bold text-gray-600">
                                <Calendar size={16} /> {record.date}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <Clock size={16} /> {record.time}
                            </div>
                        </div>
                    </div>

                    {/* Quick Metrics Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <MetricItem label="BP" value={record.bp} unit="mmHg" icon={<Heart size={14} className="text-red-500" />} />
                        <MetricItem label="Pulse" value={record.pulse} unit="bpm" icon={<Activity size={14} className="text-red-500" />} />
                        <MetricItem label="Temp" value={record.temp} unit="°C" icon={<Thermometer size={14} className="text-orange-500" />} />
                        <div className="hidden md:block"><MetricItem label="SpO2" value={record.spo2} unit="%" icon={<Activity size={14} className="text-blue-500" />} /></div>
                        <div className="hidden md:block"><MetricItem label="Resp" value={record.resp} unit="/min" icon={<Wind size={14} className="text-gray-500" />} /></div>
                        <div className="hidden md:block"><MetricItem label="Weight" value={record.weight} unit="kg" icon={<Activity size={14} className="text-gray-500" />} /></div>
                    </div>
                    
                    {/* Hover Hint */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        <ChevronRight className="text-gray-300" size={24} />
                    </div>
                </div>
            ))
        ) : (
            <div className="p-10 text-center bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 font-medium">No records found matching your search.</p>
            </div>
        )}
      </div>

      {/* --- MODAL COMPONENT --- */}
      <VitalsSummaryModal 
        isOpen={!!selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        data={selectedRecord} 
      />

    </div>
  );
}

// Helper Component
function MetricItem({ label, value, unit, icon }: any) {
    return (
        <div className="flex flex-col p-2 bg-gray-50/50 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                {icon} {label}
            </span>
            <span className="text-base font-bold text-gray-800">
                {value || "--"} <span className="text-[10px] font-normal text-gray-500">{unit}</span>
            </span>
        </div>
    )
}