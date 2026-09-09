import React, { useState } from 'react';
import { NearbyStore, CategoryType } from '../types';

interface NearbyStoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: NearbyStore[];
  onPresentIDAtStore: (store: NearbyStore) => void;
}

export const NearbyStoresModal: React.FC<NearbyStoresModalProps> = ({
  isOpen,
  onClose,
  stores,
  onPresentIDAtStore,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStores = stores.filter((st) => {
    if (selectedCat !== 'all' && st.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return st.name.toLowerCase().includes(q) || st.address.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-sm overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-black text-white p-6 flex justify-between items-center border-b border-slate-900">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-emerald-400">storefront</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Nearby Partner Outlets</h2>
              <p className="text-xs text-slate-400">Verified Senior & PWD Discount Merchants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filter & Search Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
          <input
            type="text"
            placeholder="Search stores or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-black transition-colors"
          />

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'pharmacy', 'grocery', 'dining', 'transport'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider capitalize shrink-0 transition-all ${
                  selectedCat === cat
                    ? 'bg-black text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? 'All Outlets' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Store List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {filteredStores.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
              <p className="font-bold text-sm text-slate-700">No matching partner stores found</p>
            </div>
          ) : (
            filteredStores.map((st) => (
              <div
                key={st.id}
                className="p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-slate-200 transition-all flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-base text-slate-900">
                        {st.name}
                      </h3>
                      {st.isVerifiedPartner && (
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]" title="Verified Partner">
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{st.address}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold text-[10px] uppercase tracking-wider rounded-full border border-slate-200 shrink-0">
                    {st.distance}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-50 gap-2">
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    <span className="material-symbols-outlined text-[16px]">sell</span>
                    <span className="font-bold text-xs">{st.discountInfo}</span>
                  </div>

                  <button
                    onClick={() => onPresentIDAtStore(st)}
                    className="px-3.5 py-2 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 hover:bg-slate-900 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                    Present ID
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full h-11 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Close Outlets Map
          </button>
        </div>
      </div>
    </div>
  );
};
