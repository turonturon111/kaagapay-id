import React, { useState, useRef } from 'react';
import { UserProfile, IDType } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [idNumber, setIdNumber] = useState(profile.idNumber);
  const [idType, setIdType] = useState<IDType>(profile.idType);
  const [mobile, setMobile] = useState(profile.mobile);
  const [address, setAddress] = useState(profile.address);
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setPhotoUrl(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      idNumber,
      idType,
      mobile,
      address,
      emergencyContactName,
      emergencyContactPhone,
      photoUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-sm overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-6 flex justify-between items-center border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <span className="material-symbols-outlined text-xl">edit_note</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">Edit Personal Information</h2>
              <p className="text-xs text-emerald-300">Update profile photo, details & emergency contact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-200 flex items-center justify-center hover:bg-emerald-950 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Photo Upload Row */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-600 overflow-hidden bg-slate-200 shadow-xs">
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-emerald-800 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-xs hover:bg-emerald-900"
              >
                <span className="material-symbols-outlined text-[13px]">add_a_photo</span>
              </button>
            </div>

            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-xs font-bold text-slate-800 block mb-0.5">Profile Picture</span>
              <p className="text-[11px] text-slate-500 mb-2">Upload from your device storage</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-white border border-slate-200 hover:border-emerald-600 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-700">upload_file</span>
                Choose File from Device
              </button>
            </div>
          </div>

          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {uploadError}
            </div>
          )}

          {/* ID Type switch */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-1.5">
              Account ID Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIdType('senior');
                  if (!idNumber.startsWith('SC-')) setIdNumber('SC-2024-008912');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                  idType === 'senior'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50/50'
                }`}
              >
                Senior Citizen ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdType('pwd');
                  if (!idNumber.startsWith('PWD-')) setIdNumber('PWD-2024-041920');
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                  idType === 'pwd'
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50/50'
                }`}
              >
                Person with Disability
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* ID Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Official ID Number
            </label>
            <input
              type="text"
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Registered Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <hr className="border-slate-100" />

          {/* Guardian / Emergency Contact */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Emergency Contact & Guardian
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Contact Name & Relation
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full h-11 bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:bg-emerald-900 active:scale-95 transition-all mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
