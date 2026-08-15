import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  BookmarkCheck,
  CheckCircle2,
  ChevronRight,
  RotateCw,
  Search,
  Briefcase,
  Stethoscope,
  Wrench,
  ShoppingBag,
  BellRing,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { User } from '../types';

interface WortschatzModuleProps {
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onOpenPremiumLockedModal: () => void;
  onSelectTab: (tab: string) => void;
}

interface NVVItem {
  nvv: string;
  meaning: string;
  simpleVerb: string;
  example: string;
  category: string;
}

const SAMPLE_NVV: NVVItem[] = [
  {
    nvv: 'eine Entscheidung treffen',
    meaning: 'sich entscheiden',
    simpleVerb: 'entscheiden',
    example: 'Die Geschäftsleitung muss bis morgen eine wichtige Entscheidung treffen.',
    category: 'Büro & Management',
  },
  {
    nvv: 'zur Verfügung stehen',
    meaning: 'verfügbar sein / genutzt werden können',
    simpleVerb: 'vorhanden sein',
    example: 'Für Rückfragen stehe ich Ihnen jederzeit gerne zur Verfügung.',
    category: 'Korrespondenz',
  },
  {
    nvv: 'in Betracht ziehen',
    meaning: 'überlegen, berücksichtigen',
    simpleVerb: 'erwägen',
    example: 'Wir sollten auch alternative Lösungsvorschläge in Betracht ziehen.',
    category: 'Besprechungen',
  },
  {
    nvv: 'in Kauf nehmen',
    meaning: 'etwas Negatives akzeptieren',
    simpleVerb: 'akzeptieren',
    example: 'Um den Termin einzuhalten, müssen wir eventuelle Mehrkosten in Kauf nehmen.',
    category: 'Projektarbeit',
  },
  {
    nvv: 'zur Sprache bringen',
    meaning: 'ein Thema ansprechen / diskutieren',
    simpleVerb: 'ansprechen',
    example: 'Ich möchte dieses Problem in der nächsten Teamsitzung zur Sprache bringen.',
    category: 'Kommunikation',
  },
  {
    nvv: 'einen Antrag stellen',
    meaning: 'offiziell etwas beantragen',
    simpleVerb: 'beantragen',
    example: 'Herr Müller hat einen Antrag auf Bildungsurlaub gestellt.',
    category: 'Personalwesen',
  },
  {
    nvv: 'eine Vereinbarung treffen',
    meaning: 'etwas verbindlich abmachen',
    simpleVerb: 'vereinbaren',
    example: 'Beide Vertragsparteien konnten heute eine einvernehmliche Vereinbarung treffen.',
    category: 'Verhandlungen',
  },
  {
    nvv: 'in Kenntnis setzen',
    meaning: 'jemanden informieren',
    simpleVerb: 'informieren',
    example: 'Bitte setzen Sie alle Teammitglieder über die Änderungen in Kenntnis.',
    category: 'Korrespondenz',
  },
];

const VOCAB_BRANCHES = [
  {
    id: 'buero',
    title: 'Büro, Administration & Handel',
    icon: Briefcase,
    color: 'from-blue-600 to-indigo-600',
    wordsCount: '180+ Fachbegriffe',
    examples: ['Kostenvoranschlag', 'Fristverlängerung', 'Protokollführung', 'Zahlungsziel'],
  },
  {
    id: 'pflege',
    title: 'Medizin, Pflege & Gesundheit',
    icon: Stethoscope,
    color: 'from-emerald-600 to-teal-600',
    wordsCount: '150+ Fachbegriffe',
    examples: ['Übergabegespräch', 'Vitalwerte erfassen', 'Dosierungshinweise', 'Pflegedokumentation'],
  },
  {
    id: 'technik',
    title: 'Technik, Handwerk & IT',
    icon: Wrench,
    color: 'from-amber-600 to-orange-600',
    wordsCount: '140+ Fachbegriffe',
    examples: ['Wartungsintervall', 'Fehlerdiagnose', 'Sicherheitsdatenblatt', 'Inbetriebnahme'],
  },
  {
    id: 'dienstleistung',
    title: 'Logistik, Gastronomie & Service',
    icon: ShoppingBag,
    color: 'from-rose-600 to-pink-600',
    wordsCount: '130+ Fachbegriffe',
    examples: ['Lieferscheinabgleich', 'Reklamationsmanagement', 'Warenannahme', 'Kundenbeschwerde'],
  },
];

