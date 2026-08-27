import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, Sparkles, Send, MessageCircle, Video, Globe, ExternalLink } from 'lucide-react';
import type { User, PromoCode } from '../types';
import confetti from 'canvas-confetti';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
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

  const cleanCode = codeInputValue.trim().toUpperCase();
  const matchedPromo = promoCodes.find(
    (c) => c.code.toUpperCase() === cleanCode && c.active
  );

  const getPartnerIcon = (url?: string) => {
    if (!url) return <ExternalLink className="w-3.5 h-3.5" />;
    const lower = url.toLowerCase();
    if (lower.includes('t.me') || lower.includes('telegram')) return <Send className="w-3.5 h-3.5 text-sky-400" />;
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) return <MessageCircle className="w-3.5 h-3.5 text-pink-400" />;
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return <Video className="w-3.5 h-3.5 text-rose-500" />;
    return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!cleanCode) {
      setError('Bitte geben Sie einen Gutscheincode ein.');
      return;
    }

    const foundCode = promoCodes.find(c => c.code.toUpperCase() === cleanCode && c.active);

    if (!foundCode) {
      setError('Ungültiger oder inaktiver Gutscheincode.');
      return;
    }

    const isUnlim = Boolean(foundCode.isUnlimited || foundCode.maxUses >= 999999);
    if (!isUnlim && (foundCode.usedCount || 0) >= (foundCode.maxUses || 50)) {
      setError('Dieser Code hat das Nutzungslimit erreicht.');
      return;
    }

    const cleanUserEmail = currentUser?.email?.trim().toLowerCase();
    if (
      cleanUserEmail &&
      !cleanUserEmail.startsWith('anon-') &&
      cleanUserEmail !== 'gast@beruf-b2.com' &&
      foundCode.usedByEmails &&
      foundCode.usedByEmails.some((e) => e.toLowerCase() === cleanUserEmail)
    ) {
      setError('Sie haben diesen Code bereits eingelöst.');
      return;
    }

    // Success
    onApplyPromo(foundCode);
    const hasFree = Boolean(foundCode.durationDays && foundCode.durationDays > 0);
    const hasDisc = Boolean(foundCode.discountPercent && foundCode.discountPercent > 0);
    const partnerNotice = foundCode.partnerName ? ` von ${foundCode.partnerName}` : '';
    
    let msg = `Glückwunsch! Der Gutschein${partnerNotice} wurde erfolgreich angewendet!`;
    if (hasFree && hasDisc) {
      const durationLabel = foundCode.durationDays >= 999 ? 'dauerhaftes' : `${foundCode.durationDays} Tage`;
      msg = `Glückwunsch! Der Gutschein${partnerNotice} wurde für ${durationLabel} Premium und -${foundCode.discountPercent}% Rabatt aktiviert!`;
    } else if (hasFree) {
      const durationLabel = foundCode.durationDays >= 999 ? 'dauerhaften' : `${foundCode.durationDays} Tage`;
      msg = `Glückwunsch! Der Gutschein${partnerNotice} wurde erfolgreich für ${durationLabel} Premium aktiviert!`;
    } else if (hasDisc) {
      msg = `Glückwunsch! Rabattcode${partnerNotice} aktiviert (-${foundCode.discountPercent}% auf alle Tarife im Shop).`;
    }

    setSuccessMsg(msg);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      onClose();
      setCodeInputValue('');
      setSuccessMsg(null);
    }, 2200);
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
            <p className="text-xs text-slate-400">Geben Sie Ihren Code oder Partner-Gutschein ein</p>
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
              placeholder="GUTSCHEINCODE..."
              className="w-full px-4 py-3 glass-input rounded-xl text-center tracking-widest font-mono text-lg uppercase font-bold placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Real-time Partner Badge preview */}
          {matchedPromo && (
            <div className="p-3.5 bg-slate-900/80 border border-amber-500/30 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {matchedPromo.partnerName ? `Partner: ${matchedPromo.partnerName}` : 'Gültiger Code'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md">
                  {matchedPromo.durationDays >= 999 ? 'Dauerhaft' : `+${matchedPromo.durationDays} Tage`}
                </span>
              </div>
              {matchedPromo.description && (
                <p className="text-xs text-slate-300 italic">«{matchedPromo.description}»</p>
              )}
              {matchedPromo.partnerLink && (
                <a
                  href={matchedPromo.partnerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                >
                  {getPartnerIcon(matchedPromo.partnerLink)}
                  <span>{matchedPromo.partnerLinkTitle || 'Kanal des Autors ansehen'}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Jetzt einlösen & freischalten</span>
          </button>
        </form>
      </div>
    </div>
  );
};
