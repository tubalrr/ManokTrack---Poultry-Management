import React, { useState } from 'react';
import { X, ClipboardCheck, AlertCircle } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface AddDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBatchId?: string;
}

export const AddDailyLogModal: React.FC<AddDailyLogModalProps> = ({
  isOpen,
  onClose,
  defaultBatchId,
}) => {
  const { batches, feedInventory, addDailyLog } = useFarm();
  const activeBatches = batches.filter((b) => b.status === 'Active');

  const [batchId, setBatchId] = useState(defaultBatchId || activeBatches[0]?.batchId || '');
  const [date, setDate] = useState('2026-10-26');
  const [feedConsumedKg, setFeedConsumedKg] = useState<number | ''>(115);
  const [feedType, setFeedType] = useState(feedInventory[0]?.feedType || 'Broiler Grower Pellet');
  const [waterConsumedL, setWaterConsumedL] = useState<number | ''>(250);
  const [mortalityCount, setMortalityCount] = useState<number | ''>(0);
  const [mortalityCause, setMortalityCause] = useState('Natural mortality');
  const [eggsCollectedPcs, setEggsCollectedPcs] = useState<number | ''>(0);
  const [averageWeightKg, setAverageWeightKg] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const currentSelectedBatch = batches.find((b) => b.batchId === batchId);
  const isLayer = currentSelectedBatch?.breed === 'Layer';

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!batchId) errs.batchId = 'Please select a batch';
    if (!date) errs.date = 'Date is required';
    if (feedConsumedKg === '' || Number(feedConsumedKg) < 0) {
      errs.feedConsumedKg = 'Feed consumed cannot be negative';
    }
    if (waterConsumedL === '' || Number(waterConsumedL) < 0) {
      errs.waterConsumedL = 'Water consumed cannot be negative';
    }
    if (mortalityCount === '' || Number(mortalityCount) < 0) {
      errs.mortalityCount = 'Mortality cannot be negative';
    }
    if (currentSelectedBatch && Number(mortalityCount) > currentSelectedBatch.currentCount) {
      errs.mortalityCount = `Mortality cannot exceed live count of ${currentSelectedBatch.currentCount}`;
    }
    if (eggsCollectedPcs !== '' && Number(eggsCollectedPcs) < 0) {
      errs.eggsCollectedPcs = 'Eggs collected cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await addDailyLog({
      batchId,
      date,
      feedConsumedKg: Number(feedConsumedKg) || 0,
      feedType,
      waterConsumedL: Number(waterConsumedL) || 0,
      mortalityCount: Number(mortalityCount) || 0,
      mortalityCause: Number(mortalityCount) > 0 ? mortalityCause : undefined,
      eggsCollectedPcs: Number(eggsCollectedPcs) || 0,
      averageWeightKg: averageWeightKg !== '' ? Number(averageWeightKg) : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-emerald-50">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-700" />
            <div>
              <h3 className="text-base font-bold text-stone-900">Record Daily Flock Entry</h3>
              <p className="text-xs text-stone-500">
                Logs feed, water, mortality, eggs & auto-deducts inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Row 1: Batch & Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Flock / Batch <span className="text-rose-500">*</span>
              </label>
              <select
                value={batchId}
                onChange={(e) => {
                  setBatchId(e.target.value);
                  const b = batches.find((item) => item.batchId === e.target.value);
                  if (b?.breed === 'Layer') {
                    setEggsCollectedPcs(900);
                  } else {
                    setEggsCollectedPcs(0);
                  }
                }}
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-emerald-600 ${
                  errors.batchId ? 'border-rose-400 bg-rose-50' : 'border-stone-300'
                }`}
              >
                <option value="">Select a batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.batchId}>
                    {b.batchId} - {b.breed} ({b.currentCount} live)
                  </option>
                ))}
              </select>
              {errors.batchId && <p className="mt-1 text-[11px] text-rose-600">{errors.batchId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Log Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Row 2: Feed & Feed Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Feed Consumed (kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={feedConsumedKg}
                onChange={(e) =>
                  setFeedConsumedKg(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
              <p className="mt-1 text-[10px] text-emerald-700">Auto-deducts from chosen feed stock</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Feed Ration Type
              </label>
              <select
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              >
                {feedInventory.map((f) => (
                  <option key={f.id} value={f.feedType}>
                    {f.feedType} ({f.stockKg} kg in stock)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Water (L) & Average Weight */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Water Consumed (Liters) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={waterConsumedL}
                onChange={(e) =>
                  setWaterConsumedL(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Sample Avg Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={averageWeightKg}
                onChange={(e) =>
                  setAverageWeightKg(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 1.85"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Row 4: Mortality & Cause */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mortality (Count)
              </label>
              <input
                type="number"
                min="0"
                value={mortalityCount}
                onChange={(e) =>
                  setMortalityCount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-rose-500 ${
                  errors.mortalityCount ? 'border-rose-400 bg-rose-50' : 'border-stone-300'
                }`}
              />
              {errors.mortalityCount && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.mortalityCount}</p>
              )}
            </div>

            {Number(mortalityCount) > 0 ? (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mortality Cause
                </label>
                <select
                  value={mortalityCause}
                  onChange={(e) => setMortalityCause(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                >
                  <option value="Natural mortality">Natural mortality</option>
                  <option value="Heat stress">Heat stress</option>
                  <option value="Ascites / water belly">Ascites / water belly</option>
                  <option value="Sudden death syndrome">Sudden death syndrome</option>
                  <option value="Culled runty/deformed">Culled runty / deformed</option>
                  <option value="Egg bound">Egg bound</option>
                  <option value="Respiratory infection">Respiratory infection</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Flock Health Condition
                </label>
                <div className="flex h-[38px] items-center rounded-lg border border-stone-200 bg-stone-50 px-3 text-xs text-stone-600">
                  <span>Zero mortality today · Healthy flock</span>
                </div>
              </div>
            )}
          </div>

          {/* Row 5: Eggs Collected (for Layers) */}
          {isLayer && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
              <label className="block text-xs font-bold text-amber-900">
                Eggs Collected Today (Pieces)
              </label>
              <input
                type="number"
                min="0"
                value={eggsCollectedPcs}
                onChange={(e) =>
                  setEggsCollectedPcs(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-stone-900 focus:outline-amber-600 font-mono"
              />
              <p className="text-[11px] text-amber-800">
                Will also generate graded collection entry (Small, Medium, Large, XL).
              </p>
            </div>
          )}

          {/* Row 6: Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Field Observations & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Foggers ran 11am-2pm, litter condition dry, water nipple lines disinfected."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              Save Daily Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
