import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Package,
  CircleDot,
  Syringe,
  Wallet,
  FileSpreadsheet,
  X,
  Wheat,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenGitHubSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenGitHubSync,
}) => {
  const { alerts, feedInventory, healthLogs } = useFarm();

  const lowFeedCount = feedInventory.filter((f) => f.stockKg < 50).length;
  const dueVaccinesCount = healthLogs.filter(
    (h) => h.date === '2026-10-26' && h.status === 'Scheduled'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Flock Batches', icon: Layers },
    { id: 'daily-logs', label: 'Daily Logs', icon: ClipboardList },
    {
      id: 'feed',
      label: 'Feed Inventory',
      icon: Package,
      badge: lowFeedCount > 0 ? `${lowFeedCount} low` : undefined,
      badgeColor: 'text-amber-700 bg-amber-100',
    },
    { id: 'eggs', label: 'Egg Production', icon: CircleDot },
    {
      id: 'health',
      label: 'Health & Vaccines',
      icon: Syringe,
      badge: dueVaccinesCount > 0 ? 'Due' : undefined,
      badgeColor: 'text-rose-700 bg-rose-100',
    },
    { id: 'finance', label: 'Farm Financials', icon: Wallet },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        } no-print`}
      >
        {/* Brand Lockup */}
        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-amber-300 shadow-xs">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-stone-900 block leading-tight">
                ManokTrack
              </span>
              <span className="text-[11px] font-medium text-stone-600 block">
                Poultry Farm System
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-700' : 'text-stone-600 group-hover:text-stone-600'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${
                      item.badgeColor || 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Farm quick status footer */}
        <div className="border-t border-stone-200 p-4 bg-stone-50/70">
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <span>Currency</span>
            <span className="font-semibold text-stone-700 font-mono">PHP (₱)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <span>Database</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              Firestore Cloud
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2">
            <span>Farm Date</span>
            <span className="font-medium text-stone-700 font-mono">Oct 26, 2026</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenGitHubSync?.();
            }}
            className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-stone-200 bg-white py-1.5 px-2 text-[11px] font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors shadow-2xs"
          >
            <svg className="h-3.5 w-3.5 fill-current text-stone-800 shrink-0" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="truncate">GitHub Sync & Download</span>
          </button>
        </div>
      </aside>
    </>
  );
};
