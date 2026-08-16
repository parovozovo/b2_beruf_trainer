import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  Eye,
  BookOpen,
} from 'lucide-react';
import type { BlogPost, BlogPostCategory } from '../../types';
import {
  getBlogPostsLocal,
  saveBlogPostsAsync,
  fetchBlogPostsAsync,
} from '../../utils/blogStorage';

interface AdminBlogManagerProps {
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

const CATEGORIES: BlogPostCategory[] = [
  'Prüfungsratgeber',
  'Schreiben',
  'Wortschatz',
  'Sprechen',
  'Hören',
  'Lesen',
  'Grammatik',
];

export const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({ onShowToast }) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getBlogPostsLocal());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBlogPostsAsync().then((cloudPosts) => {
      if (cloudPosts && cloudPosts.length > 0) {
        setPosts(cloudPosts);
      }
    });
  }, []);

  const handleCreateNew = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: `neuer-artikel-${Math.floor(Math.random() * 1000)}`,
      title: 'Neuer DTB B2 Fachbeitrag',
      excerpt: 'Geben Sie hier eine prägnante SEO-Zusammenfassung des Artikels ein (1-2 Sätze)...',
      content: `# Neuer Artikel für DTB B2

Hier können Sie Ihren Blogartikel verfassen. 

## 1. Wichtige Grundlagen

- Punkt 1
- Punkt 2

> 💡 **Praxistipp:** Nutzen Sie konkrete Redemittel!
`,
      category: 'Prüfungsratgeber',
      readTime: '5 Min. Lesezeit',
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }),
      author: 'Fachredaktion Beruf B2+',
      coverEmoji: '📝',
      seoKeywords: ['DTB B2', 'Deutsch B2 Beruf', 'Prüfungsvorbereitung'],
      published: true,
      orderIndex: posts.length + 1,
      createdAt: new Date().toISOString(),
    };
    setEditingPost(newPost);
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Blogbeitrag wirklich unwiderruflich löschen?')) return;
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    const res = await saveBlogPostsAsync(updated);
    if (res.success) {
      onShowToast('✅ Blogbeitrag gelöscht', 'success');
    } else {
      onShowToast('⚠️ Fehler beim Speichern in Cloud', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      onShowToast('Titel darf nicht leer sein', 'error');
      return;
    }

    setIsSaving(true);
    const exists = posts.some((p) => p.id === editingPost.id);
    const updated = exists
      ? posts.map((p) => (p.id === editingPost.id ? editingPost : p))
      : [editingPost, ...posts];

    setPosts(updated);
    const res = await saveBlogPostsAsync(updated);
    setIsSaving(false);

    if (res.success) {
      onShowToast('✅ Blogbeitrag erfolgreich gespeichert!', 'success');
      setIsEditing(false);
      setEditingPost(null);
    } else {
      onShowToast(`⚠️ Cloud-Sync Fehler: ${res.error}`, 'error');
    }
  };

  const filtered = posts.filter((p) => {
    const matchesCat = selectedCategory === 'Alle' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>Blog & SEO Content Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Erstellen und verwalten Sie SEO-optimierte Fachbeiträge und Prüfungsratgeber für den DTB B2.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Neuen Beitrag verfassen</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Beiträge durchsuchen..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['Alle', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-indigo-500/40 transition-colors"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="text-xl">{post.coverEmoji || '📖'}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black">
                  {post.category}
                </span>
                <span>•</span>
                <span>{post.readTime}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span className={post.published ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                  {post.published ? '✓ Veröffentlicht' : ' Entwurf'}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {post.title}
              </h3>

              <div className="text-xs text-slate-500 font-mono truncate">
                slug: /blog/{post.slug}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Artikel ansehen"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ansehen</span>
              </a>

              <button
                onClick={() => handleEdit(post)}
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Bearbeiten"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bearbeiten</span>
              </button>

              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                title="Löschen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Keine Blogbeiträge gefunden.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditing && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                <span>Blogbeitrag bearbeiten</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Titel (H1)</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Kategorie</label>
                <select
                  value={editingPost.category}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value as BlogPostCategory })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">URL-Slug</label>
                <input
                  type="text"
                  value={editingPost.slug}
                  onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Lesezeit</label>
                <input
                  type="text"
                  value={editingPost.readTime}
                  onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Cover-Emoji</label>
                <input
                  type="text"
                  value={editingPost.coverEmoji || '📖'}
                  onChange={(e) => setEditingPost({ ...editingPost, coverEmoji: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">SEO Excerpt / Zusammenfassung</label>
              <textarea
                rows={2}
                value={editingPost.excerpt}
                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">Inhalt (Markdown / Text)</label>
                <span className="text-[11px] text-slate-400 font-mono">Unterstützt # Überschriften, Listen, Zitate (&gt;) und Tabellen</span>
              </div>
              <textarea
                rows={12}
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <span>Artikel sofort veröffentlichen</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Abbrechen
                </button>

                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Speichere...' : 'Speichern'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
