import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Crown,
  ArrowRight,
  Star,
  Layers,
  Clock,
  Edit3,
  Mic,
  Smartphone,
  ChevronDown,
  Globe,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  Lock,
  FileText,
  Shield,
  Cookie,
  Landmark,
  Menu,
  X
} from 'lucide-react';
import { AppLogo } from '../AppLogo';
import {
  LANDING_LANGUAGES,
  LANDING_TRANSLATIONS,
  type LandingLang,
} from './landingContent';
import { LegalModal, type LegalTab } from '../legal/LegalModal';

import type { PromoCode } from '../../types';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  pendingPromo?: PromoCode | null;
  onOpenLoginModal?: (mode?: 'signin' | 'signup') => void;
  onOpenPromoBanner?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onToggleTheme,
  pendingPromo,
  onOpenLoginModal,
  onOpenPromoBanner,
}) => {
  // Mobile Menu Drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Language state (default DE or previous preference)
  const [lang, setLang] = useState<LandingLang>(() => {
    return (localStorage.getItem('b2_landing_lang') as LandingLang) || 'de';
  });

  const handleSetLang = (newLang: LandingLang) => {
    setLang(newLang);
    localStorage.setItem('b2_landing_lang', newLang);
  };

  const t = LANDING_TRANSLATIONS[lang] || LANDING_TRANSLATIONS.de;

  // Legal Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('agb');

  const handleOpenLegal = (tab: LegalTab) => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors overflow-x-hidden w-full max-w-full">
      
      {/* Top Sticky Promo Announcement Bar if promo is detected */}
      {pendingPromo && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-slate-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 sm:gap-4 flex-wrap z-50 sticky top-0">
          <span className="flex items-center gap-1.5 text-center">
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse text-slate-950" />
            <span>Aktionscode <strong>{pendingPromo.code}</strong> aktiv:</span>
            <span className="underline decoration-slate-950/40 font-extrabold">
              {pendingPromo.durationDays > 0
                ? `${pendingPromo.durationDays} Tage VIP-Premium geschenkt`
                : `-${pendingPromo.discountPercent}% Rabatt auf alle Tarife`}
            </span>
            {pendingPromo.partnerName && (
              <span className="opacity-80 font-semibold text-[11px] hidden md:inline">
                (Empfohlen von {pendingPromo.partnerName})
              </span>
            )}
          </span>
          <button
            onClick={() => onOpenPromoBanner ? onOpenPromoBanner() : onOpenLoginModal?.('signup')}
            className="px-3 py-1 bg-slate-950 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-transform active:scale-95 shrink-0 shadow-sm cursor-pointer"
          >
            Jetzt einlösen ➔
          </button>
        </div>
      )}

      {/* ================= HEADER / NAVBAR ================= */}
      <header className={`sticky ${pendingPromo ? 'top-8 sm:top-9' : 'top-0'} z-40 pt-safe bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors w-full`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 min-h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* App Brand with Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0">
            <div className="transition-transform group-hover:scale-105 duration-200 shrink-0">
              <AppLogo size={34} />
            </div>
            <span className="font-black text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[130px] sm:max-w-none">
              Beruf B2+ Trainer
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <a href="#vorteile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
              {t.nav.features}
            </a>
            <a href="#module" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
              {t.nav.modules}
            </a>
            <a href="#vergleich" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
              {t.nav.comparison}
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
              {t.nav.pricing}
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
              {t.nav.faq}
            </a>
            <Link to="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
              {t.nav.blog}
            </Link>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[11px] sm:text-xs font-bold shadow-2xs hover:border-indigo-500 transition-colors shrink-0">
              <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <select
                value={lang}
                onChange={(e) => handleSetLang(e.target.value as LandingLang)}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none"
              >
                {(Object.keys(LANDING_LANGUAGES) as LandingLang[]).map((k) => (
                  <option key={k} value={k} className="text-slate-900 bg-white dark:bg-slate-900 dark:text-white">
                    {LANDING_LANGUAGES[k].flag} {LANDING_LANGUAGES[k].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Design umschalten"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Primary Action Button (Desktop & Tablet >= md) */}
            <Link
              to="/app"
              className="hidden md:inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <span>{t.nav.ctaApp}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
              title="Menü"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Landing Navigation Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] z-30 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="lg:hidden relative z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-1.5 max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] overflow-y-auto pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.5rem))] shadow-2xl animate-fadeIn">
              <a
                href="#vorteile"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                ✨ {t.nav.features}
              </a>
              <a
                href="#module"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                🧩 {t.nav.modules}
              </a>
              <a
                href="#vergleich"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                ⚖️ {t.nav.comparison}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                💎 {t.nav.pricing}
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                ❓ {t.nav.faq}
              </a>
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                📚 {t.nav.blog}
              </Link>
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm text-center shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <span>{t.nav.ctaApp}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/60">
        
        {/* Dynamic Glow Auroras */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[380px] bg-gradient-to-tr from-indigo-500/20 via-purple-400/20 to-amber-400/15 dark:from-indigo-600/25 dark:via-purple-600/20 dark:to-transparent blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-amber-400/10 dark:bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
          <div className="text-center space-y-5 max-w-4xl mx-auto">
            
            {/* Clean Floating Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-black shadow-sm backdrop-blur-md hover:scale-105 transition-transform duration-300 cursor-default">
              <Crown className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {t.hero.h1Main}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400">
                {t.hero.h1Highlight}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-1 hover:shadow-2xl active:scale-95 cursor-pointer group"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#pricing"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>{t.hero.ctaSecondary}</span>
              </a>
            </div>

            {/* Trust Rating */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-400">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span>{t.hero.ratingText}</span>
            </div>
          </div>

          {/* Metric Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{t.hero.stat1Val}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.hero.stat1Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md transition-all duration-200">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">{t.hero.stat2Val}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.hero.stat2Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-md transition-all duration-200">
              <div className="text-2xl sm:text-3xl font-black text-emerald-500">{t.hero.stat3Val}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.hero.stat3Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-md transition-all duration-200">
              <div className="text-2xl sm:text-3xl font-black text-indigo-500">{t.hero.stat4Val}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.hero.stat4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOCK 2: PAIN & PROBLEM ================= */}
      <section id="vorteile" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.pain.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.pain.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-xs hover:border-rose-500/60 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pain.card1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.pain.card1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-xs hover:border-rose-500/60 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pain.card2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.pain.card2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-xs hover:border-rose-500/60 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pain.card3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.pain.card3Desc}
              </p>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="text-center pt-2">
            <a
              href="#module"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{t.pain.ctaButton}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= BLOCK 3: DIE 6 TRAININGSMODI ================= */}
      <section id="module" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" /> {t.modules.badge}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.modules.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.modules.subtitle}
            </p>
          </div>

          {/* 6 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Card 1: Kachel-Training */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-500/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {t.modules.card1Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.modules.card1Desc}
                </p>
              </div>
              <Link
                to="/app/training"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-600 dark:text-sky-400 group-hover:underline pt-2"
              >
                <span>{t.modules.card1Link}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2: Prüfungssimulation */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {t.modules.card2Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.modules.card2Desc}
                </p>
              </div>
              <Link
                to="/app/simulation"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 group-hover:underline pt-2"
              >
                <span>{t.modules.card2Link}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3: Schreibtrainer */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-500/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                  {t.modules.card3Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.modules.card3Desc}
                </p>
              </div>
              <Link
                to="/app/schreiben"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600 dark:text-rose-400 group-hover:underline pt-2"
              >
                <span>{t.modules.card3Link}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 4: Sprechtrainer */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {t.modules.card4Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.modules.card4Desc}
                </p>
              </div>
              <Link
                to="/app/sprechen"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:underline pt-2"
              >
                <span>{t.modules.card4Link}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 5: Wortschatz & Spaced Repetition */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-500/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  {t.modules.card5Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.modules.card5Desc}
                </p>
              </div>
              <Link
                to="/app/wortschatz"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-600 dark:text-purple-400 group-hover:underline pt-2"
              >
                <span>{t.modules.card5Link}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 6: 100% Offline App (PWA) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {t.modules.card6Title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t.modules.card6Desc}
                </p>
              </div>
              <Link
                to="/app/settings"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline pt-2"
              >
                <span>{t.modules.card6Link}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BLOCK 3.5: TESTIMONIALS & ERFOLGSGESCHICHTEN ================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> Erfolgsgeschichten & Feedback
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Von Lernenden empfohlen, von Lehrkräften geschätzt 🏆
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
              Über 92% unserer aktiven Nutzer bestehen den Deutsch-Test für den Beruf B2 beim ersten Versuch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Review 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    91% Punkte
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  «Ich habe den DTB B2 beim ersten Mal bestanden! Die 130-Minuten Simulationen und die Beschwerdebrief-Muster haben mir die Angst vor dem Schreiben komplett genommen.»
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  OM
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Olena M.</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Pflegefachkraft, München</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                    Medizin / B2
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  «Die Nomen-Verb-Verbindungen und der Schreibtrainer mit Wortzähler sind Gold wert. Viel praxisnäher als veraltete Lehrbücher.»
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  AK
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Dr. Alexey K.</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Assistenzarzt, Berlin</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    88% Schriftlich
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  «Sprachbausteine und Hören waren meine Schwachstellen. Dank der Offline-Funktion konnte ich jeden Tag 20 Minuten in der Bahn auf dem Smartphone üben.»
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  YD
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Yusuf D.</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Speditionskaufmann, Frankfurt</div>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    🎓 Dozentin
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  «Ich empfehle diesen Trainer allen meinen B2-Kursteilnehmern. Der Aufbau entspricht exakt dem offiziellen DTB-Testformat von BAMF und telc.»
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  AS
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Anna Schmidt</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">B2-Kursleiterin, Hamburg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOCK 4: VERGLEICHSTABELLE ================= */}
      <section id="vergleich" className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.comparison.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.comparison.subtitle}
            </p>
          </div>

          {/* Comparison Table: Beruf B2+ Trainer on FIRST column */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-slate-900 dark:text-white">
                  <th className="p-4 sm:p-5">{t.comparison.colFeature}</th>
                  <th className="p-4 sm:p-5 text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-indigo-950/40 border-x border-indigo-200 dark:border-indigo-800/60">
                    {t.comparison.colApp}
                  </th>
                  <th className="p-4 sm:p-5 text-slate-700 dark:text-slate-300 font-bold">{t.comparison.colTutor}</th>
                  <th className="p-4 sm:p-5 text-slate-700 dark:text-slate-300 font-bold">{t.comparison.colBooks}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowPrice}</td>
                  <td className="p-4 sm:p-5 font-black text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60 whitespace-nowrap">
                    {t.comparison.rowAppPrice}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowTutorPrice}</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowBooksPrice}</td>
                </tr>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowAccess}</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    {t.comparison.rowAppAccess}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowTutorAccess}</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowBooksAccess}</td>
                </tr>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowSim}</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    {t.comparison.rowAppSim}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowTutorSim}</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowBooksSim}</td>
                </tr>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowAudio}</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    {t.comparison.rowAppAudio}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowTutorAudio}</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowBooksAudio}</td>
                </tr>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowTemplates}</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    {t.comparison.rowAppTemplates}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowTutorTemplates}</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowBooksTemplates}</td>
                </tr>
                <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowSrs}</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    {t.comparison.rowAppSrs}
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowTutorSrs}</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">{t.comparison.rowBooksSrs}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= BLOCK 5: PRICING / TARIFE ================= */}
      <section id="pricing" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-black">
              <Crown className="w-3.5 h-3.5 text-amber-500" /> {t.pricing.badge}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.pricing.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.pricing.subtitle}
            </p>
          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
            
            {/* Plan 1: 7 Days */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{t.pricing.plan1Name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {t.pricing.plan1Desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {t.pricing.plan1Price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      / {t.pricing.plan1Period}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/app/pricing?plan=sprint_7d"
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs text-center transition-all cursor-pointer active:scale-95"
              >
                {t.pricing.btnSelect}
              </Link>
            </div>

            {/* Plan 2: 30 Days (Bestseller) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-xl ring-4 ring-indigo-500/15 flex flex-col justify-between space-y-6 relative transform md:-translate-y-1 hover:-translate-y-2 transition-all duration-300">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                  {t.pricing.plan2Badge}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{t.pricing.plan2Name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {t.pricing.plan2Desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {t.pricing.plan2Price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      / {t.pricing.plan2Period}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/app/pricing?plan=standard_30d"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs text-center shadow-md flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>{t.pricing.btnUnlock}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Plan 3: 90 Days */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3.5 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                  {t.pricing.plan3Badge}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{t.pricing.plan3Name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {t.pricing.plan3Desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {t.pricing.plan3Price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      / {t.pricing.plan3Period}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/app/pricing?plan=complete_90d"
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs text-center transition-all cursor-pointer active:scale-95"
              >
                {t.pricing.btnSelect}
              </Link>
            </div>

            {/* Plan 4: Lifetime */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                  {t.pricing.plan4Badge}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{t.pricing.plan4Name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    {t.pricing.plan4Desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {t.pricing.plan4OldPrice && (
                      <span className="text-sm sm:text-base font-bold text-slate-400 line-through whitespace-nowrap">
                        {t.pricing.plan4OldPrice}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {t.pricing.plan4Price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      / {t.pricing.plan4Period}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/app/pricing?plan=lifetime"
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs text-center transition-all cursor-pointer active:scale-95"
              >
                {t.pricing.btnSelect}
              </Link>
            </div>

          </div>

          {/* Unified Inclusions Banner on Landing */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-4xl mx-auto shadow-xs space-y-2">
            <div className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              ✨ {t.pricing.allIncludedTitle}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.pricing.allIncludedItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Central Payment CTA Button to in-app Pricing */}
          <div className="text-center pt-2">
            <Link
              to="/app/pricing"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{t.pricing.mainCta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Payment Badges strip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-3xl mx-auto space-y-2 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-indigo-500" /> Sichere Online-Zahlung (Apple Pay, Google Pay, Karte)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Verschlüsselung
              </span>
              <span>•</span>
              <span className="text-slate-900 dark:text-white font-bold">
                🛡️ 100% Einmalzahlung (Kein Abo)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOCK 6: FAQ ================= */}
      <section id="faq" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.faq.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.faq.subtitle}
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {t.faq.items.map((faqItem, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-black text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faqItem.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180 text-indigo-500' : 'text-slate-400'
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium border-t border-slate-100 dark:border-slate-800/80 pt-3 animate-fadeIn">
                    {faqItem.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BLOCK 7: FINAL HEROIC CTA ================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-amber-50/50 dark:bg-gradient-to-r dark:from-indigo-950/90 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white border-2 border-indigo-200 dark:border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl dark:shadow-2xl relative overflow-hidden">
            
            {/* Background shimmer */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 text-center md:text-left relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-black uppercase shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t.finalCta.badge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {t.finalCta.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                {t.finalCta.subtitle}
              </p>
            </div>

            <Link
              to="/app"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 shrink-0 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative z-10"
            >
              <span>{t.finalCta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER WITH LEGAL LINKS ================= */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <AppLogo size={32} />
              <div>
                <span className="font-black text-slate-900 dark:text-white text-sm">Beruf B2+ Trainer</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t.footer.desc}
                </p>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-bold text-slate-600 dark:text-slate-400">
              <button
                type="button"
                onClick={() => handleOpenLegal('agb')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.footer.agb}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegal('datenschutz')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t.footer.datenschutz}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegal('cookies')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>{t.footer.cookies}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegal('impressum')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>{t.footer.impressum}</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} Beruf B2+ Trainer. {t.footer.rights}</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" /> {t.footer.trust}
            </span>
          </div>
        </div>
      </footer>

      {/* Universal Legal Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

    </div>
  );
};
