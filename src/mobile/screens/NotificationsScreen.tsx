import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Building2,
  CloudRain,
  ShieldAlert,
  Clock,
  Trash2,
} from 'lucide-react';
import { NOTIFICATIONS_DATA, NotificationItem } from '../../data/floodSafeData.ts';

interface NotificationsScreenProps {
  onNavigateTab: (tab: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNavigateTab }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS_DATA);
  const [filter, setFilter] = useState<'ALL' | 'ALERT' | 'EVACUATION' | 'WEATHER' | 'SHELTER'>('ALL');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#173B4D] tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-[#5A7382]">
            {unreadCount} unread emergency broadcasts
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-[#2E7D82] hover:text-[#173B4D] flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark Read</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['ALL', 'ALERT', 'EVACUATION', 'WEATHER', 'SHELTER'] as const).map((cat) => {
          const isSelected = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#173B4D] text-white shadow-sm'
                  : 'bg-white border border-[#E2ECEF] text-[#5A7382] hover:bg-[#EEF7F8]'
              }`}
            >
              {cat === 'ALL'
                ? 'All'
                : cat === 'ALERT'
                ? 'Alerts'
                : cat === 'EVACUATION'
                ? 'Evacuation'
                : cat === 'WEATHER'
                ? 'Weather'
                : 'Shelters'}
            </button>
          );
        })}
      </div>

      {/* Notification Items List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#E2ECEF] text-[#8CA2AE]">
            <Bell className="h-8 w-8 mx-auto mb-2 text-[#8CA2AE]/60" />
            <div className="text-xs font-bold text-[#173B4D]">No notifications to display</div>
          </div>
        ) : (
          filtered.map((item) => {
            const Icon =
              item.type === 'ALERT'
                ? ShieldAlert
                : item.type === 'EVACUATION'
                ? AlertTriangle
                : item.type === 'WEATHER'
                ? CloudRain
                : Building2;

            const iconBg =
              item.type === 'ALERT'
                ? 'bg-[#E85D5D]/10 text-[#E85D5D]'
                : item.type === 'EVACUATION'
                ? 'bg-amber-500/10 text-amber-700'
                : item.type === 'WEATHER'
                ? 'bg-[#2E7D82]/10 text-[#2E7D82]'
                : 'bg-[#173B4D]/10 text-[#173B4D]';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'ALERT') onNavigateTab('alerts');
                  else if (item.type === 'EVACUATION') onNavigateTab('routes');
                  else if (item.type === 'WEATHER') onNavigateTab('weather');
                  else if (item.type === 'SHELTER') onNavigateTab('shelters');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  item.isRead
                    ? 'bg-white border-[#E2ECEF] opacity-80'
                    : 'bg-[#EEF7F8] border-[#DCEFF2] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#5A7382] uppercase tracking-wider">
                        {item.type}
                      </span>
                      <span className="text-[10px] text-[#8CA2AE] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.time}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#173B4D] mt-0.5 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#5A7382] mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
