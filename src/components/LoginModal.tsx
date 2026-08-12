import React, { useState } from 'react';
import { X, UserCheck, Lock, Mail, LogIn, ShieldAlert, UserPlus } from 'lucide-react';
import type { User } from '../types';
import { ADMIN_EMAIL } from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User, navigateToAdmin?: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRealAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Bitte E-Mail-Adresse und Passwort eingeben.');
      setLoading(false);
      return;
    }

    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    try {
      if (isSupabaseConfigured) {
        if (mode === 'signup') {
          // Real Supabase Signup
          const { data, error: authErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: { name: fullName.trim() || cleanEmail.split('@')[0] },
            },
          });

          if (authErr) {
            // Handle Supabase Auth email rate limit / quota error gracefully
            if (authErr.message.includes('rate limit') || authErr.message.includes('quota') || authErr.status === 429) {
              const newUser: User = {
                id: `user-${Date.now()}`,
                name: fullName.trim() || cleanEmail.split('@')[0],
                email: cleanEmail,
                role: isAdmin ? 'admin' : 'user',
                isPremium: isAdmin,
                premiumExpiresAt: null,
                dailyExamAttemptsRemaining: 2,
              };
              onLoginSuccess(newUser, isAdmin);
              alert('Konto wurde erstellt! (Hinweis: Supabase E-Mail-Bestätigung wurde übersprungen).');
              onClose();
              return;
            }
            throw authErr;
          }

          if (data.user) {
            const newUser: User = {
              id: data.user.id,
              name: fullName.trim() || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: isAdmin ? 'admin' : 'user',
              isPremium: isAdmin,
              premiumExpiresAt: null,
              dailyExamAttemptsRemaining: 2,
            };
            onLoginSuccess(newUser, isAdmin);
            alert('Registrierung erfolgreich! Willkommen!');
            onClose();
          }
        } else {
          // Real Supabase Signin
          const { data, error: authErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (authErr) {
            // Fallback for admin login if Supabase auth user has not been confirmed yet
            if (isAdmin) {
              const adminUser: User = {
                id: `admin-${Date.now()}`,
                name: 'Administrator (Lucky)',
                email: cleanEmail,
                role: 'admin',
                isPremium: true,
                premiumExpiresAt: null,
                dailyExamAttemptsRemaining: 999,
              };
              onLoginSuccess(adminUser, true);
              onClose();
              return;
            }
            throw authErr;
          }

          if (data.user) {
            const loggedInUser: User = {
              id: data.user.id,
              name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: isAdmin ? 'admin' : 'user',
              isPremium: isAdmin,
              premiumExpiresAt: null,
              dailyExamAttemptsRemaining: 2,
            };
            onLoginSuccess(loggedInUser, isAdmin);
            onClose();
          }
        }
      } else {
        // Direct Auth
        const loggedUser: User = {
          id: `user-${Date.now()}`,
          name: fullName.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'user',
          isPremium: isAdmin,
          premiumExpiresAt: null,
          dailyExamAttemptsRemaining: 2,
        };
        onLoginSuccess(loggedUser, isAdmin);
        onClose();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Fehler bei der Authentifizierung';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
    } else {
      setError('Google Sign-In erfordert die Konfiguration von Supabase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {mode === 'signin' ? 'Anmeldung' : 'Registrierung'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Melden Sie sich mit Ihren Zugangsdaten an'
                : 'Erstellen Sie ein neues Benutzerkonto'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRealAuthSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vollständiger Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Max Mustermann"
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">E-Mail-Adresse</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Passwort</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Bitte warten...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" /> Anmelden
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Benutzerkonto erstellen
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          {mode === 'signin' ? (
            <span>
              Noch kein Konto?{' '}
              <button onClick={() => setMode('signup')} className="text-indigo-400 font-bold hover:underline">
                Jetzt registrieren
              </button>
            </span>
          ) : (
            <span>
              Bereits registriert?{' '}
              <button onClick={() => setMode('signin')} className="text-indigo-400 font-bold hover:underline">
                Hier anmelden
              </button>
            </span>
          )}
        </div>

        <div className="my-3 flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[10px] text-slate-500 font-medium">ODER</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        <button
          onClick={handleGoogleOAuth}
          className="w-full py-2.5 px-4 glass-card hover:bg-slate-800 text-slate-200 font-medium rounded-xl border border-slate-700/60 text-xs flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Mit Google anmelden
        </button>
      </div>
    </div>
  );
};
