import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Key,
  LogOut,
  CheckCircle2,
  Sparkles,
  LogIn,
  Lock,
  Type,
  Volume2,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { User, PromoCode } from '../types';
import { getRemainingPremiumDays } from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onNavigateToAdmin?: () => void;
  promoCodes: PromoCode[];
  onRedeemPromoCode: (code: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenLoginModal,
  onNavigateToAdmin,
  promoCodes: _promoCodes,
  onRedeemPromoCode,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [fontScale, setFontScale] = useState<string>(() => localStorage.getItem('b2_font_scale') || '100%');
  const [audioSpeed, setAudioSpeed] = useState<string>(() => localStorage.getItem('b2_audio_speed') || '1.0');

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

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md p-6 glass-panel rounded-3xl border border-slate-700/60 shadow-2xl space-y-4 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30">
            <LogIn className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Gast (Nicht angemeldet)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sie nutzen den Trainer derzeit als Gast. Melden Sie sich an, um Ihren Lernfortschritt dauerhaft zu speichern.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenLoginModal();
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition-all"
            >
              Anmelden / Registrieren
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    onRedeemPromoCode(promoInput.trim());
    setRedeemSuccessMsg('Gutscheincode erfolgreich eingelöst!');
    setPromoInput('');
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Das Passwort muss mindestens 6 Zeichen lang sein.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Die Passwörter stimmen nicht überein.' });
      return;
    }

    setPasswordLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      setPasswordMsg({ type: 'success', text: 'Passwort wurde erfolgreich aktualisiert!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Fehler beim Ändern des Passworts.';
      setPasswordMsg({ type: 'error', text: errMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRealLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-7 glass-panel rounded-3xl border border-slate-700/60 shadow-2xl space-y-5 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition-colors hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Info Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md border border-indigo-400/30 shrink-0">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
              {currentUser.role === 'admin' && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              {currentUser.email}
              <span className="text-[10px] text-slate-500 font-sans" title="E-Mail-Adresse kann nicht geändert werden">(Fest hinterlegt)</span>
            </p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Kontostatus:</span>
            {currentUser.isPremium ? (
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Premium-Mitglied
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-lg font-bold">
                Kostenloses Konto
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Verbleibende Premium-Tage:</span>
            {currentUser.isPremium ? (
              <span className="font-black text-amber-400">
                {currentUser.premiumExpiresAt ? `${getRemainingPremiumDays(currentUser)} Tage gültig` : '👑 Unbegrenzt'}
              </span>
            ) : (
              <span className="font-bold text-slate-500">0 Tage (Kein Premium)</span>
            )}
          </div>

          {currentUser.appliedPromoCode && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Eingelöster Gutschein:</span>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                {currentUser.appliedPromoCode}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Rolle:</span>
            <span className="font-bold text-slate-200 uppercase">{currentUser.role}</span>
          </div>
        </div>

        {/* Admin Quick Jump Link */}
        {currentUser.role === 'admin' && onNavigateToAdmin && (
          <button
            onClick={() => {
              onNavigateToAdmin();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors border border-rose-500/40"
          >
            <Shield className="w-4 h-4" /> Verwaltungsbereich öffnen (/admin-beruf)
          </button>
        )}

        {/* Learning Settings: Font Scale & Audio Speed */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="font-extrabold text-slate-200 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-indigo-400" /> Individuelle Lern-Einstellungen
          </div>

          {/* Font Scale Selection */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Schriftgröße (Text-Skalierung):</span>
            <div className="flex gap-1">
              {[
                { label: 'Normal (100%)', val: '100%' },
                { label: 'Groß (110%)', val: '110%' },
                { label: 'Sehr Groß (120%)', val: '120%' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFontScale(opt.val)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all border ${
                    fontScale === opt.val
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'glass-card text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Speed Selection */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" /> Audio-Geschwindigkeit:
            </span>
            <div className="flex gap-1">
              {[
                { label: '0.85x (Langsamer)', val: '0.85' },
                { label: '1.0x (Normal)', val: '1.0' },
                { label: '1.15x (Schnell)', val: '1.15' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAudioSpeed(opt.val)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all border ${
                    audioSpeed === opt.val
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'glass-card text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Change Password Form (Expandable) */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <button
            type="button"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="w-full flex items-center justify-between text-left font-extrabold text-slate-200 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" /> Passwort ändern
            </span>
            <span className="text-[11px] text-indigo-400 font-bold">
              {showPasswordChange ? 'Schließen ▲' : 'Bearbeiten ▼'}
            </span>
          </button>

          {showPasswordChange && (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-2.5 pt-2 border-t border-slate-800 animate-fadeIn">
              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">Neues Passwort (min. 6 Zeichen)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold mb-1">Neues Passwort bestätigen</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                />
              </div>

              {passwordMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 font-bold ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {passwordLoading ? 'Wird gespeichert...' : 'Neues Passwort speichern'}
              </button>
            </form>
          )}
        </div>

        {/* Promo Code Redemption Form for Standard Users */}
        {!currentUser.isPremium && (
          <form onSubmit={handleRedeem} className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300">Gutscheincode einlösen (Promo-Code):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="z.B. BETA2026"
                className="flex-1 px-3 py-2 glass-input rounded-xl text-xs font-mono uppercase font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-md"
              >
                <Key className="w-3.5 h-3.5" /> Einlösen
              </button>
            </div>
            {redeemSuccessMsg && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {redeemSuccessMsg}
              </div>
            )}
          </form>
        )}

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleRealLogout}
            className="w-full py-2.5 px-4 glass-card hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700/60"
          >
            <LogOut className="w-4 h-4" /> Abmelden (Sign Out)
          </button>
        </div>
      </div>
    </div>
  );
};
