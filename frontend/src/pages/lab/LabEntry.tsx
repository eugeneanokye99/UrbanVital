import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import { 
  Plus, 
  FileText, 
  Microscope,
  CheckCircle,
  X,
  User,
  Search,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- Mock Data ---
const TEST_CATEGORIES = [
  "Hematology", "Biochemistry", "Parasitology", "Serology", "Immunology", "Microbiology"
];

const LAB_TESTS: Record<string, string[]> = {
  "Hematology": ["Full Blood Count", "Blood Grouping", "Sickling Test", "HB Electrophoresis", "G6PD"],
  "Parasitology": ["Malaria Test (Blood Film)", "Malaria RDT"],
  "Biochemistry": ["Lipid Panel", "Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Fasting Blood Sugar", "Random Blood Sugar"],
  "Microbiology": ["Urine Routine Exam", "Stool Routine Exam"],
  "Serology": ["Typhoid (IgM/IgG)", "H. Pylori", "Hepatitis B", "Hepatitis B Profile", "VDRL (Syphilis)", "Chlamydia"],
  "Immunology": ["HIV / Retro Screening", "Pregnancy Test", "Gonorrhea"]
};

const MOCK_PATIENTS = [
  { id: "UV-2025-0421", name: "Williams Boampong", age: 23, gender: "Male" },
  { id: "UV-2025-0422", name: "Sarah Mensah", age: 45, gender: "Female" },
  { id: "UV-2025-0423", name: "Emmanuel Osei", age: 31, gender: "Male" },
  { id: "UV-2025-0424", name: "Ama Kyei", age: 28, gender: "Female" },
];

export default function LabResultEntry() {
  const location = useLocation();

  // --- State ---
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  const [reportItems, setReportItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  // --- AUTO-SELECT LOGIC ---
  useEffect(() => {
    if (location.state) {
        const { patient, testToSelect } = location.state;

        if (patient) {
            const fullPatient = MOCK_PATIENTS.find(p => p.id === patient.id) || patient;
            setSelectedPatient(fullPatient);
        }

        if (testToSelect) {
            let foundCategory = "";
            for (const [category, tests] of Object.entries(LAB_TESTS)) {
                if (tests.includes(testToSelect)) {
                    foundCategory = category;
                    break;
                }
            }
            if (foundCategory) {
                setSelectedCategory(foundCategory);
                setSelectedTest(testToSelect);
            }
        }
    }
  }, [location.state]);

  // --- Handlers ---
  const handleAddToReport = () => {
    if (!selectedTest) return toast.error("Please select a test");
    if (!formData.result && Object.keys(formData).length === 0) return toast.error("Please enter a result");
    
    let resultSummary = "";
    if (formData.result) {
        resultSummary = formData.result;
    } else {
        resultSummary = "See detailed parameters below"; 
    }

    const newItem = {
      id: Date.now(),
      category: selectedCategory,
      testName: selectedTest,
      results: { ...formData },
      summary: resultSummary
    };

    setReportItems([...reportItems, newItem]);
    setFormData({});
    toast.success(`${selectedTest} added to session`);
  };

  const handleRemoveFromReport = (id: number) => {
    setReportItems(reportItems.filter(i => i.id !== id));
  };

  const handleFinalizeReport = () => {
    if (reportItems.length === 0) return;
    toast.success("Report Generated & Saved Successfully!");
    setReportItems([]);
    setSelectedPatient(null);
    setFormData({});
    setSelectedTest("");
    setSelectedCategory("");
  };

  const handleCreateCategory = () => {
    if(newCategory) {
        TEST_CATEGORIES.push(newCategory);
        toast.success(`Category "${newCategory}" created`);
        setNewCategory("");
        setIsCategoryModalOpen(false);
    }
  };

  // Switch Patient Handler (Resets session only if a NEW patient is chosen)
  const handleSwitchPatient = (newPatient: any) => {
      if (selectedPatient?.id !== newPatient.id) {
          setReportItems([]); // Clear previous patient's data
          setFormData({});
      }
      setSelectedPatient(newPatient);
      setIsPatientModalOpen(false);
      setPatientSearch("");
  };

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // --- Dynamic Form Renderer ---
  const renderParameters = () => {
    const binaryTests = [
      "Malaria RDT", "H. Pylori", "Hepatitis B", "Gonorrhea", 
      "Pregnancy Test", "VDRL (Syphilis)", "HIV / Retro Screening", "Chlamydia"
    ];

    if (binaryTests.includes(selectedTest)) {
      return (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Result</label>
          <select 
            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] bg-white transition-all"
            onChange={(e) => setFormData({ result: e.target.value })}
            value={formData.result || ""}
          >
             <option value="">Select Result...</option>
             <option value="Negative">Negative (-)</option>
             <option value="Positive">Positive (+)</option>
          </select>
        </div>
      );
    }

    if (selectedTest === "Full Blood Count") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <ResultInput label="Hemoglobin (Hb)" unit="g/dL" onChange={(v:any) => setFormData({...formData, hb: v})} />
           <ResultInput label="WBC" unit="x10^9/L" onChange={(v:any) => setFormData({...formData, wbc: v})} />
           <ResultInput label="Platelets" unit="x10^9/L" onChange={(v:any) => setFormData({...formData, plt: v})} />
           <ResultInput label="Neutrophils" unit="%" onChange={(v:any) => setFormData({...formData, neut: v})} />
           <ResultInput label="Lymphocytes" unit="%" onChange={(v:any) => setFormData({...formData, lymph: v})} />
        </div>
      );
    }

    if (selectedTest === "Lipid Panel") {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <ResultInput label="Total Cholesterol" unit="mmol/L" onChange={(v:any) => setFormData({...formData, chol: v})} />
             <ResultInput label="Triglycerides" unit="mmol/L" onChange={(v:any) => setFormData({...formData, trig: v})} />
             <ResultInput label="HDL" unit="mmol/L" onChange={(v:any) => setFormData({...formData, hdl: v})} />
             <ResultInput label="LDL" unit="mmol/L" onChange={(v:any) => setFormData({...formData, ldl: v})} />
          </div>
        );
    }

    return (
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Findings / Result</label>
           <textarea 
             className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] h-32 transition-all resize-none"
             placeholder="Enter test result details..."
             onChange={(e) => setFormData({ result: e.target.value })}
             value={formData.result || ""}
           ></textarea>
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Lab Result Entry</h1>
             <p className="text-sm text-gray-500">Record results for single or multiple tests.</p>
           </div>
           
           {/* Patient Selector */}
           {selectedPatient ? (
               <div className="w-full sm:w-auto bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 text-[#073159] rounded-full flex items-center justify-center font-bold">
                          {selectedPatient.name.charAt(0)}
                      </div>
                      <div>
                          <p className="text-xs font-bold uppercase text-blue-500">Patient</p>
                          <p className="font-bold text-[#073159] text-sm">{selectedPatient.name}</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsPatientModalOpen(true)} // Just open modal
                    className="text-xs text-red-500 hover:text-red-700 font-bold bg-white px-2 py-1 rounded border border-red-100"
                  >
                    Change
                  </button>
               </div>
           ) : (
               <button 
                 onClick={() => setIsPatientModalOpen(true)}
                 className="w-full sm:w-auto bg-[#073159] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#062a4d] transition-all shadow-md active:scale-95"
               >
                 <User size={18} /> Select Patient
               </button>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT: ENTRY FORM --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Test Selection */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-opacity ${!selectedPatient ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                        <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                            <Microscope size={16} /> Select Test
                        </h3>
                        <button 
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="text-xs text-[#073159] font-bold hover:underline flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                        >
                            <Plus size={12} /> Create Test Type
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Test Type (Category)</label>
                            <select 
                                className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm transition-all"
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedTest(""); 
                                }}
                            >
                                <option value="">Select Category...</option>
                                {TEST_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Specific Lab Test</label>
                            <select 
                                className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm transition-all"
                                value={selectedTest}
                                onChange={(e) => setSelectedTest(e.target.value)}
                                disabled={!selectedCategory}
                            >
                                <option value="">Select Test...</option>
                                {selectedCategory && LAB_TESTS[selectedCategory]?.map(test => (
                                    <option key={test} value={test}>{test}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Parameter Entry */}
                {selectedTest && selectedPatient && (
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-bold text-gray-800 text-sm uppercase mb-4 border-b border-gray-100 pb-2">
                            Enter Parameters: <span className="text-[#073159]">{selectedTest}</span>
                        </h3>
                        
                        {renderParameters()}

                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleAddToReport}
                                className="w-full sm:w-auto bg-[#073159] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#062a4d] transition-transform active:scale-95 shadow-md"
                            >
                                <Plus size={16} /> Add to Session
                            </button>
                        </div>
                    </div>
                )}

                {!selectedPatient && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center text-gray-400">
                        <User size={48} className="mb-2 opacity-50" />
                        <p className="font-medium">Please select a patient to start entering results.</p>
                    </div>
                )}

            </div>

            {/* --- RIGHT: REPORT STAGING AREA --- */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 h-full flex flex-col min-h-[300px]">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                        <FileText size={18} /> Report Session
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
                        {reportItems.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm py-10 flex flex-col items-center">
                                <FileText size={32} className="mb-2 opacity-50" />
                                No tests added yet.
                            </div>
                        ) : (
                            reportItems.map((item) => (
                                <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative group animate-in zoom-in duration-200">
                                    <button 
                                        onClick={() => handleRemoveFromReport(item.id)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-full mb-1 inline-block">{item.category}</span>
                                    <h4 className="font-bold text-[#073159] text-sm">{item.testName}</h4>
                                    <p className="text-xs text-gray-600 mt-1 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                                      {item.summary}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-200 mt-auto">
                        <button 
                            onClick={handleFinalizeReport}
                            disabled={reportItems.length === 0}
                            className="w-full bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <CheckCircle size={18} /> Finalize & Print
                        </button>
                    </div>
                </div>
            </div>

        </div>

        {/* --- MODALS --- */}

        {/* 1. Patient Selector Modal */}
        {isPatientModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-0 overflow-hidden transform transition-all scale-100 flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Select Patient</h3>
                        <button onClick={() => setIsPatientModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                    </div>
                    
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name or ID..." 
                                autoFocus
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#073159] outline-none transition-all"
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => handleSwitchPatient(p)} // Use updated handler
                                    className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-50 flex items-center justify-between group transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800 group-hover:text-[#073159]">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.id} • {p.gender}, {p.age}y</p>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#073159]" />
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">No patients found.</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* 2. Create Category Modal */}
        {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Add New Test Type</h3>
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="e.g. Molecular Biology"
                        className="w-full p-3 border rounded-xl mb-4 outline-none focus:border-[#073159] focus:ring-2 focus:ring-[#073159]/20 transition-all"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                        <button onClick={handleCreateCategory} className="px-6 py-2 bg-[#073159] text-white font-bold rounded-lg hover:bg-[#062a4d] transition-transform active:scale-95 shadow-md">Create</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}

// Helper for numeric inputs
function ResultInput({ label, unit, onChange }: any) {
    return (
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{label}</label>
            <div className="relative">
                <input 
                    type="number" 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#073159] bg-gray-50 focus:bg-white transition-colors"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">{unit}</span>
            </div>
        </div>
    )
}