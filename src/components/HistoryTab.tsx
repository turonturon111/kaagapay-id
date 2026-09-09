import React, { useState } from 'react';
import { Transaction, CategoryType } from '../types';
import { translations, Language } from '../utils/translations';
import { speakText, triggerHapticFeedback } from '../utils/audioAndTTS';

interface HistoryTabProps {
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onClearAllTransactions?: () => void;
  language?: Language;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  transactions,
  onOpenAddTransaction,
  onSelectTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onClearAllTransactions,
  language = 'en',
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Transaction for Detail Modal
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  // Deletion Confirmation State
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const t = translations[language] || translations.en;

  // Filter transactions
  const filteredTx = transactions.filter((tx) => {
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchStore = tx.storeName.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      const matchReceipt = tx.receiptNumber ? tx.receiptNumber.toLowerCase().includes(q) : false;
      if (!matchStore && !matchNotes && !matchReceipt) return false;
    }
    return true;
  });

  // Calculate total savings
  const totalSavings = filteredTx.reduce((sum, tx) => sum + tx.amountSaved, 0);

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'pharmacy':
      case 'medical':
        return 'medical_services';
      case 'grocery':
        return 'shopping_basket';
      case 'transport':
        return 'directions_bus';
      case 'dining':
        return 'restaurant';
      default:
        return 'confirmation_number';
    }
  };

  const getCategoryBg = (category: CategoryType) => {
    switch (category) {
      case 'pharmacy':
      case 'medical':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'grocery':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'transport':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'dining':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getCategoryLabel = (category: CategoryType) => {
    switch (category) {
      case 'pharmacy':
      case 'medical':
        return t.pharmacy;
      case 'grocery':
        return t.grocery;
      case 'transport':
        return t.transport;
      case 'dining':
        return t.dining;
      default:
        return category;
    }
  };

  const handleCardClick = (tx: Transaction) => {
    setActiveReceipt(tx);
    if (onSelectTransaction) {
      onSelectTransaction(tx);
    }
  };

  const handleConfirmDeleteSingle = () => {
    if (!txToDelete) return;
    triggerHapticFeedback(40);
    onDeleteTransaction(txToDelete.id);
    if (activeReceipt && activeReceipt.id === txToDelete.id) {
      setActiveReceipt(null);
    }
    setTxToDelete(null);
  };

  const handleConfirmClearAll = () => {
    triggerHapticFeedback(50);
    if (onClearAllTransactions) {
      onClearAllTransactions();
    }
    setActiveReceipt(null);
    setIsClearAllModalOpen(false);
  };

  return (
    <div className="px-4 sm:px-5 py-4 pb-24 max-w-2xl mx-auto space-y-4">
      
      {/* Search Input Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchHistory}
          aria-label={t.searchHistory}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search query"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
          <button
            onClick={() => setFilterPeriod('this_month')}
            aria-label={`Filter by ${t.thisMonth}`}
            className={`h-9 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
              filterPeriod === 'this_month'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
            {t.thisMonth}
          </button>

          <button
            onClick={() => setFilterPeriod('last_month')}
            aria-label={`Filter by ${t.lastMonth}`}
            className={`h-9 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
              filterPeriod === 'last_month'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50/50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">history</span>
            {t.lastMonth}
          </button>

          {/* Category Filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter transactions by category"
            className="h-9 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white font-bold text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-700 shrink-0 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="grocery">Grocery</option>
            <option value="transport">Transport</option>
            <option value="dining">Dining</option>
          </select>
        </div>
      </section>

      {/* Summary Card */}
      <section>
        <div className="savings-hero-card bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-[1.75rem] p-5 sm:p-6 shadow-sm border border-emerald-800/80 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="savings-hero-label text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
              {t.totalDiscountSavings}
            </p>
            <h2 className="savings-hero-amount text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              ₱{totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-[11px] text-emerald-200 mt-1">
              {filteredTx.length} {filteredTx.length === 1 ? 'transaction' : 'transactions'} logged
            </p>
          </div>
          <div className="w-11 h-11 bg-emerald-950 border border-emerald-700 rounded-2xl flex items-center justify-center text-emerald-400 relative z-10 shrink-0">
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
          </div>
        </div>
      </section>

      {/* Transaction List Header & Clear Action */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {t.recentTransactions}
            </p>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
              {filteredTx.length}
            </span>
          </div>

          {filteredTx.length > 0 && onClearAllTransactions && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              aria-label={t.clearAllTransactions}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-rose-200/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>{t.clearAllTransactions}</span>
            </button>
          )}
        </div>

        {/* List Content */}
        {filteredTx.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[1.75rem] border border-slate-200/80 p-6 shadow-xs">
            <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">
              receipt_long
            </span>
            <p className="font-bold text-sm text-slate-900">No transactions found</p>
            <p className="text-xs text-slate-500 mt-0.5">Log a new discount purchase using the + button below.</p>
          </div>
        ) : (
          filteredTx.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 flex items-center p-3.5 sm:p-4 active:scale-[0.99] transition-all hover:border-slate-300 group relative"
            >
              {/* Tap anywhere on card body to open receipt detail */}
              <div
                onClick={() => handleCardClick(tx)}
                className="flex-1 flex items-center min-w-0 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`View receipt for ${tx.storeName}, saved ₱${tx.amountSaved.toFixed(2)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(tx);
                  }
                }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-3 shrink-0 ${getCategoryBg(tx.category)}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {getCategoryIcon(tx.category)}
                  </span>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {tx.storeName}
                    </h4>
                    <span className="font-extrabold text-sm text-emerald-700 tracking-tight shrink-0 ml-2">
                      −₱{tx.amountSaved.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-end mt-1">
                    <span className="text-[11px] text-slate-500 font-medium truncate">
                      {tx.date} • {tx.time}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-[11px] text-slate-500">Paid:</span>
                      <span className="text-[11px] font-bold text-slate-900">
                        ₱{tx.originalPaid.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {tx.notes && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {tx.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit and Direct Delete */}
              <div className="pl-1 border-l border-slate-100 flex items-center gap-0.5 shrink-0">
                {onEditTransaction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTransaction(tx);
                    }}
                    aria-label={`Edit transaction log from ${tx.storeName}`}
                    title="Edit Transaction"
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTxToDelete(tx);
                  }}
                  aria-label={`Delete transaction log from ${tx.storeName}`}
                  title={t.deleteTransaction}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 active:scale-95 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Floating Action Button (FAB) for Manual Log */}
      <div className="fixed bottom-[72px] sm:bottom-[80px] left-0 right-0 max-w-lg mx-auto pointer-events-none z-30 px-4 flex justify-end">
        <button
          onClick={onOpenAddTransaction}
          aria-label="Add Discount Transaction"
          className="pointer-events-auto w-12 h-12 sm:w-13 sm:h-13 bg-emerald-800 text-white rounded-2xl shadow-md flex items-center justify-center active:scale-95 transition-transform hover:bg-emerald-900 border border-emerald-700"
        >
          <span className="material-symbols-outlined text-[24px] sm:text-[26px]">add</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. Detailed Transaction Receipt Modal */}
      {/* ========================================================================= */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 flex justify-between items-center border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryBg(activeReceipt.category)}`}>
                  <span className="material-symbols-outlined text-[22px]">
                    {getCategoryIcon(activeReceipt.category)}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">
                    {t.transactionDetails}
                  </h3>
                  <p className="text-xs text-emerald-300">
                    {activeReceipt.receiptNumber || 'Counter Verification Record'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                aria-label="Close receipt details"
                className="w-8 h-8 rounded-xl bg-emerald-950/70 text-emerald-200 flex items-center justify-center hover:bg-emerald-950 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Store & Date Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      Establishment
                    </span>
                    <span className="font-extrabold text-base text-slate-900">
                      {activeReceipt.storeName}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg uppercase">
                    {getCategoryLabel(activeReceipt.category)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Date & Time</span>
                    <span className="font-bold text-slate-800">{activeReceipt.date} • {activeReceipt.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Reference No.</span>
                    <span className="font-mono font-bold text-slate-800">{activeReceipt.receiptNumber || 'N/A'}</span>
                  </div>
                </div>

                {activeReceipt.notes && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Description / Notes</span>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{activeReceipt.notes}</p>
                  </div>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="border border-emerald-200 bg-emerald-50/70 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-900">Amount Paid at Cashier</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₱{activeReceipt.originalPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-800">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Total Statutory Discount Saved
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">
                    −₱{activeReceipt.amountSaved.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-xs text-slate-600">
                  <span className="font-semibold">Estimated Gross Value</span>
                  <span className="font-bold text-slate-800">
                    ₱{(activeReceipt.originalPaid + activeReceipt.amountSaved).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {onEditTransaction && (
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = activeReceipt;
                      setActiveReceipt(null);
                      onEditTransaction(toEdit);
                    }}
                    className="flex-1 h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                    <span>Edit Record</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const toDelete = activeReceipt;
                    setActiveReceipt(null);
                    setTxToDelete(toDelete);
                  }}
                  className="flex-1 h-11 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]">delete</span>
                  <span>{t.deleteTransaction}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="px-4 h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-extrabold text-xs flex items-center justify-center active:scale-95 transition-all"
                >
                  {t.cancel || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Single Transaction Deletion Confirmation Dialog */}
      {/* ========================================================================= */}
      {txToDelete && (
        <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-rose-200 p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              {t.deleteTransaction}
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {t.deleteTransactionConfirm}
            </p>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 my-3 text-left">
              <p className="text-xs font-bold text-slate-900 truncate">{txToDelete.storeName}</p>
              <p className="text-[11px] text-slate-500">{txToDelete.date} • Saved ₱{txToDelete.amountSaved.toFixed(2)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSingle}
                className="h-11 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>{t.confirmDelete}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Clear All Transactions Confirmation Dialog */}
      {/* ========================================================================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-rose-200 p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              {t.clearAllTransactions}
            </h3>
            
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {t.clearAllConfirm}
            </p>

            <div className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3 my-3 text-center">
              <span className="text-xs font-extrabold text-rose-900 block">
                {filteredTx.length} transaction records will be permanently removed.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="h-11 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>{t.confirmDelete}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


