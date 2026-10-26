import React, { useState } from 'react';
import {
  Syringe,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { VACCINE_SCHEDULE_TEMPLATES } from '../../data/initialData';
import { HealthLog } from '../../types';
import { formatPHP, formatDate } from '../../utils/formatters';

export const HealthVaccinationView: React.FC = () => {
  const { healthLogs, batches, addHealthLog, completeVaccination } = useFarm();

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.batchId || 'B-2024-08');
  const [date, setDate] = useState('2026-10-26');
  const [vaccineName, setVaccineName] = useState('Newcastle Disease (LaSota Strain)');
  const [dosage, setDosage] = useState('1 dose per bird via drinking water');
  const [cost, setCost] = useState<number | ''>(1450);
  const [administeredBy, setAdministeredBy] = useState('Dr. Jerry Bautista, DVM');
  const [status, setStatus] = useState<'Scheduled' | 'Completed'>('Completed');
  const [notes, setNotes] = useState('');

  const [filterBatch, setFilterBatch] = useState('All');

  const filteredLogs = healthLogs
    .filter((l) => (filterBatch === 'All' ? true : l.batchId === filterBatch))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleApplyTemplate = (template: (typeof VACCINE_SCHEDULE_TEMPLATES)[0]) => {
    setVaccineName(template.vaccineName);
    setDosage(template.method);
    setNotes(template.description);
    setIsLogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim() || !selectedBatchId) return;

    await addHealthLog({
      batchId: selectedBatchId,
      date,
      vaccineName: vaccineName.trim(),
      dosage: dosage.trim() || 'Standard flock dose',
      cost: Number(cost) || 0,
      administeredBy: administeredBy.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    });

    setIsLogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Health, Biosecurity & Vaccination</h2>
          <p className="text-xs text-stone-500">
            Standard flock immunization schedules, medical treatments, and medication cost ledger.
          </p>
        </div>

        <button
          onClick={() => {
            setStatus('Completed');
            setIsLogOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Log Vaccine / Treatment</span>
        </button>
      </div>

      {/* Standard Vaccination Protocol Reference Template */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Philippine Standard Poultry Immunization Protocol
              </h3>
              <p className="text-xs text-stone-500">
                Click any scheduled vaccine to quickly prefill and log for an active flock
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {VACCINE_SCHEDULE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.day + tpl.vaccineName}
              onClick={() => handleApplyTemplate(tpl)}
              className="cursor-pointer rounded-lg border border-stone-200 bg-stone-50/70 p-3 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 font-mono">Day {tpl.day}</span>
                <span className="text-[10px] font-semibold text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                  {tpl.applicableBreed}
                </span>
              </div>
              <h4 className="font-bold text-stone-900 truncate">{tpl.vaccineName}</h4>
              <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                {tpl.description}
              </p>
              <span className="text-[10px] font-medium text-emerald-700 block pt-1">
                + Use Template →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Logs Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        <div className="border-b border-stone-200 bg-stone-50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-stone-900">Health & Treatment Registry</h3>
            <span className="text-xs text-stone-500">({healthLogs.length} records)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Filter Flock:</span>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 focus:outline-emerald-600"
            >
              <option value="All">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchId}>
                  {b.batchId} ({b.breed})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
              <tr>
                <th className="px-4 py-3">Scheduled / Admin Date</th>
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Vaccine / Medication</th>
                <th className="px-4 py-3">Administration Method</th>
                <th className="px-4 py-3">Cost (PHP)</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                    {formatDate(log.date)}
                  </td>

                  <td className="px-4 py-3 font-bold text-stone-800">
                    {log.batchId}
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-bold text-stone-900 block">{log.vaccineName}</span>
                    {log.notes && (
                      <span className="text-[10px] text-stone-500 block truncate max-w-xs">
                        {log.notes}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-stone-700">
                    {log.dosage}
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-stone-900">
                    {log.cost > 0 ? formatPHP(log.cost) : 'Included'}
                  </td>

                  <td className="px-4 py-3 text-stone-600">
                    {log.administeredBy || 'Farm Caretaker'}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        log.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status === 'Completed' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Administered</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Scheduled</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {log.status === 'Scheduled' && (
                      <button
                        onClick={() => completeVaccination(log.id)}
                        className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Vaccine Modal */}
      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-emerald-50">
              <h3 className="text-base font-bold text-stone-900">Record Vaccine / Medical Care</h3>
              <button
                onClick={() => setIsLogOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Target Batch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.batchId}>
                        {b.batchId} ({b.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Vaccine / Medicine Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  placeholder="e.g. Newcastle LaSota Booster"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dosage / Method
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. Drinking water with skim milk"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cost in PHP (Adds to expenses)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Administered By
                  </label>
                  <input
                    type="text"
                    value={administeredBy}
                    onChange={(e) => setAdministeredBy(e.target.value)}
                    placeholder="e.g. Dr. Jerry Bautista, DVM"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  >
                    <option value="Completed">Completed / Given</option>
                    <option value="Scheduled">Scheduled (Reminder)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Lot #VET-9921, stored in cold chain at 4°C."
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsLogOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Save Health Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
