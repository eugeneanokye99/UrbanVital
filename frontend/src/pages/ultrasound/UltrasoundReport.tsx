import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Printer, Save, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";
import { UrbanVitalDocument } from "../../components/UrbanVitalDocument";
import { createUltrasoundScan, updateUltrasoundScan, completeUltrasoundScan } from "../../services/api";
import toast from "react-hot-toast";

export default function UltrasoundReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  
  const [loading, setLoading] = useState(false);
  const [scanType, setScanType] = useState(order?.scan_type || "Abdominal");
  const [lmp, setLmp] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [technique, setTechnique] = useState("");
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [machineUsed, setMachineUsed] = useState("");
  const [scanId, setScanId] = useState<number | null>(null);

  useEffect(() => {
    if (!order) {
      toast.error("No order selected. Please select an order from the worklist.");
      navigate("/ultrasound/worklist");
      return;
    }
    
    // Pre-fill clinical indication if available
    if (order.clinical_indication && !findings) {
      setTechnique(`Clinical Indication: ${order.clinical_indication}`);
    }
  }, [order, navigate]);

  const handleSaveDraft = async () => {
    if (!order) return;
    
    if (!findings.trim() || !impression.trim()) {
      toast.error("Please enter findings and impression");
      return;
    }

    try {
      setLoading(true);
      const scanData = {
        order: order.id,
        patient: order.patient,
        scan_type: scanType,
        machine_used: machineUsed,
        clinical_indication: order.clinical_indication,
        lmp: lmp || undefined,
        gestational_age: gestationalAge || undefined,
        technique: technique || undefined,
        findings,
        impression,
        recommendations: recommendations || undefined,
        status: "Draft",
      };

      if (scanId) {
        await updateUltrasoundScan(scanId, scanData);
        toast.success("Scan draft updated");
      } else {
        const newScan = await createUltrasoundScan(scanData);
        setScanId(newScan.id);
        toast.success("Scan draft saved");
      }
    } catch (error: any) {
      console.error("Error saving scan:", error);
      toast.error(error?.response?.data?.detail || "Failed to save scan");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!order) return;
    
    if (!findings.trim() || !impression.trim()) {
      toast.error("Please enter findings and impression");
      return;
    }

    try {
      setLoading(true);
      let currentScanId = scanId;
      
      // If no scan exists, create it first
      if (!currentScanId) {
        const scanData = {
          order: order.id,
          patient: order.patient,
          scan_type: scanType,
          machine_used: machineUsed,
          clinical_indication: order.clinical_indication,
          lmp: lmp || undefined,
          gestational_age: gestationalAge || undefined,
          technique: technique || undefined,
          findings,
          impression,
          recommendations: recommendations || undefined,
          status: "Draft",
        };
        const newScan = await createUltrasoundScan(scanData);
        currentScanId = newScan.id;
        setScanId(currentScanId);
      }

      // Complete the scan
      await completeUltrasoundScan(currentScanId);
      toast.success("Scan completed successfully");
      navigate("/ultrasound/worklist");
    } catch (error: any) {
      console.error("Error completing scan:", error);
      toast.error(error?.response?.data?.detail || "Failed to complete scan");
    } finally {
      setLoading(false);
    }
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

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Scan Reporting</h1>
              <p className="text-sm text-gray-500">
                Patient: {order?.patient_name || "Unknown Patient"} ({order?.patient_mrn || "No MRN"})
              </p>
              {order?.urgency && order.urgency !== 'Normal' && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                  order.urgency === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {order.urgency} Scan
                </span>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 text-sm hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                    Save Draft
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
                    Complete
                </button>
                <button 
                  onClick={handlePrint} 
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#073159] text-white rounded-xl font-bold text-sm hover:bg-[#062a4d] flex items-center justify-center gap-2"
                >
                    <Printer size={18} /> Print
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Editor */}
            <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase">Scan Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Scan Type</label>
                            <input
                                type="text"
                                className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm"
                                value={scanType}
                                onChange={(e) => setScanType(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Machine Used</label>
                            <input
                                type="text"
                                placeholder="e.g., GE Voluson E10"
                                className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm"
                                value={machineUsed}
                                onChange={(e) => setMachineUsed(e.target.value)}
                            />
                        </div>
                        {scanType.toLowerCase().includes("obstetric") && (
                          <>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">LMP</label>
                                <input 
                                  type="date" 
                                  className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm"
                                  value={lmp}
                                  onChange={(e) => setLmp(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Gestational Age</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g., 20 weeks 3 days"
                                  className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm"
                                  value={gestationalAge}
                                  onChange={(e) => setGestationalAge(e.target.value)}
                                />
                            </div>
                          </>
                        )}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase">Report Content</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Technique (Optional)</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm h-20"
                                placeholder="Transabdominal ultrasound performed..."
                                value={technique}
                                onChange={(e) => setTechnique(e.target.value)}
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Detailed Findings *</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm h-48"
                                placeholder="Liver is normal in size and echotexture..."
                                value={findings}
                                onChange={(e) => setFindings(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Impression/Conclusion *</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm h-24 font-bold text-gray-800"
                                placeholder="Normal Abdominal Scan."
                                value={impression}
                                onChange={(e) => setImpression(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Recommendations (Optional)</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm h-20"
                                placeholder="Follow-up recommendations..."
                                value={recommendations}
                                onChange={(e) => setRecommendations(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-400 flex flex-col items-center hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold mt-2 uppercase">Attach Images (Coming Soon)</span>
                     </button>
                </div>
            </div>

            {/* Preview */}
            <div id="printable-area" className="xl:col-span-2 bg-gray-200/50 p-4 sm:p-6 rounded-3xl border border-gray-200 flex justify-center items-start order-1 xl:order-2 min-h-[600px] overflow-auto">
                 <div className="w-full max-w-[210mm] bg-white shadow-lg origin-top transform scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100">
                    <UrbanVitalDocument 
                        title="ULTRASOUND REPORT"
                        patient={{ 
                          name: order?.patient_name || "Unknown Patient", 
                          age: order?.patient_age || 0, 
                          mrn: order?.patient_mrn || "N/A", 
                          phone: order?.patient_phone || "" 
                        }}
                        doctorName="Ultrasound Department"
                        date={new Date().toLocaleDateString()}
                    >
                        <div className="space-y-6 mt-8">
                            <div className="border-b pb-2 mb-4">
                                <h3 className="font-bold text-lg text-[#073159] uppercase">{scanType}</h3>
                                {lmp && <p className="text-sm text-gray-600 mt-1">LMP: {lmp}</p>}
                                {gestationalAge && <p className="text-sm text-gray-600">Gestational Age: {gestationalAge}</p>}
                            </div>

                            {technique && (
                              <div>
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Technique:</h4>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {technique}
                                </div>
                              </div>
                            )}

                            <div>
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Findings:</h4>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                                    {findings || "No findings recorded yet..."}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Impression:</h4>
                                <p className="font-bold text-gray-900 text-base whitespace-pre-wrap">
                                    {impression || "Pending Conclusion..."}
                                </p>
                            </div>

                            {recommendations && (
                              <div>
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Recommendations:</h4>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {recommendations}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-400 italic mt-8 text-center">
                                * This report is generated based on ultrasound imaging findings.
                            </p>
                        </div>
                    </UrbanVitalDocument>
                 </div>
            </div>

        </div>
    </div>
  );
}