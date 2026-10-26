import React from 'react';
import {
  Bird,
  Egg,
  Package,
  Skull,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Calendar,
  Syringe,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFarm } from '../../context/FarmContext';
import { formatPHP, formatNumber } from '../../utils/formatters';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickLog: () => void;
  onOpenAddBatch: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickLog,
  onOpenAddBatch,
}) => {
  const {
    batches,
    dailyLogs,
    totalBirdsAlive,
    totalEggsToday,
    totalFeedStockKg,
    mortalityThisWeek,
    profitThisMonth,
    alerts,
    completeVaccination,
  } = useFarm();

  // Prepare 7-day egg production data
  // Dates: Oct 20 to Oct 26
  const past7Days = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26'];
  const eggTrendData = past7Days.map((dateStr) => {
    const logs = dailyLogs.filter((l) => l.date === dateStr);
    const eggs = logs.reduce((sum, l) => sum + (l.eggsCollectedPcs || 0), 0);
    const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      date: dayLabel,
      fullDate: dateStr,
      eggs,
      target: 900,
    };
  });

  // Prepare Feed consumption data (Broiler vs Layer)
  const feedTrendData = past7Days.map((dateStr) => {
    const logs = dailyLogs.filter((l) => l.date === dateStr);
    const broilerFeed = logs
      .filter((l) => l.batchId.startsWith('B-'))
      .reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);
    const layerFeed = logs
      .filter((l) => l.batchId.startsWith('L-'))
      .reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);
    const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

    return {
      date: dayLabel,
      Broiler: broilerFeed,
      Layer: layerFeed,
      Total: broilerFeed + layerFeed,
    };
  });

  // Prepare Mortality rate trend
  const mortalityTrendData = past7Days.map((dateStr) => {
    const logs = dailyLogs.filter((l) => l.date === dateStr);
    const count = logs.reduce((sum, l) => sum + (l.mortalityCount || 0), 0);
    const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    // rate relative to total active birds (~2,400)
    const rate = Number(((count / (totalBirdsAlive || 2400)) * 100).toFixed(2));

    return {
      date: dayLabel,
      birds: count,
      rate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero Farm Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-emerald-950 text-white shadow-sm">
        <img
          src="/src/assets/images/poultry_farm_hero_1793020308575.jpg"
          alt="Poultry Farm Operations"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Farm Management Console
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance">
              ManokTrack Bio-Secure Poultry Operations
            </h1>
            <p className="mt-2 text-sm text-stone-300 leading-relaxed">
              Monitoring 2 active commercial flocks ({batches.filter((b) => b.status === 'Active').length} Batches).
              Automated feed deduction, real-time egg grading, FCR tracking, and Philippine Peso financial ledger.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Record Daily Log</span>
            </button>
            <button
              onClick={() => onNavigateTab('eggs')}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              <Egg className="h-4 w-4 text-amber-300" />
              <span>Egg Production</span>
            </button>
            <button
              onClick={onOpenAddBatch}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              <Bird className="h-4 w-4 text-emerald-300" />
              <span>Add New Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Farm Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Farm Priority Alerts ({alerts.length})</span>
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between rounded-xl border p-4 transition-all ${
                  alert.type === 'danger'
                    ? 'border-rose-200 bg-rose-50/70 text-rose-950'
                    : 'border-amber-200 bg-amber-50/70 text-amber-950'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {alert.title}
                  </span>
                  <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
                </div>
                {alert.linkTab && (
                  <button
                    onClick={() => onNavigateTab(alert.linkTab!)}
                    className="ml-4 shrink-0 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-white text-stone-900 transition-colors flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* 1. Total Birds Alive */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Birds Alive</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Bird className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
              {formatNumber(totalBirdsAlive)}
            </span>
            <span className="ml-1 text-xs text-stone-500">birds</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
            <span>2 Active Flocks</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">97.1% livability</span>
          </div>
        </div>

        {/* 2. Total Eggs Today */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Eggs Collected Today</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Egg className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
              {formatNumber(totalEggsToday)}
            </span>
            <span className="ml-1 text-xs text-stone-500">pcs</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
            <span>~{Math.round(totalEggsToday / 30)} trays</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">93.2% lay rate</span>
          </div>
        </div>

        {/* 3. Feed Stock in Kg */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Feed Inventory</span>
            <div className="rounded-lg bg-stone-100 p-2 text-stone-700">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
              {formatNumber(totalFeedStockKg)}
            </span>
            <span className="ml-1 text-xs text-stone-500">kg</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700 font-medium">
            <span>Grower pellet low (42kg)</span>
          </div>
        </div>

        {/* 4. Mortality this week */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Mortality (7 Days)</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <Skull className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
              {formatNumber(mortalityThisWeek)}
            </span>
            <span className="ml-1 text-xs text-stone-500">losses</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
            <span>Avg 1.8 birds/day</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Normal</span>
          </div>
        </div>

        {/* 5. Total Profit this Month */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Net Profit (Oct)</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                profitThisMonth >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatPHP(profitThisMonth)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500">
            <span>Philippine Peso</span>
            <span>·</span>
            <span>P&L active</span>
          </div>
        </div>
      </div>

      {/* Charts Section: 3 Comprehensive Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Daily Egg Production (Last 7 Days) */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Egg Production</h3>
              <p className="text-xs text-stone-500">Daily pieces collected (Last 7 days)</p>
            </div>
            <button
              onClick={() => onNavigateTab('eggs')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Grades →
            </button>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eggTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[800, 1000]} />
                <Tooltip
                  formatter={(value: any) => [`${value} eggs`, 'Collected']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="eggs"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#eggGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
            <span>7-day Peak: 930 pcs</span>
            <span>Target: 900+ pcs/day</span>
          </div>
        </div>

        {/* Chart 2: Feed Consumption (Broiler vs Layer) */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Feed Consumption</h3>
              <p className="text-xs text-stone-500">Broiler vs Layer intake (kg/day)</p>
            </div>
            <button
              onClick={() => onNavigateTab('feed')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Inventory →
            </button>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} kg`, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Broiler" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Layer" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
            <span>Broiler intake rising with age</span>
            <span>Layer intake steady (~115kg)</span>
          </div>
        </div>

        {/* Chart 3: Mortality Rate */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Daily Mortality Trend</h3>
              <p className="text-xs text-stone-500">Flock loss count across all houses</p>
            </div>
            <button
              onClick={() => onNavigateTab('batches')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Batches →
            </button>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mortalityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 5]} />
                <Tooltip
                  formatter={(value: any) => [`${value} birds`, 'Losses']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="birds"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#e11d48' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-2">
            <span>Weekly Total: {mortalityThisWeek} birds</span>
            <span className="text-emerald-700 font-medium">Below 1% threshold</span>
          </div>
        </div>
      </div>

      {/* Active Batches Snapshot & Quick Action Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Batches Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Active Commercial Flocks</h3>
              <p className="text-xs text-stone-500">Current live headcount & performance</p>
            </div>
            <button
              onClick={() => onNavigateTab('batches')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Manage All →
            </button>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {batches.map((batch) => {
              const mortalityPct = (
                ((batch.mortalityCount || 0) / (batch.initialCount || 1)) *
                100
              ).toFixed(1);
              return (
                <div key={batch.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{batch.batchId}</span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-sm ${
                          batch.breed === 'Broiler'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : batch.breed === 'Layer'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}
                      >
                        {batch.breed}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          batch.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-2">
                      <span>Source: {batch.source}</span>
                      <span>·</span>
                      <span>Started: {batch.dateStarted}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-stone-900 tabular-nums">
                      {formatNumber(batch.currentCount)} / {formatNumber(batch.initialCount)}
                    </div>
                    <div className="text-xs text-stone-500">
                      <span>Avg: {batch.averageWeightKg} kg</span>
                      <span className="mx-1">·</span>
                      <span className="text-rose-600 tabular-nums">{mortalityPct}% mort.</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Farm Tasks & Vaccination Queue */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Vaccine & Health Tasks</h3>
              <p className="text-xs text-stone-500">Schedule protocols for flock immunity</p>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Health Log →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <Syringe className="h-3.5 w-3.5 text-amber-600" />
                  <span>ND LaSota Booster (Day 32)</span>
                  <span className="ml-1 rounded bg-amber-200/80 px-1.5 py-0.2 text-[10px] text-amber-900">
                    DUE TODAY
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  Batch B-2024-08 (Broiler) · 1,442 birds via drinking water with stabilizer
                </p>
              </div>
              <button
                onClick={() => {
                  completeVaccination('health-due-today');
                  window.alert('Marked ND LaSota booster as completed!');
                }}
                className="ml-3 shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                Mark Done
              </button>
            </div>

            <div className="flex items-start justify-between rounded-lg border border-stone-200 bg-stone-50/60 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Broiler Starter Crumble (House 1)</span>
                </div>
                <p className="text-xs text-stone-500">
                  Morning and afternoon ration delivered (218 kg logged today)
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700">Completed</span>
            </div>

            <div className="flex items-start justify-between rounded-lg border border-stone-200 bg-stone-50/60 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                  <Egg className="h-3.5 w-3.5 text-amber-500" />
                  <span>Layer Shed A Egg Candling & Tray Sorting</span>
                </div>
                <p className="text-xs text-stone-500">
                  915 eggs collected and graded (345 Large, 320 Medium, 140 Small, 110 XL)
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
