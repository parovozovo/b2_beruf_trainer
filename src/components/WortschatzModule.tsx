import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  CheckCircle2,
  RotateCw,
  Search,
  Star,
  Globe,
  HelpCircle,
  Award,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Zap,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WortschatzItem, WortschatzCategory, User } from '../types';

interface WortschatzModuleProps {
  items: WortschatzItem[];
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onOpenPremiumLockedModal: () => void;
  onSelectTab: (tab: string) => void;
}

type WortschatzTab = 'lexikon' | 'flashcards' | 'quiz';

const CATEGORY_LABELS: Record<WortschatzCategory, { label: string; icon: string; color: string; desc: string }> = {
  nvv: {
    label: 'NVV (Nomen-Verb)',
    icon: '🔗',
    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    desc: 'Feste Nomen-Verb-Verbindungen für B2 Beruf',
  },
  redemittel: {
    label: 'Redemittel (Schreiben/Sprechen)',
    icon: '💬',
    color: 'border-pink-500/40 bg-pink-500/10 text-pink-600 dark:text-pink-400',
    desc: 'Wichtige Formulierungen für Briefe, Foren und Gespräche',
  },
  praepositionen: {
    label: 'Verben mit Präpositionen',
    icon: '📌',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    desc: 'Feste Präpositionen und Fälle (+ Dativ / + Akkusativ)',
  },
  geschaeft: {
    label: 'Geschäftswortschatz',
    icon: '💼',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    desc: 'Fachbegriffe aus Arbeitsrecht, Vertragswesen & Büroalltag',
  },
};

const SUPPORTED_TRANSLATION_LANGUAGES = [
  { code: 'ua', label: '🇺🇦 Українська' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'pl', label: '🇵🇱 Polski' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'ru', label: '🇷🇺 Русский' },
];

