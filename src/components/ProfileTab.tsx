import React from 'react';
import { UserProfile, AccessibilitySettings } from '../types';
import { translations, Language } from '../utils/translations';

interface ProfileTabProps {
  profile: UserProfile;
  accessibilitySettings: AccessibilitySettings;
  onOpenAccessibility: () => void;
  onEditPersonalInfo: () => void;
  onOpenHelp: () => void;
  onOpenEmergency: () => void;
  onLogout: () => void;
  onUpdateAvatar: () => void;
  language?: Language;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  accessibilitySettings,
  onOpenAccessibility,
  onEditPersonalInfo,
  onOpenHelp,
  onOpenEmergency,
  onLogout,
  onUpdateAvatar,
  language = 'en',
}) => {
  const t = translations[language] || translations.en;

  return (
    <div className="px-4 sm:px-5 py-5 pb-6 max-w-lg mx-auto space-y-6">
      {/* User Info Section */}
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-3 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-emerald-200 overflow-hidden bg-slate-100 shadow-xs">
            <img
              src={profile?.photoUrl}
              alt={profile?.name || 'Profile Picture'}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onUpdateAvatar}
            aria-label="Edit Profile Picture"
            className="absolute bottom-0 right-0 bg-emerald-800 text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-xs active:scale-90 transition-transform hover:bg-emerald-900"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              edit
            </span>
          </button>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {profile?.name || 'Roberto Evangelista'}
          </h2>
          <p className="text-xs font-mono text-slate-500 flex items-center justify-center gap-1 mt-1">
            {t.idNumber}: {profile?.idNumber || 'SC-2024-008912'}
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">
              verified
            </span>
          </p>
          <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {profile?.idType === 'senior' ? t.seniorDigitalID : t.pwdDigitalID}
          </span>
        </div>
      </section>

      {/* Preferences & Menu List */}
      <nav className="space-y-4">
        
        {/* Accessibility Settings */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">
            Accessibility & Display
          </p>
          <button
            onClick={onOpenAccessibility}
            className="w-full flex items-center justify-between bg-white text-slate-900 px-4 py-3.5 rounded-2xl shadow-2xs active:scale-[0.98] transition-all border border-slate-200/80 hover:border-slate-300 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-emerald-800 text-white w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  accessibility_new
                </span>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm block text-slate-900">
                  {t.accessibilityControls}
                </span>
                <span className="text-[11px] text-slate-500">
                  Text scale ({accessibilitySettings.fontSize}), contrast & reader
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </button>
        </div>

        {/* Account Section */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
            Account Management
          </p>

          {/* Personal Info */}
          <button
            onClick={onEditPersonalInfo}
            className="w-full flex items-center justify-between bg-white text-slate-900 px-4 py-3.5 rounded-2xl shadow-2xs active:scale-[0.98] transition-all border border-slate-200/80 hover:border-slate-300 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-slate-100 text-slate-700 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm block text-slate-900">{t.personalInformation}</span>
                <span className="text-[11px] text-slate-500">Update verified contact & details</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </button>

          {/* Emergency Contacts */}
          <button
            onClick={onOpenEmergency}
            className="w-full flex items-center justify-between bg-white text-slate-900 px-4 py-3.5 rounded-2xl shadow-2xs active:scale-[0.98] transition-all border border-slate-200/80 hover:border-slate-300 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-slate-100 text-slate-700 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm block text-slate-900">{t.emergencyContacts}</span>
                <span className="text-[11px] text-slate-500">Manage 24/7 designated emergency phone</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </button>
        </div>

        {/* Support Section */}
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">
            Support & Safety
          </p>

          {/* Help & Support */}
          <button
            onClick={onOpenHelp}
            className="w-full flex items-center justify-between bg-white text-slate-900 px-4 py-3.5 rounded-2xl shadow-2xs active:scale-[0.98] transition-all border border-slate-200/80 hover:border-slate-300 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-slate-100 text-slate-700 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">help_center</span>
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm block text-slate-900">{t.prioritySupport}</span>
                <span className="text-[11px] text-slate-500">Direct assistance: 1-800-KAAGAPAY</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between bg-white text-rose-600 px-4 py-3.5 rounded-2xl shadow-2xs active:scale-[0.98] transition-all border border-rose-200/80 hover:bg-rose-50/50 mt-3 text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-rose-50 text-rose-600 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-rose-100">
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </div>
              <span className="font-bold text-xs sm:text-sm">{t.logout}</span>
            </div>
            <span className="material-symbols-outlined text-rose-400 text-[18px]">chevron_right</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

