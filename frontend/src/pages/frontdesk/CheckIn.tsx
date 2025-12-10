import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  UserCheck,
  ArrowRight,
  Stethoscope,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function StaffCheckIn() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [visitDetails, setVisitDetails] = useState({
    service: "General Consultation",
    priority: "Normal",
    assignedDoctor: "",
    notes: "",
  });

  // Mock Database
  const patients = [
    {
      id: 1,
      name: "Williams Boampong",
      mrn: "UV-2025-0421",
      age: 23,
      phone: "0546732719",
      type: "Returning",
    },
    {
      id: 2,
      name: "Sarah Mensah",
      mrn: "UV-2025-0422",
      age: 45,
      phone: "0209998888",
      type: "Returning",
    },
    {
      id: 3,
      name: "Emmanuel Osei",
      mrn: "UV-2025-0423",
      age: 31,
      phone: "0241112222",
      type: "New",
    },
    {
      id: 4,
      name: "Ama Kyei",
      mrn: "UV-2025-0424",
      age: 28,
      phone: "0555556666",
      type: "Returning",
    },
  ];

  // Filter logic
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = async () => {
    if (!selectedPatient) return;
    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
      toast.success(`${selectedPatient.name} checked in successfully!`);
      setLoading(false);
      setSelectedPatient(null); // Reset
      setSearch("");
      setVisitDetails({
        service: "General Consultation",
        priority: "Normal",
        assignedDoctor: "",
        notes: "",
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
          <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
          Patient Check-In
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Search for a patient to start a new visit queue.
        </p>
      </div>

      {/* Main Content Area: Stacks on Mobile */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* --- LEFT: SEARCH PANEL --- */}
        {/* Fixed height on mobile (300px) so user can see list + details */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[300px] lg:h-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Name or MRN..."
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none shadow-sm transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group ${
                    selectedPatient?.id === patient.id
                      ? "bg-blue-50 border-l-4 border-l-[#073159]"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4
                        className={`font-bold text-sm ${
                          selectedPatient?.id === patient.id
                            ? "text-[#073159]"
                            : "text-gray-800"
                        }`}
                      >
                        {patient.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {patient.mrn} • {patient.age} Yrs
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        patient.type === "New"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {patient.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">
                  No patients found.
                </p>
                <button
                  onClick={() =>
                    (window.location.href = "/frontdesk/registerpatient")
                  }
                  className="mt-2 text-[#073159] text-sm font-bold hover:underline"
                >
                  Register New Patient
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: CHECK-IN FORM --- */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[500px] overflow-hidden">
          {selectedPatient ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Patient Banner */}
              <div className="p-4 md:p-6 border-b border-gray-100 bg-[#073159] text-white flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">
                      {selectedPatient.name}
                    </h2>
                    <div className="flex items-center gap-2 md:gap-4 mt-2 text-blue-200 text-xs md:text-sm">
                      <span>{selectedPatient.mrn}</span>
                      <span>•</span>
                      <span>{selectedPatient.phone}</span>
                    </div>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg md:text-xl backdrop-blur-sm">
                    {selectedPatient.name.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="p-4 md:p-8 space-y-6 overflow-y-auto flex-1">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Visit Service
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "General Consultation",
                      "Specialist Review",
                      "Lab Only",
                      "Pharmacy Only",
                      "Vitals Only",
                      "Emergency",
                    ].map((service) => (
                      <button
                        key={service}
                        onClick={() =>
                          setVisitDetails({ ...visitDetails, service })
                        }
                        className={`p-3 rounded-xl border text-xs md:text-sm font-medium transition-all text-left ${
                          visitDetails.service === service
                            ? "border-[#073159] bg-blue-50 text-[#073159] ring-1 ring-[#073159]"
                            : "border-gray-200 text-gray-600 hover:border-blue-300"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Assign Doctor (Optional)
                    </label>
                    <div className="relative">
                      <Stethoscope
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <select
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none appearance-none text-sm cursor-pointer"
                        value={visitDetails.assignedDoctor}
                        onChange={(e) =>
                          setVisitDetails({
                            ...visitDetails,
                            assignedDoctor: e.target.value,
                          })
                        }
                      >
                        <option value="">Any Available Doctor</option>
                        <option value="Dr. William Asante">
                          Dr. William Asante
                        </option>
                        <option value="Dr. Sarah Mensah">
                          Dr. Sarah Mensah
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <div className="relative">
                      <CreditCard
                        className="absolute left-3 top-3 text-gray-400"
                        size={18}
                      />
                      <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none appearance-none text-sm cursor-pointer">
                        <option>Pay Later (After Service)</option>
                        <option>Insurance (Verified)</option>
                        <option>Paid Cash</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center gap-3">
                  <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">
                      Is this urgent?
                    </p>
                    <p className="text-xs text-gray-500">
                      Flag high priority for triage nurse.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-[#073159] focus:ring-[#073159]"
                      onChange={(e) =>
                        setVisitDetails({
                          ...visitDetails,
                          priority: e.target.checked
                            ? "Urgent"
                            : "Normal",
                        })
                      }
                    />
                    <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                      Yes, Urgent
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="px-6 py-2 md:px-8 md:py-3 rounded-xl font-bold text-sm text-white bg-[#073159] hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle size={18} /> Confirm Check-In
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ArrowRight className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-700">
                Select a Patient
              </h3>
              <p className="text-sm md:text-base text-gray-500 max-w-xs mt-2">
                Find a patient from the list on the left to view details
                and proceed with check-in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}