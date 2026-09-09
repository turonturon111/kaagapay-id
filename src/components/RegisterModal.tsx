import React, { useState, useRef } from 'react';
import { UserProfile, IDType } from '../types';
import { UserAccount } from '../utils/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newAccount: UserAccount) => void;
  registeredAccounts: UserAccount[];
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  registeredAccounts,
}) => {
  const [idType, setIdType] = useState<IDType>('senior');
  const [name, setName] = useState('');
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dob, setDob] = useState('1960-01-01');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [disabilityType, setDisabilityType] = useState('Visual / Low Vision');
  const [errorMessage, setErrorMessage] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGenerateId = (type: IDType) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return type === 'senior' ? `SC-2024-${randomNum}` : `PWD-2024-${randomNum}`;
  };

  const handleIdTypeChange = (type: IDType) => {
    setIdType(type);
    if (!idNumber || idNumber.startsWith('SC-') || idNumber.startsWith('PWD-')) {
      setIdNumber(handleGenerateId(type));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCustomPhotoUrl(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage('Please enter your full legal name (at least 3 characters).');
      return;
    }

    if (!mobileOrEmail.trim()) {
      setErrorMessage('Please enter a valid mobile number or email address.');
      return;
    }

    const cleanInput = mobileOrEmail.trim().replace(/\s+/g, '').toLowerCase();
    const isAlreadyRegistered = registeredAccounts.some(
      (acc) =>
        acc.emailOrMobile.replace(/\s+/g, '').toLowerCase() === cleanInput ||
        acc.profile.idNumber.replace(/\s+/g, '').toLowerCase() === cleanInput
    );

    if (isAlreadyRegistered) {
      setErrorMessage('This mobile number, email, or ID is already registered. Please sign in instead.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    // Senior age validation
    if (idType === 'senior' && dob) {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age < 60) {
        setErrorMessage('Senior Citizen ID registration requires an age of 60 years or older.');
        return;
      }
    }

    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      setErrorMessage('Please provide an emergency contact name and phone number for safety.');
      return;
    }

    const finalIdNumber = idNumber.trim() || handleGenerateId(idType);

    const defaultPhoto =
      idType === 'senior'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim().toUpperCase(),
      idNumber: finalIdNumber,
      idType,
      dob: dob || '1960-01-01',
      expiryDate: idType === 'senior' ? '12/2029' : '12/2027',
      status: 'ACTIVE',
      address: address.trim() || 'Metro Manila, Philippines',
      photoUrl: customPhotoUrl || defaultPhoto,
      mobile: mobileOrEmail.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      emergencyRelation: 'Guardian / Family',
    };

    const newAccount: UserAccount = {
      emailOrMobile: mobileOrEmail.trim(),
      password,
      profile: newProfile,
    };

    onRegisterSuccess(newAccount);
    onClose();
  };

  const currentDisplayPhoto =
    customPhotoUrl ||
    (idType === 'senior'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex justify-between items-center border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Register New KaagapayID
              </h2>
              <p className="text-[11px] text-emerald-300">
                Official Senior Citizen & PWD Registration
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1 text-slate-800">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Account ID Category Selection */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
              Select ID Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleIdTypeChange('senior')}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                  idType === 'senior'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">elderly</span>
                Senior Citizen (60+)
              </button>

              <button
                type="button"
                onClick={() => handleIdTypeChange('pwd')}
                className={`py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                  idType === 'pwd'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">accessible</span>
                PWD (Disability)
              </button>
            </div>
          </div>

          {/* Profile Photo Upload Row */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-emerald-600 overflow-hidden bg-slate-200 shadow-xs">
                <img
                  src={currentDisplayPhoto}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-emerald-800 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-xs"
              >
                <span className="material-symbols-outlined text-[11px]">add_a_photo</span>
              </button>
            </div>

            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <span className="text-xs font-bold text-slate-800 block">ID Photo (Optional)</span>
              <p className="text-[10px] text-slate-500 mb-1.5">Choose your face photo from device</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-600 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[14px] text-emerald-700">upload_file</span>
                {customPhotoUrl ? 'Change Selected Photo' : 'Upload from Device'}
              </button>
            </div>
          </div>

          {/* Full Legal Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Legal Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. JUAN CARLOS DELA CRUZ"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Mobile Number or Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mobile Number or Email <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={mobileOrEmail}
              onChange={(e) => setMobileOrEmail(e.target.value)}
              placeholder="e.g. 0917 889 2010 or juan@email.com"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              This will be your Sign In username.
            </span>
          </div>

          {/* ID Number & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official ID Number
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={idType === 'senior' ? 'SC-2024-XXXXXX' : 'PWD-2024-XXXXXX'}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date of Birth <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* PWD specific category */}
          {idType === 'pwd' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Disability Classification
              </label>
              <select
                value={disabilityType}
                onChange={(e) => setDisabilityType(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
              >
                <option value="Visual / Low Vision">Visual / Low Vision</option>
                <option value="Hearing / Speech Disability">Hearing / Speech Disability</option>
                <option value="Orthopedic / Physical Mobility">Orthopedic / Physical Mobility</option>
                <option value="Psychosocial / Mental Health">Psychosocial / Mental Health</option>
                <option value="Learning / Intellectual Disability">Learning / Intellectual Disability</option>
                <option value="Chronic Illness / Rare Disease">Chronic Illness / Rare Disease</option>
              </select>
            </div>
          )}

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full h-10 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Confirm Password <span className="text-rose-600">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Registered Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Registered Address / Barangay
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 1024 Loyola St, Sampaloc, Manila"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Emergency Guardian Contact Details */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Emergency Contact / Guardian (Required)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Maria Dela Cruz (Daughter)"
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-0.5">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="e.g. 0918 555 1234"
                  className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 h-11 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Register & Activate ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
