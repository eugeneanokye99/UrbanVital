import { useState } from "react";
import { 
  X, 
  Share2, 
  Stethoscope, 
  TestTube, 
  Pill, 
  AlertTriangle, 
  User, 
  Calendar,
  Clock 
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // The record object
}

export default function VitalsSummaryModal({ isOpen, onClose, data }: ModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  // --- Forwarding Logic ---
  const handleForward = (destination: string) => {
    setLoading(destination);
    setTimeout(() => {
        setLoading(null);
        toast.success(`Vitals for ${data.patientName} forwarded to ${destination}!`);
        onClose();
    }, 1500);
  };

  // --- Helper to check abnormal values ---
  // Simple parsing since history data might be strings like "120/80"
  const isAbnormal = (label: string, value: string) => {
      if (!value) return false;
      const num = parseFloat(value);
      
      if (label === 'BP') {
          const [sys, dia] = value.split('/').map(Number);
          return sys > 140 || dia > 90;
      }
      if (label === 'Temp' && num > 37.5) return true;
      if (label === 'SpO2' && num < 95) return true;
      return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <div>
                <h2 className="text-xl font-bold text-[#073159]">Vitals Summary</h2>
                <p className="text-xs text-gray-500 flex gap-2 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {data.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {data.time}</span>
                </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Patient Info */}
            <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="h-12 w-12 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold">
                    <User size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{data.patientName}</h3>
                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-blue-100 text-blue-600">
                        {data.mrn}
                    </span>
                </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <VitalBox label="BP" value={data.bp} unit="mmHg" isAlert={isAbnormal('BP', data.bp)} />
                <VitalBox label="Pulse" value={data.pulse} unit="bpm" />
                <VitalBox label="Temp" value={data.temp} unit="°C" isAlert={isAbnormal('Temp', data.temp)} />
                <VitalBox label="SpO2" value={data.spo2} unit="%" isAlert={isAbnormal('SpO2', data.spo2)} />
                <VitalBox label="Resp" value={data.resp} unit="/min" />
                <VitalBox label="Weight" value={data.weight} unit="kg" />
            </div>

            {/* Notes if available (Mocking existence) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">Staff Notes</span>
                <p className="text-sm text-gray-700 italic">
                    {data.notes || "No specific observations recorded for this session."}
                </p>
                <p className="text-xs text-right text-gray-400 mt-2">— Recorded by {data.recordedBy}</p>
            </div>

            {/* Forward Actions */}
            <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Share2 size={16} /> Share / Forward To
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ForwardButton 
                        label="Doctor" 
                        icon={<Stethoscope size={18} />} 
                        loading={loading === "Doctor"} 
                        onClick={() => handleForward("Doctor")}
                        color="blue"
                    />
                    <ForwardButton 
                        label="Lab" 
                        icon={<TestTube size={18} />} 
                        loading={loading === "Lab"} 
                        onClick={() => handleForward("Lab")}
                        color="purple"
                    />
                    <ForwardButton 
                        label="Pharmacy" 
                        icon={<Pill size={18} />} 
                        loading={loading === "Pharmacy"} 
                        onClick={() => handleForward("Pharmacy")}
                        color="green"
                    />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- Sub-components for clean code ---

function VitalBox({ label, value, unit, isAlert }: any) {
    return (
        <div className={`p-3 rounded-xl border ${isAlert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
            <span className={`text-[10px] font-bold uppercase block mb-1 ${isAlert ? 'text-red-500' : 'text-gray-400'}`}>
                {label}
            </span>
            <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${isAlert ? 'text-red-700' : 'text-gray-800'}`}>
                    {value}
                </span>
                <span className="text-[10px] text-gray-500">{unit}</span>
                {isAlert && <AlertTriangle size={14} className="text-red-500" />}
            </div>
        </div>
    )
}

function ForwardButton({ label, icon, loading, onClick, color }: any) {
    // Map color prop to Tailwind classes
    const colors: any = {
        blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
        purple: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
        green: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
    };

    return (
        <button 
            onClick={onClick}
            disabled={loading}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all font-bold text-sm ${colors[color]} active:scale-95 disabled:opacity-50`}
        >
            {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
            {label}
        </button>
    )
}