import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface TransferBatchModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferBatchModal: React.FC<TransferBatchModalProps> = ({
  batchId,
  isOpen,
  onClose,
}) => {
  const { batches, transferBatch } = useFarm();
  const currentBatch = batches.find((b) => b.batchId === batchId || b.id === batchId);

  const [destination, setDestination] = useState('Grower House 2');
  const [reason, setReason] = useState('Standard flock stage progression');
  const [error, setError] = useState('');

  if (!isOpen || !currentBatch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please specify destination housing');
      return;
    }

    await transferBatch(
      currentBatch.batchId,
      `Transferred to ${destination.trim()} (${reason.trim()})`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900">
            <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold">Transfer Flock Housing</h3>
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
            <span className="font-semibold text-stone-900">
              Batch {currentBatch.batchId} ({currentBatch.breed})
            </span>
            <p className="mt-1 text-stone-500">Live Count: {currentBatch.currentCount} birds</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Destination Pen / House <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Grower House 2 / Free Range Paddock B"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Transfer Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Graduated from brooder heat lamp"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              Update Housing Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
