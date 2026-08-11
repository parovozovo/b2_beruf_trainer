'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Clock, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLanguage';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { label: t.navHome, href: '/', icon: BookOpen },
    { label: t.navExams, href: '/exams', icon: Clock },
    { label: t.navResults, href: '/dashboard', icon: LayoutDashboard },
  ];

  // Don't show bottom nav inside active exam session or login page
  const isExamView = pathname.startsWith('/exam/');
  const isAuthPage = pathname === '/login' || pathname.startsWith('/admin-beruf');
  if (isExamView || isAuthPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe shadow-2xl">
      <nav className="grid grid-cols-3 items-center gap-1 max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-b from-sky-500/20 to-sky-500/5 text-sky-400 font-bold border border-sky-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[10px] font-medium tracking-tight mt-1 truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
