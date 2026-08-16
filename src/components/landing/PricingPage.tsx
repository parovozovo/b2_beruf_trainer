import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, ShieldCheck, Award, Star } from 'lucide-react';
import type { User } from '../../types';

interface PricingPageProps {
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onOpenPromoModal: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  currentUser,
  onOpenLoginModal,
  onOpenPromoModal,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white font-black">
              B2
            </div>
            <span className="font-black tracking-tight text-slate-900 dark:text-white">Beruf B2+</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/app" className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 hover:text-indigo-600">
              Zum Trainer
            </Link>
            {currentUser ? (
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {currentUser.name}
              </span>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-md"
              >
                Anmelden
              </button>
            )}
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
            Wählen Sie den passenden Plan für Ihren Prüfungserfolg
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Bereiten Sie sich effizient auf die telc / DTB B2 Beruf Prüfung vor. Keine versteckten Abofallen.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan 1: Free Starter */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Kostenloser Einstieg</h3>
                <p className="text-xs text-slate-500 mt-1">Perfekt zum Kennenlernen und Ausprobieren der Plattform.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">0€</span>
                <span className="text-xs text-slate-500 font-bold">/ dauerhaft kostenlos</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zugriff auf Basis-Modelltests (Teil 1)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Wortschatz-Lexikon & Suche (385+ Begriffe)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Audio-Aussprache & 5-Sprachen-Übersetzung</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Grundlegende Redemittel-Übersicht</span>
                </li>
              </ul>
            </div>

            <Link
              to="/app"
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs text-center transition-colors cursor-pointer"
            >
              Kostenlos üben
            </Link>
          </div>

          {/* Plan 2: Pro Premium (Highlighted) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/90 to-slate-900 border-2 border-indigo-500 text-white shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow">
                Beliebteste Wahl
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <span>Premium Komplettpaket</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-300 mt-1">Vollständiger Zugriff auf alle 12+ Modelltests & Trainer.</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">19,99€</span>
                <span className="text-xs text-slate-300 line-through">39,99€</span>
                <span className="text-xs text-emerald-400 font-bold">/ Einmalig (Lifetime)</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-200 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Alle 12+ vollständigen Modelltests (Lesen & Hören)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Spaced Repetition (SRS) Karteikarten-Trainer</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Schreibtrainer für Beschwerdebriefe & Forumsbeiträge</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mündliche Prüfungssimulation (Teil 1A/B, 2, 3)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Detaillierte Fehleranalyse & Lernstatistik</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                to="/app"
                className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs sm:text-sm text-center shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Jetzt Premium freischalten</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center">
                <button
                  type="button"
                  onClick={onOpenPromoModal}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                >
                  Gutschein- / Rabattcode einlösen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Guarantee banner */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 text-center max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span>Sichere Bezahlung via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Offizielles telc / BAMF Prüfungsformat</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-500" />
            <span>Lebenslanger Zugriff ohne Abo</span>
          </div>
        </div>
      </main>
    </div>
  );
};
