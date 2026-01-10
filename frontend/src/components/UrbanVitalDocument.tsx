// src/components/UrbanVitalDocument.tsx

import logo from "../assets/urbanvital-logo.png"; 

interface DocumentProps {
  title: string;
  patient: {
    name: string;
    mrn: string;
    phone: string;
  };
  doctorName: string;
  signatoryLabel?: string; // <--- NEW PROP (Optional)
  date: string;
  children: React.ReactNode;
}

export const UrbanVitalDocument = ({ 
  title, 
  patient, 
  doctorName, 
  signatoryLabel = "Prescriber/Doctor", // Default value
  date, 
  children 
}: DocumentProps) => {
  return (
    <div 
      id="printable-area" 
      className="bg-[#f4f6f8] p-8 min-h-[297mm] w-full md:w-[210mm] mx-auto relative text-gray-800 font-['Montserrat'] leading-relaxed print:bg-white print:p-0 print:w-full print:shadow-none shadow-2xl"
    >
      {/* ... Header and Patient Info Bar remain the same ... */}
      
      {/* --- 1. HEADER (Logo) --- */}
      <div className="flex flex-col items-center justify-center mb-6">
        <img src={logo} alt="UrbanVital" className="h-16 object-contain mb-2" />
      </div>

      {/* --- 2. PATIENT INFO BAR --- */}
      <div className="border-y-2 border-[#073159] bg-[#eef2f6] py-3 px-4 flex flex-wrap justify-between items-center text-sm font-bold text-[#073159] uppercase tracking-wide print:border-gray-400 print:bg-gray-100">
        <span>{patient.mrn}</span>
        <span>{patient.name}</span>
        <span>{patient.phone}</span>
      </div>

      {/* --- 3. DOCUMENT TITLE --- */}
      <div className="mt-8 mb-6">
        <h2 className="text-2xl font-bold text-[#073159] uppercase underline decoration-2 underline-offset-4">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">Date: {date}</p>
      </div>

      {/* --- 4. BODY CONTENT --- */}
      <div className="relative min-h-[400px] border border-transparent rounded-xl p-2">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <img src={logo} alt="" className="w-3/4 grayscale" />
        </div>
        <div className="relative z-10 text-sm md:text-base text-gray-800 leading-7 font-medium">
          {children}
        </div>
      </div>

      {/* --- 5. FOOTER (Signature) --- */}
      <div className="mt-20 flex justify-between items-start pb-8">
        <div>
          {/* Use the new prop here */}
          <p className="font-bold text-[#073159] text-lg">{signatoryLabel}:</p>
          <p className="text-gray-700 mt-4 text-lg font-medium">{doctorName}</p>
          <p className="text-xs text-gray-400">UrbanVital Health Consult</p>
        </div>

        <div className="text-right">
          <p className="font-bold text-[#073159] text-lg mb-12">Signature:</p>
          <div className="w-64 border-b-4 border-dotted border-[#073159]/40"></div>
        </div>
      </div>

    </div>
  );
};