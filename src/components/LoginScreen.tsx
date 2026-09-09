import React, { useState } from 'react';
import { UserAccount, authenticateUser } from '../utils/auth';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onOpenRegister: () => void;
  onForgotPassword: () => void;
  registeredAccounts: UserAccount[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenRegister,
  onForgotPassword,
  registeredAccounts,
}) => {
  const [loginId, setLoginId] = useState('0917 889 2010');
  const [password, setPassword] = useState('Test#1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const result = authenticateUser(loginId, password, registeredAccounts);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials.');
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      setIsLoggingIn(false);
      if (result.account) {
        onLoginSuccess(result.account.profile);
      }
    }, 600);
  };

  const handleQuickFill = (identifier: string, pass: string) => {
    setLoginId(identifier);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center p-0">
      <div className="w-full max-w-md min-h-[100dvh] bg-slate-50 flex flex-col justify-between p-4 sm:p-6 select-none">
        {/* Top Bar */}
        <header className="w-full max-w-md mx-auto flex items-center justify-between h-11 px-4 bg-white border border-slate-100 shadow-xs rounded-2xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            </div>
            <h1 className="font-bold text-sm text-slate-900 tracking-tight">
              KaagapayID
            </h1>
          </div>
          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
            Gov Verified
          </span>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-md mx-auto flex flex-col items-center justify-center my-auto py-2">
          
          {/* Brand Logo Container */}
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs flex flex-col items-center justify-center mb-3 border border-slate-200/80 p-1.5 shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-9 h-9 drop-shadow-xs"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="34" r="7" fill="#059669" />
              <path
                d="M50 45C42 45 37 50 37 56V58H63V56C63 50 58 45 50 45Z"
                fill="#0d9488"
              />
              <path
                d="M32 72C24 64 21 52 26 40C27 38 29.5 38 30 40C30 46 34 54 41 58C43.5 59.5 45 62 44 65C43 68 39 71 32 72Z"
                fill="url(#leftHandGradLogin)"
              />
              <path
                d="M68 72C76 64 79 52 74 40C73 38 70.5 38 70 40C70 46 66 54 59 58C56.5 59.5 55 62 56 65C57 68 61 71 68 72Z"
                fill="url(#rightHandGradLogin)"
              />
              <path
                d="M44 65C46 72 48 76 50 78C52 76 54 72 56 65C53 67 47 67 44 65Z"
                fill="#059669"
              />
              <defs>
                <linearGradient id="leftHandGradLogin" x1="20" y1="40" x2="45" y2="72" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284c7" />
                  <stop offset="1" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="rightHandGradLogin" x1="80" y1="40" x2="55" y2="72" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex items-center text-[8px] font-extrabold tracking-tight leading-none mt-0.5">
              <span className="text-[#0d4e61]">Kaagapay</span>
              <span className="text-[#059669]">ID</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-3 px-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Welcome to KaagapayID
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto leading-tight">
              Sign in with your registered Mobile or ID Number
            </p>
          </div>

          {/* Form Container */}
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-3 bg-white p-5 sm:p-6 rounded-[1.75rem] shadow-sm border border-slate-100"
          >
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-start gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input 1: Mobile / ID */}
            <div className="space-y-1">
              <label
                htmlFor="login-id"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px] text-emerald-700">badge</span>
                Mobile or ID Number
              </label>
              <input
                id="login-id"
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. 0917 889 2010 or SC-2024-008912"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-700">lock</span>
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[11px] font-bold text-emerald-800 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your password"
                  className="w-full h-10 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-700 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Demo Accounts:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('0917 889 2010', 'Test#1234')}
                  className="py-1 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 text-left truncate flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="truncate">Senior: 0917 889 2010</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('0918 555 4321', 'Test#1234')}
                  className="py-1 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 text-left truncate flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="truncate">PWD: 0918 555 4321</span>
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-10 bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:bg-emerald-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Register Secondary Button */}
            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full h-10 bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border border-slate-200"
            >
              Register New Account
              <span className="material-symbols-outlined text-[16px]">person_add</span>
            </button>
          </form>

          {/* Accessibility Hotline Card */}
          <div className="w-full max-w-md flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl mt-3 border border-slate-100 shadow-xs">
            <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0">
              support_agent
            </span>
            <p className="text-[11px] text-slate-500 leading-tight">
              Assistance hotline: <strong className="text-slate-900 font-bold">1-800-KAAGAPAY</strong> (24/7)
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-1 text-center text-[9px] text-slate-400 font-semibold uppercase tracking-widest shrink-0">
          KaagapayID Republic of the Philippines • V3 Unified System
        </footer>
      </div>
    </div>
  );
};
