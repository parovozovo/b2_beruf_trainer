import React from 'react';
import { ShieldCheck, FileText, Shield, Cookie, Landmark } from 'lucide-react';
import { openLegalModal } from './legal/LegalModal';
import { AppLogo } from './AppLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-6 sm:mt-10 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 py-6 sm:py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-slate-500">
        
        {/* Brand & Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left">
          <AppLogo size={34} />
          <div>
            <div className="font-black text-slate-900 dark:text-white text-sm flex items-center justify-center sm:justify-start gap-2">
              <span>Beruf B2+ Trainer</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                DTB B2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
              Unabhängige digitale Lernplattform zur Vorbereitung auf den Deutsch-Test für den Beruf B2.
            </p>
          </div>
        </div>

        {/* Legal & Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-bold text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => openLegalModal('agb')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AGB & Widerruf</span>
          </button>

          <button
            type="button"
            onClick={() => openLegalModal('datenschutz')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Datenschutz</span>
          </button>

          <button
            type="button"
            onClick={() => openLegalModal('cookies')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookies</span>
          </button>

          <button
            type="button"
            onClick={() => openLegalModal('impressum')}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Impressum</span>
          </button>
        </div>

        {/* Status / Copyright */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>DSGVO-konform • 100% Offline-fähig</span>
        </div>

      </div>

      <div className="max-w-7xl mx-auto text-center mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/40 text-[11px] text-slate-400">
        © {new Date().getFullYear()} Beruf B2+ Trainer. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
};
