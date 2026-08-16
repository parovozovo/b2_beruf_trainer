import React, { useState, useEffect } from 'react';
import { Cookie, Check } from 'lucide-react';
import { openLegalModal } from './LegalModal';

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    const consent = localStorage.getItem('b2_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('b2_cookie_consent', 'all');
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('b2_cookie_consent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-40 animate-bounceIn">
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/95 dark:bg-slate-900/95 border-2 border-indigo-500/40 text-white shadow-2xl backdrop-blur-xl space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-black text-sm text-white flex items-center gap-1.5">
              <span>Privatsphäre & Cookies</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                DSGVO
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Wir nutzen technisch essenzielle Cookies und lokalen Speicher, um Ihren Lernfortschritt offline zu sichern und die Session aufrechtzuerhalten. Wir verwenden <strong>keine</strong> Werbe-Tracker.
            </p>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold border-t border-slate-800/80 pt-2 px-1">
          <button
            type="button"
            onClick={() => openLegalModal('cookies')}
            className="hover:text-indigo-300 hover:underline cursor-pointer"
          >
            Cookie-Details
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => openLegalModal('datenschutz')}
            className="hover:text-indigo-300 hover:underline cursor-pointer"
          >
            Datenschutz
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => openLegalModal('agb')}
            className="hover:text-indigo-300 hover:underline cursor-pointer"
          >
            AGB
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer text-center"
          >
            Nur essenzielle
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Alle akzeptieren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
