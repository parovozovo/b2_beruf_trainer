import React, { useState, useEffect, useMemo } from 'react';
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
import type { User } from '../types';
import { getRemainingPremiumTimeLabel, getPromoCodesLocal, recordPromoStudentPurchase } from '../utils/storage';
import { openLegalModal } from './legal/LegalModal';

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  durationLabel: string;
  durationDays: number | null; // null = lifetime
  price: string;
  originalPrice?: string;
  billingPeriod: string;
  period?: string;
  description?: string;
  highlight?: boolean;
  popular?: boolean;
  savings?: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sprint_7d',
    name: 'Sprint-Woche',
    badge: '⚡ Schnellstart',
    durationLabel: '7 Tage Zugang',
    durationDays: 7,
    price: '9,99 €',
    billingPeriod: 'Einmalig für 7 Tage',
    features: [
      'Alle Modelltests 1–6 freigeschaltet',
      'Unbegrenzte KI-Korrekturen (Schreiben)',
      'Sprechen & Audio-Prüfungstrainer',
      'Vollständiger Wortschatz-Trainer',
    ],
  },
  {
    id: 'standard_30d',
    name: 'Standard-Monat',
    badge: '🏆 Empfohlen',
    durationLabel: '30 Tage Zugang',
    durationDays: 30,
    price: '15,99 €',
    billingPeriod: 'Einmalig für 30 Tage',
    popular: true,
    highlight: true,
    features: [
      'Alle Modelltests 1–6 + künftige Updates',
      'Unbegrenzte KI-Korrekturen & Detailfeedback',
      'Prüfungssimulation mit Timer & Punkten',
      'Detaillierte Fehleranalyse & Wortschatz-Export',
      'Sprechen Teil 1, 2 & 3 mit KI-Audio',
    ],
  },
  {
    id: 'complete_90d',
    name: 'Komplett-Quartal',
    badge: '🔥 Bester Wert',
    durationLabel: '90 Tage Zugang',
    durationDays: 90,
    price: '29,99 €',
    billingPeriod: 'Einmalig für 90 Tage',
    savings: 'Spare 37 % ggü. Monat',
    features: [
      'Alle Features aus Standard-Monat',
      '90 Tage unbegrenzter Vollzugriff',
      'Prioritäts-Support & neue Prüfungssets',
      'Umfassende Prüfungsvorbereitung telc B2',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime VIP',
    badge: '👑 Lebenslang',
    durationLabel: 'Dauerhafter Zugang',
    durationDays: null,
    price: '39,99 €',
    originalPrice: '49,99 €',
    billingPeriod: 'Einmalige Zahlung für immer',
    savings: 'Einmal zahlen, für immer nutzen',
    features: [
      'Lebenslanger Vollzugriff auf alle Inhalte',
      'Alle zukünftigen Modelltests inklusive',
      'Alle neuen Features & KI-Tools dauerhaft',
      'Höchste KI-Verarbeitungsgeschwindigkeit',
    ],
  },
];

