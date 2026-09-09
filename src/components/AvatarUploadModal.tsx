import React, { useState, useRef } from 'react';
import { translations, Language } from '../utils/translations';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl: string;
  onSavePhoto: (newPhotoUrl: string) => void;
  language?: Language;
}

const PRESET_AVATARS = [
  {
    name: 'Senior Citizen (Male)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Senior Citizen (Female)',
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'PWD Adult (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'PWD Adult (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  },
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentPhotoUrl,
  onSavePhoto,
  language = 'en',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhotoUrl);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isTagalog = language === 'tl';

  const processFile = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg(isTagalog ? 'Mangyaring pumili ng tamang larawan (JPG, PNG, WebP).' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(isTagalog ? 'Masyadong malaki ang file (lampas 10MB).' : 'Image file is too large (maximum 10MB).');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPhoto(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setErrorMsg(isTagalog ? 'Hindi mabasa ang napiling larawan.' : 'Failed to read the selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSave = () => {
    if (selectedPhoto) {
      onSavePhoto(selectedPhoto);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex justify-between items-center border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                {isTagalog ? 'Palitan ang Larawan ng Profile' : 'Upload Profile Picture'}
              </h2>
              <p className="text-[11px] text-emerald-300">
                {isTagalog ? 'Pumili ng larawan mula sa iyong device' : 'Choose an image from your device'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-200 flex items-center justify-center hover:bg-emerald-950 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current / Selected Preview */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative mb-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-emerald-600 overflow-hidden bg-slate-200 shadow-md">
                <img
                  src={selectedPhoto}
                  alt="Selected Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-800 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-800">
              {fileName ? fileName : isTagalog ? 'Kasalukuyang Larawan' : 'Active Profile Photo'}
            </span>
            <span className="text-[11px] text-slate-500">
              {isTagalog ? 'Makikita ito sa iyong Digital ID at transaksyon' : 'Shown on your Digital ID & transactions'}
            </span>
          </div>

          {/* File Upload Zone (Click + Drag & Drop) */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isTagalog ? 'Mag-upload mula sa Device' : 'Upload from Local Device'}
            </label>

            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-500'
              }`}
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {isTagalog ? 'Pindutin para pumili ng larawan' : 'Click to browse files'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isTagalog ? 'o i-drag and drop ang image file dito' : 'or drag & drop your image file here'}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">image</span>
                JPG, PNG, WebP (Max 10MB)
              </span>
            </div>
          </div>

          {/* Preset Options */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isTagalog ? 'O pumili mula sa mga halimbawa' : 'Or choose standard sample avatar'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AVATARS.map((preset, idx) => {
                const isSelected = selectedPhoto === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(preset.url);
                      setFileName('');
                      setErrorMsg('');
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                      isSelected
                        ? 'border-emerald-700 ring-2 ring-emerald-400/50 scale-105 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[18px] drop-shadow-md">
                          check_circle
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
            >
              {isTagalog ? 'Kanselahin' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-2/3 h-11 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isTagalog ? 'I-save ang Larawan' : 'Save Profile Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