export const WortschatzModule: React.FC<WortschatzModuleProps> = ({
  currentUser: _currentUser,
  onOpenLoginModal: _onOpenLoginModal,
  onOpenPremiumLockedModal: _onOpenPremiumLockedModal,
  onSelectTab,
}) => {
  const [activeSection, setActiveSection] = useState<'nvv' | 'branchen' | 'flashcards'>('nvv');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    return localStorage.getItem('b2_wortschatz_bookmarked') === 'true';
  });

  // Flashcard Demo State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleToggleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    localStorage.setItem('b2_wortschatz_bookmarked', String(next));
    if (next) {
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  const filteredNVV = SAMPLE_NVV.filter(
    (item) =>
      item.nvv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentFlashcard = SAMPLE_NVV[currentCardIndex % SAMPLE_NVV.length];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Hero Teaser Banner */}
      <div className="relative overflow-hidden glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> In Vorbereitung (Q1 2026)
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
                B2 DTB Beruf Spezial
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wortschatz & Nomen-Verb-Verbindungen
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Meistern Sie den prüfungsrelevanten Fachwortschatz für die B2 Beruf Prüfung. Lernen Sie über 600 berufsbezogene Begriffe, feste Redewendungen und Nomen-Verb-Verbindungen mit interaktiven Karteikarten, Beispielsätzen und Audio-Aussprache.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleToggleBookmark}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                isBookmarked
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4" /> Vormerkung aktiv ✓
                </>
              ) : (
                <>
                  <BellRing className="w-4 h-4" /> Benachrichtigung vormerken
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Roadmap & Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Spaced Repetition System</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Intelligenter Algorithmus wiederholt schwierige Wörter exakt im richtigen Zeitintervall.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Deutsche Audio-Aussprache</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hören Sie jedes Wort in authentischer deutscher Muttersprachler-Aussprache.
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Prüfungsfokus B2 Beruf</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fokus auf Nomen-Verb-Verbindungen für Höchstpunkte im Prüfungsteil Schreiben & Sprechen.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveSection('nvv')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSection === 'nvv'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Nomen-Verb-Verbindungen (NVV)
        </button>

        <button
          onClick={() => setActiveSection('branchen')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSection === 'branchen'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Fachwortschatz nach Branchen
        </button>

        <button
          onClick={() => setActiveSection('flashcards')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSection === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" /> Interaktive Karteikarten (Vorschau)
        </button>
      </div>

      {/* Section 1: Nomen-Verb-Verbindungen List */}
      {activeSection === 'nvv' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Top Nomen-Verb-Verbindungen für B2</h3>
              <p className="text-xs text-slate-400">
                Diese Wendungen werden in der Prüfung B2 Beruf besonders hoch bewertet.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="NVV suchen..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNVV.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {item.nvv}
                      <button
                        onClick={() => handleSpeak(item.nvv)}
                        title="Aussprache anhören"
                        className="p-1 text-slate-400 hover:text-amber-400 rounded-md transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono shrink-0">
                    = {item.simpleVerb}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                  „{item.example}“
                </div>

                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 font-semibold">Bedeutung:</span> {item.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Branchenwortschatz */}
      {activeSection === 'branchen' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Berufsbezogener Fachwortschatz nach Sparten</h3>
            <p className="text-xs text-slate-400">
              Spezifische Vokabelpakete für Ihren Arbeitsbereich in Deutschland.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VOCAB_BRANCHES.map((branch) => {
              const IconComp = branch.icon;
              return (
                <div
                  key={branch.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${branch.color} text-white shadow-md`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{branch.title}</h4>
                      <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                        {branch.wordsCount}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Typische Fachbegriffe:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {branch.examples.map((ex, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-medium"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleToggleBookmark}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Paket vormerken</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Interactive Flashcards Preview */}
      {activeSection === 'flashcards' && (
        <div className="max-w-md mx-auto space-y-4 py-2">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-white">Digitale Karteikarte (Vorschau)</h3>
            <p className="text-xs text-slate-400">
              Klicken Sie auf die Karte, um die Übersetzung und Beispielsätze anzuzeigen.
            </p>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[220px] p-6 glass-panel rounded-3xl border border-indigo-500/40 shadow-xl flex flex-col items-center justify-center text-center space-y-3 transition-transform duration-300 hover:scale-[1.02] bg-gradient-to-b from-slate-900 to-slate-950"
          >
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {currentFlashcard.category} • Karte {((currentCardIndex % SAMPLE_NVV.length) + 1)} von {SAMPLE_NVV.length}
            </span>

            {!isFlipped ? (
              <div className="space-y-2 animate-fadeIn">
                <div className="text-xl font-extrabold text-white">{currentFlashcard.nvv}</div>
                <p className="text-xs text-slate-400">Tippen zum Umdrehen</p>
              </div>
            ) : (
              <div className="space-y-2 animate-fadeIn">
                <div className="text-sm font-bold text-amber-400">= {currentFlashcard.meaning}</div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 italic">
                  „{currentFlashcard.example}“
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(currentFlashcard.nvv);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all mt-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : SAMPLE_NVV.length - 1));
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              ← Vorherige
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl hover:bg-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Umdrehen
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex((prev) => prev + 1);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Nächste →
            </button>
          </div>
        </div>
      )}

      {/* Bottom CTA to start exams */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Möchten Sie Ihr Wissen sofort in echten Prüfungen anwenden?</h4>
          <p className="text-xs text-slate-400">
            Starten Sie das Kacheltraining für alle 12 Prüfungsteile oder absolvieren Sie eine Komplettprüfung.
          </p>
        </div>
        <button
          onClick={() => onSelectTab('tile_practice')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Zum Kacheltraining</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
