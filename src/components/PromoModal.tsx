import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import type { User, PromoCode } from '../types';
import confetti from 'canvas-confetti';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  promoCodes: PromoCode[];
  onApplyPromo: (code: PromoCode) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  promoCodes,
  onApplyPromo,
}) => {
  const [codeInputValue, setCodeInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanCode = codeInputValue.trim().toUpperCase();
    if (!cleanCode) {
      setError('Bitte geben Sie einen Gutscheincode ein.');
      return;
    }

    const foundCode = promoCodes.find(c => c.code.toUpperCase() === cleanCode && c.active);

    if (!foundCode) {
      setError('Ungültiger oder inaktiver Gutscheincode.');
      return;
    }

    if (foundCode.usedCount >= foundCode.maxUses) {
      setError('Dieser Code hat das Nutzungslimit erreicht.');
      return;
    }

    if (foundCode.usedByEmails.includes(currentUser.email)) {
      setError('Sie haben diesen Code bereits eingelöst.');
      return;
    }

    // Success
    onApplyPromo(foundCode);
    setSuccessMsg(`Glückwunsch! Der Gutscheincode wurde erfolgreich für ${foundCode.durationDays} Tage Premium aktiviert!`);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      onClose();
      setCodeInputValue('');
      setSuccessMsg(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Gutscheincode einlösen <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">Geben Sie Ihren Code ein, um Premium-Zugang zu erhalten</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-sm text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Gutscheincode (z. B. BETA2026)
            </label>
            <input
              type="text"
              value={codeInputValue}
              onChange={(e) => setCodeInputValue(e.target.value)}
              placeholder="BETA2026..."
              className="w-full px-4 py-3 glass-input rounded-xl text-center tracking-widest font-mono text-lg uppercase font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Premium aktivieren
          </button>
        </form>
      </div>
    </div>
  );
};
