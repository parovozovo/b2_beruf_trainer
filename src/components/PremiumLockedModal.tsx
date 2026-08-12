import React from 'react';
import { Lock, Sparkles, Key, X } from 'lucide-react';

interface PremiumLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPromoModal: () => void;
}

export const PremiumLockedModal: React.FC<PremiumLockedModalProps> = ({
  isOpen,
  onClose,
  onOpenPromoModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-amber-500/30 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-md">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          Premium-Modelltest <Sparkles className="w-5 h-5 text-amber-400" />
        </h3>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Dieser Test gehört zur <span className="text-amber-400 font-semibold">Premium-Serie</span> (Originalmaterialien und Prüfungssätze). 
          Für den Zugriff benötigen Sie eine aktive Mitgliedschaft oder einen Gutscheincode.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenPromoModal();
            }}
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Key className="w-4 h-4" /> Gutscheincode eingeben
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 glass-card hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-colors"
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
};
