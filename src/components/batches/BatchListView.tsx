import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Skull,
  DollarSign,
  ArrowRightLeft,
  Calendar,
  Layers,
  Scale,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Batch, BatchStatus, BreedType } from '../../types';
import { computeAgeInDays, formatNumber, formatDate } from '../../utils/formatters';
import { AddBatchModal } from './AddBatchModal';
import { BatchDetailModal } from './BatchDetailModal';
import { BatchMortalityModal } from './BatchMortalityModal';
import { SellBatchModal } from './SellBatchModal';
import { TransferBatchModal } from './TransferBatchModal';

export const BatchListView: React.FC = () => {
  const { batches, calculateFCR } = useFarm();

  const [statusFilter, setStatusFilter] = useState<'All' | BatchStatus>('All');
  const [breedFilter, setBreedFilter] = useState<'All' | BreedType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMortalityOpen, setIsMortalityOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const filteredBatches = batches.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (breedFilter !== 'All' && b.breed !== breedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = b.batchId.toLowerCase().includes(q);
      const matchSource = b.source.toLowerCase().includes(q);
      const matchNotes = b.notes?.toLowerCase().includes(q);
      if (!matchId && !matchSource && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top action & title bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Flock & Batch Management</h2>
          <p className="text-xs text-stone-500">
            Track bird lifecycles from Day 1 chick placement to market harvest or layer culling.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Flock Batch</span>
        </button>
      </div>

      {/* Filters and search controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 rounded-lg">
          {(['All', 'Active', 'Sold', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Breed and search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value as any)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 focus:outline-emerald-600"
          >
            <option value="All">All Breeds</option>
            <option value="Broiler">Broiler</option>
            <option value="Layer">Layer</option>
            <option value="Native">Native</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch or hatchery..."
              className="w-full rounded-lg border border-stone-300 py-1.5 pl-8 pr-3 text-xs focus:outline-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Batches Table View */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600">
              <tr>
                <th className="px-4 py-3">Batch ID / Breed</th>
                <th className="px-4 py-3">Age in Days</th>
                <th className="px-4 py-3">Current / Initial</th>
                <th className="px-4 py-3">Mortality</th>
                <th className="px-4 py-3">Avg Weight</th>
                <th className="px-4 py-3">FCR</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Layers className="h-8 w-8 text-stone-300" />
                      <p className="font-medium text-stone-700">No batches match your filter.</p>
                      <button
                        onClick={() => {
                          setStatusFilter('All');
                          setBreedFilter('All');
                          setSearchQuery('');
                        }}
                        className="text-xs text-emerald-700 underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const age = computeAgeInDays(batch.dateStarted);
                  const mortPct = (
                    ((batch.mortalityCount || 0) / (batch.initialCount || 1)) *
                    100
                  ).toFixed(1);
                  const fcrData = calculateFCR(batch.batchId);

                  return (
                    <tr key={batch.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => {
                              setSelectedBatchId(batch.batchId);
                              setIsDetailOpen(true);
                            }}
                            className="font-bold text-stone-900 hover:text-emerald-700 transition-colors text-xs text-left"
                          >
                            {batch.batchId}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span
                              className={`font-semibold ${
                                batch.breed === 'Broiler'
                                  ? 'text-emerald-700'
                                  : batch.breed === 'Layer'
                                  ? 'text-amber-700'
                                  : 'text-stone-700'
                              }`}
                            >
                              {batch.breed}
                            </span>
                            <span>·</span>
                            <span className="truncate max-w-[140px]">{batch.source}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-stone-700">
                        <span className="font-semibold">{age}d</span>
                        <span className="text-[10px] text-stone-400 block">
                          since {formatDate(batch.dateStarted)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-stone-900">
                        <span className="font-bold text-emerald-800">
                          {formatNumber(batch.currentCount)}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          {' '}/ {formatNumber(batch.initialCount)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <span className="font-semibold text-rose-600">
                          {batch.mortalityCount}
                        </span>
                        <span className="text-[10px] text-stone-400 ml-1">({mortPct}%)</span>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-medium text-stone-800">
                        {batch.averageWeightKg} kg
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-amber-700">
                        {fcrData.fcr}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            batch.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'Sold'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBatchId(batch.batchId);
                              setIsDetailOpen(true);
                            }}
                            title="View Dossier & Performance"
                            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {batch.status === 'Active' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBatchId(batch.batchId);
                                  setIsMortalityOpen(true);
                                }}
                                title="Add Mortality"
                                className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50"
                              >
                                <Skull className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedBatchId(batch.batchId);
                                  setIsSellOpen(true);
                                }}
                                title="Sell Flock Harvest"
                                className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"
                              >
                                <DollarSign className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedBatchId(batch.batchId);
                                  setIsTransferOpen(true);
                                }}
                                title="Transfer Housing"
                                className="rounded-md p-1.5 text-stone-600 hover:bg-stone-100"
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddBatchModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <BatchDetailModal
        batchId={selectedBatchId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenMortality={(id) => {
          setSelectedBatchId(id);
          setIsMortalityOpen(true);
        }}
        onOpenSell={(id) => {
          setSelectedBatchId(id);
          setIsSellOpen(true);
        }}
        onOpenTransfer={(id) => {
          setSelectedBatchId(id);
          setIsTransferOpen(true);
        }}
      />

      <BatchMortalityModal
        batchId={selectedBatchId}
        isOpen={isMortalityOpen}
        onClose={() => setIsMortalityOpen(false)}
      />

      <SellBatchModal
        batchId={selectedBatchId}
        isOpen={isSellOpen}
        onClose={() => setIsSellOpen(false)}
      />

      <TransferBatchModal
        batchId={selectedBatchId}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </div>
  );
};
