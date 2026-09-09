import React from 'react';
import { UserProfile, Transaction } from '../types';
import { translations, Language } from '../utils/translations';

interface HomeTabProps {
  profile: UserProfile;
  transactions: Transaction[];
  onNavigateToID: () => void;
  onNavigateToHistory: () => void;
  onOpenNearbyStores: () => void;
  onOpenEmergency: () => void;
  onNavigateToMedicines: () => void;
  onNavigateToAppointments: () => void;
  onNavigateToBenefits: () => void;
  onNavigateToCalculator: () => void;
  onNavigateToUpdates: () => void;
  onSelectUpdateBanner: () => void;
  language?: Language;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  transactions,
  onNavigateToID,
  onNavigateToHistory,
  onOpenNearbyStores,
  onOpenEmergency,
  onNavigateToMedicines,
  onNavigateToAppointments,
  onNavigateToBenefits,
  onNavigateToCalculator,
  onNavigateToUpdates,
  onSelectUpdateBanner,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;

  // Calculate total saved this month
  const totalSaved = transactions.reduce((acc, curr) => acc + (curr.amountSaved || curr.discountAmount || 0), 0) || 1420;
  const todayCount = transactions.length || 3;
  const firstName = (profile?.name ? profile.name.trim().split(' ')[0] : '') || 'Kabayan';

  return (
    <div className="px-4 sm:px-5 py-5 pb-6 max-w-2xl mx-auto flex flex-col gap-5">
      {/* Greeting Header */}
      <section className="px-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {t.welcome} {firstName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t.verifiedCard}
        </p>
      </section>

      {/* Primary Digital ID Card Banner */}
      <section>
        <div className="w-full p-5 sm:p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-[1.75rem] shadow-md flex flex-col justify-between border border-emerald-800/80 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2 bg-emerald-950/90 px-3 py-1.5 rounded-full border border-emerald-700/60 max-w-full">
              <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="text-xs font-bold tracking-wide text-emerald-100 whitespace-nowrap overflow-hidden text-ellipsis">
                {profile?.idType === 'senior' ? t.seniorDigitalID : t.pwdDigitalID}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-extrabold uppercase tracking-widest shrink-0">
              {t.activeStatus}
            </span>
          </div>

          <div className="my-2">
            <p className="text-[10px] font-bold text-emerald-300/80 uppercase tracking-widest">
              {t.idNumber}
            </p>
            <p className="text-lg sm:text-2xl font-bold font-mono text-white tracking-wider">
              {profile?.idNumber || 'SC-2024-008912'}
            </p>
          </div>

          <button
            onClick={onNavigateToID}
            className="w-full mt-2 py-3 px-4 bg-white text-emerald-950 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-transform hover:bg-emerald-50"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            {t.showID}
          </button>
        </div>
      </section>

      {/* Main Services & Features Grid */}
      <section className="bg-white rounded-[1.5rem] p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
            {t.featuresTitle}
          </p>
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide">
            {t.activeModules}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Feature 1: Medicine Tracker */}
          <button
            onClick={onNavigateToMedicines}
            className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl flex flex-col items-start gap-1.5 text-left transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[19px]">medication</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{t.medicineTrackerTitle}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.medicineTrackerDesc}</p>
            </div>
          </button>

