import React, { useState, useEffect } from 'react';
import { Transaction, CategoryType } from '../types';
import { Language, translations } from '../utils/translations';
import { sanitizeInput } from '../utils/securityAndEncoding';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSaveTransaction: (updated: Transaction) => void;
  language?: Language;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSaveTransaction,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;

  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState<CategoryType>('grocery');
  const [originalPaid, setOriginalPaid] = useState('');
  const [amountSaved, setAmountSaved] = useState('');
  const [date, setDate] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transaction) {
      setStoreName(transaction.storeName);
      setCategory(transaction.category);
      setOriginalPaid(transaction.originalPaid.toString());
      setAmountSaved(transaction.amountSaved.toString());
      setDate(transaction.date);
      setReceiptNumber(transaction.receiptNumber || '');
      setNotes(transaction.notes || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStore = sanitizeInput(storeName);
    const paid = parseFloat(originalPaid) || 0;
    const saved = parseFloat(amountSaved) || 0;

    if (!cleanStore || paid <= 0) return;

    onSaveTransaction({
      ...transaction,
      storeName: cleanStore,
      category,
      originalPaid: paid,
      amountSaved: saved,
      date: sanitizeInput(date) || transaction.date,
      receiptNumber: sanitizeInput(receiptNumber) || undefined,
      notes: sanitizeInput(notes) || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-800 text-[20px]">edit_document</span>
            <h3 className="text-sm font-extrabold text-slate-900">Edit Transaction Record</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Establishment / Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              >
                <option value="pharmacy">Pharmacy</option>
                <option value="grocery">Grocery</option>
                <option value="dining">Dining</option>
                <option value="transport">Transport</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Amount Paid (₱)</label>
              <input
                type="number"
                step="0.01"
                required
                value={originalPaid}
                onChange={(e) => setOriginalPaid(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Amount Saved (₱)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountSaved}
                onChange={(e) => setAmountSaved(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Receipt Number (Optional)</label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
