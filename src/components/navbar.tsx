'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, User, Clock, LayoutDashboard, Award, Globe, Download, LogOut, Sparkles, FileText, Mic, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Language } from '@/lib/i18n/translations';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, initLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const checkDevLocalUser = () => {
    if (typeof window === 'undefined') return false;
    const localRaw = localStorage.getItem('telc_b2_dev_user');
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw);
        if (parsed && parsed.email) {
          setUser(parsed);
          const adminRole = parsed.role === 'ADMIN';
          setIsAdmin(adminRole);
          setIsPremium(adminRole || !!parsed.is_premium);
          return true;
        }
      } catch (err) {
        console.warn('Error parsing dev user:', err);
      }
    }
    return false;
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data: profile } = await (supabase.from('users') as any)
        .select('role, is_premium')
        .eq('id', userId)
        .single();

      if (profile) {
        const adminRole = profile.role === 'ADMIN';
        setIsAdmin(adminRole);
        setIsPremium(adminRole || profile.is_premium);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      checkDevLocalUser();
    }
  };

  useEffect(() => {
    initLanguage();

    // Check Local Dev Bypass Session first
    const hasDevUser = checkDevLocalUser();

    if (!hasDevUser) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser(data.user);
          fetchUserProfile(data.user.id);
        }
      }).catch(() => {
        checkDevLocalUser();
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        } else {
          if (!checkDevLocalUser()) {
            setUser(null);
            setIsAdmin(false);
            setIsPremium(false);
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    // Unregister stale Service Workers in development mode for clean updates
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
    }

    const handleDevAuthChanged = () => {
      checkDevLocalUser();
    };

    window.addEventListener('dev-auth-changed', handleDevAuthChanged);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('dev-auth-changed', handleDevAuthChanged);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [initLanguage]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('telc_b2_dev_user');
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signout silent catch:', err);
    }
    setUser(null);
    setIsAdmin(false);
    setIsPremium(false);
    router.push('/');
  };

  const navLinks = [
    { name: t.navHome, href: '/', icon: BookOpen },
    { name: t.navExams, href: '/exams', icon: Clock },
    { name: 'Schreiben', href: '/schreiben', icon: FileText },
    { name: 'Sprechen', href: '/sprechen', icon: Mic },
    { name: t.navResults, href: '/dashboard', icon: LayoutDashboard },
  ];

  const languages: Array<{ code: Language; label: string; flag: string }> = [
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'uk', label: 'UA', flag: '🇺🇦' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-sky-500 p-[1.5px] shadow-lg shadow-sky-500/10 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10.5px] flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    telc B2 Beruf
                  </span>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                    </span>
                  ) : isPremium ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sparkles className="w-2.5 h-2.5" /> PRO
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      PWA
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:inline">
                  {t.heroBadge}
                </span>
              </div>
            </Link>
          </div>

          {/* Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: i18n & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* PWA Install Button */}
            {showInstallBanner && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all animate-bounce"
                title={t.pwaInstallTitle}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.pwaInstallBtn}</span>
              </button>
            )}

            {/* i18n Language Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1 hidden sm:inline" />
              <div className="flex items-center gap-0.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      language === lang.code
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="ml-1 uppercase text-[10px]">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Auth Controls */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-800">
              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link
                      href="/admin-beruf"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Admin Panel</span>
                    </Link>
                  )}
                  <span className="text-xs text-slate-300 font-medium hidden lg:inline max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
                    title={t.navSignOut}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">{t.navSignOut}</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline">{t.navLogin}</span>
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
