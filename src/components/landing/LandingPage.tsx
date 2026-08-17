import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Crown,
  BookOpen,
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
  Landmark
} from 'lucide-react';
import { AppLogo } from '../AppLogo';
import {
  LANDING_LANGUAGES,
  type LandingLang,
} from './landingContent';
import { LegalModal, type LegalTab } from '../legal/LegalModal';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors">
      
      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* App Brand with Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <AppLogo size={38} />
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Beruf B2+ Trainer
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <a href="#vorteile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Vorteile
            </a>
            <a href="#module" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Module & Modi
            </a>
            <a href="#vergleich" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Vergleich
            </a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Preise
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              FAQ
            </a>
            <Link to="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Blog
            </Link>
          </nav>

          {/* Right Header Controls: Language Selector, Theme Toggle, App CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold">
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
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Primary Action Button */}
            <Link
              to="/app"
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer shrink-0"
            >
              <span>Jetzt ausprobieren</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-slate-800/80">
        {/* Ambient glow effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
          <div className="text-center space-y-5 max-w-4xl mx-auto">
            
            {/* Clean Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-black shadow-xs">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Der interaktive DTB B2-Beruf Prüfungstrainer</span>
            </div>

            {/* Main Headline H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Bestehen Sie Ihre B2-Beruf-Prüfung{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:to-emerald-400">
                beim ersten Versuch!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto">
              12 interaktive Prüfungsmodule, echte 130-Minuten-Simulationen mit Timer, 104+ Musterbriefe & Notizen sowie intelligentes Wortschatztraining – 100% offline-fähig auf Smartphone & PC.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>🚀 Jetzt kostenlos ausprobieren</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#pricing"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Tarife & Preise ansehen</span>
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
              <span>5.0 Sterne von erfolgreichen Prüfungsteilnehmern</span>
            </div>
          </div>

          {/* Metric Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">12</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">DTB-Prüfungsteile</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">130 Min.</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Original-Countdown</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-500">104+</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Musterlösungen Q58</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-indigo-500">100%</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Offline-fähig (PWA)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOCK 2: PAIN & PROBLEM ================= */}
      <section id="vorteile" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Warum über 40% der Teilnehmer beim ersten Versuch scheitern
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Die B2-Beruf-Prüfung verlangt nicht nur Grammatik, sondern ein präzises Format- und Zeitmanagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-xs hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Extremer Zeitdruck (57 Fragen)</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                130 Minuten für Lesen, Hören, Schreiben und Sprachbausteine vergehen rasend schnell. Ohne Prüfungstraining unter realistischer Stoppuhr fehlen am Ende 20–30 Minuten.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-xs hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Komplexe Schreibformate (Q58)</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Forenbeiträge, Beschwerdebriefe und Gesprächsnotizen erfordern genaue berufliche Redemittel und eine feste Struktur, die Lehrbücher oft nur oberflächlich vermitteln.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/20 dark:border-rose-500/30 space-y-3 shadow-xs hover:border-rose-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Teure Wiederholungsprüfungen</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Ein Fehlversuch bedeutet monatelanges Warten auf einen neuen Prüfungstermin, Stress beim Jobcenter und zusätzliche Prüfungsgebühren von über 180 Euro.
              </p>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="text-center pt-2">
            <a
              href="#module"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>🎯 Entdecken Sie unsere Trainingsmodule & Funktionen</span>
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
              <Sparkles className="w-3.5 h-3.5" /> Umfassendes Prüfungssystem
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Alle Trainingsmodi für Ihren Prüfungserfolg
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Gezielte Einzelmodul-Übungen, authentische Vollsimulationen, Schreibvorlagen und intelligenter Wortschatz.
            </p>
          </div>

          {/* 6 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Card 1: Kachel-Training */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Kachel-Training (12 Teile)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Trainieren Sie jedes Modul separat: Lesen 1–4, Hören 1–4, Schreiben, Sprechen und Sprachbausteine 1 & 2 mit sofortiger Auswertung und Erklärungen.
                </p>
              </div>
              <Link
                to="/app/training"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline pt-2"
              >
                <span>Direkt zum Modul-Training</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Prüfungssimulation */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  Prüfungssimulation (1–57)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Absolvieren Sie alle 57 Prüfungsfragen am Stück unter realen Prüfungsbedingungen mit 130-Minuten-Countdown und automatischer Noten-Berechnung.
                </p>
              </div>
              <Link
                to="/app/simulation"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 group-hover:underline pt-2"
              >
                <span>Zur Prüfungssimulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Schreibtrainer */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-pink-500/50 transition-all group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center font-black">
                  <Edit3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                  Schreibtrainer (Aufgabe 21)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  104+ originale Forenbeiträge, Beschwerdebriefe und Notizen mit vollständig ausformulierten B2-Musterlösungen und interaktivem Wortzähler.
                </p>
              </div>
              <Link
                to="/app/schreiben"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-pink-600 dark:text-pink-400 group-hover:underline pt-2"
              >
                <span>Zum Schreibtrainer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Sprechtrainer */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Sprechtrainer (1A, 2 & 3)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  67+ Mündliche Prüfungsthemen mit interaktivem Vorbereitungs-Timer, Gong-Signal und strukturierten Formulierungshilfen für alle 3 Prüfungsteile.
                </p>
              </div>
              <Link
                to="/app/sprechen"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:underline pt-2"
              >
                <span>Zum Sprechtrainer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 5: Wortschatz & Spaced Repetition */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-violet-500/50 transition-all group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                  Wortschatz & NVV (SRS)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Intelligenter Spaced-Repetition-Algorithmus für berufsspezifische Nomen-Verb-Verbindungen, Beispielsätze und Fachbegriffe.
                </p>
              </div>
              <Link
                to="/app/wortschatz"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-violet-600 dark:text-violet-400 group-hover:underline pt-2"
              >
                <span>Zum Wortschatztraining</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 6: 100% Offline App (PWA) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  100% Offline-App (PWA)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Installieren Sie die Anwendung auf Ihrem Smartphone (iOS & Android) oder PC und üben Sie im Flugzeug, Zug oder Bus ohne Datenverbrauch.
                </p>
              </div>
              <Link
                to="/app/settings"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:underline pt-2"
              >
                <span>App-Installation ansehen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BLOCK 4: VERGLEICHSTABELLE ================= */}
      <section id="vergleich" className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Investieren Sie klug in Ihren Erfolg
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Vergleichen Sie die Kosten und Möglichkeiten verschiedener Prüfungsvorbereitungen.
            </p>
          </div>

          {/* Comparison Table: Beruf B2+ Trainer on FIRST column */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-slate-900 dark:text-white">
                  <th className="p-4 sm:p-5">Funktion / Kriterium</th>
                  <th className="p-4 sm:p-5 text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-indigo-950/40 border-x border-indigo-200 dark:border-indigo-800/60">
                    👑 Beruf B2+ Trainer
                  </th>
                  <th className="p-4 sm:p-5 text-slate-700 dark:text-slate-300 font-bold">Privater Nachhilfelehrer</th>
                  <th className="p-4 sm:p-5 text-slate-700 dark:text-slate-300 font-bold">Gedruckte Lehrbücher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">Kosten / Preis</td>
                  <td className="p-4 sm:p-5 font-black text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    ab 9,99 € (einmalig)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">35 – 50 € / Stunde (300+ €)</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">25 – 40 € pro Buch</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">Verfügbarkeit & Flexibilität</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    24/7 unbegrenzt auf Smartphone & PC
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Nur zu festen Terminen</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Nur mit schwerem Buch</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">130-Min. Prüfungssimulation mit Timer</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    ✓ Echte Simulation & Punkteauswertung
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Nur manuell mit Stoppuhr</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">❌ Keine automatische Auswertung</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">Hörverstehen & Audioplayer</td>
                  <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    ✓ Interaktiv mit ±5s Sprung & Temporegler
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Meist ohne gezielte Hörmaterialien</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Audio-CDs / QR-Codes ohne App</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">104+ Musterlösungen für Schreiben & Sprechen</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    ✓ Vollständig ausgearbeitete Muster
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Begrenzte Korrektur weniger Texte</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">Sehr wenige starre Beispiele</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-black text-slate-900 dark:text-white">Spaced Repetition Wortschatztraining</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-800/60">
                    ✓ Intelligenter SRS-Algorithmus
                  </td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">❌ Kein System</td>
                  <td className="p-4 sm:p-5 text-slate-700 dark:text-slate-300">❌ Starre Vokabellisten</td>
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
              <Crown className="w-3.5 h-3.5 text-amber-500" /> Transparente Preise
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Wählen Sie Ihren passenden Prüfungspass
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Einmalige Zahlung für die gewählte Laufzeit. Keine versteckten Kosten und kein automatisches Abonnement.
            </p>
          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
            
            {/* Plan 1: 7 Days */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">7 Tage Sprint-Pass</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    1 Woche voller Zugriff. Ideal für den schnellen Endspurt vor der Prüfung.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">9,99 €</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ für 7 Tage</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Voller Zugriff auf alle 12 Prüfungsteile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Unbegrenzte Simulationen mit Timer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Alle 104+ Forenbeiträge & 67+ Sprech-Themen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>100% Offline-fähig (PWA)</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/app/pricing"
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs text-center transition-all cursor-pointer"
              >
                Auswählen
              </Link>
            </div>

            {/* Plan 2: 30 Days (Bestseller) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-xl ring-4 ring-indigo-500/15 flex flex-col justify-between space-y-6 relative transform md:-translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                  Bestseller
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">30 Tage Standard-Pass</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    1 Monat voller Zugriff. Die beliebteste Wahl für eine gründliche Vorbereitung.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">15,99 €</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ für 30 Tage</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Voller Zugriff auf alle 12 Prüfungsteile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Unbegrenzte Simulationen mit Timer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Alle 104+ Forenbeiträge & 67+ Sprech-Themen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Vollständiges Wortschatz-Training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>100% Offline-fähig (PWA)</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/app/pricing"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs text-center shadow-md flex items-center justify-center gap-1.5 transition-all transform hover:scale-105 cursor-pointer"
              >
                <span>Jetzt freischalten</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Plan 3: 90 Days */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3.5 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                  Spart 38%
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">90 Tage Kursbegleiter</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    3 Monate voller Zugriff. Begleitet Sie durch den gesamten B2-Berufssprachkurs.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">29,99 €</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ für 90 Tage</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    nur 9,99 € / Monat
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Voller Zugriff auf alle 12 Prüfungsteile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Unbegrenzte Simulationen mit Timer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Alle 104+ Forenbeiträge & 67+ Sprech-Themen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>100% Offline-fähig (PWA)</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/app/pricing"
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs text-center transition-all cursor-pointer"
              >
                Auswählen
              </Link>
            </div>

            {/* Plan 4: Lifetime */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-3.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm">
                  Aktion: -20%
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Lebenslanger Pass</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                    Dauerhafter Zugriff ohne zeitliche Begrenzung bis zum sicheren Bestehen.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-slate-400 line-through">49,99 €</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">39,99 €</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ dauerhaft</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Dauerhafter unbegrenzter Zugang</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Alle 12 Teile & zukünftige Modelltests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Unbegrenzte Prüfungssimulationen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>100% Offline-fähig (PWA)</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/app/pricing"
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs text-center transition-all cursor-pointer"
              >
                Auswählen
              </Link>
            </div>

          </div>

          {/* Central Payment CTA Button to in-app Pricing */}
          <div className="text-center pt-2">
            <Link
              to="/app/pricing"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/25 transition-all transform hover:scale-105 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>✨ Tarif in der App wählen & sicher freischalten</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Payment Badges strip */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-2 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
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
        </div>
      </section>

      {/* ================= BLOCK 6: FAQ ================= */}
      <section id="faq" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Häufig gestellte Fragen (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Alles, was Sie über den Beruf B2+ Trainer, die Inhalte und die Nutzung wissen müssen.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {[
              {
                q: 'Wie sind die Audio-Aufnahmen im Hören-Bereich aufgebaut?',
                a: 'Die Hörtexte und Dialoge werden mit modernster, hochpräziser deutscher Sprachsynthese erzeugt. Sie bieten eine glasklare Aussprache und ein realitätsnahes Sprechtempo ohne störende Hintergrundgeräusche, sodass Sie Ihr Hörverstehen optimal auf Prüfungsniveau trainieren können.',
              },
              {
                q: 'Gibt es ein automatisches Abonnement oder wiederkehrende Kosten?',
                a: 'Nein! Bei uns gibt es keine Abo-Fallen. Jeder Zugang (7, 30, 90 Tage oder Lebenslang) ist ein transparenter Einmalkauf. Ihr Zugang läuft nach der gebuchten Zeit automatisch aus, ohne dass Sie kündigen müssen.',
              },
              {
                q: 'Kann ich den Trainer vor dem Kauf kostenlos ausprobieren?',
                a: 'Ja, absolut! Sie können direkt in die Webanwendung einsteigen und mehrere Prüfungsmodule sofort ohne Anmeldung und ohne Zahlungsdaten kostenlos testen.',
              },
              {
                q: 'Funktioniert die App auch offline ohne Internetverbindung?',
                a: 'Ja! Als moderne Progressive Web App (PWA) kann der Beruf B2+ Trainer direkt auf Ihrem Smartphone (iPhone / Android) oder PC installiert werden. Alle Texte, Fragen und Audios stehen Ihnen offline zur Verfügung.',
              },
              {
                q: 'Entsprechen die Aufgaben dem offiziellen Deutsch-Test für den Beruf B2 (DTB)?',
                a: 'Ja! Alle 12 Module (Lesen 1–4, Hören 1–4, Schreiben, Sprechen, Sprachbausteine 1 & 2), die Punkteverteilung und der 130-Minuten-Prüfungsablauf sind exakt an das offizielle DTB-Format angepasst.',
              },
            ].map((faqItem, idx) => (
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

      {/* ================= BLOCK 7: FINAL HEROIC CTA ================= */}
      <section className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-950 text-white border-2 border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            
            {/* Background shimmer */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 text-center md:text-left relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Starten Sie jetzt
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Bestehen Sie die B2-Beruf-Prüfung beim ersten Mal!
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                Schließen Sie sich hunderten erfolgreichen Teilnehmern an und bereiten Sie sich ohne Prüfungsangst vor.
              </p>
            </div>

            <Link
              to="/app"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/30 shrink-0 flex items-center gap-2.5 transition-transform hover:scale-105 cursor-pointer relative z-10"
            >
              <span>🚀 Jetzt kostenlos ausprobieren</span>
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
                  Unabhängige digitale Lernplattform zur Vorbereitung auf den DTB B2 Beruf.
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
                <span>AGB & Widerruf</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegal('datenschutz')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Datenschutz</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegal('cookies')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>Cookies</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegal('impressum')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Impressum</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} Beruf B2+ Trainer. Alle Rechte vorbehalten.</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% DSGVO-konform • Offline-fähig
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
