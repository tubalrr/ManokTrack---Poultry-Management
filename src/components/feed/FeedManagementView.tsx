import React, { useState } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  AlertTriangle,
  Calculator,
  TrendingDown,
  Scale,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { FeedItem } from '../../types';
import { formatPHP, formatNumber } from '../../utils/formatters';

export const FeedManagementView: React.FC = () => {
  const { feedInventory, batches, dailyLogs, restockFeed, addFeedItem, calculateFCR } = useFarm();

  // Restock modal state
  const [restockModalItem, setRestockModalItem] = useState<FeedItem | null>(null);
  const [restockKg, setRestockKg] = useState<number | ''>(500);
  const [newPricePerKg, setNewPricePerKg] = useState<number | ''>('');

  // Add new feed modal state
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [newFeedType, setNewFeedType] = useState('');
  const [newStockKg, setNewStockKg] = useState<number | ''>(500);
  const [newPrice, setNewPrice] = useState<number | ''>(38.00);
  const [newSupplier, setNewSupplier] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // FCR Calculator interactive state
  const [fcrBatchId, setFcrBatchId] = useState(batches[0]?.batchId || '');
  const [customFeedKg, setCustomFeedKg] = useState<number | ''>('');
  const [customWeightGainKg, setCustomWeightGainKg] = useState<number | ''>('');
  const [customEggMassKg, setCustomEggMassKg] = useState<number | ''>('');

  const selectedFcrBatch = batches.find((b) => b.batchId === fcrBatchId);
  const autoFcr = fcrBatchId ? calculateFCR(fcrBatchId) : null;

  // Custom FCR formula
  const activeFeed = customFeedKg !== '' ? Number(customFeedKg) : autoFcr?.totalFeedKg || 0;
  const activeGain = customWeightGainKg !== '' ? Number(customWeightGainKg) : autoFcr?.weightGainKg || 0;
  const activeEggs = customEggMassKg !== '' ? Number(customEggMassKg) : 0;
  const computedFcr =
    activeGain + activeEggs > 0 ? (activeFeed / (activeGain + activeEggs)).toFixed(2) : '0.00';

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || !restockKg || Number(restockKg) <= 0) return;

    await restockFeed(
      restockModalItem.id,
      Number(restockKg),
      newPricePerKg !== '' ? Number(newPricePerKg) : undefined
    );

    setRestockModalItem(null);
    setRestockKg(500);
    setNewPricePerKg('');
  };

  const handleAddFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedType.trim() || !newStockKg || Number(newStockKg) < 0 || !newPrice) return;

    await addFeedItem({
      feedType: newFeedType.trim(),
      stockKg: Number(newStockKg),
      pricePerKg: Number(newPrice),
      supplier: newSupplier.trim() || 'Local Feed Mill',
      notes: newNotes.trim() || undefined,
    });

    setIsAddFeedOpen(false);
    setNewFeedType('');
    setNewStockKg(500);
    setNewPrice(38.00);
    setNewSupplier('');
    setNewNotes('');
  };

  const totalInventoryKg = feedInventory.reduce((sum, f) => sum + f.stockKg, 0);
  const totalInventoryValuePhp = feedInventory.reduce(
    (sum, f) => sum + f.stockKg * f.pricePerKg,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top summary & Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Feed Inventory & FCR Management</h2>
          <p className="text-xs text-stone-500">
            Monitor real-time feed balances, automated deductions upon daily logging, and feed conversion ratios.
          </p>
        </div>

        <button
          onClick={() => setIsAddFeedOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Feed Line</span>
        </button>
      </div>

      {/* KPI Cards for Feed */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Total Feed on Hand</span>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatNumber(totalInventoryKg)} kg
          </div>
          <p className="mt-1 text-xs text-stone-500">~{Math.round(totalInventoryKg / 50)} standard 50kg bags</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Inventory Valuation</span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
            {formatPHP(totalInventoryValuePhp)}
          </div>
          <p className="mt-1 text-xs text-stone-500">Current warehouse valuation</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Stock Status Alerts</span>
          <div className="mt-2 flex items-center gap-2">
            {feedInventory.some((f) => f.stockKg < 50) ? (
              <span className="flex items-center gap-1.5 text-sm font-bold text-rose-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Reorder Required (&lt;50kg)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>All Feeds Sufficient</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500">Safety threshold: 50 kg</p>
        </div>
      </div>

      {/* Feed Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        <div className="border-b border-stone-200 bg-stone-50 px-6 py-3.5 flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900">Current Feed Rations</h3>
          <span className="text-xs text-stone-500">Auto-deducted when daily logs are recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
              <tr>
                <th className="px-5 py-3">Feed Formulation</th>
                <th className="px-5 py-3">Stock Level</th>
                <th className="px-5 py-3">Price / kg (PHP)</th>
                <th className="px-5 py-3">Total Value</th>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {feedInventory.map((item) => {
                const isLow = item.stockKg < 50;
                const value = item.stockKg * item.pricePerKg;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900">{item.feedType}</span>
                        {item.notes && (
                          <span className="text-[11px] text-stone-500 block">{item.notes}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isLow ? 'text-rose-600' : 'text-stone-900'
                          }`}
                        >
                          {item.stockKg} kg
                        </span>
                        {isLow && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">
                            LOW
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-medium text-stone-800">
                      ₱{item.pricePerKg.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-800">
                      {formatPHP(value)}
                    </td>

                    <td className="px-5 py-3.5 text-stone-600">
                      {item.supplier}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setRestockModalItem(item);
                          setNewPricePerKg(item.pricePerKg);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive FCR (Feed Conversion Ratio) Calculator */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Calculator className="h-5 w-5 text-emerald-700" />
          <div>
            <h3 className="text-base font-bold text-stone-900">Feed Conversion Ratio (FCR) Calculator</h3>
            <p className="text-xs text-stone-500">
              Formula: Total Feed Consumed (kg) / (Total Weight Gain + Egg Mass)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Controls */}
          <div className="space-y-4 lg:col-span-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Active Flock (Auto-fill values)
              </label>
              <select
                value={fcrBatchId}
                onChange={(e) => {
                  setFcrBatchId(e.target.value);
                  setCustomFeedKg('');
                  setCustomWeightGainKg('');
                  setCustomEggMassKg('');
                }}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              >
                <option value="">Custom Manual Simulation</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.batchId}>
                    {b.batchId} ({b.breed}) - {b.currentCount} birds @ {b.averageWeightKg}kg
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Total Feed Consumed (kg)
                </label>
                <input
                  type="number"
                  step="1"
                  value={customFeedKg !== '' ? customFeedKg : autoFcr?.totalFeedKg || 0}
                  onChange={(e) => setCustomFeedKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Total Weight Gain (kg)
                </label>
                <input
                  type="number"
                  step="1"
                  value={
                    customWeightGainKg !== ''
                      ? customWeightGainKg
                      : selectedFcrBatch?.breed === 'Layer'
                      ? 0
                      : Math.round(autoFcr?.weightGainKg || 0)
                  }
                  onChange={(e) =>
                    setCustomWeightGainKg(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Egg Mass Produced (kg)
                </label>
                <input
                  type="number"
                  step="1"
                  value={
                    customEggMassKg !== ''
                      ? customEggMassKg
                      : selectedFcrBatch?.breed === 'Layer'
                      ? Math.round(autoFcr?.weightGainKg || 0)
                      : 0
                  }
                  onChange={(e) =>
                    setCustomEggMassKg(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="flex flex-col justify-center rounded-xl border border-stone-200 bg-stone-50 p-5 text-center">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Calculated FCR
            </span>
            <div className="mt-2 text-4xl font-extrabold text-stone-900 font-mono">
              {computedFcr}
            </div>

            <div className="mt-3">
              {Number(computedFcr) > 0 && Number(computedFcr) <= 1.65 ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Excellent Efficiency
                </span>
              ) : Number(computedFcr) <= 1.85 ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Standard Commercial Range
                </span>
              ) : (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold text-stone-700">
                  Check Feed Wastage
                </span>
              )}
            </div>

            <p className="mt-3 text-[11px] text-stone-500 leading-tight">
              A lower FCR indicates that fewer kilograms of feed are required to produce 1 kg of meat or egg mass.
            </p>
          </div>
        </div>
      </div>

      {/* Restock Feed Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-emerald-50">
              <h3 className="text-base font-bold text-stone-900">
                Restock {restockModalItem.feedType}
              </h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Kilograms to Add <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={restockKg}
                  onChange={(e) => setRestockKg(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 500 (10 bags)"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Purchase Price / kg (PHP)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={newPricePerKg}
                  onChange={(e) =>
                    setNewPricePerKg(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                />
              </div>

              {/* Total cost preview */}
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-xs flex justify-between items-center">
                <span className="text-stone-600">Restock Expense:</span>
                <span className="font-bold text-emerald-800 font-mono text-sm">
                  {formatPHP(
                    (Number(restockKg) || 0) *
                      (newPricePerKg !== '' ? Number(newPricePerKg) : restockModalItem.pricePerKg)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Feed Line Modal */}
      {isAddFeedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">Add New Feed Ration</h3>
              <button
                onClick={() => setIsAddFeedOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFeedSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Feed Name / Formulation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFeedType}
                  onChange={(e) => setNewFeedType(e.target.value)}
                  placeholder="e.g. Broiler Finisher Pellet"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Initial Stock (kg) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStockKg}
                    onChange={(e) =>
                      setNewStockKg(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-medium focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price / kg (PHP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supplier / Feed Mill
                </label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  placeholder="e.g. B-Meg Feeds / Robina Agri"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Crude protein %, age recommendation, etc."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddFeedOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Save Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
