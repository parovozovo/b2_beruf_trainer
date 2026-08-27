import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Award, Star } from 'lucide-react';
import { AppLogo } from '../AppLogo';

import type { PromoCode } from '../../types';

interface PricingPageProps {
  onOpenPromoModal: () => void;
  pendingPromo?: PromoCode | null;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onOpenPromoModal,
  pendingPromo,
}) => {
  const discountPercent = (pendingPromo && pendingPromo.discountPercent && pendingPromo.discountPercent > 0)
    ? pendingPromo.discountPercent
    : 0;

  const calculatePrice = (originalStr: string) => {
    const numeric = parseFloat(originalStr.replace(',', '.').replace(' €', ''));
    if (!discountPercent || isNaN(numeric)) {
      return { display: originalStr, isDiscounted: false, original: originalStr };
    }
    const discounted = Math.round(numeric * (1 - discountPercent / 100) * 100) / 100;
    return {
      display: `${discounted.toFixed(2).replace('.', ',')} €`,
      isDiscounted: true,
      original: originalStr,
    };
  };

  const plan1P = calculatePrice('9,99 €');
  const plan2P = calculatePrice('15,99 €');
  const plan3P = calculatePrice('29,99 €');
  const plan4P = calculatePrice('39,99 €');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <AppLogo size={36} />
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
              Beruf B2+ Trainer
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 hover:text-indigo-600">
              Startseite
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all"
            >
              Zum Trainer
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" /> Faire & transparente Preise
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Wählen Sie den passenden Plan für Ihren DTB B2 Prüfungserfolg
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Bereiten Sie sich gezielt und effizient auf den Deutsch-Test für den Beruf B2 vor. Keine versteckten Abofallen.
          </p>
        </div>

        {/* Celebratory Discount Banner */}
        {discountPercent > 0 && pendingPromo && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-indigo-500/20 rounded-3xl border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn max-w-4xl mx-auto">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/25 text-amber-500 dark:text-amber-300 flex items-center justify-center font-black text-2xl shrink-0 border border-amber-500/40 shadow-xs">
                🎉
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>{discountPercent}% Rabatt aktiviert!</span>
                  <span className="px-2 py-0.5 bg-amber-500/30 text-amber-800 dark:text-amber-300 rounded-md text-[10px] font-black uppercase">
                    Code: {pendingPromo.code}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {pendingPromo.partnerName ? `Empfohlen von ${pendingPromo.partnerName}. ` : ''}
                  Der Rabatt wurde automatisch auf alle Tarife angewendet.
                </div>
              </div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-2xl font-black text-xs shrink-0 shadow-md uppercase tracking-wider">
              -{discountPercent}% Gekürzt
            </div>
          </div>
        )}

        {/* Pricing Cards Grid (4 Packages) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Plan 1: 7 Tage Sprint */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">7 Tage Sprint-Pass</h3>
                <p className="text-xs text-slate-500 mt-1">Ideal für den schnellen Endspurt vor dem Prüfungstermin.</p>
              </div>

              <div className="flex items-baseline gap-1.5 flex-wrap">
                {plan1P.isDiscounted ? (
                  <>
                    <span className="text-sm font-bold text-slate-400 line-through whitespace-nowrap">
                      {plan1P.original}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {plan1P.display}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                    {plan1P.display}
                  </span>
                )}
                <span className="text-[11px] text-slate-500 font-bold">/ für 7 Tage</span>
              </div>
            </div>

            <Link
              to="/app/pricing?plan=sprint_7d"
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs text-center transition-colors cursor-pointer"
            >
              Plan wählen
            </Link>
          </div>

          {/* Plan 2: 30 Tage Standard (Featured) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-2 border-amber-500 text-white shadow-2xl space-y-5 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow">
                {plan2P.isDiscounted ? `-${discountPercent}% Rabatt` : '🔥 Beliebteste Wahl'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span>30 Tage Standard-Pass</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-300 mt-1">Gründliche und stressfreie Vorbereitung auf alle Prüfungsteile.</p>
              </div>

              <div className="flex items-baseline gap-1.5 flex-wrap">
                {plan2P.isDiscounted ? (
                  <>
                    <span className="text-sm font-bold text-slate-400 line-through whitespace-nowrap">
                      {plan2P.original}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 whitespace-nowrap">
                      {plan2P.display}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-white whitespace-nowrap">
                    {plan2P.display}
                  </span>
                )}
                <span className="text-[11px] text-emerald-400 font-bold">/ für 30 Tage</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/app/pricing?plan=standard_30d"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>Jetzt freischalten</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <button
                  type="button"
                  onClick={onOpenPromoModal}
                  className="text-[11px] text-slate-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Gutscheincode einlösen
                </button>
              </div>
            </div>
          </div>

          {/* Plan 3: 90 Tage Kursbegleiter */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-500/30 shadow-sm space-y-5 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase rounded-full tracking-wider">
                {plan3P.isDiscounted ? `-${discountPercent}% Rabatt` : 'Spart 38%'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">90 Tage Kursbegleiter</h3>
                <p className="text-xs text-slate-500 mt-1">Begleitet Sie zuverlässig durch den gesamten B2-Berufssprachkurs.</p>
              </div>

              <div className="flex items-baseline gap-1.5 flex-wrap">
                {plan3P.isDiscounted ? (
                  <>
                    <span className="text-sm font-bold text-slate-400 line-through whitespace-nowrap">
                      {plan3P.original}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {plan3P.display}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                    {plan3P.display}
                  </span>
                )}
                <span className="text-[11px] text-slate-500 font-bold">/ für 90 Tage</span>
              </div>
            </div>

            <Link
              to="/app/pricing?plan=complete_90d"
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs text-center shadow-md transition-colors cursor-pointer"
            >
              Plan wählen
            </Link>
          </div>

          {/* Plan 4: Lifetime Pass */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase rounded-full tracking-wider">
                {plan4P.isDiscounted ? `-${discountPercent}% Rabatt` : 'Aktion: -20%'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Lebenslanger Pass</h3>
                <p className="text-xs text-slate-500 mt-1">Einmal zahlen, unbegrenzt üben ohne zeitliche Begrenzung.</p>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                {plan4P.isDiscounted ? (
                  <>
                    <span className="text-xs text-slate-400 line-through font-bold">39,99 €</span>
                    <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                      {plan4P.display}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-slate-400 line-through font-bold">49,99 €</span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                      39,99 €
                    </span>
                  </>
                )}
                <span className="text-[11px] text-slate-500 font-bold">/ dauerhaft</span>
              </div>
            </div>

            <Link
              to="/app/pricing?plan=lifetime"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs text-center shadow-md transition-colors cursor-pointer"
            >
              Dauerhaft sichern
            </Link>
          </div>
        </div>

        {/* Security & Guarantee banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 text-center max-w-4xl mx-auto shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span>Sichere Bezahlung via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>100% DTB B2 Prüfungsstandard</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <span>Keine automatische Verlängerung</span>
          </div>
        </div>
      </main>
    </div>
  );
};
