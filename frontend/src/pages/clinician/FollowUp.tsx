import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Phone,
  CheckCircle,
  CalendarClock,
  MoreVertical,
  Loader2,
  Plus
} from "lucide-react";
import { fetchAppointments, updateAppointmentStatus } from "../../services/api";
import toast from "react-hot-toast";

export default function ClinicianFollowUp() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [missedCount, setMissedCount] = useState(0);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const timeFilter = activeTab === "upcoming" ? "upcoming" : "missed";
      const data = await fetchAppointments({ time_filter: timeFilter as any });
      setAppointments(data.results || data); // Handle both paginated and non-paginated

      // Also fetch missed count if in upcoming tab, and vice versa
      if (activeTab === "upcoming") {
        const missedData = await fetchAppointments({ time_filter: "missed" });
        setMissedCount(missedData.count || missedData.length || 0);
      }
    } catch (error) {
      console.error("Failed to load appointments", error);
      toast.error("Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [activeTab]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment marked as ${status}`);
      loadAppointments();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
              <CalendarClock className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
              Patient Follow-Ups
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Manage return visits and scheduled reviews.</p>
          </div>
          <button className="w-full md:w-auto bg-[#073159] text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 hover:bg-[#062a4d] transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">
            <Plus size={18} /> Schedule New
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "upcoming" ? "border-[#073159] text-[#073159]" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
          >
            Upcoming & Due
          </button>
          <button
            onClick={() => setActiveTab("missed")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "missed" ? "border-red-500 text-red-500" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
          >
            Missed Appointments
            {missedCount > 0 && (
              <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">{missedCount}</span>
            )}
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#073159] animate-spin" />
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((item) => {
              const date = new Date(item.appointment_date);
              const day = date.getDate();
              const month = date.toLocaleString('default', { month: 'short' });

              return (
                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">

                  {/* Left: Date & Info */}
                  <div className="flex items-start gap-4 w-full md:w-auto">
                    <div className={`h-14 w-14 rounded-xl flex flex-col items-center justify-center font-bold text-xl shrink-0 ${item.status === "Missed" ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#073159]"
                      }`}>
                      {day}
                      <span className="text-[10px] font-normal uppercase">{month}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{item.patient_name || item.patient?.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-[#073159] bg-blue-50 px-2 py-0.5 rounded-lg">{item.reason}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {item.appointment_time}
                        </span>
                      </div>
                      {item.notes && <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">"{item.notes}"</p>}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                    {item.patient_phone && (
                      <button
                        onClick={() => window.location.href = `tel:${item.patient_phone}`}
                        className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Phone size={16} /> Call
                      </button>
                    )}

                    {item.status === "Missed" ? (
                      <button
                        onClick={() => handleStatusUpdate(item.id, 'Rescheduled')}
                        className="flex-1 md:flex-none px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 flex items-center justify-center gap-2 transition-colors"
                      >
                        Reschedule
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(item.id, 'Completed')}
                        className="flex-1 md:flex-none px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-bold hover:bg-green-100 flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle size={16} /> Complete
                      </button>
                    )}

                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <CalendarClock size={48} className="mx-auto mb-4 opacity-20" />
              <p>No {activeTab} appointments found.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}