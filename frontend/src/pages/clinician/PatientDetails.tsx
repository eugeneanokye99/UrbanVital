import { 
  ArrowLeft, 
  Clock, 
  Thermometer, 
  Heart, 
  Activity, 
  Calendar,
  Flag,
  ChevronRight,
  FileText
} from "lucide-react";
import { useLocation, Navigate } from "react-router-dom"; // Import hooks
import ClinicianSidebar from "../../components/ClinicianSidebar"; 
import ClinicianNavbar from "../../components/ClinicianNavbar"; 

export default function ClinicianPatientDetails() {
  const location = useLocation();
  
  // Retrieve the patient data passed from the previous page
  const patientData = location.state?.patient;

  // SAFETY CHECK: If no data exists (e.g., user refreshed the page), 
  // redirect back to the patient list to avoid errors.
  if (!patientData) {
    return <Navigate to="/clinician/patients" replace />;
  }

  // Merge passed data with some defaults for fields that might be missing 
  // in the list view (like phone number or gender if not in the list object)
  const patient = {
    ...patientData,
    phone: patientData.phone || "054 000 0000", // Fallback if missing
    gender: patientData.gender || "Not Specified",
    flags: patientData.condition !== "None" ? [patientData.condition] : ["None"], // Use condition from list as flag
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <ClinicianSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ClinicianNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Breadcrumb / Back Navigation */}
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center text-gray-500 hover:text-[#073159] mb-6 transition-colors font-medium"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Patients List
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-[#073159] mb-6">
              Patient Details
            </h1>

            <div className="space-y-6">
              
              {/* --- Card 1: Patient Demographics --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                   <UserIcon className="w-5 h-5 text-[#073159]" />
                   <h2 className="font-bold text-[#073159]">Personal Information</h2>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    
                    {/* MRN */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">MRN</label>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[#073159] font-mono font-semibold text-lg flex items-center justify-between group-hover:border-blue-200 transition-colors">
                        {patient.mrn}
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">ID</span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-semibold text-lg group-hover:border-blue-200 transition-colors">
                        {patient.name}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-medium group-hover:border-blue-200 transition-colors">
                        {patient.phone}
                      </div>
                    </div>

                    {/* Age */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Age</label>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-medium group-hover:border-blue-200 transition-colors">
                        {patient.age} Years Old
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* --- Section Title --- */}
              <h2 className="text-xl font-bold text-[#073159] mt-8 mb-4">Visit Record</h2>

              {/* --- Card 2: Medical Info --- */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                  
                  {/* Flags */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Flag className="w-5 h-5 text-orange-500" />
                      <h3 className="font-bold text-gray-700">Medical Flags</h3>
                    </div>
                    {patient.flags[0] !== "None" ? (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            ALERT
                        </span>
                        <span className="text-red-800 font-medium text-lg">{patient.flags[0]}</span>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-500 text-sm">
                            No active medical flags recorded.
                        </div>
                    )}
                  </div>

                  {/* Vitals */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-gray-700">Vitals (Current Visit)</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <VitalCard icon={<Heart size={18} />} label="Pulse" value="--" unit="bpm" color="text-rose-500" bg="bg-rose-50" />
                        <VitalCard icon={<Thermometer size={18} />} label="Temp" value="--" unit="°C" color="text-orange-500" bg="bg-orange-50" />
                        <VitalCard icon={<Activity size={18} />} label="BP" value="--/--" unit="mmHg" color="text-blue-500" bg="bg-blue-50" />
                        <VitalCard icon={<Clock size={18} />} label="Resp" value="--" unit="/min" color="text-teal-500" bg="bg-teal-50" />
                    </div>
                  </div>

                  {/* History */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="font-bold text-gray-700">History & Notes</h3>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-[#073159] transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar size={14} />
                          <span>{patient.lastVisit}</span>
                        </div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Consultation
                        </span>
                      </div>
                      
                      <div className="h-2 w-full bg-gray-100 rounded-full mb-2"></div>
                      <div className="h-2 w-3/4 bg-gray-100 rounded-full mb-4"></div>
                      
                      <div className="flex justify-end">
                        <span className="text-sm font-bold text-[#073159] flex items-center group-hover:gap-2 transition-all">
                           View Full Record <ChevronRight size={16} className="ml-1" />
                        </span>
                      </div>
                    </div>
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

// Simple Helper Component for Vitals
function VitalCard({ icon, label, value, unit, color, bg }: any) {
    return (
        <div className={`p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center ${bg}`}>
            <div className={`mb-2 ${color}`}>{icon}</div>
            <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
            <p className="text-xl font-bold text-gray-800">
                {value} <span className="text-xs font-normal text-gray-500">{unit}</span>
            </p>
        </div>
    )
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    )
}