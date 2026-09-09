import React from 'react';
import { translations, Language } from '../utils/translations';

export type TabType = 'home' | 'id' | 'history' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  language?: Language;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, language = 'en' }) => {
  const t = translations[language] || translations.en;

  const tabs = [
    {
      id: 'home' as TabType,
      label: t.tabHome,
      icon: 'home',
    },
    {
      id: 'id' as TabType,
      label: t.tabID,
      icon: 'badge',
    },
    {
      id: 'history' as TabType,
      label: t.tabHistory,
      icon: 'history',
    },
    {
      id: 'profile' as TabType,
      label: t.tabProfile,
      icon: 'account_circle',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto z-50 bg-white border-t border-slate-200/80 shadow-md px-2 py-1.5 shrink-0" role="tablist" aria-label="Main Navigation">
      <div className="w-full grid grid-cols-4 gap-1 items-center min-h-[52px] sm:min-h-[56px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${tab.label} tab${isActive ? ', active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full min-h-[48px] py-1 px-1 rounded-xl active:scale-95 transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-emerald-800 hover:bg-emerald-50/60'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px] sm:text-[22px] shrink-0"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                }}
              >
                {tab.icon}
              </span>
              <span className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 max-w-full text-center ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

