import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  ClipboardList,
  Droplet,
  Wheat,
  Skull,
  Egg,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DailyLog } from '../../types';
import { formatDate, exportToCSV } from '../../utils/formatters';
import { AddDailyLogModal } from './AddDailyLogModal';

export const DailyLogsView: React.FC = () => {
  const { dailyLogs, batches } = useFarm();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredLogs = dailyLogs
    .filter((log) => {
      if (selectedBatchId !== 'All' && log.batchId !== selectedBatchId) return false;
      if (filterStartDate && log.date < filterStartDate) return false;
      if (filterEndDate && log.date > filterEndDate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNotes = log.notes?.toLowerCase().includes(q);
        const matchCause = log.mortalityCause?.toLowerCase().includes(q);
        const matchFeed = log.feedType?.toLowerCase().includes(q);
        if (!matchNotes && !matchCause && !matchFeed) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Batch ID',
      'Feed Consumed (kg)',
      'Feed Type',
      'Water Consumed (L)',
      'Mortality Count',
      'Mortality Cause',
      'Eggs Collected (pcs)',
      'Avg Weight (kg)',
      'Notes',
    ];
    const rows = filteredLogs.map((l) => [
      l.date,
      l.batchId,
      l.feedConsumedKg,
      l.feedType || 'N/A',
      l.waterConsumedL,
      l.mortalityCount,
      l.mortalityCause || 'None',
      l.eggsCollectedPcs || 0,
      l.averageWeightKg || 'N/A',
      l.notes || '',
    ]);
    exportToCSV(`manoktrack_daily_logs_${selectedBatchId}_export`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Daily Flock Production Logs</h2>
          <p className="text-xs text-stone-500">
            Audit feed consumption, hydration, egg harvests, and mortality incidents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Daily Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Query Strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600">Flock:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
          >
            <option value="All">All Batches ({dailyLogs.length} logs)</option>
            {batches.map((b) => (
              <option key={b.id} value={b.batchId}>
                {b.batchId} ({b.breed})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600">From:</span>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600">To:</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs focus:outline-emerald-600"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, cause, or feed type..."
            className="w-full rounded-lg border border-stone-300 py-1.5 px-3 text-xs focus:outline-emerald-600"
          />
        </div>

        {(selectedBatchId !== 'All' || filterStartDate || filterEndDate || searchQuery) && (
          <button
            onClick={() => {
              setSelectedBatchId('All');
              setFilterStartDate('');
              setFilterEndDate('');
              setSearchQuery('');
            }}
            className="text-xs text-rose-600 hover:underline font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Feed (kg) & Ration</th>
                <th className="px-4 py-3">Water (L)</th>
                <th className="px-4 py-3">Mortality</th>
                <th className="px-4 py-3">Eggs (pcs)</th>
                <th className="px-4 py-3">Avg Weight</th>
                <th className="px-4 py-3">Field Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    <ClipboardList className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <p className="font-medium text-stone-700">No logs found for these criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {formatDate(log.date)}
                    </td>

                    <td className="px-4 py-3 font-bold text-stone-800 whitespace-nowrap">
                      {log.batchId}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-800">
                          {log.feedConsumedKg} kg
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        {log.feedType || 'General Feed'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-stone-700">
                      {log.waterConsumedL} L
                    </td>

                    <td className="px-4 py-3 font-mono">
                      {log.mortalityCount > 0 ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-rose-600">
                            {log.mortalityCount} loss{log.mortalityCount > 1 ? 'es' : ''}
                          </span>
                          {log.mortalityCause && (
                            <span className="text-[10px] text-stone-500 block truncate max-w-[130px]">
                              {log.mortalityCause}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold">
                      {log.eggsCollectedPcs > 0 ? (
                        <span className="text-amber-700">{log.eggsCollectedPcs}</span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-stone-800">
                      {log.averageWeightKg ? `${log.averageWeightKg} kg` : '-'}
                    </td>

                    <td className="px-4 py-3 text-stone-600 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDailyLogModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultBatchId={selectedBatchId !== 'All' ? selectedBatchId : undefined}
      />
    </div>
  );
};
