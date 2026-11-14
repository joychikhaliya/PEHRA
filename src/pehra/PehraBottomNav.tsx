import React from 'react';
import { Home, Clock, ShieldCheck, Bell, User } from 'lucide-react';

interface PehraBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount?: number;
}

export const PehraBottomNav: React.FC<PehraBottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'rounds', label: 'Rounds', icon: ShieldCheck },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-[#F7F7F4]/98 backdrop-blur-md border-t border-[#E5E5DF] px-3 py-1.5 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`pehra-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors relative ${
                isActive
                  ? 'text-[#1B3B48] font-medium'
                  : 'text-[#858D95] hover:text-[#4A5560]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-[19px] h-[19px] transition-transform ${
                    isActive ? 'stroke-[2.2px] text-[#1B3B48]' : 'stroke-[1.6px]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-[#BA3D3B]" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  isActive ? 'font-semibold text-[#1B3B48]' : 'font-normal'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
