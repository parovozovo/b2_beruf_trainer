import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, ArrowRight } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    slug: 'dtb-b2-pruefung-aufbau-tipps',
    title: 'Deutsch-Test für den Beruf B2 (DTB): Aufbau, Bewertung & Erfolgsstrategien',
    excerpt: 'Alles, was Sie über die schriftliche und mündliche B2 Beruf Prüfung wissen müssen: Zeitmanagement, Punkteschlüssel und typische Stolpersteine.',
    category: 'Prüfungsratgeber',
    readTime: '6 Min. Lesezeit',
    date: '12. August 2026',
  },
  {
    slug: 'beschwerdebrief-b2-muster-redemittel',
    title: 'Beschwerdebrief B2 Beruf: Perfekter Aufbau, Bausteine & Musterlösung',
    excerpt: 'Wie Sie im schriftlichen Teil der B2 Prüfung die volle Punktzahl beim Beschwerdebrief und bei der Bitte um Information holen.',
    category: 'Schreiben',
    readTime: '8 Min. Lesezeit',
    date: '08. August 2026',
  },
  {
    slug: 'wichtigste-nomen-verb-verbindungen-b2',
    title: 'Die 50 wichtigsten Nomen-Verb-Verbindungen für den Beruf & DTB',
    excerpt: 'Eine Entscheidung treffen, zur Verfügung stehen, in Betracht ziehen: Diese festen Wendungen bringen Ihnen entscheidende Punkte in Grammatik.',
    category: 'Wortschatz',
    readTime: '5 Min. Lesezeit',
    date: '02. August 2026',
  },
  {
    slug: 'muendliche-pruefung-b2-praesentation',
    title: 'Mündliche Prüfung B2 Beruf: Teil 1A/B Präsentation souverän meistern',
    excerpt: 'Redemittel für Einleitung, Hauptteil, Vor- und Nachteile sowie Fazit für Ihre 2-minütige Präsentation vor den Prüfern.',
    category: 'Sprechen',
    readTime: '7 Min. Lesezeit',
    date: '28. Juli 2026',
  },
];

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white font-black">
              B2
            </div>
            <span className="font-black tracking-tight text-slate-900 dark:text-white">Beruf B2+ Blog</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/app" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all">
              Zum Trainer
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-black">
            <BookOpen className="w-3.5 h-3.5" /> B2 Beruf Ratgeber & Lernhilfen
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Tipps, Redemittel & Strategien für Ihre B2 Prüfung
          </h1>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Kostenlose Leitfäden und Artikel zur optimalen Vorbereitung auf den Deutsch-Test für den Beruf.
          </p>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_POSTS.map((post) => (
            <article
              key={post.slug}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
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

                <h2 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{post.date}</span>
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Weiterlesen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-black">Wollen Sie das Gelernte direkt testen?</h3>
            <p className="text-xs text-slate-300">
              Starten Sie unsere interaktiven Modelltests und Wortschatz-Karteikarten.
            </p>
          </div>
          <Link
            to="/app"
            className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 shrink-0 transition-all"
          >
            <span>Zum Trainer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
