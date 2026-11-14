import React from 'react';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  Calendar,
  Settings,
  FileCheck,
} from 'lucide-react';
import { PehraNotification } from '../../data/pehraData.ts';

interface PehraNotificationsScreenProps {
  notifications: PehraNotification[];
  onMarkAllRead: () => void;
  onSelectNotification: (id: string) => void;
}

export const PehraNotificationsScreen: React.FC<PehraNotificationsScreenProps> = ({
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (cat: PehraNotification['category']) => {
    switch (cat) {
      case 'security':
        return <ShieldAlert className="w-3.5 h-3.5 text-[#BA3D3B]" />;
      case 'schedule':
        return <Calendar className="w-3.5 h-3.5 text-[#1B3B48]" />;
      case 'report':
        return <FileCheck className="w-3.5 h-3.5 text-[#3B755D]" />;
      case 'system':
      default:
        return <Settings className="w-3.5 h-3.5 text-[#6B727A]" />;
    }
  };

  return (
    <div className="p-5 max-w-lg mx-auto bg-[#F7F7F4] text-[#1E252B] space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-[#1E252B] uppercase tracking-wider">
            Alerts & Dispatches
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-[#1E252B] mt-0.5">
            Notifications
          </h1>
          <p className="text-xs text-[#6B727A] mt-0.5">
            Operational alerts, shift handovers, and review notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-[#1B3B48] hover:underline font-medium pt-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification List with subtle dividers */}
      {notifications.length > 0 ? (
        <div className="bg-white border border-[#E5E5DF] rounded-xl overflow-hidden divide-y divide-[#EFEFEA]">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif.id)}
              className={`p-3.5 hover:bg-[#FBFBF9] transition-colors cursor-pointer flex items-start gap-3 text-left ${
                !notif.read ? 'bg-[#FAFAF7]' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-md bg-[#F7F7F4] border border-[#E5E5DF] flex items-center justify-center shrink-0 mt-0.5">
                {getNotificationIcon(notif.category)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={`text-xs ${
                      !notif.read ? 'font-semibold text-[#1E252B]' : 'font-medium text-[#555E68]'
                    }`}
                  >
                    {notif.title}
                  </span>
                  <span className="text-[11px] text-[#858D95] shrink-0 font-mono">
                    {notif.time}
                  </span>
                </div>

                <p className="text-[11px] text-[#6B727A] leading-relaxed">
                  {notif.description}
                </p>
              </div>

              {!notif.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#1B3B48] mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-white border border-[#E5E5DF] rounded-xl text-center space-y-2">
          <p className="text-sm font-medium text-[#1E252B]">
            All caught up
          </p>
          <p className="text-xs text-[#6B727A]">
            No unread notifications or dispatches at this time.
          </p>
        </div>
      )}

      {/* Quiet Status Note */}
      <div className="p-3 bg-[#EFEFEA] rounded-lg border border-[#E5E5DF] text-[11px] text-[#6B727A] flex items-center justify-between">
        <span>Delivery Mode: Silent Push</span>
        <span>MCGM Disaster Link: Active</span>
      </div>
    </div>
  );
};