export const WortschatzModule: React.FC<WortschatzModuleProps> = ({
  items,
  currentUser: _currentUser,
  onOpenLoginModal: _onOpenLoginModal,
  onOpenPremiumLockedModal: _onOpenPremiumLockedModal,
  onSelectTab: _onSelectTab,
}) => {
  const [activeTab, setActiveTab] = useState<WortschatzTab>('lexikon');

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('b2_wortschatz_favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('b2_wortschatz_favorites', JSON.stringify(next));
      return next;
    });
  };

  // Web Speech TTS helper
  const speakGerman = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\[\]_⸚-]/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Translation state (code -> on-demand cache)
  const [targetLang, setTargetLang] = useState<string>(() => {
    return localStorage.getItem('b2_target_lang') || 'ua';
  });

  const handleSetTargetLang = (code: string) => {
    setTargetLang(code);
    localStorage.setItem('b2_target_lang', code);
  };

  const [translationCache, setTranslationCache] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('b2_translations_cache');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const handleTranslateOnDemand = async (item: WortschatzItem) => {
    const cacheKey = `${item.id}_${targetLang}`;
    if (translationCache[cacheKey]) return;

    if (item.translations && item.translations[targetLang]) {
      return;
    }

    setTranslatingId(item.id);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(item.term)}&langpair=de|${targetLang}`
      );
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const text = data.responseData.translatedText;
        setTranslationCache((prev) => {
          const next = { ...prev, [cacheKey]: text };
          localStorage.setItem('b2_translations_cache', JSON.stringify(next));
          return next;
        });
      }
    } catch (e) {
      console.warn('Translation fetch failed:', e);
    } finally {
      setTranslatingId(null);
    }
  };

  // ================= 1. LEXIKON / SEARCH STATE =================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategoryFilter === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTerm = item.term.toLowerCase().includes(q);
      const inMeaning = item.simpleMeaning.toLowerCase().includes(q);
      const inSynonyms = item.synonyms?.toLowerCase().includes(q);
      const inExample = item.exampleSentence.toLowerCase().includes(q);
      const inGrammar = item.grammar?.toLowerCase().includes(q);
      const inTranslations = Object.values(item.translations || {}).some((t) =>
        t?.toLowerCase().includes(q)
      );

      return inTerm || inMeaning || inSynonyms || inExample || inGrammar || inTranslations;
    });
  }, [items, selectedCategoryFilter, searchQuery, favorites]);

  // Category counts
  const nvvCount = useMemo(() => items.filter((i) => i.category === 'nvv').length, [items]);
  const redemittelCount = useMemo(() => items.filter((i) => i.category === 'redemittel').length, [items]);
  const praepositionenCount = useMemo(() => items.filter((i) => i.category === 'praepositionen').length, [items]);
  const geschaeftCount = useMemo(() => items.filter((i) => i.category === 'geschaeft').length, [items]);

  // ================= 2. FLASHCARDS (SRS) STATE =================
  const [flashcardCategory, setFlashcardCategory] = useState<string>('all');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showFlashcardHint, setShowFlashcardHint] = useState<boolean>(false);

  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('b2_flashcards_learned');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const flashcardDeck = useMemo(() => {
    if (flashcardCategory === 'all') return items;
    if (flashcardCategory === 'favorites') return items.filter((i) => favorites.includes(i.id));
    return items.filter((i) => i.category === flashcardCategory);
  }, [items, flashcardCategory, favorites]);

  const currentFlashcard = flashcardDeck[cardIndex] || flashcardDeck[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setShowFlashcardHint(false);
    setCardIndex((prev) => (prev + 1 < flashcardDeck.length ? prev + 1 : 0));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setShowFlashcardHint(false);
    setCardIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flashcardDeck.length - 1));
  };

  const handleMarkLearned = (id: string) => {
    setLearnedIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem('b2_flashcards_learned', JSON.stringify(next));
      return next;
    });
    handleNextCard();
  };

  const handleMarkNeedReview = (id: string) => {
    setLearnedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem('b2_flashcards_learned', JSON.stringify(next));
      return next;
    });
    handleNextCard();
  };

  useEffect(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setShowFlashcardHint(false);
  }, [flashcardCategory]);

  // ================= 3. COLLOCATIONS QUIZ STATE =================
  const [quizQuestions, setQuizQuestions] = useState<WortschatzItem[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizMistakes, setQuizMistakes] = useState<number>(0);
  const [quizMistakesList, setQuizMistakesList] = useState<Array<{ item: WortschatzItem; userAnswer: string }>>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const startNewQuiz = (customPool?: WortschatzItem[]) => {
    const pool = customPool || items.filter((i) => i.gapOptions && i.gapOptions.length >= 2 && i.gapAnswer);
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuizQuestions(shuffled);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizMistakes(0);
    setQuizMistakesList([]);
    setQuizFinished(false);
  };

  const handleRetryMistakes = () => {
    const mistakeItems = quizMistakesList.map((m) => m.item);
    if (mistakeItems.length > 0) {
      startNewQuiz(mistakeItems);
    }
  };

  useEffect(() => {
    if (activeTab === 'quiz' && quizQuestions.length === 0) {
      startNewQuiz();
    }
  }, [activeTab]);

  const currentQuizQuestion = quizQuestions[quizIndex];

  const handleSelectQuizOption = (option: string) => {
    if (quizAnswers[quizIndex] !== undefined) return;
    const isCorrect = option.toLowerCase().trim() === currentQuizQuestion.gapAnswer?.toLowerCase().trim();

    setQuizAnswers((prev) => ({ ...prev, [quizIndex]: option }));
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    } else {
      setQuizMistakes((prev) => prev + 1);
      setQuizMistakesList((prev) => [...prev, { item: currentQuizQuestion, userAnswer: option }]);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      const finalScore = quizScore;
      if (finalScore >= 7) {
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* ================= HERO HEADER ================= */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-indigo-500/30 shadow-lg">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-full text-xs font-extrabold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> B2 Beruf Vokabel- & Grammatik-Hub
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Wortschatz & Nomen-Verb-Verbindungen 📚
          </h1>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            Beherrschen Sie die wichtigsten berufsbezogenen Wendungen, Redemittel und Präpositionen für die telc / BAMF
            Deutsch-Test für den Beruf (DTB) B2 Prüfung.
          </p>

          {/* 3 Interactive Mode Tabs Switcher */}
          <div className="flex flex-wrap gap-2 pt-3">
            <button
              onClick={() => setActiveTab('lexikon')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'lexikon'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> 🗂️ Übersicht & Suche ({items.length})
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              <RotateCw className="w-4 h-4" /> 🃏 Karteikarten (SRS)
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" /> 🎯 Kollokations-Quiz (Trainer)
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: ÜBERSICHT & SUCHE (LEXIKON) ================= */}
      {activeTab === 'lexikon' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Filter Bar & Search */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                🌟 Alle ({items.length})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('nvv')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'nvv'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                🔗 NVV ({nvvCount})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('redemittel')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'redemittel'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                💬 Redemittel ({redemittelCount})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('praepositionen')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'praepositionen'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                📌 Präpositionen ({praepositionenCount})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('geschaeft')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'geschaeft'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                💼 Geschäft ({geschaeftCount})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('favorites')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'favorites'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'glass-card text-amber-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                ⭐ Favoriten ({favorites.length})
              </button>
            </div>

            {/* Search Input & Language Selector */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ausdruck, Verb, Präposition oder Bedeutung suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              {/* Translation Language Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Übersetzung:</span>
                <select
                  value={targetLang}
                  onChange={(e) => handleSetTargetLang(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {SUPPORTED_TRANSLATION_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredItems.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-slate-300 dark:border-slate-800 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                Keine Einträge gefunden
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const catDef = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.nvv;
                const isFav = favorites.includes(item.id);
                const cacheKey = `${item.id}_${targetLang}`;
                const translationText =
                  item.translations[targetLang] || translationCache[cacheKey] || null;

                return (
                  <div
                    key={item.id}
                    className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4 shadow-sm hover:shadow-md"
                  >
                    {/* Top Row: Category & Action Icons */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${catDef.color}`}
                          >
                            <span>{catDef.icon}</span> {catDef.label}
                          </span>
                          {item.grammar && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {item.grammar}
                            </span>
                          )}
                        </div>

                        {/* Favorite & Audio Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => speakGerman(item.term)}
                            title="Aussprache anhören (de-DE)"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            title={isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isFav
                                ? 'text-amber-500 bg-amber-500/15'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Main Term */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {item.term}
                      </h3>

                      {/* Meaning & Synonyms */}
                      <div className="space-y-1 text-xs">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold flex items-start gap-1.5">
                          <span className="text-slate-500 font-bold shrink-0">Bedeutung:</span>
                          <span>{item.simpleMeaning}</span>
                        </div>
                        {item.synonyms && (
                          <div className="text-slate-600 dark:text-slate-400 font-medium flex items-start gap-1.5">
                            <span className="text-slate-500 font-bold shrink-0">Synonyme:</span>
                            <span>{item.synonyms}</span>
                          </div>
                        )}
                      </div>

                      {/* Example Sentence */}
                      <div className="p-3 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 italic">
                        "{item.exampleSentence}"
                      </div>
                    </div>

                    {/* Translation Footer */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      {translationText ? (
                        <div className="text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1.5">
                          <span className="text-xs">
                            {SUPPORTED_TRANSLATION_LANGUAGES.find((l) => l.code === targetLang)?.label.split(' ')[0] || '🌐'}
                          </span>
                          <span>{translationText}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTranslateOnDemand(item)}
                          disabled={translatingId === item.id}
                          className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>
                            {translatingId === item.id ? 'Übersetze...' : 'Übersetzung laden'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: KARTEIKARTEN (FLASHCARDS SRS) ================= */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          {/* Deck selector, Language & Progress */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Deck:</span>
                  <select
                    value={flashcardCategory}
                    onChange={(e) => setFlashcardCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">🌟 Alle ({items.length})</option>
                    <option value="nvv">🔗 NVV ({nvvCount})</option>
                    <option value="redemittel">💬 Redemittel ({redemittelCount})</option>
                    <option value="praepositionen">📌 Präpositionen ({praepositionenCount})</option>
                    <option value="geschaeft">💼 Geschäft ({geschaeftCount})</option>
                    <option value="favorites">⭐ Favoriten ({favorites.length})</option>
                  </select>
                </div>

                {/* Flashcard Language Selector */}
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <select
                    value={targetLang}
                    onChange={(e) => handleSetTargetLang(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {SUPPORTED_TRANSLATION_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-3 text-xs font-extrabold self-end sm:self-auto">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  ✓ Gelernt: {learnedIds.length}
                </span>
                <span className="text-slate-500">
                  {cardIndex + 1} / {flashcardDeck.length || 1}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    flashcardDeck.length > 0
                      ? Math.round(((cardIndex + 1) / flashcardDeck.length) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Flashcard Body */}
          {flashcardDeck.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-300 dark:border-slate-800 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Keine Karten in diesem Deck
              </h3>
              <p className="text-xs text-slate-500">
                Wählen Sie eine andere Kategorie oder fügen Sie Ausdrücke zu Ihren Favoriten hinzu.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[340px] sm:min-h-[380px] p-6 sm:p-8 rounded-3xl glass-panel border-2 border-indigo-500/40 shadow-xl cursor-pointer select-none flex flex-col justify-between transition-all hover:border-indigo-500 group"
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                      CATEGORY_LABELS[currentFlashcard.category]?.color || ''
                    }`}
                  >
                    {CATEGORY_LABELS[currentFlashcard.category]?.icon}{' '}
                    {CATEGORY_LABELS[currentFlashcard.category]?.label}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => speakGerman(currentFlashcard.term)}
                      className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                      title="Anhören"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(currentFlashcard.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        favorites.includes(currentFlashcard.id)
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                      }`}
                      title="Favorit"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favorites.includes(currentFlashcard.id) ? 'fill-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Center Content */}
                {!isFlipped ? (
                  /* FRONT: TERM & GAP EXERCISE */
                  <div className="space-y-4 text-center my-auto py-4">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {currentFlashcard.term}
                    </div>

                    {currentFlashcard.gapExample && (
                      <div className="p-4 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium italic">
                        "{currentFlashcard.gapExample}"
                      </div>
                    )}

                    {showFlashcardHint && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-semibold animate-fadeIn">
                        💡 Bedeutung: {currentFlashcard.simpleMeaning}
                      </div>
                    )}
                  </div>
                ) : (
                  /* BACK: MEANING, FULL SENTENCE, GRAMMAR, SYNONYMS & TRANSLATIONS */
                  <div className="space-y-3.5 text-left my-auto py-2 animate-fadeIn">
                    <div>
                      <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Vollständiger Ausdruck & Bedeutung:
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                        {currentFlashcard.term}
                      </div>
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                        👉 {currentFlashcard.simpleMeaning}
                      </div>
                    </div>

                    {/* Example with highlighted answer */}
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      "{currentFlashcard.exampleSentence}"
                    </div>

                    {/* Meta info & Dynamic Translation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentFlashcard.grammar && (
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 font-bold block text-[10px] uppercase">
                            Grammatik
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {currentFlashcard.grammar}
                          </span>
                        </div>
                      )}

                      {/* Selected Target Language Translation */}
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">
                          {SUPPORTED_TRANSLATION_LANGUAGES.find((l) => l.code === targetLang)?.label || 'Übersetzung'}
                        </span>
                        {currentFlashcard.translations[targetLang] || translationCache[`${currentFlashcard.id}_${targetLang}`] ? (
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            {currentFlashcard.translations[targetLang] || translationCache[`${currentFlashcard.id}_${targetLang}`]}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTranslateOnDemand(currentFlashcard);
                            }}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                          >
                            <Globe className="w-3 h-3" />
                            <span>{translatingId === currentFlashcard.id ? 'Lädt...' : 'Übersetzung laden'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer instructions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFlashcardHint(!showFlashcardHint);
                    }}
                    className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showFlashcardHint ? 'Tipp verbergen' : 'Tipp anzeigen'}</span>
                  </button>

                  <span className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <RotateCw className="w-3.5 h-3.5" /> {isFlipped ? 'Zurückdrehen' : 'Klicken zum Umdrehen'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Noch üben vs Gelernt */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  onClick={handlePrevCard}
                  className="px-4 py-3 rounded-2xl glass-card text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Vorherige
                </button>

                <button
                  onClick={() => handleMarkNeedReview(currentFlashcard.id)}
                  className="px-4 py-3 rounded-2xl bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500/30 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-500" /> Noch üben
                </button>

                <button
                  onClick={() => handleMarkLearned(currentFlashcard.id)}
                  className="px-4 py-3 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gelernt!
                </button>

                <button
                  onClick={handleNextCard}
                  className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  Nächste <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: COLLOCATIONS QUIZ (TRAINER) ================= */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          {quizFinished ? (
            /* Quiz Results Screen with Mistakes Review */
            <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 text-center space-y-6 shadow-xl">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/40">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Quiz abgeschlossen! 🎉
                </h2>

                {/* Score Pills */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-black text-sm">
                    ✓ Richtig: {quizScore}
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 font-black text-sm">
                    ✗ Falsch: {quizMistakes}
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 font-black text-sm">
                    {Math.round((quizScore / (quizQuestions.length || 1)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => startNewQuiz()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-colors text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Neues Quiz starten (10 Fragen)
                </button>

                {quizMistakesList.length > 0 && (
                  <button
                    onClick={handleRetryMistakes}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-lg transition-colors text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" /> Nur {quizMistakesList.length} Fehler wiederholen
                  </button>
                )}
              </div>

              {/* Mistakes Breakdown List */}
              {quizMistakesList.length > 0 && (
                <div className="text-left space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Fehler-Analyse ({quizMistakesList.length} Fragen):
                  </h4>

                  <div className="space-y-2.5">
                    {quizMistakesList.map(({ item, userAnswer }) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          "{item.gapExample}"
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            Ihre Antwort: ✗ {userAnswer}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            Richtig: ✓ {item.gapAnswer}
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 font-medium">
                          💡 Bedeutung: {item.simpleMeaning} ({item.term})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentQuizQuestion ? (
            /* Active Quiz Question Screen */
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-6 shadow-xl">
              {/* Question Header & Live Scoring Counters (Correct vs Wrong) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Frage {quizIndex + 1} von {quizQuestions.length}
                </span>

                {/* Live Accuracy Counters */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1">
                    ✓ Richtig: {quizScore}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-black flex items-center gap-1">
                    ✗ Falsch: {quizMistakes}
                  </span>
                </div>
              </div>

              {/* Question Gap Sentence */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Wählen Sie das passende Wort für die Lücke:
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                  "{currentQuizQuestion.gapExample}"
                </div>
              </div>

              {/* 4 Multiple-Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuizQuestion.gapOptions?.map((opt, optIdx) => {
                  const isSelected = quizAnswers[quizIndex] === opt;
                  const isCorrect = opt.toLowerCase().trim() === currentQuizQuestion.gapAnswer?.toLowerCase().trim();
                  const answered = quizAnswers[quizIndex] !== undefined;

                  let btnStyle =
                    'glass-card text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 hover:border-indigo-500';

                  if (answered) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500 font-black';
                    } else if (isSelected && !isCorrect) {
                      btnStyle =
                        'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500 font-black';
                    } else {
                      btnStyle = 'opacity-50 glass-card border-slate-300 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={answered}
                      className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-extrabold text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                    >
                      <span>
                        <strong className="mr-2 opacity-60">
                          {String.fromCharCode(65 + optIdx)})
                        </strong>
                        {opt}
                      </span>
                      {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {answered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answer */}
              {quizAnswers[quizIndex] !== undefined && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-1.5 text-xs text-slate-800 dark:text-slate-200 animate-fadeIn">
                  <div className="font-extrabold text-indigo-700 dark:text-indigo-300">
                    💡 Wendung: {currentQuizQuestion.term}
                  </div>
                  <div>Bedeutung: {currentQuizQuestion.simpleMeaning}</div>
                  {currentQuizQuestion.synonyms && (
                    <div className="text-slate-500 font-medium">
                      Synonyme: {currentQuizQuestion.synonyms}
                    </div>
                  )}
                </div>
              )}

              {/* Next Question Button */}
              {quizAnswers[quizIndex] !== undefined && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-colors text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                  >
                    {quizIndex + 1 < quizQuestions.length ? 'Nächste Frage' : 'Quiz auswerten'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
