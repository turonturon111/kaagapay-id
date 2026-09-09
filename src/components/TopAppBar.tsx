import React from 'react';
import { NotificationItem, AppRole } from '../types';
import { Language } from '../utils/translations';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenAccessibility: () => void;
  language?: Language;
  onToggleLanguage?: () => void;
  appRole?: AppRole;
  onToggleRole?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'KaagapayID',
  showBack = false,
  onBack,
  notifications,
  onOpenNotifications,
  onOpenAccessibility,
  language = 'en',
  onToggleLanguage,
  appRole = 'user',
  onToggleRole,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="w-full max-w-lg mx-auto sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between h-[56px] sm:h-[60px] px-3 sm:px-4 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {showBack ? (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-transform text-slate-900 border border-slate-200 bg-white shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">arrow_back</span>
          </button>
        ) : (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 text-white ${
            appRole === 'verifier' ? 'bg-blue-900' : 'bg-emerald-800'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {appRole === 'verifier' ? 'point_of_sale' : 'qr_code_2'}
            </span>
          </div>
        )}
        <div className="truncate min-w-0">
          <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Role Switcher Pill */}
        {onToggleRole && (
          <button
            onClick={onToggleRole}
            title={appRole === 'user' ? 'Switch to Cashier / Verifier Mode' : 'Switch to Citizen Mode'}
            className={`h-8 px-2 sm:px-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all border ${
              appRole === 'verifier'
                ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {appRole === 'verifier' ? 'point_of_sale' : 'badge'}
            </span>
            <span>{appRole === 'verifier' ? 'Verifier' : 'Citizen'}</span>
          </button>
        )}

        {/* Language Switcher Pill */}
        <button
          onClick={onToggleLanguage}
          title="Switch Language / Magpalit ng Wika"
          aria-label={language === 'en' ? 'Switch language to Tagalog' : 'Palitan ang wika sa English'}
          className="h-8 px-2 sm:px-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 border border-emerald-300 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[15px] text-emerald-800">translate</span>
          <span className="font-extrabold">{language === 'en' ? 'EN' : 'TL'}</span>
        </button>

        {/* Quick Accessibility Toggle Button */}
        <button
          onClick={onOpenAccessibility}
          title="Accessibility Settings"
          aria-label="Open Accessibility Settings"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-transform text-slate-700 bg-slate-50 border border-slate-200/80 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[19px]">accessibility_new</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-transform duration-150 text-slate-700 bg-slate-50 border border-slate-200/80 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};


