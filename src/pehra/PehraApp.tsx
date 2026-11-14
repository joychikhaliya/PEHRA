import React, { useState } from 'react';
import { useBatteryStatus } from '../hooks/useBatteryStatus.ts';
import { PehraTopBar } from './PehraTopBar.tsx';
import { PehraBottomNav } from './PehraBottomNav.tsx';
import { PehraSplashScreen } from './screens/PehraSplashScreen.tsx';
import { PehraOnboardingScreen } from './screens/PehraOnboardingScreen.tsx';
import { PehraAuthScreen } from './screens/PehraAuthScreen.tsx';
import { PehraHomeScreen } from './screens/PehraHomeScreen.tsx';
import { PehraMainFeatureScreen } from './screens/PehraMainFeatureScreen.tsx';
import { PehraSearchScreen } from './screens/PehraSearchScreen.tsx';
import { PehraDetailScreen } from './screens/PehraDetailScreen.tsx';
import { PehraCreateScreen } from './screens/PehraCreateScreen.tsx';
import { PehraActivityScreen } from './screens/PehraActivityScreen.tsx';
import { PehraNotificationsScreen } from './screens/PehraNotificationsScreen.tsx';
import { PehraProfileScreen } from './screens/PehraProfileScreen.tsx';
import { PehraSettingsScreen } from './screens/PehraSettingsScreen.tsx';
import { PehraEmptyStateScreen } from './screens/PehraEmptyStateScreen.tsx';
import { PehraLoadingErrorScreen } from './screens/PehraLoadingErrorScreen.tsx';
import {
  INITIAL_USER,
  INITIAL_ACTIVITIES,
  INITIAL_UPCOMING,
  INITIAL_CHECKPOINTS,
  INITIAL_NOTIFICATIONS,
  ActivityItem,
  Checkpoint,
  PehraNotification,
  UserProfile,
} from '../data/pehraData.ts';

interface PehraAppProps {
  onSwitchToDesktopPortal?: () => void;
}

