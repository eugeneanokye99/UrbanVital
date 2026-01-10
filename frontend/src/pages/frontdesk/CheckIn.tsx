import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  UserCheck,
  ArrowRight,
  Stethoscope,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { fetchPatients } from "../../services/api";

export default function StaffCheckIn() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Form State
  const [visitDetails, setVisitDetails] = useState({
    service: "General Consultation",
    priority: "Normal",
    assignedDoctor: "",
    notes: "",
  });

  // Fetch patients on component mount
  useEffect(() => {
    getPatients();
  }, []);

  // Fetch patients with search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        getPatients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const getPatients = async () => {
    try {
      setLoadingPatients(true);
      const params: any = {};
      
      if (search) params.search = search;
      
      const data = await fetchPatients(params);
      setPatients(data.results || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Filter logic for local filtering (optional, backend already does it)
  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn?.toLowerCase().includes(search.toLowerCase()) ||
      p.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
  );

  const handleCheckIn = async () => {
    if (!selectedPatient) return;
    setLoading(true);

    try {
      // TODO: Create API endpoint for check-in
      // For now, simulate API Call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(`${selectedPatient.name || selectedPatient.first_name} checked in successfully!`);
      
      // Reset form
      setSelectedPatient(null);
      setSearch("");
      setVisitDetails({
        service: "General Consultation",
        priority: "Normal",
        assignedDoctor: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to check in patient");
    } finally {
      setLoading(false);
    }
  };

  // Format patient name for display
  const getPatientName = (patient: any) => {
    if (patient.name) return patient.name;
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
  };

  // Get patient type (Returning/New) - you might want to calculate this based on visit history
  const getPatientType = (patient: any) => {
    // For now, we'll assume all are Returning if they exist in database
    // You can add logic based on created_at date or visit count
    console.log(patient)
    return "Returning";
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
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[300px] lg:h-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Name, MRN, or Phone..."
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none shadow-sm transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingPatients ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 text-[#073159] animate-spin" />
                <span className="ml-2 text-sm text-gray-600">Loading patients...</span>
              </div>
            ) : filteredPatients.length > 0 ? (
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
                        {getPatientName(patient)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {patient.mrn} • {patient.phone}
                        {patient.date_of_birth && (
                          <span> • {
                            new Date().getFullYear() - 
                            new Date(patient.date_of_birth).getFullYear()
                          } Yrs</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        getPatientType(patient) === "New"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getPatientType(patient)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                {search ? (
                  <>
                    <p className="text-gray-400 text-sm">
                      No patients found for "{search}"
                    </p>
                    <button
                      onClick={() => window.location.href = "/frontdesk/registerpatient"}
                      className="mt-2 text-[#073159] text-sm font-bold hover:underline"
                    >
                      Register New Patient
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm">
                      Start typing to search for patients
                    </p>
                    <button
                      onClick={() => window.location.href = "/frontdesk/patients"}
                      className="mt-2 text-[#073159] text-sm font-bold hover:underline"
                    >
                      View All Patients
                    </button>
                  </>
                )}
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
                      {getPatientName(selectedPatient)}
                    </h2>
                    <div className="flex items-center gap-2 md:gap-4 mt-2 text-blue-200 text-xs md:text-sm flex-wrap">
                      <span>{selectedPatient.mrn}</span>
                      <span>•</span>
                      <span>{selectedPatient.phone}</span>
                      {selectedPatient.date_of_birth && (
                        <>
                          <span>•</span>
                          <span>{
                            new Date().getFullYear() - 
                            new Date(selectedPatient.date_of_birth).getFullYear()
                          } years</span>
                        </>
                      )}
                      {selectedPatient.gender && (
                        <>
                          <span>•</span>
                          <span>{selectedPatient.gender}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg md:text-xl backdrop-blur-sm">
                    {getPatientName(selectedPatient).charAt(0)}
                  </div>
                </div>
              </div>

              {/* Patient Info Summary */}
              {selectedPatient.address || selectedPatient.emergency_name ? (
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPatient.address && (
                      <div className="text-xs">
                        <span className="text-gray-500">Address: </span>
                        <span className="font-medium text-gray-700">
                          {selectedPatient.address}
                          {selectedPatient.city && `, ${selectedPatient.city}`}
                        </span>
                      </div>
                    )}
                    {selectedPatient.emergency_name && (
                      <div className="text-xs">
                        <span className="text-gray-500">Emergency: </span>
                        <span className="font-medium text-gray-700">
                          {selectedPatient.emergency_name}
                          {selectedPatient.emergency_relation && ` (${selectedPatient.emergency_relation})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

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
                        {/* should be replaced with fetched doctors/clinicians list in the database */}
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
                      <select 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none appearance-none text-sm cursor-pointer"
                        defaultValue="Pay Later (After Service)"
                      >
                        <option value="pay_later">Pay Later (After Service)</option>
                        <option value="insurance" disabled={!selectedPatient.insurance_provider}>
                          {selectedPatient.insurance_provider 
                            ? `${selectedPatient.insurance_provider} Insurance`
                            : "Insurance (Not Registered)"}
                        </option>
                        <option value="cash">Paid Cash</option>
                        <option value="mobile_money">Mobile Money</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Medical Flags Alert */}
                {selectedPatient.medical_flags && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">
                        Medical Alert
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedPatient.medical_flags}
                      </p>
                    </div>
                  </div>
                )}

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

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none min-h-[80px] text-sm resize-none"
                    placeholder="Any additional notes for this visit..."
                    value={visitDetails.notes}
                    onChange={(e) =>
                      setVisitDetails({ ...visitDetails, notes: e.target.value })
                    }
                  />
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
                  className="px-6 py-2 md:px-8 md:py-3 rounded-xl font-bold text-sm text-white bg-[#073159] hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
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
              {patients.length === 0 && !loadingPatients && (
                <button
                  onClick={() => window.location.href = "/frontdesk/registerpatient"}
                  className="mt-4 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors text-sm font-medium"
                >
                  Register First Patient
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}