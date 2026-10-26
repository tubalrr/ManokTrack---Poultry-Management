import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { computeAgeInDays, formatPHP, formatNumber, formatDate, exportToCSV } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { batches, dailyLogs, expenses, sales, calculateFCR } = useFarm();
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.batchId || 'B-2024-08');

  const selectedBatch = batches.find((b) => b.batchId === selectedBatchId) || batches[0];
  const ageInDays = selectedBatch ? computeAgeInDays(selectedBatch.dateStarted) : 0;
  const mortPct = selectedBatch
    ? (((selectedBatch.mortalityCount || 0) / (selectedBatch.initialCount || 1)) * 100).toFixed(1)
    : '0';
  const fcrMetrics = selectedBatch ? calculateFCR(selectedBatch.batchId) : { totalFeedKg: 0, weightGainKg: 0, fcr: 0 };

  const batchLogs = dailyLogs
    .filter((l) => l.batchId === selectedBatch?.batchId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const batchExpenses = expenses.filter((e) => e.batchId === selectedBatch?.batchId);
  const totalBatchExpenses = batchExpenses.reduce((sum, e) => sum + e.amountPhp, 0);

  const batchSales = sales.filter((s) => s.batchId === selectedBatch?.batchId);
  const totalBatchSales = batchSales.reduce((sum, s) => sum + s.totalPhp, 0);

  const netBatchProfit = totalBatchSales - totalBatchExpenses;
  const marginPct = totalBatchSales > 0 ? ((netBatchProfit / totalBatchSales) * 100).toFixed(1) : '0';

  const totalEggs = batchLogs.reduce((sum, l) => sum + (l.eggsCollectedPcs || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportBatchCSV = () => {
    if (!selectedBatch) return;
    const headers = [
      'Report: Batch Performance Summary',
      selectedBatch.batchId,
      'Breed: ' + selectedBatch.breed,
      'Date Started: ' + selectedBatch.dateStarted,
    ];
    const rows: (string | number)[][] = [
      ['Initial Count', selectedBatch.initialCount],
      ['Current Live Count', selectedBatch.currentCount],
      ['Total Mortality', selectedBatch.mortalityCount],
      ['Mortality Rate (%)', `${mortPct}%`],
      ['Age in Days', ageInDays],
      ['Average Weight (kg)', selectedBatch.averageWeightKg],
      ['Total Feed Consumed (kg)', fcrMetrics.totalFeedKg],
      ['Calculated FCR', fcrMetrics.fcr],
      ['Total Egg Output (pcs)', totalEggs],
      ['Total Direct Expenses (PHP)', totalBatchExpenses],
      ['Total Attributed Revenue (PHP)', totalBatchSales],
      ['Net Profit / Loss (PHP)', netBatchProfit],
      ['Profit Margin (%)', `${marginPct}%`],
      ['--- Daily Logs Breakdown ---', ''],
      ['Date', 'Feed (kg)', 'Water (L)', 'Mortality', 'Eggs (pcs)', 'Avg Weight (kg)', 'Notes'],
      ...batchLogs.map((l) => [
        l.date,
        l.feedConsumedKg,
        l.waterConsumedL,
        l.mortalityCount,
        l.eggsCollectedPcs || 0,
        l.averageWeightKg || '',
        l.notes || '',
      ]),
    ];

    exportToCSV(`manoktrack_batch_${selectedBatch.batchId}_report`, headers, rows);
  };

  const handleExportAllFarmCSV = () => {
    const headers = ['Category', 'Item/Ref', 'Date/Status', 'Quantity/Value', 'Financials PHP'];
    const rows: (string | number)[][] = [
      ...batches.map((b) => ['Flock Batch', b.batchId, b.status, `${b.currentCount} birds`, b.breed]),
      ...expenses.map((e) => ['Expense', e.description, e.date, e.category, -e.amountPhp]),
      ...sales.map((s) => ['Sale / Income', `${s.buyer} (${s.type})`, s.date, `${s.quantity} ${s.unit}`, s.totalPhp]),
    ];
    exportToCSV(`manoktrack_complete_farm_audit_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top action controls (Hidden during print) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Batch Performance & Audit Dossier</h2>
          <p className="text-xs text-stone-500">
            Generate printable batch summaries, official PDF reports, and Excel/CSV audit dumps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-600">Select Flock:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 focus:outline-emerald-600"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.batchId}>
                  {b.batchId} - {b.breed} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportBatchCSV}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportAllFarmCSV}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-stone-500" />
            <span>Master Audit CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shadow-xs transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Official Printable Batch Dossier Document */}
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xs print:p-2 print:border-none print:shadow-none space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-stone-200 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-stone-900 tracking-tight">
                MANOKTRACK COMMERCIAL POULTRY FARM
              </span>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                OFFICIAL REPORT
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Department of Agriculture - BAI Certified Facility · Luzon Operations, Philippines
            </p>
            <p className="text-xs text-stone-600 font-mono">
              Report Generated: Oct 26, 2026 · Farm Auditor ID: MT-VET-092
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-stone-200 sm:pl-6 space-y-0.5">
            <span className="text-xs text-stone-400 block font-medium">Flock Dossier</span>
            <span className="text-2xl font-black text-stone-900 font-mono">
              {selectedBatch?.batchId}
            </span>
            <span className="text-xs font-semibold text-emerald-800 block">
              {selectedBatch?.breed} ({selectedBatch?.status})
            </span>
          </div>
        </div>

        {/* Section 1: Flock Vital Statistics */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            01. Flock Vital Statistics & Performance Indices
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3.5">
              <span className="text-[11px] text-stone-500 block">Days in Farm (Age)</span>
              <span className="text-xl font-bold text-stone-900 font-mono">{ageInDays} Days</span>
              <span className="text-[10px] text-stone-600 block">Started {formatDate(selectedBatch.dateStarted)}</span>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3.5">
              <span className="text-[11px] text-stone-500 block">Headcount & Livability</span>
              <span className="text-xl font-bold text-emerald-800 font-mono">
                {formatNumber(selectedBatch.currentCount)} / {formatNumber(selectedBatch.initialCount)}
              </span>
              <span className="text-[10px] text-stone-600 block">
                {(100 - Number(mortPct)).toFixed(1)}% livability ({selectedBatch.mortalityCount} dead)
              </span>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3.5">
              <span className="text-[11px] text-stone-500 block">Average Weight</span>
              <span className="text-xl font-bold text-stone-900 font-mono">
                {selectedBatch.averageWeightKg} kg
              </span>
              <span className="text-[10px] text-stone-600 block">Sample size 50 birds</span>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3.5">
              <span className="text-[11px] text-stone-500 block">Feed Conversion Ratio (FCR)</span>
              <span className="text-xl font-bold text-amber-700 font-mono">
                {fcrMetrics.fcr}
              </span>
              <span className="text-[10px] text-stone-600 block">{formatNumber(fcrMetrics.totalFeedKg)} kg total feed</span>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Performance Statement */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            02. Attributed Financial Statement (Philippine Peso)
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
              <span className="text-xs font-semibold text-emerald-900 block">Gross Revenue Generated</span>
              <div className="mt-1 text-2xl font-bold text-emerald-800 font-mono">
                {formatPHP(totalBatchSales)}
              </div>
              <span className="text-[10px] text-emerald-700 block">
                From bird harvests and/or graded egg sales
              </span>
            </div>

            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4">
              <span className="text-xs font-semibold text-rose-900 block">Direct Operating Costs</span>
              <div className="mt-1 text-2xl font-bold text-rose-700 font-mono">
                {formatPHP(totalBatchExpenses)}
              </div>
              <span className="text-[10px] text-rose-600 block">
                Chick purchase, feed rations, vaccines, biosecurity
              </span>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-4">
              <span className="text-xs font-semibold text-stone-900 block">Net Profit / (Loss)</span>
              <div
                className={`mt-1 text-2xl font-bold font-mono ${
                  netBatchProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {formatPHP(netBatchProfit)}
              </div>
              <span className="text-[10px] text-stone-500 block">Margin on flock turnover: {marginPct}%</span>
            </div>
          </div>
        </div>

        {/* Section 3: Daily Log Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              03. Operational Feeding & Incident Trail ({batchLogs.length} entries)
            </h3>
            {selectedBatch.breed === 'Layer' && (
              <span className="text-xs font-bold text-amber-700 font-mono">
                Total Eggs Harvested: {formatNumber(totalEggs)} pcs
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Feed (kg)</th>
                  <th className="px-3 py-2">Water (L)</th>
                  <th className="px-3 py-2">Losses</th>
                  {selectedBatch.breed === 'Layer' && <th className="px-3 py-2">Eggs (pcs)</th>}
                  <th className="px-3 py-2">Avg Wt</th>
                  <th className="px-3 py-2">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {batchLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 font-mono">{formatDate(log.date)}</td>
                    <td className="px-3 py-2 font-mono">{log.feedConsumedKg} kg</td>
                    <td className="px-3 py-2 font-mono">{log.waterConsumedL} L</td>
                    <td className="px-3 py-2 font-mono">
                      {log.mortalityCount > 0 ? (
                        <span className="text-rose-600 font-semibold">{log.mortalityCount}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    {selectedBatch.breed === 'Layer' && (
                      <td className="px-3 py-2 font-mono font-bold text-amber-700">
                        {log.eggsCollectedPcs || 0}
                      </td>
                    )}
                    <td className="px-3 py-2 font-mono">
                      {log.averageWeightKg ? `${log.averageWeightKg} kg` : '-'}
                    </td>
                    <td className="px-3 py-2 text-stone-600">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Regulatory Compliance & Sign-Offs */}
        <div className="border-t border-stone-200 pt-8 mt-8">
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] text-stone-400 uppercase font-semibold block">
                  Prepared By:
                </span>
                <div className="mt-8 border-b border-stone-300 w-48" />
                <span className="font-bold text-stone-800 block mt-1">Farm Operations Manager</span>
                <span className="text-[10px] text-stone-400">ManokTrack Bio-Secure Facility</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[11px] text-stone-400 uppercase font-semibold block">
                  Verified & Certified By:
                </span>
                <div className="mt-8 border-b border-stone-300 w-48" />
                <span className="font-bold text-stone-800 block mt-1">Licensed Poultry Veterinarian</span>
                <span className="text-[10px] text-stone-400">PRC License Validated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