interface SubscriptionPageProps {
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onActivateSubscription?: (planId: string, durationDays: number | null) => Promise<void> | void;
  onBackToApp?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  currentUser,
  onActivateSubscription: _onActivateSubscription,
  onOpenLoginModal,
  onNavigateToTab,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam && SUBSCRIPTION_PLANS.some((p) => p.id === planParam)) {
      return planParam;
    }
    return 'standard_30d';
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState<boolean>(false);
  const [justPurchasedPlan] = useState<SubscriptionPlan | null>(null);

  // Check for applied promo code or URL param or persisted pending promo
  const appliedCodeStr = useMemo(() => {
    return (
      currentUser?.appliedPromoCode ||
      new URLSearchParams(window.location.search).get('promo') ||
      (typeof window !== 'undefined' ? localStorage.getItem('b2_pending_promo') : '') ||
      ''
    );
  }, [currentUser?.appliedPromoCode]);

  const activePromo = useMemo(() => {
    if (!appliedCodeStr) return null;
    const promoCodes = getPromoCodesLocal();
    return promoCodes.find((p) => p.code.toUpperCase() === appliedCodeStr.toUpperCase() && p.active) || null;
  }, [appliedCodeStr]);

  const discountPercent = (activePromo?.category !== 'free_days' ? activePromo?.discountPercent : 0) || activePromo?.discountPercent || 0;

  const getPlanPrices = (plan: SubscriptionPlan) => {
    const baseNum = parseFloat(plan.price.replace(',', '.').replace(' €', ''));
    if (!discountPercent || discountPercent <= 0) {
      return {
        displayPrice: plan.price,
        originalPrice: plan.originalPrice,
        numericPrice: baseNum,
        isDiscounted: false,
        savedAmount: '0,00 €',
      };
    }
    const discountedNum = Math.round(baseNum * (1 - discountPercent / 100) * 100) / 100;
    const savedNum = Math.round((baseNum - discountedNum) * 100) / 100;
    return {
      displayPrice: `${discountedNum.toFixed(2).replace('.', ',')} €`,
      originalPrice: plan.price,
      numericPrice: discountedNum,
      isDiscounted: true,
      savedAmount: `${savedNum.toFixed(2).replace('.', ',')} €`,
    };
  };

  // Also react to search param changes if navigation occurs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam && SUBSCRIPTION_PLANS.some((p) => p.id === planParam)) {
      setSelectedPlanId(planParam);
    }
  }, []);

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const isAlreadyPremium = Boolean(currentUser?.isPremium);
  const remainingTime = getRemainingPremiumTimeLabel(currentUser);

  const handleCheckout = () => {
    if (!currentUser) {
      onOpenLoginModal();
      return;
    }

    setIsProcessing(true);

    if (activePromo && currentUser.email) {
      const planPrices = getPlanPrices(selectedPlan);
      recordPromoStudentPurchase(
        activePromo.code,
        currentUser.email,
        selectedPlan.id,
        selectedPlan.name,
        planPrices.numericPrice
      );
    }

    // Provide immediate user feedback and explain payment integration status
    setTimeout(() => {
      setIsProcessing(false);
      setShowComingSoonModal(true);
    }, 600);
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
              onClick={() => onNavigateToTab?.('tile_practice')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Zum Modul-Training</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab?.('full_exam')}
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
              onClick={() => onNavigateToTab?.('tile_practice')}
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

      {/* Celebratory Discount Banner */}
      {discountPercent > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/20 via-purple-500/15 to-indigo-500/20 rounded-3xl border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn max-w-4xl mx-auto">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/25 text-amber-500 dark:text-amber-300 flex items-center justify-center font-black text-2xl shrink-0 border border-amber-500/40 shadow-xs">
              🎉
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span>{discountPercent}% Lehrkraft-Rabatt aktiviert!</span>
                <span className="px-2 py-0.5 bg-amber-500/30 text-amber-800 dark:text-amber-300 rounded-md text-[10px] font-black uppercase">
                  Gutschein: {activePromo?.code}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {activePromo?.partnerName ? `Empfohlen von ${activePromo.partnerName}. ` : ''}
                Der Rabatt wurde automatisch auf alle Tarife angewendet.
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-2xl font-black text-xs shrink-0 shadow-md shadow-amber-500/20 uppercase tracking-wider">
            -{discountPercent}% Gekürzt
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const planPrices = getPlanPrices(plan);

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
              {(plan.badge || planPrices.isDiscounted) && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      planPrices.isDiscounted
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
                        : plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black'
                        : plan.id === 'lifetime'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-indigo-600 text-white font-bold'
                    }`}
                  >
                    {planPrices.isDiscounted ? `-${discountPercent}% Rabatt` : plan.badge}
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
                    {plan.description || plan.durationLabel}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {planPrices.isDiscounted ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-extrabold text-slate-400 dark:text-slate-500 line-through decoration-rose-500 decoration-[2.5px]">
                          {plan.price}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wide">
                          -{discountPercent}% Rabatt
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400 tracking-tight">
                          {planPrices.displayPrice}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          / {plan.period || plan.billingPeriod}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <span>⚡ Du sparst {planPrices.savedAmount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {plan.originalPrice && (
                        <span className="text-sm sm:text-base font-bold text-slate-400 line-through whitespace-nowrap">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                        {plan.price}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        / {plan.period || plan.billingPeriod}
                      </span>
                    </div>
                  )}
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

      {/* Unified Inclusions Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-4xl mx-auto shadow-xs space-y-2">
        <div className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
          ✨ In allen Tarifen 100% uneingeschränkt enthalten:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Alle 12 DTB-Prüfungsmodule</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 130-Min. Simulationen mit Timer</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 104+ Mustertexte & 67+ Sprech-Themen</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Spaced Repetition Wortschatz</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 100% Offline-fähig (PWA)</span>
        </div>
      </div>

      {/* Checkout Action Panel */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ihre Auswahl:</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5 flex-wrap">
              <span>{selectedPlan.name}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                ({getPlanPrices(selectedPlan).displayPrice})
              </span>
            </h4>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Gesamtbetrag (inkl. MwSt.):</span>
            <div className="flex items-baseline gap-1.5 justify-end">
              {getPlanPrices(selectedPlan).isDiscounted && (
                <span className="text-sm font-bold text-slate-400 line-through">
                  {selectedPlan.price}
                </span>
              )}
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {getPlanPrices(selectedPlan).displayPrice}
              </span>
            </div>
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
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-bold">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <CreditCard className="w-4 h-4 text-indigo-500" /> Sichere Online-Zahlung (Apple Pay, Google Pay, Karte)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
            <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Verschlüsselung
          </span>
          <span>•</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">
            🛡️ 100% Einmalzahlung (Kein Abo)
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

      {/* ================= PAYMENT INTEGRATION IN PROGRESS MODAL ================= */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <CreditCard className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-black inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> In Vorbereitung
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Online-Zahlung in Kürze verfügbar! 🚀
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Vielen Dank für Ihr Interesse am <strong>{selectedPlan.name}</strong> ({selectedPlan.price})! Die automatische Zahlungsabwicklung wird aktuell eingerichtet.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-left space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Alle freien Modelltests und Übungen stehen Ihnen <strong>sofort kostenlos</strong> zur Verfügung.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Haben Sie einen Promo-Gutschein? Diesen können Sie direkt in den <strong>Einstellungen</strong> aktivieren.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowComingSoonModal(false);
                  onNavigateToTab?.('tile_practice');
                }}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Zum kostenlosen Training
              </button>
              <button
                type="button"
                onClick={() => setShowComingSoonModal(false)}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-all cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
