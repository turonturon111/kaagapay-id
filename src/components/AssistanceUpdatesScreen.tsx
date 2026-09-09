import React, { useState } from 'react';
import { AssistanceUpdate } from '../types';
import { Language, translations } from '../utils/translations';

interface AssistanceUpdatesScreenProps {
  updates: AssistanceUpdate[];
  onShowToast: (message: string) => void;
  language?: Language;
}

export const AssistanceUpdatesScreen: React.FC<AssistanceUpdatesScreenProps> = ({
  updates,
  onShowToast,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(updates[0]?.id || null);

  const categories = ['All', 'Medical Missions', 'Pension Schedule', 'Vaccination', 'LGU Services', 'Advisories'];

  const filteredUpdates = updates.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleToggleSave = (id: string, title: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((i) => i !== id));
      onShowToast(`Removed "${title.substring(0, 25)}..." from saved`);
    } else {
      setSavedIds([...savedIds, id]);
      onShowToast(`Saved update & reminder set for "${title.substring(0, 25)}..."`);
    }
  };

  return (
    <div className="px-4 sm:px-5 py-4 pb-20 max-w-lg mx-auto flex flex-col gap-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white p-4 sm:p-5 rounded-[1.5rem] shadow-md border border-indigo-800/80 relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight">{t.updatesHeader}</h2>
            <p className="text-[10px] sm:text-[11px] text-indigo-300">{t.updatesSub}</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-200 leading-snug">
          {t.updatesIntro}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcement Cards List */}
      <div className="space-y-2.5">
        {filteredUpdates.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500">
            <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">campaign</span>
            <p className="text-xs sm:text-sm font-bold">{t.noAnnouncementsFound}</p>
          </div>
        ) : (
          filteredUpdates.map((item) => {
            const isSaved = savedIds.includes(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all hover:border-indigo-300"
              >
                {/* Header Card */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.isUrgent && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-md font-extrabold text-[9px] uppercase tracking-wide border border-rose-200 flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
                          {t.urgentBadge}
                        </span>
                      )}
                      {item.isNew && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-extrabold text-[9px] uppercase tracking-wide border border-emerald-200">
                          {t.newBadge}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-900 rounded-md font-bold text-[9px] border border-indigo-100">
                        {item.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleSave(item.id, item.title)}
                      className={`p-1 rounded-lg transition-colors ${
                        isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 bg-slate-50'
                      }`}
                      title={isSaved ? 'Saved' : 'Save Update'}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="material-symbols-outlined text-indigo-800 text-[14px] shrink-0">event</span>
                      <span className="font-bold truncate">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="material-symbols-outlined text-indigo-800 text-[14px] shrink-0">location_on</span>
                      <span className="font-bold truncate">{item.location}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.summary}</p>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                      {t.organizerLabel}: {item.organizer}
                    </span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-[11px] font-extrabold text-indigo-900 hover:text-indigo-950 flex items-center gap-0.5 shrink-0 ml-2"
                    >
                      <span>{isExpanded ? t.showLess : t.fullDetails}</span>
                      <span className={`material-symbols-outlined text-[15px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-2 bg-indigo-50/40 border-t border-indigo-100 text-xs space-y-2">
                    <div>
                      <h4 className="font-extrabold text-indigo-950 uppercase tracking-wider text-[10px] mb-0.5">
                        {t.fullAdvisoryDetails}
                      </h4>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{item.details}</p>
                    </div>

                    {item.contactNumber && (
                      <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-indigo-800 text-[15px]">call</span>
                          <span className="font-bold text-slate-800 text-[11px]">{item.contactNumber}</span>
                        </div>
                        <button
                          onClick={() => onShowToast(`Dialing hotline: ${item.contactNumber}`)}
                          className="px-2 py-0.5 bg-indigo-900 text-white rounded-lg font-bold text-[10px] uppercase"
                        >
                          {t.callLine}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
