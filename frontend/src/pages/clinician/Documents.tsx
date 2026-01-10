import { useState, useEffect } from "react";
import {
  Printer,
  ClipboardList,
  UserCog,
  Calendar as CalendarIcon,
  PenTool,
  X,
  Search,
  User,
  Maximize2,
  Minimize2,
  Loader2,
  Save
} from "lucide-react";
import { UrbanVitalDocument } from "../../components/UrbanVitalDocument";
import { fetchUserProfile, fetchPatients, createMedicalDocument } from "../../services/api";
import toast from "react-hot-toast";

export default function ClinicianDocuments() {
  const [selectedTemplate, setSelectedTemplate] = useState("sick-note");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- 1. GLOBAL DOCUMENT STATE ---
  const [docMeta, setDocMeta] = useState({
    doctorName: "Dr. Loading...",
    date: new Date().toLocaleDateString(),
    title: "EXCUSE DUTY / SICK NOTE"
  });

  // --- 2. CONTENT STATE ---
  const [docContent, setDocContent] = useState<any>({
    condition: "",
    days: "3",
    referralHospital: "",
    referralReason: "",
    notes: "",
    customBody: ""
  });

  // --- 3. PATIENT STATE ---
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  useEffect(() => {
    fetchUserProfile().then(user => {
      if (user) {
        setDocMeta(prev => ({ ...prev, doctorName: `Dr. ${user.last_name || user.username}` }));
      }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!isPatientModalOpen) return;

    const search = async () => {
      setSearchingPatients(true);
      try {
        const data = await fetchPatients({ search: patientSearch });
        setPatients(data.results || data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setSearchingPatients(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [patientSearch, isPatientModalOpen]);

  const handleTemplateChange = (type: string) => {
    setSelectedTemplate(type);
    let newTitle = "MEDICAL DOCUMENT";
    if (type === 'sick-note') newTitle = "EXCUSE DUTY / SICK NOTE";
    if (type === 'referral') newTitle = "PATIENT REFERRAL LETTER";
    if (type === 'prescription') newTitle = "PRESCRIPTION FORM";
    if (type === 'custom') newTitle = "OFFICIAL MEDICAL REPORT";

    setDocMeta(prev => ({ ...prev, title: newTitle }));
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    const originalContents = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }

    setSaving(true);
    try {
      await createMedicalDocument({
        patient: selectedPatient.id,
        document_type: selectedTemplate,
        title: docMeta.title,
        content: docContent
      });
      toast.success("Document saved to patient records");
    } catch (error) {
      toast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
          <ClipboardList className="w-6 h-6 md:w-8 md:h-8" /> Document Center
        </h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleSaveDocument}
            disabled={saving || !selectedPatient}
            className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Record
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#062a4d] flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm md:text-base"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">

        {/* LEFT COLUMN */}
        <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">

          {/* Patient Selector */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">1. Patient</h3>
            {selectedPatient ? (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
                <div className="overflow-hidden pr-2">
                  <p className="font-bold text-[#073159] truncate">{selectedPatient.name}</p>
                  <p className="text-xs text-gray-500">{selectedPatient.mrn}</p>
                </div>
                <button
                  onClick={() => setIsPatientModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:underline bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPatientModalOpen(true)}
                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-[#073159] hover:text-[#073159] transition-all flex items-center justify-center gap-2"
              >
                <User size={20} /> Select Patient
              </button>
            )}
          </div>

          {/* Signatory Details */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase flex items-center gap-2">
              <UserCog size={16} /> Signatory Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Prescriber Name</label>
                <input
                  type="text"
                  className="w-full border p-2.5 rounded-lg bg-gray-50 font-medium text-[#073159] text-sm focus:bg-white focus:border-[#073159] outline-none transition-colors"
                  value={docMeta.doctorName}
                  onChange={(e) => setDocMeta({ ...docMeta, doctorName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Document Date</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border p-2.5 pl-9 rounded-lg bg-gray-50 text-sm focus:bg-white focus:border-[#073159] outline-none transition-colors"
                    value={docMeta.date}
                    onChange={(e) => setDocMeta({ ...docMeta, date: e.target.value })}
                  />
                  <CalendarIcon className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Template Selector */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">Document Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sick-note', label: 'Sick Note' },
                { id: 'referral', label: 'Referral' },
                { id: 'prescription', label: 'Prescription' },
                { id: 'custom', label: 'Medical Report' }
              ].map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`text-center px-2 py-3 rounded-lg border transition-all text-xs font-bold uppercase ${selectedTemplate === tpl.id
                      ? "bg-[#073159] text-white border-[#073159]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                    }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase flex items-center gap-2">
              <PenTool size={16} /> Content Editor
            </h3>

            {selectedTemplate === "sick-note" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">Condition / Diagnosis</label>
                  <input
                    type="text"
                    className="w-full border p-2.5 rounded-lg bg-yellow-50 focus:bg-white transition-colors text-sm focus:border-[#073159] outline-none"
                    placeholder="e.g. Malaria"
                    value={docContent.condition}
                    onChange={(e) => setDocContent({ ...docContent, condition: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Days Excused</label>
                  <input
                    type="number"
                    className="w-full border p-2.5 rounded-lg bg-yellow-50 focus:bg-white transition-colors text-sm focus:border-[#073159] outline-none"
                    value={docContent.days}
                    onChange={(e) => setDocContent({ ...docContent, days: e.target.value })}
                  />
                </div>
              </div>
            )}

            {selectedTemplate === "referral" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">Refer To</label>
                  <input
                    type="text"
                    className="w-full border p-2.5 rounded-lg bg-yellow-50 focus:bg-white text-sm focus:border-[#073159] outline-none"
                    placeholder="Hospital or Doctor Name"
                    value={docContent.referralHospital}
                    onChange={(e) => setDocContent({ ...docContent, referralHospital: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Reason / History</label>
                  <textarea
                    className="w-full border p-2.5 rounded-lg bg-yellow-50 focus:bg-white h-32 text-sm focus:border-[#073159] outline-none"
                    placeholder="Clinical details..."
                    value={docContent.referralReason}
                    onChange={(e) => setDocContent({ ...docContent, referralReason: e.target.value })}
                  ></textarea>
                </div>
              </div>
            )}

            {(selectedTemplate === "prescription" || selectedTemplate === "custom") && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">
                    {selectedTemplate === "prescription" ? "Medications (Rx)" : "Report Body"}
                  </label>
                  <textarea
                    className="w-full border p-2.5 rounded-lg bg-yellow-50 focus:bg-white h-64 font-mono text-sm leading-relaxed focus:border-[#073159] outline-none"
                    placeholder="Type here..."
                    value={selectedTemplate === "custom" ? docContent.customBody : docContent.notes}
                    onChange={(e) => selectedTemplate === "custom"
                      ? setDocContent({ ...docContent, customBody: e.target.value })
                      : setDocContent({ ...docContent, notes: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className={`xl:col-span-2 order-1 xl:order-2 ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100 p-4 overflow-y-auto' : 'relative'}`}>
          <div className="bg-gray-200/50 p-4 sm:p-6 rounded-3xl border border-gray-200 flex flex-col items-center justify-start min-h-[500px] relative transition-all">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#073159] hover:bg-blue-50 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            <div className={`w-full max-w-[210mm] bg-white shadow-lg transition-transform origin-top ${isFullscreen ? 'scale-100' : 'scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100'}`} id="printable-area">
              <UrbanVitalDocument
                title={docMeta.title}
                patient={selectedPatient || { name: "________________", mrn: "________", age: "__", phone: "__________" }}
                doctorName={docMeta.doctorName}
                date={docMeta.date}
              >
                {selectedTemplate === "sick-note" && (
                  <div className="space-y-6 mt-8 text-sm md:text-base">
                    <p>This is to certify that <strong>{selectedPatient?.name || "________________"}</strong> visited UrbanVital Health Consult on <strong>{docMeta.date}</strong>.</p>
                    <p>He/She has been diagnosed with <strong>{docContent.condition || "___________________"}</strong>.</p>
                    <p>Based on the clinical findings, I recommend that he/she be excused from duty/school for <strong>{docContent.days || "__"} days</strong>.</p>
                    <p>Expected resumption date: <strong>{new Date(Date.now() + (parseInt(docContent.days) || 0) * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>.</p>
                  </div>
                )}

                {selectedTemplate === "referral" && (
                  <div className="space-y-6 mt-8 text-sm md:text-base">
                    <p><strong>To:</strong> {docContent.referralHospital || "___________________"}</p>
                    <p><strong>Re:</strong> Referral for {selectedPatient?.name || "________________"}</p>
                    <div className="mt-6">
                      <p className="font-bold underline mb-2">Clinical History & Reason for Referral:</p>
                      <p className="whitespace-pre-wrap">{docContent.referralReason || "Please evaluate and manage..."}</p>
                    </div>
                  </div>
                )}

                {selectedTemplate === "prescription" && (
                  <div className="space-y-6 mt-4 text-sm md:text-base">
                    <div className="font-mono whitespace-pre-wrap">
                      <span className="font-bold text-xl md:text-2xl mr-2">Rx:</span>
                      {docContent.notes || "_________________________________"}
                    </div>
                  </div>
                )}

                {selectedTemplate === "custom" && (
                  <div className="space-y-6 mt-4 text-sm md:text-base">
                    <div className="whitespace-pre-wrap leading-loose">
                      {docContent.customBody || "Type your content in the editor..."}
                    </div>
                  </div>
                )}
              </UrbanVitalDocument>
            </div>
          </div>
        </div>
      </div>

      {/* PATIENT SELECTION MODAL */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="font-bold text-gray-800">Select Patient</h3>
              <button onClick={() => setIsPatientModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or MRN..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#073159] outline-none bg-gray-50 focus:bg-white transition-all text-sm"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto min-h-[200px]">
              {searchingPatients ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-300" /></div>
              ) : patients.length > 0 ? (
                patients.map(p => (
                  <button
                    key={p.id || p.mrn}
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsPatientModalOpen(false);
                      setPatientSearch("");
                    }}
                    className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-50 flex items-center gap-3 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-[#073159] flex items-center justify-center font-bold group-hover:bg-[#073159] group-hover:text-white transition-colors flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-800 truncate">{p.name || `${p.first_name} ${p.last_name}`}</p>
                      <p className="text-xs text-gray-500 truncate">{p.mrn} • {p.age} Yrs</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No patients found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}