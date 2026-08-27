import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  Pin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Lock,
  CornerDownRight,
  Reply,
  X,
} from 'lucide-react';
import type { TaskComment, User } from '../types';
import {
  fetchCommentsForTask,
  createTaskComment,
  toggleUpvoteComment,
  deleteTaskComment,
  togglePinComment,
  toggleVerifyComment,
} from '../utils/commentsService';

interface TaskCommentsSectionProps {
  testId: string;
  tileType: string;
  variantId: string;
  currentUser: User | null;
  onOpenLogin?: () => void;
}

// 16 Deterministic German Learning Animal & Persona Aliases
const ANONYMOUS_PERSONAS = [
  { name: 'Fleißiger Fuchs', icon: '🦊', color: 'from-orange-500 to-amber-600' },
  { name: 'Kluge Eule', icon: '🦉', color: 'from-indigo-500 to-purple-600' },
  { name: 'Schneller Igel', icon: '🦔', color: 'from-amber-600 to-yellow-600' },
  { name: 'Ruhiger Bär', icon: '🐻', color: 'from-amber-700 to-stone-700' },
  { name: 'B2 Adler', icon: '🦅', color: 'from-sky-500 to-blue-600' },
  { name: 'Kluger Delphin', icon: '🐬', color: 'from-cyan-500 to-blue-500' },
  { name: 'Motivierter Wolf', icon: '🐺', color: 'from-slate-500 to-zinc-600' },
  { name: 'Mutiger Löwe', icon: '🦁', color: 'from-yellow-500 to-amber-600' },
  { name: 'Geduldiger Panda', icon: '🐼', color: 'from-slate-700 to-slate-900' },
  { name: 'Freundlicher Koala', icon: '🐨', color: 'from-zinc-500 to-slate-600' },
  { name: 'Schnelles Hörnchen', icon: '🐿️', color: 'from-orange-600 to-amber-700' },
  { name: 'Flinker Gepard', icon: '🐆', color: 'from-amber-500 to-yellow-600' },
  { name: 'B2 Forscher', icon: '🔍', color: 'from-emerald-500 to-teal-600' },
  { name: 'Grammatik Meister', icon: '📚', color: 'from-blue-600 to-indigo-700' },
  { name: 'Wortschatz Profi', icon: '🧠', color: 'from-purple-500 to-pink-600' },
  { name: 'Stiller Denker', icon: '💡', color: 'from-yellow-400 to-orange-500' },
];

function getDisplayAuthor(cmt: TaskComment, currentUserId?: string | null) {
  if (cmt.userRole === 'admin') {
    return {
      displayName: currentUserId === cmt.userId ? 'Administrator (Du)' : 'Administrator',
      avatarEmoji: '👑',
      avatarGradient: 'from-amber-500 to-orange-500',
      isYou: currentUserId === cmt.userId,
      isAdmin: true,
      isTeacher: false,
    };
  }

  if (cmt.userRole === 'teacher') {
    return {
      displayName: currentUserId === cmt.userId ? 'Lehrkraft / Dozent (Du)' : 'Lehrkraft / Dozent',
      avatarEmoji: '🎓',
      avatarGradient: 'from-purple-600 to-indigo-600',
      isYou: currentUserId === cmt.userId,
      isAdmin: false,
      isTeacher: true,
    };
  }

  const isYou = Boolean(currentUserId && cmt.userId === currentUserId);

  let hash = 0;
  for (let i = 0; i < cmt.userId.length; i++) {
    hash = (hash << 5) - hash + cmt.userId.charCodeAt(i);
    hash |= 0;
  }
  const personaIndex = Math.abs(hash) % ANONYMOUS_PERSONAS.length;
  const persona = ANONYMOUS_PERSONAS[personaIndex];

  return {
    displayName: isYou ? `${persona.name} (Du)` : persona.name,
    avatarEmoji: persona.icon,
    avatarGradient: persona.color,
    isYou,
    isAdmin: false,
  };
}

