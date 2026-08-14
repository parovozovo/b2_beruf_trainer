import React, { useState } from 'react';
import { X, UserCheck, Lock, Mail, LogIn, ShieldAlert, UserPlus } from 'lucide-react';
import type { User } from '../types';
import { ADMIN_EMAIL, syncUserToRegisteredList } from '../utils/storage';
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
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRealAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Bitte E-Mail-Adresse eingeben.');
      setLoading(false);
      return;
    }

    // Forgot Password Flow
    if (mode === 'forgot_password') {
      try {
        if (isSupabaseConfigured) {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: `${window.location.origin}/#reset-password`,
          });
          if (resetErr) throw resetErr;
        }
        setSuccessInfo(`Ein Link zum Zurücksetzen Ihres Passworts wurde an ${cleanEmail} gesendet. Bitte überprüfen Sie Ihr Postfach (auch Spam-Ordner).`);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Fehler beim Senden der E-Mail.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Bitte Passwort eingeben.');
      setLoading(false);
      return;
    }

    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    try {
      if (isSupabaseConfigured) {
        if (mode === 'signup') {
          // Check if user already exists in registered_users table
          try {
            const { data: existingRows } = await supabase
              .from('registered_users')
              .select('id, email')
              .eq('email', cleanEmail);
            if (existingRows && existingRows.length > 0) {
              setError('Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen".');
              setLoading(false);
              return;
            }
          } catch (chkErr) {
            console.warn('Could not pre-check user existence in table:', chkErr);
          }

          // Real Supabase Signup
          const { data, error: authErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: { name: fullName.trim() || cleanEmail.split('@')[0] },
            },
          });

          if (authErr) {
            if (
              authErr.message.toLowerCase().includes('already registered') ||
              authErr.message.toLowerCase().includes('already exists') ||
              authErr.message.toLowerCase().includes('user already')
            ) {
              setError('Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen".');
              setLoading(false);
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
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            syncUserToRegisteredList(newUser);
            onLoginSuccess(newUser, isAdmin);
            onClose();
          }
        } else {
          // Real Supabase Signin
          const { data, error: authErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (authErr) {
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
              lastLoginAt: new Date().toISOString(),
            };
            syncUserToRegisteredList(loggedInUser);
            onLoginSuccess(loggedInUser, isAdmin);
            onClose();
          }
        }
      } else {
        // Direct Local Auth fallback
        const loggedUser: User = {
          id: `user-${Date.now()}`,
          name: fullName.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'user',
          isPremium: isAdmin,
          premiumExpiresAt: null,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        syncUserToRegisteredList(loggedUser);
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
              {mode === 'signin'
                ? 'Anmeldung'
                : mode === 'signup'
                ? 'Registrierung'
                : 'Passwort zurücksetzen'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Melden Sie sich mit Ihren Zugangsdaten an'
                : mode === 'signup'
                ? 'Erstellen Sie ein neues Benutzerkonto'
                : 'Geben Sie Ihre E-Mail ein, um ein neues Passwort anzufordern'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-bold">
            <Mail className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successInfo}</span>
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

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Passwort</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError(null);
                      setSuccessInfo(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
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
          )}

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
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" /> Benutzerkonto erstellen
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> Link zum Zurücksetzen senden
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          {mode === 'signin' ? (
            <span>
              Noch kein Konto?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessInfo(null);
                }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Jetzt registrieren
              </button>
            </span>
          ) : (
            <span>
              Bereits registriert?{' '}
              <button
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessInfo(null);
                }}
                className="text-indigo-400 font-bold hover:underline"
              >
                Hier anmelden
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
