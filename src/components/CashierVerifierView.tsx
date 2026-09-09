import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { VerificationLog, UserProfile } from '../types';
import { verifyQRPayload, encodeQRPayload, VerificationResult, sanitizeInput } from '../utils/securityAndEncoding';
import { playVerificationChime, speakText } from '../utils/audioAndTTS';
import { Language, translations } from '../utils/translations';

interface CashierVerifierViewProps {
  currentUserProfile: UserProfile;
  verificationLogs: VerificationLog[];
  onAddVerificationLog: (log: Omit<VerificationLog, 'id' | 'timestamp'>) => void;
  onDeleteVerificationLog: (id: string) => void;
  onClearAllVerificationLogs: () => void;
  onShowToast: (message: string) => void;
  language?: Language;
  onSwitchToUserRole: () => void;
}

export const CashierVerifierView: React.FC<CashierVerifierViewProps> = ({
  currentUserProfile,
  verificationLogs,
  onAddVerificationLog,
  onDeleteVerificationLog,
  onClearAllVerificationLogs,
  onShowToast,
  language = 'en',
  onSwitchToUserRole,
}) => {
  const t = translations[language] || translations.en;

  // Scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'simulate' | 'logs' | 'guidelines'>('scanner');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  
  // Custom manual payload input
  const [manualPayloadInput, setManualPayloadInput] = useState('');

  // POS Calculator in Modal
  const [posGrossAmount, setPosGrossAmount] = useState<string>('500');
  const [cashierNotes, setCashierNotes] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('Cashier #04 (Mercury Drug)');
  const [searchLogQuery, setSearchLogQuery] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'html5-qr-reader-container';

  // Cleanup camera scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError('No camera found on this device. You can test with the "Simulate Scan" tab!');
        return;
      }

      const cameraId = cameras[cameras.length - 1].id; // Prefer back camera if available

      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleProcessScan(decodedText);
          handleStopCamera();
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error('Failed to start camera scanner', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(`${errMsg}. You can use "Simulate Scan" for instant 1-tab testing!`);
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Failed to stop camera', err);
      }
    }
    setIsCameraActive(false);
  };

  const handleProcessScan = (rawPayload: string) => {
    const result = verifyQRPayload(rawPayload);
    setVerificationResult(result);
    setIsResultModalOpen(true);
    setPosGrossAmount('500');
    setCashierNotes('');

    // Audio Cue
    playVerificationChime(result.status);

    // Voice announcement if enabled
    if (result.status === 'VALID' && result.details?.name) {
      speakText(`Verified ${result.details.idType === 'senior' ? 'Senior Citizen' : 'PWD'} ID for ${result.details.name}`, language);
    } else if (result.status === 'EXPIRED') {
      speakText('Warning: ID pass is expired', language);
    } else if (result.status === 'UNAUTHORIZED') {
      speakText('Security Alert: Unauthorized or tampered ID pass', language);
    } else {
      speakText('Invalid QR code format', language);
    }
  };

  // Preset simulation generator
  const runPresetSimulation = (type: 'valid-current' | 'valid-pwd' | 'expired' | 'tampered' | 'invalid') => {
    let payload = '';

    if (type === 'valid-current') {
      payload = encodeQRPayload(currentUserProfile);
    } else if (type === 'valid-pwd') {
      const pwdProfile: UserProfile = {
        id: 'user_pwd_sim',
        name: 'Mark Anthony S. Inocencio',
        idNumber: 'PWD-2024-041920',
        idType: 'pwd',
        dob: '1984-11-12',
        expiryDate: '2029-01-31',
        status: 'ACTIVE',
        address: 'San Fernando, La Union',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        mobile: '09187654321',
        emergencyContactName: 'Clara Inocencio',
        emergencyContactPhone: '09171112233',
        emergencyRelation: 'Spouse',
      };
      payload = encodeQRPayload(pwdProfile);
    } else if (type === 'expired') {
      const expiredProfile: UserProfile = {
        id: 'user_exp_sim',
        name: 'Roberto E. Gomez',
        idNumber: 'SC-2018-004122',
        idType: 'senior',
        dob: '1955-03-14',
        expiryDate: '2023-12-31',
        status: 'EXPIRED',
        address: 'Quezon City, Metro Manila',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
        mobile: '09201234567',
        emergencyContactName: 'Elena Gomez',
        emergencyContactPhone: '09189998877',
        emergencyRelation: 'Daughter',
      };
      payload = encodeQRPayload(expiredProfile);
    } else if (type === 'tampered') {
      // Create a tampered payload by replacing the checksum hash with a counterfeit one
      const validPayload = encodeQRPayload(currentUserProfile);
      payload = validPayload.slice(0, -6) + 'DEADBEEF';
    } else {
      payload = 'https://some-random-unrelated-link.com/promo123';
    }

    handleProcessScan(payload);
  };

  // Calculate POS Discount
  const calculatePOSBreakdown = () => {
    const gross = parseFloat(posGrossAmount) || 0;
    if (gross <= 0 || !verificationResult || verificationResult.status !== 'VALID') {
      return { vatExemptSales: gross, discount20: 0, netPayable: gross };
    }

    // Philippine Standard Senior / PWD Formula:
    // VAT-Exempt Sales = Gross / 1.12
    // 20% Discount = VAT-Exempt Sales * 0.20
    // Net Payable = VAT-Exempt Sales - 20% Discount
    const vatExemptSales = gross / 1.12;
    const discount20 = vatExemptSales * 0.20;
    const netPayable = vatExemptSales - discount20;

    return {
      vatExemptSales,
      discount20,
      netPayable,
    };
  };

  const posBreakdown = calculatePOSBreakdown();

  const handleSaveVerificationLog = () => {
    if (!verificationResult) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const gross = parseFloat(posGrossAmount) || 0;

    onAddVerificationLog({
      date: dateStr,
      time: timeStr,
      idNumber: verificationResult.details?.idNumber || 'N/A',
      name: verificationResult.details?.name || (verificationResult.status === 'INVALID' ? 'Unknown Holder' : 'Unverified Pass'),
      idType: verificationResult.details?.idType || 'senior',
      status: verificationResult.status,
      cashierName: sanitizeInput(cashierName) || 'Cashier Station',
      storeName: 'Merchant Terminal #01',
      notes: sanitizeInput(cashierNotes) || undefined,
      amountBilled: gross > 0 ? gross : undefined,
      discountApplied: verificationResult.status === 'VALID' ? posBreakdown.discount20 : 0,
      finalAmount: verificationResult.status === 'VALID' ? posBreakdown.netPayable : gross,
    });

    setIsResultModalOpen(false);
    onShowToast(`Verification audit recorded for ${verificationResult.details?.name || 'cardholder'}`);
  };

  const filteredLogs = (verificationLogs || []).filter((log) => {
    if (!log) return false;
    const query = searchLogQuery.toLowerCase();
    const nameMatch = log.name ? log.name.toLowerCase().includes(query) : false;
    const idMatch = log.idNumber ? log.idNumber.toLowerCase().includes(query) : false;
    const statusMatch = log.status ? log.status.toLowerCase().includes(query) : false;
    const cashierMatch = log.cashierName ? log.cashierName.toLowerCase().includes(query) : false;
    return nameMatch || idMatch || statusMatch || cashierMatch;
  });

  return (
    <div className="px-3 sm:px-4 py-4 pb-20 max-w-lg mx-auto flex flex-col gap-4">
      {/* Top Banner / Role Switcher Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-700/60 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
            </div>
            <div>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                MERCHANT / CASHIER MODE
              </span>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                KaagapayID Verifier Portal
              </h2>
            </div>
          </div>

          <button
            onClick={onSwitchToUserRole}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all border border-emerald-400/40 shrink-0"
            title="Switch back to citizen ID view"
          >
            <span className="material-symbols-outlined text-[16px]">account_circle</span>
            <span>Citizen View</span>
          </button>
        </div>

        <p className="text-[11px] text-blue-200 leading-snug">
          Statutory QR Pass Verification & Discount POS Terminal for Philippine Senior Citizens (RA 9994) and PWDs (RA 10754).
        </p>

        {/* View Tabs */}
        <div className="grid grid-cols-4 gap-1 mt-3 bg-black/30 p-1 rounded-xl border border-white/10 text-[10px] sm:text-xs font-bold text-center">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'scanner' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            <span>Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'simulate' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">smart_button</span>
            <span>Simulate</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'logs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'guidelines' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">menu_book</span>
            <span>Law Guide</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Camera Scanner */}
      {activeTab === 'scanner' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">qr_code_scanner</span>
              <h3 className="text-sm font-extrabold text-slate-900">Live Camera QR Scanner</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {isCameraActive ? 'Camera Live' : 'Camera Idle'}
            </span>
          </div>

          {/* Video Container for html5-qrcode */}
          <div className="w-full max-w-[320px] min-h-[260px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center relative p-2 shadow-inner">
            <div id={scannerContainerId} className="w-full h-full rounded-xl overflow-hidden"></div>
            
            {!isCameraActive && (
              <div className="flex flex-col items-center text-center p-4 z-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">
                  videocam_off
                </span>
                <p className="text-xs font-bold text-slate-300">Camera Scanner is Stopped</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
                  Tap below to start camera or use the <strong>Simulate Scan</strong> tab for 1-tab testing.
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">warning</span>
              <div className="flex-1">
                <p className="font-bold text-[11px]">Camera Notice</p>
                <p className="text-[10px] leading-tight">{cameraError}</p>
              </div>
            </div>
          )}

          {/* Camera Controls */}
          <div className="w-full grid grid-cols-2 gap-2 mt-1">
            {!isCameraActive ? (
              <button
                onClick={handleStartCamera}
                className="col-span-2 py-2.5 bg-blue-900 hover:bg-blue-950 active:scale-98 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>Start Camera Scanner</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="col-span-2 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                <span>Stop Camera Scanner</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('simulate')}
              className="col-span-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
              <span>Switch to Instant Simulation Presets</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Instant Simulate Scan in Single Browser Tab */}
      {activeTab === 'simulate' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">tune</span>
              <span>Simulate Pass Verification (1-Tab Testing)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instantly test all statutory verification outcomes with real encoded payloads.
            </p>
          </div>

          {/* Quick Simulation Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Preset 1: Current Active User */}
            <button
              onClick={() => runPresetSimulation('valid-current')}
              className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 active:scale-98 text-left transition-all flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 inline-block mb-0.5">
                  Valid Senior Pass
                </span>
                <p className="text-xs font-black text-slate-900 truncate">{currentUserProfile?.name || 'Citizen'}</p>
                <p className="text-[10px] text-emerald-800 font-medium">Valid Checksum • 20% Discount</p>
              </div>
            </button>

            {/* Preset 2: Valid PWD Pass */}
            <button
              onClick={() => runPresetSimulation('valid-pwd')}
              className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 active:scale-98 text-left transition-all flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">accessible</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-sky-200 text-sky-900 inline-block mb-0.5">
                  Valid PWD Pass
                </span>
                <p className="text-xs font-black text-slate-900 truncate">Mark Anthony Inocencio</p>
                <p className="text-[10px] text-sky-800 font-medium">Valid Checksum • RA 10754 PWD</p>
              </div>
            </button>

            {/* Preset 3: Expired Pass */}
            <button
              onClick={() => runPresetSimulation('expired')}
              className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 active:scale-98 text-left transition-all flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">event_busy</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 inline-block mb-0.5">
                  Expired Pass (2023)
                </span>
                <p className="text-xs font-black text-slate-900 truncate">Roberto E. Gomez</p>
                <p className="text-[10px] text-amber-800 font-medium">Flagged Expired Status</p>
              </div>
            </button>

            {/* Preset 4: Tampered Checksum */}
            <button
              onClick={() => runPresetSimulation('tampered')}
              className="p-3 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 active:scale-98 text-left transition-all flex items-start gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-200 text-red-900 inline-block mb-0.5">
                  Unauthorized / Altered
                </span>
                <p className="text-xs font-black text-slate-900 truncate">Forged Pass Signature</p>
                <p className="text-[10px] text-red-800 font-medium">Checksum Tamper Detected</p>
              </div>
            </button>

            {/* Preset 5: Invalid QR Format */}
            <button
              onClick={() => runPresetSimulation('invalid')}
              className="col-span-1 sm:col-span-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-98 text-left transition-all flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-400 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">block</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">Test Unrecognized / Invalid QR Payload</p>
                <p className="text-[10px] text-slate-500">Non-government formatted generic string or barcode</p>
              </div>
            </button>
          </div>

          {/* Manual Raw Payload Tester */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Manual Raw QR Payload Tester:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualPayloadInput}
                onChange={(e) => setManualPayloadInput(e.target.value)}
                placeholder="Paste or type encoded QR string (e.g. KID1...)"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-blue-700"
              />
              <button
                onClick={() => {
                  if (!manualPayloadInput.trim()) {
                    onShowToast('Please enter a payload string to test');
                    return;
                  }
                  handleProcessScan(manualPayloadInput.trim());
                }}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase rounded-xl shadow-xs active:scale-95 transition-all"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Verification Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-700 text-[20px]">history_edu</span>
                <span>Verification Audit Trail</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {verificationLogs.length} recorded scan verifications in local storage
              </p>
            </div>

            {verificationLogs.length > 0 && (
              <button
                onClick={onClearAllVerificationLogs}
                className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 active:scale-95 transition-all"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Logs */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchLogQuery}
              onChange={(e) => setSearchLogQuery(e.target.value)}
              placeholder="Search logs by name, ID number, cashier..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Logs List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">find_in_page</span>
                <p className="text-xs font-bold text-slate-600">No verification records found</p>
                <p className="text-[10px] text-slate-400">Scanned digital passes will be logged here automatically.</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                          log.status === 'VALID'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : log.status === 'EXPIRED'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="font-extrabold text-slate-900 truncate">{log?.name || 'Cardholder'}</span>
                    </div>

                    <button
                      onClick={() => onDeleteVerificationLog(log.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-white"
                      title="Delete log"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">ID Number</span>
                      <span className="font-mono font-bold text-slate-800">{log.idNumber}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Timestamp</span>
                      <span className="font-medium text-slate-700">{log.date} {log.time}</span>
                    </div>
                    {log.amountBilled && (
                      <div className="col-span-2 pt-1 mt-1 border-t border-slate-100 flex justify-between">
                        <span>Billed: ₱{log.amountBilled.toFixed(2)}</span>
                        <span className="font-bold text-emerald-800">Saved: ₱{(log.discountApplied || 0).toFixed(2)}</span>
                        <span className="font-extrabold text-slate-900">Net: ₱{(log.finalAmount || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {log.cashierName && (
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Verifier: {log.cashierName}</span>
                      {log.notes && <span className="italic text-slate-600 truncate max-w-[150px]">{log.notes}</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Statutory Guidelines Quick Reference */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">gavel</span>
              <span>Statutory Discount Laws (Philippine Standards)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Mandatory legal entitlements for Senior Citizens and Persons with Disabilities.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700">
            {/* RA 9994 */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-950">Republic Act No. 9994</span>
                <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 text-[9px] font-extrabold rounded">
                  Senior Citizens Act
                </span>
              </div>
              <p className="text-[11px] text-emerald-950 font-medium">
                Grants <strong>20% discount and 12% VAT exemption</strong> on medicines, professional medical/dental fees, hospitalization, transport fares (land, air, sea), dining, hotels, and recreation.
              </p>
              <div className="text-[10px] text-emerald-900 pt-1 border-t border-emerald-200/60 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                <span>Requires presentation of valid OSCA ID or verified digital pass.</span>
              </div>
            </div>

            {/* RA 10754 */}
            <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-sky-950">Republic Act No. 10754</span>
                <span className="px-1.5 py-0.2 bg-sky-200 text-sky-900 text-[9px] font-extrabold rounded">
                  Expanding Benefits of PWDs
                </span>
              </div>
              <p className="text-[11px] text-sky-950 font-medium">
                Extends identical <strong>20% discount and 12% VAT exemption</strong> privileges to all registered Persons with Disabilities, plus priority express lane access in all commercial stores.
              </p>
            </div>

            {/* DTI JAO 17-02 */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950">DTI-DA-DOE JAO No. 17-02</span>
                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-extrabold rounded">
                  5% Special Discount
                </span>
              </div>
              <p className="text-[11px] text-amber-950 font-medium">
                5% special discount on Basic Necessities and Prime Commodities (BNPC) up to ₱1,300 gross purchase per week for personal consumption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION RESULT & POS MODAL */}
      {isResultModalOpen && verificationResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header with Dynamic Result Color */}
            <div
              className={`p-4 text-white flex items-center justify-between ${
                verificationResult.status === 'VALID'
                  ? 'bg-emerald-800'
                  : verificationResult.status === 'EXPIRED'
                  ? 'bg-amber-700'
                  : 'bg-red-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">
                  {verificationResult.status === 'VALID'
                    ? 'verified'
                    : verificationResult.status === 'EXPIRED'
                    ? 'event_busy'
                    : 'gpp_bad'}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide">
                    {verificationResult.title}
                  </h3>
                  <span className="text-[10px] font-medium opacity-90 block">
                    {verificationResult.status === 'VALID' ? 'Approved for Statutory Discount' : 'Action Required / Verification Blocked'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsResultModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* Message Banner */}
              <div
                className={`p-2.5 rounded-xl border text-[11px] leading-snug flex items-start gap-2 ${
                  verificationResult.status === 'VALID'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                    : verificationResult.status === 'EXPIRED'
                    ? 'bg-amber-50 border-amber-200 text-amber-950 font-medium'
                    : 'bg-red-50 border-red-200 text-red-950 font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  info
                </span>
                <span>{verificationResult.message}</span>
              </div>

              {/* Cardholder Identification Card */}
              {verificationResult.details && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Cardholder Name</span>
                      <h4 className="text-sm font-black text-slate-900">{verificationResult.details.name}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase">
                      {verificationResult.details.idType === 'senior' ? 'Senior Citizen' : 'PWD ID'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">ID Number</span>
                      <span className="font-mono font-bold text-slate-900">{verificationResult.details.idNumber}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Issuing Authority</span>
                      <span className="font-bold text-slate-800">{verificationResult.details.issuedBy}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Date of Birth / Age</span>
                      <span className="font-medium text-slate-800">{verificationResult.details.dob} ({verificationResult.details.age || 65} yrs)</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Pass Expiry Date</span>
                      <span className={`font-bold ${verificationResult.status === 'EXPIRED' ? 'text-red-600' : 'text-slate-800'}`}>
                        {verificationResult.details.expiryDate}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/80">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Statutory Law Reference</span>
                    <span className="font-bold text-indigo-950 text-[11px] block">{verificationResult.details.statutoryLaw}</span>
                  </div>
                </div>
              )}

              {/* Point-of-Sale Discount Calculation (Active only if Valid) */}
              {verificationResult.status === 'VALID' && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">calculate</span>
                    <span>Point-of-Sale Statutory Discount Computation</span>
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 uppercase block mb-1">
                      Gross Bill Amount (₱):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={posGrossAmount}
                      onChange={(e) => setPosGrossAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Computation Breakdown */}
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross (VAT-Inclusive):</span>
                      <span>₱{(parseFloat(posGrossAmount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Less: 12% VAT (VAT-Exempt Base):</span>
                      <span>₱{posBreakdown.vatExemptSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Less: 20% Senior/PWD Discount:</span>
                      <span>-₱{posBreakdown.discount20.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-950 font-black text-xs">
                      <span>Net Payable by Customer:</span>
                      <span className="text-emerald-800 text-sm">₱{posBreakdown.netPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cashier Audit Information */}
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block">Cashier Station</label>
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block">Cashier Notes (Optional)</label>
                    <input
                      type="text"
                      value={cashierNotes}
                      onChange={(e) => setCashierNotes(e.target.value)}
                      placeholder="e.g. Prescriptions verified"
                      className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs uppercase"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveVerificationLog}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold text-xs uppercase shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save to Audit Trail</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
