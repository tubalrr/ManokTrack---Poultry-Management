import React, { useState } from 'react';
import { X, Skull } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface BatchMortalityModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BatchMortalityModal: React.FC<BatchMortalityModalProps> = ({
  batchId,
  isOpen,
  onClose,
}) => {
  const { batches, addMortality } = useFarm();
  const currentBatch = batches.find((b) => b.batchId === batchId || b.id === batchId);

  const [count, setCount] = useState<number | ''>(1);
  const [cause, setCause] = useState('Natural mortality');
  const [date, setDate] = useState('2026-10-26');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !currentBatch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!count || Number(count) <= 0) {
      setError('Please enter a valid mortality count');
      return;
    }
    if (Number(count) > currentBatch.currentCount) {
      setError(`Cannot exceed current bird count of ${currentBatch.currentCount}`);
      return;
    }

    await addMortality(currentBatch.batchId, Number(count), `${cause}${notes ? ` - ${notes}` : ''}`, date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-rose-50">
          <div className="flex items-center gap-2 text-rose-800">
            <Skull className="h-5 w-5 text-rose-600" />
            <h3 className="text-base font-bold">Log Flock Mortality</h3>
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
              <span>Flock: {currentBatch.batchId} ({currentBatch.breed})</span>
              <span>Live: {currentBatch.currentCount} birds</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mortality Count (Birds lost) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={currentBatch.currentCount}
              value={count}
              onChange={(e) => {
                setError('');
                setCount(e.target.value === '' ? '' : Number(e.target.value));
              }}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-rose-500"
            />
            {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Primary Cause
            </label>
            <select
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            >
              <option value="Natural mortality">Natural mortality</option>
              <option value="Heat stress">Heat stress</option>
              <option value="Ascites / water belly">Ascites / water belly</option>
              <option value="Sudden death syndrome">Sudden death syndrome</option>
              <option value="Culled runty/deformed">Culled runty / deformed</option>
              <option value="Egg bound">Egg bound (layers)</option>
              <option value="Respiratory infection">Respiratory infection</option>
              <option value="Predator attack">Predator attack</option>
              <option value="Other">Other / Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Found near east air intake, necropsy negative for lesions."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
            />
          </div>

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
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors"
            >
              Confirm Mortality Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
