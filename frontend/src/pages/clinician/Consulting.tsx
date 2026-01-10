import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Clock,
  Save,
  Activity,
  Thermometer,
  Heart,
  Loader2,
  User
} from "lucide-react";
import {
  fetchActiveVisits,
  fetchVisitById,
  createConsultation,
  updateVisitStatus
} from "../../services/api";
import toast from "react-hot-toast";


export default function ClinicianConsulting() {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visit");

  const [activeVisit, setActiveVisit] = useState<any>(null);
  const [waitingRoom, setWaitingRoom] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    chief_complaint: "",
    diagnosis: "",
    clinical_plan: "",
    admit_patient: false
  });

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const queue = await fetchActiveVisits();
        setWaitingRoom(queue);

        const visitIdParam = searchParams.get("visit");
        const patientIdParam = searchParams.get("patient");

        let targetVisit = null;

        if (visitIdParam && visitIdParam !== "new") {
          targetVisit = await fetchVisitById(parseInt(visitIdParam));
        } else if (patientIdParam) {
          // Find if this patient has an active visit in the queue
          const pid = parseInt(patientIdParam);
          targetVisit = queue.find((v: any) => v.patient === pid || v.patient_details?.id === pid);

          if (!targetVisit) {
            toast.error("Patient is not currently in the waiting room. Please check them in first.");
          }
        }

        if (targetVisit) {
          setActiveVisit(targetVisit);
          // Pre-fill some data if available
          setForm(prev => ({
            ...prev,
            chief_complaint: targetVisit.notes || ""
          }));

          // Update status to "In Consultation" if it's currently "Vitals Taken" or "Checked In"
          if (["Checked In", "Vitals Taken"].includes(targetVisit.status)) {
            await updateVisitStatus(targetVisit.id, "In Consultation");
          }
        }
      } catch (error) {
        console.error("Failed to load consultation data", error);
        toast.error("Error loading patient data");
      } finally {
        setLoading(false);
      }
    };
    loadQueue();
  }, [searchParams]);

  const handleSave = async () => {
    if (!activeVisit) return;
    if (!form.chief_complaint || !form.diagnosis) {
      toast.error("Please provide at least a complaint and diagnosis");
      return;
    }

    setSaving(true);
    try {
      await createConsultation({
        visit: activeVisit.id,
        patient: activeVisit.patient,
        chief_complaint: form.chief_complaint,
        diagnosis: form.diagnosis,
        clinical_plan: form.clinical_plan,
        prescription: form.clinical_plan,
        admit_patient: form.admit_patient
      });

      toast.success("Consultation saved successfully");
    } catch (error) {
      console.error("Failed to save consultation", error);
      toast.error("Failed to save consultation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#073159] animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 h-full">

        {/* --- LEFT: Waiting Queue --- */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 h-[300px] lg:h-auto flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h2 className="font-bold text-[#073159] mb-4 flex items-center gap-2 text-lg">
              <Clock size={18} /> Waiting Room ({waitingRoom.length})
            </h2>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {waitingRoom.length > 0 ? waitingRoom.map((visit) => (
                <Link
                  key={visit.id}
                  to={`/clinician/consulting?visit=${visit.id}`}
                  className={`p-4 rounded-xl border transition-all block ${visitId === String(visit.id)
                    ? "bg-[#073159] text-white shadow-lg transform scale-[1.02]"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base md:text-lg">
                      {visit.patient_details?.name || `${visit.patient_details?.first_name} ${visit.patient_details?.last_name}`}
                    </h3>
                    {visitId === String(visit.id) && <span className="bg-white/20 text-xs px-2 py-0.5 rounded">Active</span>}
                  </div>
                  <p className={`text-sm mb-2 ${visitId === String(visit.id) ? "text-blue-200" : "text-gray-500"}`}>
                    {visit.service_type}
                  </p>
                  {visit.vitals && (
                    <div className={`flex gap-2 text-xs font-mono opacity-80 ${visitId === String(visit.id) ? "text-white" : "text-gray-500"}`}>
                      <span>BP: {visit.vitals.blood_pressure_systolic}/{visit.vitals.blood_pressure_diastolic}</span> • <span>Temp: {visit.vitals.temperature}°C</span>
                    </div>
                  )}
                </Link>
              )) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Clock size={40} className="mx-auto mb-2 opacity-10" />
                  No patients waiting
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: Active Consultation --- */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[600px]">
          {activeVisit ? (
            <>
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 text-[#073159] flex items-center justify-center font-bold text-lg">
                    {activeVisit.patient_details?.first_name?.charAt(0) || <User size={20} />}
                  </div>
                  <div>
                    <h2 className="font-bold text-base md:text-lg text-[#073159]">
                      {activeVisit.patient_details?.first_name} {activeVisit.patient_details?.last_name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {activeVisit.patient_details?.gender} • {activeVisit.patient_details?.age} Yrs • {activeVisit.patient_details?.mrn}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link to={`/clinician/patient-details?id=${activeVisit.patient}`} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs md:text-sm rounded-lg hover:bg-gray-50 font-medium">Full Bio</Link>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#073159] text-white text-xs md:text-sm rounded-lg hover:bg-[#062a4d] flex items-center justify-center gap-2 font-medium shadow-md disabled:bg-gray-400"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Visit"}
                  </button>
                </div>
              </div>

              {/* Consultation Form */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Vitals Summary */}
                {activeVisit.vitals ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 mb-1"><Heart size={16} /> <span className="text-xs font-bold uppercase">Pulse</span></div>
                      <p className="font-bold text-lg md:text-xl text-gray-800">{activeVisit.vitals.heart_rate} <span className="text-xs font-normal text-gray-500">bpm</span></p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="flex items-center gap-2 text-orange-600 mb-1"><Thermometer size={16} /> <span className="text-xs font-bold uppercase">Temp</span></div>
                      <p className="font-bold text-lg md:text-xl text-gray-800">{activeVisit.vitals.temperature} <span className="text-xs font-normal text-gray-500">°C</span></p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-600 mb-1"><Activity size={16} /> <span className="text-xs font-bold uppercase">BP</span></div>
                      <p className="font-bold text-lg md:text-xl text-gray-800">{activeVisit.vitals.blood_pressure_systolic}/{activeVisit.vitals.blood_pressure_diastolic}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-indigo-600 mb-1"><Activity size={16} /> <span className="text-xs font-bold uppercase">Weight</span></div>
                      <p className="font-bold text-lg md:text-xl text-gray-800">{activeVisit.vitals.weight}<span className="text-xs font-normal text-gray-500">kg</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                    No vitals recorded for this visit.
                  </div>
                )}

                {/* Clinical Notes */}
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chief Complaint & History</label>
                    <textarea
                      className="w-full p-3 md:p-4 rounded-xl border border-gray-200 focus:border-[#073159] outline-none min-h-[100px] text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Patient complains of..."
                      value={form.chief_complaint}
                      onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis</label>
                    <input
                      type="text"
                      className="w-full p-3 md:p-3.5 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="e.g. Malaria, Acute Gastritis"
                      value={form.diagnosis}
                      onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Treatment Plan / Prescription</label>
                    <textarea
                      className="w-full p-3 md:p-4 rounded-xl border border-gray-200 focus:border-[#073159] outline-none min-h-[100px] text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="Rx: Paracetamol 500mg..."
                      value={form.clinical_plan}
                      onChange={(e) => setForm({ ...form, clinical_plan: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-3 mt-2 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      id="admit"
                      className="w-5 h-5 text-[#073159] rounded border-gray-300 focus:ring-[#073159] cursor-pointer"
                      checked={form.admit_patient}
                      onChange={(e) => setForm({ ...form, admit_patient: e.target.checked })}
                    />
                    <label htmlFor="admit" className="text-sm text-gray-700 font-bold cursor-pointer">Admit Patient for Observation</label>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
              <div className="w-20 h-20 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-6">
                <User size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Patient Selected</h3>
              <p className="text-gray-500 max-w-sm mb-8">
                Select a patient from the waiting room queue on the left to start a consultation.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}