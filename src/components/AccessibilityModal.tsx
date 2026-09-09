import React from 'react';
import { AccessibilitySettings, ColorVisionMode, FontSizeScale } from '../types';
import { speakText } from '../utils/audioAndTTS';
import { Language, translations } from '../utils/translations';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  language?: Language;
}

const FONT_SCALE_LEVELS: { id: FontSizeScale; label: string; pct: string; desc: string }[] = [
  { id: 'compact', label: 'Compact', pct: '90%', desc: 'Compact layout fitting more information on screen' },
  { id: 'normal', label: 'Default', pct: '100%', desc: 'Standard default text size' },
  { id: 'large', label: 'Large', pct: '115%', desc: 'Comfortable reading size for seniors' },
  { id: 'xlarge', label: 'X-Large', pct: '130%', desc: 'Extra large for low-vision assistance' },
  { id: 'huge', label: 'Maximum', pct: '145%', desc: 'Highest clarity for aging eye sight' },
];

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  language = 'en',
}) => {
  const currentLang: Language = language === 'tl' ? 'tl' : 'en';
  if (!isOpen) return null;

  const t = translations[currentLang] || translations.en;

  const getCurrentScaleIndex = (): number => {
    const idx = FONT_SCALE_LEVELS.findIndex((s) => s.id === settings.fontSize);
    return idx !== -1 ? idx + 1 : 2; // Default to 2 (100% normal)
  };

  const currentScale = FONT_SCALE_LEVELS[getCurrentScaleIndex() - 1] || FONT_SCALE_LEVELS[1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const selected = FONT_SCALE_LEVELS[val - 1] || FONT_SCALE_LEVELS[1];
    onUpdateSettings({ fontSize: selected.id });
    if (settings.voiceReaderEnabled) {
      speakText(
        currentLang === 'tl'
          ? `Laki ng teksto: Antas ${val}, ${selected.label}, ${selected.pct}`
          : `Text scale: Level ${val}, ${selected.label}, ${selected.pct}`,
        currentLang
      );
    }
  };

  const handleStepAdjust = (delta: number) => {
    const currentIdx = getCurrentScaleIndex();
    const nextIdx = Math.max(1, Math.min(5, currentIdx + delta));
    const selected = FONT_SCALE_LEVELS[nextIdx - 1];
    onUpdateSettings({ fontSize: selected.id });
    if (settings.voiceReaderEnabled) {
      speakText(
        currentLang === 'tl'
          ? `Laki ng teksto: Antas ${nextIdx}, ${selected.label}, ${selected.pct}`
          : `Text scale: Level ${nextIdx}, ${selected.label}, ${selected.pct}`,
        currentLang
      );
    }
  };

  const handleTestVoice = () => {
    speakText(
      currentLang === 'tl' 
        ? 'Maligayang pagdating sa KaagapayID. Ang Voice Reader ay aktibo at handang magsalita sa bawat pindutin.'
        : 'Welcome to KaagapayID. Voice Reader Assistant is active and will speak through every item you tap or click.',
      currentLang
    );
  };

  const handleContrastToggle = () => {
    const nextVal = !settings.highContrast;
    onUpdateSettings({ highContrast: nextVal });
    if (settings.voiceReaderEnabled) {
      speakText(
        nextVal 
          ? (currentLang === 'tl' ? 'Aktibo na ang High Contrast Mode' : 'High Contrast Mode turned on')
          : (currentLang === 'tl' ? 'Naka-off na ang High Contrast Mode' : 'High Contrast Mode turned off'),
        currentLang
      );
    }
  };

  const handleVoiceToggle = () => {
    const nextVal = !settings.voiceReaderEnabled;
    onUpdateSettings({ voiceReaderEnabled: nextVal });
    if (nextVal) {
      speakText(
        currentLang === 'tl'
          ? 'Aktibo na ang Voice Reader Assistant. Magsasalita ang assistant sa bawat pindutin sa inyong screen.'
          : 'Voice Reader Assistant is now active. The assistant will speak through everything you tap or click on your mobile screen.',
        currentLang
      );
    } else {
      speakText(
        currentLang === 'tl'
          ? 'Naka-off na ang Voice Reader Assistant.'
          : 'Voice Reader Assistant turned off.',
        currentLang
      );
    }
  };

  const handleColorVisionChange = (mode: ColorVisionMode, label: string) => {
    onUpdateSettings({ colorVisionMode: mode });
    if (settings.voiceReaderEnabled) {
      speakText(
        currentLang === 'tl'
          ? `Pinili ang ${label} na profile ng paningin`
          : `${label} color vision profile selected`,
        currentLang
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-[1.75rem] shadow-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex justify-between items-center border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-700 shrink-0">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                accessibility_new
              </span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">{t.accessibility}</h2>
              <p className="text-[11px] text-emerald-300">Customize font scale slider, contrast & color vision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Accessibility Settings"
            className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-200 flex items-center justify-center hover:bg-emerald-950 hover:text-white transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: 5-Point Text Scaling Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="text-scale-slider" className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">format_size</span>
                <span>5-Point Text Scaling Slider</span>
              </label>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Level {getCurrentScaleIndex()}: {currentScale.pct} ({currentScale.label})
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              Drag the slider or use the buttons to scale typography smoothly across the entire application without distorting buttons or menus.
            </p>

            {/* Stepper + Range Slider Controls - Fixed Control Container & Fixed Slider Dimensions */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStepAdjust(-1)}
                  disabled={getCurrentScaleIndex() <= 1}
                  aria-label="Decrease text size"
                  className="w-10 !h-10 !min-h-[40px] !max-h-[40px] rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 shrink-0 shadow-xs active:scale-95 transition-transform"
                >
                  <span className="!text-sm font-black">A-</span>
                </button>

                <div className="flex-1 px-1 flex flex-col justify-center">
                  <input
                    id="text-scale-slider"
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={getCurrentScaleIndex()}
                    onChange={handleSliderChange}
                    aria-valuemin={1}
                    aria-valuemax={5}
                    aria-valuenow={getCurrentScaleIndex()}
                    aria-valuetext={`Level ${getCurrentScaleIndex()}: ${currentScale.label} (${currentScale.pct})`}
                    className="w-full accent-emerald-800 cursor-pointer !h-2.5 !min-h-[10px] !max-h-[10px] bg-slate-300 rounded-lg appearance-none my-1"
                  />
                  <div className="flex justify-between font-bold text-slate-600 mt-1.5 px-0.5" style={{ fontSize: '11px' }}>
                    <span>1: 90%</span>
                    <span>2: 100%</span>
                    <span>3: 115%</span>
                    <span>4: 130%</span>
                    <span>5: 145%</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepAdjust(1)}
                  disabled={getCurrentScaleIndex() >= 5}
                  aria-label="Increase text size"
                  className="w-10 !h-10 !min-h-[40px] !max-h-[40px] rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 shrink-0 shadow-xs active:scale-95 transition-transform"
                >
                  <span className="!text-base font-black">A+</span>
                </button>
              </div>

              {/* Live Text Scale Preview Box */}
              <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Live Preview</span>
                  <span className="text-emerald-800 font-extrabold">{currentScale.pct} ({currentScale.label})</span>
                </div>
                <p className="font-extrabold text-slate-900 leading-snug">
                  KaagapayID: 20% Senior Citizen & PWD Benefits
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentLang === 'tl'
                    ? 'Awtomatikong diskwento sa gamot, grocery, pamasahe, at emergency assistance.'
                    : 'Automatic discount calculator for medicines, groceries, fares, and priority emergency hotlines.'}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: High Contrast Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">contrast</span>
                <span>High Contrast Mode (WCAG AAA)</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug">
                Enforces maximum contrast with solid black text, defined borders, and bright accents to reduce eye strain.
              </p>
            </div>
            <button
              onClick={handleContrastToggle}
              role="switch"
              aria-checked={settings.highContrast}
              aria-label={`Toggle High Contrast Mode. Currently ${settings.highContrast ? 'On' : 'Off'}`}
              className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                settings.highContrast ? 'bg-emerald-800' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-xs transition-transform ${
                  settings.highContrast ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Color Vision & Senior Eye Clarity */}
          <div className="space-y-2.5">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">palette</span>
                <span>Color Vision & Senior Eye Clarity</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-snug">
                Optimizes color palettes and removes glare to account for aging cornea/lens changes, cataract light scatter, and color vision deficiencies (colorblindness).
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {[
                {
                  id: 'standard',
                  name: 'Standard Natural',
                  desc: 'Default balanced natural color palette.',
                  icon: 'auto_awesome',
                  badge: 'Standard',
                },
                {
                  id: 'senior-clarity',
                  name: 'Senior Eye Clarity (Anti-Glare)',
                  desc: 'Filters harsh glare and light scatter from cataracts; removes muddying yellow tints with crisp high-transmission cool slate & cyan contrast.',
                  icon: 'visibility',
                  badge: 'Aging Eye Friendly',
                },
                {
                  id: 'deuteranopia',
                  name: 'Deuteranopia / Protanopia',
                  desc: 'Red-Green colorblind assistance using distinct royal cobalt blue, amber gold, and shape markers.',
                  icon: 'contrast_rtl_off',
                  badge: 'Red-Green Safe',
                },
                {
                  id: 'tritanopia',
                  name: 'Tritanopia',
                  desc: 'Blue-Yellow colorblind assistance with high-contrast teal, magenta crimson, and dark slate.',
                  icon: 'gradient',
                  badge: 'Blue-Yellow Safe',
                },
                {
                  id: 'achromatopsia',
                  name: 'High-Distinction Grayscale',
                  desc: 'Total colorblindness (Achromatopsia) mode relying purely on luminance, border weights, and shape symbols.',
                  icon: 'tonality',
                  badge: 'Monochrome',
                },
              ].map((item) => {
                const isSelected = (settings.colorVisionMode || 'standard') === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleColorVisionChange(item.id as ColorVisionMode, item.name)}
                    aria-label={`${item.name}. ${item.desc}`}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50/70 text-slate-900 ring-2 ring-emerald-700/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                          {item.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                            isSelected
                              ? 'bg-emerald-200 text-emerald-950 font-extrabold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Voice Reader / Text-to-Speech */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">record_voice_over</span>
                  <span>Voice Reader Assistant</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Speaks aloud every button, tab, card, input, and feature you tap on your screen.
                </p>
              </div>
              <button
                onClick={handleVoiceToggle}
                role="switch"
                aria-checked={settings.voiceReaderEnabled}
                aria-label={`Toggle Voice Reader Assistant. Currently ${settings.voiceReaderEnabled ? 'On' : 'Off'}`}
                className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                  settings.voiceReaderEnabled ? 'bg-emerald-800' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-xs transition-transform ${
                    settings.voiceReaderEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.voiceReaderEnabled && (
              <button
                onClick={handleTestVoice}
                aria-label="Test Voice Speech Output"
                className="w-full py-2.5 px-3 bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 border border-emerald-200 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
                <span>Test Voice Speech Output</span>
              </button>
            )}
          </div>
          <hr className="border-slate-100" />

          {/* Section 5: W3C Mobile Touch & Motor Assistance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">touch_app</span>
                  <span>Expanded Touch Targets</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Genuinely enlarges tap areas, buttons, and form controls to 52px+ with generous clearance for tremors and easier tapping.
                </p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.largeTouchTargets;
                  onUpdateSettings({ largeTouchTargets: nextVal });
                  if (settings.voiceReaderEnabled) {
                    speakText(nextVal ? 'Expanded Touch Targets turned on' : 'Expanded Touch Targets turned off', currentLang);
                  }
                }}
                role="switch"
                aria-checked={!!settings.largeTouchTargets}
                aria-label={`Toggle Expanded Touch Targets. Currently ${settings.largeTouchTargets ? 'On' : 'Off'}`}
                className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                  settings.largeTouchTargets ? 'bg-emerald-800' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-xs transition-transform ${
                    settings.largeTouchTargets ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">motion_photos_off</span>
                  <span>Reduced Motion</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Disables page animations and transitions to eliminate motion sensitivity.
                </p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.reducedMotion;
                  onUpdateSettings({ reducedMotion: nextVal });
                  if (settings.voiceReaderEnabled) {
                    speakText(nextVal ? 'Reduced Motion turned on' : 'Reduced Motion turned off', currentLang);
                  }
                }}
                role="switch"
                aria-checked={!!settings.reducedMotion}
                aria-label={`Toggle Reduced Motion. Currently ${settings.reducedMotion ? 'On' : 'Off'}`}
                className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                  settings.reducedMotion ? 'bg-emerald-800' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-xs transition-transform ${
                    settings.reducedMotion ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptic Vibration Feedback */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-700">vibration</span>
                    <span>Tactile Haptic Feedback</span>
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Provides a gentle physical vibration pulse whenever you tap buttons or interact with features.
                </p>
              </div>
              <button
                onClick={() => {
                  const nextVal = !settings.hapticFeedback;
                  onUpdateSettings({ hapticFeedback: nextVal });
                  if (nextVal && typeof window !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(40);
                  }
                  if (settings.voiceReaderEnabled) {
                    speakText(nextVal ? 'Tactile Haptic Feedback turned on' : 'Tactile Haptic Feedback turned off', currentLang);
                  }
                }}
                role="switch"
                aria-checked={!!settings.hapticFeedback}
                aria-label={`Toggle Tactile Haptic Feedback. Currently ${settings.hapticFeedback ? 'On' : 'Off'}`}
                className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                  settings.hapticFeedback ? 'bg-emerald-800' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-xs transition-transform ${
                    settings.hapticFeedback ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Accessibility Standards Note */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-950 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-800 text-[18px]">verified</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Accessible Design & Assisted Features
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-snug">
              KaagapayID provides enhanced touch targets, optimal contrast, screen reader semantics, keyboard navigation, and spoken voice guidance designed specifically for senior citizens and persons with disabilities.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            aria-label="Save Accessibility Preferences"
            className="w-full py-3 bg-emerald-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-900 active:scale-[0.99] transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
