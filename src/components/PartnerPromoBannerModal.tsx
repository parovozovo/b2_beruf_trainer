import React, { useState } from 'react';
import { X, Gift, CheckCircle, ExternalLink, Sparkles, Send, MessageCircle, Globe, Video } from 'lucide-react';
import type { PromoCode, User } from '../types';
import confetti from 'canvas-confetti';

interface PartnerPromoBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCode: PromoCode | null;
  currentUser: User | null;
  onActivate: (code: PromoCode) => void;
}

export const PartnerPromoBannerModal: React.FC<PartnerPromoBannerModalProps> = ({
  isOpen,
  onClose,
  promoCode,
  currentUser,
  onActivate,
}) => {
  const [activated, setActivated] = useState(false);

  if (!isOpen || !promoCode) return null;

  const getPartnerIcon = (url?: string) => {
    if (!url) return <ExternalLink className="w-4 h-4" />;
    const lower = url.toLowerCase();
    if (lower.includes('t.me') || lower.includes('telegram')) {
      return <Send className="w-4 h-4 text-sky-400" />;
    }
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      return <MessageCircle className="w-4 h-4 text-pink-400" />;
    }
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return <Video className="w-4 h-4 text-rose-500" />;
    }
    return <Globe className="w-4 h-4 text-emerald-400" />;
  };

  const getPartnerLinkDefaultText = (url?: string) => {
    if (!url) return 'Zum Profil des Partners';
    const lower = url.toLowerCase();
    if (lower.includes('t.me') || lower.includes('telegram')) return 'Telegram-Kanal öffnen';
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'Instagram-Profil besuchen';
    if (lower.includes('youtube.com')) return 'YouTube-Kanal ansehen';
    return 'Website des Partners besuchen';
  };

  const handleActivateClick = () => {
    onActivate(promoCode);
    setActivated(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      onClose();
      setActivated(false);
    }, 2400);
  };

  const isAlreadyClaimed = currentUser?.appliedPromoCode === promoCode.code;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-slate-900/95 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          title="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Gift className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" /> EXKLUSIVER PARTNER-GUTSCHEIN
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {promoCode.partnerName ? `Empfehlung von ${promoCode.partnerName}` : 'Exklusiver Aktionscode'}
            </h3>
          </div>
        </div>

        {/* Description / Partner Note */}
        <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl mb-5 space-y-2">
          {promoCode.description ? (
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              «{promoCode.description}»
            </p>
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">
              Sie haben einen Aktionscode erhalten! Schalten Sie jetzt alle 12 Module für die Prüfungsvorbereitung frei.
            </p>
          )}

          {/* Social Link Button to Partner */}
          {promoCode.partnerLink && (
            <div className="pt-2">
              <a
                href={promoCode.partnerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white rounded-xl border border-slate-600/60 transition-all shadow-sm"
              >
                {getPartnerIcon(promoCode.partnerLink)}
                <span>{promoCode.partnerLinkTitle || getPartnerLinkDefaultText(promoCode.partnerLink)}</span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </a>
            </div>
          )}
        </div>

        {/* Benefits Card */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-center">
            <span className="block text-2xl font-black text-indigo-400">
              {promoCode.durationDays >= 999 ? '∞' : `${promoCode.durationDays} Tage`}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kostenloser Premium</span>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
            <span className="block text-2xl font-black text-emerald-400">100%</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alle DTB B2 Module</span>
          </div>
        </div>

        {/* Action Button */}
        {activated ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Premium-Zugang erfolgreich aktiviert! 🎉</span>
          </div>
        ) : isAlreadyClaimed ? (
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-center">
            <p className="text-xs text-slate-400 mb-2">Sie nutzen diesen Aktionscode bereits auf Ihrem Konto.</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Weiter zum Training
            </button>
          </div>
        ) : (
          <button
            onClick={handleActivateClick}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Jetzt {promoCode.durationDays >= 999 ? 'dauerhaft' : `${promoCode.durationDays} Tage`} gratis aktivieren</span>
          </button>
        )}
      </div>
    </div>
  );
};
