import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Clock,
  Check,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { User } from '../types';
import { getRemainingPremiumTimeLabel } from '../utils/storage';
import { openLegalModal } from './legal/LegalModal';

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  originalPrice?: string;
  period: string;
  durationDays: number | null; // null for lifetime
  description: string;
  popular?: boolean;
  features: string[];
}

const COMMON_FEATURES = [
  'Voller Zugriff auf alle 12 Prüfungsteile',
  'Unbegrenzte Modelltest-Simulationen mit Timer',
  'Alle 104+ Forenbeiträge & 67+ Sprechen-Themen',
  'Vollständiges Wortschatz-Training mit Spaced Repetition',
  '100% Offline-fähig (PWA auf Smartphone & PC)',
];

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sprint_7d',
    name: '7 Tage Sprint-Pass',
    price: '9,99 €',
    period: 'für 7 Tage',
    durationDays: 7,
    description: '1 Woche voller Zugriff. Ideal für den schnellen Endspurt vor dem Prüfungstermin.',
    features: COMMON_FEATURES,
  },
  {
    id: 'standard_30d',
    name: '30 Tage Standard-Pass',
    badge: 'Bestseller',
    price: '15,99 €',
    period: 'für 30 Tage',
    durationDays: 30,
    popular: true,
    description: '1 Monat voller Zugriff. Die beliebteste Wahl für eine gründliche und stressfreie Vorbereitung.',
    features: COMMON_FEATURES,
  },
  {
    id: 'complete_90d',
    name: '90 Tage Kursbegleiter',
    badge: 'Spart 38%',
    price: '29,99 €',
    period: 'für 90 Tage',
    durationDays: 90,
    description: '3 Monate voller Zugriff. Begleitet Sie zuverlässig durch den gesamten B2-Berufssprachkurs.',
    features: COMMON_FEATURES,
  },
  {
    id: 'lifetime',
    name: 'Lebenslanger Pass',
    badge: 'Aktion: -20%',
    price: '39,99 €',
    originalPrice: '49,99 €',
    period: 'dauerhaft',
    durationDays: null,
    description: 'Einmal zahlen, unbegrenzt üben ohne zeitliche Begrenzung bis zum sicheren Bestehen.',
    features: [
      'Dauerhafter unbegrenzter Zugang ohne Ablaufdatum',
      'Alle 12 Prüfungsteile & zukünftige Modelltests',
      'Unbegrenzte Prüfungssimulationen mit Timer',
      'Alle Forenbeiträge, Sprech-Themen & Wortschatz',
      '100% Offline-fähig auf allen Geräten',
    ],
  },
];

interface SubscriptionPageProps {
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onActivateSubscription: (planId: string, durationDays: number | null) => void;
  onNavigateToTab: (tab: string) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  currentUser,
  onOpenLoginModal,
  onActivateSubscription,
  onNavigateToTab,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard_30d');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [justPurchasedPlan, setJustPurchasedPlan] = useState<SubscriptionPlan | null>(null);

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const isAlreadyPremium = Boolean(currentUser?.isPremium);
  const remainingTime = getRemainingPremiumTimeLabel(currentUser);

