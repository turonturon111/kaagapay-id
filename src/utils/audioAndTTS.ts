// Speech Synthesis & Safety Audio Utilities for KaagapayID
import { Language } from './translations';

// Cache voices once loaded
let availableVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export const speakText = (text: string, language: string = 'en') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!text || !text.trim()) return;

  try {
    window.speechSynthesis.cancel(); // Stop current speech immediately for fast feedback
    
    // Clean text of multiple spaces or orphan characters
    const cleanText = text.trim().replace(/\s+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.93; // Deliberate and clear speed for senior & PWD accessibility
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (availableVoices.length === 0) {
      availableVoices = window.speechSynthesis.getVoices();
    }

    if (language === 'tl') {
      utterance.lang = 'fil-PH';
      const filVoice = availableVoices.find(
        (v) => v && v.lang && (v.lang.includes('fil') || v.lang.includes('tl') || v.lang.includes('PH'))
      );
      if (filVoice) {
        utterance.voice = filVoice;
      }
    } else {
      utterance.lang = 'en-US';
      const enVoice = availableVoices.find(
        (v) =>
          v &&
          v.lang &&
          (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')) &&
          ((v.name && (v.name.includes('Google') || v.name.includes('Natural'))) || v.default)
      ) || availableVoices.find((v) => v && v.lang && v.lang.startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('TTS speech synthesis error', e);
  }
};

// Map of common icon ligatures to human-friendly spoken descriptions
const ICON_DESCRIPTIONS: Record<string, { en: string; tl: string }> = {
  arrow_back: { en: 'Go back', tl: 'Bumalik' },
  close: { en: 'Close', tl: 'Isara' },
  translate: { en: 'Switch Language', tl: 'Magpalit ng Wika' },
  accessibility_new: { en: 'Accessibility Settings', tl: 'Mga Setting ng Accessibility' },
  notifications: { en: 'Notifications', tl: 'Mga Abiso at Alerto' },
  add_a_photo: { en: 'Upload Profile Picture', tl: 'Maglagay ng Larawan' },
  edit: { en: 'Edit', tl: 'I-edit' },
  qr_code_2: { en: 'Digital ID QR Code', tl: 'Digital ID QR Code' },
  qr_code_scanner: { en: 'Scan QR Code', tl: 'I-scan ang QR Code' },
  visibility: { en: 'Show Password', tl: 'Ipakita ang Password' },
  visibility_off: { en: 'Hide Password', tl: 'Itago ang Password' },
  storefront: { en: 'Nearby Partner Stores', tl: 'Mga Katabing Tindahan' },
  receipt_long: { en: 'Transaction History', tl: 'Kasaysayan ng Transaksyon' },
  emergency: { en: 'Emergency SOS and Hotlines', tl: 'Emergency SOS at Tulong' },
  medication: { en: 'Medicine Tracker', tl: 'Talaan ng Gamot' },
  calendar_clock: { en: 'Appointments and Reminders', tl: 'Mga Iskedyul at Paalala' },
  verified_user: { en: 'Benefits and Discounts Guide', tl: 'Gabay sa Diskwento at Benepisyo' },
  calculate: { en: 'Discount and VAT Calculator', tl: 'Kalkulador ng Diskwento' },
  campaign: { en: 'Government Assistance Updates', tl: 'Mga Balita sa Tulong ng Gobyerno' },
  share: { en: 'Share Digital ID', tl: 'Ibahagi ang Digital ID' },
  download: { en: 'Download Digital ID', tl: 'I-download ang Digital ID' },
  screen_rotation: { en: 'Rotate ID Card to Fullscreen', tl: 'I-rotate ang ID sa Fullscreen' },
  sync: { en: 'Refresh ID Token', tl: 'I-refresh ang ID' },
  volume_up: { en: 'Test Voice Speech Output', tl: 'Subukan ang Voice Reader' },
  verified: { en: 'Verified Account', tl: 'Kumpirmadong Account' },
  home: { en: 'Home Tab', tl: 'Pangunahing Screen' },
  badge: { en: 'My Digital ID Tab', tl: 'Aking Digital ID' },
  history: { en: 'Transaction History Tab', tl: 'Kasaysayan ng Transaksyon' },
  account_circle: { en: 'Profile and Settings Tab', tl: 'Profile at mga Setting' },
  contrast: { en: 'High Contrast Mode', tl: 'High Contrast Mode' },
  format_size: { en: 'Text Size Scaling', tl: 'Laki ng Teksto' },
  record_voice_over: { en: 'Voice Reader Assistant', tl: 'Voice Reader Assistant' },
  add: { en: 'Add new item', tl: 'Magdagdag ng bago' },
  search: { en: 'Search', tl: 'Maghanap' },
  phone: { en: 'Call hotline', tl: 'Tawagan' },
  call: { en: 'Make a call', tl: 'Tumawag' },
  schedule: { en: 'Schedule or Time', tl: 'Oras at Iskedyul' },
  calendar_today: { en: 'Calendar Date', tl: 'Petsa sa Kalendaryo' },
  location_on: { en: 'Store Location', tl: 'Lokasyon' },
  help: { en: 'Help & Information', tl: 'Tulong at Impormasyon' },
};

/**
 * Intelligent function that examines any clicked HTML element and creates
 * a clear, accessible sentence for mobile voice guidance.
 */
export const getElementSpeechText = (element: HTMLElement, language: Language = 'en'): string => {
  if (!element) return '';

  // 1. Explicit data-voice override
  const dataVoice = element.getAttribute('data-voice');
  if (dataVoice && dataVoice.trim()) {
    return dataVoice.trim();
  }

  // 2. Form controls: Checkbox / Switch
  if (element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio')) {
    const labelElem = element.closest('label') || document.querySelector(`label[for="${element.id}"]`);
    const labelText = labelElem?.textContent?.trim() || element.getAttribute('aria-label') || 'Option';
    const stateText = element.checked
      ? language === 'tl' ? 'Naka-on' : 'Enabled'
      : language === 'tl' ? 'Naka-off' : 'Disabled';
    return `${labelText}, ${stateText}`;
  }

  // 3. Form controls: Input / Textarea
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const placeholder = element.placeholder || '';
    const labelElem = element.closest('label') || document.querySelector(`label[for="${element.id}"]`);
    const labelText = labelElem?.textContent?.trim() || '';
    const fieldName = labelText || placeholder || (language === 'tl' ? 'Kahon ng teksto' : 'Text input field');
    const value = element.value;
    if (value) {
      return language === 'tl'
        ? `${fieldName}. Kasalukuyang nakalagay: ${value}`
        : `${fieldName}. Current value: ${value}`;
    }
    return language === 'tl' ? `Pindutin para mag-type sa ${fieldName}` : `Tap to enter text for ${fieldName}`;
  }

  // 4. Form controls: Select Dropdown
  if (element instanceof HTMLSelectElement) {
    const selectedOption = element.options[element.selectedIndex]?.text || '';
    return language === 'tl'
      ? `Dropdown menu. Kasalukuyang pinili: ${selectedOption}`
      : `Dropdown selection. Currently selected: ${selectedOption}`;
  }

  // 5. Check aria-label and title
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) {
    return ariaLabel.trim();
  }

  const title = element.getAttribute('title');
  if (title && title.trim()) {
    return title.trim();
  }

  // 6. Check for Tab role
  const role = element.getAttribute('role');
  if (role === 'tab') {
    const tabText = getCleanTextContent(element);
    return language === 'tl' ? `Tab: ${tabText}` : `Tab: ${tabText}`;
  }

  // 7. Clean inner text (remove material icons ligatures or replace them)
  const cleanText = getCleanTextContent(element, language);
  if (cleanText) {
    return cleanText;
  }

  // 8. If empty text, check for single Material Icon inside
  const iconSpan = element.querySelector('.material-symbols-outlined');
  if (iconSpan) {
    const iconName = iconSpan.textContent?.trim().toLowerCase() || '';
    if (iconName && ICON_DESCRIPTIONS[iconName]) {
      return ICON_DESCRIPTIONS[iconName][language] || ICON_DESCRIPTIONS[iconName].en;
    }
  }

  return '';
};

/**
 * Extracts visible text while removing or translating icon text ligatures
 */
const getCleanTextContent = (element: HTMLElement, language: Language = 'en'): string => {
  // Clone element to safely remove material icons without mutating DOM
  const clone = element.cloneNode(true) as HTMLElement;
  const icons = clone.querySelectorAll('.material-symbols-outlined');
  
  let fallbackIconDesc = '';
  icons.forEach((icon) => {
    const iconText = icon.textContent?.trim().toLowerCase() || '';
    if (iconText && ICON_DESCRIPTIONS[iconText]) {
      fallbackIconDesc = ICON_DESCRIPTIONS[iconText][language] || ICON_DESCRIPTIONS[iconText].en;
    }
    icon.remove();
  });

  const rawText = clone.innerText || clone.textContent || '';
  const cleaned = rawText.replace(/\s+/g, ' ').trim();

  if (cleaned.length > 0) {
    return cleaned;
  }

  return fallbackIconDesc;
};

let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;

export const triggerHapticFeedback = (durationMs: number = 30) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(durationMs);
    }
  } catch (e) {
    // Ignore haptic errors on unsupported devices
  }
};

