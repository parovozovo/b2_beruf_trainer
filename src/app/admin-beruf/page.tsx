'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAdminExams,
  toggleExamPublished,
  toggleExamPremium,
  deleteExam,
  createExam,
  getPromoCodes,
  createPromoCode,
  togglePromoCodeActive,
  deletePromoCode,
  getSpeakingTopics,
  createSpeakingTopic,
  deleteSpeakingTopic,
} from './actions';
import { STANDARD_TELC_SECTIONS } from '@/lib/constants';
import {
  PlusCircle,
  Edit3,
  Trash2,
  Globe,
  EyeOff,
  Clock,
  Layers,
  Award,
  Loader2,
  Sparkles,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mic,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'exams' | 'promos' | 'topics'>('exams');
  const [exams, setExams] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Exam Form
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamTimeLimit, setNewExamTimeLimit] = useState(45);
  const [newExamIsPremium, setNewExamIsPremium] = useState(false);

  // New Promo Code Form
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDuration, setPromoDuration] = useState(30);
  const [promoMaxUses, setPromoMaxUses] = useState(10);

  // New Topic Form
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [topicTeilNumber, setTopicTeilNumber] = useState(2); // 2, 3, or 58 (Sprechen 1A is hardcoded!)
  const [topicTitle, setTopicTitle] = useState('');
  const [topicFullText, setTopicFullText] = useState('');

  const fetchDevPromos = () => {
    if (typeof window === 'undefined') return [];
    const local = localStorage.getItem('telc_b2_dev_promos');
    return local ? JSON.parse(local) : [];
  };

  const fetchDevTopics = () => {
    if (typeof window === 'undefined') return [];
    const local = localStorage.getItem('telc_b2_dev_topics');
    return local ? JSON.parse(local) : [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsData, promosData, topicsData] = await Promise.all([
        getAdminExams(),
        getPromoCodes(),
        getSpeakingTopics(),
      ]);

      const devPromos = fetchDevPromos();
      const mergedPromos = [...(promosData || []), ...devPromos];

      const devTopics = fetchDevTopics();
      const mergedTopics = [...(topicsData || []), ...devTopics];

      setExams(examsData || []);
      setPromos(mergedPromos);
      setTopics(mergedTopics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    try {
      await createExam(newExamTitle.trim(), 'B2_Beruf', newExamTimeLimit, newExamIsPremium);
      setNewExamTitle('');
      setIsCreatingExam(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await createPromoCode(code, promoDuration, promoMaxUses);
      if (!res && typeof window !== 'undefined') {
        // Local Dev Fallback Save
        const newDevPromo = {
          id: `dev-promo-${Date.now()}`,
          code,
          duration_days: promoDuration,
          max_uses: promoMaxUses,
          current_uses: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        const current = fetchDevPromos();
        localStorage.setItem('telc_b2_dev_promos', JSON.stringify([newDevPromo, ...current]));
      }

      setPromoCodeInput('');
      setIsCreatingPromo(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;

    try {
      const res = await createSpeakingTopic(
        topicTeilNumber,
        topicTitle.trim(),
        topicFullText.trim(),
        []
      );

      if (!res && typeof window !== 'undefined') {
        // Local Dev Fallback Save
        const newDevTopic = {
          id: `dev-topic-${Date.now()}`,
          teil_number: topicTeilNumber,
          title: topicTitle.trim(),
          description: topicFullText.trim(),
          bullet_points: [],
          created_at: new Date().toISOString(),
        };
        const current = fetchDevTopics();
        localStorage.setItem('telc_b2_dev_topics', JSON.stringify([newDevTopic, ...current]));
      }

      setTopicTitle('');
      setTopicFullText('');
      setIsCreatingTopic(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevTopic = (id: string) => {
    if (typeof window === 'undefined') return;
    const current = fetchDevTopics();
    const filtered = current.filter((t: any) => t.id !== id);
    localStorage.setItem('telc_b2_dev_topics', JSON.stringify(filtered));
    fetchData();
  };

  const handleDeleteDevPromo = (id: string) => {
    if (typeof window === 'undefined') return;
    const current = fetchDevPromos();
    const filtered = current.filter((p: any) => p.id !== id);
    localStorage.setItem('telc_b2_dev_promos', JSON.stringify(filtered));
    fetchData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            telc B2 Beruf Administration
          </h1>
          <p className="text-xs text-slate-400">
            Verwaltung von Modelltests, Promo-Codes, Schreiben (Q58) und Sprechen (Teil 2-3)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Modelltests ({exams.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'promos'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Promo-Codes ({promos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'topics'
                ? 'bg-rose-500 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Sprechen & Q58 Themen ({topics.length})</span>
          </button>
        </div>
      </div>

      {/* MODELLTESTS TAB */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Prüfungssätze & Aufgaben-Bank</h2>
            <button
              type="button"
              onClick={() => setIsCreatingExam(!isCreatingExam)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Neuen Modelltest anlegen</span>
            </button>
          </div>

          {/* Create Exam Form */}
          {isCreatingExam && (
            <form
              onSubmit={handleCreateExamSubmit}
              className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl animate-in fade-in"
            >
              <h3 className="text-sm font-bold text-white">Neuer Modelltest</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Titel des Modelltests</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modelltest 2 - telc B2 Beruf"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Zeitlimit (Minuten)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={newExamTimeLimit}
                    onChange={(e) => setNewExamTimeLimit(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExamIsPremium}
                      onChange={(e) => setNewExamIsPremium(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Premium Set</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingExam(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 text-white text-xs font-extrabold shadow-md"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}

          {/* Exams List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
              <span>Daten werden geladen...</span>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 text-sm font-bold">Keine Modelltests in der Datenbank</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-extrabold">
                        {exam.level}
                      </span>
                      {exam.is_premium ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> PREMIUM
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                          KOSTENLOS
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {exam.time_limit_minutes} Min.
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white">{exam.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await toggleExamPremium(exam.id, exam.is_premium);
                        fetchData();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        exam.is_premium
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {exam.is_premium ? '★ Premium Aktiv' : '☆ Zu Premium machen'}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await toggleExamPublished(exam.id, exam.is_published);
                        fetchData();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        exam.is_published
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {exam.is_published ? <Globe className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{exam.is_published ? 'Veröffentlicht' : 'Entwurf'}</span>
                    </button>

                    <Link
                      href={`/admin-beruf/builder?examId=${exam.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-md shadow-sky-500/20"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Task Builder</span>
                    </Link>

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Modelltest "${exam.title}" wirklich löschen?`)) {
                          await deleteExam(exam.id);
                          fetchData();
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROMO CODES TAB */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Promo-Code Generator</h2>
            <button
              type="button"
              onClick={() => setIsCreatingPromo(!isCreatingPromo)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>Neuen Promo-Code generieren</span>
            </button>
          </div>

          {isCreatingPromo && (
            <form
              onSubmit={handleCreatePromoSubmit}
              className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-white">Neuer Promo-Code</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Promo-Code Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ALPHA2026"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white font-mono font-bold text-xs uppercase border border-slate-700"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Gültigkeit (Tage)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={promoDuration}
                    onChange={(e) => setPromoDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Max. Nutzungen</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={promoMaxUses}
                    onChange={(e) => setPromoMaxUses(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPromo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
                >
                  Generieren
                </button>
              </div>
            </form>
          )}

          {promos.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400 text-xs">
              Keine Promo-Codes aktiv.
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                    <th className="p-4">Code</th>
                    <th className="p-4">Gültigkeit</th>
                    <th className="p-4">Nutzungen</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {promos.map((p) => (
                    <tr key={p.id}>
                      <td className="p-4 font-mono font-bold text-amber-300 text-sm">{p.code}</td>
                      <td className="p-4 text-slate-300">{p.duration_days} Tage</td>
                      <td className="p-4 font-semibold text-white">{p.current_uses} / {p.max_uses}</td>
                      <td className="p-4">
                        {p.is_active ? (
                          <span className="text-emerald-400 font-bold">Aktiv</span>
                        ) : (
                          <span className="text-rose-400 font-bold">Deaktiviert</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await togglePromoCodeActive(p.id, p.is_active);
                            fetchData();
                          }}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-slate-300"
                        >
                          {p.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Code löschen?')) {
                              if (p.id.startsWith('dev-promo-')) {
                                handleDeleteDevPromo(p.id);
                              } else {
                                await deletePromoCode(p.id);
                                fetchData();
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SPRECHEN & Q58 TOPICS TAB */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Sprechen & Schreiben (Q58) Themen-Bank</h2>
            <button
              type="button"
              onClick={() => setIsCreatingTopic(!isCreatingTopic)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Neues Thema hinzufügen</span>
            </button>
          </div>

          {isCreatingTopic && (
            <form
              onSubmit={handleCreateTopicSubmit}
              className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-white">Neues Thema anlegen</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-5 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Prüfungsbereich</label>
                  {/* NOTE: Sprechen Teil 1A removed completely! */}
                  <select
                    value={topicTeilNumber}
                    onChange={(e) => setTopicTeilNumber(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 font-bold"
                  >
                    <option value={2}>Sprechen Teil 2 (Präsentation / Stellungnahme)</option>
                    <option value={3}>Sprechen Teil 3 (Gemeinsam planen)</option>
                    <option value={58}>Schreiben (Q58 Forumsbeitrag)</option>
                  </select>
                </div>
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Thema Titel</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weiterbildung im Betrieb"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700"
                  />
                </div>
              </div>

              {/* SIMPLIFIED SINGLE FULL-TEXT TEXTAREA */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Beschreibung & Stichpunkte (Volltext)</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Geben Sie hier die vollständige Beschreibung und alle Stichpunkte / Leitfragen für das Thema ein..."
                  value={topicFullText}
                  onChange={(e) => setTopicFullText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs border border-slate-700 font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTopic(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-extrabold shadow-md"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}

          {topics.length === 0 ? (
            <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400 text-xs">
              Keine Themen von Ihnen angelegt. Klicken Sie oben auf "+ Neues Thema hinzufügen".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((t) => (
                <div key={t.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-extrabold">
                      {t.teil_number === 58 ? 'Schreiben Q58' : `Sprechen Teil ${t.teil_number}`}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Thema "${t.title}" löschen?`)) {
                          if (t.id.startsWith('dev-topic-')) {
                            handleDeleteDevTopic(t.id);
                          } else {
                            await deleteSpeakingTopic(t.id);
                            fetchData();
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-white">{t.title}</h3>
                  {t.description && (
                    <p className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">{t.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
