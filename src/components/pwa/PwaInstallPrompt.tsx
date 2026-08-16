import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, Share, PlusSquare, Smartphone, Monitor } from 'lucide-react';
import { AppLogo } from '../AppLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Trigger install natively if available, or open the universal guide
export const triggerPwaInstall = async (): Promise<void> => {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        deferredPrompt = null;
        window.dispatchEvent(new CustomEvent('pwa-installed'));
        return;
      }
    } catch {
      // fallback to guide
    }
  }
  // Open the visual installation guide modal
  window.dispatchEvent(new CustomEvent('open-pwa-guide'));
};

// Check if currently running as installed PWA
export const isRunningStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// Check for updates manually via Service Worker
export const checkForAppUpdates = async (): Promise<'updated' | 'latest' | 'offline' | 'unsupported'> => {
  if (!navigator.onLine) return 'offline';
  if (!('serviceWorker' in navigator)) return 'unsupported';

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return 'unsupported';

    await reg.update();
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
      return 'updated';
    }
    return 'latest';
  } catch (err) {
    console.warn('Update check error:', err);
    return 'latest';
  }
};

export const PwaInstallPrompt: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('b2_pwa_prompt_dismissed') === 'true';
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone / PWA mode
    const standalone = isRunningStandalone();
    setIsInstalled(standalone);

    // Detect device type
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /Android/i.test(navigator.userAgent);
    
    setIsIOS(isIosDevice && !standalone);
    if (isIosDevice) {
      setGuideTab('ios');
    } else if (isAndroidDevice) {
      setGuideTab('android');
    } else {
      setGuideTab('desktop');
    }

    // Listen to BeforeInstallPrompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleOpenGuide = () => {
      setShowGuide(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setShowGuide(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('open-pwa-guide', handleOpenGuide);
    window.addEventListener('pwa-installed', handleAppInstalled);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen to network status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-guide', handleOpenGuide);
      window.removeEventListener('pwa-installed', handleAppInstalled);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setGuideTab('ios');
      setShowGuide(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setCanInstall(false);
        }
        deferredPrompt = null;
      } catch {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
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

      {/* Universal Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AppLogo size={34} />
                <div>
                  <h3 className="text-sm font-black">App installieren</h3>
                  <p className="text-[11px] text-slate-500">100% Offline & Schneller Start</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl">
              <button
                type="button"
                onClick={() => setGuideTab('ios')}
                className={`py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
                  guideTab === 'ios'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> iPhone / iPad
              </button>
              <button
                type="button"
                onClick={() => setGuideTab('android')}
                className={`py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
                  guideTab === 'android'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Android
              </button>
              <button
                type="button"
                onClick={() => setGuideTab('desktop')}
                className={`py-1.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
                  guideTab === 'desktop'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Windows / PC
              </button>
            </div>

            {/* iOS Guide */}
            {guideTab === 'ios' && (
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Öffnen in Safari & auf „Teilen“ tippen</span>
                      <Share className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 inline" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Das Viereck-Symbol mit dem Pfeil nach oben in der Safari-Symbolleiste unten.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>„Zum Home-Bildschirm“</span>
                      <PlusSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 inline" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Scrollen Sie im Menü etwas nach unten und wählen Sie „Zum Home-Bildschirm hinzufügen“.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Android Guide */}
            {guideTab === 'android' && (
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Chrome Menü öffnen (3 Punkte ⋮)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tippen Sie oben rechts im Chrome-Browser auf die drei Punkte.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>„App installieren“ oder „Zum Startbildschirm“</span>
                      <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 inline" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bestätigen Sie mit „Installieren“ – das App-Icon erscheint sofort auf Ihrem Display.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Guide */}
            {guideTab === 'desktop' && (
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Installations-Symbol in der Adressleiste</span>
                      <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 inline" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Klicken Sie in Google Chrome oder Edge rechts in der URL-Adressleiste auf das App-Installieren-Symbol.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Oder über das Browser-Menü (⋮)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Wählen Sie im Menü „Speichern und teilen“ ➔ „Beruf B2+ installieren“.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs text-center shadow-md cursor-pointer transition-all"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
};
