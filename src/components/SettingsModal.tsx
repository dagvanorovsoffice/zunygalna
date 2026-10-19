'use client';

import React from 'react';
import { UserProfile, syncProfileSlidersWithGoal, DEFAULT_USER_PROFILE } from '@/lib/calorieEngine';
import { Language } from '@/lib/i18n';
import {
  X,
  Settings,
  Globe,
  Calendar,
  RotateCcw,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  profile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onRestartIntro: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  onChangeLang,
  profile,
  onUpdateProfile,
  onRestartIntro,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {lang === 'mn' ? 'Тохиргоо' : 'Settings'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'mn'
                  ? 'Хэл, зорилтот огноо болон танилцуулга'
                  : 'Language, target date & guided tour'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Language Toggle */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'mn' ? 'Хэл сонгох (Language)' : 'App Language'}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onChangeLang('mn')}
              className={`py-3 px-4 rounded-2xl text-xs font-extrabold border cursor-pointer transition-all ${
                lang === 'mn'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              🇲🇳 Монгол хэл
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`py-3 px-4 rounded-2xl text-xs font-extrabold border cursor-pointer transition-all ${
                lang === 'en'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* 2. Summer Target Date */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            {lang === 'mn'
              ? 'Зуны зорилтот огноо (Өгөгдмөл: 06-15)'
              : 'Target Summer Date (Default: June 15)'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={profile.targetDate}
              onChange={(e) =>
                onUpdateProfile((p) =>
                  syncProfileSlidersWithGoal({
                    ...p,
                    targetDate: e.target.value || p.targetDate,
                  })
                )
              }
              className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-900"
            />
            <button
              type="button"
              onClick={() =>
                onUpdateProfile((p) =>
                  syncProfileSlidersWithGoal({
                    ...p,
                    targetDate: '2027-06-15',
                  })
                )
              }
              className="px-3 py-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold cursor-pointer"
            >
              2027-06-15
            </button>
          </div>
        </div>

        {/* 3. Replay Guided Tour */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRestartIntro();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'mn'
                ? 'Танилцуулга (Guided Tour) дахин эхлүүлэх'
                : 'Restart Intro Guided Tour'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onUpdateProfile(() => DEFAULT_USER_PROFILE);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {lang === 'mn'
                ? 'Анхны утга руу буцаах (Reset)'
                : 'Reset Profile to Default'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
