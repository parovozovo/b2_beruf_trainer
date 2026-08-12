import React, { useState } from 'react';
import { X, Shield, Key, LogOut, CheckCircle, Sparkles, LogIn } from 'lucide-react';
import type { User, PromoCode } from '../types';
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

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl space-y-4 text-center">
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
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg"
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

  const handleRealLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Info Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg border border-indigo-400/30">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
              {currentUser.role === 'admin' && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Kontostatus:</span>
            {currentUser.isPremium ? (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Premium-Mitglied
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-bold">
                Kostenloses Konto
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Rolle:</span>
            <span className="font-bold text-slate-200 uppercase">{currentUser.role}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tägliche Prüfungsversuche:</span>
            <span className="font-bold text-emerald-400">{currentUser.dailyExamAttemptsRemaining} verbleibend</span>
          </div>
        </div>

        {/* Admin Quick Jump Link */}
        {currentUser.role === 'admin' && onNavigateToAdmin && (
          <button
            onClick={() => {
              onNavigateToAdmin();
              onClose();
            }}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors border border-rose-500/40"
          >
            <Shield className="w-4 h-4" /> Verwaltungsbereich öffnen (/admin-beruf)
          </button>
        )}

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
                <CheckCircle className="w-3.5 h-3.5" /> {redeemSuccessMsg}
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
