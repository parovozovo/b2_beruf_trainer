import React, { useState } from 'react';
import { X, UserCheck, Lock, Mail, LogIn, ShieldAlert, UserPlus } from 'lucide-react';
import type { User, UserRole, PromoCode } from '../types';
import { isAdminEmail, isFreeTrialEnabled, syncUserToRegisteredList, getRegisteredUsersLocal, getPromoCodesLocal, savePromoCodesLocal } from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { openLegalModal } from './legal/LegalModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialMode?: 'signin' | 'signup' | 'forgot_password';
  onLoginSuccess: (user: User, navigateToAdmin?: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Check for active pending promo code
  const pendingPromoCodeStr = typeof window !== 'undefined'
    ? localStorage.getItem('b2_pending_promo') || new URLSearchParams(window.location.search).get('promo') || ''
    : '';
  const localPromoList = getPromoCodesLocal();
  const activePromo = localPromoList.find(
    (p: PromoCode) => p.code.toUpperCase() === pendingPromoCodeStr.trim().toUpperCase() && p.active
  );

  const applyPromoToNewUser = async (cleanEmail: string) => {
    if (!activePromo) return { promoCode: undefined, isPremium: false, expiresAt: null };

    const hasFreeDays = Boolean(activePromo.durationDays && activePromo.durationDays > 0);
    const expiresAt = hasFreeDays
      ? new Date(Date.now() + (activePromo.durationDays || 30) * 86400000).toISOString()
      : null;

    const updatedUsedBy = Array.from(new Set([...(activePromo.usedByEmails || []), cleanEmail]));
    const updatedCount = (activePromo.usedCount || 0) + 1;
    const updatedCodes = localPromoList.map((p: PromoCode) =>
      p.id === activePromo.id ? { ...p, usedCount: updatedCount, usedByEmails: updatedUsedBy } : p
    );

    savePromoCodesLocal(updatedCodes);
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('promo_codes')
          .update({
            used_count: updatedCount,
            used_by_emails: updatedUsedBy,
          })
          .eq('code', activePromo.code);
      } catch (e) {
        console.warn('Could not sync promo update to Supabase:', e);
      }
    }

    localStorage.removeItem('b2_pending_promo');
    return {
      promoCode: activePromo.code,
      isPremium: hasFreeDays,
      expiresAt: expiresAt,
    };
  };

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

    const isAdmin = isAdminEmail(cleanEmail);

    try {
      // 1. Local duplicate check
      const localExisting = getRegisteredUsersLocal().find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (mode === 'signup' && localExisting) {
        setError('Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen".');
        setLoading(false);
        return;
      }

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
            // Supabase returns empty identities array when email is already registered in Auth!
            if (data.user.identities && data.user.identities.length === 0) {
              setError('Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen".');
              setLoading(false);
              return;
            }

            const promoInfo = await applyPromoToNewUser(cleanEmail);
            const freeTrialOn = isFreeTrialEnabled();
            const trialExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const givePremium = isAdmin || promoInfo.isPremium || freeTrialOn;
            const finalExpiresAt = isAdmin ? null : (promoInfo.isPremium ? promoInfo.expiresAt : (freeTrialOn ? trialExpiresAt : null));
            const finalPromoCode = isAdmin ? undefined : (promoInfo.promoCode || (freeTrialOn ? 'FREE-TRIAL-24H' : undefined));

            const newUser: User = {
              id: data.user.id,
              name: fullName.trim() || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: isAdmin ? 'admin' : 'user',
              isPremium: givePremium,
              premiumExpiresAt: finalExpiresAt,
              appliedPromoCode: finalPromoCode,
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
            // First check if user was already recorded in registered_users or profiles in Supabase or local storage
            let existingInDb: Record<string, unknown> | null = null;
            try {
              const res = await supabase.from('registered_users').select('*').eq('email', cleanEmail).maybeSingle();
              if (res.data) {
                existingInDb = res.data;
              } else {
                const pRes = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
                if (pRes.data) existingInDb = pRes.data;
              }
            } catch (e) {
              console.warn(e);
            }
            const existingLocal = getRegisteredUsersLocal().find(u => u.email.toLowerCase() === cleanEmail);

            const dbExp = existingInDb?.premium_expires_at ? String(existingInDb.premium_expires_at) : null;
            const localExp = existingLocal?.premiumExpiresAt || null;
            const exp = dbExp || localExp;
            const isExpValid = exp ? new Date(exp).getTime() > Date.now() : false;

            const isPrem = isAdmin ? true : (isExpValid || Boolean(existingInDb?.is_premium) || Boolean(existingLocal?.isPremium));
            let promo = (existingInDb?.applied_promo_code ? String(existingInDb.applied_promo_code) : undefined) || existingLocal?.appliedPromoCode;

            // If user did not have a promo attached, but has a pending promo from URL
            if (!promo && activePromo) {
              const promoInfo = await applyPromoToNewUser(cleanEmail);
              if (promoInfo.promoCode) {
                promo = promoInfo.promoCode;
              }
            }

            const loggedInUser: User = {
              id: data.user.id,
              name: data.user.user_metadata?.name || String(existingInDb?.name || '') || existingLocal?.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: isAdmin ? 'admin' : ((existingInDb?.role || existingLocal?.role || 'user') as UserRole),
              isPremium: isPrem,
              premiumExpiresAt: isAdmin ? null : (isPrem ? exp : null),
              appliedPromoCode: promo,
              createdAt: (existingInDb?.created_at ? String(existingInDb.created_at) : undefined) || existingLocal?.createdAt || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            syncUserToRegisteredList(loggedInUser);
            onLoginSuccess(loggedInUser, isAdmin);
            onClose();
          }
        }
      } else {
        // Direct Local Auth fallback
        const promoInfo = await applyPromoToNewUser(cleanEmail);
        const freeTrialOn = isFreeTrialEnabled();
        const trialExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const givePremium = isAdmin || promoInfo.isPremium || freeTrialOn;
        const finalExpiresAt = isAdmin ? null : (promoInfo.isPremium ? promoInfo.expiresAt : (freeTrialOn ? trialExpiresAt : null));
        const finalPromoCode = isAdmin ? undefined : (promoInfo.promoCode || (freeTrialOn ? 'FREE-TRIAL-24H' : undefined));

        const loggedUser: User = {
          id: `user-${Date.now()}`,
          name: fullName.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'user',
          isPremium: givePremium,
          premiumExpiresAt: finalExpiresAt,
          appliedPromoCode: finalPromoCode,
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

        {activePromo && mode === 'signup' && (
          <div className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs text-amber-200">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-base font-bold">
              🎉
            </div>
            <div>
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>Vorteilscode aktiv:</span>
                <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">{activePromo.code}</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {activePromo.durationDays > 0
                  ? `${activePromo.durationDays} Tage VIP-Zugang werden bei Registrierung sofort freigeschaltet!`
                  : `-${activePromo.discountPercent}% Rabatt werden auf alle Tarife im Shop gutgeschrieben!`}
              </div>
            </div>
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

          {mode === 'signup' && (
            <p className="text-[11px] text-slate-500 text-center leading-tight pt-1">
              Mit der Registrierung akzeptieren Sie unsere{' '}
              <button
                type="button"
                onClick={() => openLegalModal('agb')}
                className="text-indigo-600 dark:text-indigo-400 underline font-bold cursor-pointer"
              >
                AGB & Widerrufsverzicht
              </button>{' '}
              und die{' '}
              <button
                type="button"
                onClick={() => openLegalModal('datenschutz')}
                className="text-indigo-600 dark:text-indigo-400 underline font-bold cursor-pointer"
              >
                Datenschutzerklärung
              </button>.
            </p>
          )}
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
