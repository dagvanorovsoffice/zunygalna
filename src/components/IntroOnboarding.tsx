'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  CaloriePlanSummary,
  DeficitTier,
  CommuteMethod,
  ExerciseIntensity,
  DEFICIT_TIERS,
  calculateAsianBmi,
  kcalToWalkingMeters,
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
} from 'lucide-react';

interface IntroOnboardingProps {
  profile: UserProfile;
  plan: CaloriePlanSummary;
  lang: Language;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onGoToHomeJourney: () => void;
}

export default function IntroOnboarding({
  profile,
  plan,
  lang,
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

  // Select one of the 3 deficit tiers (Light, Medium, Heavy) and set the linked sliders
  const handleSelectTier = (tier: DeficitTier) => {
    const tierInfo = DEFICIT_TIERS[tier];
    const totalDeficit = tierInfo.totalDeficitKcal;
    const movementKcal = Math.round(totalDeficit * tierInfo.defaultMovementSplitPct);
    const dietKcal = totalDeficit - movementKcal;

    onUpdateProfile((prev) => ({
      ...prev,
      deficitTier: tier,
      movementAddKcal: movementKcal,
      dietCutKcal: dietKcal,
    }));
  };

  // Linked Slider 1: Movement Burn (Prioritized first!)
  // When user moves Movement Burn, Diet Cut automatically adjusts so Movement + Diet = Tier Total Deficit
  // (or if Movement exceeds Tier Total, Diet Cut becomes 0 and total deficit increases!)
  const handleMovementSliderChange = (newMovementKcal: number) => {
    const tierTotal = DEFICIT_TIERS[profile.deficitTier].totalDeficitKcal;
    const linkedDietCut = Math.max(0, tierTotal - newMovementKcal);
    onUpdateProfile((prev) => ({
      ...prev,
      movementAddKcal: newMovementKcal,
      dietCutKcal: linkedDietCut,
    }));
  };

  // Linked Slider 2: Food Calorie Cut
  // When user moves Diet Cut, Movement Burn automatically adjusts so Movement + Diet = Tier Total Deficit
  const handleDietSliderChange = (newDietCutKcal: number) => {
    const tierTotal = DEFICIT_TIERS[profile.deficitTier].totalDeficitKcal;
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
    <div className="space-y-8 pb-12">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-amber-950/60 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'mn'
              ? 'Ази хүний биеийн онцлогт тохируулсан тооцоолол'
              : 'Calibrated with Asian Clinical & Metabolic Studies'}
          </span>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Calendar className="w-3.5 h-3.5" />
            {t.summerCountdownPrefix}
            {profile.targetDate}
            {t.summerCountdownSuffix}: {plan.daysUntilSummerTarget} {t.daysLeft}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {t.introHeroTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          {t.introHeroSubtitle}
        </p>

        {/* LIVE SUMMARY PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5">
            <div className="text-xs text-slate-400">
              {lang === 'mn' ? 'Одоогийн өдрийн шаталт' : 'Baseline Daily Burn'}
            </div>
            <div className="text-xl font-bold text-white mt-0.5">
              {plan.baselineTdeeKcal.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              BMR {plan.bmrKcal} + {lang === 'mn' ? 'Зорчилт/Дасгал' : 'Commute/Workout'}{' '}
              {plan.commuteKcal + plan.dailyAvgExerciseKcal} kcal
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-950/50 border border-emerald-500/30 p-3.5">
            <div className="text-xs text-emerald-300">
              {lang === 'mn' ? 'Шинэ нийт өдрийн шаталт' : 'Target Total Daily Burn'}
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {plan.projectedTotalBurnKcal.toLocaleString()} <span className="text-xs font-normal text-emerald-300">kcal</span>
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-1">
              +{(plan.totalDailyTargetDistanceMeters / 1000).toFixed(1)} km ({plan.totalDailyTargetDistanceMeters.toLocaleString()} m){' '}
              {lang === 'mn' ? 'идэвхтэй зам' : 'active/day'}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-3.5">
            <div className="text-xs text-amber-300">
              {lang === 'mn' ? 'Өдөрт идэх хоолны илчлэг' : 'Daily Food Intake Target'}
            </div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {plan.recommendedDailyFoodKcal.toLocaleString()} <span className="text-xs font-normal text-amber-300">kcal</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">
              {lang === 'mn'
                ? `Аюулгүй доод хязгаар: ${plan.safeMinFoodKcal} ккал`
                : `Safe clinical floor: ${plan.safeMinFoodKcal} kcal`}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5">
            <div className="text-xs text-slate-400">
              {lang === 'mn' ? `${profile.targetDate} гэхэд жин` : `Weight by ${profile.targetDate}`}
            </div>
            <div className="text-xl font-bold text-white mt-0.5">
              {plan.projectedWeightOnTargetDateKg} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              {lang === 'mn'
                ? `Зорилт: ${profile.targetWeightKg} кг (${plan.estimatedCompletionDate})`
                : `Target: ${profile.targetWeightKg} kg (Est. ${plan.estimatedCompletionDate})`}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: VISUAL BODY METRICS & TARGET WEIGHT SELECTORS */}
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-400" />
            {t.step1Title}
          </h2>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 ${bmiInfo.colorClass}`}>
            BMI {bmiInfo.bmi} • {lang === 'mn' ? bmiInfo.labelMn : bmiInfo.labelEn}
          </span>
        </div>

        {/* Gender + Target Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
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
                    className={`py-3 px-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
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
            <label className="block text-xs font-medium text-slate-400 mb-2">
              {t.targetDateLabel} (Зун яг ална — 6 сарын 15)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={profile.targetDate}
                onChange={(e) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    targetDate: e.target.value || p.targetDate,
                  }))
                }
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() =>
                  onUpdateProfile((p) => ({
                    ...p,
                    targetDate: '2027-06-15',
                  }))
                }
                className="shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
              >
                06-15
              </button>
            </div>
          </div>
        </div>

        {/* Scrubbable Sliders for Age, Height (cm), Current Weight (kg), Target Weight (kg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AGE */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{t.ageLabel}</span>
              <span className="text-lg font-extrabold text-white">{profile.age}</span>
            </div>
            <input
              type="range"
              min={16}
              max={75}
              value={profile.age}
              onChange={(e) =>
                onUpdateProfile((p) => ({ ...p, age: Number(e.target.value) }))
              }
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>16</span>
              <span>30</span>
              <span>50</span>
              <span>75</span>
            </div>
          </div>

          {/* HEIGHT (CM) */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{t.heightLabel}</span>
              <span className="text-lg font-extrabold text-white">{profile.heightCm} cm</span>
            </div>
            <input
              type="range"
              min={145}
              max={205}
              value={profile.heightCm}
              onChange={(e) =>
                onUpdateProfile((p) => ({ ...p, heightCm: Number(e.target.value) }))
              }
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>145 cm</span>
              <span>170 cm</span>
              <span>205 cm</span>
            </div>
          </div>

          {/* CURRENT WEIGHT (KG) */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{t.currentWeightLabel}</span>
              <span className="text-lg font-extrabold text-white">{profile.weightKg} kg</span>
            </div>
            <input
              type="range"
              min={42}
              max={150}
              step={0.5}
              value={profile.weightKg}
              onChange={(e) => {
                const newW = Number(e.target.value);
                onUpdateProfile((p) => ({
                  ...p,
                  weightKg: newW,
                  targetWeightKg: Math.min(p.targetWeightKg, newW - 1),
                }));
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>42 kg</span>
              <span>85 kg</span>
              <span>150 kg</span>
            </div>
          </div>

          {/* TARGET WEIGHT (KG) */}
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-300">{t.targetWeightLabel}</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {profile.targetWeightKg} kg
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={Math.max(41, profile.weightKg - 0.5)}
              step={0.5}
              value={profile.targetWeightKg}
              onChange={(e) =>
                onUpdateProfile((p) => ({
                  ...p,
                  targetWeightKg: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-emerald-300/70 mt-1">
              <span>
                {lang === 'mn' ? 'Ази хэвийн жин:' : 'Asian ideal:'} {bmiInfo.healthyMinKg}–
                {bmiInfo.healthyMaxKg} kg
              </span>
              <span>-{plan.kgToLose} kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: WORK-HOME TRAVEL (COMMUTE) & EXERCISE SELECTION TOOLS */}
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Footprints className="w-5 h-5 text-emerald-400" />
            {t.step2Title}
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {lang === 'mn'
              ? `Зорчилт: +${plan.commuteKcal} ккал (${plan.commuteActiveMeters} м/өдөр) • Дасгал: +${plan.dailyAvgExerciseKcal} ккал/өдөр`
              : `Commute: +${plan.commuteKcal} kcal (${plan.commuteActiveMeters} m/day) • Workout avg: +${plan.dailyAvgExerciseKcal} kcal/day`}
          </span>
        </div>

        {/* Commute Method Tap Cards */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2.5">
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
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {opt.icon}
                    {active && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">
                    {lang === 'mn' ? opt.labelMn : opt.labelEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Commute Distance Chips (Metric km) */}
        {profile.commuteMethod !== 'wfh' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-2">
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
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        active
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {km} km ({km * 1000} m)
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl">
              <input
                type="checkbox"
                checked={profile.commuteRoundTrip}
                onChange={(e) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    commuteRoundTrip: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-emerald-400 rounded"
              />
              <span className="text-xs font-semibold text-slate-200">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              <Dumbbell className="w-3.5 h-3.5 inline mr-1.5 text-emerald-400" />
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
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {lang === 'mn' ? item.labelMn : item.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
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
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">
                      {lang === 'mn' ? item.labelMn : item.labelEn}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
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
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            {t.twoSidesBadge}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white">{t.step3Title}</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.twoSidesDesc}</p>
        </div>

        {/* 3 Deficit Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['light', 'medium', 'heavy'] as DeficitTier[]).map((tier) => {
            const info = DEFICIT_TIERS[tier];
            const proj = plan.tierProjections[tier];
            const active = profile.deficitTier === tier;

            return (
              <button
                key={tier}
                type="button"
                onClick={() => handleSelectTier(tier)}
                className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  active
                    ? 'bg-gradient-to-b from-emerald-950/80 to-slate-950 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-extrabold text-white">
                      {lang === 'mn' ? info.labelMn : info.labelEn}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        active
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      -{info.totalDeficitKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {lang === 'mn' ? info.descMn : info.descEn}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{lang === 'mn' ? '7 хоногт:' : 'Weekly pace:'}</span>
                    <span className="font-bold text-emerald-400">~{info.weeklyLossKg} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>
                      {lang === 'mn'
                        ? `${profile.targetDate} гэхэд:`
                        : `By ${profile.targetDate}:`}
                    </span>
                    <span className="font-bold text-white">
                      {proj.projectedWeightBySummerKg} kg
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>
                      {lang === 'mn'
                        ? `${profile.targetWeightKg} кг-д хүрэх:`
                        : `Reaches ${profile.targetWeightKg} kg:`}
                    </span>
                    <span className="font-semibold text-amber-300">
                      {proj.estimatedGoalDate}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Asian Clinical Research Note for Selected Tier */}
        <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            {lang === 'mn'
              ? DEFICIT_TIERS[profile.deficitTier].studyNoteMn
              : DEFICIT_TIERS[profile.deficitTier].studyNoteEn}
          </p>
        </div>

        {/* THE TWO LINKED HORIZONTAL SLIDERS */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-amber-950/50 border border-emerald-500/40 p-5 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-bold text-white">
              {lang === 'mn'
                ? 'Өдрийн цэвэр алдагдлыг Хөдөлгөөн ба Хоолонд хуваарилах (Хоорондоо уялдаатай 2 гулсуур)'
                : 'Balance Your Daily Deficit: Movement Burn 1st ↔ Food Calorie Cut 2nd'}
            </div>
            <div className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {lang === 'mn' ? 'Нийт цэвэр алдагдал:' : 'Total Net Deficit:'} -
              {plan.totalDailyNetDeficitKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SLIDER 1: MOVEMENT BURN (FIRST!) */}
            <div className="rounded-2xl bg-slate-950/85 border border-emerald-500/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  {t.sliderMovementLabel}
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  +{profile.movementAddKcal} kcal
                </span>
              </div>

              <input
                type="range"
                min={50}
                max={750}
                step={10}
                value={profile.movementAddKcal}
                onChange={(e) => handleMovementSliderChange(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-2.5 rounded-lg"
              />

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <span>
                  ≈ +{(movementEquivalentMeters / 1000).toFixed(1)} km (
                  {movementEquivalentMeters.toLocaleString()} m){' '}
                  {lang === 'mn' ? 'алхалт эсвэл дасгал' : 'walk or workout'}
                </span>
                <span className="text-emerald-400 font-semibold">
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
            <div className="rounded-2xl bg-slate-950/85 border border-amber-500/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  {t.sliderDietLabel}
                </span>
                <span className="text-base font-extrabold text-amber-400">
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
                className="w-full accent-amber-400 cursor-pointer h-2.5 rounded-lg"
              />

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <span>
                  {lang === 'mn' ? 'Өдөрт идэх хэмжээ:' : 'You get to eat:'}{' '}
                  <strong className="text-white">
                    {plan.recommendedDailyFoodKcal.toLocaleString()} kcal
                  </strong>
                </span>
                <span className="text-amber-300 font-semibold">
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
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
              <Utensils className="w-5 h-5 text-amber-400" />
              {t.step4Title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.step4Subtitle}</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300">
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
                className="rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Category Header + Option Switcher */}
                  <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">
                        {catTitle}
                      </span>
                      <div className="text-lg font-extrabold text-white">
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
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            idx === activeIdx
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sample Meal Picture */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={currentMeal.imageUrl}
                      alt={lang === 'mn' ? currentMeal.titleMn : currentMeal.titleEn}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/85 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                      {lang === 'mn' ? currentMeal.tagMn : currentMeal.tagEn}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/85 text-amber-300">
                      P: {scaled.totalProteinG}g • C: {scaled.totalCarbsG}g • F:{' '}
                      {scaled.totalFatG}g
                    </div>
                  </div>

                  {/* Meal Title & Metric Gram Breakdown Under the Picture */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {lang === 'mn' ? currentMeal.titleMn : currentMeal.titleEn}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {lang === 'mn' ? currentMeal.subtitleMn : currentMeal.subtitleEn}
                      </p>
                    </div>

                    {/* Exact Gram Details Under Pic */}
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-3 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
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
                          className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none"
                        >
                          <div className="text-slate-200 pr-2">
                            <span className="font-extrabold text-emerald-400">
                              {ing.grams}
                              {ing.unit}
                            </span>{' '}
                            {lang === 'mn' ? ing.nameMn : ing.nameEn}
                          </div>
                          <span className="text-slate-400 font-semibold shrink-0">
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

        {/* CTA TO LAUNCH DAILY LINEAR JOURNEY */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onGoToHomeJourney}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-xl shadow-emerald-950/50 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.startJourneyCta}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
