import React, { useState } from 'react';
import {
  Egg,
  Plus,
  DollarSign,
  TrendingUp,
  CircleDot,
  CheckCircle2,
  Calendar,
  X,
  PieChart as PieIcon,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { EggCollection, Sale } from '../../types';
import { formatPHP, formatNumber, formatDate } from '../../utils/formatters';

export const EggProductionView: React.FC = () => {
  const { eggCollections, sales, batches, addEggCollection, addSale } = useFarm();
  const layerBatches = batches.filter((b) => b.breed === 'Layer');

  // Modals state
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);

  // Collection form state
  const [collectBatchId, setCollectBatchId] = useState(layerBatches[0]?.batchId || 'L-2024-04');
  const [collectDate, setCollectDate] = useState('2026-10-26');
  const [gradeSmall, setGradeSmall] = useState<number | ''>(140);
  const [gradeMedium, setGradeMedium] = useState<number | ''>(320);
  const [gradeLarge, setGradeLarge] = useState<number | ''>(345);
  const [gradeXL, setGradeXL] = useState<number | ''>(110);
  const [collectNotes, setCollectNotes] = useState('');

  // Sale form state
  const [saleDate, setSaleDate] = useState('2026-10-26');
  const [saleBuyer, setSaleBuyer] = useState('');
  const [saleTrays, setSaleTrays] = useState<number | ''>(30); // 1 tray = 30 eggs
  const [salePricePerPc, setSalePricePerPc] = useState<number | ''>(7.50);
  const [saleNotes, setSaleNotes] = useState('');

  // Computed total collection today
  const todayStr = '2026-10-26';
  const todayCollection = eggCollections.find((e) => e.date === todayStr);
  const totalEggsToday = todayCollection ? todayCollection.totalEggs : 0;

  // Grade distributions total across all recent records
  const totalSmall = eggCollections.reduce((sum, e) => sum + e.gradeSmall, 0);
  const totalMedium = eggCollections.reduce((sum, e) => sum + e.gradeMedium, 0);
  const totalLarge = eggCollections.reduce((sum, e) => sum + e.gradeLarge, 0);
  const totalXL = eggCollections.reduce((sum, e) => sum + e.gradeXL, 0);
  const totalAllGrades = totalSmall + totalMedium + totalLarge + totalXL || 1;

  // Egg sales only
  const eggSales = sales.filter((s) => s.type === 'Eggs');
  const totalEggRevenueMonth = eggSales.reduce((sum, s) => sum + s.totalPhp, 0);

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEggCollection({
      batchId: collectBatchId,
      date: collectDate,
      gradeSmall: Number(gradeSmall) || 0,
      gradeMedium: Number(gradeMedium) || 0,
      gradeLarge: Number(gradeLarge) || 0,
      gradeXL: Number(gradeXL) || 0,
      notes: collectNotes.trim() || undefined,
    });

    setIsCollectOpen(false);
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleBuyer.trim() || !saleTrays || !salePricePerPc) return;

    const totalEggsSold = Number(saleTrays) * 30;
    const totalPhp = totalEggsSold * Number(salePricePerPc);

    await addSale({
      batchId: collectBatchId,
      date: saleDate,
      type: 'Eggs',
      buyer: saleBuyer.trim(),
      quantity: Number(saleTrays),
      unit: 'trays (30 eggs/tray)',
      unitPricePhp: Number(salePricePerPc) * 30, // price per tray
      totalPhp,
      notes: saleNotes.trim() || undefined,
    });

    setIsSaleOpen(false);
    setSaleBuyer('');
    setSaleNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Egg Production & Grading Console</h2>
          <p className="text-xs text-stone-500">
            Graded egg sorting (Small, Medium, Large, XL) and wholesale tray sales tracking in PHP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <DollarSign className="h-4 w-4" />
            <span>Record Egg Sale</span>
          </button>

          <button
            onClick={() => setIsCollectOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Daily Egg Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Today's Harvest</span>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono">
            {formatNumber(totalEggsToday)} pcs
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {Math.round(totalEggsToday / 30)} trays sorted · 93.2% lay rate
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Primary Quality Grade</span>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            Large ({Math.round((totalLarge / totalAllGrades) * 100)}%)
          </div>
          <p className="mt-1 text-xs text-stone-500">60g-65g premium table egg standard</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Egg Revenue (This Month)</span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
            {formatPHP(totalEggRevenueMonth)}
          </div>
          <p className="mt-1 text-xs text-stone-500">{eggSales.length} commercial wholesale shipments</p>
        </div>
      </div>

      {/* Egg Grading Distribution Visualizer */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Graded Quality Breakdown</h3>
            <p className="text-xs text-stone-500">
              Philippine Bureau of Agriculture and Fisheries Standards (BAFS) egg size classes
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-stone-500">
            Total Sorted: {formatNumber(totalAllGrades)} eggs
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-4 w-full overflow-hidden rounded-full bg-stone-100 flex">
          <div
            style={{ width: `${(totalSmall / totalAllGrades) * 100}%` }}
            className="bg-amber-200"
            title={`Small: ${totalSmall}`}
          />
          <div
            style={{ width: `${(totalMedium / totalAllGrades) * 100}%` }}
            className="bg-amber-400"
            title={`Medium: ${totalMedium}`}
          />
          <div
            style={{ width: `${(totalLarge / totalAllGrades) * 100}%` }}
            className="bg-amber-600"
            title={`Large: ${totalLarge}`}
          />
          <div
            style={{ width: `${(totalXL / totalAllGrades) * 100}%` }}
            className="bg-amber-800"
            title={`Extra Large: ${totalXL}`}
          />
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
          <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-200" />
              <span>Small (Peewee / 45-50g)</span>
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-stone-900">
              {formatNumber(totalSmall)}
            </div>
            <span className="text-[10px] text-stone-500">
              {((totalSmall / totalAllGrades) * 100).toFixed(1)}% of harvest
            </span>
          </div>

          <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>Medium (50-55g)</span>
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-stone-900">
              {formatNumber(totalMedium)}
            </div>
            <span className="text-[10px] text-stone-500">
              {((totalMedium / totalAllGrades) * 100).toFixed(1)}% of harvest
            </span>
          </div>

          <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
              <span>Large (55-60g)</span>
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-stone-900">
              {formatNumber(totalLarge)}
            </div>
            <span className="text-[10px] text-stone-500">
              {((totalLarge / totalAllGrades) * 100).toFixed(1)}% of harvest
            </span>
          </div>

          <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-800" />
              <span>Extra Large (60g+)</span>
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-stone-900">
              {formatNumber(totalXL)}
            </div>
            <span className="text-[10px] text-stone-500">
              {((totalXL / totalAllGrades) * 100).toFixed(1)}% of harvest
            </span>
          </div>
        </div>
      </div>

      {/* Two columns: Daily Collection Log & Egg Sales Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Collections Table */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900">Recent Graded Collections</h3>
            <span className="text-xs text-stone-500">Layer House A</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Total Eggs</th>
                  <th className="px-4 py-2.5">S / M / L / XL</th>
                  <th className="px-4 py-2.5">Trays</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {eggCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900">
                      {formatDate(col.date)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-700">
                      {formatNumber(col.totalEggs)}
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-600">
                      {col.gradeSmall} · {col.gradeMedium} · {col.gradeLarge} · {col.gradeXL}
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-500">
                      {(col.totalEggs / 30).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Egg Sales Ledger */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900">Egg Sales & Customer Receipts</h3>
            <span className="text-xs font-semibold text-emerald-800">Paid in PHP</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Buyer</th>
                  <th className="px-4 py-2.5">Volume</th>
                  <th className="px-4 py-2.5">Revenue (PHP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {eggSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                      No egg sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  eggSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-mono font-medium text-stone-900">
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-stone-900 block">{sale.buyer}</span>
                        {sale.notes && (
                          <span className="text-[10px] text-stone-500 block truncate max-w-xs">
                            {sale.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-700">
                        {sale.quantity} {sale.unit}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-800">
                        {formatPHP(sale.totalPhp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Egg Collection Modal */}
      {isCollectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-amber-50">
              <h3 className="text-base font-bold text-stone-900">Log Daily Graded Egg Collection</h3>
              <button
                onClick={() => setIsCollectOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCollectionSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Layer Batch
                  </label>
                  <select
                    value={collectBatchId}
                    onChange={(e) => setCollectBatchId(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  >
                    {layerBatches.map((b) => (
                      <option key={b.id} value={b.batchId}>
                        {b.batchId} ({b.currentCount} hens)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={collectDate}
                    onChange={(e) => setCollectDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 block">Graded Egg Count (Pieces)</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Small (Peewee)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gradeSmall}
                      onChange={(e) =>
                        setGradeSmall(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Medium
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gradeMedium}
                      onChange={(e) =>
                        setGradeMedium(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Large
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gradeLarge}
                      onChange={(e) =>
                        setGradeLarge(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Extra Large (XL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={gradeXL}
                      onChange={(e) =>
                        setGradeXL(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-xs">
                  <span className="font-semibold text-stone-700">Total Eggs Computed:</span>
                  <span className="font-mono text-base font-extrabold text-amber-700">
                    {Number(gradeSmall || 0) +
                      Number(gradeMedium || 0) +
                      Number(gradeLarge || 0) +
                      Number(gradeXL || 0)}{' '}
                    pcs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="e.g. Shell quality firm, dirt-free, stored in cooling chamber."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCollectOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Egg Sale Modal */}
      {isSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-emerald-50">
              <h3 className="text-base font-bold text-stone-900">Record Egg Wholesale Sale</h3>
              <button
                onClick={() => setIsSaleOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Buyer / Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={saleBuyer}
                  onChange={(e) => setSaleBuyer(e.target.value)}
                  placeholder="e.g. Balintawak Market Distributor / Aling Nena Bakery"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Trays Sold (30 eggs/tray) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={saleTrays}
                    onChange={(e) =>
                      setSaleTrays(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                  <span className="text-[10px] text-stone-500">
                    = {(Number(saleTrays) || 0) * 30} individual eggs
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price / Piece (PHP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min="1"
                    value={salePricePerPc}
                    onChange={(e) =>
                      setSalePricePerPc(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                  <span className="text-[10px] text-stone-500">
                    = ₱{((Number(salePricePerPc) || 0) * 30).toFixed(2)} / tray
                  </span>
                </div>
              </div>

              {/* Total revenue callout */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">Total Sale Amount</span>
                <span className="text-base font-extrabold text-emerald-800 font-mono">
                  {formatPHP((Number(saleTrays) || 0) * 30 * (Number(salePricePerPc) || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="e.g. Paid in cash on farm pick-up. Receipt #EG-9910."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsSaleOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Record Sale & Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
