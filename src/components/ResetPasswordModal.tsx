import React, { useState } from 'react';
import { X, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import type { User } from '../types';
import { isAdminEmail, syncUserToRegisteredList } from '../utils/storage';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Die eingegebenen Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error: updateErr } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateErr) throw updateErr;

        if (data.user) {
          const email = data.user.email || '';
          const userObj: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0] || 'Benutzer',
            email: email,
            role: isAdminEmail(email) ? 'admin' : 'user',
            isPremium: isAdminEmail(email),
            premiumExpiresAt: null,
            lastLoginAt: new Date().toISOString(),
          };
          syncUserToRegisteredList(userObj);
          onSuccess(userObj);
          onClose();
          return;
        }
      }
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Fehler beim Festlegen des neuen Passworts.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Neues Passwort festlegen</h3>
            <p className="text-xs text-slate-400">
              Geben Sie Ihr neues Passwort für Ihr Benutzerkonto ein
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Neues Passwort</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Passwort wiederholen</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort erneut eingeben"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Wird gespeichert...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Neues Passwort speichern
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
