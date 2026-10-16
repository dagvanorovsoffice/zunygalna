'use client';

import React, { useState } from 'react';
import { Language } from '@/lib/i18n';
import { auth, db, isFirebaseEnabled } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserCheck, Mail, Lock, User, Sparkles, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  lang: Language;
  currentName: string;
  onClose: () => void;
  onSuccessAuth: (userData: { name: string; email: string }) => void;
}

export default function AuthModal({
  isOpen,
  lang,
  currentName,
  onClose,
  onSuccessAuth,
}: AuthModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState(currentName || 'Тэмүүлэн');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      if (isFirebaseEnabled && auth) {
        if (mode === 'register') {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          if (db) {
            await setDoc(
              doc(db, 'profiles', cred.user.uid),
              {
                displayName: name,
                email,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
      }

      onSuccessAuth({
        name: name.trim() || 'Тэмүүлэн',
        email: email.trim() || 'user@zunygalna.mn',
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication error';
      setStatusMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Зун яг ална • Zunygalna
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 pt-1">
            {mode === 'register'
              ? lang === 'mn'
                ? 'Төлөвлөгөөгөө хадгалж, найзуудтайгаа уралдах'
                : 'Save Your Summer Plan & Race Friends'
              : lang === 'mn'
              ? 'Бүртгэлээрээ нэвтрэх'
              : 'Sign In to Your Account'}
          </h2>
          <p className="text-xs text-slate-600">
            {lang === 'mn'
              ? 'Өдөр бүрийн шугаман ахиц, Ghost дээд амжилт болон 28 хоногийн матрицаа хадгалаарай.'
              : 'Sync your daily linear progress, Personal Best Ghost, and 28-day deficit heatmap.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'mn' ? 'Шинээр бүртгүүлэх' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'mn' ? 'Нэвтрэх' : 'Login'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'mn'
                  ? 'Таны нэр (Уралдааны зам дээр харагдана)'
                  : 'Display Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  placeholder="Тэмүүлэн"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {lang === 'mn' ? 'И-мэйл эсвэл Утасны дугаар' : 'Email or Phone'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {lang === 'mn' ? 'Нууц үг' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {loading
                ? '...'
                : mode === 'register'
                ? lang === 'mn'
                  ? 'Бүртгүүлж хадгалах'
                  : 'Create Account & Save'
                : lang === 'mn'
                ? 'Нэвтрэх'
                : 'Sign In'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
