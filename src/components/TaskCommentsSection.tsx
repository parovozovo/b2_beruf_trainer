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

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  testId,
  tileType,
  variantId,
  currentUser,
  onOpenLogin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveUserId = currentUser?.id || `guest-${guestName.trim().toLowerCase() || 'anon'}`;
  const isAdmin = currentUser?.role === 'admin';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanText = commentText.trim();
    if (!cleanText) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    const authorName = currentUser?.name || guestName.trim() || 'Gast';
    if (!currentUser && !guestName.trim()) {
      setError('Bitte geben Sie Ihren Namen oder ein Pseudonym ein.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTaskComment({
        testId,
        tileType,
        variantId,
        userId: currentUser?.id || `anon-${Date.now()}`,
        userName: authorName,
        userRole: isAdmin ? 'admin' : 'user',
        userEmail: currentUser?.email,
        content: cleanText,
      });

      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setCommentText('');
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
        setComments((prev) => prev.filter((c) => c.id !== commentId));
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
              Diskussion & Erklärungen
              {comments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {comments.length}
                </span>
              )}
            </span>
            <p className="text-[11px] text-slate-400">
              Fragen stellen, Tipps austauschen oder Grammatik-Erklärungen lesen
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

          {/* New Comment Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!currentUser && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Ihr Name oder Pseudonym *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Z. B. Alex B. oder Deutschlerner..."
                  className="w-full sm:w-64 px-3 py-1.5 glass-input rounded-lg text-xs"
                />
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
              <span className="text-[11px] text-slate-500">
                {currentUser ? (
                  <span>
                    Angemeldet als: <b className="text-slate-300">{currentUser.name}</b>
                  </span>
                ) : (
                  <span>
                    Tipp: Sie können sich auch{' '}
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      anmelden
                    </button>
                  </span>
                )}
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Wird gesendet...' : 'Kommentar posten'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Kommentare werden geladen...</div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/30 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Noch keine Erklärungen oder Kommentare vorhanden.</p>
              <p className="text-[11px] text-slate-500">
                Seien Sie der Erste, der einen Tipp oder eine Frage zu diesem Aufgabenteil postet!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((cmt) => {
                const hasUpvoted = cmt.upvotedBy.includes(effectiveUserId);
                const isAuthor = currentUser && cmt.userId === currentUser.id;
                const canDelete = isAuthor || isAdmin;

                return (
                  <div
                    key={cmt.id}
                    className={`p-4 rounded-xl border transition-all ${
                      cmt.isPinned
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-md shadow-amber-500/5'
                        : cmt.isVerified
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Author initial avatar */}
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-indigo-300">
                          {cmt.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-xs text-slate-200">{cmt.userName}</span>

                        {/* Badges */}
                        {cmt.userRole === 'admin' && (
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

                    {/* Footer / Upvote button */}
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
                    </div>
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
