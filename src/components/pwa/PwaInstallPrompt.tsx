import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, Share, PlusSquare } from 'lucide-react';
import { AppLogo } from '../AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const triggerPwaInstall = async (): Promise<boolean> => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
};

export const PwaInstallPrompt: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('b2_pwa_prompt_dismissed') === 'true';
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone / PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(isStandalone);

    // Detect iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice && !isStandalone);

    // Listen to BeforeInstallPrompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen to network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
      }
      deferredPrompt = null;
    } else {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('b2_pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Warning Bar */}
      {isOffline && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
          <WifiOff className="w-4 h-4" />
          <span>Offline-Modus aktiv: Alle gespeicherten Tests, Wortschatz-Karten und Themen sind offline verfügbar!</span>
        </div>
      )}

      {/* Floating PWA Install Bottom Bar (Mobile/Desktop) */}
      {!isInstalled && !isDismissed && (canInstall || isIOS) && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-bounceIn">
          <div className="p-4 rounded-3xl bg-slate-950/95 border-2 border-indigo-500/40 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <AppLogo size={38} />
              <div className="min-w-0">
                <div className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                  <span>Als App installieren</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                    100% Offline
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Schneller Zugriff direkt vom Home-Bildschirm
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installieren</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Home Screen Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AppLogo size={32} />
                <h3 className="text-sm font-black">Auf dem iPhone installieren</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Tippen Sie auf „Teilen“</span>
                    <Share className="w-3.5 h-3.5 text-indigo-500 inline" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Das Viereck mit dem Pfeil nach oben in der Safari-Symbolleiste unten.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>„Zum Home-Bildschirm“</span>
                    <PlusSquare className="w-3.5 h-3.5 text-indigo-500 inline" />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Scrollen Sie nach unten und wählen Sie „Zum Home-Bildschirm hinzufügen“.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs text-center shadow cursor-pointer"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
};
