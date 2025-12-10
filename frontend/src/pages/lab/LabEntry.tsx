import { useState } from "react";
import { Save, AlertTriangle } from "lucide-react";

export default function LabResultEntry() {
  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header / Patient Banner */}
      <div className="bg-[#073159] text-white p-5 md:p-6 rounded-t-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Full Blood Count (FBC)</h1>
          <p className="text-blue-200 text-sm mt-1">Patient: Williams Boampong • UV-2025-0421</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg text-xs font-bold border border-white/20 whitespace-nowrap w-full sm:w-auto text-center sm:text-left">
          Sample ID: #SMP-9921
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white p-5 md:p-8 rounded-b-2xl shadow-sm border border-gray-100 border-t-0">
        
        {/* Grid: 1 col mobile -> 2 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Parameter Group 1 */}
          <div className="space-y-6">
            <ResultInput label="Hemoglobin (Hb)" unit="g/dL" min="11.5" max="16.5" />
            <ResultInput label="White Blood Cells (WBC)" unit="x10^9/L" min="4.0" max="11.0" />
            <ResultInput label="Platelets" unit="x10^9/L" min="150" max="400" />
          </div>
          
          {/* Parameter Group 2 */}
          <div className="space-y-6">
            <ResultInput label="Neutrophils" unit="%" min="40" max="75" />
            <ResultInput label="Lymphocytes" unit="%" min="20" max="45" />
            <ResultInput label="Eosinophils" unit="%" min="1" max="6" />
          </div>
        </div>

        {/* Remarks */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">Lab Technician Remarks</label>
          <textarea 
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159] text-sm transition-colors resize-none"
            rows={3}
            placeholder="Any notes on sample quality or findings..."
          ></textarea>
        </div>

        {/* Actions - Stack on mobile, Row on desktop */}
        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors order-2 sm:order-1 active:scale-95">
            Cancel
          </button>
          <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#073159] text-white font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 order-1 sm:order-2">
            <Save size={18} /> Save & Verify
          </button>
        </div>

      </div>

    </div>
  );
}

// Smart Input Component
function ResultInput({ label, unit, min, max }: any) {
  const [val, setVal] = useState("");
  
  // Simple check for out of range
  const isHigh = val && parseFloat(val) > parseFloat(max);
  const isLow = val && parseFloat(val) < parseFloat(min);

  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">Ref: {min} - {max}</span>
      </div>
      <div className="relative">
        <input 
          type="number" 
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className={`w-full p-3 rounded-xl border outline-none font-mono font-medium transition-all appearance-none ${
            isHigh || isLow 
            ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500" 
            : "border-gray-200 bg-white focus:border-[#073159]"
          }`}
          placeholder="0.0"
        />
        <span className="absolute right-3 top-3 text-sm text-gray-400 font-bold pointer-events-none">{unit}</span>
      </div>
      {(isHigh || isLow) && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-bold animate-in fade-in slide-in-from-top-1">
          <AlertTriangle size={10} /> Value is {isHigh ? "High" : "Low"}
        </p>
      )}
    </div>
  )
}