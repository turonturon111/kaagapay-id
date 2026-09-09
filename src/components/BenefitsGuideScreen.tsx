import React, { useState } from 'react';
import { BenefitCategory } from '../types';
import { Language, translations } from '../utils/translations';

interface BenefitsGuideScreenProps {
  benefits: BenefitCategory[];
  language?: Language;
}

export const BenefitsGuideScreen: React.FC<BenefitsGuideScreenProps> = ({
  benefits,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;
  const [hubTab, setHubTab] = useState<'catalog' | 'laws' | 'calculator'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(benefits[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Statutory Calculator State
  const [calcGrossAmount, setCalcGrossAmount] = useState<string>('1000');
  const [calcDiscountType, setCalcDiscountType] = useState<'medicine_dining' | 'basic_necessities' | 'utilities'>('medicine_dining');

  const categories = ['All', 'Discount', 'Exemption', 'Assistance', 'Local'];

  const filteredBenefits = benefits.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate statutory formulas
  const calculateStatutoryDiscount = () => {
    const gross = parseFloat(calcGrossAmount) || 0;
    if (gross <= 0) {
      return { base: 0, vatRemoved: 0, discount: 0, net: 0, ruleName: '' };
    }

    if (calcDiscountType === 'medicine_dining') {
      // RA 9994 / RA 10754 Formula:
      // Base = Gross / 1.12
      // VAT Removed = Gross - Base
      // 20% Discount = Base * 0.20
      // Net = Base - Discount
      const base = gross / 1.12;
      const vatRemoved = gross - base;
      const discount = base * 0.20;
      const net = base - discount;
      return {
        base,
        vatRemoved,
        discount,
        net,
        ruleName: 'RA 9994 / RA 10754 (20% Discount + 12% VAT Exemption)',
      };
    } else if (calcDiscountType === 'basic_necessities') {
      // DTI JAO 17-02: 5% on BNPC (up to ₱1,300/week)
      const cappedGross = Math.min(gross, 1300);
      const discount = cappedGross * 0.05;
      const net = gross - discount;
      return {
        base: gross,
        vatRemoved: 0,
        discount,
        net,
        ruleName: 'DTI-DA-DOE JAO 17-02 (5% Special Discount on Basic Necessities)',
      };
    } else {
      // Residential Utilities (Water & Electric: 5% discount if below thresholds)
      const discount = gross * 0.05;
      const net = gross - discount;
      return {
        base: gross,
        vatRemoved: 0,
        discount,
        net,
        ruleName: 'RA 9994 Section 4(c) (5% Residential Utility Subsidy Discount)',
      };
    }
  };

  const calcResult = calculateStatutoryDiscount();

  return (
    <div className="px-4 sm:px-5 py-4 pb-20 max-w-lg mx-auto flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-4 sm:p-5 rounded-[1.5rem] shadow-md border border-emerald-800/80 relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight">{t.benefitsHeader}</h2>
            <p className="text-[10px] sm:text-[11px] text-emerald-300">Philippine Statutory Rights & Legal Hub</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-200 leading-snug">
          Comprehensive guide to mandatory Republic Acts, Joint Administrative Orders, and BIR regulations for Senior Citizens and PWDs.
        </p>

        {/* Hub Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-3.5 bg-black/30 p-1 rounded-xl border border-white/10 text-xs font-bold text-center">
          <button
            onClick={() => setHubTab('catalog')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              hubTab === 'catalog' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">grid_view</span>
            <span>Benefits</span>
          </button>
          <button
            onClick={() => setHubTab('laws')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              hubTab === 'laws' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">gavel</span>
            <span>Laws & Acts</span>
          </button>
          <button
            onClick={() => setHubTab('calculator')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              hubTab === 'calculator' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">calculate</span>
            <span>Calculator</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Benefits Catalog Tab */}
      {/* ========================================================================= */}
      {hubTab === 'catalog' && (
        <div className="flex flex-col gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'All' ? t.allBenefits : `${cat} Rights`}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchBenefitsPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs"
            />
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5">
            {filteredBenefits.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500">
                <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">help_outline</span>
                <p className="text-xs sm:text-sm font-bold">{t.noBenefitsFound}</p>
              </div>
            ) : (
              filteredBenefits.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all hover:border-emerald-300"
                  >
                    {/* Header Row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full p-3.5 flex items-start justify-between text-left gap-2.5 focus:outline-none"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                          <span className="material-symbols-outlined text-[18px]">{item.icon || 'percent'}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[9px] font-extrabold uppercase tracking-wide">
                              {item.discountRate}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">{item.lawReference}</span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.summary}</p>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-slate-400 text-[18px] shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-emerald-800' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {/* Expanded Details Accordion */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
                        <div>
                          <h4 className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider mb-0.5">{t.detailedExplanation}</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Eligible Items */}
                        <div>
                          <h4 className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-800">task_alt</span>
                            <span>{t.coveredGoodsServices}</span>
                          </h4>
                          <ul className="space-y-0.5">
                            {item.eligibleItems.map((el, idx) => (
                              <li key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full shrink-0 mt-1.5" />
                                <span>{el}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* How to Claim */}
                        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
                          <h4 className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-800">how_to_reg</span>
                            <span>{t.howToClaim}</span>
                          </h4>
                          <ol className="space-y-0.5">
                            {item.howToClaim.map((step, idx) => (
                              <li key={idx} className="text-[11px] text-emerald-950 flex items-start gap-1">
                                <span className="font-bold text-emerald-800 shrink-0">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Required Documents */}
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t.requiredDocuments}</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.requiredDocs.map((doc, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">
                                📄 {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Statutory Laws & Regulations Hub */}
      {/* ========================================================================= */}
      {hubTab === 'laws' && (
        <div className="space-y-3 text-xs text-slate-700">
          {/* RA 9994 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-lg text-[10px] font-black uppercase">
                Primary Statute
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Enacted: Feb 15, 2010</span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              Republic Act No. 9994 (Expanded Senior Citizens Act of 2010)
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mandates a <strong>20% discount and Value Added Tax (VAT) exemption</strong> for all Filipino citizens aged 60 years and older on generic & branded medicines, medical supplies, doctor consultations, hospitalization, diagnostic lab exams, transport fares (buses, jeepneys, taxis, MRT/LRT, domestic airfare, passenger ships), restaurants, hotels, movie theaters, and recreation centers.
            </p>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-950 font-medium">
              <strong>Key Compliance:</strong> Commercial establishments are prohibited from asking for unnecessary additional documents beyond a valid Senior Citizen ID (OSCA ID) or authorized Philippine Government-issued identification.
            </div>
          </div>

          {/* RA 10754 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded-lg text-[10px] font-black uppercase">
                PWD Statute
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Enacted: Mar 23, 2016</span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              Republic Act No. 10754 (Act Expanding the Benefits and Privileges of PWDs)
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Expands RA 7277 to align PWD privileges fully with the Senior Citizens Act, granting <strong>20% discount and 12% VAT exemption</strong> on medicine, medical/dental services, transportation, food, lodging, and funeral services, plus dedicated express lanes.
            </p>
          </div>

          {/* DTI-DA-DOE JAO 17-02 */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-black uppercase">
                Commodities Joint Order
              </span>
              <span className="text-[10px] text-slate-400 font-bold">JAO No. 17-02 Series 2017</span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              5% Special Discount on Basic Necessities & Prime Commodities (BNPC)
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Provides <strong>5% special discount</strong> on groceries without VAT exemption up to a maximum gross purchase of <strong>₱1,300 per week</strong> (accumulated max ₱65 discount/week) for rice, bread, milk, coffee, fresh eggs, canned fish, fresh meat, poultry, fresh fruits, onions, garlic, and laundry detergent.
            </p>
          </div>

          {/* BIR Revenue Regulations */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded-lg text-[10px] font-black uppercase">
                Tax Accounting Rules
              </span>
              <span className="text-[10px] text-slate-400 font-bold">RR No. 7-2010 & RR No. 9-2019</span>
            </div>
            <h3 className="text-sm font-black text-slate-900">
              Bureau of Internal Revenue (BIR) POS Invoicing Guidelines
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Establishes the mandatory math formula for cashiers: <code>Net Sale = (Gross Price ÷ 1.12) − [(Gross Price ÷ 1.12) × 20%]</code>. The 20% discount is claimed by the merchant as a deductible expense on their annual income tax return.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Statutory Discount Calculation Simulator */}
      {/* ========================================================================= */}
      {hubTab === 'calculator' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex flex-col gap-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-800 text-[20px]">calculate</span>
              <span>Official BIR / DTI Discount Calculation Simulator</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Verify the exact statutory deduction for any purchase before or at the cashier.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Select Statutory Category
              </label>
              <select
                value={calcDiscountType}
                onChange={(e) => setCalcDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              >
                <option value="medicine_dining">Medicines / Dining / Doctors (20% + 12% VAT-Exempt)</option>
                <option value="basic_necessities">Basic Necessities & Groceries (5% DTI JAO BNPC)</option>
                <option value="utilities">Residential Utilities: Electricity / Water (5% Subsidy)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Gross Amount / Tag Price (₱)
              </label>
              <input
                type="number"
                step="0.01"
                value={calcGrossAmount}
                onChange={(e) => setCalcGrossAmount(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Formula Breakdown Output */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider block">
                {calcResult.ruleName}
              </span>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Gross (VAT-Inclusive):</span>
                  <span>₱{(parseFloat(calcGrossAmount) || 0).toFixed(2)}</span>
                </div>

                {calcDiscountType === 'medicine_dining' && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Less: 12% VAT Exemption:</span>
                      <span className="text-rose-700 font-medium">−₱{calcResult.vatRemoved.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-semibold">
                      <span>Net VAT-Exempt Base:</span>
                      <span>₱{calcResult.base.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Less: Statutory Discount:</span>
                  <span>−₱{calcResult.discount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-2 mt-1 border-t border-slate-200 text-slate-950 font-black text-xs">
                  <span>Final Net Amount to Pay:</span>
                  <span className="text-emerald-800 text-sm">₱{calcResult.net.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-[10px] text-emerald-900 leading-tight">
                💡 <strong>Total Savings:</strong> You save <strong>₱{(calcResult.discount + (calcResult.vatRemoved || 0)).toFixed(2)}</strong> on this transaction under Philippine Law.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