  const handleCheckout = () => {
    if (!currentUser) {
      onOpenLoginModal();
      return;
    }

    setIsProcessing(true);

    // Simulate seamless checkout processing
    setTimeout(() => {
      setIsProcessing(false);
      setJustPurchasedPlan(selectedPlan);
      onActivateSubscription(selectedPlan.id, selectedPlan.durationDays);

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  // IF USER ALREADY HAS ACTIVE PREMIUM AND NOT IN SUCCESS PURCHASE STATE
  if (isAlreadyPremium && !justPurchasedPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
        {/* Active Premium Card */}
        <div className="p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/40 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm">
            <Crown className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Premium-Status aktiv
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Sie haben bereits vollen Premium-Zugriff! 👑
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
              Alle 12 Prüfungsteile, unbegrenzte Simulationen, Wortschatz-Karten und Musterlösungen sind für Sie uneingeschränkt freigeschaltet.
            </p>
          </div>

          {/* Status Details */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">Verbleibende Laufzeit:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{remainingTime}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToTab('tile_practice')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Zum Modul-Training</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('full_exam')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Prüfungssimulation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE DIRECTLY AFTER PURCHASE
  if (justPurchasedPlan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fadeIn">
        <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/50 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl animate-bounce">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /> Erfolgreich aktiviert
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Herzlichen Glückwunsch! 🎉
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto">
              Ihr <strong>{justPurchasedPlan.name}</strong> wurde erfolgreich aktiviert. Sie haben ab sofort uneingeschränkten Zugriff auf alle Inhalte.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 max-w-md mx-auto text-left">
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
              <span>Paket:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{justPurchasedPlan.name}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
              <span>Gültigkeit:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {justPurchasedPlan.durationDays ? `${justPurchasedPlan.durationDays} Tage` : 'Dauerhaft unbegrenzt'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('tile_practice')}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Jetzt mit dem Training starten</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-14 space-y-10 animate-fadeIn">
      
      {/* Hero Header */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-2xs">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Deutsch B2 Beruf (DTB) Prüfungspass</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Bestehen Sie Ihre B2-Beruf-Prüfung beim ersten Versuch! 🚀
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Wählen Sie den passenden Vorbereitungspass. Sofortiger Zugriff auf alle 12 Prüfungsteile, authentische Prüfungssimulationen, 104+ Musterbriefe und unbegrenztes Wortschatztraining.
        </p>

        {/* Guarantees Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-bold text-slate-600 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> 100% Offline-fähig (PWA)
          </span>
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Zap className="w-4 h-4 shrink-0" /> Sofortige Freischaltung
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 shrink-0" /> Keine automatische Verlängerung
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative p-6 sm:p-7 rounded-3xl transition-all cursor-pointer flex flex-col justify-between border-2 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-xl ring-4 ring-indigo-500/15 -translate-y-1'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              {/* Popular / Discount Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
                        : plan.id === 'lifetime'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-indigo-600 text-white font-bold'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {/* Plan Header */}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {plan.originalPrice && (
                      <span className="text-sm sm:text-base font-bold text-slate-400 line-through whitespace-nowrap">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                      {plan.price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">/ {plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Bottom Radio */}
              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanId(plan.id);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-white' : 'border-slate-400'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span>{isSelected ? 'Ausgewählt' : 'Diesen Tarif wählen'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Action Panel */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ihre Auswahl:</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5 flex-wrap">
              <span>{selectedPlan.name}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">({selectedPlan.price})</span>
            </h4>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Gesamtbetrag (inkl. MwSt.):</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{selectedPlan.price}</span>
          </div>
        </div>

        {/* Primary Checkout Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Zahlung wird verarbeitet...</span>
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Jetzt sicher freischalten ({selectedPlan.price})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {!currentUser && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-bold">
              * Sie werden vor der Zahlung gebeten, sich kurz einzuloggen oder zu registrieren, damit Ihr Zugang gesichert ist.
            </p>
          )}

          {/* Legal notice regarding digital contents */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-tight">
            Mit dem Klick auf „Jetzt sicher freischalten“ akzeptieren Sie unsere{' '}
            <button
              type="button"
              onClick={() => openLegalModal('agb')}
              className="text-indigo-600 dark:text-indigo-400 underline font-bold cursor-pointer"
            >
              AGB & Widerrufsverzicht
            </button>{' '}
            für digitale Inhalte sowie die{' '}
            <button
              type="button"
              onClick={() => openLegalModal('datenschutz')}
              className="text-indigo-600 dark:text-indigo-400 underline font-bold cursor-pointer"
            >
              Datenschutzerklärung
            </button>.
          </p>
        </div>

        {/* Payment Methods Trust Banner */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Apple Pay / Google Pay
          </span>
          <span>•</span>
          <span>Visa & Mastercard</span>
          <span>•</span>
          <span>Klarna / Sofort</span>
          <span>•</span>
          <span>PayPal</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
          </span>
        </div>
      </div>

      {/* Feature Comparison Section */}
      <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white text-center">
          Warum Beruf B2+ Trainer die beste Vorbereitung ist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-4 bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Alle 12 DTB-Prüfungsmodule</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Lesen 1–4, Hören 1–4, Lesen & Schreiben, Hören & Schreiben sowie Sprachbausteine 1 & 2 im Original-Prüfungsformat.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Echte Simulation mit Timer</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Üben Sie das 130-Minuten-Zeitmanagement unter realen Prüfungsbedingungen inklusive automatischer Punkteauswertung.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">Spaced Repetition Wortschatz</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Intelligenter Algorithmus für berufsspezifisches B2-Vokabular mit Nomen-Verb-Verbindungen und Beispielsätzen.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
