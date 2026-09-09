import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex justify-center p-0">
      <div 
        onClick={onFinish}
        className="w-full max-w-md min-h-[100dvh] bg-[#f8fafc] flex flex-col items-center justify-between p-8 select-none cursor-pointer transition-opacity duration-500 animate-in fade-in overflow-hidden"
      >
      {/* Spacer to align center */}
      <div className="h-10" />

      {/* Main Centered Content */}
      <div className="flex flex-col items-center justify-center -mt-12">
        {/* Rounded Card Icon Container */}
        <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/80 border border-slate-100 flex flex-col items-center justify-center p-6 relative group transition-transform duration-300 hover:scale-[1.02]">
          
          {/* Custom Logo SVG matching KaagapayID branding */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative mb-1">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-xs"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Person Figure (Green/Teal) */}
              <circle cx="50" cy="34" r="7" fill="#059669" />
              <path
                d="M50 45C42 45 37 50 37 56V58H63V56C63 50 58 45 50 45Z"
                fill="#0d9488"
              />

              {/* Left Cradling Hand (Cyan/Blue to Teal gradient) */}
              <path
                d="M32 72C24 64 21 52 26 40C27 38 29.5 38 30 40C30 46 34 54 41 58C43.5 59.5 45 62 44 65C43 68 39 71 32 72Z"
                fill="url(#leftHandGrad)"
              />

              {/* Right Cradling Hand (Emerald/Bright Green gradient) */}
              <path
                d="M68 72C76 64 79 52 74 40C73 38 70.5 38 70 40C70 46 66 54 59 58C56.5 59.5 55 62 56 65C57 68 61 71 68 72Z"
                fill="url(#rightHandGrad)"
              />

              {/* Connected Base Stem */}
              <path
                d="M44 65C46 72 48 76 50 78C52 76 54 72 56 65C53 67 47 67 44 65Z"
                fill="#059669"
              />

              <defs>
                <linearGradient id="leftHandGrad" x1="20" y1="40" x2="45" y2="72" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284c7" />
                  <stop offset="1" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="rightHandGrad" x1="80" y1="40" x2="55" y2="72" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Logo Name Inside Box */}
          <div className="flex items-center tracking-tight text-base sm:text-lg font-extrabold leading-none mt-1">
            <span className="text-[#0d4e61]">Kaagapay</span>
            <span className="text-[#059669]">ID</span>
          </div>
        </div>

        {/* Main Title below card */}
        <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#083842]">
          KaagapayID
        </h1>
      </div>

      {/* Footer Area: Dots + Tagline */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6 mb-4">
        {/* Animated Three Dots Loading Indicator */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1] animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#0d9488] animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#083842] animate-bounce" />
        </div>

        {/* Tagline */}
        <p className="text-center text-sm sm:text-base font-medium text-slate-600 leading-relaxed max-w-[280px]">
          Empowering your everyday with secure, accessible care.
        </p>

        {/* Tap hint */}
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold opacity-70">
          Tap anywhere to continue
        </span>
      </div>
      </div>
    </div>
  );
};
