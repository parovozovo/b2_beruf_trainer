import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppLogo } from '../AppLogo';
import { getBlogPostBySlug, getBlogPostsLocal } from '../../utils/blogStorage';
import type { BlogPost } from '../../types';

export const BlogPostReader: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPost | undefined>(() => (slug ? getBlogPostBySlug(slug) : undefined));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = getBlogPostBySlug(slug);
      setPost(found);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AppLogo size={48} />
        <h1 className="text-2xl font-black">Artikel nicht gefunden</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Der gesuchte Blogbeitrag existiert leider nicht oder wurde verschoben.
        </p>
        <Link
          to="/blog"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Blogübersicht</span>
        </Link>
      </div>
    );
  }

  const relatedPosts = getBlogPostsLocal()
    .filter((p) => p.id !== post.id && p.published !== false)
    .slice(0, 3);

  // Render markdown-like sections cleanly
  const renderFormattedContent = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
      if (tableHeaders.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              {tableHeaders.length > 0 && (
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-slate-900 dark:text-white">
                    {tableHeaders.map((h, idx) => (
                      <th key={idx} className="p-3 sm:p-4">{h.trim()}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 sm:p-4" dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
        inTable = false;
      }
    };

    const formatInline = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">$1</code>');
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check Table rows
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').slice(1, -1);
        if (cells.some((c) => c.includes('---'))) {
          // Separator row, ignore
          return;
        }
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable(`table-${index}`);
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tight leading-tight">
            {trimmed.replace('# ', '')}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-3 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-black text-slate-900 dark:text-white mt-6 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('> ')) {
        elements.push(
          <div
            key={index}
            className="my-4 p-4 rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed space-y-1"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('> ', '')) }}
          />
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li
            key={index}
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-5 list-disc leading-relaxed my-1 font-medium"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }}
          />
        );
      } else if (trimmed.match(/^\d+\.\s/)) {
        elements.push(
          <li
            key={index}
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 ml-5 list-decimal leading-relaxed my-1 font-medium"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^\d+\.\s/, '')) }}
          />
        );
      } else if (trimmed === '---') {
        elements.push(<hr key={index} className="my-8 border-slate-200 dark:border-slate-800" />);
      } else if (trimmed.length > 0) {
        elements.push(
          <p
            key={index}
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-3 font-medium"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    });

    if (inTable) {
      flushTable(`table-end`);
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zum Blog</span>
          </Link>

          <Link to="/" className="flex items-center gap-2 group">
            <AppLogo size={32} />
            <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white">
              Beruf B2+ Trainer
            </span>
          </Link>

          <Link
            to="/app"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all"
          >
            Zum Trainer
          </Link>
        </div>
      </header>

      {/* Main Post Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Post Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-400">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                B2
              </div>
              <span>{post.author}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link kopiert!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Teilen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Post Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
          {renderFormattedContent(post.content)}
        </article>

        {/* Embedded Interactive Trainer CTA Box */}
        <div className="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-2 border-indigo-500/40 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Direkt in der Praxis üben</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Bereiten Sie sich auf den Deutsch-Test für den Beruf B2 (DTB) vor?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Trainieren Sie alle 12 vollständigen Modelltests, 92 Briefthemen und 385 Wortschatz-Karteikarten direkt in unserem Online-Trainer.
            </p>
          </div>

          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-transform hover:scale-105"
          >
            <span>Jetzt kostenlos testen</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Weitere hilfreiche Artikel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.slug}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm space-y-2 group transition-all"
                >
                  <span className="text-xl">{r.coverEmoji || '📖'}</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug line-clamp-2">
                    {r.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-bold">{r.readTime}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
