import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  SlidersHorizontal,
  Puzzle,
  Trash2,
  Flame,
  Check,
  RotateCcw,
  Shuffle,
  ListOrdered,
  Trophy,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WortschatzItem, WortschatzCategory, User, FlashcardSrsRecord, SrsRating } from '../types';
import {
  getFlashcardSrsRecords,
  saveFlashcardSrsRecords,
  calculateNextSrsState,
  isCardDueToday,
  getNextIntervalPreview,
  getScheduleStatusLabel,
} from '../utils/srs';
import { recordStreakActivity } from '../utils/storage';

interface WortschatzModuleProps {
  items: WortschatzItem[];
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onOpenPremiumLockedModal: () => void;
  onSelectTab: (tab: string) => void;
}

type WortschatzTab = 'lexikon' | 'flashcards' | 'quiz' | 'match';
type ResetTarget = 'all' | 'flashcards' | 'quiz' | 'match' | null;

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
  konnektoren: {
    label: 'Konnektoren (Satzbau)',
    icon: '🔀',
    color: 'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    desc: 'Zweiteilige Konnektoren & Satzverbindungen (zwar... aber, infolgedessen...)',
  },
  kollokationen: {
    label: 'Kollokationen (Wortschatz)',
    icon: '💎',
    color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    desc: 'Feste Wortverbindungen & beruflicher Fachwortschatz',
  },
};

