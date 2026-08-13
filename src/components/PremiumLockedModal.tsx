import React, { useState } from 'react';
import { Crown, Sparkles, Key, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PremiumLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPromoModal: () => void;
  onRedeemPromoCode?: (code: string) => void;
}

export const PremiumLockedModal: React.FC<PremiumLockedModalProps> = ({
  isOpen,
  onClose,
  onOpenPromoModal,
  onRedeemPromoCode,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    if (onRedeemPromoCode) {
      onRedeemPromoCode(promoInput.trim());
      setSuccessMsg('Gutscheincode eingelöst! Premium freigeschaltet.');
      setPromoInput('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      onClose();
      onOpenPromoModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 glass-panel rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-6 text-left overflow-hidden">
        {/* Top Glow Background Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shrink-0 border border-amber-400">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-black uppercase inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Premium Exklusiv
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Deutsch B2 Beruf Premium 👑
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Schalten Sie den vollständigen Funktionsumfang des B2 Beruf Trainers frei und bereiten Sie sich ohne Einschränkungen auf Ihre Prüfung vor.
        </p>

        {/* Benefits Grid */}
        <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-white">Unbegrenzte B2-DTB Komplettprüfungen</div>
              <div className="text-[11px] text-slate-400">Echte Simulationen aller 57 Fragen mit Timer & Auswertung.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-white">Zugriff auf ALLE Modelltests & Varianten</div>
              <div className="text-[11px] text-slate-400">Alle exklusiven Originalmaterialien von Lesen 1 bis Sprachbausteine 2.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-white">104+ Forenbeiträge & 67+ Mündliche Prüfungsthemen</div>
              <div className="text-[11px] text-slate-400">Schreiben (Q58) & Sprechen (Teile 1A, 2, 3) in vollem Umfang üben.</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black text-white">Speicherung & Statistiken</div>
              <div className="text-[11px] text-slate-400">Detaillierter Lernfortschritt und Wortanzahl-Fortschritt.</div>
            </div>
          </div>
        </div>

        {/* Promo Code Input Form */}
        <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
            Haben Sie einen Gutscheincode?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Gutscheincode z.B. PROMO2026"
              className="flex-1 px-4 py-2.5 glass-input rounded-xl text-xs font-mono uppercase font-black tracking-wider border border-slate-300 dark:border-slate-700"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
            >
              <Key className="w-4 h-4" /> Einlösen
            </button>
          </div>
          {successMsg && (
            <div className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> {successMsg}
            </div>
          )}
        </form>

        <button
          onClick={onClose}
          className="w-full py-3 glass-card hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-extrabold transition-colors"
        >
          Schließen
        </button>
      </div>
    </div>
  );
};
