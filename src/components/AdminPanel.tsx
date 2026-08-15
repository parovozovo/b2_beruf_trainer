import React, { useState, useEffect } from 'react';
import type {
  Modelltest,
  TileType,
  PromoCode,
  ForumsbeitragTopic,
  User,
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
  WortschatzItem,
  WortschatzCategory,
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
  X,
  Users,
  UserCheck,
  Ban,
  Crown,
  Search,
  Gift,
  BookOpen,
  Layers,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import {
  isAdminEmail,
  getRegisteredUsersLocal,
  getRemainingPremiumTimeLabel,
  fetchRegisteredUsersAsync,
  syncUserToRegisteredList,
  deleteRegisteredUserInStorage,
  isFreeTrialEnabled,
  setFreeTrialEnabled,
} from '../utils/storage';

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
  wortschatzItems?: WortschatzItem[];
  onSaveWortschatz?: (items: WortschatzItem[]) => Promise<{ success: boolean; error?: string }> | void;
}

const FormattingToolbar: React.FC<{
  onFormat: (tagType: 'bold' | 'italic' | 'underline') => void;
}> = ({ onFormat }) => {
  return (
    <div className="flex items-center gap-1.5 mb-1.5 p-1 bg-slate-200 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 px-1">Formatieren:</span>
      <button
        type="button"
        onClick={() => onFormat('bold')}
        className="px-2 py-0.5 font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 hover:bg-indigo-600 hover:text-white transition-colors"
        title="Markierten Text Fett machen (**text**)"
      >
        <b>B</b> (Fett)
      </button>
      <button
        type="button"
        onClick={() => onFormat('italic')}
        className="px-2 py-0.5 font-serif italic bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 hover:bg-indigo-600 hover:text-white transition-colors"
        title="Markierten Text Kursiv machen (*text*)"
      >
        <i>I</i> (Kursiv)
      </button>
      <button
        type="button"
        onClick={() => onFormat('underline')}
        className="px-2 py-0.5 font-bold underline bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-700 hover:bg-indigo-600 hover:text-white transition-colors"
        title="Markierten Text Unterstreichen (<u>text</u>)"
      >
        <u>U</u> (Unterstrichen)
      </button>
    </div>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  modelltests,
  onSaveModelltests,
  promoCodes,
  onSavePromoCodes,
  forumsbeitragTopics,
  onSaveForumsbeitragTopics,
  sprechenTopics,
  onSaveSprechenTopics,
  wortschatzItems = [],
  onSaveWortschatz,
}) => {
  const [adminHub, setAdminHub] = useState<'content' | 'users_system'>('content');
  const [activeTab, setActiveTab] = useState<'modelltests' | 'promocodes' | 'forumsbeitrag' | 'sprechen' | 'wortschatz' | 'users' | 'system'>('modelltests');

  // Wortschatz Admin State
  const [wortschatzList, setWortschatzList] = useState<WortschatzItem[]>(wortschatzItems);
  const [wortschatzSearch, setWortschatzSearch] = useState('');
  const [wortschatzCatFilter, setWortschatzCatFilter] = useState<string>('all');
  const [showWortschatzModal, setShowWortschatzModal] = useState(false);
  const [editingWortschatzItem, setEditingWortschatzItem] = useState<WortschatzItem | null>(null);

  // Wortschatz Form Fields
  const [wsFormTerm, setWsFormTerm] = useState('');
  const [wsFormCategory, setWsFormCategory] = useState<WortschatzCategory>('nvv');
  const [wsFormGrammar, setWsFormGrammar] = useState('');
  const [wsFormMeaning, setWsFormMeaning] = useState('');
  const [wsFormSynonyms, setWsFormSynonyms] = useState('');
  const [wsFormExample, setWsFormExample] = useState('');
  const [wsFormGapExample, setWsFormGapExample] = useState('');
  const [wsFormGapAnswer, setWsFormGapAnswer] = useState('');
  const [wsFormGapOptions, setWsFormGapOptions] = useState('');
  const [wsFormTransUA, setWsFormTransUA] = useState('');
  const [wsFormTransEN, setWsFormTransEN] = useState('');

  // Keep local list in sync with parent props
  useEffect(() => {
    if (wortschatzItems && wortschatzItems.length > 0) {
      setWortschatzList(wortschatzItems);
    }
  }, [wortschatzItems]);

  // User Management State
  const [usersList, setUsersList] = useState<User[]>(() => getRegisteredUsersLocal());
  const [userSearchText, setUserSearchText] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserPremiumDays, setNewUserPremiumDays] = useState<number>(30);
  const [freeTrialActive, setFreeTrialActive] = useState<boolean>(() => isFreeTrialEnabled());

  // UI Toast notification state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSyncUsers = async () => {
    const list = await fetchRegisteredUsersAsync();
    setUsersList(list);
  };

  const handleCreateUserManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    const cleanEmail = newUserEmail.trim().toLowerCase();
    const newUser: User = {
      id: `user-manual-${Date.now()}`,
      name: newUserName.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: newUserRole,
      isPremium: newUserPremiumDays > 0,
      premiumExpiresAt: newUserPremiumDays > 0 ? new Date(Date.now() + newUserPremiumDays * 86400000).toISOString() : null,
    };
    syncUserToRegisteredList(newUser);
    setUsersList(getRegisteredUsersLocal());
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast(`Benutzer ${cleanEmail} wurde erfolgreich angelegt!`);
  };

  useEffect(() => {
    handleSyncUsers();
  }, []);

  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustOption, setAdjustOption] = useState<'1' | '7' | '14' | '30' | '90' | 'unlimited' | 'remove' | 'custom'>('30');
  const [customAdjustDays, setCustomAdjustDays] = useState<number>(15);

  const handleOpenAdjustModal = (user: User) => {
    setAdjustingUser(user);
    setAdjustOption('30');
    setCustomAdjustDays(15);
  };

  const handleSaveAdjustedPremium = async () => {
    if (!adjustingUser) return;
    const target = adjustingUser;
    let updatedUser: User;

    if (adjustOption === 'remove') {
      updatedUser = { ...target, isPremium: false, premiumExpiresAt: null, appliedPromoCode: undefined };
      showToast(`Premium für ${target.name} wurde entzogen.`);
    } else if (adjustOption === 'unlimited') {
      updatedUser = { ...target, isPremium: true, premiumExpiresAt: null };
      showToast(`👑 Unbegrenztes Premium für ${target.name} aktiviert!`);
    } else {
      let days = 30;
      if (adjustOption === '1') days = 1;
      else if (adjustOption === '7') days = 7;
      else if (adjustOption === '14') days = 14;
      else if (adjustOption === '30') days = 30;
      else if (adjustOption === '90') days = 90;
      else if (adjustOption === 'custom') days = Math.max(1, customAdjustDays || 1);

      const newExp = new Date(Date.now() + days * 86400000).toISOString();

      updatedUser = { ...target, isPremium: true, premiumExpiresAt: newExp };
      showToast(`+${days} Tage Premium für ${target.name} zugewiesen!`);
    }

    syncUserToRegisteredList(updatedUser);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('registered_users').upsert(
          {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email.toLowerCase(),
            role: updatedUser.role,
            is_premium: updatedUser.isPremium,
            premium_expires_at: updatedUser.premiumExpiresAt,
            is_banned: Boolean(updatedUser.isBanned),
            applied_promo_code: updatedUser.appliedPromoCode || null,
            created_at: updatedUser.createdAt || new Date().toISOString(),
            last_login_at: updatedUser.lastLoginAt || new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
      } catch (e) {
        console.warn('Direct upsert in AdminPanel error:', e);
      }
    }

    setUsersList((prev) => prev.map((u) => (u.id === target.id || u.email.toLowerCase() === target.email.toLowerCase() ? updatedUser : u)));
    setAdjustingUser(null);
  };

  const handleToggleBanUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target) return;
    const updatedUser: User = { ...target, isBanned: !target.isBanned };
    syncUserToRegisteredList(updatedUser);
    setUsersList(getRegisteredUsersLocal());
    showToast(updatedUser.isBanned ? 'Benutzer wurde gesperrt!' : 'Benutzer wurde entsperrt!');
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (window.confirm(`Möchten Sie den Benutzer "${userEmail}" wirklich dauerhaft löschen?`)) {
      deleteRegisteredUserInStorage(userId, userEmail);
      setUsersList((prev) => prev.filter((u) => u.id !== userId && u.email.toLowerCase() !== userEmail.toLowerCase()));
      showToast('Benutzer wurde dauerhaft gelöscht!');
    }
  };

  const text1Ref = React.useRef<HTMLTextAreaElement | null>(null);
  const text2Ref = React.useRef<HTMLTextAreaElement | null>(null);
  const headingsRef = React.useRef<HTMLTextAreaElement | null>(null);
  const script1Ref = React.useRef<HTMLTextAreaElement | null>(null);
  const script2Ref = React.useRef<HTMLTextAreaElement | null>(null);
  const script3Ref = React.useRef<HTMLTextAreaElement | null>(null);

  const handleFormatText = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    value: string,
    setValue: (val: string) => void,
    tagType: 'bold' | 'italic' | 'underline'
  ) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end) || 'Text';

    let prefix = '';
    let suffix = '';

    if (tagType === 'bold') {
      prefix = '**';
      suffix = '**';
    } else if (tagType === 'italic') {
      prefix = '*';
      suffix = '*';
    } else if (tagType === 'underline') {
      prefix = '<u>';
      suffix = '</u>';
    }

    const nextVal = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    setValue(nextVal);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
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

  // Hoeren 1 specific separate audio/script blocks (Q22-23, Q24-25, Q26-27)
  const [vAudioUrl1, setVAudioUrl1] = useState('');
  const [vScriptText1, setVScriptText1] = useState('');
  const [vAudioUrl2, setVAudioUrl2] = useState('');
  const [vScriptText2, setVScriptText2] = useState('');
  const [vAudioUrl3, setVAudioUrl3] = useState('');
  const [vScriptText3, setVScriptText3] = useState('');

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
  const [vQ41Text, setVQ41Text] = useState('Der Anrufer macht ein/eine:');
  const [vQ41Options, setVQ41Options] = useState<[string, string, string]>(['Angebot', 'Bestellung / Buchung', 'Beschwerde']);
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
  const [editingFbId, setEditingFbId] = useState<string | null>(null);
  const [showAllFbTopics, setShowAllFbTopics] = useState(false);

  // Sprechen Topic State
  const [sp2Title, setSp2Title] = useState('');
  const [sp2Prompt, setSp2Prompt] = useState('');
  const [editingSp2Id, setEditingSp2Id] = useState<string | null>(null);
  const [showAllSp2Topics, setShowAllSp2Topics] = useState(false);

  const [sp3Title, setSp3Title] = useState('');
  const [sp3Prompt, setSp3Prompt] = useState('');
  const [editingSp3Id, setEditingSp3Id] = useState<string | null>(null);
  const [showAllSp3Situations, setShowAllSp3Situations] = useState(false);

  // Bulk Import Modal State
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportTarget, setBulkImportTarget] = useState<'fb' | 'sp2' | 'sp3'>('fb');
  const [bulkImportText, setBulkImportText] = useState('');
  const [parsedBulkTopics, setParsedBulkTopics] = useState<Array<{ title: string; promptText: string }>>([]);

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
    audioUrl1?: string;
    scriptText1?: string;
    audioUrl2?: string;
    scriptText2?: string;
    audioUrl3?: string;
    scriptText3?: string;
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
      setVAudioUrl1('');
      setVScriptText1('');
      setVAudioUrl2('');
      setVScriptText2('');
      setVAudioUrl3('');
      setVScriptText3('');

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
      setVQ41Text('Der Anrufer macht ein/eine:');
      setVQ41Options(['Angebot', 'Bestellung / Buchung', 'Beschwerde']);
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
        setVAudioUrl1(found.audioUrl1 || '');
        setVScriptText1(found.scriptText1 || '');
        setVAudioUrl2(found.audioUrl2 || '');
        setVScriptText2(found.scriptText2 || '');
        setVAudioUrl3(found.audioUrl3 || '');
        setVScriptText3(found.scriptText3 || '');
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
        const hsFound = found as unknown as Partial<HoerenSchreibenVariant>;
        if (hsFound.q41Text) setVQ41Text(hsFound.q41Text);
        else setVQ41Text('Der Anrufer macht ein/eine:');
        if (hsFound.q41Options && Array.isArray(hsFound.q41Options)) {
          setVQ41Options(hsFound.q41Options as [string, string, string]);
        } else {
          setVQ41Options(['Angebot', 'Bestellung / Buchung', 'Beschwerde']);
        }
        if (hsFound.q41Correct) setVQ41Correct(hsFound.q41Correct);
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
        scriptText: vText1 || undefined,
        audioUrl1: vAudioUrl1 || undefined,
        scriptText1: vScriptText1 || undefined,
        audioUrl2: vAudioUrl2 || undefined,
        scriptText2: vScriptText2 || undefined,
        audioUrl3: vAudioUrl3 || undefined,
        scriptText3: vScriptText3 || undefined,
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
        q41Text: vQ41Text,
        q41Options: vQ41Options,
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

    let updatedList: ForumsbeitragTopic[];
    if (editingFbId) {
      updatedList = forumsbeitragTopics.map((t) =>
        t.id === editingFbId
          ? { ...t, title: fbTitle, promptText: fbPrompt, isPremium: fbIsPremium }
          : t
      );
    } else {
      const newTopic: ForumsbeitragTopic = {
        id: `fb-${Date.now()}`,
        title: fbTitle,
        promptText: fbPrompt,
        isPremium: fbIsPremium,
      };
      updatedList = [...forumsbeitragTopics, newTopic];
    }

    const res = await onSaveForumsbeitragTopics(updatedList);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setFbTitle('');
      setFbPrompt('');
      setFbIsPremium(false);
      setEditingFbId(null);
      showToast(
        editingFbId
          ? 'Thema für Q58 Forenbeitrag aktualisiert!'
          : 'Thema für Q58 Forenbeitrag in Supabase gespeichert!'
      );
    }
  };

  const handleEditForumsbeitragTopic = (t: ForumsbeitragTopic) => {
    setEditingFbId(t.id);
    setFbTitle(t.title);
    setFbPrompt(t.promptText);
    setFbIsPremium(!!t.isPremium);
  };

  const handleCancelEditFb = () => {
    setEditingFbId(null);
    setFbTitle('');
    setFbPrompt('');
    setFbIsPremium(false);
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

    let updatedSp2: Array<{ id: string; title: string; promptText: string }>;
    if (editingSp2Id) {
      updatedSp2 = sprechenTopics.sprecher2Topics.map((t) =>
        t.id === editingSp2Id ? { ...t, title: sp2Title, promptText: sp2Prompt } : t
      );
    } else {
      const newTopic = { id: `sp2-${Date.now()}`, title: sp2Title, promptText: sp2Prompt };
      updatedSp2 = [...sprechenTopics.sprecher2Topics, newTopic];
    }

    const updated = {
      ...sprechenTopics,
      sprecher2Topics: updatedSp2,
    };
    const res = await onSaveSprechenTopics(updated);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setSp2Title('');
      setSp2Prompt('');
      setEditingSp2Id(null);
      showToast(
        editingSp2Id
          ? 'Sprechen Teil 2 Thema aktualisiert!'
          : 'Sprechen Teil 2 Thema in Supabase gespeichert!'
      );
    }
  };

  const handleEditSp2Topic = (t: { id: string; title: string; promptText: string }) => {
    setEditingSp2Id(t.id);
    setSp2Title(t.title);
    setSp2Prompt(t.promptText);
  };

  const handleCancelEditSp2 = () => {
    setEditingSp2Id(null);
    setSp2Title('');
    setSp2Prompt('');
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

    let updatedSp3: Array<{ id: string; title: string; promptText: string }>;
    if (editingSp3Id) {
      updatedSp3 = sprechenTopics.sprecher3Situations.map((s) =>
        s.id === editingSp3Id ? { ...s, title: sp3Title, promptText: sp3Prompt } : s
      );
    } else {
      const newSit = { id: `sp3-${Date.now()}`, title: sp3Title, promptText: sp3Prompt };
      updatedSp3 = [...sprechenTopics.sprecher3Situations, newSit];
    }

    const updated = {
      ...sprechenTopics,
      sprecher3Situations: updatedSp3,
    };
    const res = await onSaveSprechenTopics(updated);
    if (res && res.success === false) {
      showToast(`Fehler beim Speichern in Supabase: ${res.error}`, 'error');
    } else {
      setSp3Title('');
      setSp3Prompt('');
      setEditingSp3Id(null);
      showToast(
        editingSp3Id
          ? 'Sprechen Teil 3 Situation aktualisiert!'
          : 'Sprechen Teil 3 Situation in Supabase gespeichert!'
      );
    }
  };

  const handleEditSp3Situation = (s: { id: string; title: string; promptText: string }) => {
    setEditingSp3Id(s.id);
    setSp3Title(s.title);
    setSp3Prompt(s.promptText);
  };

  const handleCancelEditSp3 = () => {
    setEditingSp3Id(null);
    setSp3Title('');
    setSp3Prompt('');
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

  // --- BULK IMPORT HANDLERS ---
  const handleOpenBulkImport = (target: 'fb' | 'sp2' | 'sp3') => {
    setBulkImportTarget(target);
    setBulkImportText('');
    setParsedBulkTopics([]);
    setShowBulkImportModal(true);
  };

  const handleParseBulkText = (text: string) => {
    setBulkImportText(text);
    if (!text.trim()) {
      setParsedBulkTopics([]);
      return;
    }

    const items: Array<{ title: string; promptText: string }> = [];

    // Regex match for blocks starting with Thema: "..." or Situation: "..." or Topic: "..." or ### "..."
    const regex = /(?:Thema|Situation|Titel|Topic|###):\s*["'«“]?(.*?)["'»”]?\n([\s\S]*?)(?=(?:Thema|Situation|Titel|Topic|###):\s*["'«“]?|$)/gi;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const title = match[1].trim();
      const promptText = match[2].trim();
      if (title && promptText) {
        items.push({ title, promptText });
      }
    }

    // Fallback: If no "Thema:" header found, split by double newlines \n\n
    if (items.length === 0) {
      const blocks = text.split(/\n\s*\n/);
      for (const block of blocks) {
        const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          let title = lines[0]
            .replace(/^(Thema|Situation|Titel|Topic|###):\s*["'«“]?/i, '')
            .replace(/["'»”]?$/i, '')
            .trim();
          const promptText = lines.slice(1).join('\n').trim();
          if (title && promptText) {
            items.push({ title, promptText });
          }
        }
      }
    }

    setParsedBulkTopics(items);
  };

  const handleConfirmBulkImport = async () => {
    if (parsedBulkTopics.length === 0) return;

    if (bulkImportTarget === 'fb') {
      const newItems: ForumsbeitragTopic[] = parsedBulkTopics.map((t, idx) => ({
        id: `fb-bulk-${Date.now()}-${idx}`,
        title: t.title,
        promptText: t.promptText,
      }));
      const updated = [...forumsbeitragTopics, ...newItems];
      const res = await onSaveForumsbeitragTopics(updated);
      if (res && res.success === false) {
        showToast(`Fehler: ${res.error}`, 'error');
      } else {
        showToast(`${newItems.length} Q58 Themen erfolgreich in Supabase importiert!`);
        setShowBulkImportModal(false);
        setBulkImportText('');
        setParsedBulkTopics([]);
      }
    } else if (bulkImportTarget === 'sp2') {
      const newItems = parsedBulkTopics.map((t, idx) => ({
        id: `sp2-bulk-${Date.now()}-${idx}`,
        title: t.title,
        promptText: t.promptText,
      }));
      const updated = {
        ...sprechenTopics,
        sprecher2Topics: [...sprechenTopics.sprecher2Topics, ...newItems],
      };
      const res = await onSaveSprechenTopics(updated);
      if (res && res.success === false) {
        showToast(`Fehler: ${res.error}`, 'error');
      } else {
        showToast(`${newItems.length} Sprechen Teil 2 Themen erfolgreich in Supabase importiert!`);
        setShowBulkImportModal(false);
        setBulkImportText('');
        setParsedBulkTopics([]);
      }
    } else if (bulkImportTarget === 'sp3') {
      const newItems = parsedBulkTopics.map((t, idx) => ({
        id: `sp3-bulk-${Date.now()}-${idx}`,
        title: t.title,
        promptText: t.promptText,
      }));
      const updated = {
        ...sprechenTopics,
        sprecher3Situations: [...sprechenTopics.sprecher3Situations, ...newItems],
      };
      const res = await onSaveSprechenTopics(updated);
      if (res && res.success === false) {
        showToast(`Fehler: ${res.error}`, 'error');
      } else {
        showToast(`${newItems.length} Sprechen Teil 3 Situationen erfolgreich in Supabase importiert!`);
        setShowBulkImportModal(false);
        setBulkImportText('');
        setParsedBulkTopics([]);
      }
    }
  };

  // Export Full Backup JSON
  const handleExportDataJSON = () => {
    const data = { modelltests, promoCodes, forumsbeitragTopics, sprechenTopics };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `b2-trainer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Export Single Modelltest JSON
  const handleExportSingleModelltestJSON = (mt: Modelltest) => {
    const blob = new Blob([JSON.stringify(mt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = (mt.title || 'modelltest').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `modelltest-${sanitizedTitle}.json`;
    a.click();
    showToast(`Modelltest "${mt.title}" als JSON exportiert!`);
  };

  const handleImportDataJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let importedSomething = false;

        // Standard Full Backup Object (contains keys like modelltests, forumsbeitragTopics...)
        if (parsed.modelltests && Array.isArray(parsed.modelltests)) {
          const updatedTests = [...modelltests];
          parsed.modelltests.forEach((impMT: Modelltest) => {
            const idx = updatedTests.findIndex((mt) => mt.id === impMT.id);
            if (idx >= 0) {
              updatedTests[idx] = impMT;
            } else {
              updatedTests.push(impMT);
            }
          });
          await onSaveModelltests(updatedTests);
          importedSomething = true;
        }

        // Single Modelltest Object uploaded directly
        if (!parsed.modelltests && parsed.id && parsed.variants) {
          const updatedTests = [...modelltests];
          const idx = updatedTests.findIndex((mt) => mt.id === parsed.id);
          if (idx >= 0) {
            updatedTests[idx] = parsed;
          } else {
            updatedTests.push(parsed);
          }
          await onSaveModelltests(updatedTests);
          importedSomething = true;
        }

        // Single array of Modelltests uploaded directly
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].variants) {
          const updatedTests = [...modelltests];
          parsed.forEach((impMT: Modelltest) => {
            const idx = updatedTests.findIndex((mt) => mt.id === impMT.id);
            if (idx >= 0) {
              updatedTests[idx] = impMT;
            } else {
              updatedTests.push(impMT);
            }
          });
          await onSaveModelltests(updatedTests);
          importedSomething = true;
        }

        // Promo Codes
        if (parsed.promoCodes && Array.isArray(parsed.promoCodes)) {
          await onSavePromoCodes(parsed.promoCodes);
          importedSomething = true;
        }

        // Forenbeitrag Topics (Q58)
        if (parsed.forumsbeitragTopics && Array.isArray(parsed.forumsbeitragTopics)) {
          await onSaveForumsbeitragTopics(parsed.forumsbeitragTopics);
          importedSomething = true;
        }

        // Sprechen Topics (Q1A, Q2, Q3)
        if (parsed.sprechenTopics && typeof parsed.sprechenTopics === 'object') {
          await onSaveSprechenTopics(parsed.sprechenTopics);
          importedSomething = true;
        }

        if (importedSomething) {
          showToast('Daten erfolgreich importiert & mit БД синхронізовано!');
        } else {
          showToast('Unbekanntes JSON-Format! Bitte Backup-Struktur prüfen.', 'error');
        }
      } catch (err) {
        console.error('Import JSON Error:', err);
        showToast('Fehler beim Importieren der JSON-Datei!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
      </div>

      {/* Tier 1: Main Admin Hub Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              setAdminHub('content');
              if (activeTab === 'users' || activeTab === 'promocodes' || activeTab === 'system') {
                setActiveTab('modelltests');
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              adminHub === 'content'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 Inhalte & Prüfungen</span>
            <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px]">Content</span>
          </button>

          <button
            onClick={() => {
              setAdminHub('users_system');
              if (activeTab === 'modelltests' || activeTab === 'forumsbeitrag' || activeTab === 'sprechen' || activeTab === 'wortschatz') {
                setActiveTab('users');
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              adminHub === 'users_system'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>⚙️ Benutzer & App-Verwaltung</span>
            <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px]">System</span>
          </button>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => onSaveModelltests(modelltests)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Mit Supabase синхронізація
          </button>
          <button
            onClick={handleExportDataJSON}
            className="px-3 py-2 glass-card hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Backup (JSON)
          </button>
        </div>
      </div>

      {/* Tier 2: Sub-Tabs based on selected Hub */}
      {adminHub === 'content' ? (
        <div className="flex flex-wrap bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 text-xs gap-1.5">
          <button
            onClick={() => setActiveTab('modelltests')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'modelltests' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Modelltests & 12 Prüfungsteile ({modelltests.length})
          </button>
          <button
            onClick={() => setActiveTab('forumsbeitrag')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'forumsbeitrag' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Schreiben (Q58 Forenbeiträge) ({forumsbeitragTopics.length})
          </button>
          <button
            onClick={() => setActiveTab('sprechen')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sprechen' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" /> Sprechen (Teil 2 & 3)
          </button>
          <button
            onClick={() => setActiveTab('wortschatz')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'wortschatz' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Wortschatz-Datenbank (In Vorbereitung)
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 text-xs gap-1.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Benutzer-Verwaltung ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('promocodes')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'promocodes' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" /> Gutscheincodes ({promoCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'system' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" /> System-Backup & Cloud-Sync
          </button>
        </div>
      )}

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

              {selectedTileType === 'hoeren_1' ? (
                <div className="space-y-6 pt-2 border-t border-slate-800">
                  <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    3 separate Hörtexte & Audio-Dateien für Hören 1 (22–27):
                  </h4>

                  {/* Nachricht 1 (Q22-23) */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-extrabold text-indigo-400">
                      📻 Nachricht 1 (Fragen 22–23) — MP3 URL & Skript:
                    </label>
                    <input
                      type="text"
                      value={vAudioUrl1}
                      onChange={(e) => setVAudioUrl1(e.target.value)}
                      placeholder="Audio MP3 URL für Nachricht 1 (Fragen 22-23)"
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                    />
                    {vAudioUrl1 && (
                      <AudioPlayerBlock audioUrl={vAudioUrl1} scriptText={vScriptText1} autoShowScript={false} />
                    )}
                    <FormattingToolbar onFormat={(tag) => handleFormatText(script1Ref, vScriptText1, setVScriptText1, tag)} />
                    <textarea
                      ref={script1Ref}
                      value={vScriptText1}
                      onChange={(e) => setVScriptText1(e.target.value)}
                      placeholder="Skript / Transkript für Nachricht 1 (Fragen 22–23)..."
                      rows={4}
                      className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                    />
                  </div>

                  {/* Nachricht 2 (Q24-25) */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-extrabold text-indigo-400">
                      📻 Nachricht 2 (Fragen 24–25) — MP3 URL & Skript:
                    </label>
                    <input
                      type="text"
                      value={vAudioUrl2}
                      onChange={(e) => setVAudioUrl2(e.target.value)}
                      placeholder="Audio MP3 URL für Nachricht 2 (Fragen 24-25)"
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                    />
                    {vAudioUrl2 && (
                      <AudioPlayerBlock audioUrl={vAudioUrl2} scriptText={vScriptText2} autoShowScript={false} />
                    )}
                    <FormattingToolbar onFormat={(tag) => handleFormatText(script2Ref, vScriptText2, setVScriptText2, tag)} />
                    <textarea
                      ref={script2Ref}
                      value={vScriptText2}
                      onChange={(e) => setVScriptText2(e.target.value)}
                      placeholder="Skript / Transkript für Nachricht 2 (Fragen 24–25)..."
                      rows={4}
                      className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                    />
                  </div>

                  {/* Nachricht 3 (Q26-27) */}
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-extrabold text-indigo-400">
                      📻 Nachricht 3 (Fragen 26–27) — MP3 URL & Skript:
                    </label>
                    <input
                      type="text"
                      value={vAudioUrl3}
                      onChange={(e) => setVAudioUrl3(e.target.value)}
                      placeholder="Audio MP3 URL für Nachricht 3 (Fragen 26-27)"
                      className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono"
                    />
                    {vAudioUrl3 && (
                      <AudioPlayerBlock audioUrl={vAudioUrl3} scriptText={vScriptText3} autoShowScript={false} />
                    )}
                    <FormattingToolbar onFormat={(tag) => handleFormatText(script3Ref, vScriptText3, setVScriptText3, tag)} />
                    <textarea
                      ref={script3Ref}
                      value={vScriptText3}
                      onChange={(e) => setVScriptText3(e.target.value)}
                      placeholder="Skript / Transkript für Nachricht 3 (Fragen 26–27)..."
                      rows={4}
                      className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                    />
                  </div>
                </div>
              ) : (
                <>
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
                      <label className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">
                        {selectedTileType === 'lesen_1' && 'Situationen / Personen 1–5'}
                        {selectedTileType === 'lesen_2' && 'Text 1 (Artikel / Arbeitsordnung)'}
                        {selectedTileType === 'lesen_3' && 'Situationen / Anfragen (Fragen 10–13)'}
                        {selectedTileType === 'lesen_4' && 'Protokoll / Bericht'}
                        {selectedTileType === 'lesen_schreiben' && 'E-Mail-Korrespondenz (2 E-Mails)'}
                        {selectedTileType.startsWith('hoeren') && 'Skript / Transkript (Hörtext)'}
                        {selectedTileType === 'sprachbausteine_1' && 'Bewerbungsschreiben mit Lücken [46]–[51]'}
                        {selectedTileType === 'sprachbausteine_2' && 'Mitteilung mit Lücken [52]–[57]'}
                      </label>
                      <FormattingToolbar onFormat={(tag) => handleFormatText(text1Ref, vText1, setVText1, tag)} />
                      <textarea
                        ref={text1Ref}
                        value={vText1}
                        onChange={(e) => setVText1(e.target.value)}
                        rows={7}
                        className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                      />
                    </div>

                    {selectedTileType === 'lesen_2' && (
                      <div>
                        <label className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">Text 2</label>
                        <FormattingToolbar onFormat={(tag) => handleFormatText(text2Ref, vText2, setVText2, tag)} />
                        <textarea
                          ref={text2Ref}
                          value={vText2}
                          onChange={(e) => setVText2(e.target.value)}
                          rows={7}
                          className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                        />
                      </div>
                    )}

                    {(selectedTileType === 'lesen_1' || selectedTileType === 'lesen_3' || selectedTileType === 'hoeren_2') && (
                      <div>
                        <label className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">
                          {selectedTileType === 'lesen_1' && 'Anzeigen / Informationen (A–H)'}
                          {selectedTileType === 'lesen_3' && 'Antworten / Forenbeiträge (A–F)'}
                          {selectedTileType === 'hoeren_2' && 'Aussagen (A–G)'}
                        </label>
                        <FormattingToolbar onFormat={(tag) => handleFormatText(headingsRef, vHeadingsBlock, setVHeadingsBlock, tag)} />
                        <textarea
                          ref={headingsRef}
                          value={vHeadingsBlock}
                          onChange={(e) => setVHeadingsBlock(e.target.value)}
                          rows={7}
                          className="w-full p-3 glass-input rounded-xl text-xs font-sans"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

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
                  
                  <div className="p-4 bg-slate-950/60 rounded-xl space-y-4 border border-slate-800">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-bold mb-1">
                        Fragetext für Q41:
                      </label>
                      <input
                        type="text"
                        value={vQ41Text}
                        onChange={(e) => setVQ41Text(e.target.value)}
                        placeholder="Der Anrufer macht ein/eine:"
                        className="w-full px-3 py-1.5 glass-input rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[11px] text-slate-400 font-bold">
                        Optionen für Frage 41 (a, b, c) & Richtige Antwort wählen:
                      </label>
                      
                      {(['a', 'b', 'c'] as const).map((optKey, optIdx) => {
                        const isCorrect = vQ41Correct === optKey;
                        const optionText = vQ41Options[optIdx] || '';

                        return (
                          <div key={optKey} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
                            {/* Selection Button */}
                            <button
                              type="button"
                              onClick={() => setVQ41Correct(optKey)}
                              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 border ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                                  : 'glass-card text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px] font-black">
                                {optKey.toUpperCase()}
                              </span>
                              <span>{isCorrect ? `✓ ${optKey}) ${optionText || 'Option'} (RICHTIG)` : `${optKey}) ${optionText || 'Option'}`}</span>
                            </button>

                            {/* Option Label Text Input */}
                            <div className="flex-1">
                              <input
                                type="text"
                                value={optionText}
                                onChange={(e) => {
                                  const newOpts = [...vQ41Options] as [string, string, string];
                                  newOpts[optIdx] = e.target.value;
                                  setVQ41Options(newOpts);
                                }}
                                className="w-full px-3 py-1.5 glass-input rounded-xl text-xs font-bold"
                                placeholder={optIdx === 0 ? 'a) Angebot' : optIdx === 1 ? 'b) Bestellung / Buchung' : 'c) Beschwerde'}
                              />
                            </div>
                          </div>
                        );
                      })}
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
                        type="button"
                        onClick={() => handleExportSingleModelltestJSON(mt)}
                        className="px-3 py-1.5 glass-card hover:bg-slate-800 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/40 flex items-center gap-1"
                        title="Diesen Modelltest als JSON exportieren"
                      >
                        <Download className="w-3.5 h-3.5" /> Export (JSON)
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
                      <td className="p-3 max-w-xs">
                        {code.usedByEmails && code.usedByEmails.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                            {code.usedByEmails.map((emailItem, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-900 text-indigo-300 font-mono text-[10px] font-bold rounded-md border border-slate-800"
                              >
                                {emailItem}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Noch keine</span>
                        )}
                      </td>
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {editingFbId ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-pink-400" />}
                {editingFbId ? 'Thema für Q58 bearbeiten' : 'Thema für Schreiben Q58 (Forenbeitrag) hinzufügen'}
              </h3>
              <button
                type="button"
                onClick={() => handleOpenBulkImport('fb')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
              >
                <Upload className="w-3.5 h-3.5" /> ⚡️ Massen-Import (Масовий імпорт)
              </button>
            </div>

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

              <div className="flex items-center justify-end gap-2">
                {editingFbId && (
                  <button
                    type="button"
                    onClick={handleCancelEditFb}
                    className="py-2.5 px-4 glass-card hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Abbrechen
                  </button>
                )}
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> {editingFbId ? 'Änderungen speichern' : 'Thema in Supabase БД speichern'}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Vorhandene Q58 Themen ({(forumsbeitragTopics || []).length})
              </h3>
              {(forumsbeitragTopics || []).length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllFbTopics(!showAllFbTopics)}
                  className="px-3.5 py-1.5 glass-card hover:bg-slate-800 text-indigo-400 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all border border-slate-700"
                >
                  {showAllFbTopics ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Ausblenden
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Alle {(forumsbeitragTopics || []).length} Themen anzeigen
                    </>
                  )}
                </button>
              )}
            </div>

            <div className={`space-y-3 ${showAllFbTopics ? 'max-h-[550px] overflow-y-auto pr-1' : ''}`}>
              {(showAllFbTopics ? (forumsbeitragTopics || []) : (forumsbeitragTopics || []).slice(0, 3)).map((t) => (
                <div key={t.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">
                      {t.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{t.promptText}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditForumsbeitragTopic(t)}
                      className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Thema bearbeiten"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteForumsbeitragTopic(t.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Thema löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {editingSp2Id ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                  {editingSp2Id ? 'Thema Teil 2 bearbeiten' : 'Thema für Sprechen Teil 2'}
                </h3>
                <button
                  type="button"
                  onClick={() => handleOpenBulkImport('sp2')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-lg flex items-center gap-1 shadow-md transition-all"
                >
                  <Upload className="w-3 h-3" /> ⚡️ Massen-Import
                </button>
              </div>
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
                <div className="flex items-center gap-2">
                  {editingSp2Id && (
                    <button
                      type="button"
                      onClick={handleCancelEditSp2}
                      className="py-2 px-3 glass-card hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Abbrechen
                    </button>
                  )}
                  <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> {editingSp2Id ? 'Änderungen speichern' : 'In Supabase БД speichern'}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  Themen Teil 2 ({(sprechenTopics?.sprecher2Topics || []).length})
                </h4>
                {(sprechenTopics?.sprecher2Topics || []).length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSp2Topics(!showAllSp2Topics)}
                    className="px-2.5 py-1 glass-card hover:bg-slate-800 text-indigo-400 font-extrabold text-[11px] rounded-lg flex items-center gap-1 transition-all border border-slate-700"
                  >
                    {showAllSp2Topics ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Ausblenden
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Alle {(sprechenTopics?.sprecher2Topics || []).length} anzeigen
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className={`space-y-2.5 ${showAllSp2Topics ? 'max-h-[500px] overflow-y-auto pr-1' : ''}`}>
                {(showAllSp2Topics
                  ? (sprechenTopics?.sprecher2Topics || [])
                  : (sprechenTopics?.sprecher2Topics || []).slice(0, 3)
                ).map((t) => (
                  <div key={t.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="font-bold text-white">{t.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{t.promptText}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditSp2Topic(t)}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Thema bearbeiten"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSp2Topic(t.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Thema löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sprechen Teil 3 */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {editingSp3Id ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                  {editingSp3Id ? 'Situation Teil 3 bearbeiten' : 'Situation für Sprechen Teil 3'}
                </h3>
                <button
                  type="button"
                  onClick={() => handleOpenBulkImport('sp3')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-lg flex items-center gap-1 shadow-md transition-all"
                >
                  <Upload className="w-3 h-3" /> ⚡️ Massen-Import
                </button>
              </div>
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
                <div className="flex items-center gap-2">
                  {editingSp3Id && (
                    <button
                      type="button"
                      onClick={handleCancelEditSp3}
                      className="py-2 px-3 glass-card hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                    >
                      Abbrechen
                    </button>
                  )}
                  <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5">
                    <Save className="w-3.5 h-3.5" /> {editingSp3Id ? 'Änderungen speichern' : 'In Supabase БД speichern'}
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  Situationen Teil 3 ({(sprechenTopics?.sprecher3Situations || []).length})
                </h4>
                {(sprechenTopics?.sprecher3Situations || []).length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSp3Situations(!showAllSp3Situations)}
                    className="px-2.5 py-1 glass-card hover:bg-slate-800 text-indigo-400 font-extrabold text-[11px] rounded-lg flex items-center gap-1 transition-all border border-slate-700"
                  >
                    {showAllSp3Situations ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Ausblenden
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Alle {(sprechenTopics?.sprecher3Situations || []).length} anzeigen
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className={`space-y-2.5 ${showAllSp3Situations ? 'max-h-[500px] overflow-y-auto pr-1' : ''}`}>
                {(showAllSp3Situations
                  ? (sprechenTopics?.sprecher3Situations || [])
                  : (sprechenTopics?.sprecher3Situations || []).slice(0, 3)
                ).map((s) => (
                  <div key={s.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <div className="font-bold text-white">{s.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-2 mt-0.5">{s.promptText}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditSp3Situation(s)}
                        className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Situation bearbeiten"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSp3Situation(s.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Situation löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BENUTZER-VERWALTUNG TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Top Search & Actions Bar */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-400" /> Benutzer-Verwaltung ({usersList.length})
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Verwalten Sie Kontostatus, Premium-Gültigkeit, Promo-Codes und Benutzer-Sperren.
                </p>
              </div>

              {/* Action Buttons & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 24h Free Trial Master Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !freeTrialActive;
                    setFreeTrialActive(next);
                    setFreeTrialEnabled(next);
                    showToast(
                      next
                        ? '🎁 24h Free Trial für Neuregistrierungen AKTIVIERT!'
                        : '🔒 24h Free Trial DEAKTIVIERT (Neue Registrierungen starten kostenlos)'
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all shadow-sm ${
                    freeTrialActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Schaltet den 24-Stunden-Gratis-Testzugang für alle neuen Registrierungen ein oder aus"
                >
                  <Gift className={`w-4 h-4 ${freeTrialActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>24h Trial: <strong>{freeTrialActive ? 'AKTIV 🟢' : 'AUS 🔴'}</strong></span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Nutzer manuell anlegen
                </button>

                <button
                  type="button"
                  onClick={handleSyncUsers}
                  className="px-3.5 py-2 glass-card hover:bg-slate-800 text-emerald-400 font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700"
                  title="Liste mit Supabase Cloud DB abgleichen"
                >
                  <RefreshCw className="w-4 h-4" /> Aktualisieren
                </button>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    placeholder="Benutzer suchen..."
                    className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400">Gesamte Benutzer</div>
                <div className="text-xl font-black text-white">{usersList.length}</div>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-amber-400">⭐️ Premium-Mitglieder</div>
                <div className="text-xl font-black text-amber-400">
                  {usersList.filter((u) => u.isPremium).length}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400">Kostenlose Konten</div>
                <div className="text-xl font-black text-slate-300">
                  {usersList.filter((u) => !u.isPremium).length}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-rose-400">🚫 Gesperrte Benutzer</div>
                <div className="text-xl font-black text-rose-400">
                  {usersList.filter((u) => u.isBanned).length}
                </div>
              </div>
            </div>
          </div>

          {/* Users Table List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">Benutzer</th>
                    <th className="pb-3 px-3">Rolle</th>
                    <th className="pb-3 px-3">Premium-Status</th>
                    <th className="pb-3 px-3">Gutschein</th>
                    <th className="pb-3 px-3">Registriert</th>
                    <th className="pb-3 px-3">Letzter Login</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {usersList
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearchText.toLowerCase())
                    )
                    .map((u) => {
                      const isSelfOrAdmin = u.role === 'admin' || isAdminEmail(u.email);

                      return (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                          {/* User Info */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm">{u.name}</div>
                                <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3">
                            {u.role === 'admin' ? (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                                ADMIN
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold">
                                BENUTZER
                              </span>
                            )}
                          </td>

                          {/* Premium Status & Days */}
                          <td className="py-3 px-3">
                            {u.isPremium ? (
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-400" /> Premium
                                </span>
                                <div className="text-[11px] text-amber-400 font-bold">
                                  {getRemainingPremiumTimeLabel(u)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs font-semibold">Kostenlos (0 Tage)</span>
                            )}
                          </td>

                          {/* Promo Code */}
                          <td className="py-3 px-3 font-mono text-xs">
                            {u.appliedPromoCode ? (
                              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold">
                                {u.appliedPromoCode}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Registered Date */}
                          <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>

                          {/* Last Login Date */}
                          <td className="py-3 px-3 text-[11px] text-slate-400 font-mono">
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>

                          {/* Status / Ban */}
                          <td className="py-3 px-3">
                            {u.isBanned ? (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                <Ban className="w-3 h-3 text-rose-400" /> Gesperrt
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-400" /> Aktiv
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenAdjustModal(u)}
                                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg text-[11px] font-bold border border-amber-500/40 flex items-center gap-1 transition-all"
                                title="Premium-Tage flexibel anpassen (+Tage / Unbegrenzt / Entziehen)"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-400" /> Tage anpassen
                              </button>

                              {!isSelfOrAdmin ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleBanUser(u.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 ${
                                      u.isBanned
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                    }`}
                                    title={u.isBanned ? 'Benutzer entsperren' : 'Benutzer sperren'}
                                  >
                                    {u.isBanned ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                    {u.isBanned ? 'Entsperren' : 'Sperren'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors"
                                    title="Benutzer löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-bold">
                                  👑 Haupt-Admin
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MANUAL ADD USER MODAL */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="glass-panel p-6 rounded-3xl border border-slate-700 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" /> Nutzer manuell anlegen
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateUserManual} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">E-Mail Adresse *</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="z.B. parovozovo@yahoo.com"
                      className="w-full px-3 py-2.5 glass-input rounded-xl font-mono text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Vollständiger Name</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="z.B. Max Mustermann"
                      className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Rolle</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                        className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold bg-slate-900"
                      >
                        <option value="user">Benutzer (Standard)</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Premium-Tage</label>
                      <select
                        value={newUserPremiumDays}
                        onChange={(e) => setNewUserPremiumDays(Number(e.target.value))}
                        className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold bg-slate-900"
                      >
                        <option value={0}>0 Tage (Kostenlos)</option>
                        <option value={30}>30 Tage (1 Monat)</option>
                        <option value={90}>90 Tage (3 Monate)</option>
                        <option value={365}>365 Tage (1 Jahr)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 py-2.5 glass-card text-slate-300 font-bold rounded-xl"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-4 h-4" /> Nutzer Speichern
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WORTSCHATZ DATABASE ADMIN TAB (VOLLSTÄNDIGER CRUD-EDITOR) */}
      {activeTab === 'wortschatz' && (() => {
        const handleOpenAddModal = () => {
          setEditingWortschatzItem(null);
          setWsFormTerm('');
          setWsFormCategory('nvv');
          setWsFormGrammar('');
          setWsFormMeaning('');
          setWsFormSynonyms('');
          setWsFormExample('');
          setWsFormGapExample('');
          setWsFormGapAnswer('');
          setWsFormGapOptions('');
          setWsFormTransUA('');
          setWsFormTransEN('');
          setShowWortschatzModal(true);
        };

        const handleOpenEditModal = (item: WortschatzItem) => {
          setEditingWortschatzItem(item);
          setWsFormTerm(item.term);
          setWsFormCategory(item.category);
          setWsFormGrammar(item.grammar || '');
          setWsFormMeaning(item.simpleMeaning);
          setWsFormSynonyms(item.synonyms || '');
          setWsFormExample(item.exampleSentence);
          setWsFormGapExample(item.gapExample || '');
          setWsFormGapAnswer(item.gapAnswer || '');
          setWsFormGapOptions(item.gapOptions?.join(', ') || '');
          setWsFormTransUA(item.translations.ua || '');
          setWsFormTransEN(item.translations.en || '');
          setShowWortschatzModal(true);
        };

        const handleSaveWortschatzItem = (e: React.FormEvent) => {
          e.preventDefault();
          if (!wsFormTerm.trim() || !wsFormMeaning.trim() || !wsFormExample.trim()) {
            alert('Bitte füllen Sie mindestens Begriff, Bedeutung und Beispielsatz aus.');
            return;
          }

          const parsedOptions = wsFormGapOptions
            ? wsFormGapOptions.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined;

          let updatedList: WortschatzItem[];

          if (editingWortschatzItem) {
            updatedList = wortschatzList.map((item) =>
              item.id === editingWortschatzItem.id
                ? {
                    ...item,
                    term: wsFormTerm.trim(),
                    category: wsFormCategory,
                    grammar: wsFormGrammar.trim() || undefined,
                    simpleMeaning: wsFormMeaning.trim(),
                    synonyms: wsFormSynonyms.trim() || undefined,
                    exampleSentence: wsFormExample.trim(),
                    gapExample: wsFormGapExample.trim() || undefined,
                    gapAnswer: wsFormGapAnswer.trim() || undefined,
                    gapOptions: parsedOptions && parsedOptions.length > 0 ? parsedOptions : undefined,
                    translations: {
                      ...item.translations,
                      ua: wsFormTransUA.trim() || undefined,
                      en: wsFormTransEN.trim() || undefined,
                    },
                  }
                : item
            );
          } else {
            const newItem: WortschatzItem = {
              id: `ws-${Date.now()}`,
              term: wsFormTerm.trim(),
              category: wsFormCategory,
              grammar: wsFormGrammar.trim() || undefined,
              simpleMeaning: wsFormMeaning.trim(),
              synonyms: wsFormSynonyms.trim() || undefined,
              exampleSentence: wsFormExample.trim(),
              gapExample: wsFormGapExample.trim() || undefined,
              gapAnswer: wsFormGapAnswer.trim() || undefined,
              gapOptions: parsedOptions && parsedOptions.length > 0 ? parsedOptions : undefined,
              translations: {
                ua: wsFormTransUA.trim() || undefined,
                en: wsFormTransEN.trim() || undefined,
              },
              orderIndex: wortschatzList.length + 1,
              createdAt: new Date().toISOString(),
            };
            updatedList = [...wortschatzList, newItem];
          }

          setWortschatzList(updatedList);
          if (onSaveWortschatz) {
            onSaveWortschatz(updatedList);
          }
          setShowWortschatzModal(false);
        };

        const handleDeleteWortschatzItem = (id: string, term: string) => {
          if (confirm(`Möchten Sie den Eintrag "${term}" wirklich löschen?`)) {
            const updated = wortschatzList.filter((x) => x.id !== id);
            setWortschatzList(updated);
            if (onSaveWortschatz) {
              onSaveWortschatz(updated);
            }
          }
        };

        const handleExportWortschatzJSON = () => {
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wortschatzList, null, 2));
          const dlAnchor = document.createElement('a');
          dlAnchor.setAttribute('href', dataStr);
          dlAnchor.setAttribute('download', `wortschatz_b2_export_${Date.now()}.json`);
          dlAnchor.click();
        };

        const handleImportWortschatzJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target?.result as string);
              if (Array.isArray(parsed)) {
                if (confirm(`${parsed.length} Wortschatz-Einträge importieren?`)) {
                  setWortschatzList(parsed);
                  if (onSaveWortschatz) onSaveWortschatz(parsed);
                  alert('Wortschatz-Datenbank erfolgreich aktualisiert!');
                }
              } else {
                alert('Ungültiges Format. Erwartet wird ein JSON-Array von WortschatzItem-Objekten.');
              }
            } catch (err) {
              alert('Fehler beim Parsen der JSON-Datei: ' + err);
            }
          };
          reader.readAsText(file);
        };

        const filteredWortschatz = wortschatzList.filter((item) => {
          if (wortschatzCatFilter !== 'all' && item.category !== wortschatzCatFilter) return false;
          if (!wortschatzSearch.trim()) return true;
          const q = wortschatzSearch.toLowerCase();
          return (
            item.term.toLowerCase().includes(q) ||
            item.simpleMeaning.toLowerCase().includes(q) ||
            item.grammar?.toLowerCase().includes(q) ||
            item.exampleSentence.toLowerCase().includes(q) ||
            item.translations.ua?.toLowerCase().includes(q)
          );
        });

        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/40">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Wortschatz- & NVV-Verwaltung (Datenbank)
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                        {wortschatzList.length} Einträge
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Erstellen, bearbeiten und synchronisieren Sie Wendungen, Redemittel und Grammatikbeispiele.
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Neuer Eintrag
                  </button>

                  <label className="px-3 py-2 glass-card hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> JSON Import
                    <input type="file" accept=".json" onChange={handleImportWortschatzJSON} className="hidden" />
                  </label>

                  <button
                    onClick={handleExportWortschatzJSON}
                    className="px-3 py-2 glass-card hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Als JSON-Datei exportieren"
                  >
                    <Download className="w-3.5 h-3.5" /> JSON Export
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setWortschatzCatFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wortschatzCatFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    Alle ({wortschatzList.length})
                  </button>
                  <button
                    onClick={() => setWortschatzCatFilter('nvv')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wortschatzCatFilter === 'nvv'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    🔗 NVV ({wortschatzList.filter((x) => x.category === 'nvv').length})
                  </button>
                  <button
                    onClick={() => setWortschatzCatFilter('redemittel')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wortschatzCatFilter === 'redemittel'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    💬 Redemittel ({wortschatzList.filter((x) => x.category === 'redemittel').length})
                  </button>
                  <button
                    onClick={() => setWortschatzCatFilter('praepositionen')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wortschatzCatFilter === 'praepositionen'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    📌 Präpositionen ({wortschatzList.filter((x) => x.category === 'praepositionen').length})
                  </button>
                  <button
                    onClick={() => setWortschatzCatFilter('geschaeft')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      wortschatzCatFilter === 'geschaeft'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    💼 Geschäft ({wortschatzList.filter((x) => x.category === 'geschaeft').length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Wortschatz durchsuchen..."
                    value={wortschatzSearch}
                    onChange={(e) => setWortschatzSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Table of Wortschatz Items */}
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ausdruck / Term</th>
                      <th className="py-3 px-4">Kategorie & Grammatik</th>
                      <th className="py-3 px-4">Bedeutung & Übersetzung (UA)</th>
                      <th className="py-3 px-4">Beispielsatz</th>
                      <th className="py-3 px-4 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredWortschatz.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                          Keine Einträge gefunden.
                        </td>
                      </tr>
                    ) : (
                      filteredWortschatz.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white max-w-[200px]">
                            <div>{item.term}</div>
                            {item.gapAnswer && (
                              <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                                Quiz-Lösung: [{item.gapAnswer}]
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase block w-max">
                              {item.category}
                            </span>
                            {item.grammar && (
                              <span className="text-[11px] text-slate-400 mt-0.5 block truncate max-w-[150px]">
                                {item.grammar}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 max-w-[220px]">
                            <div className="text-slate-200 font-medium truncate">{item.simpleMeaning}</div>
                            {item.translations.ua && (
                              <div className="text-[11px] text-amber-300 font-medium truncate mt-0.5">
                                🇺🇦 {item.translations.ua}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-400 italic max-w-[260px] truncate">
                            "{item.exampleSentence}"
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Bearbeiten"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWortschatzItem(item.id, item.term)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Create or Edit Wortschatz Item */}
            {showWortschatzModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-400" />
                      {editingWortschatzItem ? 'Wortschatz-Eintrag bearbeiten' : 'Neuen Wortschatz-Eintrag anlegen'}
                    </h3>
                    <button
                      onClick={() => setShowWortschatzModal(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveWortschatzItem} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Ausdruck / Wendung (Term)*:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="z. B. eine Entscheidung treffen"
                          value={wsFormTerm}
                          onChange={(e) => setWsFormTerm(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Kategorie*:</label>
                        <select
                          value={wsFormCategory}
                          onChange={(e) => setWsFormCategory(e.target.value as WortschatzCategory)}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                        >
                          <option value="nvv">🔗 Nomen-Verb-Verbindung (NVV)</option>
                          <option value="redemittel">💬 Redemittel (Schreiben/Sprechen)</option>
                          <option value="praepositionen">📌 Verben mit Präpositionen</option>
                          <option value="geschaeft">💼 Geschäftswortschatz</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Grammatik / Rektion:
                        </label>
                        <input
                          type="text"
                          placeholder="z. B. + Dativ, Verb: treffen"
                          value={wsFormGrammar}
                          onChange={(e) => setWsFormGrammar(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Synonyme (Deutsch):
                        </label>
                        <input
                          type="text"
                          placeholder="z. B. sich entscheiden, beschließen"
                          value={wsFormSynonyms}
                          onChange={(e) => setWsFormSynonyms(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Einfache deutsche Bedeutung*:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="z. B. sich entscheiden"
                        value={wsFormMeaning}
                        onChange={(e) => setWsFormMeaning(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Beispielsatz im Berufskontext*:
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="z. B. Die Geschäftsleitung muss bis morgen eine wichtige Entscheidung treffen."
                        value={wsFormExample}
                        onChange={(e) => setWsFormExample(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-white"
                      />
                    </div>

                    {/* Quiz & Cloze Fields */}
                    <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                      <div className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">
                        🎯 Quiz- & Lückenübung (Für Quiz & Flashcards)
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          Satz mit Lücke [ _______ ]:
                        </label>
                        <input
                          type="text"
                          placeholder="z. B. Die Geschäftsleitung muss eine Entscheidung [ _______ ]."
                          value={wsFormGapExample}
                          onChange={(e) => setWsFormGapExample(e.target.value)}
                          className="w-full p-2 rounded-xl glass-input text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            Lösungs-Wort (Gap Answer):
                          </label>
                          <input
                            type="text"
                            placeholder="z. B. treffen"
                            value={wsFormGapAnswer}
                            onChange={(e) => setWsFormGapAnswer(e.target.value)}
                            className="w-full p-2 rounded-xl glass-input text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            4 Auswahl-Optionen (kommagetrennt):
                          </label>
                          <input
                            type="text"
                            placeholder="z. B. treffen, machen, schließen, legen"
                            value={wsFormGapOptions}
                            onChange={(e) => setWsFormGapOptions(e.target.value)}
                            className="w-full p-2 rounded-xl glass-input text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Translations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          🇺🇦 Ukrainische Übersetzung:
                        </label>
                        <input
                          type="text"
                          placeholder="z. B. прийняти рішення"
                          value={wsFormTransUA}
                          onChange={(e) => setWsFormTransUA(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-bold mb-1">
                          🇬🇧 Englische Übersetzung:
                        </label>
                        <input
                          type="text"
                          placeholder="z. B. to make a decision"
                          value={wsFormTransEN}
                          onChange={(e) => setWsFormTransEN(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex gap-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowWortschatzModal(false)}
                        className="flex-1 py-2.5 glass-card text-slate-300 font-bold rounded-xl cursor-pointer"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Eintrag Speichern
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* SYSTEM & CLOUD BACKUP TAB */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/40">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">System-Status, Cloud-Sync & Backups</h3>
                <p className="text-xs text-slate-400">
                  Überwachen Sie die Supabase-Cloudverbindung und exportieren/importieren Sie vollständige Datenbank-Snapshots.
                </p>
              </div>
            </div>

            {/* Cloud Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Supabase Cloud-Datenbank
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                    Aktiv Verbunden
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• <strong>Modelltests:</strong> {modelltests.length} Prüfungen mit 12 Teilen</div>
                  <div>• <strong>Q58 Forenbeiträge:</strong> {forumsbeitragTopics.length} Themen</div>
                  <div>• <strong>Sprechen (Teil 2 & 3):</strong> {sprechenTopics.sprecher2Topics.length + sprechenTopics.sprecher3Situations.length} Themen</div>
                  <div>• <strong>Gutscheincodes:</strong> {promoCodes.length} Codes</div>
                  <div>• <strong>Registrierte Benutzer:</strong> {usersList.length} Konten</div>
                </div>
                <button
                  onClick={() => onSaveModelltests(modelltests)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Jetzt vollständige Synchronisation erzwingen
                </button>
              </div>

              {/* Backup & Restore Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-400" /> Vollständiges JSON-Backup
                </span>
                <p className="text-[11px] text-slate-400">
                  Laden Sie eine vollständige Sicherungskopie aller Tests, Aufgaben, Audios, Benutzer und Gutscheine auf Ihren Computer herunter.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleExportDataJSON}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Backup herunterladen
                  </button>
                  <label className="flex-1 py-2.5 glass-card hover:bg-slate-800 text-indigo-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" /> Backup wiederherstellen
                    <input type="file" accept=".json" onChange={handleImportDataJSON} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BULK IMPORT MODAL --- */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" /> ⚡️ Massen-Import (Масовий імпорт тем)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kopieren Sie den Text mit mehreren Themen direkt aus Ihrem Dokument / ChatGPT.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target selector */}
            <div className="p-3 bg-slate-950/30 border-b border-slate-800 flex gap-2 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => setBulkImportTarget('fb')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  bulkImportTarget === 'fb' ? 'bg-pink-600 text-white shadow-md' : 'glass-card text-slate-400'
                }`}
              >
                📝 Schreiben Q58 (Forenbeiträge)
              </button>
              <button
                type="button"
                onClick={() => setBulkImportTarget('sp2')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  bulkImportTarget === 'sp2' ? 'bg-emerald-600 text-white shadow-md' : 'glass-card text-slate-400'
                }`}
              >
                🎙 Sprechen Teil 2
              </button>
              <button
                type="button"
                onClick={() => setBulkImportTarget('sp3')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  bulkImportTarget === 'sp3' ? 'bg-indigo-600 text-white shadow-md' : 'glass-card text-slate-400'
                }`}
              >
                💬 Sprechen Teil 3
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Fügen Sie hier Ihren unstrukturierten oder strukturierten Text ein:
                </label>
                <textarea
                  value={bulkImportText}
                  onChange={(e) => handleParseBulkText(e.target.value)}
                  rows={7}
                  placeholder={`Format-Beispiel:\n\nThema: "Ärztliche Krankmeldung"\nAlle Mitarbeiterinnen und Mitarbeiter in Ihrer Firma sollen im Krankheitsfall...\n\nThema: "Jobticket"\nAn dem kommenden Jahr sollen alle Mitarbeiterinnen...`}
                  className="w-full p-4 glass-input rounded-2xl text-xs font-mono leading-relaxed"
                />
              </div>

              {/* Parsed Preview List */}
              {parsedBulkTopics.length > 0 ? (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Erkannt: {parsedBulkTopics.length} Themen bereit zum Import!
                    </span>
                    <span className="text-[11px] text-slate-400">Vorschau unten:</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {parsedBulkTopics.map((t, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                        <div className="font-extrabold text-xs text-white">
                          #{idx + 1}: {t.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {t.promptText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : bulkImportText.trim() ? (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                  ⚠️ Keines der Themen konnte automatisch erkannt werden. Stellen Sie sicher, dass jedes Thema mit <code className="bg-slate-900 px-1 rounded">Thema: "Titel"</code> або порожнім рядком між блоками.
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                className="px-5 py-2 glass-card text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-800"
              >
                Abbrechen
              </button>

              <button
                type="button"
                disabled={parsedBulkTopics.length === 0}
                onClick={handleConfirmBulkImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> 🚀 {parsedBulkTopics.length} Themen in Supabase speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Premium Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 glass-panel rounded-3xl border border-slate-700/60 shadow-2xl space-y-5">
            <button
              onClick={() => setAdjustingUser(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Premium-Gültigkeit anpassen</h3>
                <p className="text-xs text-slate-400">
                  Legen Sie die Laufzeit für diesen Benutzer fest
                </p>
              </div>
            </div>

            {/* User Target Card */}
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-extrabold text-white">{adjustingUser.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">{adjustingUser.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Aktueller Status</div>
                <div className="font-black text-amber-400 text-xs">
                  {getRemainingPremiumTimeLabel(adjustingUser)}
                </div>
              </div>
            </div>

            {/* Preset Options Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Wählen Sie die gewünschte Verlängerung:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdjustOption('1')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === '1'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>+1 Tag (Trial)</span>
                  {adjustOption === '1' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('7')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === '7'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>+7 Tage (1 Woche)</span>
                  {adjustOption === '7' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('14')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === '14'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>+14 Tage (2 Wochen)</span>
                  {adjustOption === '14' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('30')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === '30'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>+30 Tage (1 Monat)</span>
                  {adjustOption === '30' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('90')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === '90'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>+90 Tage (3 Monate)</span>
                  {adjustOption === '90' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('unlimited')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === 'unlimited'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>👑 Unbegrenzt</span>
                  {adjustOption === 'unlimited' && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('custom')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === 'custom'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>✏️ Eigene Tage</span>
                  {adjustOption === 'custom' && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustOption('remove')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    adjustOption === 'remove'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  <span>❌ Entziehen (Kostenlos)</span>
                  {adjustOption === 'remove' && <CheckCircle className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              </div>

              {adjustOption === 'custom' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Geben Sie die genaue Anzahl der Tage ein:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={customAdjustDays}
                    onChange={(e) => setCustomAdjustDays(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 glass-input rounded-xl text-sm font-bold text-white"
                    placeholder="z.B. 15 oder 45"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={handleSaveAdjustedPremium}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4" /> Gültigkeit speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
