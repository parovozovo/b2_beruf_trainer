import React, { useState, useEffect } from 'react';
import type {
  Modelltest,
  TileType,
  PromoCode,
  ForumsbeitragTopic,
  QuestionABC,
  Hoeren1Question,
  Lesen1Variant,
  Lesen2Variant,
  Lesen3Variant,
  Lesen4Variant,
  LesenSchreibenVariant,
  Hoeren1Variant,
  Hoeren2Variant,
  Hoeren3Variant,
  Hoeren4Variant,
  HoerenSchreibenVariant,
  Sprachbausteine1Variant,
  Sprachbausteine2Variant,
} from '../types';
import { AudioPlayerBlock } from './TilePractice';
import {
  Shield,
  Plus,
  Key,
  FileText,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Download,
  Upload,
  MessageSquare,
  Mic,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { isSupabaseConfigured } from '../utils/supabase';

interface AdminPanelProps {
  modelltests: Modelltest[];
  onSaveModelltests: (tests: Modelltest[]) => Promise<{ success: boolean; error?: string }> | void;
  promoCodes: PromoCode[];
  onSavePromoCodes: (codes: PromoCode[]) => Promise<{ success: boolean; error?: string }> | void;
  forumsbeitragTopics: ForumsbeitragTopic[];
  onSaveForumsbeitragTopics: (topics: ForumsbeitragTopic[]) => Promise<{ success: boolean; error?: string }> | void;
  sprechenTopics: {
    sprecher1AQuestions: Array<{ id: string; title: string; promptText: string }>;
    sprecher2Topics: Array<{ id: string; title: string; promptText: string }>;
    sprecher3Situations: Array<{ id: string; title: string; promptText: string }>;
  };
  onSaveSprechenTopics: (topics: {
    sprecher1AQuestions: Array<{ id: string; title: string; promptText: string }>;
    sprecher2Topics: Array<{ id: string; title: string; promptText: string }>;
    sprecher3Situations: Array<{ id: string; title: string; promptText: string }>;
  }) => Promise<{ success: boolean; error?: string }> | void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  modelltests,
  onSaveModelltests,
  promoCodes,
  onSavePromoCodes,
  forumsbeitragTopics,
  onSaveForumsbeitragTopics,
  sprechenTopics,
  onSaveSprechenTopics,
}) => {
  const [activeTab, setActiveTab] = useState<'modelltests' | 'promocodes' | 'forumsbeitrag' | 'sprechen'>('modelltests');

  // UI Toast notification state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // New Modelltest form state
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestIsPremium, setNewTestIsPremium] = useState(false);

  // Edit Modelltest Metadata Modal State
  const [editingModelltest, setEditingModelltest] = useState<Modelltest | null>(null);

  // New Promo Code form state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDurationDays, setPromoDurationDays] = useState(30);
  const [promoMaxUses, setPromoMaxUses] = useState(50);

  // Tile Variant Editor State
  const [selectedModelltestId, setSelectedModelltestId] = useState<string>(modelltests[0]?.id || '');
  const [selectedTileType, setSelectedTileType] = useState<TileType>('lesen_1');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('new');

  // --- VISUAL FORM FIELDS STATE FOR TILE VARIANTS ---
  const [vTitle, setVTitle] = useState('');
  const [vText1, setVText1] = useState('');
  const [vText2, setVText2] = useState('');
  const [vHeadingsBlock, setVHeadingsBlock] = useState('');
  const [vAudioUrl, setVAudioUrl] = useState('');

  // Correct answers maps for matching tiles
  const [vCorrectAnswersMap, setVCorrectAnswersMap] = useState<Record<string, string>>({
    '1': 'A',
    '2': 'B',
    '3': 'C',
    '4': 'D',
    '5': 'E',
  });

  // Lesen 2 specific fields
  const [vQ6Text, setVQ6Text] = useState('Die Teilnahme an der betriebsärztlichen Augenuntersuchung ist für Mitarbeiter an Bildschirmarbeitsplätzen verpflichtend.');
  const [vQ6Correct, setVQ6Correct] = useState<'richtig' | 'falsch'>('falsch');
  const [vQ7Text, setVQ7Text] = useState('Wer trägt die Kosten?');
  const [vQ7Options, setVQ7Options] = useState<[string, string, string]>(['Arbeitnehmer', 'Arbeitgeber', 'Krankenkasse']);
  const [vQ7CorrectIndex, setVQ7CorrectIndex] = useState<number>(1);

  const [vQ8Text, setVQ8Text] = useState('Im Falle eines Feueralarms dürfen die Aufzüge zur schnellen Evakuierung genutzt werden.');
  const [vQ8Correct, setVQ8Correct] = useState<'richtig' | 'falsch'>('falsch');
  const [vQ9Text, setVQ9Text] = useState('Verhalten im Alarmfall?');
  const [vQ9Options, setVQ9Options] = useState<[string, string, string]>(['Aufzug nutzen', 'Warten', 'Notausgang nutzen']);
  const [vQ9CorrectIndex, setVQ9CorrectIndex] = useState<number>(2);

  // Questions ABC list (Visual builder)
  const [vQuestionsABCList, setVQuestionsABCList] = useState<QuestionABC[]>([]);

  // Hoeren 1 questions list
  const [vHoeren1QuestionsList, setVHoeren1QuestionsList] = useState<Hoeren1Question[]>([]);

  // Hoeren Schreiben specific
  const [vQ41Correct, setVQ41Correct] = useState<'a' | 'b' | 'c'>('a');

  // Lesen Schreiben Beschwerde prompt
  const [vBeschwerdePrompt, setVBeschwerdePrompt] = useState('');

  // Sprachbausteine 1 gap answers & distractors
  const [vSb1GapsMap, setVSb1GapsMap] = useState<Record<number, string>>({
    46: 'geehrte',
    47: 'ausgeschriebene',
    48: 'verfüge',
    49: 'Verfügung',
    50: 'Einladung',
    51: 'freundlichen',
  });
  const [vSb1DistractorsStr, setVSb1DistractorsStr] = useState('geehrter, gesuchte, besitze');

  // Forumsbeitrag Topic State
  const [fbTitle, setFbTitle] = useState('');
  const [fbPrompt, setFbPrompt] = useState('');
  const [fbIsPremium, setFbIsPremium] = useState(false);

  // Sprechen Topic State
  const [sp2Title, setSp2Title] = useState('');
  const [sp2Prompt, setSp2Prompt] = useState('');
  const [sp3Title, setSp3Title] = useState('');
  const [sp3Prompt, setSp3Prompt] = useState('');

  // Active Modelltest & Variants Lookup
  const activeTest = modelltests.find((m) => m.id === selectedModelltestId) || modelltests[0];
  const existingVariants = ((activeTest?.variants[selectedTileType] as unknown) || []) as Array<{
    id: string;
    title: string;
    textBlock?: string;
    text1?: string;
    text2?: string;
    headingsBlock?: string;
    optionsAtoF?: string;
    protocolText?: string;
    emailsText?: string;
    scriptText?: string;
    textWithGaps?: string;
    audioUrl?: string;
    correctAnswers?: Record<string, string>;
    q6Text?: string;
    q6Correct?: 'richtig' | 'falsch';
    q7?: { questionText: string; options: [string, string, string]; correctIndex: number };
    q8Text?: string;
    q8Correct?: 'richtig' | 'falsch';
    q9?: { questionText: string; options: [string, string, string]; correctIndex: number };
    questions?: QuestionABC[] | Hoeren1Question[];
    q41Correct?: 'a' | 'b' | 'c';
    beschwerdeTopicText?: string;
    extraDistractors?: string[];
  }>;

  // Load selected variant data into visual form fields when selection changes
  useEffect(() => {
    if (selectedVariantId === 'new') {
      setVTitle(`Neue Variante für ${selectedTileType}`);
      setVText1('');
      setVText2('');
      setVHeadingsBlock('');
      setVAudioUrl('');

      if (selectedTileType === 'hoeren_2') {
        setVCorrectAnswersMap({ '28': 'A', '29': 'B', '30': 'C', '31': 'D' });
      } else if (selectedTileType === 'lesen_3') {
        setVCorrectAnswersMap({ '10': 'A', '11': 'B', '12': 'C', '13': 'D' });
      } else {
        setVCorrectAnswersMap({ '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' });
      }

      setVQ6Text('Die Teilnahme an der betriebsärztlichen Augenuntersuchung ist für Mitarbeiter an Bildschirmarbeitsplätzen verpflichtend.');
      setVQ6Correct('falsch');
      setVQ7Text('Wer trägt die Kosten?');
      setVQ7Options(['Arbeitnehmer', 'Arbeitgeber', 'Krankenkasse']);
      setVQ7CorrectIndex(1);
      setVQ8Text('Im Falle eines Feueralarms dürfen die Aufzüge zur schnellen Evakuierung genutzt werden.');
      setVQ8Correct('falsch');
      setVQ9Text('Verhalten im Alarmfall?');
      setVQ9Options(['Aufzug nutzen', 'Warten', 'Notausgang nutzen']);
      setVQ9CorrectIndex(2);
      setVQuestionsABCList(createDefaultQuestionsForTile(selectedTileType));
      setVHoeren1QuestionsList([
        { id: 22, type: 'richtig_falsch', questionText: 'Aussage 22 (Richtig oder Falsch)', correct: 'richtig' },
        { id: 23, type: 'choice', questionText: 'Frage 23 (Mehrfachauswahl)', options: ['Option A', 'Option B', 'Option C'], correct: 0 },
        { id: 24, type: 'richtig_falsch', questionText: 'Aussage 24 (Richtig oder Falsch)', correct: 'falsch' },
        { id: 25, type: 'choice', questionText: 'Frage 25 (Mehrfachauswahl)', options: ['Option A', 'Option B', 'Option C'], correct: 1 },
        { id: 26, type: 'richtig_falsch', questionText: 'Aussage 26 (Richtig oder Falsch)', correct: 'richtig' },
        { id: 27, type: 'choice', questionText: 'Frage 27 (Mehrfachauswahl)', options: ['Option A', 'Option B', 'Option C'], correct: 2 },
      ]);
      setVQ41Correct('a');
      setVBeschwerdePrompt('');
      setVSb1GapsMap({ 46: 'geehrte', 47: 'ausgeschriebene', 48: 'verfüge', 49: 'Verfügung', 50: 'Einladung', 51: 'freundlichen' });
      setVSb1DistractorsStr('geehrter, gesuchte, besitze');
    } else {
      const found = existingVariants.find((v) => v.id === selectedVariantId);
      if (found) {
        setVTitle(found.title || '');
        setVText1(found.text1 || found.textBlock || found.protocolText || found.emailsText || found.scriptText || found.textWithGaps || '');
        setVText2(found.text2 || '');
        setVHeadingsBlock(found.headingsBlock || found.optionsAtoF || '');
        setVAudioUrl(found.audioUrl || '');
        setVCorrectAnswersMap(found.correctAnswers || {});
        if (found.q6Text) setVQ6Text(found.q6Text);
        else setVQ6Text('Die Teilnahme an der betriebsärztlichen Augenuntersuchung ist für Mitarbeiter an Bildschirmarbeitsplätzen verpflichtend.');
        if (found.q6Correct) setVQ6Correct(found.q6Correct);
        if (found.q7) {
          setVQ7Text(found.q7.questionText || '');
          setVQ7Options(found.q7.options || ['A', 'B', 'C']);
          setVQ7CorrectIndex(found.q7.correctIndex || 0);
        }
        if (found.q8Text) setVQ8Text(found.q8Text);
        else setVQ8Text('Im Falle eines Feueralarms dürfen die Aufzüge zur schnellen Evakuierung genutzt werden.');
        if (found.q8Correct) setVQ8Correct(found.q8Correct);
        if (found.q9) {
          setVQ9Text(found.q9.questionText || '');
          setVQ9Options(found.q9.options || ['A', 'B', 'C']);
          setVQ9CorrectIndex(found.q9.correctIndex || 0);
        }
        if (Array.isArray(found.questions)) {
          if (selectedTileType === 'hoeren_1') {
            setVHoeren1QuestionsList(found.questions as Hoeren1Question[]);
          } else {
            setVQuestionsABCList(found.questions as QuestionABC[]);
          }
        }
        if (found.q41Correct) setVQ41Correct(found.q41Correct);
        if (found.beschwerdeTopicText) setVBeschwerdePrompt(found.beschwerdeTopicText);
        if (found.extraDistractors) setVSb1DistractorsStr(found.extraDistractors.join(', '));
      }
    }
  }, [selectedModelltestId, selectedTileType, selectedVariantId]);

  // Handlers for Modelltests List & Properties
  const handleCreateModelltest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) return;

    const newTest: Modelltest = {
      id: `mt-${Date.now()}`,
      title: newTestTitle,
      description: newTestDesc,
      isPremium: newTestIsPremium,
      isHidden: false,
      variants: {
        lesen_1: [],
        lesen_2: [],
        lesen_3: [],
        lesen_4: [],
        lesen_schreiben: [],
        hoeren_1: [],
        hoeren_2: [],
        hoeren_3: [],
        hoeren_4: [],
        hoeren_schreiben: [],
        sprachbausteine_1: [],
        sprachbausteine_2: [],
      },
    };

    const res = await onSaveModelltests([...modelltests, newTest]);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setNewTestTitle('');
      setNewTestDesc('');
      setNewTestIsPremium(false);
      showToast('Neuer Modelltest wurde erfolgreich erstellt & in Supabase gespeichert!');
    }
  };

  const handleDeleteModelltest = async (id: string) => {
    if (!confirm('Möchten Sie diesen Modelltest wirklich löschen?')) return;
    const res = await onSaveModelltests(modelltests.filter((m) => m.id !== id));
    if (res && res.success === false) {
      showToast(`Fehler beim Löschen: ${res.error}`, 'error');
    } else {
      showToast('Modelltest gelöscht.');
    }
  };

  const handleToggleModelltestPremium = async (id: string) => {
    const updated = modelltests.map((m) => (m.id === id ? { ...m, isPremium: !m.isPremium } : m));
    await onSaveModelltests(updated);
    showToast('Premium-Status aktualisiert.');
  };

  const handleToggleModelltestHidden = async (id: string) => {
    const updated = modelltests.map((m) => (m.id === id ? { ...m, isHidden: !m.isHidden } : m));
    await onSaveModelltests(updated);
    showToast('Sichtbarkeitsstatus aktualisiert.');
  };

  const handleSaveModelltestMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModelltest) return;
    const updated = modelltests.map((m) => (m.id === editingModelltest.id ? editingModelltest : m));
    const res = await onSaveModelltests(updated);
    if (res && res.success === false) {
      showToast(`Fehler: ${res.error}`, 'error');
    } else {
      setEditingModelltest(null);
      showToast('Modelltest-Eigenschaften in Supabase gespeichert!');
    }
  };

  // Delete Variant Handler
  const handleDeleteVariant = async (vId: string) => {
    if (!confirm('Variante wirklich löschen?')) return;

    const updatedTests = modelltests.map((m) => {
      if (m.id !== selectedModelltestId) return m;
      const currentList = ((m.variants[selectedTileType] as unknown) || []) as Array<Record<string, unknown>>;
      const filtered = currentList.filter((v) => v.id !== vId);
      return {
        ...m,
        variants: {
          ...m.variants,
          [selectedTileType]: filtered,
        },
      };
    });

    const res = await onSaveModelltests(updatedTests as Modelltest[]);
    if (res && res.success === false) {
      showToast(`Fehler beim Löschen: ${res.error}`, 'error');
    } else {
      setSelectedVariantId('new');
      showToast('Variante gelöscht.');
    }
  };

  // Jump directly to editing a specific tile variant from the Modelltests list
  const handleJumpToEditTile = (testId: string, tileType: TileType, variantId?: string) => {
    setSelectedModelltestId(testId);
    setSelectedTileType(tileType);
    setSelectedVariantId(variantId || 'new');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const getTileABCQuestionRange = (tileType: TileType): { start: number; end: number } => {
    switch (tileType) {
      case 'lesen_4': return { start: 14, end: 18 };
      case 'lesen_schreiben': return { start: 19, end: 20 };
      case 'hoeren_3': return { start: 32, end: 35 };
      case 'hoeren_4': return { start: 36, end: 40 };
      case 'sprachbausteine_2': return { start: 52, end: 57 };
      default: return { start: 14, end: 18 };
    }
  };

  const createDefaultQuestionsForTile = (tileType: TileType): QuestionABC[] => {
    const { start, end } = getTileABCQuestionRange(tileType);
    const list: QuestionABC[] = [];
    for (let qId = start; qId <= end; qId++) {
      list.push({
        id: qId,
        questionText: `Frage ${qId}`,
        options: ['Option A', 'Option B', 'Option C'],
        correctIndex: 0,
      });
    }
    return list;
  };

  // Handlers for Question Builder Items (ABC Questions & Zusatzfragen)
  const handleAddQuestionABC = () => {
    const { start, end } = getTileABCQuestionRange(selectedTileType);
    const maxStandardCount = end - start + 1;
    const maxTotalAllowed = maxStandardCount + 5;

    if (vQuestionsABCList.length >= maxTotalAllowed) {
      showToast(`Maximale Fragenanzahl (${maxTotalAllowed}) für ${selectedTileType} erreicht!`, 'error');
      return;
    }

    const currentMaxId = vQuestionsABCList.length > 0 ? Math.max(...vQuestionsABCList.map((q) => q.id)) : start - 1;
    const nextId = currentMaxId + 1;
    const isExtra = vQuestionsABCList.length >= maxStandardCount;

    setVQuestionsABCList([
      ...vQuestionsABCList,
      {
        id: nextId,
        questionText: isExtra ? `Zusatzfrage ${nextId}` : `Frage ${nextId}`,
        options: ['Option A', 'Option B', 'Option C'],
        correctIndex: 0,
      },
    ]);

    if (isExtra) {
      showToast(`Zusätzliche Übungsfrage (Frage ${nextId}) hinzugefügt.`, 'success');
    }
  };

  const handleUpdateQuestionABC = (index: number, updated: QuestionABC) => {
    const list = [...vQuestionsABCList];
    list[index] = updated;
    setVQuestionsABCList(list);
  };

  const handleRemoveQuestionABC = (index: number) => {
    setVQuestionsABCList(vQuestionsABCList.filter((_, idx) => idx !== index));
  };

  // Handlers for Hoeren 1 Question Builder
  const handleAddHoeren1Question = () => {
    const nextId = vHoeren1QuestionsList.length > 0 ? Math.max(...vHoeren1QuestionsList.map((q) => q.id)) + 1 : 22;
    const isRF = nextId % 2 === 0;
    if (isRF) {
      setVHoeren1QuestionsList([
        ...vHoeren1QuestionsList,
        { id: nextId, type: 'richtig_falsch', questionText: `Aussage ${nextId}`, correct: 'richtig' },
      ]);
    } else {
      setVHoeren1QuestionsList([
        ...vHoeren1QuestionsList,
        { id: nextId, type: 'choice', questionText: `Frage ${nextId}`, options: ['Option A', 'Option B', 'Option C'], correct: 0 },
      ]);
    }
  };

  const handleUpdateHoeren1Question = (index: number, updated: Hoeren1Question) => {
    const list = [...vHoeren1QuestionsList];
    list[index] = updated;
    setVHoeren1QuestionsList(list);
  };

  const handleRemoveHoeren1Question = (index: number) => {
    setVHoeren1QuestionsList(vHoeren1QuestionsList.filter((_, idx) => idx !== index));
  };

  // Save Variant Form Handler
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle.trim()) return;

    const targetId = selectedVariantId === 'new' ? `v-${Date.now()}` : selectedVariantId;
    let constructedVariant: Record<string, unknown> = { id: targetId, title: vTitle };

    if (selectedTileType === 'lesen_1') {
      const v: Lesen1Variant = {
        id: targetId,
        title: vTitle,
        textBlock: vText1,
        headingsBlock: vHeadingsBlock,
        correctAnswers: vCorrectAnswersMap,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'lesen_2') {
      const v: Lesen2Variant = {
        id: targetId,
        title: vTitle,
        text1: vText1,
        q6Text: vQ6Text,
        q6Correct: vQ6Correct,
        q7: { questionText: vQ7Text, options: vQ7Options, correctIndex: vQ7CorrectIndex },
        text2: vText2 || vText1,
        q8Text: vQ8Text,
        q8Correct: vQ8Correct,
        q9: { questionText: vQ9Text, options: vQ9Options, correctIndex: vQ9CorrectIndex },
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'lesen_3') {
      const v: Lesen3Variant = {
        id: targetId,
        title: vTitle,
        text1: vText1,
        text2: vText2,
        optionsAtoF: vHeadingsBlock,
        correctAnswers: vCorrectAnswersMap,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'lesen_4') {
      const v: Lesen4Variant = {
        id: targetId,
        title: vTitle,
        protocolText: vText1,
        questions: vQuestionsABCList,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'lesen_schreiben') {
      const v: LesenSchreibenVariant = {
        id: targetId,
        title: vTitle,
        emailsText: vText1,
        questions: vQuestionsABCList,
        beschwerdeTopicText: vBeschwerdePrompt || 'Schreiben Sie eine Antwort-E-Mail auf die obenstehende Beschwerde.',
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'hoeren_1') {
      const v: Hoeren1Variant = {
        id: targetId,
        title: vTitle,
        audioUrl: vAudioUrl || undefined,
        scriptText: vText1,
        questions: vHoeren1QuestionsList,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'hoeren_2') {
      const v: Hoeren2Variant = {
        id: targetId,
        title: vTitle,
        audioUrl: vAudioUrl || undefined,
        scriptText: vText1,
        optionsAtoF: vHeadingsBlock,
        correctAnswers: vCorrectAnswersMap,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'hoeren_3') {
      const v: Hoeren3Variant = {
        id: targetId,
        title: vTitle,
        audioUrl: vAudioUrl || undefined,
        scriptText: vText1,
        questions: vQuestionsABCList,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'hoeren_4') {
      const v: Hoeren4Variant = {
        id: targetId,
        title: vTitle,
        audioUrl: vAudioUrl || undefined,
        scriptText: vText1,
        questions: vQuestionsABCList,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'hoeren_schreiben') {
      const v: HoerenSchreibenVariant = {
        id: targetId,
        title: vTitle,
        audioUrl: vAudioUrl || undefined,
        scriptText: vText1,
        q41Correct: vQ41Correct,
        fields: [
          { label: 'Name des Anrufers', key: 'name' },
          { label: 'Telefonnummer', key: 'phone' },
          { label: 'Informationen', key: 'info' },
          { label: 'Zu erledigen', key: 'todo' },
        ],
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'sprachbausteine_1') {
      const dists = vSb1DistractorsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const v: Sprachbausteine1Variant = {
        id: targetId,
        title: vTitle,
        textWithGaps: vText1,
        correctAnswers: vSb1GapsMap,
        extraDistractors: dists,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    } else if (selectedTileType === 'sprachbausteine_2') {
      const v: Sprachbausteine2Variant = {
        id: targetId,
        title: vTitle,
        textWithGaps: vText1,
        questions: vQuestionsABCList,
      };
      constructedVariant = v as unknown as Record<string, unknown>;
    }

    const updatedTests = modelltests.map((m) => {
      if (m.id !== selectedModelltestId) return m;
      const currentList = ((m.variants[selectedTileType] as unknown) || []) as Array<Record<string, unknown>>;
      let newList: Record<string, unknown>[] = [];
      if (selectedVariantId === 'new') {
        newList = [...currentList, constructedVariant];
      } else {
        newList = currentList.map((v) => (v.id === selectedVariantId ? constructedVariant : v));
      }
      return {
        ...m,
        variants: {
          ...m.variants,
          [selectedTileType]: newList,
        },
      };
    });

    try {
      const res = await onSaveModelltests(updatedTests as Modelltest[]);
      if (res && res.success === false) {
        showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
      } else {
        setSelectedVariantId(targetId);
        showToast(`Variante "${vTitle}" erfolgreich in Supabase & lokal gespeichert!`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Fehler beim Speichern';
      showToast(`Fehler: ${msg}`, 'error');
    }
  };

  // Promo Code Handlers
  const handleGeneratePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    const newCodeObj: PromoCode = {
      id: `promo-${Date.now()}`,
      code: promoCodeInput.trim().toUpperCase(),
      durationDays: promoDurationDays,
      maxUses: promoMaxUses,
      usedCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      usedByEmails: [],
      active: true,
    };

    const res = await onSavePromoCodes([...promoCodes, newCodeObj]);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setPromoCodeInput('');
      showToast('Gutscheincode erfolgreich erstellt & in Supabase gespeichert!');
    }
  };

  const handleTogglePromoActive = async (id: string) => {
    const updated = promoCodes.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    const res = await onSavePromoCodes(updated);
    if (res && res.success === false) {
      showToast(`Fehler: ${res.error}`, 'error');
    } else {
      showToast('Gutscheincode-Status geändert.');
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    const res = await onSavePromoCodes(promoCodes.filter((c) => c.id !== id));
    if (res && res.success === false) {
      showToast(`Fehler: ${res.error}`, 'error');
    } else {
      showToast('Gutscheincode gelöscht.');
    }
  };

  // Forumsbeitrag Topics Handlers
  const handleAddForumsbeitragTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTitle.trim() || !fbPrompt.trim()) return;
    const newTopic: ForumsbeitragTopic = {
      id: `fb-${Date.now()}`,
      title: fbTitle,
      promptText: fbPrompt,
      isPremium: fbIsPremium,
    };
    const res = await onSaveForumsbeitragTopics([...forumsbeitragTopics, newTopic]);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setFbTitle('');
      setFbPrompt('');
      setFbIsPremium(false);
      showToast('Thema für Q58 Forenbeitrag in Supabase gespeichert!');
    }
  };

  const handleDeleteForumsbeitragTopic = async (id: string) => {
    const res = await onSaveForumsbeitragTopics(forumsbeitragTopics.filter((t) => t.id !== id));
    if (res && res.success === false) {
      showToast(`Fehler: ${res.error}`, 'error');
    } else {
      showToast('Thema gelöscht.');
    }
  };

  // Sprechen Topics Handlers
  const handleAddSp2Topic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sp2Title.trim() || !sp2Prompt.trim()) return;
    const newTopic = { id: `sp2-${Date.now()}`, title: sp2Title, promptText: sp2Prompt };
    const updated = {
      ...sprechenTopics,
      sprecher2Topics: [...sprechenTopics.sprecher2Topics, newTopic],
    };
    const res = await onSaveSprechenTopics(updated);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setSp2Title('');
      setSp2Prompt('');
      showToast('Sprechen Teil 2 Thema in Supabase gespeichert!');
    }
  };

  const handleDeleteSp2Topic = async (id: string) => {
    const updated = {
      ...sprechenTopics,
      sprecher2Topics: sprechenTopics.sprecher2Topics.filter((t) => t.id !== id),
    };
    const res = await onSaveSprechenTopics(updated);
    if (res && res.success === false) {
      showToast(`Fehler: ${res.error}`, 'error');
    } else {
      showToast('Thema gelöscht.');
    }
  };

  const handleAddSp3Situation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sp3Title.trim() || !sp3Prompt.trim()) return;
    const newSit = { id: `sp3-${Date.now()}`, title: sp3Title, promptText: sp3Prompt };
    const updated = {
      ...sprechenTopics,
      sprecher3Situations: [...sprechenTopics.sprecher3Situations, newSit],
    };
    const res = await onSaveSprechenTopics(updated);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setSp3Title('');
      setSp3Prompt('');
      showToast('Sprechen Teil 3 Situation in Supabase gespeichert!');
    }
  };

  const handleDeleteSp3Situation = async (id: string) => {
    const updated = {
      ...sprechenTopics,
      sprecher3Situations: sprechenTopics.sprecher3Situations.filter((s) => s.id !== id),
    };
    const res = await onSaveSprechenTopics(updated);
    if (res && res.success === false) {
      showToast(`Fehler: ${res.error}`, 'error');
    } else {
      showToast('Situation gelöscht.');
    }
  };

  // Export / Import JSON Data
  const handleExportDataJSON = () => {
    const data = { modelltests, promoCodes, forumsbeitragTopics, sprechenTopics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `b2-trainer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportDataJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.modelltests) await onSaveModelltests(parsed.modelltests);
        if (parsed.promoCodes) await onSavePromoCodes(parsed.promoCodes);
        if (parsed.forumsbeitragTopics) await onSaveForumsbeitragTopics(parsed.forumsbeitragTopics);
        if (parsed.sprechenTopics) await onSaveSprechenTopics(parsed.sprechenTopics);
        showToast('Daten erfolgreich importiert!');
      } catch {
        showToast('Fehler beim Importieren der JSON-Datei!', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* UI Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fadeIn text-xs font-bold text-white max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/60 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Verwaltung (Admin-Bereich)
              {isSupabaseConfigured && (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                  ✓ Supabase БД verbunden
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Visueller Editor für alle 12 Prüfungsteile, Gutscheine, Schreiben & Sprechen. Alle Änderungen werden direkt in Supabase gespeichert.
            </p>
          </div>
        </div>

        {/* Action Controls: Sync / Export / Import */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveModelltests(modelltests)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Mit Supabase синхронізація
          </button>
          <button
            onClick={handleExportDataJSON}
            className="px-3 py-1.5 glass-card hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Backup (JSON)
          </button>
          <label className="px-3 py-1.5 glass-card hover:bg-slate-800 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import (JSON)
            <input type="file" accept=".json" onChange={handleImportDataJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="flex flex-wrap bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs gap-1">
        <button
          onClick={() => setActiveTab('modelltests')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'modelltests' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1.5" /> Modelltests & 12 Prüfungsteile
        </button>
        <button
          onClick={() => setActiveTab('promocodes')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'promocodes' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4 inline mr-1.5" /> Gutscheincodes
        </button>
        <button
          onClick={() => setActiveTab('forumsbeitrag')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'forumsbeitrag' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-1.5" /> Schreiben (Q58 Forenbeiträge)
        </button>
        <button
          onClick={() => setActiveTab('sprechen')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'sprechen' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 inline mr-1.5" /> Sprechen (Teil 2 & 3)
        </button>
      </div>

      {/* MODELLTESTS & VARIANTS MANAGEMENT TAB */}
      {activeTab === 'modelltests' && (
        <div className="space-y-6">
          {/* Create New Modelltest Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" /> Neuen Modelltest erstellen
            </h3>

            <form onSubmit={handleCreateModelltest} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Titel des Modelltests</label>
                <input
                  type="text"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  placeholder="Modelltest ABCD..."
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Beschreibung</label>
                <input
                  type="text"
                  value={newTestDesc}
                  onChange={(e) => setNewTestDesc(e.target.value)}
                  placeholder="Beschreibung des Testsets..."
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={newTestIsPremium}
                    onChange={(e) => setNewTestIsPremium(e.target.checked)}
                    className="accent-rose-500 w-4 h-4 rounded"
                  />
                  <span>Premium-Test (isPremium)</span>
                </label>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors ml-auto flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Erstellen & in БД speichern
                </button>
              </div>
            </form>
          </div>

          {/* VISUAL VARIANT EDITOR */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" /> Visueller Editor für Prüfungsteile
              </h3>
              <span className="text-xs text-indigo-400 font-mono font-bold uppercase">
                [{selectedTileType}]
              </span>
            </div>

            {/* Selectors Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">1. Modelltest wählen:</label>
                <select
                  value={selectedModelltestId}
                  onChange={(e) => {
                    setSelectedModelltestId(e.target.value);
                    setSelectedVariantId('new');
                  }}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                >
                  {modelltests.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} {m.isPremium ? '(Premium)' : '(Kostenlos)'} {m.isHidden ? '[VERSTECKT]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">2. Prüfungsteil wählen:</label>
                <select
                  value={selectedTileType}
                  onChange={(e) => {
                    setSelectedTileType(e.target.value as TileType);
                    setSelectedVariantId('new');
                  }}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                >
                  <option value="lesen_1">Lesen 1 (1-5)</option>
                  <option value="lesen_2">Lesen 2 (6-9)</option>
                  <option value="lesen_3">Lesen 3 (10-13)</option>
                  <option value="lesen_4">Lesen 4 (14-18)</option>
                  <option value="lesen_schreiben">Lesen&Schreiben (19-20)</option>
                  <option value="hoeren_1">Hören 1 (22-27)</option>
                  <option value="hoeren_2">Hören 2 (28-31)</option>
                  <option value="hoeren_3">Hören 3 (32-35)</option>
                  <option value="hoeren_4">Hören 4 (36-40)</option>
                  <option value="hoeren_schreiben">Hören&Schreiben (41-45)</option>
                  <option value="sprachbausteine_1">Sprachbausteine 1 (46-51)</option>
                  <option value="sprachbausteine_2">Sprachbausteine 2 (52-57)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">3. Variante bearbeiten oder neu:</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-indigo-300"
                >
                  <option value="new">+ Neue Variante erstellen</option>
                  {existingVariants.map((v) => (
                    <option key={v.id} value={v.id}>✏️ {v.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* VISUAL FORM tailored for active Tile Type */}
            <form onSubmit={handleSaveVariant} className="space-y-6 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {selectedVariantId === 'new' ? 'Neue Variante' : `Variante [${selectedVariantId}] bearbeiten`}
                </span>
                {selectedVariantId !== 'new' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(selectedVariantId)}
                    className="px-3 py-1 bg-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Variante löschen
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Titel der Variante</label>
                <input
                  type="text"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
              </div>

              {selectedTileType.startsWith('hoeren') && (
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    Audio MP3 URL (Supabase Storage / Web URL)
                  </label>
                  <input
                    type="text"
                    value={vAudioUrl}
                    onChange={(e) => setVAudioUrl(e.target.value)}
                    placeholder="https://<your-project>.supabase.co/storage/v1/object/public/audio-files/audio.mp3"
                    className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                  />
                  {vAudioUrl && (
                    <div className="pt-1">
                      <span className="block text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 mb-1.5">
                        ▶️ Live-Vorschau (Admin Audio-Test & Tempo-Steuerung):
                      </span>
                      <AudioPlayerBlock audioUrl={vAudioUrl} scriptText={vText1} autoShowScript={false} />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Haupttext / Text 1 / Skript / Lückentext</label>
                  <textarea
                    value={vText1}
                    onChange={(e) => setVText1(e.target.value)}
                    rows={6}
                    className="w-full p-3 glass-input rounded-xl text-xs font-mono"
                  />
                </div>

                {selectedTileType === 'lesen_2' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Text 2</label>
                    <textarea
                      value={vText2}
                      onChange={(e) => setVText2(e.target.value)}
                      rows={6}
                      className="w-full p-3 glass-input rounded-xl text-xs font-mono"
                    />
                  </div>
                )}

                {(selectedTileType === 'lesen_1' || selectedTileType === 'lesen_3' || selectedTileType === 'hoeren_2') && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Optionen-Text (A-H / A-F)</label>
                    <textarea
                      value={vHeadingsBlock}
                      onChange={(e) => setVHeadingsBlock(e.target.value)}
                      rows={6}
                      className="w-full p-3 glass-input rounded-xl text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* LESEN 1 SPECIFIC VISUAL CORRECT ANSWERS PICKER (1-5) */}
              {selectedTileType === 'lesen_1' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400">Richtige Antworten für Personen 1–5 auswählen (Buchstaben A-H):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['1', '2', '3', '4', '5'].map((num) => (
                      <div key={num} className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-bold">Person {num}</label>
                        <select
                          value={vCorrectAnswersMap[num] || 'A'}
                          onChange={(e) => setVCorrectAnswersMap({ ...vCorrectAnswersMap, [num]: e.target.value })}
                          className="w-full px-2 py-1.5 glass-input rounded-lg text-xs font-bold"
                        >
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((lettr) => (
                            <option key={lettr} value={lettr}>Anzeige {lettr}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LESEN 2 SPECIFIC VISUAL FIELDS (Q6-9) */}
              {selectedTileType === 'lesen_2' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400">Fragen 6 bis 9 konfigurieren:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Q6 */}
                    <div className="p-3 bg-slate-950/60 rounded-lg space-y-2 border border-slate-800">
                      <span className="text-xs font-bold text-white">Frage 6 (Aussage & Richtig / Falsch für Text 1):</span>
                      <input
                        type="text"
                        value={vQ6Text}
                        onChange={(e) => setVQ6Text(e.target.value)}
                        placeholder="Aussage / Fragetext 6..."
                        className="w-full px-2 py-1.5 glass-input rounded text-xs font-medium mb-1"
                      />
                      <div className="flex gap-2">
                        {['richtig', 'falsch'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setVQ6Correct(val as 'richtig' | 'falsch')}
                            className={`flex-1 py-1 rounded text-xs font-bold uppercase ${
                              vQ6Correct === val ? 'bg-indigo-600 text-white' : 'glass-card text-slate-400'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q7 */}
                    <div className="p-3 bg-slate-950/60 rounded-lg space-y-2 border border-slate-800">
                      <span className="text-xs font-bold text-white">Frage 7 (ABC für Text 1):</span>
                      <input
                        type="text"
                        value={vQ7Text}
                        onChange={(e) => setVQ7Text(e.target.value)}
                        placeholder="Fragetext..."
                        className="w-full px-2 py-1 glass-input rounded text-xs"
                      />
                      <div className="space-y-1">
                        {vQ7Options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="q7-corr"
                              checked={vQ7CorrectIndex === idx}
                              onChange={() => setVQ7CorrectIndex(idx)}
                              className="accent-indigo-500"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...vQ7Options] as [string, string, string];
                                newOpts[idx] = e.target.value;
                                setVQ7Options(newOpts);
                              }}
                              className="flex-1 px-2 py-1 glass-input rounded text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Q8 */}
                    <div className="p-3 bg-slate-950/60 rounded-lg space-y-2 border border-slate-800">
                      <span className="text-xs font-bold text-white">Frage 8 (Aussage & Richtig / Falsch für Text 2):</span>
                      <input
                        type="text"
                        value={vQ8Text}
                        onChange={(e) => setVQ8Text(e.target.value)}
                        placeholder="Aussage / Fragetext 8..."
                        className="w-full px-2 py-1.5 glass-input rounded text-xs font-medium mb-1"
                      />
                      <div className="flex gap-2">
                        {['richtig', 'falsch'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setVQ8Correct(val as 'richtig' | 'falsch')}
                            className={`flex-1 py-1 rounded text-xs font-bold uppercase ${
                              vQ8Correct === val ? 'bg-indigo-600 text-white' : 'glass-card text-slate-400'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q9 */}
                    <div className="p-3 bg-slate-950/60 rounded-lg space-y-2 border border-slate-800">
                      <span className="text-xs font-bold text-white">Frage 9 (ABC für Text 2):</span>
                      <input
                        type="text"
                        value={vQ9Text}
                        onChange={(e) => setVQ9Text(e.target.value)}
                        placeholder="Fragetext..."
                        className="w-full px-2 py-1 glass-input rounded text-xs"
                      />
                      <div className="space-y-1">
                        {vQ9Options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="q9-corr"
                              checked={vQ9CorrectIndex === idx}
                              onChange={() => setVQ9CorrectIndex(idx)}
                              className="accent-indigo-500"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...vQ9Options] as [string, string, string];
                                newOpts[idx] = e.target.value;
                                setVQ9Options(newOpts);
                              }}
                              className="flex-1 px-2 py-1 glass-input rounded text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LESEN 3 SPECIFIC VISUAL FIELDS (Q10-13) */}
              {selectedTileType === 'lesen_3' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400">Richtige Zuordnung für Fragen 10–13 (A-F oder X):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['10', '11', '12', '13'].map((num) => (
                      <div key={num} className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-bold">Frage {num}</label>
                        <select
                          value={vCorrectAnswersMap[num] || 'A'}
                          onChange={(e) => setVCorrectAnswersMap({ ...vCorrectAnswersMap, [num]: e.target.value })}
                          className="w-full px-2 py-1.5 glass-input rounded-lg text-xs font-bold"
                        >
                          {['A', 'B', 'C', 'D', 'E', 'F', 'X'].map((opt) => (
                            <option key={opt} value={opt}>Option {opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOEREN 1 SPECIFIC VISUAL QUESTION BUILDER (Q22-27) */}
              {selectedTileType === 'hoeren_1' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-400">Fragenliste für Hören 1 (Q22–27 Richtig/Falsch & ABC):</h4>
                    <button
                      type="button"
                      onClick={handleAddHoeren1Question}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Frage hinzufügen
                    </button>
                  </div>

                  <div className="space-y-3">
                    {vHoeren1QuestionsList.map((q, index) => (
                      <div key={index} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                              Q{q.id}
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                              {q.type === 'richtig_falsch' ? 'Aussage (Richtig / Falsch)' : 'Frage (Mehrfachauswahl A, B, C)'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveHoeren1Question(index)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Fragetext</label>
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => handleUpdateHoeren1Question(index, { ...q, questionText: e.target.value })}
                            className="w-full px-3 py-1.5 glass-input rounded-lg text-xs font-medium"
                          />
                        </div>

                        {q.type === 'richtig_falsch' ? (
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-400 font-bold">Richtige Antwort:</label>
                            <div className="flex gap-3">
                              {['richtig', 'falsch'].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleUpdateHoeren1Question(index, { ...q, correct: val as 'richtig' | 'falsch' })}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                                    q.correct === val ? 'bg-indigo-600 text-white shadow-md' : 'glass-card text-slate-400'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="block text-[11px] text-slate-400 font-bold">Optionen (Radio anklicken für Richtig):</label>
                            {(q.options || ['Option A', 'Option B', 'Option C']).map((optText, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name={`h1-q-${index}-correct`}
                                    checked={Number(q.correct) === optIdx}
                                    onChange={() => handleUpdateHoeren1Question(index, { ...q, correct: optIdx })}
                                    className="accent-indigo-500 w-4 h-4"
                                  />
                                  <span>Option {['a', 'b', 'c'][optIdx]})</span>
                                </label>
                                <input
                                  type="text"
                                  value={optText}
                                  onChange={(e) => {
                                    const newOpts = [...(q.options || ['A', 'B', 'C'])] as [string, string, string];
                                    newOpts[optIdx] = e.target.value;
                                    handleUpdateHoeren1Question(index, { ...q, options: newOpts });
                                  }}
                                  className="w-full px-3 py-1 glass-input rounded-lg text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOEREN 2 SPECIFIC VISUAL FIELDS (Q28-31) */}
              {selectedTileType === 'hoeren_2' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400">Richtige Zuordnung für Fragen 28–31 (A-F):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['28', '29', '30', '31'].map((num) => (
                      <div key={num} className="space-y-1">
                        <label className="block text-[11px] text-slate-400 font-bold">Frage {num}</label>
                        <select
                          value={vCorrectAnswersMap[num] || 'A'}
                          onChange={(e) => setVCorrectAnswersMap({ ...vCorrectAnswersMap, [num]: e.target.value })}
                          className="w-full px-2 py-1.5 glass-input rounded-lg text-xs font-bold"
                        >
                          {['A', 'B', 'C', 'D', 'E', 'F'].map((opt) => (
                            <option key={opt} value={opt}>Option {opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HOEREN SCHREIBEN SPECIFIC VISUAL FIELDS (Q41-45) */}
              {selectedTileType === 'hoeren_schreiben' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400">Frage 41 (Mehrfachauswahl a, b, c) & Notizfelder 42–45:</h4>
                  
                  <div className="p-3 bg-slate-950/60 rounded-lg space-y-2 border border-slate-800">
                    <span className="text-xs font-bold text-white">Frage 41 Korrekte Antwort:</span>
                    <div className="flex gap-3">
                      {['a', 'b', 'c'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setVQ41Correct(opt as 'a' | 'b' | 'c')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                            vQ41Correct === opt ? 'bg-indigo-600 text-white shadow-md' : 'glass-card text-slate-400'
                          }`}
                        >
                          Option {opt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg space-y-2 border border-slate-800">
                    <span className="text-xs font-bold text-white">Telefonnotiz Felder (Q42–45):</span>
                    <p className="text-[11px] text-slate-400">Vordefinierte Feldbeschriftungen für das Notizformular:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                        <span className="text-indigo-400 font-bold">Feld 42:</span> Name des Anrufers
                      </div>
                      <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                        <span className="text-indigo-400 font-bold">Feld 43:</span> Telefonnummer
                      </div>
                      <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                        <span className="text-indigo-400 font-bold">Feld 44:</span> Informationen / Anliegen
                      </div>
                      <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                        <span className="text-indigo-400 font-bold">Feld 45:</span> Zu erledigen / Rückruf
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VISUAL QUESTION BUILDER FOR ABC TILES */}
              {(selectedTileType === 'lesen_4' ||
                selectedTileType === 'lesen_schreiben' ||
                selectedTileType === 'hoeren_3' ||
                selectedTileType === 'hoeren_4' ||
                selectedTileType === 'sprachbausteine_2') && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-400">Fragenliste (Visual Builder for ABC Questions):</h4>
                    <button
                      type="button"
                      onClick={handleAddQuestionABC}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {vQuestionsABCList.length >= (getTileABCQuestionRange(selectedTileType).end - getTileABCQuestionRange(selectedTileType).start + 1)
                        ? '+ Zusätzliche Übungsfrage (Zusatzfrage)'
                        : '+ Standard-Frage hinzufügen'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {vQuestionsABCList.map((q, index) => {
                      const range = getTileABCQuestionRange(selectedTileType);
                      const isExtra = index >= (range.end - range.start + 1);

                      return (
                        <div key={index} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                                Q{q.id}
                              </span>
                              <span className="text-xs font-bold text-slate-300">Frage #{index + 1}</span>
                              {isExtra && (
                                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-500/30">
                                  Zusatzfrage
                                </span>
                              )}
                            </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionABC(index)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Fragetext</label>
                          <input
                            type="text"
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestionABC(index, { ...q, questionText: e.target.value })}
                            className="w-full px-3 py-1.5 glass-input rounded-lg text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[11px] text-slate-400">
                            Antwortoptionen (Radio anklicken für Richtig):
                          </label>

                          {q.options.map((optText, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer shrink-0">
                                <input
                                  type="radio"
                                  name={`q-${index}-correct`}
                                  checked={q.correctIndex === optIdx}
                                  onChange={() => handleUpdateQuestionABC(index, { ...q, correctIndex: optIdx })}
                                  className="accent-indigo-500 w-4 h-4"
                                />
                                <span>Option {['a', 'b', 'c'][optIdx]})</span>
                              </label>
                              <input
                                type="text"
                                value={optText}
                                onChange={(e) => {
                                  const newOpts = [...q.options] as [string, string, string];
                                  newOpts[optIdx] = e.target.value;
                                  handleUpdateQuestionABC(index, { ...q, options: newOpts });
                                }}
                                className="w-full px-3 py-1 glass-input rounded-lg text-xs"
                              />
                            </div>
                          ))}
                        </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LESEN SCHREIBEN BESCHWERDE PROMPT */}
              {selectedTileType === 'lesen_schreiben' && (
                <div className="p-4 glass-card rounded-2xl border border-slate-300 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    Aufgabenstellung / Leitpunkte für Beschwerdebrief (Frage 21 Prompt) [Optional]
                  </label>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    Hier nur eine kurze Aufgabenstellung eintragen (z.B. "Schreiben Sie eine Antwort-E-Mail auf die Beschwerde..."). Nicht den gesamten E-Mail-Text hier reinkopieren!
                  </p>
                  <textarea
                    value={vBeschwerdePrompt}
                    onChange={(e) => setVBeschwerdePrompt(e.target.value)}
                    rows={3}
                    placeholder="Schreiben Sie eine Antwort-E-Mail auf die Beschwerde..."
                    className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                  />
                </div>
              )}

              {/* SPRACHBAUSTEINE 1 VISUAL GAPS FORM */}
              {selectedTileType === 'sprachbausteine_1' && (
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400">Lücken 46–51 (Korrekte Wörter eintragen):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[46, 47, 48, 49, 50, 51].map((gNum) => (
                      <div key={gNum}>
                        <label className="block text-[11px] text-slate-400 mb-1 font-bold">Lücke [{gNum}]</label>
                        <input
                          type="text"
                          value={vSb1GapsMap[gNum] || ''}
                          onChange={(e) => setVSb1GapsMap({ ...vSb1GapsMap, [gNum]: e.target.value })}
                          className="w-full px-2 py-1 glass-input rounded text-xs font-bold"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Zusätzliche Distraktoren (kommagetrennt)</label>
                    <input
                      type="text"
                      value={vSb1DistractorsStr}
                      onChange={(e) => setVSb1DistractorsStr(e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {selectedVariantId === 'new'
                    ? 'Neue Variante erstellen & in БД speichern'
                    : `Variante "${vTitle}" (ID: ${selectedVariantId}) überschreiben & speichern`}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVariantId('new')}
                  className="px-4 py-3.5 glass-card text-slate-400 hover:text-white text-xs font-medium rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Abbrechen
                </button>
              </div>
            </form>
          </div>

          {/* LIST OF EXISTING MODELLTESTS & QUICK PROPERTIES EDIT */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Vorhandene Modelltests ({modelltests.length})</h3>

            <div className="space-y-4">
              {modelltests.map((mt) => (
                <div key={mt.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white">{mt.title}</span>
                        {mt.isPremium ? (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                            PREMIUM
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-bold">
                            KOSTENLOS
                          </span>
                        )}
                        {mt.isHidden && (
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                            VERSTECKT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{mt.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setEditingModelltest(mt)}
                        className="px-3 py-1.5 bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 rounded-lg text-xs font-semibold flex items-center gap-1 border border-indigo-500/40"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Bearbeiten
                      </button>

                      <button
                        onClick={() => handleToggleModelltestPremium(mt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          mt.isPremium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'glass-card text-slate-400'
                        }`}
                      >
                        {mt.isPremium ? '✓ Premium' : 'Zu Premium'}
                      </button>

                      <button
                        onClick={() => handleToggleModelltestHidden(mt.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          mt.isHidden ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'glass-card text-slate-400'
                        }`}
                      >
                        {mt.isHidden ? <EyeOff className="w-3.5 h-3.5 inline mr-1" /> : <Eye className="w-3.5 h-3.5 inline mr-1" />}
                        {mt.isHidden ? 'Versteckt' : 'Sichtbar'}
                      </button>

                      <button
                        onClick={() => handleDeleteModelltest(mt.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* QUICK JUMP LINKS FOR TILES OF THIS MODELLTEST */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-bold self-center mr-1">Teile bearbeiten:</span>
                    {[
                      'lesen_1',
                      'lesen_2',
                      'lesen_3',
                      'lesen_4',
                      'lesen_schreiben',
                      'hoeren_1',
                      'hoeren_2',
                      'hoeren_3',
                      'hoeren_4',
                      'hoeren_schreiben',
                      'sprachbausteine_1',
                      'sprachbausteine_2',
                    ].map((t) => {
                      const vList = mt.variants[t as TileType] || [];
                      const vCount = Array.isArray(vList) ? vList.length : 0;
                      return (
                        <button
                          key={t}
                          onClick={() => handleJumpToEditTile(mt.id, t as TileType)}
                          className="px-2 py-0.5 bg-slate-950/80 hover:bg-indigo-600/30 text-slate-300 rounded border border-slate-800 font-mono"
                        >
                          {t} ({vCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODELLTEST METADATA MODAL */}
      {editingModelltest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-indigo-500/40 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" /> Modelltest-Eigenschaften bearbeiten
            </h3>

            <form onSubmit={handleSaveModelltestMetadata} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Titel</label>
                <input
                  type="text"
                  value={editingModelltest.title}
                  onChange={(e) => setEditingModelltest({ ...editingModelltest, title: e.target.value })}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Beschreibung</label>
                <input
                  type="text"
                  value={editingModelltest.description}
                  onChange={(e) => setEditingModelltest({ ...editingModelltest, description: e.target.value })}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingModelltest.isPremium}
                    onChange={(e) => setEditingModelltest({ ...editingModelltest, isPremium: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Premium-Test</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingModelltest.isHidden || false}
                    onChange={(e) => setEditingModelltest({ ...editingModelltest, isHidden: e.target.checked })}
                    className="accent-rose-500 w-4 h-4 rounded"
                  />
                  <span>Versteckt (für Benutzer verbergen)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingModelltest(null)}
                  className="px-4 py-2 glass-card text-slate-400 text-xs font-semibold rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CODES TAB */}
      {activeTab === 'promocodes' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> Gutscheincode-Generator
            </h3>

            <form onSubmit={handleGeneratePromoCode} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Code</label>
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="BETA2026"
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tage</label>
                <input
                  type="number"
                  value={promoDurationDays}
                  onChange={(e) => setPromoDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Nutzungen</label>
                <input
                  type="number"
                  value={promoMaxUses}
                  onChange={(e) => setPromoMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
              </div>

              <div className="pt-5">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Code erstellen & in БД speichern
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Generierte Gutscheincodes ({promoCodes.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Dauer</th>
                    <th className="p-3">Nutzungen</th>
                    <th className="p-3">E-Mails</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {promoCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono font-bold text-amber-400">{code.code}</td>
                      <td className="p-3">{code.durationDays} Tage</td>
                      <td className="p-3 font-bold">{code.usedCount} / {code.maxUses}</td>
                      <td className="p-3 text-[11px] text-slate-400">{code.usedByEmails.join(', ') || 'Keine'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleTogglePromoActive(code.id)}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            code.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {code.active ? 'AKTIV' : 'INAKTIV'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button onClick={() => handleDeletePromoCode(code.id)} className="text-rose-400 hover:text-rose-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORUMSBEITRAG (Q58) TAB */}
      {activeTab === 'forumsbeitrag' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-pink-400" /> Thema für Schreiben Q58 (Forenbeitrag) hinzufügen
            </h3>

            <form onSubmit={handleAddForumsbeitragTopic} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Titel des Themas</label>
                <input
                  type="text"
                  value={fbTitle}
                  onChange={(e) => setFbTitle(e.target.value)}
                  placeholder="Homeoffice vs. Präsenz..."
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Aufgabenstellung / Prompt-Text</label>
                <textarea
                  value={fbPrompt}
                  onChange={(e) => setFbPrompt(e.target.value)}
                  rows={4}
                  placeholder="Schreiben Sie einen Forenbeitrag zum Thema..."
                  className="w-full p-3 glass-input rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={fbIsPremium}
                    onChange={(e) => setFbIsPremium(e.target.checked)}
                    className="accent-pink-500 w-4 h-4 rounded"
                  />
                  <span>Premium-Thema (isPremium)</span>
                </label>

                <button
                  type="submit"
                  className="py-2.5 px-6 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors ml-auto flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Thema in Supabase БД speichern
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Vorhandene Q58 Themen ({forumsbeitragTopics.length})</h3>
            <div className="space-y-3">
              {forumsbeitragTopics.map((t) => (
                <div key={t.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {t.title} {t.isPremium && <span className="text-[10px] text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">PREMIUM</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{t.promptText}</div>
                  </div>
                  <button onClick={() => handleDeleteForumsbeitragTopic(t.id)} className="text-rose-400 hover:text-rose-300 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SPRECHEN TAB */}
      {activeTab === 'sprechen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sprechen Teil 2 */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Thema für Sprechen Teil 2
              </h3>
              <form onSubmit={handleAddSp2Topic} className="space-y-3">
                <input
                  type="text"
                  value={sp2Title}
                  onChange={(e) => setSp2Title(e.target.value)}
                  placeholder="Titel..."
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
                <textarea
                  value={sp2Prompt}
                  onChange={(e) => setSp2Prompt(e.target.value)}
                  rows={3}
                  placeholder="Aufgabenstellung..."
                  className="w-full p-3 glass-input rounded-xl text-xs"
                />
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> In Supabase БД speichern
                </button>
              </form>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Themen Teil 2 ({sprechenTopics.sprecher2Topics.length})</h4>
              {sprechenTopics.sprecher2Topics.map((t) => (
                <div key={t.id} className="p-3 bg-slate-900/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-slate-400 text-[11px]">{t.promptText}</div>
                  </div>
                  <button onClick={() => handleDeleteSp2Topic(t.id)} className="text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sprechen Teil 3 */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Situation für Sprechen Teil 3
              </h3>
              <form onSubmit={handleAddSp3Situation} className="space-y-3">
                <input
                  type="text"
                  value={sp3Title}
                  onChange={(e) => setSp3Title(e.target.value)}
                  placeholder="Titel der Situation..."
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold"
                />
                <textarea
                  value={sp3Prompt}
                  onChange={(e) => setSp3Prompt(e.target.value)}
                  rows={3}
                  placeholder="Aufgabenstellung / Planung..."
                  className="w-full p-3 glass-input rounded-xl text-xs"
                />
                <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> In Supabase БД speichern
                </button>
              </form>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Situationen Teil 3 ({sprechenTopics.sprecher3Situations.length})</h4>
              {sprechenTopics.sprecher3Situations.map((s) => (
                <div key={s.id} className="p-3 bg-slate-900/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{s.title}</div>
                    <div className="text-slate-400 text-[11px]">{s.promptText}</div>
                  </div>
                  <button onClick={() => handleDeleteSp3Situation(s.id)} className="text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
