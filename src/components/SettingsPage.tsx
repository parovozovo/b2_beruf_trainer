import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  LogOut,
  CheckCircle2,
  Sparkles,
  Lock,
  Type,
  Volume2,
  AlertCircle,
  Save,
  Moon,
  Sun,
  ShieldAlert,
  ArrowRight,
  Clock,
  Award,
  BookOpen,
  Smartphone,
  Download,
  RefreshCw,
  ShieldCheck,
  FileText,
  Cookie,
  Landmark,
  Bell,
  BellRing,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { User, PromoCode, TileResult, FullExamResult } from '../types';
import { getRemainingPremiumTimeLabel, isAdminEmail } from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { triggerPwaInstall, isRunningStandalone, checkForAppUpdates } from './pwa/PwaInstallPrompt';
import { openLegalModal } from './legal/LegalModal';

interface SettingsPageProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onNavigateToAdmin?: () => void;
  onSelectTab: (tab: string) => void;
  promoCodes: PromoCode[];
  onRedeemPromoCode: (code: string) => { success: boolean; message: string; durationDays?: number } | void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  tileResults: TileResult[];
  fullExamResults: FullExamResult[];
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onLogout,
  onOpenLoginModal,
  onNavigateToAdmin,
  onSelectTab,
  promoCodes: _promoCodes,
  onRedeemPromoCode,
  theme,
  onToggleTheme,
  tileResults,
  fullExamResults,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedTeacherPromoId, setCopiedTeacherPromoId] = useState<string | null>(null);

  // Settings State
  const [fontScale, setFontScale] = useState<string>(() => localStorage.getItem('b2_font_scale') || '100%');
  const [audioSpeed, setAudioSpeed] = useState<string>(() => localStorage.getItem('b2_audio_speed') || '1.0');

  const [isPwaInstalled, setIsPwaInstalled] = useState(() => isRunningStandalone());
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Push / Reminder State
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem('b2_reminders_enabled') === 'true';
  });
  const [reminderTime] = useState<string>(() => {
    return localStorage.getItem('b2_reminder_time') || '19:00';
  });

  const handleToggleReminders = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Ihr Browser unterstützt leider keine Web-Benachrichtigungen.');
      return;
    }

    if (!remindersEnabled) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setRemindersEnabled(true);
        localStorage.setItem('b2_reminders_enabled', 'true');
        try {
          new Notification('🔥 Beruf B2+ Lernerinnerung aktiviert!', {
            body: `Täglich um ${reminderTime} Uhr erinnern wir Sie an Ihre B2-Prüfungsvorbereitung.`,
            icon: '/pwa-192x192.png',
          });
        } catch {}
      } else {
        alert('Benachrichtigungen wurden im Browser blockiert. Bitte erlauben Sie diese in den Browser-Einstellungen.');
      }
    } else {
      setRemindersEnabled(false);
      localStorage.setItem('b2_reminders_enabled', 'false');
    }
  };

  const handleSendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🔥 Beruf B2+ Trainer: Streak halten!', {
          body: 'Zeit für Ihre 15-Minuten B2-Übung! Schließen Sie heute 1 Aufgabe ab.',
          icon: '/pwa-192x192.png',
        });
      } catch {}
    } else {
      handleToggleReminders();
    }
  };

  useEffect(() => {
    const handleInstalled = () => setIsPwaInstalled(true);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    setUpdateMsg(null);
    const res = await checkForAppUpdates();
    setCheckingUpdate(false);
    if (res === 'updated') {
      setUpdateMsg('✨ Neue Version wurde installiert! Seite wird neu geladen...');
    } else if (res === 'latest') {
      setUpdateMsg('✓ Sie nutzen bereits die aktuellste Version!');
      setTimeout(() => setUpdateMsg(null), 4000);
    } else if (res === 'offline') {
      setUpdateMsg('⚠️ Offline – keine Internetverbindung für Updates.');
      setTimeout(() => setUpdateMsg(null), 4000);
    } else {
      setUpdateMsg('✓ App ist aktuell.');
      setTimeout(() => setUpdateMsg(null), 4000);
    }
  };

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Apply Font Scale on change
  useEffect(() => {
    localStorage.setItem('b2_font_scale', fontScale);
    if (fontScale === '110%') {
      document.documentElement.style.fontSize = '17.6px';
    } else if (fontScale === '120%') {
      document.documentElement.style.fontSize = '19.2px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [fontScale]);

  // Apply Audio Speed
  useEffect(() => {
    localStorage.setItem('b2_audio_speed', audioSpeed);
  }, [audioSpeed]);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemError(null);
    setRedeemSuccessMsg(null);

    const clean = promoInput.trim().toUpperCase();
    if (!clean) {
      setRedeemError('Bitte geben Sie einen Gutscheincode ein.');
      return;
    }

    const res = onRedeemPromoCode(clean);
    if (res && res.success) {
      setRedeemSuccessMsg(res.message);
      setPromoInput('');
      confetti({ particleCount: 80, spread: 70 });
    } else if (res && !res.success) {
      setRedeemError(res.message);
    } else {
      setRedeemSuccessMsg(`Gutscheincode ${clean} erfolgreich angewendet!`);
      setPromoInput('');
      confetti({ particleCount: 80, spread: 70 });
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Das Passwort muss mindestens 6 Zeichen lang sein.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Die Passwörter stimmen nicht überein.' });
      return;
    }

    if (!isSupabaseConfigured) {
      setPasswordMsg({ type: 'success', text: 'Passwort lokal aktualisiert.' });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setPasswordMsg({ type: 'success', text: 'Passwort erfolgreich geändert!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordMsg(null);
      }, 3000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Fehler beim Ändern des Passworts.';
      setPasswordMsg({ type: 'error', text: errMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const isSuperAdmin = currentUser && currentUser.role === 'admin' && isAdminEmail(currentUser.email);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
          <div className="w-20 h-20 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30">
            <UserIcon className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mein Profil & Einstellungen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
              Sie nutzen den Trainer derzeit als Gast. Melden Sie sich an, um Ihren Lernfortschritt dauerhaft zu speichern und Premium-Funktionen freizuschalten.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenLoginModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 rotate-180" /> Jetzt anmelden / Registrieren
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold rounded-2xl border border-slate-300 dark:border-slate-700 transition-all text-sm cursor-pointer"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shrink-0">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{currentUser.name}</h1>
              {currentUser.role === 'admin' ? (
                <span className="px-2.5 py-0.5 bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : currentUser.role === 'teacher' ? (
                <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  🎓 Lehrkraft / Dozent
                </span>
              ) : currentUser.isPremium ? (
                <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Premium
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 rounded-full text-xs font-semibold">
                  Kostenlos
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => {
                if (onNavigateToAdmin) onNavigateToAdmin();
                else {
                  onSelectTab('admin');
                  window.location.hash = 'admin-beruf';
                }
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4" /> Admin-Verwaltung
            </button>
          )}

          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Membership & Promo & Learning Stats */}
        <div className="md:col-span-1 space-y-6">
          {/* Status & Subscription Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Mitgliedschaft & Status
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Kontotyp:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentUser.role === 'admin'
                    ? '👑 Haupt-Administrator'
                    : currentUser.isPremium
                    ? '✨ Premium-Mitglied'
                    : 'Kostenloses Basiskonto'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Gültigkeit:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {getRemainingPremiumTimeLabel(currentUser)}
                </span>
              </div>

              {currentUser.appliedPromoCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Gutschein:</span>
                  <span className="font-mono px-2 py-0.5 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-500/30 text-[11px] font-bold">
                    {currentUser.appliedPromoCode}
                  </span>
                </div>
              )}
            </div>

            {/* Promo Code Input Form */}
            <form onSubmit={handleRedeem} className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gutscheincode einlösen
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Z. B. KATIT"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  Einlösen
                </button>
              </div>

              {redeemSuccessMsg && (
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{redeemSuccessMsg}</span>
                </div>
              )}

              {redeemError && (
                <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{redeemError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Quick Learning Stats */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Meine Lernstatistik
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{tileResults.length}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Kachelübungen</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{fullExamResults.length}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Komplettprüfungen</div>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('dashboard')}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5" /> Zum Übungs-Dashboard
            </button>
          </div>
        </div>

        {/* Right Column: Preferences & Security */}
        <div className="md:col-span-2 space-y-6">
          {/* Teacher Partner Hub & Student List */}
          {currentUser.role === 'teacher' && (
            <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-purple-950/10 dark:bg-purple-950/20 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Dozenten-Bereich: Meine Gutscheine & Schüler
                </h3>
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-800 dark:text-purple-300 rounded-full text-xs font-black">
                  🎓 Lehrkraft
                </span>
              </div>

              {(() => {
                const myCodes = _promoCodes.filter(
                  (c) =>
                    (currentUser.email && c.ownerEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
                    (currentUser.id && c.ownerUserId === currentUser.id)
                );

                if (myCodes.length === 0) {
                  return (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-center">
                      Ihnen ist derzeit noch kein Gutscheincode zugewiesen. Wenden Sie sich an den Administrator, um Ihren persönlichen Schüler-Gutschein zu erhalten.
                    </div>
                  );
                }

                const totalRegistered = myCodes.reduce((acc, c) => acc + (c.usedByEmails?.length || 0), 0);
                const allPaidStudents = myCodes.flatMap((c) => c.paidStudents || []);
                const totalEarnings = allPaidStudents.reduce((acc, s) => acc + s.teacherEarnings, 0);

                return (
                  <div className="space-y-4">
                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xs">
                        <div className="text-xl font-black text-purple-600 dark:text-purple-300">{totalRegistered}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Registrierte Schüler</div>
                      </div>
                      <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xs">
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{allPaidStudents.length}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Bezahlte Abos</div>
                      </div>
                      <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-2xl border border-purple-200 dark:border-purple-500/30 shadow-xs">
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">€ {totalEarnings.toFixed(2)}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Ihre Gesamtprovision</div>
                      </div>
                    </div>

                    {myCodes.map((code) => {
                      const promoUrl = `${window.location.origin}/?promo=${encodeURIComponent(code.code)}`;
                      const isCopied = copiedTeacherPromoId === code.id;
                      const codeEarnings = (code.paidStudents || []).reduce((acc, s) => acc + s.teacherEarnings, 0);

                      return (
                        <div key={code.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-purple-200 dark:border-purple-500/30 space-y-3.5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-lg text-purple-600 dark:text-amber-400">{code.code}</span>
                                {Boolean(code.discountPercent && code.discountPercent > 0) && (
                                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold">
                                    🏷️ -{code.discountPercent}% Schüler-Rabatt
                                  </span>
                                )}
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-bold">
                                  💰 {code.commissionPercent ?? 20}% Provision
                                </span>
                              </div>
                              {code.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic">«{code.description}»</p>
                              )}
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
                              👥 {code.usedCount} von {code.maxUses} Schülern
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(promoUrl);
                                setCopiedTeacherPromoId(code.id);
                                setTimeout(() => setCopiedTeacherPromoId(null), 3000);
                              }}
                              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-300" />
                                  <span>Link für Schüler in die Zwischenablage kopiert!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Schüler-Empfehlungslink kopieren</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Paid Subscriptions Breakdown */}
                          {code.paidStudents && code.paidStudents.length > 0 && (
                            <div className="pt-3 border-t border-purple-200 dark:border-purple-500/20 text-xs space-y-2">
                              <div className="flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400">
                                <span>💳 Bezahlte Abos ({code.paidStudents.length}):</span>
                                <span>Ihre Auszahlung: € {codeEarnings.toFixed(2)}</span>
                              </div>
                              <div className="space-y-1.5">
                                {code.paidStudents.map((ps, idx) => (
                                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
                                    <span className="text-slate-800 dark:text-slate-300 truncate max-w-[200px]" title={ps.email}>{ps.email}</span>
                                    <span className="text-slate-500">{ps.planName}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">+€ {ps.teacherEarnings.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Free Registered Students */}
                          {code.usedByEmails && code.usedByEmails.length > 0 && (
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5">
                              <span className="font-bold text-slate-700 dark:text-slate-400">Alle registrierten Schüler ({code.usedByEmails.length}):</span>
                              <div className="flex flex-wrap gap-1.5">
                                {code.usedByEmails.map((em, idx) => (
                                  <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-mono text-[11px]">
                                    {em}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Individual Learning & Accessibility Settings */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Individuelle Lern-Einstellungen
            </h3>

            {/* Font Scale Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Schriftgröße (Text-Skalierung für Lesetexte & Aufgaben)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Normal (100%)', val: '100%' },
                  { label: 'Groß (110%)', val: '110%' },
                  { label: 'Sehr Groß (120%)', val: '120%' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFontScale(item.val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      fontScale === item.val
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span className="font-semibold text-slate-900 dark:text-slate-400">Vorschautext:</span> Sehr geehrte Damen und Herren, bezugnehmend auf Ihre Anzeige bewerbe ich mich hiermit um die ausgeschriebene Stelle.
              </div>
            </div>

            {/* Audio Speed Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Standard-Geschwindigkeit für Hörverstehens-Audios
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '0.85x (Langsamer)', val: '0.85' },
                  { label: '1.0x (Normal / Prüfung)', val: '1.0' },
                  { label: '1.15x (Schnell / Training)', val: '1.15' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setAudioSpeed(item.val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      audioSpeed === item.val
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle in Settings */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Erscheinungsbild / Design-Theme</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Wählen Sie zwischen Dark- und Light-Mode</div>
              </div>
              <button
                onClick={onToggleTheme}
                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-300 text-indigo-700 hover:bg-slate-200'
                }`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Heller Modus</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Dunkler Modus</span>
                  </>
                )}
              </button>
            </div>

            {/* PWA App Installation & Offline Card */}
            {isPwaInstalled ? (
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>App ist installiert</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px]">
                        ✓ Offline-Modus aktiv
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {updateMsg || 'Die App aktualisiert sich automatisch bei jedem Start im Hintergrund.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckUpdates}
                  disabled={checkingUpdate}
                  className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>{checkingUpdate ? 'Prüfen...' : 'Nach Updates suchen'}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>App auf Smartphone / PC installieren</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        100% Offline-fähig
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Üben Sie auch unterwegs im Flugzeug oder der Bahn ohne Internetverbindung.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerPwaInstall()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Installieren / Anleitung</span>
                </button>
              </div>
            )}

            {/* Daily Push Reminder & Notification Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${remindersEnabled ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                  {remindersEnabled ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Tägliche Lernerinnerung (Push)</span>
                    {remindersEnabled && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        Aktiv
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Erinnert Sie täglich an Ihre B2-Übung, damit Ihr Lern-Streak nicht abreißt.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {remindersEnabled && (
                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Test
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleToggleReminders}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow transition-all cursor-pointer ${
                    remindersEnabled
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {remindersEnabled ? 'Deaktivieren' : 'Aktivieren'}
                </button>
              </div>
            </div>
          </div>

          {/* Security & Password Change */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Kontosicherheit & Passwort
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold transition-colors cursor-pointer"
              >
                {showPasswordChange ? 'Abbrechen' : 'Passwort ändern'}
              </button>
            </div>

            {showPasswordChange ? (
              <form onSubmit={handleSavePassword} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Neues Passwort
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mindestens 6 Zeichen"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Passwort wiederholen
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Passwort bestätigen"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {passwordMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                    )}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {passwordLoading ? 'Speichern...' : 'Neues Passwort speichern'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Ihr Konto ist durch verschlüsselte Supabase-Authentifizierung geschützt. Sie können Ihr Passwort jederzeit hier ändern.
              </p>
            )}
          </div>

          {/* Rechtliches & Datenschutz Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Rechtliches & Datenschutz
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                DSGVO-konform
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Hier finden Sie alle offiziellen Dokumente zu unseren Nutzungsbedingungen, dem Widerrufsverzicht für digitale Inhalte sowie der DSGVO-Datenschutzerklärung.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => openLegalModal('agb')}
                className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AGB & Widerruf</span>
              </button>

              <button
                type="button"
                onClick={() => openLegalModal('datenschutz')}
                className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Datenschutz</span>
              </button>

              <button
                type="button"
                onClick={() => openLegalModal('cookies')}
                className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <Cookie className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Cookies</span>
              </button>

              <button
                type="button"
                onClick={() => openLegalModal('impressum')}
                className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Impressum</span>
              </button>
            </div>
          </div>

          {/* Super-Admin Dedicated Control Box */}
          {isSuperAdmin && (
            <div className="p-6 bg-gradient-to-br from-rose-950/20 via-rose-900/10 to-slate-900/40 rounded-3xl border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <Shield className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Administrator-Zugriff</h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Als Haupt-Administrator haben Sie uneingeschränkten Zugriff auf die Prüfungsverwaltung, 12 Prüfungsteile, Benutzerkonten und System-Backups.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onNavigateToAdmin) onNavigateToAdmin();
                    else {
                      onSelectTab('admin');
                      window.location.hash = 'admin-beruf';
                    }
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Zur Admin-Verwaltung öffnen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
