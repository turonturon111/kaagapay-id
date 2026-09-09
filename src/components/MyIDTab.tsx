import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserProfile } from '../types';
import { translations, Language } from '../utils/translations';
import { BarcodeDisplay } from './BarcodeDisplay';
import { encodeQRPayload } from '../utils/securityAndEncoding';

interface MyIDTabProps {
  profile: UserProfile;
  onToggleIDType?: () => void;
  onShowToast: (message: string) => void;
  language?: Language;
}

// Vector Emblems matching official Philippine ID card seals
const PhilippineCoatOfArms = () => (
  <svg className="w-7 sm:w-8 h-8 sm:h-9 shrink-0 drop-shadow-xs" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M50,5 L90,20 L90,60 C90,90 50,115 50,115 C50,115 10,90 10,60 L10,20 Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="3"/>
    <path d="M10,20 L50,5 L50,115 C50,115 10,90 10,60 Z" fill="#0038a8"/>
    <path d="M50,5 L90,20 L90,60 C90,90 50,115 50,115 Z" fill="#ce1126"/>
    <circle cx="50" cy="50" r="14" fill="#fcd116"/>
    <polygon points="50,22 53,28 60,28 55,32 57,38 50,34 43,38 45,32 40,28 47,28" fill="#fcd116"/>
  </svg>
);

const NCSCLogo = () => (
  <svg className="w-7 sm:w-8 h-7 sm:h-8 shrink-0 drop-shadow-xs" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ce1126" stroke="#0038a8" strokeWidth="4"/>
    <circle cx="50" cy="50" r="38" fill="#ffffff"/>
    <path d="M50,30 C40,20 25,30 35,45 L50,65 L65,45 C75,30 60,20 50,30 Z" fill="#ce1126"/>
    <path d="M50,40 C44,32 32,40 40,50 L50,60 L60,50 C68,40 56,32 50,40 Z" fill="#fcd116"/>
  </svg>
);

const PhilippineFlag = () => (
  <svg className="w-6 sm:w-7 h-4 sm:h-5 shrink-0 rounded-[2px] shadow-2xs border border-white/50" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="150" fill="#0038a8"/>
    <rect y="150" width="600" height="150" fill="#ce1126"/>
    <polygon points="0,0 0,300 259.8,150" fill="#ffffff"/>
    <circle cx="86.6" cy="150" r="28" fill="#fcd116"/>
    <circle cx="28" cy="45" r="10" fill="#fcd116"/>
    <circle cx="28" cy="255" r="10" fill="#fcd116"/>
    <circle cx="210" cy="150" r="10" fill="#fcd116"/>
  </svg>
);

const NCDAEmblem = () => (
  <svg className="w-6 sm:w-7 h-6 sm:h-7 shrink-0 drop-shadow-xs" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#ce1126" strokeWidth="5"/>
    <circle cx="50" cy="50" r="38" fill="#ce1126"/>
    <path d="M50,18 L60,42 L84,50 L60,58 L50,82 L40,58 L16,50 L40,42 Z" fill="#ffffff"/>
    <circle cx="50" cy="50" r="12" fill="#ce1126"/>
  </svg>
);

const WheelchairSymbol = () => (
  <svg className="w-6 sm:w-7 h-6 sm:h-7 shrink-0 drop-shadow-xs" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#00a3e0" strokeWidth="4"/>
    <circle cx="50" cy="50" r="40" fill="#00a3e0"/>
    <circle cx="55" cy="28" r="8" fill="#ffffff"/>
    <path d="M42,40 L65,40 L58,62 L75,78" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M40,55 A 18 18 0 1 1 32 75" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" fill="none"/>
  </svg>
);

