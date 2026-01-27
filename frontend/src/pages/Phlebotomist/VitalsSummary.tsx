import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  TestTube, 
  Pill, 
  AlertTriangle,
  ArrowLeft,
  Share2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function VitalsSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patient, vitals } = location.state || {}; // Get data passed from previous page

  const [loading, setLoading] = useState<string | null>(null);

  // If accessed directly without data, go back
  if (!patient || !vitals) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500 mb-4">No vitals data found.</p>
        <button onClick={() => navigate("/phlebotomist/checkin")} className="text-blue-600 font-bold">Go to Queue</button>
      </div>
    );
  }

  // --- Mock Submission Logic ---
  const handleForward = (destination: string) => {
    setLoading(destination);
    setTimeout(() => {
        setLoading(null);
        toast.success(`Vitals forwarded to ${destination} successfully!`);
        navigate("/phlebotomist/dashboard");
    }, 1500);
  };

  // --- Helper to check abnormal values ---
  const isAbnormal = (label: string, value: string) => {
      const num = parseFloat(value);
      if (!num) return false;
      if (label === 'Systolic' && num > 140) return true;
      if (label === 'Diastolic' && num > 90) return true;
      if (label === 'Temp' && num > 37.5) return true;
      if (label === 'SpO2' && num < 95) return true;
      return false;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-[#073159]">Vitals Summary</h1>
            <p className="text-gray-500 text-sm">Review and forward patient data</p>
        </div>
      </div>

      {/* Patient Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#073159] text-white flex items-center justify-center text-xl font-bold">
                {(patient.name || patient.walkInName || "P").charAt(0)}
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-800">{patient.name || patient.walkInName}</h2>
                <div className="flex gap-3 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{patient.mrn || "WALK-IN"}</span>
                    <span>{patient.gender}</span>
                    <span>{patient.age ? `${patient.age} yrs` : ""}</span>
                </div>
            </div>
        </div>
        <div className="text-right">
            <span className="block text-xs text-gray-400 uppercase font-bold">Recorded At</span>
            <span className="font-mono text-sm font-bold text-gray-700">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VitalCard label="BP (mmHg)" value={`${vitals.systolic}/${vitals.diastolic}`} icon="❤️" isAlert={isAbnormal('Systolic', vitals.systolic)} />
        <VitalCard label="Pulse (bpm)" value={vitals.pulse} icon="💓" />
        <VitalCard label="Temp (°C)" value={vitals.temperature} icon="🌡️" isAlert={isAbnormal('Temp', vitals.temperature)} />
        <VitalCard label="SpO2 (%)" value={vitals.spo2} icon="💧" isAlert={isAbnormal('SpO2', vitals.spo2)} />
        <VitalCard label="Resp. Rate" value={vitals.respiratory_rate} icon="🌬️" />
        <VitalCard label="Weight (kg)" value={vitals.weight} icon="⚖️" />
        <VitalCard label="Height (cm)" value={vitals.height} icon="📏" />
        
        {/* Notes Section (Full Width) */}
        <div className="col-span-2 md:col-span-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">Observations</span>
            <p className="text-gray-700 text-sm italic">{vitals.notes || "No additional notes recorded."}</p>
        </div>
      </div>

      {/* --- Action Section: Forward To --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Share2 size={20} className="text-[#073159]" />
            Forward Patient To:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Doctor */}
            <button 
                onClick={() => handleForward("Consulting Room")}
                disabled={loading !== null}
                className="group relative p-6 bg-white border-2 border-transparent hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-3"
            >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Stethoscope size={20} />
                </div>
                <div>
                    <span className="block font-bold text-gray-800 group-hover:text-blue-700">General Doctor</span>
                    <span className="text-xs text-gray-500">For consultation & diagnosis</span>
                </div>
                {loading === "Consulting Room" && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}
            </button>

            {/* 2. Lab */}
            <button 
                onClick={() => handleForward("Laboratory")}
                disabled={loading !== null}
                className="group relative p-6 bg-white border-2 border-transparent hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-3"
            >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <TestTube size={20} />
                </div>
                <div>
                    <span className="block font-bold text-gray-800 group-hover:text-purple-700">Laboratory</span>
                    <span className="text-xs text-gray-500">For specimen collection</span>
                </div>
                {loading === "Laboratory" && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl"><div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>}
            </button>

            {/* 3. Pharmacy */}
            <button 
                onClick={() => handleForward("Pharmacy")}
                disabled={loading !== null}
                className="group relative p-6 bg-white border-2 border-transparent hover:border-green-500 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-3"
            >
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Pill size={20} />
                </div>
                <div>
                    <span className="block font-bold text-gray-800 group-hover:text-green-700">Pharmacy</span>
                    <span className="text-xs text-gray-500">For medication dispensing</span>
                </div>
                {loading === "Pharmacy" && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>}
            </button>

        </div>
      </div>

    </div>
  );
}

// --- Helper Card for Vitals ---
function VitalCard({ label, value, icon, isAlert = false }: any) {
    return (
        <div className={`p-4 rounded-xl border ${isAlert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} shadow-sm`}>
            <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold uppercase ${isAlert ? 'text-red-600' : 'text-gray-400'}`}>{label}</span>
                <span className="text-lg">{icon}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className={`text-xl font-bold ${isAlert ? 'text-red-700' : 'text-gray-800'}`}>
                    {value || "--"}
                </span>
                {isAlert && <AlertTriangle size={16} className="text-red-500 mb-1" />}
            </div>
        </div>
    )
}