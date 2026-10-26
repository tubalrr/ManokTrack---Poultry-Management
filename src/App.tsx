/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { BatchListView } from './components/batches/BatchListView';
import { DailyLogsView } from './components/daily-logs/DailyLogsView';
import { FeedManagementView } from './components/feed/FeedManagementView';
import { EggProductionView } from './components/eggs/EggProductionView';
import { HealthVaccinationView } from './components/health/HealthVaccinationView';
import { FinanceView } from './components/finance/FinanceView';
import { ReportsView } from './components/reports/ReportsView';
import { AddDailyLogModal } from './components/daily-logs/AddDailyLogModal';
import { AddBatchModal } from './components/batches/AddBatchModal';
import { GitHubSyncModal } from './components/common/GitHubSyncModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar contract */}
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenQuickLog={() => setIsQuickLogOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={setCurrentTab}
                onOpenQuickLog={() => setIsQuickLogOpen(true)}
                onOpenAddBatch={() => setIsAddBatchOpen(true)}
              />
            )}
            {currentTab === 'batches' && <BatchListView />}
            {currentTab === 'daily-logs' && <DailyLogsView />}
            {currentTab === 'feed' && <FeedManagementView />}
            {currentTab === 'eggs' && <EggProductionView />}
            {currentTab === 'health' && <HealthVaccinationView />}
            {currentTab === 'finance' && <FinanceView />}
            {currentTab === 'reports' && <ReportsView />}
          </div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <AddDailyLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
      />

      <AddBatchModal
        isOpen={isAddBatchOpen}
        onClose={() => setIsAddBatchOpen(false)}
      />

      <GitHubSyncModal
        isOpen={isGitHubSyncOpen}
        onClose={() => setIsGitHubSyncOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FarmProvider>
      <MainApp />
    </FarmProvider>
  );
}