export const MyIDTab: React.FC<MyIDTabProps> = ({
  profile,
  onToggleIDType,
  onShowToast,
  language = 'en',
}) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [tokenSeed, setTokenSeed] = useState(Date.now());
  const [displayMode, setDisplayMode] = useState<'qr' | 'barcode'>('qr');
  const [showLandscapeModal, setShowLandscapeModal] = useState(false);

  const t = translations[language] || translations.en;

  // Refresh Timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTokenSeed(Date.now());
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Secure tamper-evident payload for QR with hash checksum
  const qrPayload = encodeQRPayload(profile, tokenSeed);

  const handleShare = () => {
    const cardName = profile?.name || 'Citizen';
    const cardId = profile?.idNumber || '';
    if (navigator.share) {
      navigator.share({
        title: `${cardName} - KaagapayID Digital Card`,
        text: `Digital ${profile?.idType === 'senior' ? 'Senior Citizen' : 'PWD'} ID: ${cardId}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`KaagapayID: ${cardName} (${cardId})`);
      onShowToast('ID details copied to clipboard!');
    }
  };

  const handleDownload = () => {
    onShowToast('Digital ID downloaded for offline verification!');
  };

  // Helper name parsing
  const seniorNameParts = () => {
    const rawName = profile?.name || 'ROBERTO D. EVANGELISTA';
    const parts = rawName.trim().split(/\s+/);
    if (parts.length >= 3) {
      return {
        surname: parts[parts.length - 1].toUpperCase(),
        givenName: parts.slice(0, parts.length - 2).join(' ').toUpperCase(),
        middleName: parts[parts.length - 2].toUpperCase(),
      };
    } else if (parts.length === 2) {
      return {
        surname: parts[1].toUpperCase(),
        givenName: parts[0].toUpperCase(),
        middleName: 'ERICE',
      };
    }
    return { surname: 'EVANGELISTA', givenName: 'ROBERTO', middleName: 'D.' };
  };

  const pwdFormattedName = () => {
    const rawName = profile?.name || 'MARK ANTHONY S. INOCENCIO';
    const parts = rawName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const surname = parts[parts.length - 1].toUpperCase();
      const rest = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
      return `${surname}, ${rest}`;
    }
    return rawName.toUpperCase() || 'INOCENCIO, MARK ANTHONY S.';
  };

  const seniorNames = seniorNameParts();

  return (
    <div className="px-3 sm:px-4 py-4 pb-6 max-w-lg mx-auto flex flex-col items-center gap-4">
      
      {/* ID Type Switcher (Senior Citizen vs PWD) */}
      <div className="w-full flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={onToggleIDType}
          className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            profile.idType === 'senior'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">elderly</span>
          {t.seniorID}
        </button>
        <button
          onClick={onToggleIDType}
          className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            profile.idType === 'pwd'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">accessible</span>
          {t.pwdID}
        </button>
      </div>

      {/* Digital ID Card Visualization - Matching Official Reference Photos */}
      <section className="w-full">
        {profile.idType === 'senior' ? (
          /* Senior Citizen ID (NCSC) Card Design - Exact Replica of Image 1 */
          <div className="relative w-full rounded-2xl border border-slate-300 shadow-lg bg-[#f6fafe] flex flex-col overflow-hidden text-slate-900 select-none transition-all duration-300">
            
            {/* Guilloche Security Wave Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] flex items-center justify-center">
              <svg className="w-[320px] h-[320px] text-blue-900" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                {[20, 40, 60, 80, 100, 120, 140, 160, 180].map((r) => (
                  <circle key={r} cx="100" cy="100" r={r / 2} strokeWidth="0.75" strokeDasharray="3 2" />
                ))}
              </svg>
            </div>

            {/* Top Header: Seals & Official Titles */}
            <div className="pt-2.5 sm:pt-3 px-3 sm:px-4 pb-1.5 flex items-center justify-between relative z-10 border-b border-blue-100/80 bg-white/60 backdrop-blur-2xs">
              <PhilippineCoatOfArms />
              
              <div className="flex flex-col items-center text-center px-1">
                <span className="text-[8px] sm:text-[9.5px] font-bold text-[#0f2942] uppercase tracking-tight leading-tight">
                  REPUBLIC OF THE PHILIPPINES
                </span>
                <span className="text-[7.5px] sm:text-[8.5px] font-semibold text-[#1e3a5f] uppercase tracking-tight leading-tight mt-0.5">
                  NATIONAL COMMISSION OF SENIOR CITIZENS
                </span>
                <span className="text-[11px] sm:text-[13px] font-black text-[#0c2340] uppercase tracking-tight leading-tight mt-0.5">
                  SENIOR CITIZEN ID
                </span>
              </div>

              <NCSCLogo />
            </div>

            {/* Card Body: 3-Column Layout (Photo & Signature | Details | QR & ID Number) */}
            <div className="p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-3 items-center relative z-10">
              
              {/* Left Column: Photo & Signature */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="w-[72px] sm:w-[88px] h-[92px] sm:h-[108px] rounded border border-slate-300 overflow-hidden bg-slate-200 shadow-2xs relative">
                  <img
                    src={profile?.photoUrl}
                    alt={profile?.name || 'Cardholder'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Handwritten Signature */}
                <div className="mt-1 w-full text-center">
                  <span className="font-serif italic text-[11px] sm:text-xs font-bold text-slate-800 opacity-90 block leading-tight">
                    {(profile?.name || 'Roberto').trim().split(' ')[0]}
                  </span>
                  <div className="w-14 sm:w-16 h-[1px] bg-slate-400 mx-auto -mt-0.5"></div>
                </div>
              </div>

              {/* Center Column: Personal Data Fields */}
              <div className="col-span-5 flex flex-col justify-center space-y-1 text-left min-w-0 pr-1">
                <div>
                  <span className="text-[6.5px] sm:text-[7.5px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                    Apelyido/Surname
                  </span>
                  <span className="text-[9.5px] sm:text-[11px] font-extrabold text-slate-950 uppercase tracking-tight truncate block leading-tight">
                    {seniorNames.surname}
                  </span>
                </div>

                <div>
                  <span className="text-[6.5px] sm:text-[7.5px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                    Pangalan/Given Name
                  </span>
                  <span className="text-[9.5px] sm:text-[11px] font-extrabold text-slate-950 uppercase tracking-tight truncate block leading-tight">
                    {seniorNames.givenName}
                  </span>
                </div>

                <div>
                  <span className="text-[6.5px] sm:text-[7.5px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                    Panggitnang Apelyido/Surname
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase tracking-tight truncate block leading-tight">
                    {seniorNames.middleName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <div>
                    <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                      Petsa ng kapanganakan/Date of Birth
                    </span>
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 block leading-tight mt-0.5">
                      {profile.dob || '08 JAN 1960'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                      Kasarian/Sex
                    </span>
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 block leading-tight mt-0.5">
                      F
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                    Nasyonalidad/Nationality
                  </span>
                  <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 block leading-tight">
                    FILIPINO
                  </span>
                </div>

                <div>
                  <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                    Address
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] font-semibold text-slate-900 line-clamp-2 leading-tight block">
                    {profile.address || '833 SISA ST., BRGY 526, ZONE 52 SAMPALOK, MANILA CITY'}
                  </span>
                </div>
              </div>

              {/* Right Column: QR Code & ID Number */}
              <div className="col-span-3 flex flex-col items-center justify-center pl-1 border-l border-slate-200/60">
                <div className="p-1 bg-white rounded border border-slate-200 shadow-2xs flex items-center justify-center relative">
                  <QRCodeSVG
                    value={qrPayload}
                    size={72}
                    level="H"
                    fgColor="#000000"
                  />
                  {/* Red Emblem Center Seal */}
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-red-600 border border-white flex items-center justify-center shadow-2xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[7px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    ID NUMBER
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-black text-slate-950 tracking-wider block">
                    {profile.idNumber.startsWith('SC') ? profile.idNumber : `SC${profile.idNumber}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PWD ID (NCDA) Card Design - Exact Replica of Image 2 */
          <div className="relative w-full rounded-2xl border border-sky-300 shadow-lg bg-[#f0f8ff] flex flex-col overflow-hidden text-slate-900 select-none transition-all duration-300">
            
            {/* Top Cyan Header Banner */}
            <div className="bg-[#00a3e0] px-2.5 sm:px-3.5 py-2 flex items-center justify-between text-white shadow-xs relative z-10 border-b border-sky-400">
              <div className="flex items-center gap-1.5 shrink-0">
                <PhilippineFlag />
                <NCDAEmblem />
              </div>

              <div className="flex flex-col items-center text-center mx-1">
                <span className="text-[7.5px] sm:text-[8.5px] font-bold text-white uppercase tracking-tight leading-tight">
                  REPUBLIC OF THE PHILIPPINES
                </span>
                <span className="text-[9px] sm:text-[10.5px] font-black text-white uppercase tracking-tight leading-tight mt-0.5">
                  NATIONAL COUNCIL ON DISABILITY AFFAIRS
                </span>
              </div>

              <WheelchairSymbol />
            </div>

            {/* Card Body */}
            <div className="p-3 sm:p-4 grid grid-cols-12 gap-2 sm:gap-3 items-start relative z-10">
              
              {/* Left Column: Photo & Doctor Certification */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="w-[72px] sm:w-[86px] h-[90px] sm:h-[104px] rounded-lg border border-slate-300 overflow-hidden bg-slate-200 shadow-2xs">
                  <img
                    src={profile?.photoUrl}
                    alt={profile?.name || 'Cardholder'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-1 text-center w-full">
                  <span className="font-serif italic text-[10px] sm:text-[11px] font-bold text-slate-800 opacity-90 block leading-tight">
                    {(profile?.name || 'Mark').trim().split(' ')[0]}
                  </span>
                  <span className="text-[6.5px] font-bold text-slate-500 uppercase block -mt-0.5">
                    Signature of PWD
                  </span>

                  <div className="mt-1 border-t border-slate-300 pt-0.5">
                    <span className="text-[6px] font-medium text-slate-500 block leading-none">Certified by</span>
                    <span className="text-[7px] font-bold text-slate-800 uppercase block leading-tight">JOSE REYES MD</span>
                    <span className="text-[6px] text-slate-500 font-mono block leading-none">PRC Lic. No. 63828</span>
                  </div>
                </div>
              </div>

              {/* Center Column: Fields */}
              <div className="col-span-5 flex flex-col justify-between space-y-1 text-left min-w-0 pr-1">
                <div>
                  <span className="text-[6.5px] sm:text-[7.5px] font-semibold text-slate-500 uppercase tracking-tight block leading-none">
                    Last Name, First Name, M.I.
                  </span>
                  <span className="text-[9.5px] sm:text-[11px] font-extrabold text-slate-950 uppercase tracking-tight truncate block leading-tight">
                    {pwdFormattedName()}
                  </span>
                </div>

                {/* Grid row 1: Sex, DOB, Civil Status */}
                <div className="grid grid-cols-3 gap-0.5">
                  <div>
                    <span className="text-[6px] font-semibold text-slate-500 uppercase block leading-none">Sex</span>
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 block">M</span>
                  </div>
                  <div>
                    <span className="text-[6px] font-semibold text-slate-500 uppercase block leading-none">Date of Birth</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 block truncate">{profile.dob || '1984/11/12'}</span>
                  </div>
                  <div>
                    <span className="text-[6px] font-semibold text-slate-500 uppercase block leading-none">Civil Status</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 block">SINGLE</span>
                  </div>
                </div>

                {/* Grid row 2: Blood Type, Date Issued, Valid Until */}
                <div className="grid grid-cols-3 gap-0.5">
                  <div>
                    <span className="text-[6px] font-semibold text-slate-500 uppercase block leading-none">Blood Type</span>
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-900 block">O+</span>
                  </div>
                  <div>
                    <span className="text-[6px] font-semibold text-slate-500 uppercase block leading-none">Date Issued</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 block">2024/02/01</span>
                  </div>
                  <div>
                    <span className="text-[6px] font-semibold text-slate-500 uppercase block leading-none">Valid Until</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 block truncate">{profile.expiryDate || '2029/01/31'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 uppercase block leading-none">
                    Disability Type
                  </span>
                  <span className="text-[8.5px] sm:text-[9.5px] font-extrabold text-blue-900 uppercase block leading-tight">
                    (NA) DEAF/HARD OF HEARING
                  </span>
                </div>

                <div>
                  <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 uppercase block leading-none">
                    Address
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] font-semibold text-slate-900 line-clamp-2 leading-tight block">
                    {profile.address || 'LA UNION, PROVINCE / LA UNION CITY'}
                  </span>
                </div>
              </div>

              {/* Right Column: NCDA Box, QR Code, Control Number */}
              <div className="col-span-3 flex flex-col items-center justify-between h-full pl-1 border-l border-slate-200/60">
                {/* Top NCDA Box */}
                <div className="border border-slate-400 bg-white px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold text-slate-900 tracking-tight shadow-2xs mb-1">
                  NCDA#{profile.idNumber.replace(/[^0-9]/g, '').slice(0, 8) || '00250220'}
                </div>

                <div className="p-1 bg-white rounded border border-slate-200 shadow-2xs my-1">
                  <QRCodeSVG
                    value={qrPayload}
                    size={68}
                    level="M"
                    fgColor="#000000"
                  />
                </div>

                <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-900 tracking-tighter text-center block mt-1">
                  14550400012345678
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* QR Code / Barcode Switcher Section (GCash Style) */}
      <section className="w-full bg-white rounded-[1.75rem] border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col items-center">
        
        {/* Verification Header & Mode Selector */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-[20px]">
              {displayMode === 'qr' ? 'qr_code_scanner' : 'barcode_scanner'}
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.verificationCode}
            </h2>
          </div>

          {/* Display Mode Toggle Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setDisplayMode('qr')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                displayMode === 'qr'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              {t.qrMode}
            </button>
            <button
              onClick={() => setDisplayMode('barcode')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                displayMode === 'barcode'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">barcode</span>
              {t.barcodeMode}
            </button>
          </div>
        </div>

        {/* Display Container: QR Code or Barcode */}
        {displayMode === 'qr' ? (
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-3 flex flex-col items-center justify-center">
            <QRCodeSVG
              value={qrPayload}
              size={170}
              level="H"
              includeMargin={true}
              fgColor="#000000"
            />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center my-1">
            <BarcodeDisplay
              value={profile.idNumber.replace(/[^A-Z0-9]/gi, '') || 'KAAGAPAY2026'}
              width={2.1}
              height={70}
              className="w-full max-w-[340px] my-1 cursor-pointer hover:border-emerald-600 active:scale-95 transition-all"
              onClick={() => setShowLandscapeModal(true)}
            />
            <p className="text-[11px] text-slate-500 font-medium my-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-700">touch_app</span>
              Tap barcode for fullscreen landscape view
            </p>
            <button
              onClick={() => setShowLandscapeModal(true)}
              className="mt-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-2xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">screen_rotation</span>
              {t.fullscreenBarcode}
            </button>
          </div>
        )}

        <p className="text-center text-xs text-slate-500 max-w-[300px] leading-relaxed mt-2">
          {t.scanNotice}
        </p>

        {/* Refresh Timer */}
        <div className="mt-3.5 flex items-center gap-2 text-emerald-800 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/80 text-xs">
          <span className="material-symbols-outlined animate-spin text-[15px] text-emerald-700">
            sync
          </span>
          <span className="font-semibold text-[11px]">
            {t.refreshesIn} {timeLeft}s
          </span>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="w-full flex flex-col gap-2.5">
        <button
          onClick={handleShare}
          className="w-full h-11 bg-emerald-800 text-white rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs font-bold text-xs uppercase tracking-wider hover:bg-emerald-900"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          {t.shareID}
        </button>

        <button
          onClick={handleDownload}
          className="w-full h-11 bg-white text-emerald-950 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all font-bold text-xs uppercase tracking-wider hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          {t.downloadID}
        </button>
      </section>

      {/* Fullscreen Landscape Barcode Modal */}
      {showLandscapeModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <button
            onClick={() => setShowLandscapeModal(false)}
            aria-label="Close"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all shadow-sm font-bold text-xl active:scale-90 cursor-pointer"
          >
            ✕
          </button>

          <div className="w-full max-w-xl flex items-center justify-center p-2">
            <BarcodeDisplay
              value={profile.idNumber.replace(/[^A-Z0-9]/gi, '') || 'KAAGAPAY2026'}
              width={3}
              height={130}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

