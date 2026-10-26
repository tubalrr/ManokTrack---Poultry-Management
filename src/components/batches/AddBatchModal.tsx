import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { BreedType } from '../../types';
import { computeAgeInDays } from '../../utils/formatters';

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({ isOpen, onClose }) => {
  const { addBatch, addExpense } = useFarm();

  const [batchId, setBatchId] = useState('');
  const [breed, setBreed] = useState<BreedType>('Broiler');
  const [dateStarted, setDateStarted] = useState('2026-10-26');
  const [initialCount, setInitialCount] = useState<number | ''>(1000);
  const [source, setSource] = useState('');
  const [averageWeightKg, setAverageWeightKg] = useState<number | ''>(0.045); // Day 1 chick ~45g
  const [chickCostPerHead, setChickCostPerHead] = useState<number | ''>(42);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const ageInDays = dateStarted ? computeAgeInDays(dateStarted) : 0;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!batchId.trim()) newErrors.batchId = 'Batch ID is required (e.g., B-2024-09)';
    if (!dateStarted) newErrors.dateStarted = 'Date started is required';
    if (!initialCount || initialCount <= 0) newErrors.initialCount = 'Initial count must be greater than 0';
    if (!source.trim()) newErrors.source = 'Hatchery or source is required';
    if (averageWeightKg === '' || Number(averageWeightKg) < 0) {
      newErrors.averageWeightKg = 'Average weight cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const count = Number(initialCount);
    const weight = Number(averageWeightKg);

    await addBatch({
      batchId: batchId.trim().toUpperCase(),
      breed,
      dateStarted,
      initialCount: count,
      currentCount: count,
      mortalityCount: 0,
      source: source.trim(),
      status: 'Active',
      averageWeightKg: weight,
      notes: notes.trim() || undefined,
    });

    // Optionally record chick purchase expense in PHP
    if (chickCostPerHead && Number(chickCostPerHead) > 0) {
      const totalChickCost = count * Number(chickCostPerHead);
      await addExpense({
        batchId: batchId.trim().toUpperCase(),
        date: dateStarted,
        category: 'Chick',
        amountPhp: totalChickCost,
        description: `Purchase of ${count} Day-Old Chicks (${breed}) from ${source} @ ₱${chickCostPerHead}/head`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div>
            <h3 className="text-base font-bold text-stone-900">Add New Flock / Batch</h3>
            <p className="text-xs text-stone-500">Register a new poultry batch into the tracking system</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Batch ID & Breed */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Batch ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g. B-2024-09"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-emerald-600 ${
                  errors.batchId ? 'border-rose-400 bg-rose-50' : 'border-stone-300'
                }`}
              />
              {errors.batchId && <p className="mt-1 text-[11px] text-rose-600">{errors.batchId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Breed Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value as BreedType)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              >
                <option value="Broiler">Broiler (Cobb / Ross)</option>
                <option value="Layer">Layer (Lohmann / Dekalb)</option>
                <option value="Native">Native / Heritage Free-range</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Started & Computed Age */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date Started <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Flock Age (Auto-computed)
              </label>
              <div className="flex h-[38px] items-center rounded-lg border border-stone-200 bg-stone-100 px-3 text-xs font-semibold text-emerald-800">
                <Calendar className="mr-2 h-4 w-4 text-emerald-600" />
                <span>{ageInDays} Day{ageInDays === 1 ? '' : 's'} old</span>
              </div>
            </div>
          </div>

          {/* Row 3: Initial Count & Starting Avg Weight */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Initial Bird Count <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={initialCount}
                onChange={(e) => setInitialCount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1000"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-emerald-600 ${
                  errors.initialCount ? 'border-rose-400 bg-rose-50' : 'border-stone-300'
                }`}
              />
              {errors.initialCount && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.initialCount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Initial Avg Weight (kg)
              </label>
              <input
                type="number"
                step="0.005"
                min="0"
                value={averageWeightKg}
                onChange={(e) => setAverageWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.045"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Row 4: Source & Chick Purchase Cost (PHP) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hatchery / Source Supplier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. San Miguel Bounty Chicks"
                className={`w-full rounded-lg border px-3 py-2 text-xs font-medium focus:outline-emerald-600 ${
                  errors.source ? 'border-rose-400 bg-rose-50' : 'border-stone-300'
                }`}
              />
              {errors.source && <p className="mt-1 text-[11px] text-rose-600">{errors.source}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Chick Price (PHP / head)
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={chickCostPerHead}
                onChange={(e) => setChickCostPerHead(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="42.00"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Housing & Health Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tunnel ventilated House 2. Disinfected with virucidal spray. Brooder set at 33°C."
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
              Create Flock Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
