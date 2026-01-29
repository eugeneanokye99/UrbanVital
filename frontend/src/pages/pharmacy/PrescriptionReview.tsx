import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import {
    ArrowLeft,
    User,
    Pill,
    AlertCircle,
    ShoppingBag,
    Printer
} from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../assets/urbanvital-logo.png";
import { fetchConsultationById, fetchPharmacyItems, updateConsultation } from "../../services/api";

export default function PrescriptionReview() {
    const navigate = useNavigate();
    const location = useLocation();

    // Data passed from Dashboard
    const { prescription } = location.state || {};

    const [items, setItems] = useState<any[]>([]);
    const [dispensing, setDispensing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (prescription) {
            loadPrescriptionDetails();
        }
    }, [prescription]);

    const loadPrescriptionDetails = async () => {
        try {
            // Parse prescription text and match with inventory
            const prescriptionText = prescription.prescription || '';
            const drugNames = prescriptionText.split(/[\n,]/).filter((item: string) => item.trim());

            // Fetch pharmacy inventory
            const inventory = await fetchPharmacyItems();

            // Match drugs with inventory
            const matchedItems = drugNames.map((drugName: string, index: number) => {
                const trimmedName = drugName.trim();
                const inventoryItem = inventory.find((item: any) =>
                    item.name.toLowerCase().includes(trimmedName.toLowerCase())
                );

                return {
                    id: index,
                    name: trimmedName,
                    dosage: "As prescribed",
                    quantity: 1,
                    price: inventoryItem?.selling_price || 0,
                    inStock: inventoryItem ? inventoryItem.current_stock > 0 : false,
                    inventory_id: inventoryItem?.id
                };
            });

            setItems(matchedItems);
        } catch (error) {
            console.error('Error loading prescription details:', error);
            toast.error('Failed to load prescription details');
        } finally {
            setLoading(false);
        }
    };

    if (!prescription) {
        return <Navigate to="/pharmacy/pharmacydashboard" replace />;
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-10 text-center">
                <div className="animate-spin h-10 w-10 border-4 border-[#073159] border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading prescription...</p>
            </div>
        );
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // --- HANDLERS ---

    const handlePrintLabel = () => {
        // 1. Get print area
        const printContent = document.getElementById("printable-labels");
        const originalContents = document.body.innerHTML;

        if (printContent) {
            // 2. Swap body content with labels
            document.body.innerHTML = printContent.innerHTML;

            // 3. Print
            window.print();

            // 4. Restore original page
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore React state/events
        } else {
            toast.error("Error generating labels");
        }
    };

    const handleDispense = async () => {
        // 1. Validate Stock
        if (items.some((i: any) => !i.inStock)) {
            toast.error("Cannot dispense. Some items are out of stock.");
            return;
        }

        setDispensing(true);

        try {
            // 2. Mark prescription as dispensed
            await updateConsultation(prescription.id, {
                prescription_status: 'Dispensed'
            });

            // 3. Navigate to POS for payment
            navigate("/pharmacy/pharmacypos", {
                state: {
                    prescriptionItems: items,
                    patientId: prescription.patient_id_number,
                    prescriptionId: prescription.id
                }
            });
        } catch (error) {
            console.error('Error updating prescription status:', error);
            toast.error('Failed to update prescription status');
            setDispensing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between no-print">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-[#073159] font-bold text-sm transition-colors"
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to Queue
                </button>
                <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase">Prescription ID</span>
                    <p className="font-mono font-bold text-[#073159]">{prescription.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* --- LEFT: PATIENT INFO --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-14 w-14 bg-[#073159] text-white rounded-full flex items-center justify-center font-bold text-xl">
                                {prescription.patient.charAt(0)}
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">{prescription.patient}</h2>
                                <p className="text-sm text-gray-500">{prescription.mrn}</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Age/Gender:</span>
                                <span className="font-medium text-gray-800">32 / Male</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Payment:</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${prescription.paymentStatus === "Paid"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}>
                                    {prescription.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h3 className="font-bold text-[#073159] flex items-center gap-2 mb-3">
                            <User size={18} /> Prescriber Details
                        </h3>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Doctor:</span> {prescription.doctor}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* --- RIGHT: DRUG REVIEW --- */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Pill size={20} className="text-[#073159]" /> Prescribed Medications
                            </h3>
                            <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500">
                                {items.length} Items
                            </span>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[500px]">
                                <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Drug Name</th>
                                        <th className="px-6 py-4">Dosage</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4 text-right">Price (₵)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-blue-50/20">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                {!item.inStock && (
                                                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                                        <AlertCircle size={10} /> Out of Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{item.dosage}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                                            <td className="px-6 py-4 text-right font-mono font-medium">
                                                {item.price.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50/50">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-xs">Total Amount</td>
                                        <td className="px-6 py-4 text-right font-bold text-xl text-[#073159]">
                                            ₵{totalAmount.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                        <button
                            onClick={handlePrintLabel}
                            className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Printer size={18} /> Print Label
                        </button>
                        <button
                            onClick={handleDispense}
                            disabled={dispensing || items.some((i: any) => !i.inStock)}
                            className="px-8 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {dispensing ? "Processing..." : (
                                <>
                                    <ShoppingBag size={18} /> Confirm & Dispense
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>

            {/* --- HIDDEN PRINT AREA (Drug Labels) --- */}
            <div id="printable-labels" className="hidden">
                <div className="w-[100mm] p-4 font-sans text-black">
                    {items.map((item: any) => (
                        <div key={item.id} className="mb-8 border-2 border-black p-4 rounded-lg break-inside-avoid">
                            <div className="flex items-center gap-2 border-b border-black pb-2 mb-2">
                                <img src={logo} alt="Logo" className="h-8 w-auto grayscale" />
                                <div>
                                    <h3 className="font-bold text-sm uppercase">UrbanVital Pharmacy</h3>
                                    <p className="text-[10px]">Tel: +233 54 123 4567</p>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm">
                                <p><span className="font-bold">Patient:</span> {prescription.patient}</p>
                                <p><span className="font-bold">Drug:</span> {item.name}</p>
                                <p><span className="font-bold">Qty:</span> {item.quantity}</p>
                                <div className="my-2 border border-black p-2 rounded">
                                    <p className="font-bold text-xs uppercase">Dosage Instructions:</p>
                                    <p className="text-lg font-bold">{item.dosage}</p>
                                </div>
                                <p className="text-[10px] italic">Keep out of reach of children.</p>
                                <p className="text-[10px] text-right">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}