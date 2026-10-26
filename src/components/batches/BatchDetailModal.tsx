import React, { useState } from 'react';
import {
  X,
  Calendar,
  Scale,
  Skull,
  TrendingDown,
  DollarSign,
  ArrowRightLeft,
  Wheat,
  Egg,
  ClipboardList,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { computeAgeInDays, formatNumber, formatDate } from '../../utils/formatters';

interface BatchDetailModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMortality: (batchId: string) => void;
  onOpenSell: (batchId: string) => void;
  onOpenTransfer: (batchId: string) => void;
}

export const BatchDetailModal: React.FC<BatchDetailModalProps> = ({
  batchId,
  isOpen,
  onClose,
  onOpenMortality,
  onOpenSell,
  onOpenTransfer,
}) => {
  const { batches, dailyLogs, calculateFCR } = useFarm();
  const batch = batches.find((b) => b.batchId === batchId || b.id === batchId);

  if (!isOpen || !batch) return null;

  const ageInDays = computeAgeInDays(batch.dateStarted);
  const mortalityPct = (((batch.mortalityCount || 0) / (batch.initialCount || 1)) * 100).toFixed(1);
  const livabilityPct = (100 - Number(mortalityPct)).toFixed(1);
  const fcrMetrics = calculateFCR(batch.batchId);

  const logs = dailyLogs
    .filter((l) => l.batchId === batch.batchId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalEggs = logs.reduce((sum, l) => sum + (l.eggsCollectedPcs || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-stone-900">{batch.batchId}</span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                batch.breed === 'Broiler'
                  ? 'bg-emerald-100 text-emerald-800'
                  : batch.breed === 'Layer'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {batch.breed}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                batch.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {batch.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3">
              <span className="text-[11px] font-medium text-stone-500 block">Flock Age</span>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {ageInDays} Days
              </span>
              <span className="text-[10px] text-stone-600 block">Started {formatDate(batch.dateStarted)}</span>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3">
              <span className="text-[11px] font-medium text-stone-500 block">Live Headcount</span>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {formatNumber(batch.currentCount)}
              </span>
              <span className="text-[10px] text-stone-600 block">From {formatNumber(batch.initialCount)} DOC</span>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3">
              <span className="text-[11px] font-medium text-stone-500 block">Average Weight</span>
              <span className="text-lg font-bold text-emerald-800 font-mono">
                {batch.averageWeightKg} kg
              </span>
              <span className="text-[10px] text-emerald-700 block">Target {batch.breed === 'Broiler' ? '1.95 kg' : '1.90 kg'}</span>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3">
              <span className="text-[11px] font-medium text-stone-500 block">FCR (Feed Ratio)</span>
              <span className="text-lg font-bold text-amber-700 font-mono">
                {fcrMetrics.fcr}
              </span>
              <span className="text-[10px] text-stone-600 block">{formatNumber(fcrMetrics.totalFeedKg)} kg feed consumed</span>
            </div>
          </div>

          {/* Secondary stats row */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <span className="text-xs text-stone-500">Livability & Mortality</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-700">{livabilityPct}% livability</span>
                <span className="text-xs text-rose-600">({batch.mortalityCount} dead)</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stone-500">Source Hatchery</span>
              <p className="text-xs font-semibold text-stone-900 truncate">{batch.source}</p>
            </div>

            {batch.breed === 'Layer' && (
              <div className="space-y-1">
                <span className="text-xs text-stone-500">Cumulative Egg Output</span>
                <p className="text-xs font-bold text-amber-700 font-mono">
                  {formatNumber(totalEggs)} eggs collected
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons for this batch */}
          {batch.status === 'Active' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  onClose();
                  onOpenMortality(batch.batchId);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
              >
                <Skull className="h-3.5 w-3.5 text-rose-600" />
                <span>Add Mortality</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSell(batch.batchId);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-700" />
                <span>Sell Flock Harvest</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenTransfer(batch.batchId);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-stone-600" />
                <span>Transfer Housing</span>
              </button>
            </div>
          )}

          {/* Batch Notes & Housing History */}
          {batch.notes && (
            <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200">
              <span className="text-xs font-bold text-stone-700 block mb-1">Notes & History</span>
              <p className="text-xs text-stone-600 whitespace-pre-wrap">{batch.notes}</p>
            </div>
          )}

          {/* Recent Daily Logs Table */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-700" />
              <span>Daily Production & Feeding History ({logs.length} entries)</span>
            </h4>
            <div className="overflow-x-auto rounded-lg border border-stone-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Feed (kg)</th>
                    <th className="px-3 py-2">Water (L)</th>
                    <th className="px-3 py-2">Mortality</th>
                    {batch.breed === 'Layer' && <th className="px-3 py-2">Eggs</th>}
                    <th className="px-3 py-2">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-stone-600">
                        No daily logs recorded yet for this batch.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/50">
                        <td className="px-3 py-2 font-mono font-medium">{log.date}</td>
                        <td className="px-3 py-2 font-mono">{log.feedConsumedKg} kg</td>
                        <td className="px-3 py-2 font-mono">{log.waterConsumedL} L</td>
                        <td className="px-3 py-2 font-mono">
                          {log.mortalityCount > 0 ? (
                            <span className="text-rose-600 font-semibold">{log.mortalityCount}</span>
                          ) : (
                            <span className="text-stone-600">0</span>
                          )}
                        </td>
                        {batch.breed === 'Layer' && (
                          <td className="px-3 py-2 font-mono font-semibold text-amber-700">
                            {log.eggsCollectedPcs || 0}
                          </td>
                        )}
                        <td className="px-3 py-2 font-mono">
                          {log.averageWeightKg ? `${log.averageWeightKg} kg` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-stone-200 px-6 py-3 bg-stone-50">
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
