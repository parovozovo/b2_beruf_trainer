'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveTask, getAdminExams } from '@/app/admin-beruf/actions';
import { STANDARD_TELC_SECTIONS } from '@/lib/constants';
import { TaskType, TaskContent, TelcPartId } from '@/types/database.types';
import { ArrowLeft, Save, Plus, Trash2, FileCode, Loader2, Wrench, Sparkles, Volume2, HelpCircle, BookOpen, Layers, Eye, EyeOff } from 'lucide-react';

function BuilderContent() {
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get('examId') || 'demo-exam-b2-1';

  // Atomic Variant Architecture State
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(examIdParam);
  const [newExamTitle, setNewExamTitle] = useState<string>('');
  const [newExamIsPremium, setNewExamIsPremium] = useState<boolean>(false);
  const [isCreatingNewExam, setIsCreatingNewExam] = useState<boolean>(false);

  // Variant Details & Visibility
  const [selectedPartId, setSelectedPartId] = useState<TelcPartId>('TELC_L1');
  const [variantName, setVariantName] = useState<string>('Variante A');
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [teilNumber, setTeilNumber] = useState<number>(1);
  const [taskType, setTaskType] = useState<TaskType>('MATCHING');
  const [instructions, setInstructions] = useState<string>('');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');

  // Payload states (EMPTY BY DEFAULT AS REQUESTED BY USER)
  const [matchingTexts, setMatchingTexts] = useState<Array<{ id: string; text: string }>>([
    { id: 'q1', text: '' },
    { id: 'q2', text: '' },
    { id: 'q3', text: '' },
    { id: 'q4', text: '' },
    { id: 'q5', text: '' },
  ]);
  const [matchingOptions, setMatchingOptions] = useState<Array<{ id: string; text: string; is_option_x?: boolean }>>([
    { id: 'opt_A', text: '' },
    { id: 'opt_B', text: '' },
    { id: 'opt_C', text: '' },
    { id: 'opt_D', text: '' },
    { id: 'opt_E', text: '' },
    { id: 'opt_F', text: '' },
    { id: 'opt_G', text: '' },
    { id: 'opt_H', text: '' },
  ]);
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});

  const [sprachTemplate, setSprachTemplate] = useState<string>('');
  const [sprachGaps, setSprachGaps] = useState<Record<string, { options?: string[]; correct: string }>>({});
  const [distractorWords, setDistractorWords] = useState<string[]>([]);

  const [audioUrl, setAudioUrl] = useState('');
  const [playLimit, setPlayLimit] = useState(1);
  const [audioQuestions, setAudioQuestions] = useState<Array<{ id: string; text: string; options: string[]; correct: string }>>([]);

  const [l2Blocks, setL2Blocks] = useState<Array<{
    id: string;
    title: string;
    text: string;
    tf_question: { id: string; text: string; correct: 'Richtig' | 'Falsch' };
    mc_question: { id: string; text: string; options: string[]; correct: string };
  }>>([
    {
      id: 'b1',
      title: 'Textblock 1',
      text: '',
      tf_question: { id: 'q6', text: '', correct: 'Richtig' },
      mc_question: { id: 'q7', text: '', options: ['', '', ''], correct: '' },
    },
    {
      id: 'b2',
      title: 'Textblock 2',
      text: '',
      tf_question: { id: 'q8', text: '', correct: 'Richtig' },
      mc_question: { id: 'q9', text: '', options: ['', '', ''], correct: '' },
    },
  ]);

  const [hsMcQuestion, setHsMcQuestion] = useState<{ id: string; text: string; options: string[]; correct: string }>({
    id: 'q41',
    text: '',
    options: ['A) ', 'B) ', 'C) '],
    correct: '',
  });
  const [hsMemoFields, setHsMemoFields] = useState<Array<{ id: string; label: string; placeholder: string }>>([
    { id: 'q42_name', label: 'Name des Anrufers (Q42)', placeholder: '' },
    { id: 'q43_tel', label: 'Telefonnummer / Firma (Q43)', placeholder: '' },
    { id: 'q44_info', label: 'Grund des Anrufs (Q44)', placeholder: '' },
    { id: 'q45_todo', label: 'Zu erledigen (Q45)', placeholder: '' },
  ]);

  useEffect(() => {
    getAdminExams().then((exams) => {
      setAvailableExams(exams || []);
    });
  }, []);

  // Set up blank structure for selected Teil
  const applyTeilSelection = (part: TelcPartId) => {
    setSelectedPartId(part);
    setInstructions('');

    if (part === 'TELC_L1') {
      setTaskType('MATCHING');
      setTeilNumber(1);
      setVariantName('Lesen Teil 1 Variant');
      setMatchingTexts([
        { id: 'q1', text: '' },
        { id: 'q2', text: '' },
        { id: 'q3', text: '' },
        { id: 'q4', text: '' },
        { id: 'q5', text: '' },
      ]);
      setMatchingOptions([
        { id: 'opt_A', text: '' },
        { id: 'opt_B', text: '' },
        { id: 'opt_C', text: '' },
        { id: 'opt_D', text: '' },
        { id: 'opt_E', text: '' },
        { id: 'opt_F', text: '' },
        { id: 'opt_G', text: '' },
        { id: 'opt_H', text: '' },
      ]);
      setMatchingAnswers({ q1: 'opt_A', q2: 'opt_B', q3: 'opt_C', q4: 'opt_D', q5: 'opt_E' });
    } else if (part === 'TELC_L2') {
      setTaskType('MULTIPLE_CHOICE');
      setTeilNumber(2);
      setVariantName('Lesen Teil 2 Variant');
    } else if (part === 'TELC_L3') {
      setTaskType('MATCHING');
      setTeilNumber(3);
      setVariantName('Lesen Teil 3 Variant');
      setMatchingTexts([
        { id: 'q10', text: '' },
        { id: 'q11', text: '' },
        { id: 'q12', text: '' },
        { id: 'q13', text: '' },
      ]);
      setMatchingOptions([
        { id: 'opt_A', text: '' },
        { id: 'opt_B', text: '' },
        { id: 'opt_C', text: '' },
        { id: 'opt_D', text: '' },
        { id: 'opt_E', text: '' },
        { id: 'opt_F', text: '' },
        { id: 'opt_X', text: 'Passt keine Option', is_option_x: true },
      ]);
      setMatchingAnswers({ q10: 'opt_A', q11: 'opt_B', q12: 'opt_C', q13: 'opt_D' });
    } else if (part === 'TELC_SB1') {
      setTaskType('SPRACHBAUSTEINE');
      setTeilNumber(11);
      setVariantName('Sprachbausteine Teil 1 Variant');
      setSprachTemplate('');
      setSprachGaps({
        gap_46: { correct: '' },
        gap_47: { correct: '' },
        gap_48: { correct: '' },
        gap_49: { correct: '' },
        gap_50: { correct: '' },
        gap_51: { correct: '' },
      });
      setDistractorWords([]);
    } else if (part === 'TELC_HS') {
      setTaskType('AUDIO_CHOICE');
      setTeilNumber(10);
      setVariantName('Hören & Schreiben Variant');
      setAudioUrl('');
      setPlayLimit(1);
    }
  };

  useEffect(() => {
    applyTeilSelection(selectedPartId);
  }, [selectedPartId]);

  // Construct Task Payload
  const getPayload = (): TaskContent => {
    if (selectedPartId === 'TELC_L2') {
      return {
        telc_part: 'TELC_L2',
        instructions,
        blocks: l2Blocks,
      } as any;
    }

    if (selectedPartId === 'TELC_L3') {
      return {
        telc_part: 'TELC_L3',
        instructions,
        texts: matchingTexts,
        options: matchingOptions,
        correct_answers: matchingAnswers,
      } as any;
    }

    if (selectedPartId === 'TELC_HS') {
      return {
        telc_part: 'TELC_HS',
        instructions,
        audio_url: audioUrl,
        play_limit: playLimit,
        mc_question: hsMcQuestion,
        memo_fields: hsMemoFields,
      } as any;
    }

    if (selectedPartId === 'TELC_SB1') {
      return {
        telc_part: 'TELC_SB1',
        instructions,
        text_template: sprachTemplate,
        gaps: Object.fromEntries(
          Object.entries(sprachGaps).map(([k, v]) => [k, { correct: v.correct }])
        ),
        distractor_words: distractorWords,
      } as any;
    }

    if (taskType === 'MATCHING') {
      return {
        instructions,
        texts: matchingTexts,
        options: matchingOptions,
        correct_answers: matchingAnswers,
      } as any;
    }

    if (taskType === 'AUDIO_CHOICE' || taskType === 'MULTIPLE_CHOICE') {
      return {
        instructions,
        audio_url: audioUrl,
        play_limit: playLimit,
        questions: audioQuestions,
      } as any;
    }

    return {
      instructions,
      text_template: sprachTemplate,
      gaps: sprachGaps,
    } as any;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let targetExamId = selectedExamId;

      // If user typed a new Modelltest title, create it first
      if (isCreatingNewExam && newExamTitle.trim()) {
        const supabase = createClient();
        const { data: newExam } = await (supabase.from('exams') as any)
          .insert({
            title: newExamTitle.trim(),
            level: 'B2_Beruf',
            time_limit_minutes: 45,
            is_published: true,
            is_premium: newExamIsPremium,
          })
          .select()
          .single();

        if (newExam) {
          targetExamId = newExam.id;
        }
      }

      const payload = {
        ...getPayload(),
        is_hidden: isHidden,
      };

      // Save task variant
      const res = await saveTask(
        'sec_dummy',
        teilNumber,
        taskType,
        payload,
        1,
        targetExamId,
        undefined,
        variantName
      );

      if (!res && typeof window !== 'undefined') {
        // Local Dev Fallback
        const devTasksRaw = localStorage.getItem('telc_b2_dev_tasks');
        const currentDevTasks = devTasksRaw ? JSON.parse(devTasksRaw) : [];
        const newDevTask = {
          id: `dev-task-${Date.now()}`,
          exam_id: targetExamId,
          teil_number: teilNumber,
          type: taskType,
          content: payload,
          variant_name: variantName,
          is_hidden: isHidden,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('telc_b2_dev_tasks', JSON.stringify([newDevTask, ...currentDevTasks]));
      }

      alert(`Variante "${variantName}" erfolgreich gespeichert!`);
    } catch (err: any) {
      console.error(err);
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin-beruf"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[11px] font-bold border border-sky-500/20 mb-1">
              <Layers className="w-3 h-3" />
              <span>Atomic Variant Builder</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Aufgaben-Varianten Editor</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'form' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Formular
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'json' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 inline mr-1" />
              JSON Schema
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Variante Speichern</span>
          </button>
        </div>
      </div>

      {/* STEP 1: TEIL SELECTOR (FIRST STEP AS REQUESTED) */}
      <div className="space-y-3">
        <label className="text-xs font-extrabold text-sky-400 uppercase tracking-wider block">
          1. Prüfungs-Teil wählen (Schema)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {STANDARD_TELC_SECTIONS.map((sec) => (
            <button
              key={sec.partId}
              type="button"
              onClick={() => applyTeilSelection(sec.partId as TelcPartId)}
              className={`p-3.5 rounded-2xl border text-left text-xs font-extrabold transition-all flex items-center justify-between ${
                selectedPartId === sec.partId
                  ? 'bg-sky-500 text-white border-sky-400 shadow-lg scale-[1.01] ring-2 ring-sky-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{sec.title}</span>
              {selectedPartId === sec.partId && <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: VARIANT DETAILS & MODELLTEST ASSOCIATION */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
          2. Varianten-Details & Modelltest-Zuordnung
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs text-slate-400 font-medium">Bezeichnung der Variante</label>
            <input
              type="text"
              placeholder="e.g. Variante A"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 font-bold"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs text-slate-400 font-medium">Modelltest (Optional)</label>
            {!isCreatingNewExam ? (
              <div className="flex gap-2">
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 font-bold"
                >
                  {availableExams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} {ex.is_premium ? '(★ Premium)' : '(Free)'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewExam(true)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold text-xs border border-slate-700 shrink-0"
                >
                  + Neu
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Titel (z.B. Modelltest 1)"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setIsCreatingNewExam(false)}
                  className="px-2.5 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-bold border border-slate-700 shrink-0"
                >
                  X
                </button>
              </div>
            )}
          </div>

          <div className="sm:col-span-3 space-y-1 flex flex-col justify-end">
            {/* VISIBILITY TOGGLE (IS_HIDDEN) */}
            <button
              type="button"
              onClick={() => setIsHidden(!isHidden)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                isHidden
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isHidden ? 'Versteckt (is_hidden)' : 'Sichtbar für Nutzer'}</span>
            </button>
          </div>
        </div>

        {isCreatingNewExam && (
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={newExamIsPremium}
                onChange={(e) => setNewExamIsPremium(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span>Neuen Modelltest als Premium kennzeichnen</span>
            </label>
          </div>
        )}
      </div>

      {/* STEP 3: CONTENT EDITOR FORM (EMPTY BY DEFAULT) */}
      {activeTab === 'form' ? (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-sky-400 uppercase tracking-wider block">
              3. Inhalts-Editor ({selectedPartId})
            </label>
            <textarea
              rows={2}
              placeholder="Geben Sie hier die Anweisungen für den Aufgaben-Variante ein..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 text-white text-xs border border-slate-700"
            />
          </div>

          {/* DYNAMIC FORM WITH CLEAN BLANK FIELDS */}
          {selectedPartId === 'TELC_L1' && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white">Lesen Teil 1: 5 Texte & 8 Überschriften (A-H)</h3>

              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-medium">Texte (1-5)</label>
                {matchingTexts.map((t, idx) => (
                  <div key={t.id} className="flex gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-xs font-bold text-sky-400 border border-slate-800 shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Text ${idx + 1}...`}
                      value={t.text}
                      onChange={(e) => {
                        const next = [...matchingTexts];
                        next[idx].text = e.target.value;
                        setMatchingTexts(next);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 text-white text-xs border border-slate-800"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs text-slate-400 font-medium">Überschriften (A-H)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingOptions.map((opt, idx) => (
                    <input
                      key={opt.id}
                      type="text"
                      placeholder={`Überschrift ${String.fromCharCode(65 + idx)}...`}
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...matchingOptions];
                        next[idx].text = e.target.value;
                        setMatchingOptions(next);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 text-white text-xs border border-slate-800 font-mono"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedPartId === 'TELC_L3' && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white">Lesen Teil 3: Situationszuordnung A-F + Option X</h3>
              <div className="space-y-3">
                {matchingTexts.map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-sky-400">Situation {idx + 10}</span>
                    <textarea
                      rows={2}
                      placeholder={`Situation ${idx + 10}...`}
                      value={t.text}
                      onChange={(e) => {
                        const next = [...matchingTexts];
                        next[idx].text = e.target.value;
                        setMatchingTexts(next);
                      }}
                      className="w-full p-2 rounded-lg bg-slate-900 text-white text-xs border border-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedPartId === 'TELC_SB1' && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white">Sprachbausteine Teil 1: Wortschatz-Bank & Distraktoren</h3>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Textvorlage mit [gap_46] ... [gap_51]</label>
                <textarea
                  rows={4}
                  placeholder="Geben Sie den Fließtext ein und verwenden Sie [gap_46], [gap_47]..."
                  value={sprachTemplate}
                  onChange={(e) => setSprachTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* JSON SCHEMA VIEW */
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-sky-400 font-mono block">Vorschau Payload JSON:</span>
          <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
            {JSON.stringify(getPayload(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Builder wird geladen...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
