import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Activity,
  Calendar,
  Flag,
  ChevronRight,
  FileText,
  User,
  Loader2,
  Stethoscope,
  AlertCircle
} from "lucide-react";
import { useLocation, Navigate, useNavigate, useSearchParams, Link } from "react-router-dom";
import { fetchPatientById, fetchPatientConsultationHistory } from "../../services/api";

export default function ClinicianPatientDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("id");

  const [patientData, setPatientData] = useState<any>(location.state?.patient || null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(!patientData && !!patientId);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!patientData && patientId) {
        try {
          const data = await fetchPatientById(parseInt(patientId));
          setPatientData(data);
        } catch (error) {
          console.error("Failed to fetch patient", error);
        } finally {
          setLoading(false);
        }
      } else if (patientData) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId, patientData]);

  useEffect(() => {
    if (patientData?.id) {
      setLoadingHistory(true);
      fetchPatientConsultationHistory(patientData.id)
        .then(data => setHistory(data))
        .catch(err => console.error("History fetch failed", err))
        .finally(() => setLoadingHistory(false));
    }
  }, [patientData?.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#073159] animate-spin" />
      </div>
    );
  }

  if (!patientData) {
    return <Navigate to="/clinician/patients" replace />;
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header / Nav */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-[#073159] transition-colors font-medium text-sm md:text-base"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Patients List
          </button>
          <div className="flex gap-2">
            <Link
              to={`/clinician/consulting?visit=new&patient=${patientData.id}`}
              className="px-4 py-2 bg-[#073159] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#062a4d] transition-all"
            >
              <Stethoscope size={18} /> New Consultation
            </Link>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">

          {/* --- Card 1: Patient Demographics --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-50/50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <User size={20} className="text-[#073159]" />
              <h2 className="font-bold text-[#073159] text-sm md:text-base">Personal Information</h2>
            </div>

            <div className="p-5 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 md:gap-y-6 gap-x-8 lg:gap-x-12">

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">MRN</label>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[#073159] font-mono font-semibold text-base md:text-lg flex items-center justify-between group-hover:border-blue-200 transition-colors">
                    {patientData.mrn}
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">ID</span>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-semibold text-base md:text-lg group-hover:border-blue-200 transition-colors">
                    {patientData.name || `${patientData.first_name} ${patientData.last_name}`}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact</label>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm md:text-base group-hover:border-blue-200 transition-colors">
                    {patientData.phone} {patientData.email && `• ${patientData.email}`}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Demographics</label>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm md:text-base group-hover:border-blue-200 transition-colors">
                    {patientData.age} Years Old • {patientData.gender} • {patientData.marital_status || "Single"}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* --- Medical Information Section --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-orange-50/50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Activity size={20} className="text-orange-600" />
              <h2 className="font-bold text-orange-900 text-sm md:text-base">Medical Profile</h2>
            </div>

            <div className="p-5 md:p-8 space-y-6 md:space-y-8">
              {/* Flags */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flag className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-gray-700 text-sm md:text-base">Medical Flags</h3>
                </div>
                {patientData.medical_flags ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                      ALERT
                    </span>
                    <span className="text-red-800 font-medium text-sm md:text-lg">{patientData.medical_flags}</span>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-500 text-sm">
                    No active medical flags recorded.
                  </div>
                )}
              </div>

              {/* Consultation History */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-700 text-sm md:text-base">Consultation History ({history.length})</h3>
                </div>

                {loadingHistory ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-900" /></div>
                ) : history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((record: any) => (
                      <div key={record.id} className="border border-gray-100 bg-gray-50/50 rounded-xl p-5 hover:border-[#073159] transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-100 text-[#073159]">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{new Date(record.created_at).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold bg-[#073159] text-white px-2 py-1 rounded uppercase">
                            {record.visit_type || "Consultation"}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Diagnosis</p>
                            <p className="text-sm text-gray-800 font-semibold">{record.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Complaint</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{record.chief_complaint}</p>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-200/50">
                          <button
                            className="text-xs font-bold text-[#073159] flex items-center hover:underline"
                            onClick={() => navigate(`/clinician/consulting?visit=${record.visit}`)}
                          >
                            View Full Details <ChevronRight size={14} className="ml-1" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No medical history found for this patient.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}