import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Printer,
  CheckCircle,
  Search,
  Wallet,
  FileText,
  Calculator,
  X,
} from "lucide-react";
import { UrbanVitalDocument } from "../../components/UrbanVitalDocument";

export default function StaffBilling() {
  const [selectedBillId, setSelectedBillId] = useState<number | null>(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Mock Data
  const pendingBills = [
    {
      id: 1,
      patient: "Williams Boampong",
      mrn: "UV-2025-0421",
      age: 23,
      phone: "0546732719",
      total: 250.0,
      date: "Today, 10:45 AM",
      invoiceNumber: "INV-009982",
      items: [
        { desc: "General Consultation", cost: 100.0, qty: 1 },
        { desc: "Malaria Test (RDT)", cost: 50.0, qty: 1 },
        { desc: "Paracetamol Infusion", cost: 100.0, qty: 2 },
      ],
    },
    {
      id: 2,
      patient: "Sarah Mensah",
      mrn: "UV-2025-0422",
      age: 45,
      phone: "0209998888",
      total: 80.0,
      date: "Today, 09:30 AM",
      invoiceNumber: "INV-009983",
      items: [{ desc: "Wound Dressing", cost: 80.0, qty: 1 }],
    },
  ];

  const selectedBill = pendingBills.find((b) => b.id === selectedBillId);
  const changeDue =
    selectedBill && amountTendered
      ? parseFloat(amountTendered) - selectedBill.total
      : 0;

  const handleProcessPayment = () => {
    if (!selectedBill) return;
    if (
      paymentMethod === "Cash" &&
      parseFloat(amountTendered || "0") < selectedBill.total
    ) {
      toast.error("Amount tendered is less than total!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success(`Payment Received. Receipt generated.`);
      setLoading(false);
      setIsReceiptModalOpen(true);
    }, 1000);
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

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Wallet className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Billing & Payments
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage invoices, receive payments, and issue receipts.
          </p>
        </div>
      </div>

      {/* Main Content Area: Stacks on mobile, Row on Desktop */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* --- LEFT: INVOICE QUEUE --- */}
        {/* Fixed height on mobile (300px) so user can see list + details */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[300px] lg:h-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Find patient invoice..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pendingBills.map((bill) => (
              <div
                key={bill.id}
                onClick={() => setSelectedBillId(bill.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group ${
                  selectedBillId === bill.id
                    ? "bg-blue-50 border-l-4 border-l-[#073159]"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4
                      className={`font-bold text-sm ${
                        selectedBillId === bill.id
                          ? "text-[#073159]"
                          : "text-gray-800"
                      }`}
                    >
                      {bill.patient}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {bill.mrn}
                    </span>
                  </div>
                  <span className="text-base font-bold text-[#073159]">
                    ₵{bill.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: PAYMENT TERMINAL --- */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[500px] overflow-hidden">
          {selectedBill ? (
            <div className="flex-1 flex flex-col h-full">
              
              {/* 1. Invoice Header */}
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white z-10">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    Invoice Details
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Bill ID: #{selectedBill.invoiceNumber}
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 bg-blue-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                  <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold">
                    Total Due
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-[#073159]">
                    ₵{selectedBill.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                
                {/* 2. Breakdown List (Scrollable) */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto border-r-0 xl:border-r border-gray-100 bg-gray-50/30 min-h-[200px]">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText size={16} /> Itemized Breakdown
                  </h3>
                  <div className="space-y-3">
                    {selectedBill.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm p-3 bg-white border border-gray-100 rounded-lg"
                      >
                        <span className="text-gray-700">
                          {item.desc}{" "}
                          <span className="text-xs text-gray-400">
                            x{item.qty}
                          </span>
                        </span>
                        <span className="font-bold text-gray-900">
                          ₵{item.cost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-800">
                        ₵{selectedBill.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Action Area (Scrollable on small screens) */}
                <div className="w-full xl:w-[400px] p-4 md:p-6 bg-white flex flex-col border-t xl:border-t-0 border-gray-100 overflow-y-auto">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 flex-shrink-0">
                    <button
                      onClick={() => setPaymentMethod("Cash")}
                      className={`p-2 md:p-3 rounded-xl border text-xs font-bold transition-colors ${
                        paymentMethod === "Cash"
                          ? "bg-[#073159] text-white border-[#073159]"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod("MoMo")}
                      className={`p-2 md:p-3 rounded-xl border text-xs font-bold transition-colors ${
                        paymentMethod === "MoMo"
                          ? "bg-[#073159] text-white border-[#073159]"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      MoMo
                    </button>
                    <button
                      onClick={() => setPaymentMethod("Insurance")}
                      className={`p-2 md:p-3 rounded-xl border text-xs font-bold transition-colors ${
                        paymentMethod === "Insurance"
                          ? "bg-[#073159] text-white border-[#073159]"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Insurance
                    </button>
                  </div>

                  {paymentMethod === "Cash" && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-4 mb-6 flex-shrink-0">
                      <div>
                        <label className="text-xs font-bold text-green-700 uppercase">
                          Amount Tendered
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-3 text-green-600 font-bold">
                            ₵
                          </span>
                          <input
                            type="number"
                            className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 outline-none text-lg font-bold text-green-900 bg-white"
                            placeholder="0.00"
                            value={amountTendered}
                            onChange={(e) =>
                              setAmountTendered(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-200">
                        <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                          <Calculator size={16} /> Change Due:
                        </span>
                        <span
                          className={`text-xl font-bold ${
                            changeDue < 0
                              ? "text-red-500"
                              : "text-green-800"
                          }`}
                        >
                          ₵
                          {changeDue >= 0
                            ? changeDue.toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3 pb-2">
                    <button
                      onClick={handleProcessPayment}
                      disabled={
                        loading ||
                        (paymentMethod === "Cash" && changeDue < 0)
                      }
                      className="w-full py-4 bg-[#073159] text-white rounded-xl font-bold shadow-lg hover:bg-[#062a4d] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <CheckCircle size={20} /> Confirm Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
              <p>Select a patient from the list to handle billing.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- RECEIPT MODAL --- */}
      {isReceiptModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="text-green-500 w-5 h-5" /> Receipt Generated
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-[#073159] text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-[#062a4d] flex items-center gap-2 transition-colors"
                >
                  <Printer size={16} /> <span className="hidden sm:inline">Print Now</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Receipt Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-8 flex justify-center">
              <div className="w-full max-w-[210mm] bg-white shadow-lg overflow-hidden">
                  <div className="origin-top transform sm:scale-100 scale-[0.65]">
                      <UrbanVitalDocument
                      title="OFFICIAL RECEIPT"
                      patient={{
                          name: selectedBill.patient,
                          mrn: selectedBill.mrn,
                          age: selectedBill.age,
                          phone: selectedBill.phone,
                      }}
                      doctorName="Agnes (Cashier)"
                      signatoryLabel="Cashier"
                      date={new Date().toLocaleDateString()}
                      >
                      <div className="space-y-6 mt-4">
                          <div className="flex justify-between border-b border-gray-300 pb-2 text-sm">
                          <p>
                              <strong>Invoice No:</strong> {selectedBill.invoiceNumber}
                          </p>
                          <p>
                              <strong>Payment Mode:</strong> {paymentMethod}
                          </p>
                          </div>

                          <table className="w-full text-left text-sm border-collapse">
                          <thead>
                              <tr className="bg-gray-100 border-b border-gray-300">
                              <th className="py-2 px-2">Description</th>
                              <th className="py-2 px-2 text-center">Qty</th>
                              <th className="py-2 px-2 text-right">Cost (₵)</th>
                              </tr>
                          </thead>
                          <tbody>
                              {selectedBill.items.map((item, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                  <td className="py-3 px-2">{item.desc}</td>
                                  <td className="py-3 px-2 text-center">{item.qty}</td>
                                  <td className="py-3 px-2 text-right font-medium">
                                  {item.cost.toFixed(2)}
                                  </td>
                              </tr>
                              ))}
                          </tbody>
                          </table>

                          <div className="flex justify-end pt-4">
                          <div className="w-full sm:w-1/2 space-y-2">
                              <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="font-bold">
                                  ₵{selectedBill.total.toFixed(2)}
                              </span>
                              </div>
                              <div className="flex justify-between border-t-2 border-gray-800 pt-2 text-lg">
                              <span className="font-bold text-[#073159]">
                                  TOTAL PAID:
                              </span>
                              <span className="font-bold text-[#073159]">
                                  ₵{selectedBill.total.toFixed(2)}
                              </span>
                              </div>
                          </div>
                          </div>

                          <div className="flex justify-center mt-8 sm:mt-12">
                          <div className="border-4 border-green-600 text-green-600 font-black text-2xl sm:text-4xl px-6 py-2 rounded-xl -rotate-12 opacity-50">
                              PAID
                          </div>
                          </div>

                          <p className="text-center text-xs text-gray-500 mt-8">
                          Thank you for choosing UrbanVital Health Consult.
                          <br /> Get well soon!
                          </p>
                      </div>
                      </UrbanVitalDocument>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}