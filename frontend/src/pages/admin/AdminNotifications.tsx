import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Settings, 
  UserPlus, 
  Clock,
  CheckCheck,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchNotifications, markNotificationRead } from '../../services/notifications';
import type { Notification as BackendNotification } from '../../services/notifications';


// Map backend notification action to UI type
type NotificationType = 'urgent' | 'info' | 'success' | 'action' | 'system';

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

function mapBackendNotification(n: BackendNotification): NotificationItem {
  // Map backend action to type
  let type: NotificationType = 'info';
  if (n.action?.toLowerCase().includes('delete') || n.action?.toLowerCase().includes('fail')) type = 'urgent';
  else if (n.action?.toLowerCase().includes('login') || n.action?.toLowerCase().includes('logout')) type = 'system';
  else if (n.action?.toLowerCase().includes('create') || n.action?.toLowerCase().includes('add')) type = 'success';
  else if (n.action?.toLowerCase().includes('update') || n.action?.toLowerCase().includes('edit')) type = 'action';

  // Format time (simple, e.g. just show date/time string)
  const time = new Date(n.created_at).toLocaleString();

  return {
    id: n.id,
    type,
    title: n.action,
    message: n.message,
    time,
    read: n.is_read,
    // Optionally, add actionLabel/onAction for certain actions
  };
}


export default function AdminNotifications() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'system'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const backendNotifs = await fetchNotifications();
        setNotifications(backendNotifs.map(mapBackendNotification));
      } catch (e) {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => markNotificationRead(n.id)));
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success("Notification dismissed");
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    if (filter === 'urgent') return notif.type === 'urgent';
    if (filter === 'system') return notif.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-3">
            <div className="relative">
              <Bell className="w-7 h-7" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-50"></span>}
            </div>
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with system events and required actions.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#073159] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto py-1 gap-2 border-b border-gray-100 no-scrollbar">
        <FilterTab label="All" count={notifications.length} active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Unread" count={unreadCount} active={filter === 'unread'} onClick={() => setFilter('unread')} isUnreadTab />
        <FilterTab label="Urgent" active={filter === 'urgent'} onClick={() => setFilter('urgent')} />
        <FilterTab label="System" active={filter === 'system'} onClick={() => setFilter('system')} />
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id)}
              className={`group relative flex gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer
                ${notif.read 
                  ? "bg-white border-gray-100 hover:border-gray-200 shadow-sm" 
                  : "bg-blue-50/40 border-blue-100 shadow-md hover:shadow-lg"
                }`}
            >
              {/* Icon based on type */}
              <div className="shrink-0">
                <NotificationIcon type={notif.type} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`text-sm font-bold mb-1 flex items-center gap-2 ${notif.read ? 'text-gray-800' : 'text-[#073159]'}`}>
                    {notif.title}
                    {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </h3>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock size={12} /> {notif.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pr-8">{notif.message}</p>
                {/* Action Button if present */}
                {notif.actionLabel && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      notif.onAction?.();
                      markAsRead(notif.id);
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                  >
                    {notif.actionLabel}
                  </button>
                )}
              </div>

              {/* Dismiss Button (appears on hover) */}
              <button 
                onClick={(e) => deleteNotification(notif.id, e)}
                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



// --- Helper Components ---

// 1. Filter Tab Button
function FilterTab({ label, count, active, onClick, isUnreadTab }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
            ${active 
                ? "bg-[#073159] text-white shadow-sm" 
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : isUnreadTab ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {count}
                </span>
            )}
        </button>
    )
}

// 2. Icon based on type
function NotificationIcon({ type }: { type: NotificationType }) {
    switch (type) {
        case 'urgent':
            return <div className="p-3 bg-red-100 text-red-600 rounded-xl"><AlertTriangle size={20} /></div>;
        case 'action':
            return <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><UserPlus size={20} /></div>;
        case 'success':
            return <div className="p-3 bg-green-100 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>;
        case 'system':
            return <div className="p-3 bg-gray-100 text-gray-600 rounded-xl"><Settings size={20} /></div>;
        default: // info
            return <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Info size={20} /></div>;
    }
}

// 3. Empty State
function EmptyState({ filter }: { filter: string }) {
    const messages: {[key: string]: string} = {
        all: "You're all caught up! No notifications.",
        unread: "No unread messages.",
        urgent: "No urgent issues requiring attention.",
        system: "No system logs to display."
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{messages[filter] || messages.all}</p>
        </div>
    );
}