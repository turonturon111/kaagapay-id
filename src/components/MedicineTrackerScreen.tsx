import React, { useState } from 'react';
import { MedicinePurchase } from '../types';
import { Language, translations } from '../utils/translations';
import { sanitizeInput } from '../utils/securityAndEncoding';

interface MedicineTrackerScreenProps {
  purchases: MedicinePurchase[];
  onAddPurchase: (purchase: Omit<MedicinePurchase, 'id'>) => void;
  onEditPurchase?: (purchase: MedicinePurchase) => void;
  onDeletePurchase?: (id: string) => void;
  onShowToast: (message: string) => void;
  language?: Language;
}

export const MedicineTrackerScreen: React.FC<MedicineTrackerScreenProps> = ({
  purchases,
  onAddPurchase,
  onEditPurchase,
  onDeletePurchase,
  onShowToast,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<MedicinePurchase | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState<MedicinePurchase | null>(null);

  // Form State
  const [pharmacyName, setPharmacyName] = useState('Mercury Drug');
  const [medicineName, setMedicineName] = useState('');
  const [dosageQty, setDosageQty] = useState('30 tablets');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [originalPriceStr, setOriginalPriceStr] = useState('');
  const [doctorName, setDoctorName] = useState('');

  // Auto-calculated discount (20%)
  const originalPrice = parseFloat(originalPriceStr) || 0;
  const discountReceived = originalPrice * 0.20;
  const amountPaid = Math.max(0, originalPrice - discountReceived);

  // Filter purchases
  const filteredPurchases = purchases.filter(
    (p) =>
      p.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.doctorName && p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Total summary
  const totalSpent = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalSaved = purchases.reduce((sum, p) => sum + p.discountReceived, 0);

  const resetForm = () => {
    setPharmacyName('Mercury Drug');
    setMedicineName('');
    setDosageQty('30 tablets');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setOriginalPriceStr('');
    setDoctorName('');
    setEditingPurchase(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: MedicinePurchase) => {
    setEditingPurchase(p);
    setPharmacyName(p.pharmacyName);
    setMedicineName(p.medicineName);
    setDosageQty(p.dosageQty || '30 tablets');
    setPurchaseDate(p.purchaseDate);
    setOriginalPriceStr(p.originalPrice.toString());
    setDoctorName(p.doctorName || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMedicine = sanitizeInput(medicineName);
    const cleanPharmacy = sanitizeInput(pharmacyName) || 'Mercury Drug';
    const cleanDosage = sanitizeInput(dosageQty) || '30 tablets';
    const cleanDoctor = sanitizeInput(doctorName);

    if (!cleanMedicine || originalPrice <= 0) {
      onShowToast('Please enter a valid medicine name and price');
      return;
    }

    if (editingPurchase && onEditPurchase) {
      onEditPurchase({
        ...editingPurchase,
        pharmacyName: cleanPharmacy,
        medicineName: cleanMedicine,
        dosageQty: cleanDosage,
        purchaseDate,
        amountPaid,
        discountReceived,
        originalPrice,
        doctorName: cleanDoctor || undefined,
      });
      onShowToast(`Updated prescription record for ${cleanMedicine}`);
    } else {
      onAddPurchase({
        pharmacyName: cleanPharmacy,
        medicineName: cleanMedicine,
        dosageQty: cleanDosage,
        purchaseDate,
        amountPaid,
        discountReceived,
        originalPrice,
        doctorName: cleanDoctor || undefined,
      });
      onShowToast(`Recorded 20% discount on ${cleanMedicine}`);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (purchaseToDelete && onDeletePurchase) {
      onDeletePurchase(purchaseToDelete.id);
      onShowToast(`Deleted medicine entry: ${purchaseToDelete.medicineName}`);
      setPurchaseToDelete(null);
    }
  };

  return (
    <div className="px-4 sm:px-5 py-4 pb-20 max-w-lg mx-auto flex flex-col gap-4">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 rounded-[1.5rem] shadow-md border border-emerald-700/60 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{t.medTrackerHeader}</h2>
              <p className="text-[10px] sm:text-[11px] text-emerald-200 truncate">{t.medTrackerSub}</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-1 shadow-xs transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>{t.addPurchaseBtn}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-emerald-800/80">
          <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] font-extrabold text-emerald-300/90 uppercase tracking-wider block">{t.totalSpent}</span>
            <span className="text-sm sm:text-base font-extrabold text-white">₱{totalSpent.toFixed(2)}</span>
          </div>
          <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-700/40">
            <span className="text-[10px] font-extrabold text-emerald-300/90 uppercase tracking-wider block">{t.totalSaved20}</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-300">₱{totalSaved.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchMedicine}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-700 shadow-2xs"
        />
      </div>

      {/* Medicine Purchase List */}
      <div className="space-y-2.5">
        {filteredPurchases.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500">
            <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">receipt_long</span>
            <p className="text-xs sm:text-sm font-bold">{t.noMedRecords}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{t.noMedRecordsDesc}</p>
          </div>
        ) : (
          filteredPurchases.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-100">
                    <span className="material-symbols-outlined text-[18px]">pill</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug truncate">{item.medicineName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{item.pharmacyName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-extrabold text-[10px] border border-emerald-200">
                    {t.savedAmount} ₱{item.discountReceived.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 text-[10px] sm:text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium block">{t.dosageQty}:</span>
                  <span className="font-bold text-slate-700">{item.dosageQty || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">{t.purchaseDate}:</span>
                  <span className="font-bold text-slate-700">{item.purchaseDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-medium block">{t.originalPrice}</span>
                  <span className="text-xs line-through text-slate-400 font-semibold">₱{item.originalPrice.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wide block">{t.amountPaid}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-950">₱{item.amountPaid.toFixed(2)}</span>
                </div>
              </div>

              {item.doctorName && (
                <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-slate-400">medical_services</span>
                  <span>{t.prescribingDoctor}: {item.doctorName}</span>
                </p>
              )}

              {/* Action Buttons: Edit and Delete */}
              <div className="pt-1.5 mt-0.5 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                  <span>Edit</span>
                </button>

                {onDeletePurchase && (
                  <button
                    onClick={() => setPurchaseToDelete(item)}
                    aria-label={`Delete medicine record for ${item.medicineName}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-[10px] font-extrabold uppercase flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">delete</span>
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Adding or Editing Medicine Purchase */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-800 text-[20px]">
                  {editingPurchase ? 'edit_note' : 'add_shopping_cart'}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingPurchase ? 'Edit Medicine Entry' : t.logPurchaseTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.pharmacyName}</label>
                <select
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                >
                  <option value="Mercury Drug">Mercury Drug</option>
                  <option value="Watsons Pharmacy">Watsons Pharmacy</option>
                  <option value="Southstar Drug Store">Southstar Drug Store</option>
                  <option value="Generika Drugstore">Generika Drugstore</option>
                  <option value="The Rose Pharmacy">The Rose Pharmacy</option>
                  <option value="TGP (The Generics Pharmacy)">TGP (The Generics Pharmacy)</option>
                  <option value="Local Hospital Pharmacy">Local Hospital Pharmacy</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.medicineNameBrand}</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Amlodipine 10mg / Biogesic"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.dosageQty}</label>
                  <input
                    type="text"
                    value={dosageQty}
                    onChange={(e) => setDosageQty(e.target.value)}
                    placeholder="e.g. 30 tablets / 1 bottle"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.purchaseDate}</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.originalPriceLabel}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={originalPriceStr}
                  onChange={(e) => setOriginalPriceStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              {originalPrice > 0 && (
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">20% Senior Discount:</span>
                  <span className="font-extrabold text-emerald-900">−₱{discountReceived.toFixed(2)} (Net: ₱{amountPaid.toFixed(2)})</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">{t.prescribingDoctorOptional}</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Juan Santos, MD"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase shadow-xs"
                >
                  {editingPurchase ? 'Save Changes' : t.saveRecord}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4 sm:p-5 shadow-2xl border border-rose-200 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[24px]">delete</span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">{t.deleteMedRecord}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Are you sure you want to delete the medicine record for <strong>{purchaseToDelete.medicineName}</strong>?
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPurchaseToDelete(null)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs uppercase shadow-xs"
              >
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