function getCurrentUserPersona(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const personaIndex = Math.abs(hash) % ANONYMOUS_PERSONAS.length;
  return ANONYMOUS_PERSONAS[personaIndex];
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  testId,
  tileType,
  variantId,
  currentUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consistent anonymous client ID for guest users stored locally
  const [anonClientId] = useState<string>(() => {
    let stored = localStorage.getItem('b2_anon_client_id');
    if (!stored) {
      stored = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      localStorage.setItem('b2_anon_client_id', stored);
    }
    return stored;
  });

  const effectiveUserId = currentUser?.id || anonClientId;
  const isAdmin = currentUser?.role === 'admin';
  const myPersona = getCurrentUserPersona(effectiveUserId);

  // Load comments whenever target variant changes
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchCommentsForTask(testId, tileType, variantId);
        if (isMounted) {
          setComments(data);
        }
      } catch (err) {
        console.warn('Error loading comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    return () => {
      isMounted = false;
    };
  }, [testId, tileType, variantId]);

  const [lastPostTime, setLastPostTime] = useState<number>(0);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanText = commentText.trim();
    if (!cleanText || cleanText.length < 5) {
      setError('Der Kommentar muss mindestens 5 Zeichen lang sein.');
      return;
    }

    if (cleanText.length > 1200) {
      setError('Der Kommentar darf maximal 1200 Zeichen lang sein.');
      return;
    }

    // Rate limiting: 20 seconds cooldown (except admin)
    const now = Date.now();
    if (!isAdmin && now - lastPostTime < 20000) {
      const remainingSecs = Math.ceil((20000 - (now - lastPostTime)) / 1000);
      setError(`Bitte warten Sie noch ${remainingSecs} Sekunden vor dem nächsten Kommentar.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTaskComment({
        testId,
        tileType,
        variantId,
        userId: effectiveUserId,
        userName: isAdmin ? 'Administrator' : currentUser?.role === 'teacher' ? 'Lehrkraft / Dozent' : myPersona.name,
        userRole: isAdmin ? 'admin' : currentUser?.role === 'teacher' ? 'teacher' : 'user',
        userEmail: currentUser?.email,
        content: cleanText,
      });

      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setCommentText('');
        setLastPostTime(Date.now());
      } else {
        setError(res.error || 'Fehler beim Senden.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Senden.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    setReplyError(null);
    const cleanText = replyText.trim();
    if (!cleanText || cleanText.length < 3) {
      setReplyError('Die Antwort muss mindestens 3 Zeichen lang sein.');
      return;
    }
    if (cleanText.length > 1000) {
      setReplyError('Die Antwort darf maximal 1000 Zeichen lang sein.');
      return;
    }

    setReplySubmitting(true);
    try {
      const res = await createTaskComment({
        testId,
        tileType,
        variantId,
        parentId,
        userId: effectiveUserId,
        userName: isAdmin ? 'Administrator' : currentUser?.role === 'teacher' ? 'Lehrkraft / Dozent' : myPersona.name,
        userRole: isAdmin ? 'admin' : currentUser?.role === 'teacher' ? 'teacher' : 'user',
        userEmail: currentUser?.email,
        content: cleanText,
      });

      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setReplyText('');
        setReplyingToId(null);
      } else {
        setReplyError(res.error || 'Fehler beim Senden der Antwort.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Senden.';
      setReplyError(msg);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleUpvote = async (commentId: string, targetKey: string) => {
    try {
      const res = await toggleUpvoteComment(commentId, targetKey, effectiveUserId);
      if (res.success) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              const updatedUpvotedBy = res.hasUpvoted
                ? [...c.upvotedBy, effectiveUserId]
                : c.upvotedBy.filter((uid) => uid !== effectiveUserId);
              return {
                ...c,
                upvotes: res.upvotes,
                upvotedBy: updatedUpvotedBy,
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };

  const handleDelete = async (commentId: string, targetKey: string) => {
    if (!window.confirm('Möchten Sie diesen Kommentar wirklich löschen?')) return;
    try {
      const res = await deleteTaskComment(commentId, targetKey);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
      }
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  const handleTogglePin = async (commentId: string, targetKey: string, currentPinned?: boolean) => {
    if (!isAdmin) return;
    const nextVal = !currentPinned;
    await togglePinComment(commentId, targetKey, nextVal);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isPinned: nextVal } : c))
    );
  };

  const handleToggleVerify = async (commentId: string, targetKey: string, currentVerified?: boolean) => {
    if (!isAdmin) return;
    const nextVal = !currentVerified;
    await toggleVerifyComment(commentId, targetKey, nextVal);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isVerified: nextVal } : c))
    );
  };

  // Partition into top-level and replies
  const topLevelComments = comments.filter((c) => !c.parentId);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full mt-6 rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden shadow-xl">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              Anonyme Diskussion & Erklärungen
              {comments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {comments.length}
                </span>
              )}
            </span>
            <p className="text-[11px] text-slate-400">
              Fragen stellen, Tipps austauschen oder Grammatik-Erklärungen lesen (100% anonym)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <span>{isOpen ? 'Einklappen' : 'Öffnen'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Comments Content */}
      {isOpen && (
        <div className="p-5 space-y-5 animate-fadeIn">
          {/* Quick Helper Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setCommentText((prev) => (prev ? prev : '💡 **Tipp zur Aufgabe:** '))}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" /> Tipp teilen
              </button>
              <button
                type="button"
                onClick={() => setCommentText((prev) => (prev ? prev : '❓ **Frage:** Warum ist hier die Antwort... ?'))}
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <HelpCircle className="w-3 h-3 text-sky-400" /> Frage stellen
              </button>
            </div>

            {/* Privacy indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>
                Ihr Pseudonym: <b className="text-slate-200">{isAdmin ? '👑 Dozent / Admin' : `${myPersona.icon} ${myPersona.name}`}</b>
              </span>
            </div>
          </div>

          {/* New Comment Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Schreiben Sie einen Tipp, eine Erklärung oder eine Frage zu diesem Aufgabenteil..."
                rows={3}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs placeholder:text-slate-500 resize-y focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Ihre Identität bleibt für andere Nutzer vollständig geschützt.</span>
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Wird gesendet...' : 'Anonym posten'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Kommentare werden geladen...</div>
          ) : topLevelComments.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/30 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Noch keine Erklärungen oder Kommentare vorhanden.</p>
              <p className="text-[11px] text-slate-500">
                Seien Sie der Erste, der einen Tipp oder eine Frage zu diesem Aufgabenteil postet!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topLevelComments.map((cmt) => {
                const authorInfo = getDisplayAuthor(cmt, effectiveUserId);
                const hasUpvoted = cmt.upvotedBy.includes(effectiveUserId);
                const canDelete = authorInfo.isYou || isAdmin;
                const childReplies = comments.filter((r) => r.parentId === cmt.id);
                const isReplying = replyingToId === cmt.id;

                return (
                  <div
                    key={cmt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      cmt.isPinned
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-md shadow-amber-500/5'
                        : cmt.isVerified
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : authorInfo.isYou
                        ? 'bg-slate-900/90 border-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Animal / Persona Avatar */}
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shadow-inner">
                          {authorInfo.avatarEmoji}
                        </div>
                        <span className={`font-bold text-xs ${authorInfo.isYou ? 'text-indigo-300 font-black' : 'text-slate-200'}`}>
                          {authorInfo.displayName}
                        </span>

                        {/* Badges */}
                        {authorInfo.isAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Sparkles className="w-2.5 h-2.5" /> Dozent / Admin
                          </span>
                        )}

                        {cmt.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verifiziert
                          </span>
                        )}

                        {cmt.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Pin className="w-2.5 h-2.5" /> Angepinnt
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{formatDate(cmt.createdAt)}</span>

                        {/* Admin pin / verify actions */}
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleTogglePin(cmt.id, cmt.targetKey, cmt.isPinned)}
                              className={`p-1 rounded hover:bg-slate-800 text-[10px] ${
                                cmt.isPinned ? 'text-amber-400' : 'text-slate-500'
                              }`}
                              title={cmt.isPinned ? 'Pin entfernen' : 'Oben anpinnen'}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleVerify(cmt.id, cmt.targetKey, cmt.isVerified)}
                              className={`p-1 rounded hover:bg-slate-800 text-[10px] ${
                                cmt.isVerified ? 'text-emerald-400' : 'text-slate-500'
                              }`}
                              title={cmt.isVerified ? 'Verifizierung aufheben' : 'Als verifiziert markieren'}
                            >
                              <ShieldCheck className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Delete button */}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(cmt.id, cmt.targetKey)}
                            className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Kommentar löschen"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-8">
                      {cmt.content}
                    </p>

                    {/* Footer: Upvote & Reply toggle */}
                    <div className="pl-8 pt-2.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpvote(cmt.id, cmt.targetKey)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          hasUpvoted
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                        title={hasUpvoted ? 'Hilfreich-Bewertung zurückziehen' : 'Als hilfreich bewerten'}
                      >
                        <ThumbsUp className={`w-3 h-3 ${hasUpvoted ? 'text-white' : 'text-slate-400'}`} />
                        <span>{cmt.upvotes}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isReplying) {
                            setReplyingToId(null);
                            setReplyText('');
                          } else {
                            setReplyingToId(cmt.id);
                            setReplyText('');
                            setReplyError(null);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isReplying
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Reply className="w-3 h-3" />
                        <span>Antworten</span>
                        {childReplies.length > 0 && (
                          <span className="ml-0.5 px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px] text-slate-400">
                            {childReplies.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Inline Reply Input Form */}
                    {isReplying && (
                      <div className="mt-3 pl-8 animate-fadeIn">
                        <div className="p-3 bg-slate-900/95 rounded-xl border border-indigo-500/30 space-y-2 shadow-lg">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-bold text-indigo-300">
                              <CornerDownRight className="w-3 h-3" /> Antwort an {authorInfo.displayName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyText('');
                                setReplyError(null);
                              }}
                              className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Ihre Antwort schreiben..."
                            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            autoFocus
                          />
                          {replyError && (
                            <div className="text-[11px] text-rose-400 font-medium">{replyError}</div>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyText('');
                                setReplyError(null);
                              }}
                              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                            >
                              Abbrechen
                            </button>
                            <button
                              type="button"
                              disabled={replySubmitting || !replyText.trim()}
                              onClick={() => handleReplySubmit(cmt.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all"
                            >
                              <Send className="w-3 h-3" />
                              <span>{replySubmitting ? 'Sendet...' : 'Antworten'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Second Level Replies List */}
                    {childReplies.length > 0 && (
                      <div className="mt-3 ml-3 pl-3.5 border-l-2 border-indigo-500/30 space-y-2.5">
                        {childReplies.map((reply) => {
                          const replyAuthor = getDisplayAuthor(reply, effectiveUserId);
                          const replyHasUpvoted = reply.upvotedBy.includes(effectiveUserId);
                          const canDeleteReply = replyAuthor.isYou || isAdmin;

                          return (
                            <div
                              key={reply.id}
                              className={`p-3 rounded-xl border transition-all text-xs ${
                                reply.isPinned
                                  ? 'bg-amber-950/20 border-amber-500/40'
                                  : reply.isVerified
                                  ? 'bg-emerald-950/20 border-emerald-500/40'
                                  : replyAuthor.isYou
                                  ? 'bg-slate-900/80 border-indigo-500/20'
                                  : 'bg-slate-950/50 border-slate-800/70 hover:border-slate-700'
                              }`}
                            >
                              {/* Reply Header */}
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
                                    {replyAuthor.avatarEmoji}
                                  </div>
                                  <span className={`font-bold text-[11px] ${replyAuthor.isYou ? 'text-indigo-300 font-black' : 'text-slate-200'}`}>
                                    {replyAuthor.displayName}
                                  </span>

                                  {replyAuthor.isAdmin && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                      Admin
                                    </span>
                                  )}
                                  {reply.isVerified && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Verifiziert
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-slate-500">{formatDate(reply.createdAt)}</span>
                                  {canDeleteReply && (
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(reply.id, reply.targetKey)}
                                      className="p-0.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Antwort löschen"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Reply Content */}
                              <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line pl-6">
                                {reply.content}
                              </p>

                              {/* Upvote for Reply */}
                              <div className="pl-6 pt-1.5 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpvote(reply.id, reply.targetKey)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    replyHasUpvoted
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                                  }`}
                                  title="Als hilfreich bewerten"
                                >
                                  <ThumbsUp className={`w-2.5 h-2.5 ${replyHasUpvoted ? 'text-white' : 'text-slate-400'}`} />
                                  <span>{reply.upvotes}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
