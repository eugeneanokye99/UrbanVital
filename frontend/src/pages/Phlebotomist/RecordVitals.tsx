import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Save, Activity, Thermometer, Heart,
  Scale,
  Wind,
  ArrowLeft,
  Calculator,
  Droplets,
  Search,
  User,
  UserPlus,
  CheckCircle2,
  History // Imported History Icon
} from "lucide-react";
import { toast } from "react-hot-toast";
// Import API (Optional: kept for real integration)
import { fetchPatients } from "../../services/api"; 

// --- MOCK DATA FOR TESTING SEARCH ---
const MOCK_PATIENTS = [
    { id: 1, name: "Kwame Mensah", mrn: "PAT-001", gender: "Male", age: 34 },
    { id: 2, name: "Ama Osei", mrn: "PAT-002", gender: "Female", age: 28 },
    { id: 3, name: "John Doe", mrn: "PAT-003", gender: "Male", age: 45 },
    { id: 4, name: "Sarah Smith", mrn: "PAT-004", gender: "Female", age: 62 },
    { id: 5, name: "Kojo Antwi", mrn: "PAT-005", gender: "Male", age: 19 },
];

export default function RecordVitals() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Determine Mode (Walk-In vs Registered)
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(location.state?.patient || null);
  const [isSearching, setIsSearching] = useState(false);

  // 2. Vitals State
  const [loading, setLoading] = useState(false);
  const [vitals, setVitals] = useState({
    walkInName: "", // For walk-ins
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

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const search = async () => {
      // Only search if typing, no patient selected, and NOT in walk-in mode
      if (searchTerm.length >= 1 && !selectedPatient && !isWalkIn) {
        setIsSearching(true);
        try {
          // 1. Try real API first
          let results = [];
          try {
             results = await fetchPatients(); 
          } catch (e) {
             console.warn("API failed, using mock data");
             results = MOCK_PATIENTS; 
          }

          if (!results || !Array.isArray(results)) results = MOCK_PATIENTS;

          // 2. Filter results locally
          const lowerTerm = searchTerm.toLowerCase();
          const filtered = results.filter((p: any) => {
             const fullName = p.name || `${p.first_name} ${p.last_name}`;
             return (
               fullName.toLowerCase().includes(lowerTerm) || 
               p.mrn?.toLowerCase().includes(lowerTerm)
             );
          });

          setSearchResults(filtered.slice(0, 5));
        } catch (err) {
          console.error("Search failed completely", err);
          setSearchResults([]); 
        } finally {
          setIsSearching(false);
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
      const heightInMeters = parseFloat(vitals.height) / 100; 
      const weightInKg = parseFloat(vitals.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const calculatedBmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setBmi(calculatedBmi);
      } else {
        setBmi(null);
      }
    } else {
      setBmi(null);
    }
  }, [vitals.weight, vitals.height]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchTerm("");
    setSearchResults([]);
  };

  const clearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isWalkIn && !selectedPatient) {
        toast.error("Please select a patient first.");
        return;
    }
    if (isWalkIn && !vitals.walkInName) {
        toast.error("Please enter the walk-in patient's name.");
        return;
    }

    setLoading(true);

    // Prepare data to pass
    const patientInfo = isWalkIn 
        ? { walkInName: vitals.walkInName, mrn: "WALK-IN", gender: "N/A" } 
        : selectedPatient;
            
    setTimeout(() => {
        setLoading(false);
        // Navigate to Summary page
        navigate("/phlebotomist/vitalssummary", { 
            state: { 
                patient: patientInfo,
                vitals: vitals 
            } 
        }); 
    }, 800);
  };

  // Helper colors
  const getBmiColor = (val: string | null) => {
    if (!val) return "text-gray-400";
    const num = parseFloat(val);
    if (num < 18.5) return "text-blue-500 font-bold";
    if (num >= 18.5 && num < 25) return "text-green-500 font-bold";
    if (num >= 25 && num < 30) return "text-orange-500 font-bold";
    return "text-red-500 font-bold";
  };

  const getBmiLabel = (val: string | null) => {
    if (!val) return "N/A";
    const num = parseFloat(val);
    if (num < 18.5) return "Underweight";
    if (num >= 18.5 && num < 25) return "Normal";
    if (num >= 25 && num < 30) return "Overweight";
    return "Obese";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>Record Vitals</h1>
                <p className="text-gray-500 text-sm">Select a patient or enter walk-in details</p>
            </div>
        </div>
                        <div className="flex items-center gap-3">
                    {/* --- NEW HISTORY LINK HERE --- */}
                    <button 
                        type="button"
                        onClick={() => navigate("/phlebotomist/vitalshistory", { state: { patient: selectedPatient } })}
                        className="text-sm font-bold text-[#073159] hover:bg-white hover:shadow-sm px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                        <History size={16} /> 
                        See Vitals History
                    </button>
                </div>
      </div>

      {/* --- Patient Selection Section --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        
        {/* Toggle Mode */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit mb-4">
            <button 
                type="button"
                onClick={() => { setIsWalkIn(false); clearSelection(); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!isWalkIn ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <User size={16} /> Registered Patient
            </button>
            <button 
                type="button"
                onClick={() => { setIsWalkIn(true); clearSelection(); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isWalkIn ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <UserPlus size={16} /> Walk-In Customer
            </button>
        </div>

        {/* REGISTERED MODE: Search Input */}
        {!isWalkIn && !selectedPatient && (
            <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search patient by Name or MRN..." 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {searchResults.map((p) => (
                            <div 
                                key={p.id} 
                                onClick={() => handleSelectPatient(p)}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-bold text-gray-800">{p.name || `${p.first_name} ${p.last_name}`}</p>
                                    <p className="text-xs text-gray-500">{p.mrn}</p>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">Select</span>
                            </div>
                        ))}
                    </div>
                )}
                {isSearching && <p className="text-xs text-gray-400 mt-2 ml-2">Searching...</p>}
            </div>
        )}

        {/* REGISTERED MODE: Selected Patient Card */}
        {!isWalkIn && selectedPatient && (
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--primary)' }}>
                        {(selectedPatient.name || selectedPatient.first_name || "P").charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            {selectedPatient.name || `${selectedPatient.first_name} ${selectedPatient.last_name}`}
                            <CheckCircle2 size={16} className="text-green-600" />
                        </h2>
                        <div className="flex gap-3 text-sm text-gray-500">
                            <span>MRN: {selectedPatient.mrn}</span>
                            <span>•</span>
                            <span>{selectedPatient.gender || "N/A"}</span>
                        </div>
                    </div>
                </div>


            </div>
        )}

        {/* WALK-IN MODE: Name Input */}
        {isWalkIn && (
            <div className="animate-in fade-in">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Walk-In Patient Name</label>
                <input 
                    type="text"
                    name="walkInName"
                    value={vitals.walkInName}
                    onChange={handleChange}
                    placeholder="Enter full name of patient..."
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 font-bold text-gray-800"
                />
            </div>
        )}
      </div>

      {/* --- Vitals Form (Only show if ready) --- */}
      {(selectedPatient || isWalkIn) && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* SECTION 1: Body Metrics */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Scale size={18} className="text-gray-400" /> Body Metrics
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup 
                        label="Weight (kg)" 
                        name="weight" 
                        value={vitals.weight} 
                        onChange={handleChange} 
                        icon={<span className="text-xs font-bold text-gray-400">kg</span>}
                        placeholder="0.0"
                        type="number"
                    />
                    <InputGroup 
                        label="Height (cm)" 
                        name="height" 
                        value={vitals.height} 
                        onChange={handleChange} 
                        icon={<span className="text-xs font-bold text-gray-400">cm</span>}
                        placeholder="0"
                        type="number"
                    />
                </div>

                {/* BMI Display */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">BMI Score</p>
                            <p className={`text-lg ${getBmiColor(bmi)}`}>{bmi || "--.-"}</p>
                        </div>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white border border-gray-100 ${getBmiColor(bmi)}`}>
                        {getBmiLabel(bmi)}
                    </span>
                </div>

                <InputGroup 
                    label="Temperature (°C)" 
                    name="temperature" 
                    value={vitals.temperature} 
                    onChange={handleChange} 
                    icon={<Thermometer size={16} className="text-gray-400" />}
                    placeholder="36.5"
                    type="number"
                />
            </div>

            {/* SECTION 2: Cardiovascular */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Heart size={18} className="text-gray-400" /> Cardiovascular
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <InputGroup 
                            label="Systolic (mmHg)" 
                            name="systolic" 
                            value={vitals.systolic} 
                            onChange={handleChange} 
                            placeholder="120"
                            type="number"
                        />
                        <InputGroup 
                            label="Diastolic (mmHg)" 
                            name="diastolic" 
                            value={vitals.diastolic} 
                            onChange={handleChange} 
                            placeholder="80"
                            type="number"
                        />
                    </div>
                    <InputGroup 
                        label="Pulse (bpm)" 
                        name="pulse" 
                        value={vitals.pulse} 
                        onChange={handleChange} 
                        icon={<Activity size={16} className="text-gray-400" />}
                        placeholder="72"
                        type="number"
                    />
                    <InputGroup 
                        label="SpO2 (%)" 
                        name="spo2" 
                        value={vitals.spo2} 
                        onChange={handleChange} 
                        icon={<Droplets size={16} className="text-gray-400" />}
                        placeholder="98"
                        type="number"
                    />
                    <div className="col-span-2">
                        <InputGroup 
                            label="Respiratory Rate" 
                            name="respiratory_rate" 
                            value={vitals.respiratory_rate} 
                            onChange={handleChange} 
                            icon={<Wind size={16} className="text-gray-400" />}
                            placeholder="16"
                            type="number"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 3: Notes & Actions */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-800 text-sm">Observations / Notes</h3>
                <textarea 
                    name="notes"
                    value={vitals.notes}
                    onChange={handleChange}
                    placeholder="Enter any additional observations about the patient's condition..."
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 min-h-[100px] resize-none text-sm transition-colors"
                ></textarea>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-70"
                        style={{ backgroundColor: 'var(--primary)' }}
                    >
                        {loading ? "Saving..." : <><Save size={18} /> Save Vitals</>}
                    </button>
                </div>
            </div>

          </form>
      )}
    </div>
  );
}

// --- Reusable Input Component ---
interface InputGroupProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
    placeholder?: string;
    type?: string;
}

function InputGroup({ label, name, value, onChange, icon, placeholder, type = "text" }: InputGroupProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
            <div className="relative">
                <input 
                    type={type} 
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 font-medium transition-all"
                />
                <div className="absolute right-3 top-3.5 pointer-events-none">
                    {icon}
                </div>
            </div>
        </div>
    )
}