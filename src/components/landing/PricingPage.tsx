import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Award, Star, CheckCircle2 } from 'lucide-react';
import { AppLogo } from '../AppLogo';

interface PricingPageProps {
  onOpenPromoModal: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onOpenPromoModal,
}) => {
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
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

        {/* Pricing Cards Grid (3 Packages) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Plan 1: 14 Days Sprint */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">14 Tage Sprint</h3>
                <p className="text-xs text-slate-500 mt-1">Perfekt für die intensive Endphase kurz vor dem Prüfungstermin.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">€14.99</span>
                <span className="text-[11px] text-slate-500 font-bold">/ 14 Tage Zugang</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Alle 12 Modelltests (Lesen, Hören, Grammatik)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>385 Wortschatzkarten mit Wiederholungslogik</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Muttersprachliche Audioaufnahmen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Detaillierte Fehleranalyse</span>
                </li>
              </ul>
            </div>

            <Link
              to="/app"
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs text-center transition-colors cursor-pointer"
            >
              14 Tage starten
            </Link>
          </div>

          {/* Plan 2: 30 Days Full Prep (Featured) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-2 border-amber-500 text-white shadow-2xl space-y-6 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow">
                🔥 Beliebteste Wahl
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <span>30 Tage Full Prep</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-300 mt-1">Umfassende und strukturierte Vorbereitung auf alle Prüfungsteile.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-white">€24.99</span>
                <span className="text-[11px] text-emerald-400 font-bold">/ 30 Tage Zugang</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Alle 12 Modelltests in voller Länge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">92 Forumsbeitrag- & Schreibthemen mit Bausteinen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>171 Sprechsituationen für Teil 2 & Teil 3</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interaktiver Wortschatz SRS-Trainer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prioritäts-Support</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                to="/app"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>30 Tage Full Prep freischalten</span>
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

          {/* Plan 3: Lifetime */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Lifetime Zugang</h3>
                <p className="text-xs text-slate-500 mt-1">Dauerhafter unbegrenzter Zugriff ohne Zeitbegrenzung.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">€49.99</span>
                <span className="text-[11px] text-slate-500 font-bold">/ Einmalig</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Lebenslanger unbegrenzter Zugang</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Alle aktuellen & künftigen Modelltests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Alle 92 Schreibthemen + 171 Sprechthemen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Offline PWA-Nutzung auf dem Smartphone</span>
                </li>
              </ul>
            </div>

            <Link
              to="/app"
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs text-center transition-colors cursor-pointer"
            >
              Lifetime Zugang sichern
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
