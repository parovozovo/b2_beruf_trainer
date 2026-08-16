import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  FileText,
  MessageSquare,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { User } from '../../types';

interface LandingPageProps {
  currentUser: User | null;
  onOpenLoginModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onOpenLoginModal,
  theme,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              B2
            </div>
            <div>
              <div className="text-base font-black tracking-tight flex items-center gap-1.5">
                <span>Beruf B2+</span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Deutsch-Test für den Beruf (DTB)
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Funktionen
            </a>
            <a href="#wortschatz" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Wortschatz & SRS
            </a>
            <Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Preise
            </Link>
            <Link to="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Blog & Ratgeber
            </Link>
          </nav>

          {/* User CTA & Theme */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Design umschalten"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {currentUser ? (
              <Link
                to="/app"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Zum Trainer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Anmelden
                </button>
                <Link
                  to="/app"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Kostenlos starten</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Optimiert für telc Deutsch B2 Beruf & DTB 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Bestehen Sie die <span className="text-indigo-600 dark:text-indigo-400">B2 Beruf Prüfung</span> beim ersten Versuch.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Der interaktive All-in-One Prüfungstrainer: 12 vollständige Modelltests, 380+ Nomen-Verb-Verbindungen mit SRS-Karteikarten, KI-Schreibtrainer für Beschwerde- & Forumsbeiträge und authentische Sprech-Simulationen.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Jetzt kostenlos üben</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/pricing"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Premium-Vorteile ansehen</span>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">12+</div>
                <div className="text-xs text-slate-500 font-bold">Modelltests</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">385+</div>
                <div className="text-xs text-slate-500 font-bold">Wortschatz-Karten</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-500">94.2%</div>
                <div className="text-xs text-slate-500 font-bold">Bestehensquote</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">5</div>
                <div className="text-xs text-slate-500 font-bold">Sprachen (UA/EN/TR/ES/RU)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 CORE MODULES SECTION ================= */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Umfassende Prüfungsvorbereitung
            </h2>
            <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Alles, was Sie für die DTB B2 Prüfung brauchen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Modelltests */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  1. Echte Modelltests
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Lesen & Hören exakt nach offiziellem telc / BAMF Prüfungsformat mit automatischer Punkteauswertung und Timer.
                </p>
              </div>
              <Link
                to="/app"
                className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Tests starten</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Wortschatz & SRS */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  2. Wortschatz & SRS
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  385+ Nomen-Verb-Verbindungen & Redemittel mit Spaced Repetition Flashcards, Beispielsätzen und Audio-Aussprache.
                </p>
              </div>
              <Link
                to="/app/wortschatz"
                className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Vokabeln lernen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Schreiben */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  3. Schreib-Trainer
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Schreiben Sie Beschwerdebriefe, Forumsbeiträge & Anfragen mit Musterlösungen, Bausteinen und Kriterien-Check.
                </p>
              </div>
              <Link
                to="/app/schreiben"
                className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Briefe üben</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Sprechen */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  4. Mündliche Prüfung
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Teil 1A/B Präsentation, Teil 2 Diskussion & Teil 3 Problemlösung mit Stoppuhr, Redemitteln und Leitfragen.
                </p>
              </div>
              <Link
                to="/app/sprechen"
                className="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Sprechen trainieren</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE TEASER / PREVIEW ================= */}
      <section id="wortschatz" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl glass-panel bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 border border-indigo-500/30 text-white shadow-2xl space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Spaced Repetition System (SRS)
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Vokabeln nie wieder vergessen
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unser intelligentes Karteikarten-System fragt gezielt die Begriffe ab, die Sie noch üben müssen. Bereits gelerne Wörter werden automatisch ausgeblendet, bis sie im Langzeitgedächtnis sitzen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-indigo-300">💡 Kontextuelles Lernen</div>
                <div className="text-sm font-black">Lückensätze & Beispielsätze</div>
                <p className="text-[11px] text-slate-400">Verstehen Sie Ausdrücke direkt in realistischen beruflichen Situationen.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-emerald-300">🔊 Audio-Aussprache</div>
                <div className="text-sm font-black">Perfekte deutsche Phonetik</div>
                <p className="text-[11px] text-slate-400">Hören Sie die korrekte Aussprache und Betonung auf Knopfdruck an.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-amber-300">🌐 5 Übersetzungssprachen</div>
                <div className="text-sm font-black">UA, EN, TR, ES, RU</div>
                <p className="text-[11px] text-slate-400">Präzise Fachübersetzungen, angepasst an den geschäftlichen Kontext.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/app/wortschatz"
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Wortschatz-Trainer jetzt testen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="py-16 bg-gradient-to-b from-transparent to-slate-100 dark:to-slate-900/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Bereit für Ihr B2 Beruf Zertifikat?
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Starten Sie noch heute mit den kostenlosen Modelltests und bereiten Sie sich zielgerichtet auf Ihre Prüfung vor.
          </p>
          <div className="pt-2">
            <Link
              to="/app"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-105 cursor-pointer"
            >
              <span>Kostenlos im Browser starten</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 bg-white dark:bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 dark:text-slate-200">Beruf B2+ Trainer</span>
            <span>© 2026 Alle Rechte vorbehalten.</span>
          </div>

          <div className="flex items-center gap-6 font-bold text-slate-600 dark:text-slate-400">
            <Link to="/pricing" className="hover:text-indigo-600">Preise</Link>
            <Link to="/blog" className="hover:text-indigo-600">Blog</Link>
            <Link to="/app" className="hover:text-indigo-600">App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
