import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Star,
  Volume2,
  FileText,
  MessageSquare,
  Clock,
  Layers,
  ChevronDown,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  CreditCard,
  Zap,
} from 'lucide-react';
import { AppLogo } from '../AppLogo';
import {
  LANDING_LANGUAGES,
  LANDING_TRANSLATIONS,
  type LandingLang,
} from './landingContent';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onToggleTheme,
}) => {
  // Language state (default DE or previous preference)
  const [lang, setLang] = useState<LandingLang>(() => {
    return (localStorage.getItem('b2_landing_lang') as LandingLang) || 'de';
  });

  const handleSetLang = (newLang: LandingLang) => {
    setLang(newLang);
    localStorage.setItem('b2_landing_lang', newLang);
  };

  const t = LANDING_TRANSLATIONS[lang] || LANDING_TRANSLATIONS.de;

  // Interactive Demo State (Screen 4)
  const [activeDemoTab, setActiveDemoTab] = useState<'hoeren' | 'wortschatz' | 'schreiben' | 'sprechen'>('hoeren');
  const [demoSelectedAnswer, setDemoSelectedAnswer] = useState<string | null>(null);
  const [demoIsFlipped, setDemoIsFlipped] = useState<boolean>(false);
  const [demoAudioPlaying, setDemoAudioPlaying] = useState<boolean>(false);

  // FAQ Open items state (Screen 7)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-600 selection:text-white transition-colors">
      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* App Brand with Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <AppLogo size={38} />
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 text-slate-900 dark:text-white">
                <span>Beruf B2+</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  Trainer
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <a href="#vorteile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.nav.features}
            </a>
            <a href="#inhalte" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.nav.whatInside}
            </a>
            <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.nav.howItWorks}
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.nav.pricing}
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.nav.faq}
            </a>
            <Link to="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.nav.blog}
            </Link>
          </nav>

          {/* Right Header Controls: Language Selector, Theme Toggle, Demo CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <select
                value={lang}
                onChange={(e) => handleSetLang(e.target.value as LandingLang)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-none"
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
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title="Design umschalten"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* CTA to App */}
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>{t.nav.ctaDemo}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= SCREEN 1: HERO SECTION (ГАЧОК) ================= */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200 dark:border-slate-800/80">
        {/* Background glow effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/15 dark:bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
          <div className="text-center space-y-5 max-w-4xl mx-auto">
            {/* Pre-headline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{t.hero.preHeadline}</span>
            </div>

            {/* Main Headline H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {t.hero.h1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400">
                {t.hero.h1Highlight}
              </span>
              {t.hero.h1After}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>

            {/* Conversion CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#pricing"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.hero.ctaSecondary}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Trust Factor Rating */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-400">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span>{t.hero.trustText}</span>
            </div>
          </div>

          {/* Metric Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{t.hero.badge1Val}</div>
              <div className="text-xs font-bold text-slate-500">{t.hero.badge1Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">{t.hero.badge2Val}</div>
              <div className="text-xs font-bold text-slate-500">{t.hero.badge2Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-rose-500">{t.hero.badge3Val}</div>
              <div className="text-xs font-bold text-slate-500">{t.hero.badge3Label}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-500">{t.hero.badge4Val}</div>
              <div className="text-xs font-bold text-slate-500">{t.hero.badge4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SCREEN 2: PAIN & PROBLEM (БІЛЬ І ПРОБЛЕМА) ================= */}
      <section id="vorteile" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.pain.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-sm hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pain.card1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.pain.card1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-sm hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pain.card2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.pain.card2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-sm hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pain.card3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.pain.card3Desc}
              </p>
            </div>
          </div>

          {/* Conclusion Banner */}
          <div className="p-6 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-center max-w-3xl mx-auto space-y-1">
            <span className="text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-300">
              💡 {t.pain.conclusion}
            </span>
          </div>
        </div>
      </section>

      {/* ================= SCREEN 3: WHAT'S INSIDE (ЩО ВСЕРЕДИНІ) ================= */}
      <section id="inhalte" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.inside.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.inside.subtitle}
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.inside.item1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.inside.item1Desc}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.inside.item2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.inside.item2Desc}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.inside.item3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.inside.item3Desc}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.inside.item4Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {t.inside.item4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SCREEN 4: INTERACTIVE SNEAK PEEK DEMO (ДЕМОНСТРАЦІЯ) ================= */}
      <section id="demo" className="py-16 sm:py-24 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black">
              <Zap className="w-3.5 h-3.5" /> Live-Vorschau
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.preview.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.preview.subtitle}
            </p>
          </div>

          {/* Interactive Tab Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveDemoTab('hoeren')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === 'hoeren'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-black scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t.preview.tabHoeren}
            </button>
            <button
              onClick={() => setActiveDemoTab('wortschatz')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === 'wortschatz'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t.preview.tabWortschatz}
            </button>
            <button
              onClick={() => setActiveDemoTab('schreiben')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === 'schreiben'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-black scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t.preview.tabSchreiben}
            </button>
            <button
              onClick={() => setActiveDemoTab('sprechen')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeDemoTab === 'sprechen'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-black scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {t.preview.tabSprechen}
            </button>
          </div>

          {/* Interactive Demo Content Box */}
          <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 shadow-2xl p-6 sm:p-8 space-y-6">
            {activeDemoTab === 'hoeren' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                    Modelltest 01 · Hören Teil 1
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">⏱️ 08:42 min verbleibend</span>
                </div>

                {/* Simulated Audio Player */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDemoAudioPlaying(!demoAudioPlaying)}
                      className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow transition-transform active:scale-95 cursor-pointer"
                    >
                      {demoAudioPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{t.preview.hoerenTitle}</div>
                      <div className="text-[11px] text-slate-500">{t.preview.hoerenAudioDesc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">01:14 / 02:40</span>
                </div>

                {/* Interactive Question */}
                <div className="space-y-3">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    1. {t.preview.hoerenQuestion}
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'a', text: t.preview.hoerenOptA, isCorrect: false },
                      { id: 'b', text: t.preview.hoerenOptB, isCorrect: true },
                      { id: 'c', text: t.preview.hoerenOptC, isCorrect: false },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setDemoSelectedAnswer(opt.id)}
                        className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-between ${
                          demoSelectedAnswer === opt.id
                            ? opt.isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-300'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {demoSelectedAnswer === opt.id && (
                          <span>{opt.isCorrect ? '✅ Richtig (+1 Punkt)' : '❌ Falsch'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === 'wortschatz' && (
              <div className="space-y-4 animate-fadeIn text-center">
                <div className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                  SRS Flashcard · Nomen-Verb-Verbindung
                </div>

                {/* Interactive Flip Card */}
                <div
                  onClick={() => setDemoIsFlipped(!demoIsFlipped)}
                  className="min-h-[220px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/40 shadow-md cursor-pointer select-none flex flex-col justify-between hover:border-emerald-500 transition-all"
                >
                  {!demoIsFlipped ? (
                    <div className="my-auto space-y-3">
                      <span className="text-xs font-extrabold text-slate-500">{t.preview.wortschatzFrontPrompt}</span>
                      <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                        "{t.preview.wortschatzFrontMeaning}"
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs italic font-medium text-slate-700 dark:text-slate-300">
                        "{t.preview.wortschatzFrontGap}"
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto space-y-3 animate-fadeIn text-left">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">✓ Lösung:</span>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {t.preview.wortschatzBackTerm}
                      </div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        👉 {t.preview.wortschatzBackMeaning}
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs font-medium">
                        "{t.preview.wortschatzBackExample}"
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 pt-2">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{t.preview.wortschatzClickToFlip}</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === 'schreiben' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">
                  {t.preview.schreibenTitle}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.preview.schreibenPrompt}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-extrabold">
                  {t.preview.schreibenPhases.map((phase, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20">
                      {phase}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemoTab === 'sprechen' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-xs font-black uppercase text-rose-600 dark:text-rose-400">
                  {t.preview.sprechenTitle}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="font-bold">{t.preview.sprechenPrompt}</div>
                  <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400">{t.preview.sprechenTimer}</div>
                </div>
              </div>
            )}

            {/* Bottom CTA in demo */}
            <div className="pt-2 text-center">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>{t.nav.ctaDemo}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SCREEN 5: PRICE ANCHORING (ПОРІВНЯННЯ) ================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.comparison.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.comparison.subtitle}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-slate-900 dark:text-white">
                  <th className="p-4 sm:p-5">{t.comparison.colFeature}</th>
                  <th className="p-4 sm:p-5 text-slate-500">{t.comparison.colTutor}</th>
                  <th className="p-4 sm:p-5 text-slate-500">{t.comparison.colBooks}</th>
                  <th className="p-4 sm:p-5 text-indigo-600 dark:text-indigo-400 font-black bg-indigo-500/10">
                    {t.comparison.colApp}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowPrice}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowTutorPrice}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowBooksPrice}</td>
                  <td className="p-4 sm:p-5 font-black text-emerald-600 dark:text-emerald-400 bg-indigo-500/5">
                    {t.comparison.rowAppPrice}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowAccess}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowTutorAccess}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowBooksAccess}</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-500/5">
                    {t.comparison.rowAppAccess}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowAudio}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowTutorAudio}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowBooksAudio}</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-500/5">
                    {t.comparison.rowAppAudio}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowSpeaking}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowTutorSpeaking}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowBooksSpeaking}</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-500/5">
                    {t.comparison.rowAppSpeaking}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">{t.comparison.rowSrs}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowTutorSrs}</td>
                  <td className="p-4 sm:p-5 text-slate-500">{t.comparison.rowBooksSrs}</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-500/5">
                    {t.comparison.rowAppSrs}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= SCREEN 6: PRICING (ТАРИФИ) ================= */}
      <section id="pricing" className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.pricing.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t.pricing.subtitle}
            </p>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Plan 1: 14 Days */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pricing.plan1Name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t.pricing.plan1Desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t.pricing.plan1Price}</span>
                  <span className="text-[11px] text-slate-500 font-bold">/ {t.pricing.plan1Period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {t.pricing.features1.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/app"
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs text-center transition-all cursor-pointer"
              >
                {t.pricing.btnStart}
              </Link>
            </div>

            {/* Plan 2: 30 Days (Full Prep - Featured Bestseller) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-2 border-amber-500 text-white shadow-2xl flex flex-col justify-between space-y-6 relative transform md:-translate-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow">
                  {t.pricing.plan2Badge}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black">{t.pricing.plan2Name}</h3>
                  <p className="text-xs text-slate-300 mt-1">{t.pricing.plan2Desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">{t.pricing.plan2Price}</span>
                  <span className="text-[11px] text-emerald-400 font-bold">/ {t.pricing.plan2Period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-white/10">
                  {t.pricing.features2.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/app"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>{t.pricing.btnUnlock}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Plan 3: Lifetime */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.pricing.plan3Name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t.pricing.plan3Desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t.pricing.plan3Price}</span>
                  <span className="text-[11px] text-slate-500 font-bold">/ {t.pricing.plan3Period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {t.pricing.features3.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/app"
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-xs text-center transition-all cursor-pointer"
              >
                {t.pricing.btnLifetime}
              </Link>
            </div>
          </div>

          {/* Payment Badges strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-2 text-xs font-bold text-slate-500">
            <div>🔒 {t.pricing.paymentTitle}</div>
            <div className="flex items-center justify-center gap-4 text-sm font-black text-slate-700 dark:text-slate-300">
              <span>💳 Visa</span>
              <span>💳 Mastercard</span>
              <span>🍎 Apple Pay</span>
              <span>🌐 Google Pay</span>
              <span>🅿️ PayPal</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SCREEN 7: FAQ (ЧАСТІ ЗАПИТАННЯ) ================= */}
      <section id="faq" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
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
            {[
              { q: t.faq.q1, a: t.faq.a1 },
              { q: t.faq.q2, a: t.faq.a2 },
              { q: t.faq.q3, a: t.faq.a3 },
              { q: t.faq.q4, a: t.faq.a4 },
            ].map((faqItem, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-black text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>{faqItem.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
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

      {/* ================= SCREEN 8: FOOTER & LEAD MAGNET (ФУТЕР) ================= */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Lead Magnet Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white">{t.footer.leadTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{t.footer.leadSubtitle}</p>
            </div>
            <Link
              to="/app"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 shrink-0 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <span>{t.footer.leadCta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bottom Links */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AppLogo size={24} />
              <span className="font-black text-slate-900 dark:text-white">Beruf B2+ Trainer</span>
              <span>{t.footer.rights}</span>
            </div>

            <div className="flex items-center gap-6 font-bold">
              <Link to="/app" className="hover:text-indigo-500">App</Link>
              <Link to="/blog" className="hover:text-indigo-500">Blog</Link>
              <a href="#pricing" className="hover:text-indigo-500">Pricing</a>
              <a href="#faq" className="hover:text-indigo-500">FAQ</a>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-600 text-center md:text-left">
            {t.footer.disclaimer}
          </div>
        </div>
      </footer>
    </div>
  );
};
