import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  Receipt,
  DollarSign,
  Download,
  Calendar,
  X,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Expense, ExpenseCategory, Sale, SaleType } from '../../types';
import { formatPHP, formatNumber, formatDate, exportToCSV } from '../../utils/formatters';

export const FinanceView: React.FC = () => {
  const { expenses, sales, batches, addExpense, addSale } = useFarm();

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income' | 'batch-pl'>('overview');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Modals state
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);

  // New Expense form
  const [expDate, setExpDate] = useState('2026-10-26');
  const [expBatchId, setExpBatchId] = useState(batches[0]?.batchId || '');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Feed');
  const [expAmount, setExpAmount] = useState<number | ''>(5000);
  const [expDesc, setExpDesc] = useState('');
  const [expReceipt, setExpReceipt] = useState('');

  // New Income form
  const [incDate, setIncDate] = useState('2026-10-26');
  const [incBatchId, setIncBatchId] = useState(batches[0]?.batchId || '');
  const [incType, setIncType] = useState<SaleType>('Eggs');
  const [incBuyer, setIncBuyer] = useState('');
  const [incQuantity, setIncQuantity] = useState<number | ''>(50);
  const [incUnit, setIncUnit] = useState('trays');
  const [incUnitPrice, setIncUnitPrice] = useState<number | ''>(225);
  const [incNotes, setIncNotes] = useState('');

  // Computations
  const filteredSales = sales.filter((s) => s.date.startsWith(selectedMonth));
  const filteredExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  const totalIncome = filteredSales.reduce((sum, s) => sum + s.totalPhp, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amountPhp, 0);
  const netProfit = totalIncome - totalExpense;
  const marginPct = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Category breakdown for expenses
  const expenseByCategory: { [key: string]: number } = {};
  filteredExpenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amountPhp;
  });

  // Income by type
  const incomeByType: { [key: string]: number } = {};
  filteredSales.forEach((s) => {
    incomeByType[s.type] = (incomeByType[s.type] || 0) + s.totalPhp;
  });

  // Batch P&L calculation
  const batchPL = batches.map((b) => {
    const batchSales = sales
      .filter((s) => s.batchId === b.batchId)
      .reduce((sum, s) => sum + s.totalPhp, 0);
    const batchExpenses = expenses
      .filter((e) => e.batchId === b.batchId)
      .reduce((sum, e) => sum + e.amountPhp, 0);
    const batchNet = batchSales - batchExpenses;
    return {
      batch: b,
      sales: batchSales,
      expenses: batchExpenses,
      net: batchNet,
      margin: batchSales > 0 ? ((batchNet / batchSales) * 100).toFixed(1) : '0',
    };
  });

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0 || !expDesc.trim()) return;

    await addExpense({
      batchId: expBatchId || undefined,
      date: expDate,
      category: expCategory,
      amountPhp: Number(expAmount),
      description: expDesc.trim(),
      receiptRef: expReceipt.trim() || undefined,
    });

    setIsExpenseOpen(false);
    setExpDesc('');
    setExpReceipt('');
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incBuyer.trim() || !incQuantity || !incUnitPrice) return;

    const totalPhp = Number(incQuantity) * Number(incUnitPrice);

    await addSale({
      batchId: incBatchId || undefined,
      date: incDate,
      type: incType,
      buyer: incBuyer.trim(),
      quantity: Number(incQuantity),
      unit: incUnit,
      unitPricePhp: Number(incUnitPrice),
      totalPhp,
      notes: incNotes.trim() || undefined,
    });

    setIsIncomeOpen(false);
    setIncBuyer('');
    setIncNotes('');
  };

  const handleExportFinancials = () => {
    const headers = ['Date', 'Type', 'Category / Item', 'Batch', 'Amount (PHP)', 'Notes / Buyer'];
    const rows = [
      ...expenses.map((e) => [
        e.date,
        'Expense',
        e.category,
        e.batchId || 'Farm Overhead',
        -e.amountPhp,
        e.description,
      ]),
      ...sales.map((s) => [
        s.date,
        'Income',
        s.type,
        s.batchId || 'General',
        s.totalPhp,
        `${s.buyer} (${s.quantity} ${s.unit})`,
      ]),
    ].sort((a, b) => new Date(String(b[0])).getTime() - new Date(String(a[0])).getTime());

    exportToCSV(`manoktrack_financial_ledger_${selectedMonth}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Farm Finances & Profit / Loss</h2>
          <p className="text-xs text-stone-500">
            Track operational expenses, revenue streams, and per-flock net profitability in PHP (₱).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportFinancials}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Export Financials</span>
          </button>

          <button
            onClick={() => setIsExpenseOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => setIsIncomeOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Record Income</span>
          </button>
        </div>
      </div>

      {/* Month selector & navigation tabs */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Monthly Overview
          </button>
          <button
            onClick={() => setActiveTab('batch-pl')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'batch-pl'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Per-Batch P&L
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Expenses Ledger ({filteredExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'income'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Income Ledger ({filteredSales.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500">Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
          >
            <option value="2026-10">October 2026 (Current)</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Total Revenue</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-800 font-mono">
            {formatPHP(totalIncome)}
          </div>
          <p className="mt-1 text-xs text-stone-500">Sales collected in {selectedMonth}</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Total Expenses</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-700 font-mono">
            {formatPHP(totalExpense)}
          </div>
          <p className="mt-1 text-xs text-stone-500">Feeds, chicks, meds, labor</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Net Profit / (Loss)</span>
            <div
              className={`rounded-lg p-2 ${
                netProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl font-bold font-mono ${
              netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            {formatPHP(netProfit)}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {netProfit >= 0 ? 'Positive Operating Surplus' : 'Operating Deficit'}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Net Margin</span>
            <div className="rounded-lg bg-stone-100 p-2 text-stone-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-stone-900 font-mono">
            {marginPct}%
          </div>
          <p className="mt-1 text-xs text-stone-500">Margin on farm turnover</p>
        </div>
      </div>

      {/* Tab 1: Overview Breakdown */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Expense Categories */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Expense Breakdown by Category</h3>
              <span className="text-xs font-mono font-medium text-stone-500">
                {formatPHP(totalExpense)} Total
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(expenseByCategory).map(([cat, amount]) => {
                const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0';
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span>{cat}</span>
                      <span className="font-mono">{formatPHP(amount)} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${
                          cat === 'Feed'
                            ? 'bg-amber-500'
                            : cat === 'Chick'
                            ? 'bg-emerald-600'
                            : cat === 'Labor'
                            ? 'bg-sky-500'
                            : cat === 'Electric'
                            ? 'bg-indigo-500'
                            : 'bg-stone-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Income Sources */}
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900">Revenue Streams</h3>
              <span className="text-xs font-mono font-medium text-stone-500">
                {formatPHP(totalIncome)} Total
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(incomeByType).map(([type, amount]) => {
                const pct = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : '0';
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-800">
                      <span>{type}</span>
                      <span className="font-mono">{formatPHP(amount)} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-emerald-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 text-xs text-stone-600 space-y-1">
              <span className="font-semibold text-stone-900 block">Poultry Farm Revenue Note:</span>
              <p>
                Layer flock L-2024-04 provides steady daily recurring cash flow via wholesale egg crates.
                Broiler flock B-2024-08 represents upcoming high-value harvest capital realization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Per-Batch P&L Table */}
      {activeTab === 'batch-pl' && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-stone-900">Batch-by-Batch Profit & Loss Matrix</h3>
              <p className="text-[11px] text-stone-500">
                Direct costing attribution per commercial poultry flock
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
                <tr>
                  <th className="px-5 py-3">Batch ID / Breed</th>
                  <th className="px-5 py-3">Flock Status</th>
                  <th className="px-5 py-3">Revenue Attributed</th>
                  <th className="px-5 py-3">Direct Expenses</th>
                  <th className="px-5 py-3">Net Profit / Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {batchPL.map(({ batch, sales, expenses, net, margin }) => (
                  <tr key={batch.id} className="hover:bg-stone-50/50">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-stone-900 block">{batch.batchId}</span>
                      <span className="text-[11px] text-stone-500">
                        {batch.breed} ({batch.currentCount} birds)
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          batch.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-800">
                      {formatPHP(sales)}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-semibold text-rose-700">
                      {formatPHP(expenses)}
                    </td>

                    <td className="px-5 py-3.5">
                      <div
                        className={`font-mono font-bold ${
                          net >= 0 ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {formatPHP(net)}
                      </div>
                      <span className="text-[10px] text-stone-500">Margin: {margin}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expenses Ledger */}
      {activeTab === 'expenses' && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900">Expenses Ledger</h3>
            <span className="text-xs font-mono font-semibold text-rose-700">
              Total: {formatPHP(totalExpense)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Flock</th>
                  <th className="px-4 py-3">Receipt / Ref</th>
                  <th className="px-4 py-3 text-right">Amount (PHP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-800 font-medium">
                      {exp.description}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {exp.batchId || 'Farm Overhead'}
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-500 text-[11px]">
                      {exp.receiptRef || 'Direct Invoice'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-700">
                      -{formatPHP(exp.amountPhp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Income Ledger */}
      {activeTab === 'income' && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 bg-stone-50 px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900">Income & Sales Ledger</h3>
            <span className="text-xs font-mono font-semibold text-emerald-800">
              Total: {formatPHP(totalIncome)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/60 font-semibold text-stone-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Buyer / Client</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3 text-right">Revenue (PHP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 whitespace-nowrap">
                      {formatDate(s.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-900 font-semibold">
                      {s.buyer}
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-700">
                      {s.quantity} {s.unit}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {s.batchId || 'Farm General'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                      +{formatPHP(s.totalPhp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-rose-50">
              <h3 className="text-base font-bold text-stone-900">Record Farm Expense</h3>
              <button
                onClick={() => setIsExpenseOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expense Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  >
                    <option value="Feed">Feed Rations</option>
                    <option value="Vaccine">Vaccines & Meds</option>
                    <option value="Chick">Day-Old Chicks</option>
                    <option value="Labor">Farm Labor / Caretaker</option>
                    <option value="Electric">Electric / Utilities</option>
                    <option value="Equipment">Equipment / Bedding</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Amount in PHP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={expAmount}
                    onChange={(e) =>
                      setExpAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Flock Attribution
                  </label>
                  <select
                    value={expBatchId}
                    onChange={(e) => setExpBatchId(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  >
                    <option value="">General Overhead</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.batchId}>
                        {b.batchId} ({b.breed})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Rice hull bedding 40 sacks"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Receipt Ref / Invoice Photo Note
                </label>
                <input
                  type="text"
                  value={expReceipt}
                  onChange={(e) => setExpReceipt(e.target.value)}
                  placeholder="e.g. OR #8849-B / AgriSupply"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {isIncomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-emerald-50">
              <h3 className="text-base font-bold text-stone-900">Record Income / Farm Sales</h3>
              <button
                onClick={() => setIsIncomeOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Income Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={incType}
                    onChange={(e) => setIncType(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  >
                    <option value="Eggs">Egg Sales</option>
                    <option value="Bird Sales">Live / Dressed Birds</option>
                    <option value="Manure">Organic Chicken Manure</option>
                    <option value="Other">Other Revenue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Buyer / Customer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={incBuyer}
                  onChange={(e) => setIncBuyer(e.target.value)}
                  placeholder="e.g. Central Market Poultry Stand"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={incQuantity}
                    onChange={(e) =>
                      setIncQuantity(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={incUnit}
                    onChange={(e) => setIncUnit(e.target.value)}
                    placeholder="trays / birds / bags"
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Unit Price (PHP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={incUnitPrice}
                    onChange={(e) =>
                      setIncUnitPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs font-mono font-bold focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Total preview */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-900">Total Income (PHP):</span>
                <span className="font-mono text-base font-extrabold text-emerald-800">
                  {formatPHP((Number(incQuantity) || 0) * (Number(incUnitPrice) || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Flock Attribution
                </label>
                <select
                  value={incBatchId}
                  onChange={(e) => setIncBatchId(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:outline-emerald-600"
                >
                  <option value="">General Income</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.batchId}>
                      {b.batchId} ({b.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsIncomeOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