const SUPPORTED_TRANSLATION_LANGUAGES = [
  { code: 'ua', label: '🇺🇦 Українська' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
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
      const cleanText = text.replace(/[[\]_⸚-]/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Translation state
  const [targetLang, setTargetLang] = useState<string>(() => {
    return localStorage.getItem('b2_target_lang') || 'ua';
  });

  const handleSetTargetLang = (code: string) => {
    setTargetLang(code);
    localStorage.setItem('b2_target_lang', code);
  };

  // ================= 1. LEXIKON / SEARCH STATE =================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedCategoryFilter]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategoryFilter === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTerm = (item.term || '').toLowerCase().includes(q);
      const inMeaning = (item.simpleMeaning || '').toLowerCase().includes(q);
      const inSynonyms = item.synonyms?.toLowerCase().includes(q);
      const inExample = (item.exampleSentence || '').toLowerCase().includes(q);
      const inGrammar = item.grammar?.toLowerCase().includes(q);
      const inTranslations = Object.values(item.translations || {}).some((t) =>
        t?.toLowerCase().includes(q)
      );

      return inTerm || inMeaning || inSynonyms || inExample || inGrammar || inTranslations;
    });
  }, [items, selectedCategoryFilter, searchQuery, favorites]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Category counts
  const nvvCount = useMemo(() => items.filter((i) => i.category === 'nvv').length, [items]);
  const redemittelCount = useMemo(() => items.filter((i) => i.category === 'redemittel').length, [items]);
  const praepositionenCount = useMemo(() => items.filter((i) => i.category === 'praepositionen').length, [items]);
  const geschaeftCount = useMemo(() => items.filter((i) => i.category === 'geschaeft').length, [items]);
  const konnektorenCount = useMemo(() => items.filter((i) => i.category === 'konnektoren').length, [items]);
  const kollokationenCount = useMemo(() => items.filter((i) => i.category === 'kollokationen').length, [items]);

  // ================= 2. FLASHCARDS (SPACED REPETITION SRS) STATE =================
  const [flashcardCategory, setFlashcardCategory] = useState<string>('all');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showFlashcardHint, setShowFlashcardHint] = useState<boolean>(false);

  // SRS Records Map (id -> FlashcardSrsRecord)
  const [srsRecords, setSrsRecords] = useState<Record<string, FlashcardSrsRecord>>(() => getFlashcardSrsRecords());

  // Filter mode: 'due' | 'learning' | 'mastered' | 'all'
  const [srsFilter, setSrsFilter] = useState<'due' | 'learning' | 'mastered' | 'all'>(() => {
    return (localStorage.getItem('b2_flashcards_srs_filter') as 'due' | 'learning' | 'mastered' | 'all') || 'due';
  });

  // Order mode: random shuffle vs sequential order
  const [isRandomOrder, setIsRandomOrder] = useState<boolean>(() => {
    return localStorage.getItem('b2_flashcards_random') !== 'false';
  });

  // Full category items (unfiltered by SRS state)
  const fullCategoryItems = useMemo(() => {
    if (flashcardCategory === 'all') return items;
    if (flashcardCategory === 'favorites') return items.filter((i) => favorites.includes(i.id));
    return items.filter((i) => i.category === flashcardCategory);
  }, [items, flashcardCategory, favorites]);

  const catTotalCount = fullCategoryItems.length;

  const catDueCount = useMemo(() => {
    return fullCategoryItems.filter((i) => isCardDueToday(srsRecords[i.id])).length;
  }, [fullCategoryItems, srsRecords]);

  const catLearningCount = useMemo(() => {
    return fullCategoryItems.filter((i) => {
      const rec = srsRecords[i.id];
      return rec && (rec.status === 'learning' || rec.status === 'review') && !isCardDueToday(rec);
    }).length;
  }, [fullCategoryItems, srsRecords]);

  const catMasteredCount = useMemo(() => {
    return fullCategoryItems.filter((i) => srsRecords[i.id]?.status === 'mastered' && !isCardDueToday(srsRecords[i.id])).length;
  }, [fullCategoryItems, srsRecords]);

  const catProgressPercent = catTotalCount > 0 ? Math.round((catMasteredCount / catTotalCount) * 100) : 0;

  // Active flashcard deck
  const [flashcardDeck, setFlashcardDeck] = useState<WortschatzItem[]>([]);
  const prevItemsLengthRef = React.useRef<number>(0);

  const rebuildDeck = React.useCallback(
    (
      cat: string,
      allItems: WortschatzItem[],
      favs: string[],
      records: Record<string, FlashcardSrsRecord>,
      filter: 'due' | 'learning' | 'mastered' | 'all',
      random: boolean
    ) => {
      let list: WortschatzItem[];
      if (cat === 'all') list = [...allItems];
      else if (cat === 'favorites') list = allItems.filter((i) => favs.includes(i.id));
      else list = allItems.filter((i) => i.category === cat);

      if (filter === 'due') {
        list = list.filter((i) => isCardDueToday(records[i.id]));
      } else if (filter === 'learning') {
        list = list.filter((i) => records[i.id]?.status === 'learning' || records[i.id]?.status === 'review');
      } else if (filter === 'mastered') {
        list = list.filter((i) => records[i.id]?.status === 'mastered');
      }

      if (random && list.length > 1) {
        const shuffled = [...list];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setFlashcardDeck(shuffled);
      } else {
        const sorted = [...list].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setFlashcardDeck(sorted);
      }
      setCardIndex(0);
      setIsFlipped(false);
      setShowFlashcardHint(false);
    },
    []
  );

  // Auto-initialize flashcard deck
  useEffect(() => {
    if (items.length > 0 && (flashcardDeck.length === 0 || items.length !== prevItemsLengthRef.current)) {
      prevItemsLengthRef.current = items.length;
      rebuildDeck(flashcardCategory, items, favorites, srsRecords, srsFilter, isRandomOrder);
    }
  }, [items, flashcardCategory, favorites, srsRecords, srsFilter, isRandomOrder, flashcardDeck.length, rebuildDeck]);

  const safeIndex = flashcardDeck.length > 0 ? Math.min(Math.max(0, cardIndex), flashcardDeck.length - 1) : 0;
  const currentFlashcard = flashcardDeck[safeIndex];

  const handleSelectFlashcardCategory = (cat: string) => {
    setFlashcardCategory(cat);
    rebuildDeck(cat, items, favorites, srsRecords, srsFilter, isRandomOrder);
  };

  const handleSelectSrsFilter = (filter: 'due' | 'learning' | 'mastered' | 'all') => {
    setSrsFilter(filter);
    localStorage.setItem('b2_flashcards_srs_filter', filter);
    rebuildDeck(flashcardCategory, items, favorites, srsRecords, filter, isRandomOrder);
  };

  const handleToggleRandomOrder = () => {
    const next = !isRandomOrder;
    setIsRandomOrder(next);
    localStorage.setItem('b2_flashcards_random', String(next));
    rebuildDeck(flashcardCategory, items, favorites, srsRecords, srsFilter, next);
  };

  const handleReshuffleDeck = () => {
    rebuildDeck(flashcardCategory, items, favorites, srsRecords, srsFilter, true);
  };

  const handleResetCategoryProgress = (cat: string) => {
    const idsInCat = (cat === 'all'
      ? items
      : cat === 'favorites'
      ? items.filter((i) => favorites.includes(i.id))
      : items.filter((i) => i.category === cat)
    ).map((i) => i.id);

    const updatedRecords = { ...srsRecords };
    idsInCat.forEach((id) => {
      delete updatedRecords[id];
    });

    setSrsRecords(updatedRecords);
    saveFlashcardSrsRecords(updatedRecords);
    rebuildDeck(cat, items, favorites, updatedRecords, srsFilter, isRandomOrder);
  };

  const handleNextCard = React.useCallback(() => {
    setIsFlipped(false);
    setShowFlashcardHint(false);
    setCardIndex((prev) => (prev + 1 < flashcardDeck.length ? prev + 1 : 0));
  }, [flashcardDeck.length]);

  const handlePrevCard = React.useCallback(() => {
    setIsFlipped(false);
    setShowFlashcardHint(false);
    setCardIndex((prev) => (prev - 1 >= 0 ? prev - 1 : Math.max(flashcardDeck.length - 1, 0)));
  }, [flashcardDeck.length]);

  // SM-2 Spaced Repetition Rating Action
  const handleRateCard = React.useCallback(
    (rating: SrsRating) => {
      if (!currentFlashcard) return;
      const cardId = currentFlashcard.id;
      const currentRec = srsRecords[cardId];
      const nextRec = calculateNextSrsState(currentRec, rating);

      const nextRecords = { ...srsRecords, [cardId]: nextRec };
      setSrsRecords(nextRecords);
      saveFlashcardSrsRecords(nextRecords);

      // Record streak activity
      recordStreakActivity();

      if (srsFilter === 'due') {
        if (rating === 'again') {
          // Re-queue card to the end of current session deck so learner practices it again today
          const currentItem = currentFlashcard;
          const withoutCurrent = flashcardDeck.filter((_, idx) => idx !== cardIndex);
          const nextDeck = [...withoutCurrent, currentItem];
          setFlashcardDeck(nextDeck);
          setIsFlipped(false);
          setShowFlashcardHint(false);
        } else {
          // Graduated/postponed from today's due batch
          const nextDeck = flashcardDeck.filter((c) => c.id !== cardId);
          setFlashcardDeck(nextDeck);
          setIsFlipped(false);
          setShowFlashcardHint(false);
          if (cardIndex >= nextDeck.length) {
            setCardIndex(Math.max(nextDeck.length - 1, 0));
          }
          if (nextDeck.length === 0) {
            confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
          }
        }
      } else {
        handleNextCard();
      }
    },
    [currentFlashcard, srsRecords, srsFilter, flashcardDeck, cardIndex, handleNextCard]
  );

  // Keyboard Navigation for Flashcards
  useEffect(() => {
    if (activeTab !== 'flashcards' || flashcardDeck.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === '1' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRateCard('again');
      } else if (e.key === '2' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleRateCard('hard');
      } else if (e.key === '3' || e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleRateCard('good');
      } else if (e.key === '4' || e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleRateCard('easy');
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowFlashcardHint((prev) => !prev);
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (currentFlashcard) speakGerman(currentFlashcard.term);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, flashcardDeck.length, currentFlashcard, handleNextCard, handlePrevCard, handleRateCard]);

  // ================= 3. COLLOCATIONS QUIZ STATE =================
  const [quizCategory, setQuizCategory] = useState<string>('all');
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);
  const [quizQuestions, setQuizQuestions] = useState<WortschatzItem[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizMistakes, setQuizMistakes] = useState<number>(0);
  const [quizMistakesList, setQuizMistakesList] = useState<Array<{ item: WortschatzItem; userAnswer: string }>>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const startNewQuiz = React.useCallback((customPool?: WortschatzItem[], customLimit?: number) => {
    let pool = customPool;
    if (!pool) {
      const eligible = items.filter((i) => i.gapOptions && i.gapOptions.length >= 2 && i.gapAnswer);
      if (quizCategory === 'all') {
        pool = eligible;
      } else {
        pool = eligible.filter((i) => i.category === quizCategory);
      }
    }

    const limit = customLimit || (quizQuestionCount === -1 ? pool.length : quizQuestionCount);
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, limit);
    setQuizQuestions(shuffled);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizMistakes(0);
    setQuizMistakesList([]);
    setQuizFinished(false);
  }, [items, quizCategory, quizQuestionCount]);

  const handleRetryMistakes = () => {
    const mistakeItems = quizMistakesList.map((m) => m.item);
    if (mistakeItems.length > 0) {
      startNewQuiz(mistakeItems, mistakeItems.length);
    }
  };

  useEffect(() => {
    if (activeTab === 'quiz' && quizQuestions.length === 0) {
      startNewQuiz();
    }
  }, [activeTab, quizQuestions.length, startNewQuiz]);

  const currentQuizQuestion = quizQuestions[quizIndex];

  // Randomize the 4 options so the correct answer is not always first (A)
  const shuffledQuizOptions = useMemo(() => {
    if (!currentQuizQuestion?.gapOptions || currentQuizQuestion.gapOptions.length === 0) return [];
    const opts = [...currentQuizQuestion.gapOptions];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentQuizQuestion]);

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

  // ================= 4. ZUORDNUNGSSPIEL (MATCH GAME) STATE =================
  const [matchPairCount, setMatchPairCount] = useState<number>(6);
  const [matchCategory, setMatchCategory] = useState<string>('nvv');
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);
  const [matchSelectedRight, setMatchSelectedRight] = useState<string | null>(null);
  const [matchedItemIds, setMatchedItemIds] = useState<string[]>([]);
  const [matchWrongPair, setMatchWrongPair] = useState<{ leftId: string; rightId: string } | null>(null);
  const [matchAttempts, setMatchAttempts] = useState<number>(0);
  const [matchFinished, setMatchFinished] = useState<boolean>(false);

  // Pool for matching pairs
  const eligibleMatchPool = useMemo(() => {
    const pool = items.filter((i) => i.gapAnswer && i.gapAnswer.trim().length > 0);
    if (matchCategory === 'all') return pool;
    return pool.filter((i) => i.category === matchCategory);
  }, [items, matchCategory]);

  const [activeMatchItems, setActiveMatchItems] = useState<WortschatzItem[]>([]);
  const [shuffledLeftCards, setShuffledLeftCards] = useState<Array<{ id: string; text: string; meaning: string }>>([]);
  const [shuffledRightCards, setShuffledRightCards] = useState<Array<{ id: string; text: string }>>([]);

  const startNewMatchGame = React.useCallback(() => {
    const selected = [...eligibleMatchPool].sort(() => 0.5 - Math.random()).slice(0, matchPairCount);
    setActiveMatchItems(selected);

    // Left cards: Noun part / prompt with gap
    const lefts = selected.map((item) => {
      // Create clean left phrase (e.g. "eine Entscheidung [ ___ ]" or noun phrase)
      let promptText = item.term;
      if (item.gapAnswer) {
        promptText = item.term.replace(new RegExp(`\\b${item.gapAnswer}\\b`, 'i'), '[ ___ ]');
      }
      return {
        id: item.id,
        text: promptText,
        meaning: item.simpleMeaning,
      };
    });

    // Right cards: Verbs / collocations
    const rights = selected.map((item) => ({
      id: item.id,
      text: item.gapAnswer || item.term.split(' ').pop() || '',
    }));

    setShuffledLeftCards([...lefts].sort(() => 0.5 - Math.random()));
    setShuffledRightCards([...rights].sort(() => 0.5 - Math.random()));
    setMatchedItemIds([]);
    setMatchSelectedLeft(null);
    setMatchSelectedRight(null);
    setMatchWrongPair(null);
    setMatchAttempts(0);
    setMatchFinished(false);
  }, [eligibleMatchPool, matchPairCount]);

  useEffect(() => {
    if (activeTab === 'match') {
      startNewMatchGame();
    }
  }, [activeTab, startNewMatchGame]);

  const handleSelectLeftCard = (id: string) => {
    if (matchedItemIds.includes(id)) return;
    setMatchSelectedLeft(id);

    // If a right card was already selected, check match immediately
    if (matchSelectedRight) {
      checkMatch(id, matchSelectedRight);
    }
  };

  const handleSelectRightCard = (id: string) => {
    if (matchedItemIds.includes(id)) return;
    setMatchSelectedRight(id);

    // If a left card was already selected, check match immediately
    if (matchSelectedLeft) {
      checkMatch(matchSelectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    setMatchAttempts((prev) => prev + 1);

    if (leftId === rightId) {
      // MATCH!
      const nextMatched = [...matchedItemIds, leftId];
      setMatchedItemIds(nextMatched);
      setMatchSelectedLeft(null);
      setMatchSelectedRight(null);
      setMatchWrongPair(null);

      if (nextMatched.length === activeMatchItems.length && activeMatchItems.length > 0) {
        setMatchFinished(true);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      // WRONG MATCH
      setMatchWrongPair({ leftId, rightId });
      setTimeout(() => {
        setMatchSelectedLeft(null);
        setMatchSelectedRight(null);
        setMatchWrongPair(null);
      }, 650);
    }
  };

  // ================= 5. GRANULAR & GLOBAL STATS RESET =================
  const [resetTarget, setResetTarget] = useState<ResetTarget>(null);

  const handleExecuteReset = () => {
    if (resetTarget === 'all') {
      localStorage.removeItem('b2_flashcards_srs_data');
      localStorage.removeItem('b2_flashcards_learned');
      localStorage.removeItem('b2_wortschatz_favorites');
      setSrsRecords({});
      setFavorites([]);
      setQuizScore(0);
      setQuizMistakes(0);
      setQuizMistakesList([]);
      setQuizAnswers({});
      setQuizFinished(false);
      setMatchedItemIds([]);
      rebuildDeck(flashcardCategory, items, [], {}, srsFilter, isRandomOrder);
    } else if (resetTarget === 'flashcards') {
      localStorage.removeItem('b2_flashcards_srs_data');
      localStorage.removeItem('b2_flashcards_learned');
      setSrsRecords({});
      setCardIndex(0);
      rebuildDeck(flashcardCategory, items, favorites, {}, srsFilter, isRandomOrder);
    } else if (resetTarget === 'quiz') {
      setQuizScore(0);
      setQuizMistakes(0);
      setQuizMistakesList([]);
      setQuizAnswers({});
      setQuizFinished(false);
      startNewQuiz();
    } else if (resetTarget === 'match') {
      startNewMatchGame();
    }
    setResetTarget(null);
  };

  const totalMasteredCount = useMemo(() => {
    return Object.values(srsRecords).filter((r) => r.status === 'mastered').length;
  }, [srsRecords]);

  const totalDueCount = useMemo(() => {
    return items.filter((i) => isCardDueToday(srsRecords[i.id])).length;
  }, [items, srsRecords]);

  const masteredPercent = Math.round((totalMasteredCount / (items.length || 1)) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* ================= HERO HEADER ================= */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 border border-indigo-500/30 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 rounded-full text-xs font-black border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> B2 Beruf Vokabel- & Grammatik-Hub
            </div>

            {/* Global Stats Counter & Reset Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{totalDueCount} fällig · {totalMasteredCount} / {items.length} gemeistert ({masteredPercent}%)</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{favorites.length} gemerkt</span>
              </div>

              <button
                type="button"
                onClick={() => setResetTarget('all')}
                title="Gesamten Lernfortschritt zurücksetzen"
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Fortschritt zurücksetzen</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Wortschatz & Nomen-Verb-Verbindungen
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-1 max-w-3xl">
              Beherrschen Sie die wichtigsten berufsbezogenen Wendungen, Redemittel und Präpositionen für die telc / BAMF Deutsch-Test für den Beruf (DTB) B2 Prüfung.
            </p>
          </div>

          {/* ================= 4 RICH INTERACTIVE MODE SELECTION CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Card 1: Übersicht & Suche */}
            <div
              onClick={() => setActiveTab('lexikon')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                activeTab === 'lexikon'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  {activeTab === 'lexikon' && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">
                      Aktiv
                    </span>
                  )}
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">1. Übersicht & Suche</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Vollständiges Lexikon aller Begriffe mit Filtern, Beispielsätzen & Audio.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                <span>📚 {items.length} Begriffe</span>
                <span>⭐ {favorites.length} gemerkt</span>
              </div>
            </div>

            {/* Card 2: Karteikarten (SRS) */}
            <div
              onClick={() => setActiveTab('flashcards')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left relative group ${
                activeTab === 'flashcards'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <RotateCw className="w-4 h-4" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeTab === 'flashcards' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">
                        Aktiv
                      </span>
                    )}
                    {totalMasteredCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResetTarget('flashcards');
                        }}
                        title="Karteikarten-Fortschritt zurücksetzen"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">2. Karteikarten (SRS)</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Spaced Repetition (SuperMemo-2) zum Einprägen mit Lückentext & Intervall-Planung.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                <span className="text-amber-700 dark:text-amber-400">🔥 {totalDueCount} fällig</span>
                <span className="text-emerald-700 dark:text-emerald-400">🏆 {totalMasteredCount} gemeistert ({masteredPercent}%)</span>
              </div>
            </div>

            {/* Card 3: Kollokations-Quiz */}
            <div
              onClick={() => setActiveTab('quiz')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left relative group ${
                activeTab === 'quiz'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4 text-amber-500" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeTab === 'quiz' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">
                        Aktiv
                      </span>
                    )}
                    {(quizScore > 0 || quizMistakesList.length > 0) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResetTarget('quiz');
                        }}
                        title="Quiz-Ergebnis & Fehlerliste zurücksetzen"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">3. Kollokations-Quiz</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  4-Optionen Lückentext-Trainer mit gezieltem Fehlertraining.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                <span className="text-indigo-600 dark:text-indigo-400">🎯 {quizScore} / {quizQuestions.length || 10} Punkte</span>
                {quizMistakesList.length > 0 && <span className="text-rose-500">{quizMistakesList.length} Fehler</span>}
              </div>
            </div>

            {/* Card 4: Zuordnungsspiel */}
            <div
              onClick={() => setActiveTab('match')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left relative group ${
                activeTab === 'match'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Puzzle className="w-4 h-4 text-emerald-500" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeTab === 'match' && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">
                        Aktiv
                      </span>
                    )}
                    {matchedItemIds.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResetTarget('match');
                        }}
                        title="Zuordnungsspiel neu starten"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">4. Zuordnungsspiel</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Verbinden Sie Nomen und die passenden Verben schnell per Klick.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-700 dark:text-emerald-400">🧩 {matchedItemIds.length} / {activeMatchItems.length} gelöst</span>
                <span className="text-slate-500 dark:text-slate-400">{matchAttempts} Versuche</span>
              </div>
            </div>
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
                onClick={() => setSelectedCategoryFilter('konnektoren')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'konnektoren'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                🔀 Konnektoren ({konnektorenCount})
              </button>

              <button
                onClick={() => setSelectedCategoryFilter('kollokationen')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedCategoryFilter === 'kollokationen'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800'
                }`}
              >
                💎 Kollokationen ({kollokationenCount})
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedItems.map((item) => {
                const catDef = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.nvv;
                const isFav = favorites.includes(item.id);
                const translationText = item.translations?.[targetLang] || null;

                return (
                  <div
                    key={item.id}
                    className="glass-panel p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4 shadow-sm hover:shadow-md"
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
                        <span className="text-slate-400 dark:text-slate-600 text-xs italic">
                          Keine Übersetzung ({targetLang.toUpperCase()})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination & Load More Controls */}
            {filteredItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <span className="font-bold">
                  Zeige {Math.min(visibleCount, filteredItems.length)} von {filteredItems.length} Begriffen
                </span>

                {visibleCount < filteredItems.length && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      +24 weitere anzeigen
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredItems.length)}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      Alle anzeigen ({filteredItems.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )}

      {/* ================= TAB 2: KARTEIKARTEN (SPACED REPETITION SRS) ================= */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          {/* Deck selector, Mode toggles, Language & SRS Progress Banner */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Row 1: Deck, Order mode, Language */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Deck:</span>
                  <select
                    value={flashcardCategory}
                    onChange={(e) => handleSelectFlashcardCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">🌟 Alle ({items.length})</option>
                    <option value="nvv">🔗 NVV ({nvvCount})</option>
                    <option value="redemittel">💬 Redemittel ({redemittelCount})</option>
                    <option value="praepositionen">📌 Präpositionen ({praepositionenCount})</option>
                    <option value="geschaeft">💼 Geschäft ({geschaeftCount})</option>
                    <option value="konnektoren">🔀 Konnektoren ({konnektorenCount})</option>
                    <option value="kollokationen">💎 Kollokationen ({kollokationenCount})</option>
                    <option value="favorites">⭐ Favoriten ({favorites.length})</option>
                  </select>
                </div>

                {/* Random vs Sequential Order Toggle */}
                <button
                  type="button"
                  onClick={handleToggleRandomOrder}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isRandomOrder
                      ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                  title={isRandomOrder ? 'Zufallsmodus aktiv' : 'Reihenfolge 1, 2, 3...'}
                >
                  {isRandomOrder ? (
                    <>
                      <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Zufällig</span>
                    </>
                  ) : (
                    <>
                      <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Nach Reihenfolge</span>
                    </>
                  )}
                </button>

                {/* Reshuffle button if Random is active */}
                {isRandomOrder && (
                  <button
                    type="button"
                    onClick={handleReshuffleDeck}
                    className="p-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Deck neu mischen"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Flashcard Language Selector */}
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <select
                  value={targetLang}
                  onChange={(e) => handleSetTargetLang(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                >
                  {SUPPORTED_TRANSLATION_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: SRS Smart Learning Filter Tabs */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectSrsFilter('due')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    srsFilter === 'due'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40'
                      : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Heute fällig</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    srsFilter === 'due' ? 'bg-black/20 text-slate-950' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {catDueCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSrsFilter('learning')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    srsFilter === 'learning'
                      ? 'bg-indigo-600 text-white shadow-md font-black'
                      : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>In Wiederholung</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
                    {catLearningCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSrsFilter('mastered')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    srsFilter === 'mastered'
                      ? 'bg-emerald-600 text-white shadow-md font-black'
                      : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Gemeistert</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {catMasteredCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSrsFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    srsFilter === 'all'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md font-black'
                      : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Alle ({catTotalCount})</span>
                </button>
              </div>

              {/* Progress and card counter info */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Fortschritt: <strong className="text-emerald-600 dark:text-emerald-400">{catMasteredCount}</strong> von {catTotalCount} gemeistert ({catProgressPercent}%)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {flashcardDeck.length > 0 && (
                    <span className="text-slate-500 font-mono">
                      Karte {cardIndex + 1} / {flashcardDeck.length}
                    </span>
                  )}
                  {catMasteredCount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleResetCategoryProgress(flashcardCategory)}
                      className="text-[11px] font-bold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Lernfortschritt für dieses Deck zurücksetzen"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Zurücksetzen</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${catProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Flashcard Body */}
          {flashcardDeck.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-300 dark:border-slate-800 text-center space-y-5 animate-fadeIn">
              {srsFilter === 'due' ? (
                <>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <Trophy className="w-9 h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      Großartig! Alle fälligen Karten für heute gelernt! 🎉
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                      Das Intervall-System (SRS) plant die nächsten Wiederholungen automatisch für morgen und die kommenden Tage.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectSrsFilter('all')}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Alle {catTotalCount} Karten ansehen / freies Üben</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Keine Karten in dieser Ansicht
                  </h3>
                  <p className="text-xs text-slate-500">
                    Wählen Sie einen anderen Filter oder fügen Sie neue Ausdrücke hinzu.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectSrsFilter('all')}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
                  >
                    Alle Karten anzeigen
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 3D Flip Card Container */}
              <div
                key={currentFlashcard.id}
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative min-h-[340px] sm:min-h-[380px] p-6 sm:p-8 rounded-3xl glass-panel border-2 border-indigo-500/40 shadow-xl cursor-pointer select-none flex flex-col justify-between transition-all hover:border-indigo-500 group"
              >
                {/* Header info: Category badge & SRS Interval status badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        CATEGORY_LABELS[currentFlashcard.category]?.color || ''
                      }`}
                    >
                      {CATEGORY_LABELS[currentFlashcard.category]?.icon}{' '}
                      {CATEGORY_LABELS[currentFlashcard.category]?.label}
                    </span>

                    {/* Dynamic SRS Badge */}
                    {(() => {
                      const srsStatus = getScheduleStatusLabel(srsRecords[currentFlashcard.id]);
                      return (
                        <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-black border flex items-center gap-1 ${srsStatus.colorClass}`}>
                          {srsStatus.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                  /* FRONT: MEANING / PROMPT & GAP EXERCISE (NO SPOILER, NO TRANSLATION ON FRONT) */
                  <div className="space-y-4 text-center my-auto py-4 animate-fadeIn">
                    <div className="inline-block px-3.5 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                      💡 Gesuchte Bedeutung / Kontext:
                    </div>

                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      "{currentFlashcard.simpleMeaning}"
                    </div>

                    {/* Sentence with Gap */}
                    <div className="p-4 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium italic">
                      "{currentFlashcard.gapExample || currentFlashcard.exampleSentence}"
                    </div>

                    {showFlashcardHint && currentFlashcard.grammar && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-semibold animate-fadeIn">
                        📌 Grammatik-Hinweis: {currentFlashcard.grammar}
                      </div>
                    )}
                  </div>
                ) : (
                  /* BACK: FULL TERM REVEAL, FULL SENTENCE, GRAMMAR, SYNONYMS & TRANSLATIONS */
                  <div className="space-y-3.5 text-left my-auto py-2 animate-fadeIn">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Richtiger Ausdruck:
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {currentFlashcard.term}
                        </div>
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                          👉 {currentFlashcard.simpleMeaning}
                        </div>
                      </div>

                      {/* Audio Button on Back */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakGerman(currentFlashcard.term);
                        }}
                        className="p-2.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md transition-colors shrink-0 cursor-pointer"
                        title="Ausdruck anhören (A)"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
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
                        {currentFlashcard.translations?.[targetLang] ? (
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            {currentFlashcard.translations[targetLang]}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-xs italic">
                            —
                          </span>
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
                    <span>{showFlashcardHint ? 'Tipp verbergen (T)' : 'Tipp anzeigen (T)'}</span>
                  </button>

                  <span className="font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <RotateCw className="w-3.5 h-3.5" /> {isFlipped ? 'Zurückdrehen (Leertaste)' : 'Klicken zum Aufdecken (Leertaste)'}
                  </span>
                </div>
              </div>

              {/* SM-2 Spaced Repetition Rating Buttons */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Rating 1: Nochmal (< 1 Min) */}
                  <button
                    type="button"
                    onClick={() => handleRateCard('again')}
                    className="p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/40 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                    title="Nicht gewusst (Taste 1 oder R)"
                  >
                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <XCircle className="w-4 h-4" />
                      <span>Nochmal (1)</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500 opacity-90">
                      {getNextIntervalPreview(srsRecords[currentFlashcard.id], 'again')}
                    </span>
                  </button>

                  {/* Rating 2: Schwer (1 Tag) */}
                  <button
                    type="button"
                    onClick={() => handleRateCard('hard')}
                    className="p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Schwer erinnert (Taste 2 oder S)"
                  >
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span>Schwer (2)</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 opacity-90">
                      {getNextIntervalPreview(srsRecords[currentFlashcard.id], 'hard')}
                    </span>
                  </button>

                  {/* Rating 3: Gut (3-4 Tage) */}
                  <button
                    type="button"
                    onClick={() => handleRateCard('good')}
                    className="p-3 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    title="Gut gewusst (Taste 3 oder G)"
                  >
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Gut (3)</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-500 opacity-90">
                      {getNextIntervalPreview(srsRecords[currentFlashcard.id], 'good')}
                    </span>
                  </button>

                  {/* Rating 4: Einfach (7+ Tage) */}
                  <button
                    type="button"
                    onClick={() => handleRateCard('easy')}
                    className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    title="Sofort gewusst (Taste 4 oder E)"
                  >
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Einfach (4)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 opacity-90">
                      {getNextIntervalPreview(srsRecords[currentFlashcard.id], 'easy')}
                    </span>
                  </button>
                </div>

                {/* Secondary navigation buttons: Previous / Next without rating */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrevCard}
                    className="px-3 py-1.5 rounded-xl glass-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Zurück (←)
                  </button>

                  <div className="text-center text-[10px] text-slate-400 font-medium">
                    ⌨️ <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Leertaste</kbd> Aufdecken · <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">1-4</kbd> Bewertung
                  </div>

                  <button
                    type="button"
                    onClick={handleNextCard}
                    className="px-3 py-1.5 rounded-xl glass-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Überspringen (→) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: COLLOCATIONS QUIZ (TRAINER) ================= */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
          {/* Quiz Configuration & Filter Bar */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Category selector */}
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Bereich:</span>
                  <select
                    value={quizCategory}
                    onChange={(e) => {
                      setQuizCategory(e.target.value);
                      setTimeout(() => startNewQuiz(), 0);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="all">🌟 Alle Bereiche</option>
                    <option value="nvv">🔗 NVV</option>
                    <option value="redemittel">💬 Redemittel</option>
                    <option value="praepositionen">📌 Präpositionen</option>
                    <option value="geschaeft">💼 Geschäft</option>
                    <option value="konnektoren">🔀 Konnektoren</option>
                    <option value="kollokationen">💎 Kollokationen</option>
                  </select>
                </div>

                {/* Question Count selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Länge:</span>
                  <select
                    value={quizQuestionCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setQuizQuestionCount(count);
                      setTimeout(() => startNewQuiz(undefined, count === -1 ? undefined : count), 0);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={10}>10 Fragen</option>
                    <option value={20}>20 Fragen</option>
                    <option value={30}>30 Fragen</option>
                    <option value={-1}>Alle Fragen</option>
                  </select>
                </div>
              </div>

              {/* Restart Button */}
              <button
                onClick={() => startNewQuiz()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black flex items-center gap-1.5 transition-all self-end sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Neu mischen
              </button>
            </div>
          </div>

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
                  <RefreshCw className="w-4 h-4" /> Neues Quiz starten ({quizQuestions.length} Fragen)
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

              {/* 4 Multiple-Choice Options (Randomized order) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shuffledQuizOptions.map((opt, optIdx) => {
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

      {/* ================= TAB 4: ZUORDNUNGSSPIEL (NVV & KOLLOKATIONEN MATCH) ================= */}
      {activeTab === 'match' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          {/* Game Controls Bar */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Category selector */}
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Kategorie:</span>
                  <select
                    value={matchCategory}
                    onChange={(e) => setMatchCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="nvv">🔗 NVV (Nomen ↔ Verben)</option>
                    <option value="praepositionen">📌 Präpositionen</option>
                    <option value="konnektoren">🔀 Konnektoren</option>
                    <option value="kollokationen">💎 Kollokationen</option>
                    <option value="all">🌟 Alle Ausdrücke</option>
                  </select>
                </div>

                {/* Pairs count selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Paare:</span>
                  <select
                    value={matchPairCount}
                    onChange={(e) => setMatchPairCount(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={4}>4 Paare (Schnell)</option>
                    <option value={6}>6 Paare (Standard)</option>
                    <option value={8}>8 Paare (Profi)</option>
                  </select>
                </div>
              </div>

              {/* Counters & Restart */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  Versuche: {matchAttempts}
                </span>
                <button
                  onClick={startNewMatchGame}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Neu mischen
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    activeMatchItems.length > 0
                      ? Math.round((matchedItemIds.length / activeMatchItems.length) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Game Body */}
          {matchFinished ? (
            /* Victory Screen */
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center space-y-6 shadow-2xl animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                  Hervorragend gelöst! 🏆
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Sie haben alle {activeMatchItems.length} Paare in {matchAttempts} Versuchen richtig zugeordnet.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={startNewMatchGame}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Nächste Runde spielen
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Matching Columns */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Nomen-Teil / Ausdrücke */}
              <div className="space-y-3">
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-1">
                  1. Nomen / Ausdruck wählen:
                </div>
                <div className="space-y-2.5">
                  {shuffledLeftCards.map((card) => {
                    const isMatched = matchedItemIds.includes(card.id);
                    const isSelected = matchSelectedLeft === card.id;
                    const isWrong = matchWrongPair?.leftId === card.id;

                    let cardClass =
                      'glass-card text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 hover:border-indigo-500';

                    if (isMatched) {
                      cardClass =
                        'bg-emerald-500/20 border-emerald-500/60 text-emerald-800 dark:text-emerald-300 opacity-60 cursor-default line-through';
                    } else if (isWrong) {
                      cardClass =
                        'bg-rose-500/30 border-rose-500 text-rose-900 dark:text-rose-200 animate-pulse';
                    } else if (isSelected) {
                      cardClass =
                        'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400 scale-[1.02]';
                    }

                    return (
                      <button
                        key={card.id}
                        onClick={() => handleSelectLeftCard(card.id)}
                        disabled={isMatched}
                        className={`w-full p-4 rounded-2xl border text-left transition-all font-extrabold text-xs sm:text-sm flex items-center justify-between gap-2 cursor-pointer ${cardClass}`}
                      >
                        <div>
                          <div className="text-sm font-black">{card.text}</div>
                          <div className="text-[11px] font-medium opacity-75 mt-0.5">
                            👉 {card.meaning}
                          </div>
                        </div>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Passende Verben / Kollokationen */}
              <div className="space-y-3">
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider px-1">
                  2. Passendes Verb / Element wählen:
                </div>
                <div className="space-y-2.5">
                  {shuffledRightCards.map((card) => {
                    const isMatched = matchedItemIds.includes(card.id);
                    const isSelected = matchSelectedRight === card.id;
                    const isWrong = matchWrongPair?.rightId === card.id;

                    let cardClass =
                      'glass-card text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 hover:border-emerald-500';

                    if (isMatched) {
                      cardClass =
                        'bg-emerald-500/20 border-emerald-500/60 text-emerald-800 dark:text-emerald-300 opacity-60 cursor-default line-through';
                    } else if (isWrong) {
                      cardClass =
                        'bg-rose-500/30 border-rose-500 text-rose-900 dark:text-rose-200 animate-pulse';
                    } else if (isSelected) {
                      cardClass =
                        'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400 scale-[1.02]';
                    }

                    return (
                      <button
                        key={card.id}
                        onClick={() => handleSelectRightCard(card.id)}
                        disabled={isMatched}
                        className={`w-full p-4 rounded-2xl border text-left transition-all font-extrabold text-sm sm:text-base flex items-center justify-between gap-2 cursor-pointer ${cardClass}`}
                      >
                        <span className="font-black tracking-wide">{card.text}</span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= BULLETPROOF PORTAL RESET CONFIRMATION MODAL ================= */}
      {resetTarget &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/40 dark:bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={() => setResetTarget(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white animate-fadeIn relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {resetTarget === 'all'
                      ? 'Gesamten Fortschritt zurücksetzen?'
                      : resetTarget === 'flashcards'
                      ? 'Karteikarten-Fortschritt zurücksetzen?'
                      : resetTarget === 'quiz'
                      ? 'Quiz-Statistik zurücksetzen?'
                      : 'Zuordnungsspiel neu starten?'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {resetTarget === 'all'
                      ? 'Alle gelernten Vokabeln & Quiz-Daten werden zurückgesetzt.'
                      : resetTarget === 'flashcards'
                      ? 'Gelernt-Status der Karteikarten wird auf 0 gesetzt.'
                      : resetTarget === 'quiz'
                      ? 'Punkte und Fehlerliste werden geleert.'
                      : 'Ein neues Spiel mit neuen Paaren wird gestartet.'}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {resetTarget === 'all'
                  ? 'Möchten Sie Ihren gesamten Lernfortschritt für alle Wortschatz-Bereiche unwiderruflich zurücksetzen?'
                  : resetTarget === 'flashcards'
                  ? 'Möchten Sie den Lernstatus aller Karteikarten zurücksetzen und den Stapel von vorne beginnen?'
                  : resetTarget === 'quiz'
                  ? 'Möchten Sie Ihre Quiz-Punkte und die aktuelle Fehlerliste zurücksetzen?'
                  : 'Möchten Sie das aktuelle Zuordnungsspiel abbrechen und eine neue Runde starten?'}
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Ja, zurücksetzen
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
