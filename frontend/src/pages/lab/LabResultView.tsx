import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  FileCheck} from "lucide-react";
import logo from "../../assets/urbanvital-logo.png"; // Ensure you have this or remove image

export default function LabResultView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data passed from the profile page
  const { record, patient } = location.state || {};

  if (!record || !patient) {
    return (
        <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No report data found.</p>
            <button onClick={() => navigate(-1)} className="text-[#073159] font-bold underline">Go Back</button>
        </div>
    );
  }

  const handlePrint = () => {
    const printContent = document.getElementById("printable-report");
    const originalContents = document.body.innerHTML;

    if (printContent) {
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- Toolbar (Screen Only) --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-[#073159] text-sm font-bold transition-colors"
            >
                <ArrowLeft size={16} className="mr-1" /> Back to Profile
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none px-6 py-2 bg-[#073159] text-white rounded-xl font-bold text-sm hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg"
                >
                    <Printer size={16} /> Print Report
                </button>
            </div>
        </div>

        {/* --- Report Paper Container --- */}
        <div className="bg-gray-100 p-4 md:p-8 rounded-3xl flex justify-center">
            
            {/* The Actual Printable Area */}
            <div id="printable-report" className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[15mm] shadow-xl text-gray-900 font-sans relative">
                
                {/* 1. Report Header */}
                <div className="border-b-2 border-[#073159] pb-6 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Logo Placeholder */}
                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                             <img src={logo} alt="Logo" className="h-12 w-auto object-contain opacity-80" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#073159] uppercase tracking-wide">UrbanVital Lab</h1>
                            <p className="text-xs text-gray-500">Excellence in Diagnostics</p>
                        </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        <p>Kumasi, Ghana</p>
                        <p>+233 54 123 4567</p>
                        <p>lab@urbanvital.com</p>
                    </div>
                </div>

                {/* 2. Patient Info Grid */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Patient Name</p>
                        <p className="font-bold text-lg text-[#073159]">{patient.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 text-xs uppercase font-bold">Lab Request ID</p>
                        <p className="font-mono font-bold text-gray-800">{record.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Age / Gender</p>
                        <p className="font-medium text-gray-800">{patient.age} Yrs / {patient.gender}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 text-xs uppercase font-bold">Date & Time</p>
                        <p className="font-medium text-gray-800">{record.date} • {record.time}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">MRN</p>
                        <p className="font-mono font-medium text-gray-800">{patient.mrn}</p>
                    </div>
                </div>

                {/* 3. Test Title */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800 uppercase border-b border-gray-200 inline-block pb-1">
                        {record.test} Report
                    </h2>
                </div>

                {/* 4. Results Section */}
                <div className="mb-12">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-y border-gray-200 uppercase text-xs text-gray-500">
                            <tr>
                                <th className="py-3 px-4">Investigation</th>
                                <th className="py-3 px-4">Result</th>
                                <th className="py-3 px-4">Reference Range</th>
                                <th className="py-3 px-4 text-right">Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Mocking detailed rows based on the simple result passed */}
                            <tr>
                                <td className="py-4 px-4 font-medium text-gray-700">{record.test} - Main Parameter</td>
                                <td className={`py-4 px-4 font-bold ${
                                    record.result === "Normal" || record.result === "Negative" ? "text-gray-800" : "text-red-600"
                                }`}>
                                    {record.result}
                                </td>
                                <td className="py-4 px-4 text-gray-500">N/A</td>
                                <td className="py-4 px-4 text-right text-gray-500">-</td>
                            </tr>
                            {/* Example placeholder row to make it look realistic */}
                            <tr>
                                <td className="py-4 px-4 font-medium text-gray-700">Remarks / Comment</td>
                                <td className="py-4 px-4 text-gray-600 italic" colSpan={3}>
                                    Verified result. Correlate with clinical findings.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 5. Footer / Signature */}
                <div className="mt-auto pt-12 flex justify-between items-end">
                    <div className="text-center">
                        <div className="h-16 flex items-end justify-center mb-2">
                             {/* Signature Placeholder */}
                             <div className="font-cursive text-2xl text-[#073159] opacity-70">
                                 {record.tech}
                             </div>
                        </div>
                        <div className="border-t border-gray-300 w-40 mx-auto"></div>
                        <p className="text-xs font-bold text-gray-600 mt-2 uppercase">Lab Technician</p>
                        <p className="text-[10px] text-gray-400">{record.tech}</p>
                    </div>

                    <div className="text-center">
                        <div className="h-16 flex items-end justify-center mb-2">
                             <FileCheck className="text-green-600 opacity-50" size={40} />
                        </div>
                        <div className="border-t border-gray-300 w-40 mx-auto"></div>
                        <p className="text-xs font-bold text-gray-600 mt-2 uppercase">Verified By</p>
                        <p className="text-[10px] text-gray-400">Dr. Pathologist</p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="absolute bottom-6 left-0 right-0 text-center px-12">
                    <p className="text-[10px] text-gray-400">
                        This report is electronically generated. For any queries, please contact the laboratory department quoting the Lab Request ID.
                    </p>
                </div>

            </div>
        </div>
    </div>
  );
}