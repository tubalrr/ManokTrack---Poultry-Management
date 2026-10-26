import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { formatPHP } from '../../utils/formatters';

interface SellBatchModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SellBatchModal: React.FC<SellBatchModalProps> = ({ batchId, isOpen, onClose }) => {
  const { batches, sellBatch } = useFarm();
  const currentBatch = batches.find((b) => b.batchId === batchId || b.id === batchId);

  const [buyer, setBuyer] = useState('');
  const [countSold, setCountSold] = useState<number | ''>(currentBatch ? currentBatch.currentCount : 0);
  const [pricePerBird, setPricePerBird] = useState<number | ''>(
    currentBatch?.breed === 'Broiler' ? 220 : currentBatch?.breed === 'Native' ? 260 : 180
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !currentBatch) return null;

  const totalRevenue = (Number(countSold) || 0) * (Number(pricePerBird) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer.trim()) {
      setError('Buyer name is required');
      return;
    }
    if (!countSold || Number(countSold) <= 0) {
      setError('Quantity to sell must be greater than 0');
      return;
    }
    if (Number(countSold) > currentBatch.currentCount) {
      setError(`Cannot sell more than available live flock count (${currentBatch.currentCount})`);
      return;
    }
    if (!pricePerBird || Number(pricePerBird) <= 0) {
      setError('Price per bird is required');
      return;
    }

    await sellBatch(
      currentBatch.batchId,
      buyer.trim(),
      Number(countSold),
      Number(pricePerBird),
      notes.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-emerald-50">
          <div className="flex items-center gap-2 text-emerald-900">
            <DollarSign className="h-5 w-5 text-emerald-700" />
            <h3 className="text-base font-bold">Sell Flock / Harvest</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 text-xs">
            <div className="flex justify-between font-semibold text-stone-900">
              <span>Batch {currentBatch.batchId} ({currentBatch.breed})</span>
              <span>Available: {currentBatch.currentCount} birds</span>
            </div>
            <p className="mt-1 text-stone-500">
              Avg Weight: {currentBatch.averageWeightKg} kg/bird
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Buyer / Merchant Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              placeholder="e.g. Bounty Fresh / Meat Dealer"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Birds Sold <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={currentBatch.currentCount}
                value={countSold}
                onChange={(e) => setCountSold(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Price / Bird (PHP) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={pricePerBird}
                onChange={(e) => setPricePerBird(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Revenue Calculation Callout */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">Total Income (PHP)</span>
            <span className="text-base font-bold text-emerald-800 font-mono">
              {formatPHP(totalRevenue)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Transaction Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash on farm gate collection. Delivered by buyer truck."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-xs transition-colors"
            >
              Confirm Sale & Record Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