export const playEmergencySiren = (): (() => void) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return () => {};
    audioCtx = new AudioContextClass();

    sirenOscillator = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenOscillator.frequency.setValueAtTime(800, audioCtx.currentTime);

    // Modulation for siren sound
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(2, audioCtx.currentTime); // 2 Hz sweep
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(400, audioCtx.currentTime); // sweep between 400Hz and 1200Hz

    lfo.connect(lfoGain);
    lfoGain.connect(sirenOscillator.frequency);

    sirenGain.gain.setValueAtTime(0.3, audioCtx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    lfo.start();
    sirenOscillator.start();

    // Return stop function
    return () => {
      try {
        if (sirenOscillator) sirenOscillator.stop();
        if (lfo) lfo.stop();
        if (audioCtx) audioCtx.close();
      } catch (e) {
        console.error("Error stopping audio", e);
      }
    };
  } catch (e) {
    console.error("Audio Context error", e);
    return () => {};
  }
};

/**
 * Plays responsive Web Audio chime tones for QR verification results
 */
export const playVerificationChime = (status: 'VALID' | 'EXPIRED' | 'UNAUTHORIZED' | 'INVALID') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (status === 'VALID') {
      // Pleasant high-pitch ascending triad chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        
        gain.gain.setValueAtTime(0.01, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
      });
    } else if (status === 'EXPIRED') {
      // Caution descending two-tone
      const notes = [440, 349.23];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.35);
      });
    } else {
      // Unauthorized / Invalid: Low buzz alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.error('Audio chime error', e);
  }
};

/**
 * Plays a pleasant appointment reminder bell / chime
 */
export const playReminderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [587.33, 880.00]; // D5 -> A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.01, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.55);
    });
  } catch (e) {
    console.error('Reminder chime error', e);
  }
};


