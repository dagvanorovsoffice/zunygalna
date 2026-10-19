'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  CaloriePlanSummary,
  DeficitTier,
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
  Dumbbell,
  Calendar,
  Sliders,
  Utensils,
  Sparkles,
  ArrowRight,
  Info,
  Scale,
  TrendingDown,
  Pencil,
  User,
  Target,
  RotateCcw,
  Users,
} from 'lucide-react';

interface OverviewPageProps {
  profile: UserProfile;
  plan: CaloriePlanSummary;
  lang: Language;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onEditStep: (stepIndex: number) => void;
  onGoToTeamTab: () => void;
}

export default function OverviewPage({
  profile,
  plan,
  lang,
  onUpdateProfile,
  onEditStep,
  onGoToTeamTab,
}: OverviewPageProps) {
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

  const movementEquivalentMeters = kcalToWalkingMeters(
    profile.movementAddKcal,
    profile.weightKg
  );

  const commuteLabelMap: Record<UserProfile['commuteMethod'], { mn: string; en: string }> = {
    walk: { mn: 'Явган алхдаг', en: 'Walking' },
    bus_walk: { mn: 'Автобус + Алхалт', en: 'Bus + Walk' },
    bike: { mn: 'Дугуй / Скүүтэр', en: 'Bike / Scooter' },
    car: { mn: 'Машинаар', en: 'Car / Drive' },
    wfh: { mn: 'Гэрээсээ ажилладаг', en: 'Work From Home' },
  };

  const intensityLabelMap: Record<UserProfile['exerciseIntensity'], { mn: string; en: string }> = {
    light: { mn: 'Хөнгөн', en: 'Light' },
    moderate: { mn: 'Дундаж', en: 'Moderate' },
    intense: { mn: 'Эрчимтэй', en: 'Intense' },
  };

  return (
    <div className="space-y-8 pb-8">
      {/* SECTION 1: CLICKABLE OVERVIEW OF USER'S GIVEN INFORMATION (EACH ITEM EDITABLE) */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'mn' ? 'Таны оруулсан мэдээлэл (Ерөнхий)' : 'Your Profile Overview'}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {lang === 'mn'
                ? 'Мэдээллээ шалгах ба засах (Аль ч картыг дарж засна уу)'
                : 'Your Given Information — Click Any Card to Edit'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onEditStep(0)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {lang === 'mn' ? 'Танилцуулга дахин үзэх' : 'Replay Guided Tour'}
            </span>
          </button>
        </div>

        {/* 6 Clickable Summary Cards corresponding to the 6 Guided Tour steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Name, Gender & Age */}
          <div
            onClick={() => onEditStep(0)}
            role="button"
            tabIndex={0}
            className="group rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'mn' ? '1. Хувийн мэдээлэл' : '1. Personal Info'}
              </div>
              <div className="text-sm font-black text-slate-900">
                {profile.name} •{' '}
                {profile.gender === 'male'
                  ? lang === 'mn'
                    ? 'Эрэгтэй'
                    : 'Male'
                  : lang === 'mn'
                  ? 'Эмэгтэй'
                  : 'Female'}
                , {profile.age} {lang === 'mn' ? 'нас' : 'yrs'}
              </div>
              <div className="text-xs text-slate-500">
                BMR: <strong className="text-slate-700">{plan.bmrKcal} kcal</strong>/
                {lang === 'mn' ? 'өдөр' : 'day'}
              </div>
            </div>
            <span className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-300 text-slate-500 group-hover:text-emerald-700 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Height, Current Weight & Asian BMI */}
          <div
            onClick={() => onEditStep(1)}
            role="button"
            tabIndex={0}
            className="group rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'mn' ? '2. Өндөр ба Одоогийн жин' : '2. Height & Weight'}
              </div>
              <div className="text-sm font-black text-slate-900">
                {profile.heightCm} cm • {profile.weightKg} kg
              </div>
              <div className="text-xs text-emerald-700 font-semibold">
                BMI {bmiInfo.bmi} ({lang === 'mn' ? 'Хэвийн: ' : 'Ideal: '}
                {bmiInfo.healthyMinKg}–{bmiInfo.healthyMaxKg} kg)
              </div>
            </div>
            <span className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-300 text-slate-500 group-hover:text-emerald-700 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Target Weight & Summer Date (with quick +/- buttons too!) */}
          <div
            onClick={() => onEditStep(2)}
            role="button"
            tabIndex={0}
            className="group rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/60 border-2 border-emerald-400 p-4 text-left transition-all cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'mn' ? '3. Зорилтот жин ба Огноо' : '3. Target Weight & Date'}
              </div>
              <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
                <span>
                  {profile.targetWeightKg} kg (-{plan.kgToLose} kg)
                </span>
                <div
                  className="inline-flex items-center gap-1 ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateProfile((p) =>
                        syncProfileSlidersWithGoal({
                          ...p,
                          targetWeightKg: Math.max(40, Number((p.targetWeightKg - 0.5).toFixed(1))),
                        })
                      )
                    }
                    className="w-6 h-6 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-black text-xs hover:bg-emerald-500 hover:text-white cursor-pointer"
                    title="-0.5 kg"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateProfile((p) =>
                        syncProfileSlidersWithGoal({
                          ...p,
                          targetWeightKg: Math.min(
                            p.weightKg - 0.5,
                            Number((p.targetWeightKg + 0.5).toFixed(1))
                          ),
                        })
                      )
                    }
                    className="w-6 h-6 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-black text-xs hover:bg-emerald-500 hover:text-white cursor-pointer"
                    title="+0.5 kg"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-xs text-emerald-800 font-semibold">
                {profile.targetDate} ({plan.daysUntilSummerTarget}{' '}
                {lang === 'mn' ? 'хоног' : 'days'})
              </div>
            </div>
            <span className="p-2 rounded-xl bg-white border border-emerald-300 text-emerald-700">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: Work-Home Commute */}
          <div
            onClick={() => onEditStep(3)}
            role="button"
            tabIndex={0}
            className="group rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'mn' ? '4. Ажил–Гэр зорчилт' : '4. Work–Home Commute'}
              </div>
              <div className="text-sm font-black text-slate-900">
                {lang === 'mn'
                  ? commuteLabelMap[profile.commuteMethod].mn
                  : commuteLabelMap[profile.commuteMethod].en}
                {profile.commuteMethod !== 'wfh' &&
                  ` • ${profile.commuteDistanceKm} km ${
                    profile.commuteRoundTrip ? '×2' : '×1'
                  }`}
              </div>
              <div className="text-xs text-emerald-700 font-semibold">
                +{plan.commuteKcal} kcal ({plan.commuteActiveMeters.toLocaleString()} m/
                {lang === 'mn' ? 'өдөр' : 'day'})
              </div>
            </div>
            <span className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-300 text-slate-500 group-hover:text-emerald-700 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 5: Weekly Exercise */}
          <div
            onClick={() => onEditStep(4)}
            role="button"
            tabIndex={0}
            className="group rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'mn' ? '5. Дасгал хөдөлгөөн' : '5. Weekly Exercise'}
              </div>
              <div className="text-sm font-black text-slate-900">
                {profile.exerciseDaysPerWeek}{' '}
                {lang === 'mn' ? 'өдөр / 7 хоногт' : 'days / week'} •{' '}
                {lang === 'mn'
                  ? intensityLabelMap[profile.exerciseIntensity].mn
                  : intensityLabelMap[profile.exerciseIntensity].en}
              </div>
              <div className="text-xs text-emerald-700 font-semibold">
                +{plan.dailyAvgExerciseKcal} kcal/{lang === 'mn' ? 'өдөр дундаж' : 'day avg'}
              </div>
            </div>
            <span className="p-2 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-300 text-slate-500 group-hover:text-emerald-700 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 6: Selected Deficit Tier */}
          <div
            onClick={() => onEditStep(5)}
            role="button"
            tabIndex={0}
            className="group rounded-2xl bg-amber-50/70 hover:bg-amber-100/60 border border-amber-300 p-4 text-left transition-all cursor-pointer flex items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                {lang === 'mn' ? '6. Сонгосон хурд' : '6. Deficit Speed Tier'}
              </div>
              <div className="text-sm font-black text-slate-900">
                {lang === 'mn'
                  ? plan.dynamicTiers[profile.deficitTier].labelMn
                  : plan.dynamicTiers[profile.deficitTier].labelEn}
              </div>
              <div className="text-xs text-amber-800 font-bold">
                -{plan.totalDailyNetDeficitKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'} (~
                {plan.dynamicTiers[profile.deficitTier].weeklyLossKg} kg/7{' '}
                {lang === 'mn' ? 'хоног' : 'days'})
              </div>
            </div>
            <span className="p-2 rounded-xl bg-white border border-amber-300 text-amber-700">
              <Pencil className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE SUMMARY BANNER & 4 PILLS (INCLUDING SS1) */}
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

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              {t.introHeroTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t.introHeroSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToTeamTab}
            className="shrink-0 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Users className="w-4 h-4" />
            <span>
              {lang === 'mn'
                ? 'Баг уралдаан руу орох →'
                : 'Open Team Linear Journey →'}
            </span>
          </button>
        </div>

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
          <div
            onClick={() => onEditStep(2)}
            className="rounded-2xl bg-white border-2 border-emerald-500 p-3.5 shadow-xs cursor-pointer hover:bg-emerald-50/40 transition-colors"
            title={lang === 'mn' ? 'Дарж зорилтот жингээ засах' : 'Click to edit target weight'}
          >
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

      {/* SECTION 3: 3 DEFICIT OPTIONS (LIGHT, MEDIUM, HEAVY) + 2 LINKED HORIZONTAL SLIDERS */}
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

      {/* SECTION 4: SAMPLE BREAKFAST, LUNCH, DINNER WITH DYNAMIC METRIC GRAM PORTIONS */}
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

        {/* Bottom CTA to Team Linear Journey */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-600">
            {lang === 'mn'
              ? 'Найз нөхөд, гэр бүлтэйгээ өнөөдрийн шатаасан илчлэг болон алхсан замаараа уралдах уу?'
              : 'Ready to race your friends & family on today’s right-facing linear calorie & distance track?'}
          </div>
          <button
            type="button"
            onClick={onGoToTeamTab}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <span>
              {lang === 'mn'
                ? 'Баг (Шугаман уралдаан) руу орох'
                : 'Go to Team Linear Race'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