          {/* Feature 2: Appointments */}
          <button
            onClick={onNavigateToAppointments}
            className="p-2.5 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 rounded-2xl flex flex-col items-start gap-1.5 text-left transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[19px]">calendar_clock</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{t.appointmentsTitle}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.appointmentsDesc}</p>
            </div>
          </button>

          {/* Feature 3: Benefits Guide */}
          <button
            onClick={onNavigateToBenefits}
            className="p-2.5 bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/80 rounded-2xl flex flex-col items-start gap-1.5 text-left transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[19px]">verified_user</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{t.benefitsGuideTitle}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.benefitsGuideDesc}</p>
            </div>
          </button>

          {/* Feature 4: Discount Calculator */}
          <button
            onClick={onNavigateToCalculator}
            className="p-2.5 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-2xl flex flex-col items-start gap-1.5 text-left transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[19px]">calculate</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{t.discountCalcTitle}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.discountCalcDesc}</p>
            </div>
          </button>
        </div>

        {/* Feature 5: Government Assistance Updates Banner */}
        <button
          onClick={onNavigateToUpdates}
          className="w-full mt-2 p-3 bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-2xl flex items-center justify-between gap-2.5 shadow-xs hover:from-indigo-900 hover:to-slate-800 transition-all active:scale-98 border border-indigo-800/60"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
              <span className="material-symbols-outlined text-[18px]">campaign</span>
            </div>
            <div className="text-left truncate">
              <h4 className="text-xs font-extrabold text-white truncate">{t.assistanceUpdatesTitle}</h4>
              <p className="text-[10px] text-indigo-200 truncate">{t.assistanceUpdatesDesc}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-indigo-300 text-[18px] shrink-0">chevron_right</span>
        </button>
      </section>

      {/* Quick Services 4-Icon Grid */}
      <section className="bg-white rounded-[1.75rem] p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
          {t.quickActions}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {/* Action 1: QR ID */}
          <button
            onClick={onNavigateToID}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 bg-emerald-100 text-emerald-900 rounded-2xl flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
            </div>
            <span className="text-xs font-bold text-slate-800 text-center leading-tight">
              {t.tabID}
            </span>
          </button>

          {/* Action 2: Stores */}
          <button
            onClick={onOpenNearbyStores}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <span className="text-xs font-bold text-slate-800 text-center leading-tight">
              {t.nearbyStores}
            </span>
          </button>

          {/* Action 3: History */}
          <button
            onClick={onNavigateToHistory}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 bg-teal-50 text-teal-800 rounded-2xl flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <span className="text-xs font-bold text-slate-800 text-center leading-tight">
              {t.tabHistory}
            </span>
          </button>

          {/* Action 4: Emergency */}
          <button
            onClick={onOpenEmergency}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 sm:w-13 sm:h-13 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-2xs border border-rose-100">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                emergency
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 text-center leading-tight">
              {t.emergencySOS}
            </span>
          </button>
        </div>
      </section>

      {/* Total Monthly Savings Card */}
      <section>
        <div className="savings-summary-card p-5 bg-emerald-50/90 border border-emerald-300 rounded-[1.75rem] shadow-xs flex items-center justify-between">
          <div>
            <p className="savings-label text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
              {t.totalSavingsMonth}
            </p>
            <p className="savings-amount text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">
              ₱{totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="savings-icon w-12 h-12 bg-emerald-800 text-white rounded-2xl flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[24px]">savings</span>
          </div>
        </div>
      </section>

      {/* Informational Banner */}
      <section>
        <div
          onClick={onNavigateToUpdates}
          className="rounded-[1.75rem] bg-indigo-50/90 border border-indigo-100 text-indigo-950 p-4 sm:p-5 flex flex-col gap-2.5 shadow-xs cursor-pointer hover:bg-indigo-100/70 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[14px]">campaign</span>
              <span>Assistance Updates</span>
            </div>
            <span className="text-xs font-bold text-indigo-900 underline uppercase tracking-wider hover:text-indigo-950 shrink-0">
              View Announcements →
            </span>
          </div>
          <h4 className="font-bold text-sm sm:text-base leading-snug text-indigo-950">
            Check free medical missions, Q3 pension distribution schedules, and vaccination programs.
          </h4>
        </div>
      </section>
    </div>
  );
};

// Inline helper for rapid 20% discount calculation
const QuickCalculator: React.FC<{ t: any }> = ({ t }) => {
  const [amount, setAmount] = React.useState<string>('500');
  const numAmount = parseFloat(amount) || 0;
  const discount = numAmount * 0.20;
  const youPay = Math.max(0, numAmount - discount);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-[11px] font-bold text-slate-600 block mb-1">
          {t.calcOriginalPrice}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₱</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white"
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">{t.calcYouPay}</span>
          <span className="text-base font-extrabold text-emerald-950">₱{youPay.toFixed(2)}</span>
        </div>
        <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-center">
          <span className="text-[10px] font-bold text-teal-800 uppercase block">{t.calcYouSave}</span>
          <span className="text-base font-extrabold text-teal-950">₱{discount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

