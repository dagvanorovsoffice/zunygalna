'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  CaloriePlanSummary,
  DeficitTier,
  CommuteMethod,
  ExerciseIntensity,
  calculateAsianBmi,
  kcalToWalkingMeters,
  syncProfileSlidersWithGoal,
} from '@/lib/calorieEngine';
import {
  SAMPLE_MEALS,
  MealCategory,
  scaleMealToDailyKcal,
} from '@/lib/mealData';
import { Language, TRANSLATIONS } from '@/lib/i18n';
import {
  Flame,
  Footprints,
  Bus,
  Bike,
  Car,
  Home,
  Dumbbell,
  Calendar,
  Sliders,
  Utensils,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
  Scale,
  LogIn,
  HeartPulse,
  TrendingDown,
} from 'lucide-react';

interface IntroOnboardingProps {
  profile: UserProfile;
  plan: CaloriePlanSummary;
  lang: Language;
  authUser: { name: string; email: string } | null;
  onOpenAuth: () => void;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onGoToHomeJourney: () => void;
}

export default function IntroOnboarding({
  profile,
  plan,
  lang,
  authUser,
  onOpenAuth,
  onUpdateProfile,
  onGoToHomeJourney,
}: IntroOnboardingProps) {
  const t = TRANSLATIONS[lang];
  const bmiInfo = calculateAsianBmi(profile.heightCm, profile.weightKg);

  // Track which sample option index (0, 1, 2) is selected for Breakfast, Lunch, Dinner
  const [selectedMealIdx, setSelectedMealIdx] = useState<Record<MealCategory, number>>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });

  // Select one of the 3 deficit tiers (Light, Medium, Heavy) and sync the linked sliders
  const handleSelectTier = (tier: DeficitTier) => {
    onUpdateProfile((prev) =>
      syncProfileSlidersWithGoal({
        ...prev,
        deficitTier: tier,
      })
    );
  };

  // Linked Slider 1: Movement Burn (Prioritized first!)
  const handleMovementSliderChange = (newMovementKcal: number) => {
    const tierTotal = plan.dynamicTiers[profile.deficitTier].totalDeficitKcal;
    const linkedDietCut = Math.max(0, tierTotal - newMovementKcal);
    onUpdateProfile((prev) => ({
      ...prev,
      movementAddKcal: newMovementKcal,
      dietCutKcal: linkedDietCut,
    }));
  };

  // Linked Slider 2: Food Calorie Cut
  const handleDietSliderChange = (newDietCutKcal: number) => {
    const tierTotal = plan.dynamicTiers[profile.deficitTier].totalDeficitKcal;
    const maxSafeCut = Math.max(0, plan.baselineTdeeKcal - plan.safeMinFoodKcal);
    const clampedDietCut = Math.min(newDietCutKcal, maxSafeCut);
    const linkedMovement = Math.max(50, tierTotal - clampedDietCut);
    onUpdateProfile((prev) => ({
      ...prev,
      dietCutKcal: clampedDietCut,
      movementAddKcal: linkedMovement,
    }));
  };

  const commuteOptions: Array<{
    id: CommuteMethod;
    labelMn: string;
    labelEn: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'walk',
      labelMn: 'Явган алхдаг',
      labelEn: 'Walk',
      icon: <Footprints className="w-5 h-5" />,
    },
    {
      id: 'bus_walk',
      labelMn: 'Автобус + Алхалт',
      labelEn: 'Bus + Walk',
      icon: <Bus className="w-5 h-5" />,
    },
    {
      id: 'bike',
      labelMn: 'Дугуй / Скүүтэр',
      labelEn: 'Bike / Scooter',
      icon: <Bike className="w-5 h-5" />,
    },
    {
      id: 'car',
      labelMn: 'Машинаар',
      labelEn: 'Car / Drive',
      icon: <Car className="w-5 h-5" />,
    },
    {
      id: 'wfh',
      labelMn: 'Гэрээсээ ажилладаг',
      labelEn: 'Work From Home',
      icon: <Home className="w-5 h-5" />,
    },
  ];

  const distancePresetsKm = [0.8, 1.5, 2.5, 4.0, 6.0];
  const exerciseFreqPresets = [
    { days: 0, labelMn: '0 өдөр', labelEn: '0 days' },
    { days: 2, labelMn: '1–2 өдөр', labelEn: '1–2 days' },
    { days: 4, labelMn: '3–4 өдөр', labelEn: '3–4 days' },
    { days: 6, labelMn: '5+ өдөр', labelEn: '5+ days' },
  ];

  const intensityPresets: Array<{
    id: ExerciseIntensity;
    labelMn: string;
    labelEn: string;
    descMn: string;
    descEn: string;
  }> = [
    {
      id: 'light',
      labelMn: 'Хөнгөн',
      labelEn: 'Light',
      descMn: 'Алхалт, сунгалт, иог',
      descEn: 'Brisk walk, stretching, yoga',
    },
    {
      id: 'moderate',
      labelMn: 'Дундаж',
      labelEn: 'Moderate',
      descMn: 'Фитнесс, шогших, дугуй',
      descEn: 'Gym weights, jogging, swimming',
    },
    {
      id: 'intense',
      labelMn: 'Эрчимтэй',
      labelEn: 'Intense',
      descMn: 'Сагс, HIIT, хүчний бэлтгэл',
      descEn: 'HIIT, basketball, heavy training',
    },
  ];

  const movementEquivalentMeters = kcalToWalkingMeters(
    profile.movementAddKcal,
    profile.weightKg
  );

  return (
    <div className="space-y-8 pb-8">
      {/* INTRO / WELCOME & MISSION BANNER */}
      <div className="rounded-3xl bg-white border border-emerald-200 p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'mn'
              ? 'Танилцуулга (Intro) • Зун яг ална'
              : 'Welcome Intro • Zunygalna'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {lang === 'mn'
              ? 'Өдөр тутмын жижиг үйлдэл хуримтлагдсаар зуны өмнө том өөрчлөлт болдог'
              : 'See the Effects of Small Daily Actions on Your Lifestyle Over Time'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === 'mn'
              ? '1) Доорх сонголтуудаар өөрийн мэдээлэл болон Зуны зорилтот жингээ оруулна уу. 2) Таны өдөрт шатаах илчлэг, 3 төрлийн хурд (Хөнгөн, Дундаж, Эрчимтэй), болон Өглөө/Өдөр/Оройн хоолны граммын жишээ шууд тооцоологдоно. 3) Хуудасны доод хэсэгт найз нөхөд, гэр бүлтэйгээ уралдах Шугаман Замнал (Home) байрлана.'
              : '1) Select your metrics & Target Weight below using quick sliders and tap-cards. 2) Instantly see your daily calorie burn, 3 deficit options, and metric meal portions in grams. 3) Scroll down or tap Home for your daily right-facing linear journey with friends & family.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
          {!authUser && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex-1 lg:flex-initial px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'mn'
                  ? 'Нэвтрэх / Бүртгүүлэх'
                  : 'Login / Register Account'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onGoToHomeJourney}
            className="flex-1 lg:flex-initial px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>
              {lang === 'mn'
                ? 'Шугаман замнал (Home) руу очих'
                : 'Jump to Linear Journey'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HERO LIVE SUMMARY BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-200 p-6 sm:p-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'mn'
              ? 'Ази хүний биеийн онцлогт тохируулсан тооцоолол'
              : 'Calibrated with Asian Clinical & Metabolic Studies'}
          </span>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            {t.summerCountdownPrefix}
            {profile.targetDate}
            {t.summerCountdownSuffix}: {plan.daysUntilSummerTarget} {t.daysLeft}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {t.introHeroTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {t.introHeroSubtitle}
        </p>

        {/* LIVE SUMMARY PILLS (ALL 4 UPDATE LIVE WHEN TARGET WEIGHT OR SLIDERS CHANGE!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-xs">
            <div className="text-xs font-medium text-slate-500">
              {lang === 'mn' ? 'Одоогийн өдрийн шаталт' : 'Baseline Daily Burn'}
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {plan.baselineTdeeKcal.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              BMR {plan.bmrKcal} + {lang === 'mn' ? 'Зорчилт/Дасгал' : 'Commute/Workout'}{' '}
              {plan.commuteKcal + plan.dailyAvgExerciseKcal} kcal
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50/90 border border-emerald-300 p-3.5 shadow-xs">
            <div className="text-xs font-semibold text-emerald-800">
              {lang === 'mn' ? 'Шинэ нийт өдрийн шаталт' : 'Target Total Daily Burn'}
            </div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
              {plan.projectedTotalBurnKcal.toLocaleString()}{' '}
              <span className="text-xs font-normal text-emerald-700">kcal</span>
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">
              +{(plan.totalDailyTargetDistanceMeters / 1000).toFixed(1)} km (
              {plan.totalDailyTargetDistanceMeters.toLocaleString()} m){' '}
              {lang === 'mn' ? 'идэвхтэй зам' : 'active/day'}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50/90 border border-amber-300 p-3.5 shadow-xs">
            <div className="text-xs font-semibold text-amber-800">
              {lang === 'mn' ? 'Өдөрт идэх хоолны илчлэг' : 'Daily Food Intake Target'}
            </div>
            <div className="text-xl font-extrabold text-amber-700 mt-0.5">
              {plan.recommendedDailyFoodKcal.toLocaleString()}{' '}
              <span className="text-xs font-normal text-amber-700">kcal</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-1 font-medium">
              {lang === 'mn'
                ? `Аюулгүй доод хязгаар: ${plan.safeMinFoodKcal} ккал`
                : `Safe clinical floor: ${plan.safeMinFoodKcal} kcal`}
            </div>
          </div>

          {/* CARD 4 (ss1): UPDATES LIVE WITH TARGET WEIGHT, TIER & SLIDERS */}
          <div className="rounded-2xl bg-white border-2 border-emerald-400 p-3.5 shadow-xs">
            <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
              <span>
                {lang === 'mn'
                  ? `${profile.targetDate} гэхэд жин`
                  : `Weight by ${profile.targetDate}`}
              </span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span>
                {plan.projectedWeightOnTargetDateKg}{' '}
                <span className="text-xs font-normal text-slate-500">kg</span>
              </span>
              <span className="text-xs font-extrabold text-emerald-600">
                (-{plan.projectedKgLostBySummer} kg)
              </span>
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              {lang === 'mn'
                ? `Зорилт: ${profile.targetWeightKg} кг (-${plan.kgToLose} кг) • -${plan.totalDailyNetDeficitKcal} ккал/өдөр`
                : `Goal: ${profile.targetWeightKg} kg (-${plan.kgToLose} kg) • -${plan.totalDailyNetDeficitKcal} kcal/day`}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: VISUAL BODY METRICS & TARGET WEIGHT SELECTORS */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-600" />
            {t.step1Title}
          </h2>
          <span
            className={`text-xs font-bold px-3.5 py-1 rounded-full ${bmiInfo.colorClass}`}
          >
            BMI {bmiInfo.bmi} • {lang === 'mn' ? bmiInfo.labelMn : bmiInfo.labelEn}
          </span>
        </div>

        {/* Gender + Target Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t.genderLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map((g) => {
                const active = profile.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onUpdateProfile((p) => ({ ...p, gender: g }))}
                    className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{g === 'male' ? '👨' : '👩'}</span>
                    <span>{g === 'male' ? t.male : t.female}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t.targetDateLabel} (Зун яг ална — 6 сарын 15)
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
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
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
                className="shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 cursor-pointer"
              >
                06-15
              </button>
            </div>
          </div>
        </div>

        {/* Scrubbable Sliders for Age, Height (cm), Current Weight (kg), Target Weight (kg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AGE */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">{t.ageLabel}</span>
              <span className="text-lg font-extrabold text-slate-900">{profile.age}</span>
            </div>
            <input
              type="range"
              min={16}
              max={75}
              value={profile.age}
              onChange={(e) =>
                onUpdateProfile((p) => ({ ...p, age: Number(e.target.value) }))
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>16</span>
              <span>30</span>
              <span>50</span>
              <span>75</span>
            </div>
          </div>

          {/* HEIGHT (CM) */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">{t.heightLabel}</span>
              <span className="text-lg font-extrabold text-slate-900">
                {profile.heightCm} cm
              </span>
            </div>
            <input
              type="range"
              min={145}
              max={205}
              value={profile.heightCm}
              onChange={(e) =>
                onUpdateProfile((p) => ({ ...p, heightCm: Number(e.target.value) }))
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>145 cm</span>
              <span>170 cm</span>
              <span>205 cm</span>
            </div>
          </div>

          {/* CURRENT WEIGHT (KG) */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">
                {t.currentWeightLabel}
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {profile.weightKg} kg
              </span>
            </div>
            <input
              type="range"
              min={42}
              max={150}
              step={0.5}
              value={profile.weightKg}
              onChange={(e) => {
                const newW = Number(e.target.value);
                onUpdateProfile((p) =>
                  syncProfileSlidersWithGoal({
                    ...p,
                    weightKg: newW,
                    targetWeightKg: Math.min(p.targetWeightKg, newW - 1),
                  })
                );
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>42 kg</span>
              <span>85 kg</span>
              <span>150 kg</span>
            </div>
          </div>

          {/* TARGET WEIGHT (KG) — DYNAMICALLY UPDATES PLAN, SLIDERS & SS1! */}
          <div className="rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">
                {t.targetWeightLabel}
              </span>
              <span className="text-lg font-extrabold text-emerald-700">
                {profile.targetWeightKg} kg
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={Math.max(41, profile.weightKg - 0.5)}
              step={0.5}
              value={profile.targetWeightKg}
              onChange={(e) => {
                const newTargetW = Number(e.target.value);
                onUpdateProfile((p) =>
                  syncProfileSlidersWithGoal({
                    ...p,
                    targetWeightKg: newTargetW,
                  })
                );
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-emerald-800 font-medium mt-1">
              <span>
                {lang === 'mn' ? 'Ази хэвийн жин:' : 'Asian ideal:'}{' '}
                {bmiInfo.healthyMinKg}–{bmiInfo.healthyMaxKg} kg
              </span>
              <span className="font-bold">-{plan.kgToLose} kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: WORK-HOME TRAVEL (COMMUTE) & EXERCISE SELECTION TOOLS */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Footprints className="w-5 h-5 text-emerald-600" />
            {t.step2Title}
          </h2>
          <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {lang === 'mn'
              ? `Зорчилт: +${plan.commuteKcal} ккал (${plan.commuteActiveMeters} м/өдөр) • Дасгал: +${plan.dailyAvgExerciseKcal} ккал/өдөр`
              : `Commute: +${plan.commuteKcal} kcal (${plan.commuteActiveMeters} m/day) • Workout avg: +${plan.dailyAvgExerciseKcal} kcal/day`}
          </span>
        </div>

        {/* Commute Method Tap Cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2.5">
            {t.commuteMethodLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {commuteOptions.map((opt) => {
              const active = profile.commuteMethod === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onUpdateProfile((p) => ({ ...p, commuteMethod: opt.id }))
                  }
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {opt.icon}
                    {active && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {lang === 'mn' ? opt.labelMn : opt.labelEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Commute Distance Chips (Metric km) */}
        {profile.commuteMethod !== 'wfh' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2">
                {t.commuteDistanceLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {distancePresetsKm.map((km) => {
                  const active = profile.commuteDistanceKm === km;
                  return (
                    <button
                      key={km}
                      type="button"
                      onClick={() =>
                        onUpdateProfile((p) => ({ ...p, commuteDistanceKm: km }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {km} km ({km * 1000} m)
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
              <input
                type="checkbox"
                checked={profile.commuteRoundTrip}
                onChange={(e) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    commuteRoundTrip: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">
                {t.roundTripLabel} (×2 ={' '}
                {(
                  profile.commuteDistanceKm * (profile.commuteRoundTrip ? 2 : 1)
                ).toFixed(1)}{' '}
                km)
              </span>
            </label>
          </div>
        )}

        {/* Exercise Frequency & Intensity Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              <Dumbbell className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" />
              {t.exerciseFreqLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {exerciseFreqPresets.map((item) => {
                const active = profile.exerciseDaysPerWeek === item.days;
                return (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() =>
                      onUpdateProfile((p) => ({
                        ...p,
                        exerciseDaysPerWeek: item.days,
                      }))
                    }
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {lang === 'mn' ? item.labelMn : item.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              {t.exerciseIntensityLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {intensityPresets.map((item) => {
                const active = profile.exerciseIntensity === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      onUpdateProfile((p) => ({
                        ...p,
                        exerciseIntensity: item.id,
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">
                      {lang === 'mn' ? item.labelMn : item.labelEn}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {lang === 'mn' ? item.descMn : item.descEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* STEP 3: 3 DEFICIT OPTIONS (LIGHT, MEDIUM, HEAVY) + 2 LINKED HORIZONTAL SLIDERS */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 mb-2">
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            {t.twoSidesBadge}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t.step3Title}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.twoSidesDesc}</p>
        </div>

        {/* 3 Deficit Tier Cards (Dynamically Scaled to Target Weight & Target Date) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['light', 'medium', 'heavy'] as DeficitTier[]).map((tier) => {
            const info = plan.dynamicTiers[tier];
            const proj = plan.tierProjections[tier];
            const active = profile.deficitTier === tier;

            return (
              <button
                key={tier}
                type="button"
                onClick={() => handleSelectTier(tier)}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  active
                    ? 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {lang === 'mn' ? info.labelMn : info.labelEn}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      -{info.totalDeficitKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {lang === 'mn' ? info.descMn : info.descEn}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'mn' ? '7 хоногт:' : 'Weekly pace:'}</span>
                    <span className="font-bold text-emerald-700">
                      ~{info.weeklyLossKg} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {lang === 'mn'
                        ? `${profile.targetDate} гэхэд:`
                        : `By ${profile.targetDate}:`}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {proj.projectedWeightBySummerKg} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>
                      {lang === 'mn'
                        ? `${profile.targetWeightKg} кг-д хүрэх:`
                        : `Reaches ${profile.targetWeightKg} kg:`}
                    </span>
                    <span className="font-bold text-amber-700">
                      {proj.estimatedGoalDate}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Asian Clinical Research Note for Selected Tier */}
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {lang === 'mn'
              ? plan.dynamicTiers[profile.deficitTier].studyNoteMn
              : plan.dynamicTiers[profile.deficitTier].studyNoteEn}
          </p>
        </div>

        {/* THE TWO LINKED HORIZONTAL SLIDERS */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-amber-50 border border-emerald-300 p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-bold text-slate-900">
              {lang === 'mn'
                ? 'Өдрийн цэвэр алдагдлыг Хөдөлгөөн ба Хоолонд хуваарилах (Хоорондоо уялдаатай 2 гулсуур)'
                : 'Balance Your Daily Deficit: Movement Burn 1st ↔ Food Calorie Cut 2nd'}
            </div>
            <div className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
              {lang === 'mn' ? 'Нийт цэвэр алдагдал:' : 'Total Net Deficit:'} -
              {plan.totalDailyNetDeficitKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLIDER 1: MOVEMENT BURN (FIRST!) */}
            <div className="rounded-2xl bg-white border border-emerald-300 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-600" />
                  {t.sliderMovementLabel}
                </span>
                <span className="text-base font-extrabold text-emerald-600">
                  +{profile.movementAddKcal} kcal
                </span>
              </div>

              <input
                type="range"
                min={50}
                max={850}
                step={10}
                value={profile.movementAddKcal}
                onChange={(e) => handleMovementSliderChange(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2.5 rounded-lg"
              />

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>
                  ≈ +{(movementEquivalentMeters / 1000).toFixed(1)} km (
                  {movementEquivalentMeters.toLocaleString()} m){' '}
                  {lang === 'mn' ? 'алхалт эсвэл дасгал' : 'walk or workout'}
                </span>
                <span className="text-emerald-700 font-bold">
                  {Math.round(
                    (profile.movementAddKcal /
                      Math.max(1, plan.totalDailyNetDeficitKcal)) *
                      100
                  )}
                  % {lang === 'mn' ? 'хөдөлгөөнөөр' : 'from movement'}
                </span>
              </div>
            </div>

            {/* SLIDER 2: FOOD CALORIE CUT (LINKED!) */}
            <div className="rounded-2xl bg-white border border-amber-300 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  {t.sliderDietLabel}
                </span>
                <span className="text-base font-extrabold text-amber-600">
                  -{profile.dietCutKcal} kcal
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(300, plan.baselineTdeeKcal - plan.safeMinFoodKcal)}
                step={10}
                value={profile.dietCutKcal}
                onChange={(e) => handleDietSliderChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2.5 rounded-lg"
              />

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>
                  {lang === 'mn' ? 'Өдөрт идэх хэмжээ:' : 'You get to eat:'}{' '}
                  <strong className="text-slate-900">
                    {plan.recommendedDailyFoodKcal.toLocaleString()} kcal
                  </strong>
                </span>
                <span className="text-amber-700 font-bold">
                  {Math.round(
                    (profile.dietCutKcal /
                      Math.max(1, plan.totalDailyNetDeficitKcal)) *
                      100
                  )}
                  % {lang === 'mn' ? 'хоолноос' : 'from food cut'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4: SAMPLE BREAKFAST, LUNCH, DINNER WITH DYNAMIC METRIC GRAM PORTIONS */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Utensils className="w-5 h-5 text-amber-500" />
              {t.step4Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.step4Subtitle}</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-800">
            {lang === 'mn' ? 'Өдрийн нийт хоол:' : 'Daily Food Target:'}{' '}
            {plan.recommendedDailyFoodKcal.toLocaleString()} kcal (100% Metric: g, ml)
          </div>
        </div>

        {/* 3 Columns: Breakfast, Lunch, Dinner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['breakfast', 'lunch', 'dinner'] as MealCategory[]).map((cat) => {
            const optionsForCat = SAMPLE_MEALS.filter((m) => m.category === cat);
            const activeIdx = selectedMealIdx[cat] % optionsForCat.length;
            const currentMeal = optionsForCat[activeIdx];
            const scaled = scaleMealToDailyKcal(
              currentMeal,
              plan.recommendedDailyFoodKcal
            );

            const catTitle =
              cat === 'breakfast'
                ? t.breakfastTab
                : cat === 'lunch'
                ? t.lunchTab
                : t.dinnerTab;

            return (
              <div
                key={cat}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Category Header + Option Switcher */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-600">
                        {catTitle}
                      </span>
                      <div className="text-lg font-extrabold text-slate-900">
                        {scaled.targetMealKcal} kcal
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {optionsForCat.map((opt, idx) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setSelectedMealIdx((prev) => ({ ...prev, [cat]: idx }))
                          }
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            idx === activeIdx
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sample Meal Picture */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={currentMeal.imageUrl}
                      alt={lang === 'mn' ? currentMeal.titleMn : currentMeal.titleEn}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-emerald-700 border border-emerald-200 shadow-xs">
                      {lang === 'mn' ? currentMeal.tagMn : currentMeal.tagEn}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/95 text-amber-700 border border-amber-200 shadow-xs">
                      P: {scaled.totalProteinG}g • C: {scaled.totalCarbsG}g • F:{' '}
                      {scaled.totalFatG}g
                    </div>
                  </div>

                  {/* Meal Title & Metric Gram Breakdown Under the Picture */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {lang === 'mn' ? currentMeal.titleMn : currentMeal.titleEn}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {lang === 'mn' ? currentMeal.subtitleMn : currentMeal.subtitleEn}
                      </p>
                    </div>

                    {/* Exact Gram Details Under Pic */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>
                          {lang === 'mn'
                            ? 'Орц ба хэмжээ (Грамм / мл)'
                            : 'Ingredients (Metric g / ml)'}
                        </span>
                        <span>kcal</span>
                      </div>
                      {scaled.scaledIngredients.map((ing, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-200/70 last:border-none"
                        >
                          <div className="text-slate-700 pr-2">
                            <span className="font-extrabold text-emerald-600">
                              {ing.grams}
                              {ing.unit}
                            </span>{' '}
                            {lang === 'mn' ? ing.nameMn : ing.nameEn}
                          </div>
                          <span className="text-slate-500 font-semibold shrink-0">
                            {ing.kcal} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