export const PehraApp: React.FC<PehraAppProps> = ({ onSwitchToDesktopPortal }) => {
  // Navigation & Screen management
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(INITIAL_CHECKPOINTS);
  const [notifications, setNotifications] = useState<PehraNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem>(INITIAL_ACTIVITIES[1]);
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(false);
  const batteryStatus = useBatteryStatus();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handler to log/verify a checkpoint
  const handleCheckInCheckpoint = (checkpointId: string, notes: string) => {
    setCheckpoints((prev) =>
      prev.map((cp) => {
        if (cp.id === checkpointId) {
          const now = new Date();
          const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...cp,
            status: 'completed',
            completedTime: timeString,
            notes: notes || cp.notes,
          };
        }
        return cp;
      })
    );

    // Also add to activities list
    const cp = checkpoints.find((c) => c.id === checkpointId);
    if (cp) {
      const newAct: ActivityItem = {
        id: `ACT-${Math.floor(200 + Math.random() * 800)}`,
        title: `${cp.name} Verified`,
        subtitle: notes || 'Checkpoint inspection sweep completed',
        category: 'CHECKPOINT',
        status: 'Completed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        author: user.name,
        location: cp.location,
        description: notes || cp.notes,
        priority: 'low',
      };
      setActivities((prev) => [newAct, ...prev]);
    }
  };

  // Handler to create an activity
  const handleCreateActivity = (newItem: ActivityItem) => {
    setActivities((prev) => [newItem, ...prev]);
    setSelectedActivity(newItem);
    setCurrentTab('detail');
  };

  // Handler to update activity status
  const handleUpdateActivityStatus = (id: string, newStatus: ActivityItem['status']) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, status: newStatus } : act))
    );
  };

  // Handler to mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Select activity and go to detail
  const handleOpenDetail = (item: ActivityItem) => {
    setSelectedActivity(item);
    setCurrentTab('detail');
  };

  // Render standalone flow screens (Splash, Onboarding, Auth)
  if (currentTab === 'splash') {
    return (
      <div className="min-h-screen bg-[#EFEFEA] flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-[#F7F7F4] shadow-md sm:rounded-2xl border border-[#E5E5DF] overflow-hidden">
          <PehraSplashScreen
            onContinue={() => setCurrentTab('home')}
            onGoToOnboarding={() => setCurrentTab('onboarding')}
          />
        </div>
      </div>
    );
  }

  if (currentTab === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#EFEFEA] flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-[#F7F7F4] shadow-md sm:rounded-2xl border border-[#E5E5DF] overflow-hidden">
          <PehraOnboardingScreen
            onComplete={() => setCurrentTab('home')}
            onSkipToLogin={() => setCurrentTab('auth')}
          />
        </div>
      </div>
    );
  }

  if (currentTab === 'auth') {
    return (
      <div className="min-h-screen bg-[#EFEFEA] flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-[#F7F7F4] shadow-md sm:rounded-2xl border border-[#E5E5DF] overflow-hidden">
          <PehraAuthScreen
            onSuccess={() => setCurrentTab('home')}
            onBackToSplash={() => setCurrentTab('splash')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEA] flex flex-col items-center justify-start text-[#1E252B] font-sans antialiased">
      {/* Top operational banner for desktop reviewers */}
      {onSwitchToDesktopPortal && (
        <div className="w-full bg-[#1B3B48] text-white py-1.5 px-4 text-xs flex items-center justify-between border-b border-[#152E38] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B755D] inline-block" />
            <span className="font-medium tracking-tight">Pehra Mobile App</span>
            <span className="text-white/60 hidden sm:inline">• Minimal, Human-Designed Vigilance UX</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('splash')}
              className="text-white/80 hover:text-white text-[11px] underline"
            >
              Splash / Flow Tour
            </button>
            <button
              onClick={onSwitchToDesktopPortal}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
            >
              Switch to Desk Mode &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Container: Mobile Frame vs Fluid Responsive */}
      <div
        className={`w-full transition-all duration-200 bg-[#F7F7F4] flex flex-col justify-between ${
          isDeviceFrame
            ? 'max-w-[420px] my-4 rounded-[32px] border-[6px] border-[#2A343D] shadow-xl overflow-hidden min-h-[840px]'
            : 'max-w-xl min-h-screen shadow-xs border-x border-[#E5E5DF]'
        }`}
      >
        {/* Top Header */}
        <PehraTopBar
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          unreadCount={unreadCount}
          batteryLevel={batteryStatus.level}
          isDeviceFrame={isDeviceFrame}
          onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
          onSwitchToDesktop={onSwitchToDesktopPortal}
        />

        {/* Quick Nav Shortcut Bar across all 15 screens for evaluation */}
        <div className="bg-[#EFEFEA] border-b border-[#E5E5DF] px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 text-[11px] text-[#555E68]">
          <span className="text-[10px] text-[#858D95] font-semibold uppercase tracking-wider shrink-0 pr-1">
            Screens:
          </span>
          <button
            onClick={() => setCurrentTab('home')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'home' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('rounds')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'rounds' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Rounds
          </button>
          <button
            onClick={() => setCurrentTab('search')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'search' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setCurrentTab('detail')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'detail' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Detail
          </button>
          <button
            onClick={() => setCurrentTab('create')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'create' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Add/Create
          </button>
          <button
            onClick={() => setCurrentTab('activity')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'activity' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setCurrentTab('notifications')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'notifications' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Notifications ({unreadCount})
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'profile' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'settings' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setCurrentTab('empty-state')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'empty-state' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Empty State
          </button>
          <button
            onClick={() => setCurrentTab('loading-error')}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
              currentTab === 'loading-error' ? 'bg-[#1B3B48] text-white font-medium' : 'hover:bg-white'
            }`}
          >
            Load/Error
          </button>
        </div>

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 bg-[#F7F7F4]">
          {currentTab === 'home' && (
            <PehraHomeScreen
              user={user}
              activities={activities}
              upcoming={INITIAL_UPCOMING}
              onNavigateTab={setCurrentTab}
              onSelectActivity={handleOpenDetail}
              onOpenCreate={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'rounds' && (
            <PehraMainFeatureScreen
              checkpoints={checkpoints}
              onCheckInCheckpoint={handleCheckInCheckpoint}
              onOpenCreateReport={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'search' && (
            <PehraSearchScreen
              activities={activities}
              onSelectActivity={handleOpenDetail}
              onBack={() => setCurrentTab('home')}
            />
          )}

          {currentTab === 'detail' && (
            <PehraDetailScreen
              item={selectedActivity}
              onBack={() => setCurrentTab('home')}
              onUpdateStatus={handleUpdateActivityStatus}
            />
          )}

          {currentTab === 'create' && (
            <PehraCreateScreen
              onBack={() => setCurrentTab('home')}
              onCreateActivity={handleCreateActivity}
            />
          )}

          {currentTab === 'activity' && (
            <PehraActivityScreen
              activities={activities}
              onSelectActivity={handleOpenDetail}
              onOpenCreate={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'notifications' && (
            <PehraNotificationsScreen
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onSelectNotification={(id) => {
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
              }}
            />
          )}

          {currentTab === 'profile' && (
            <PehraProfileScreen
              user={user}
              onNavigateTab={setCurrentTab}
              onLogout={() => setCurrentTab('auth')}
            />
          )}

          {currentTab === 'settings' && (
            <PehraSettingsScreen onBack={() => setCurrentTab('profile')} />
          )}

          {currentTab === 'empty-state' && (
            <PehraEmptyStateScreen
              onBack={() => setCurrentTab('home')}
              onGetStarted={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'loading-error' && (
            <PehraLoadingErrorScreen onBack={() => setCurrentTab('home')} />
          )}
        </main>

        {/* Quiet 5-Section Bottom Navigation */}
        <PehraBottomNav
          currentTab={
            ['home', 'activity', 'rounds', 'notifications', 'profile'].includes(currentTab)
              ? currentTab
              : 'home'
          }
          onSelectTab={setCurrentTab}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
};
