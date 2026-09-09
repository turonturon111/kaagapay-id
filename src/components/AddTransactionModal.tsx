import React, { useState } from 'react';
import { Transaction, CategoryType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (newTx: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [storeName, setStoreName] = useState('Mercury Drug');
  const [category, setCategory] = useState<CategoryType>('pharmacy');
  const [billAmount, setBillAmount] = useState<string>('500');
  const [discountType, setDiscountType] = useState<'senior_full' | 'grocery_five'>('senior_full');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const rawBill = parseFloat(billAmount) || 0;

  // Senior/PWD Medicine & Dining = 20% discount on gross VAT-exempt price (~28.57% off total inclusive price)
  // Grocery = 5% off basic commodities up to P1,500
  let calculatedSavings = 0;
  let netPaid = rawBill;

  if (discountType === 'senior_full') {
    // Standard Senior/PWD 20% + 12% VAT Exempt formula
    // Net = (Gross / 1.12) * 0.80
    if (rawBill > 0) {
      netPaid = (rawBill / 1.12) * 0.80;
      calculatedSavings = rawBill - netPaid;
    }
  } else {
    // 5% Grocery commodities
    calculatedSavings = rawBill * 0.05;
    netPaid = rawBill - calculatedSavings;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || rawBill <= 0) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    onAddTransaction({
      storeName,
      category,
      amountSaved: Math.round(calculatedSavings * 100) / 100,
      originalPaid: Math.round(netPaid * 100) / 100,
      date: dateStr,
      time: timeStr,
      receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: notes || `${discountType === 'senior_full' ? '20% + VAT Exempt' : '5% Basic Commodity'} Discount Logged`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-sm overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 flex justify-between items-center border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-400">add_shopping_cart</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Log Discount Purchase</h2>
              <p className="text-xs text-emerald-300">Auto-calculate Senior & PWD Savings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-200 flex items-center justify-center hover:bg-emerald-950 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Preset Stores */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1.5">
              Quick Select Outlet
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { name: 'Mercury Drug', cat: 'pharmacy' },
                { name: 'SM Supermarket', cat: 'grocery' },
                { name: 'Watsons Pharmacy', cat: 'pharmacy' },
                { name: 'Jollibee', cat: 'dining' },
                { name: 'LRT-2 Station', cat: 'transport' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => {
                    setStoreName(p.name);
                    setCategory(p.cat as CategoryType);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    storeName === p.name
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50/50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Store Name Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Store / Merchant Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Southstar Drug or Puregold"
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            >
              <option value="pharmacy">Pharmacy / Medicine</option>
              <option value="grocery">Grocery / Basic Commodities</option>
              <option value="dining">Dining & Restaurants</option>
              <option value="transport">Public Transportation</option>
              <option value="medical">Medical Services & Consultation</option>
              <option value="other">Other Services</option>
            </select>
          </div>

          {/* Original Bill Amount */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Original Bill Total (₱)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Discount Rate Mode */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Discount Rule</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('senior_full')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  discountType === 'senior_full'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                }`}
              >
                20% + 12% VAT Exempt (Meds/Dining)
              </button>

              <button
                type="button"
                onClick={() => setDiscountType('grocery_five')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  discountType === 'grocery_five'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                }`}
              >
                5% Commodities (Grocery)
              </button>
            </div>
          </div>

          {/* Live Discount Output Preview */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Calculated Savings</p>
              <p className="text-2xl font-bold text-emerald-700 tracking-tight mt-0.5">
                −₱{calculatedSavings.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Paid</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                ₱{netPaid.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Notes / Purchased Items (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Maintenance medication or vitamins"
              className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-11 bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:bg-emerald-900 active:scale-95 transition-all mt-4"
          >
            Save Transaction Log
          </button>
        </form>
      </div>
    </div>
  );
};
