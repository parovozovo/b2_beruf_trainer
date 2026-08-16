import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  ChevronRight,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  FileText,
  MessageSquare,
  Volume2,
} from 'lucide-react';
import { AppLogo } from '../AppLogo';
import { getBlogPostsLocal } from '../../utils/blogStorage';
import type { BlogPost } from '../../types';

export const BlogPage: React.FC = () => {
  const [posts] = useState<BlogPost[]>(() => getBlogPostsLocal().filter((p) => p.published !== false));
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { label: string; icon: any }[] = [
    { label: 'Alle', icon: BookOpen },
    { label: 'Prüfungsratgeber', icon: Sparkles },
    { label: 'Schreiben', icon: FileText },
    { label: 'Wortschatz', icon: Layers },
    { label: 'Sprechen', icon: MessageSquare },
    { label: 'Hören', icon: Volume2 },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === 'Alle' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.seoKeywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <AppLogo size={36} />
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                Beruf B2+ Trainer
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                Blog
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 hover:text-indigo-600">
              Startseite
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1"
            >
              <span>Zum Trainer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Blog Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>DTB B2 Ratgeber, Leitfäden & Redemittel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Tipps, Musterlösungen & Strategien für Ihre DTB B2 Prüfung
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto">
            Kostenlose, praxiserprobte Anleitungen zur optimalen Vorbereitung auf den Deutsch-Test für den Beruf B2.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Themen, Redemittel oder Keywords suchen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow font-black scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl shrink-0 mt-0.5">{post.coverEmoji || '📖'}</span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {post.title}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{post.date}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Artikel lesen</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-2xl">🔍</div>
            <div className="font-bold text-sm">Keine passenden Artikel gefunden</div>
            <p className="text-xs text-slate-500">Versuchen Sie einen anderen Suchbegriff oder eine andere Kategorie.</p>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-black">Möchten Sie das Wissen direkt interaktiv anwenden?</h3>
            <p className="text-xs text-slate-300">
              Starten Sie unsere 12 vollständigen Modelltests und trainieren Sie alle Prüfungsteile am Bildschirm.
            </p>
          </div>
          <Link
            to="/app"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
          >
            <span>Kostenlos ausprobieren</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
