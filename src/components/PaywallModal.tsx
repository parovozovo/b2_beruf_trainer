'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Lock, Sparkles, X, KeyRound, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  examTitle?: string;
  isLoggedIn: boolean;
}

export default function PaywallModal({
  isOpen,
  onClose,
  onUnlocked,
  examTitle,
  isLoggedIn,
}: PaywallModalProps) {
  const { t } = useLanguage();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any).rpc('redeem_promo_code', {
        p_code: promoCode.trim(),
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data && !data.success) {
        setErrorMsg(data.message || 'Invalid promo code');
      } else {
        setSuccessMsg(data?.message || 'Premium Unlocked!');
        setTimeout(() => {
          onUnlocked();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-sm font-extrabold text-white">{t.paywallTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exam Context Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>{t.premiumBadge} Modelltest</span>
          </div>
          <h3 className="text-base font-extrabold text-white">
            {examTitle || 'telc B2 Beruf Premium Set'}
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            {t.paywallDesc}
          </p>
        </div>

        {!isLoggedIn ? (
          <div className="space-y-4 pt-2 text-center">
            <p className="text-xs text-slate-400">
              Sie müssen angemeldet sein, um Premium-Inhalte freizuschalten.
            </p>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all active:scale-98"
            >
              <span>{t.signInBtn}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Promo Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder={t.promoCodePlaceholder}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 text-white font-mono font-bold text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-wider"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !promoCode.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? t.redeeming : t.redeemBtn}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
