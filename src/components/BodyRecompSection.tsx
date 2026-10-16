'use client';

import React from 'react';
import {
  UserProfile,
  CaloriePlanSummary,
  calculateBodyRecomp,
} from '@/lib/calorieEngine';
import { Language } from '@/lib/i18n';
import {
  Activity,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sliders,
} from 'lucide-react';

interface BodyRecompSectionProps {
  profile: UserProfile;
  plan: CaloriePlanSummary;
  lang: Language;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
}

export default function BodyRecompSection({
  profile,
  plan,
  lang,
  onUpdateProfile,
}: BodyRecompSectionProps) {
  const recomp = calculateBodyRecomp(profile, plan);

  const currentProtein =
    profile.dailyProteinGrams ?? Math.round((plan.recommendedDailyFoodKcal * 0.25) / 4);
  const currentResistanceDays =
    profile.resistanceDaysPerWeek ?? profile.exerciseDaysPerWeek;

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER BANNER (LIGHT THEME) */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-200 p-6 sm:p-8 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-3">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          {lang === 'mn'
            ? 'Цаашдын хөгжүүлэлт • Өөх ба Булчингийн харьцаа'
            : 'Body Recomposition • Fat Ratio vs. Muscle Ratio'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {lang === 'mn'
            ? 'Өөхний хувь буурч, Булчингийн өсөлт дэмжигдэж байна уу?'
            : 'Is Muscle Growth Promoted While Lowering Your Fat Ratio?'}
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          {lang === 'mn'
            ? 'Зөвхөн жингийн тоо буурах биш, харин өөхний эзлэх хувь (Fat Ratio) багасаж, булчингийн эзлэх хувь (Muscle Ratio) өсөх нь эрүүл, чанга биеийн гол шалгуур юм.'
            : 'True transformation means lowering your Body Fat Ratio (%) while preserving and promoting Skeletal Muscle Ratio (%).'}
        </p>
      </div>

      {/* LIVE RECOMPOSITION STATUS BANNER */}
      <section
        className={`rounded-3xl p-6 border shadow-sm ${
          recomp.isPromotingMuscleGrowth
            ? 'bg-emerald-50/80 border-emerald-300'
            : 'bg-amber-50/80 border-amber-300'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {recomp.isPromotingMuscleGrowth ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {lang === 'mn' ? 'Биеийн бүтцийн төлөв:' : 'Recomposition Status:'}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {lang === 'mn' ? recomp.statusTitleMn : recomp.statusTitleEn}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                {lang === 'mn' ? recomp.adviceMn : recomp.adviceEn}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl bg-white border border-slate-200 px-5 py-3.5 text-center shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500">
              {lang === 'mn' ? 'Булчин дэмжих оноо' : 'Recomp Score'}
            </div>
            <div
              className={`text-2xl font-black mt-0.5 ${
                recomp.isPromotingMuscleGrowth ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {recomp.recompScore} / 100
            </div>
          </div>
        </div>
      </section>

      {/* FAT RATIO VS MUSCLE RATIO VISUAL COMPARISON (TODAY VS JUNE 15) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FAT RATIO CARD */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                {lang === 'mn' ? 'Өөхний эзлэх хувь (Fat Ratio)' : 'Body Fat Ratio (%)'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {recomp.estimatedBodyFatPct}%{' '}
                <span className="text-sm font-normal text-slate-500">
                  ({recomp.fatMassKg} kg)
                </span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">
                {lang === 'mn'
                  ? `${profile.targetDate} гэхэд:`
                  : `By ${profile.targetDate}:`}
              </span>
              <div className="text-xl font-black text-emerald-600">
                ➔ {recomp.projectedSummerFatPct}%
              </div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>{lang === 'mn' ? 'Одоогийн өөхний хувь' : 'Current Fat %'}</span>
              <span>{recomp.estimatedBodyFatPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, recomp.estimatedBodyFatPct * 2)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-emerald-700 pt-2 font-medium">
              <span>
                {lang === 'mn'
                  ? 'Зуны зорилтот өөхний хувь (Буурсан)'
                  : 'Projected Summer Fat % (Lowered)'}
              </span>
              <span className="font-bold">{recomp.projectedSummerFatPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, recomp.projectedSummerFatPct * 2)}%` }}
              />
            </div>
          </div>

          {/* Optional Smart Scale Override */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>
                {lang === 'mn'
                  ? 'Өөрийн InBody / Жингийн өөхний % тохируулах:'
                  : 'Adjust Fat Ratio % (if measured on smart scale):'}
              </span>
              <span className="font-bold text-slate-900">
                {recomp.estimatedBodyFatPct}%
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={45}
              step={0.5}
              value={recomp.estimatedBodyFatPct}
              onChange={(e) =>
                onUpdateProfile((p) => ({
                  ...p,
                  customBodyFatPct: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* MUSCLE RATIO CARD */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                {lang === 'mn'
                  ? 'Араг ясны булчингийн хувь (Muscle Ratio)'
                  : 'Skeletal Muscle Ratio (%)'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {recomp.estimatedSkeletalMusclePct}%{' '}
                <span className="text-sm font-normal text-slate-500">
                  ({recomp.skeletalMuscleMassKg} kg)
                </span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">
                {lang === 'mn'
                  ? `${profile.targetDate} гэхэд:`
                  : `By ${profile.targetDate}:`}
              </span>
              <div className="text-xl font-black text-emerald-600">
                ➔ {recomp.projectedSummerMusclePct}%
              </div>
            </div>
          </div>

          {/* Visual Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>
                {lang === 'mn' ? 'Одоогийн булчингийн хувь' : 'Current Muscle %'}
              </span>
              <span>{recomp.estimatedSkeletalMusclePct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, recomp.estimatedSkeletalMusclePct * 1.8)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-emerald-700 pt-2 font-medium">
              <span>
                {lang === 'mn'
                  ? 'Зуны зорилтот булчингийн хувь (Өссөн)'
                  : 'Projected Summer Muscle % (Promoted)'}
              </span>
              <span className="font-bold">{recomp.projectedSummerMusclePct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, recomp.projectedSummerMusclePct * 1.8)}%`,
                }}
              />
            </div>
          </div>

          {/* Optional Smart Scale Override */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>
                {lang === 'mn'
                  ? 'Өөрийн булчингийн % тохируулах:'
                  : 'Adjust Skeletal Muscle % (if measured):'}
              </span>
              <span className="font-bold text-slate-900">
                {recomp.estimatedSkeletalMusclePct}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={52}
              step={0.5}
              value={recomp.estimatedSkeletalMusclePct}
              onChange={(e) =>
                onUpdateProfile((p) => ({
                  ...p,
                  customMusclePct: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS TO PROMOTE MUSCLE GROWTH WHILE LOWERING FAT */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {lang === 'mn'
              ? 'Булчингийн өсөлтийг дэмжиж өөхийг бууруулах 2 түлхүүр тохиргоо'
              : 'Tune Your Daily Protein & Resistance Training to Promote Muscle Growth'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Protein Slider (Grams) */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">
                {lang === 'mn'
                  ? 'Өдрийн уургийн хэмжээ (грамм):'
                  : 'Daily Protein Intake (g):'}
              </span>
              <span className="text-base font-black text-slate-900">
                {currentProtein} g ({recomp.proteinGramsPerKg} g/kg)
              </span>
            </div>
            <input
              type="range"
              min={45}
              max={210}
              step={5}
              value={currentProtein}
              onChange={(e) =>
                onUpdateProfile((p) => ({
                  ...p,
                  dailyProteinGrams: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>
                {lang === 'mn'
                  ? `Зөвлөмж (1.6г/кг): ${recomp.targetProteinGrams} g`
                  : `Optimal target (1.6g/kg): ${recomp.targetProteinGrams} g`}
              </span>
              <span className="text-emerald-700 font-bold">
                {currentProtein >= recomp.targetProteinGrams * 0.85
                  ? '✅ Булчин өсөхөд хангалттай'
                  : '⚠️ Уургаа нэмээрэй'}
              </span>
            </div>
          </div>

          {/* Resistance Exercise Days */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-amber-600" />
                {lang === 'mn'
                  ? '7 хоногт хийх хүчний / булчин чангалах дасгал:'
                  : 'Weekly Resistance / Muscle Training Sessions:'}
              </span>
              <span className="text-base font-black text-slate-900">
                {currentResistanceDays} {lang === 'mn' ? 'өдөр' : 'days/wk'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={currentResistanceDays}
              onChange={(e) =>
                onUpdateProfile((p) => ({
                  ...p,
                  resistanceDaysPerWeek: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>
                {lang === 'mn'
                  ? 'Зөвлөмж: долоо хоногт 2–4 удаа'
                  : 'Recommended: 2–4 sessions/week'}
              </span>
              <span className="text-amber-700 font-bold">
                {currentResistanceDays >= 2
                  ? '✅ Булчингийн дохиолол идэвхтэй'
                  : '⚠️ Доод тал нь 2 өдөр хийгээрэй'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
