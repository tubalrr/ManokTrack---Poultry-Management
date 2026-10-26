import React from 'react';
import { Menu, Plus, RefreshCw, Bell, AlertTriangle } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickLog: () => void;
  onToggleSidebar: () => void;
  onOpenGitHubSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickLog,
  onToggleSidebar,
  onOpenGitHubSync,
}) => {
  const { alerts, resetToDemoData } = useFarm();

  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Overview & Realtime Metrics';
      case 'batches':
        return 'Flock & Batch Management';
      case 'daily-logs':
        return 'Daily Flock Logs';
      case 'feed':
        return 'Feed Inventory & FCR Calculator';
      case 'eggs':
        return 'Egg Production & Grading';
      case 'health':
        return 'Vaccination Schedules & Health';
      case 'finance':
        return 'Farm Financials & P&L';
      case 'reports':
        return 'Batch Reports & Audit Export';
      default:
        return 'Poultry Management';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur-sm sm:px-8 no-print">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-stone-900">ManokTrack</span>
          <span className="text-stone-300">/</span>
          <span className="text-stone-600">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Zone 2: Alerts pill preview */}
      <div className="hidden md:flex items-center gap-4 text-xs">
        {alerts.length > 0 && (
          <button
            onClick={() => {
              if (alerts[0]?.linkTab) onTabChange(alerts[0].linkTab);
            }}
            className="flex items-center gap-2 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span className="font-medium">{alerts.length} Farm Alert{alerts.length > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* Zone 3: Primary Action & Quick log */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenGitHubSync}
          title="GitHub Repository & Code Sync"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100/80 hover:bg-stone-200/80 rounded-lg transition-colors border border-stone-200"
        >
          <svg className="h-3.5 w-3.5 fill-current text-stone-800" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>GitHub Sync</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm('Reset all farm data back to verified 2-batch demo state?')) {
              resetToDemoData();
            }
          }}
          title="Reset demo data"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Demo</span>
        </button>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Log Daily Entry</span>
        </button>
      </div>
    </header>
  );
};
