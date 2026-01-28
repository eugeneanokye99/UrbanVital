import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Save, Activity,
  Thermometer,
  Heart,
  Scale,
  Wind,
  ArrowLeft,
  Calculator,
  Droplets,
  Search,
  User,
  UserPlus,
  CheckCircle2,
  X,
  History
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchPatients } from "../../services/api"; 

// Mock data fallback
const MOCK_PATIENTS = [
    { id: 1, name: "Kwame Mensah", mrn: "PAT-001", gender: "Male", age: 34 },
    { id: 2, name: "Ama Osei", mrn: "PAT-002", gender: "Female", age: 28 },
];

export default function RecordVitals() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve passed patient (from dashboard click)
  const incomingPatient = location.state?.patient;

  // State
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Vitals Form State
  const [vitals, setVitals] = useState({
    walkInName: "",
    temperature: "",
    systolic: "",
    diastolic: "",
    pulse: "",
    respiratory_rate: "",
    weight: "",
    height: "",
    spo2: "",
    notes: ""
  });

  const [bmi, setBmi] = useState<string | null>(null);

  // --- EFFECT: Initialize with Dashboard Selection ---
  useEffect(() => {
    if (incomingPatient) {
        setSelectedPatient(incomingPatient);
        setIsWalkIn(false); // Ensure we are in Registered mode
    }
  }, [incomingPatient]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const search = async () => {
      if (searchTerm.length >= 1 && !selectedPatient && !isWalkIn) {
        try {
          // Attempt API fetch, fallback to mock
          let results = [];
          try { results = await fetchPatients(); } catch { results = MOCK_PATIENTS; }
          if (!results || !Array.isArray(results)) results = MOCK_PATIENTS;

          const lowerTerm = searchTerm.toLowerCase();
          const filtered = results.filter((p: any) => {
             const fullName = p.name || `${p.first_name} ${p.last_name}`;
             return (fullName.toLowerCase().includes(lowerTerm) || p.mrn?.toLowerCase().includes(lowerTerm));
          });
          setSearchResults(filtered.slice(0, 5));
        } catch (err) {
          console.error("Search error", err);
        }
      } else {
        setSearchResults([]);
      }
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedPatient, isWalkIn]);

  // Auto-Calculate BMI
  useEffect(() => {
    if (vitals.weight && vitals.height) {
      const h = parseFloat(vitals.height) / 100;
      const w = parseFloat(vitals.weight);
      if (h > 0 && w > 0) setBmi((w / (h * h)).toFixed(1));
      else setBmi(null);
    } else {
      setBmi(null);
    }
  }, [vitals.weight, vitals.height]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalkIn && !selectedPatient) return toast.error("Select a patient first.");
    if (isWalkIn && !vitals.walkInName) return toast.error("Enter walk-in name.");

    setLoading(true);
    const patientInfo = isWalkIn 
        ? { walkInName: vitals.walkInName, mrn: "WALK-IN", gender: "N/A" } 
        : selectedPatient;

    setTimeout(() => {
        setLoading(false);
        navigate("/phlebotomist/vitalssummary", { 
            state: { patient: patientInfo, vitals: vitals } 
        }); 
    }, 800);
  };

  // Helper Styles
  const getBmiColor = (val: string | null) => {
    if (!val) return "text-gray-400";
    const n = parseFloat(val);
    if (n < 18.5) return "text-blue-500";
    if (n < 25) return "text-green-500";
    if (n < 30) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Global History Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate("/phlebotomist/phlebotomistdashboard")} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-[#073159]">Record Vitals</h1>
                <p className="text-gray-500 text-sm">Select patient source below</p>
            </div>
        </div>

        {/* BUTTON 1: GLOBAL HISTORY (See all records) */}
        <button 
            type="button"
            onClick={() => navigate("/phlebotomist/vitalshistory")} 
            className="text-sm font-bold text-[#073159] bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
            <History size={18} /> All History
        </button>
      </div>

      {/* Selection Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        
        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit mb-4">
            <button 
                type="button"
                onClick={() => { setIsWalkIn(false); setSelectedPatient(null); setSearchTerm(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!isWalkIn ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
                <User size={16} /> Registered
            </button>
            <button 
                type="button"
                onClick={() => { setIsWalkIn(true); setSelectedPatient(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isWalkIn ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
                <UserPlus size={16} /> Walk-In
            </button>
        </div>

        {/* 1. REGISTERED SEARCH */}
        {!isWalkIn && !selectedPatient && (
            <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Name or MRN..." 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                {/* Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {searchResults.map((p) => (
                            <div key={p.id} onClick={() => { setSelectedPatient(p); setSearchTerm(""); }} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{p.name || `${p.first_name} ${p.last_name}`}</p>
                                    <p className="text-xs text-gray-500">{p.mrn}</p>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">Select</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* 2. SELECTED PATIENT CARD */}
        {!isWalkIn && selectedPatient && (
            <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-lg">
                        {(selectedPatient.name || "P").charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            {selectedPatient.name} <CheckCircle2 size={16} className="text-green-600" />
                        </h2>
                        <div className="flex gap-3 text-sm text-gray-500">
                            <span className="bg-white px-2 rounded border border-blue-100">{selectedPatient.mrn}</span>
                            <span>{selectedPatient.gender}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* BUTTON 2: PATIENT SPECIFIC HISTORY */}
                    <button 
                        onClick={() => navigate("/phlebotomist/vitalshistory", { state: { patient: selectedPatient } })}
                        className="p-2 hover:bg-white rounded-full text-[#073159] transition-colors flex items-center gap-1 group"
                        title="View Patient History"
                    >
                         <History size={20} />
                         <span className="text-xs font-bold hidden group-hover:inline">History</span>
                    </button>
                    
                    <div className="w-px h-6 bg-blue-200 mx-1"></div>

                    <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white rounded-full text-red-500 transition-colors" title="Remove Patient">
                        <X size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* 3. WALK-IN INPUT */}
        {isWalkIn && (
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guest Name</label>
                <input 
                    name="walkInName" 
                    value={vitals.walkInName} 
                    onChange={handleChange} 
                    placeholder="Enter full name..." 
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] font-bold text-gray-800"
                />
            </div>
        )}
      </div>

      {/* --- VITALS FORM --- */}
      {(selectedPatient || isWalkIn) && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Body Metrics */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-3"><Scale size={18}/> Body Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Weight (kg)" name="weight" value={vitals.weight} onChange={handleChange} placeholder="0.0" type="number" />
                    <InputGroup label="Height (cm)" name="height" value={vitals.height} onChange={handleChange} placeholder="0" type="number" />
                </div>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3">
                        <Calculator className="text-gray-400" size={20} />
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">BMI</p>
                            <p className={`text-lg font-bold ${getBmiColor(bmi)}`}>{bmi || "--.-"}</p>
                        </div>
                    </div>
                </div>
                <InputGroup label="Temperature (°C)" name="temperature" value={vitals.temperature} onChange={handleChange} icon={<Thermometer size={16}/>} placeholder="36.5" type="number" />
            </div>

            {/* Cardio */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b pb-3"><Heart size={18}/> Cardiovascular</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <InputGroup label="Systolic" name="systolic" value={vitals.systolic} onChange={handleChange} placeholder="120" type="number" />
                        <InputGroup label="Diastolic" name="diastolic" value={vitals.diastolic} onChange={handleChange} placeholder="80" type="number" />
                    </div>
                    <InputGroup label="Pulse (bpm)" name="pulse" value={vitals.pulse} onChange={handleChange} icon={<Activity size={16}/>} placeholder="72" type="number" />
                    <InputGroup label="SpO2 (%)" name="spo2" value={vitals.spo2} onChange={handleChange} icon={<Droplets size={16}/>} placeholder="98" type="number" />
                    <div className="col-span-2">
                        <InputGroup label="Respiratory Rate" name="respiratory_rate" value={vitals.respiratory_rate} onChange={handleChange} icon={<Wind size={16}/>} placeholder="16" type="number" />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-800 text-sm">Notes</h3>
                <textarea name="notes" value={vitals.notes} onChange={handleChange} placeholder="Observations..." className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] min-h-[100px] text-sm"></textarea>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-100">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl text-white font-bold text-sm bg-[#073159] hover:bg-[#062a4d] shadow-lg flex items-center gap-2">
                        {loading ? "Saving..." : <><Save size={18} /> Save Vitals</>}
                    </button>
                </div>
            </div>

          </form>
      )}
    </div>
  );
}

function InputGroup({ label, name, value, onChange, icon, placeholder, type = "text" }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
            <div className="relative">
                <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none focus:border-[#073159] font-medium transition-all" />
                <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">{icon}</div>
            </div>
        </div>
    )
}