import React, { useState } from 'react';
import { playEmergencySiren } from '../utils/audioAndTTS';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  emergencyContactName,
  emergencyContactPhone,
}) => {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [stopSirenFn, setStopSirenFn] = useState<(() => void) | null>(null);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (sirenPlaying) {
      if (stopSirenFn) stopSirenFn();
      setSirenPlaying(false);
      setStopSirenFn(null);
    } else {
      const stopFn = playEmergencySiren();
      setSirenPlaying(true);
      setStopSirenFn(() => stopFn);
    }
  };

  const simulateCall = (name: string, phone: string) => {
    setCallingNumber(`${name} (${phone})`);
    setTimeout(() => {
      setCallingNumber(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-sm overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-black text-white p-6 flex justify-between items-center border-b border-slate-900">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Emergency Assistance</h2>
              <p className="text-xs text-slate-400">24/7 Priority Hotline & SOS</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (sirenPlaying && stopSirenFn) stopSirenFn();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Ongoing Call Simulation Banner */}
          {callingNumber && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-[24px] text-emerald-700">call_in_progress</span>
              <div>
                <p className="font-bold text-xs text-emerald-950">Calling Emergency Contact...</p>
                <p className="text-xs font-mono text-emerald-800">{callingNumber}</p>
              </div>
            </div>
          )}

          {/* SOS Loud Whistle / Alarm Sound Button */}
          <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-rose-600">volume_up</span>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Loud SOS Siren Alarm</h3>
                <p className="text-xs text-slate-500">Emits high-pitch audible distress signal</p>
              </div>
            </div>
            <button
              onClick={toggleSiren}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                sirenPlaying
                  ? 'bg-rose-600 text-white animate-bounce shadow-xs'
                  : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              {sirenPlaying ? 'Stop Siren' : 'Sound Siren'}
            </button>
          </div>

          {/* Primary Hotline Buttons */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">
              Priority Government Hotlines
            </p>

            {/* National Senior/PWD Hotline */}
            <button
              onClick={() => simulateCall('24/7 National Senior Hotline', '1-800-KAAGAPAY')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xs">
                  24/7
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">1-800-KAAGAPAY</h4>
                  <p className="text-xs text-slate-500">Senior Citizens & PWD Priority Hotline</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                call
              </span>
            </button>

            {/* Red Cross Philippines Emergency */}
            <button
              onClick={() => simulateCall('Philippine Red Cross', '143')}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">medical_services</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Philippine Red Cross (143)</h4>
                  <p className="text-xs text-slate-500">Ambulance & Emergency Medical Response</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                call
              </span>
            </button>

            {/* Personal Guardian / Family Contact */}
            <button
              onClick={() => simulateCall(emergencyContactName, emergencyContactPhone)}
              className="w-full p-4 bg-emerald-50/60 hover:bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-left active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">family_restroom</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950">
                    {emergencyContactName || 'Family Contact'}
                  </h4>
                  <p className="text-xs text-emerald-800 font-mono">{emergencyContactPhone}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                call
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              if (sirenPlaying && stopSirenFn) stopSirenFn();
              onClose();
            }}
            className="w-full h-11 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 transition-colors"
          >
            Close Emergency Menu
          </button>
        </div>
      </div>
    </div>
  );
};
