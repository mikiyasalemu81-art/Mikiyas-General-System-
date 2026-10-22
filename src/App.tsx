import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { SmallBannerList } from './components/common/SmallBanner';
import { ProfileModal } from './components/common/ProfileModal';
import { ProjectIntakeModal } from './components/intake/ProjectIntakeModal';
import { TimeManagementTab } from './components/time/TimeManagementTab';
import { TasksTab } from './components/tasks/TasksTab';
import { FinanceTab } from './components/finance/FinanceTab';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-in-out font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Non-intrusive floating notification banners (small banner) */}
      <SmallBannerList />

      {/* Main Tab Content with smooth animated transitions (slide / fade 250-300ms eased) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24">
        <div key={activeTab} className="animate-fade-in transition-all duration-300 ease-out">
          {activeTab === 'time' && <TimeManagementTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'finance' && <FinanceTab />}
        </div>
      </main>

      {/* Profile Settings Modal */}
      <ProfileModal />

      {/* Imako Solution Project Intake & Antigravity Prompt Generator Wizard */}
      <ProjectIntakeModal />

      {/* Bottom Pinned Tab Bar */}
      <BottomNav />
    </div>
  );
};
