import React, { useState, useEffect } from 'react';
import { Language, translations } from '../utils/translations';
import { speakText } from '../utils/audioAndTTS';

interface DiscountCalculatorScreenProps {
  onShowToast: (message: string) => void;
  language?: Language;
}

export const DiscountCalculatorScreen: React.FC<DiscountCalculatorScreenProps> = ({
  onShowToast,
  language = 'en',
}) => {
  const currentLang: Language = language === 'tl' ? 'tl' : 'en';
  const t = translations[currentLang] || translations.en;

  const [beneficiaryType, setBeneficiaryType] = useState<'senior' | 'pwd'>('senior');
  const [grossAmountStr, setGrossAmountStr] = useState<string>('1000');
  const [selectedCategory, setSelectedCategory] = useState<string>('medicine');
  const [hasVatExemption, setHasVatExemption] = useState<boolean>(true);

  // Calculation Result State
  const [calculatedResult, setCalculatedResult] = useState<{
    grossAmount: number;
    vatAmount: number;
    netOfVat: number;
    discountRate: number;
    discountAmount: number;
    totalSavings: number;
    finalToPay: number;
    categoryName: string;
  } | null>(null);

  const categories = [
    {
      id: 'medicine',
      label: t.catMedicine,
      desc: t.catMedicineDesc,
      icon: 'medication',
      color: 'emerald',
      vatExemptDefault: true,
      rate: 0.20,
    },
    {
      id: 'dining',
      label: t.catDining,
      desc: t.catDiningDesc,
      icon: 'restaurant',
      color: 'amber',
      vatExemptDefault: true,
      rate: 0.20,
    },
    {
      id: 'hospital',
      label: t.catHospital,
      desc: t.catHospitalDesc,
      icon: 'local_hospital',
      color: 'blue',
      vatExemptDefault: true,
      rate: 0.20,
    },
    {
      id: 'transport',
      label: t.catTransport,
      desc: t.catTransportDesc,
      icon: 'directions_bus',
      color: 'indigo',
      vatExemptDefault: true,
      rate: 0.20,
    },
    {
      id: 'grocery',
      label: t.catGrocery,
      desc: t.catGroceryDesc,
      icon: 'shopping_bag',
      color: 'teal',
      vatExemptDefault: false, // Prime commodities: 5% discount, VAT included
      rate: 0.05,
    },
    {
      id: 'cinema',
      label: t.catCinema,
      desc: t.catCinemaDesc,
      icon: 'movie',
      color: 'purple',
      vatExemptDefault: true,
      rate: 0.20,
    },
  ];

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setHasVatExemption(cat.vatExemptDefault);
    }
  };

  const handleCalculate = () => {
    const gross = parseFloat(grossAmountStr) || 0;

    if (gross <= 0) {
      onShowToast(currentLang === 'tl' ? 'Mangyaring maglagay ng wastong halaga.' : 'Please enter a valid purchase amount');
      return;
    }

    const cat = categories.find((c) => c.id === selectedCategory) || categories[0];
    const discountRate = cat.rate;

    let vatAmount = 0;
    let netOfVat = gross;

    // Standard Philippine VAT formula: Gross ÷ 1.12 = Net of VAT; VAT = Gross - Net of VAT
    if (hasVatExemption) {
      netOfVat = gross / 1.12;
      vatAmount = gross - netOfVat;
    }

    const discountAmount = netOfVat * discountRate;
    const finalToPay = Math.max(0, netOfVat - discountAmount);
    const totalSavings = vatAmount + discountAmount;

    setCalculatedResult({
      grossAmount: gross,
      vatAmount,
      netOfVat,
      discountRate,
      discountAmount,
      totalSavings,
      finalToPay,
      categoryName: cat.label,
    });
  };

  // Auto calculate on mount and when inputs change
  useEffect(() => {
    handleCalculate();
  }, [grossAmountStr, selectedCategory, hasVatExemption, beneficiaryType]);

  const handleCopySummary = () => {
    if (!calculatedResult) return;
    const summaryText = `KaagapayID Computation Summary (${beneficiaryType === 'senior' ? 'Senior Citizen RA 9994' : 'PWD RA 10754'}):
• Category: ${calculatedResult.categoryName}
• Original Gross Price: ₱${calculatedResult.grossAmount.toFixed(2)}
${hasVatExemption ? `• Less 12% VAT Exemption: -₱${calculatedResult.vatAmount.toFixed(2)}\n• Net of VAT: ₱${calculatedResult.netOfVat.toFixed(2)}` : ''}
• Less ${Math.round(calculatedResult.discountRate * 100)}% Discount: -₱${calculatedResult.discountAmount.toFixed(2)}
• Total Savings: ₱${calculatedResult.totalSavings.toFixed(2)}
• FINAL AMOUNT TO PAY: ₱${calculatedResult.finalToPay.toFixed(2)}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      onShowToast(t.copiedToClipboard);
    }).catch(() => {
      onShowToast(t.copiedToClipboard);
    });
  };

  const handleVoiceSummary = () => {
    if (!calculatedResult) return;
    const spoken = currentLang === 'tl'
      ? `Para sa halagang ${calculatedResult.grossAmount.toFixed(0)} pesos sa ${calculatedResult.categoryName}. Ang kabuuang babayaran mo ay ${calculatedResult.finalToPay.toFixed(2)} pesos. Ang naipon mong diskwento ay ${calculatedResult.totalSavings.toFixed(2)} pesos.`
      : `For purchase of ${calculatedResult.grossAmount.toFixed(0)} pesos in ${calculatedResult.categoryName}. Your final amount to pay is ${calculatedResult.finalToPay.toFixed(2)} pesos. You saved a total of ${calculatedResult.totalSavings.toFixed(2)} pesos.`;
    speakText(spoken, currentLang);
  };

  return (
    <div className="px-4 sm:px-5 py-4 pb-24 max-w-xl mx-auto flex flex-col gap-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white p-4 sm:p-5 rounded-[1.75rem] shadow-md border border-emerald-800/80 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <span className="material-symbols-outlined text-[22px]">calculate</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">{t.calcHeader}</h2>
            <p className="text-[11px] text-emerald-300 font-medium">{t.calcSub}</p>
          </div>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed mt-1">
          {t.calcBannerDesc}
        </p>
      </div>

      {/* Cardholder Privilege Selector */}
      <div className="bg-white p-4 rounded-[1.5rem] border border-slate-200/80 shadow-xs">
        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">
          {t.calcBeneficiaryType}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBeneficiaryType('senior')}
            className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
              beneficiaryType === 'senior'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">👵</span>
            <div className="min-w-0">
              <span className="text-xs font-bold block leading-tight truncate">{t.seniorCitizen}</span>
              <span className={`text-[10px] block leading-tight ${beneficiaryType === 'senior' ? 'text-emerald-200' : 'text-slate-500'}`}>
                RA 9994 Law
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setBeneficiaryType('pwd')}
            className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all text-left ${
              beneficiaryType === 'pwd'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">♿</span>
            <div className="min-w-0">
              <span className="text-xs font-bold block leading-tight truncate">{t.personWithDisability}</span>
              <span className={`text-[10px] block leading-tight ${beneficiaryType === 'pwd' ? 'text-emerald-200' : 'text-slate-500'}`}>
                RA 10754 Law
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Calculation Form */}
      <div className="bg-white p-4 sm:p-5 rounded-[1.75rem] border border-slate-200/80 shadow-xs space-y-4">
        {/* Step 1: Category Selection */}
        <div>
          <label className="text-xs font-extrabold text-slate-900 block mb-2 uppercase tracking-wider">
            {t.selectCategoryStep}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  aria-label={`${cat.label}, ${cat.desc}`}
                  className={`p-3 rounded-2xl border flex flex-col items-start gap-1.5 text-left transition-all relative ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-white text-slate-700 shadow-2xs border border-slate-200/60'
                  }`}>
                    <span className="material-symbols-outlined text-[19px]">{cat.icon}</span>
                  </div>
                  <div className="w-full min-w-0">
                    <span className="text-xs font-extrabold block leading-tight truncate">{cat.label}</span>
                    <span className={`text-[10px] font-medium block leading-tight mt-0.5 ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500'
                    }`}>
                      {cat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Purchase Amount Entry */}
        <div>
          <label className="text-xs font-extrabold text-slate-900 block mb-1 uppercase tracking-wider">
            {t.enterAmountStep}
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            {t.enterAmountDesc}
          </p>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₱</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={grossAmountStr}
              onChange={(e) => setGrossAmountStr(e.target.value)}
              placeholder="0.00"
              aria-label="Original Purchase Amount in Philippine Peso"
              className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-800 focus:bg-white transition-colors"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1">{t.presets}:</span>
            {['100', '250', '500', '1000', '2500'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGrossAmountStr(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  grossAmountStr === preset
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ₱{Number(preset).toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Value-Added Tax (VAT) Exemption Setting Card */}
        <div className="p-3.5 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              {t.vatExemptCardTitle}
            </label>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shrink-0 ${
              hasVatExemption ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {hasVatExemption ? t.vatExemptActive : t.vatExemptInactive}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold text-slate-800 block">
                {t.apply12Vat}
              </span>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                {t.deductVatDesc}
              </p>
            </div>

            {/* Accessible Toggle Button */}
            <button
              type="button"
              role="switch"
              aria-checked={hasVatExemption}
              aria-label={`Toggle 12% VAT Exemption. Currently ${hasVatExemption ? 'Active' : 'Inactive'}`}
              onClick={() => setHasVatExemption(!hasVatExemption)}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 ${
                hasVatExemption ? 'bg-emerald-800' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-xs transition-transform ${
                  hasVatExemption ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Step 4: Calculate Action Button */}
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">calculate</span>
          <span>{t.calculateBtn}</span>
        </button>
      </div>

      {/* Results Summary & Breakdown Card */}
      {calculatedResult && (
        <div className="bg-white rounded-[1.75rem] border border-emerald-200/90 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Card Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">receipt_long</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                {t.computationBreakdown}
              </span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold text-[10px] border border-emerald-400/30 shrink-0">
              {t.verifiedFormula}
            </span>
          </div>

          {/* Highlight Stat Boxes */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="calc-stat-box p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300 text-center flex flex-col justify-center">
                <span className="calc-stat-label text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider block mb-1">
                  {t.finalAmountToPay}
                </span>
                <span className="calc-stat-value text-xl sm:text-2xl font-black text-slate-900">
                  ₱{calculatedResult.finalToPay.toFixed(2)}
                </span>
              </div>

              <div className="calc-stat-box p-3.5 bg-teal-50 rounded-2xl border border-teal-300 text-center flex flex-col justify-center">
                <span className="calc-stat-label text-[10px] font-extrabold text-teal-900 uppercase tracking-wider block mb-1">
                  {t.totalSavings}
                </span>
                <span className="calc-stat-value text-xl sm:text-2xl font-black text-slate-900">
                  ₱{calculatedResult.totalSavings.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Step-by-Step Transparent Math List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>{t.originalGross}:</span>
                <span className="font-bold text-slate-900">₱{calculatedResult.grossAmount.toFixed(2)}</span>
              </div>

              {hasVatExemption && (
                <>
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded-lg">
                    <span>{t.vatExemptDeduction} (12%):</span>
                    <span className="font-bold">- ₱{calculatedResult.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>{t.netPriceVatExempt}:</span>
                    <span className="font-bold text-slate-900">₱{calculatedResult.netOfVat.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded-lg">
                <span>
                  {calculatedResult.discountRate === 0.05 ? t.special5Discount : t.seniorPwdDiscount} ({Math.round(calculatedResult.discountRate * 100)}%):
                </span>
                <span className="font-bold">- ₱{calculatedResult.discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-900 pt-2 border-t border-slate-200 font-extrabold text-sm">
                <span>{t.finalAmountToPay}:</span>
                <span className="text-emerald-950 font-black text-base">₱{calculatedResult.finalToPay.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions for Cashier and Voice Reader */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{t.copySummaryBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleVoiceSummary}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>{t.speakBreakdownBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
