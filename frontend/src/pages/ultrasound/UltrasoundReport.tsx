import { useState } from "react";
import { Printer, Save, Image as ImageIcon } from "lucide-react";
import { UrbanVitalDocument } from "../../components/UrbanVitalDocument";

export default function UltrasoundReport() {
  const [scanType, setScanType] = useState("Abdominal");
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");

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

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Scan Reporting</h1>
            <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                    <Save size={18} /> Save Draft
                </button>
                <button onClick={handlePrint} className="flex-1 sm:flex-none px-4 py-2 bg-[#073159] text-white rounded-xl font-bold text-sm hover:bg-[#062a4d] flex items-center justify-center gap-2">
                    <Printer size={18} /> Print Report
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
                            <select 
                                className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm"
                                value={scanType}
                                onChange={(e) => setScanType(e.target.value)}
                            >
                                <option>Abdominal Ultrasound</option>
                                <option>Pelvic Ultrasound</option>
                                <option>Obstetric Ultrasound</option>
                                <option>Thyroid Ultrasound</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">LMP (If Obstetric)</label>
                            <input type="date" className="w-full border p-2.5 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase">Findings & Impression</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Detailed Findings</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm h-48"
                                placeholder="Liver is normal in size and echotexture..."
                                value={findings}
                                onChange={(e) => setFindings(e.target.value)}
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Conclusion / Impression</label>
                            <textarea 
                                className="w-full border p-3 rounded-lg bg-gray-50 outline-none focus:border-[#073159] text-sm h-24 font-bold text-gray-800"
                                placeholder="Normal Abdominal Scan."
                                value={impression}
                                onChange={(e) => setImpression(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                     <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-400 flex flex-col items-center hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold mt-2 uppercase">Attach Images</span>
                     </button>
                </div>
            </div>

            {/* Preview */}
            <div className="xl:col-span-2 bg-gray-200/50 p-4 sm:p-6 rounded-3xl border border-gray-200 flex justify-center items-start order-1 xl:order-2 min-h-[600px] overflow-auto">
                 <div className="w-full max-w-[210mm] bg-white shadow-lg origin-top transform scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100">
                    <UrbanVitalDocument 
                        title="ULTRASOUND REPORT"
                        patient={{ name: "Ama Kyei", age: 28, mrn: "UV-2025-01", phone: "0555556666" }}
                        doctorName="Sonographer James"
                        date={new Date().toLocaleDateString()}
                    >
                        <div className="space-y-6 mt-8">
                            <div className="border-b pb-2 mb-4">
                                <h3 className="font-bold text-lg text-[#073159] uppercase">{scanType}</h3>
                            </div>

                            <div>
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Findings:</h4>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                                    {findings || "No findings recorded yet..."}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-sm uppercase text-gray-500 mb-2">Impression:</h4>
                                <p className="font-bold text-gray-900 text-base">
                                    {impression || "Pending Conclusion..."}
                                </p>
                            </div>
                            
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