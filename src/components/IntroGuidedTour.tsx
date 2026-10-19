'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  CaloriePlanSummary,
  DeficitTier,
  CommuteMethod,
  ExerciseIntensity,
  calculateAsianBmi,
  syncProfileSlidersWithGoal,
} from '@/lib/calorieEngine';
import { Language } from '@/lib/i18n';
import {
  Footprints,
  Bus,
  Bike,
  Car,
  Home,
  Dumbbell,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Sparkles,
  Check,
  Calendar,
  Scale,
  Flame,
} from 'lucide-react';

interface IntroGuidedTourProps {
  profile: UserProfile;
  plan: CaloriePlanSummary;
  lang: Language;
  initialStep?: number;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  onFinishIntro: () => void;
}

export default function IntroGuidedTour({
  profile,
  plan,
  lang,
  initialStep = 0,
  onUpdateProfile,
  onFinishIntro,
}: IntroGuidedTourProps) {
  const [activeStep, setActiveStep] = useState(initialStep);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bmiInfo = calculateAsianBmi(profile.heightCm, profile.weightKg);

  const totalSteps = 6;

  useEffect(() => {
    setActiveStep(initialStep);
    const timer = setTimeout(() => {
      const targetEl = cardRefs.current[initialStep];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [initialStep]);

  const scrollToStep = (stepIndex: number) => {
    const clamped = Math.max(0, Math.min(totalSteps - 1, stepIndex));
    setActiveStep(clamped);
    const targetEl = cardRefs.current[clamped];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-amber-50/50 text-slate-900">
      {/* FIXED MINIMAL GUIDED TOUR TOP BAR (NO SUBMENUS SHOWN) */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-slate-200 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
              ☀️
            </div>
            <div>
              <span className="font-black text-sm text-slate-900">Зун яг ална</span>
              <span className="ml-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {lang === 'mn'
                  ? `Алхам ${activeStep + 1} / ${totalSteps}`
                  : `Step ${activeStep + 1} of ${totalSteps}`}
              </span>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeStep
                    ? 'w-7 bg-emerald-500'
                    : idx < activeStep
                    ? 'w-2 bg-emerald-300'
                    : 'w-2 bg-slate-200'
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onFinishIntro}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold text-emerald-800 cursor-pointer transition-colors"
          >
            {lang === 'mn' ? 'Ерөнхий →' : 'Overview →'}
          </button>
        </div>
      </div>

      {/* VERTICAL ROLLING CAROUSEL STREAM */}
      <div className="max-w-xl mx-auto px-4 py-10 space-y-12 pb-32">
        {/* ==================== CARD 1: WELCOME, NAME, GENDER & AGE ==================== */}
        <div
          ref={(el) => {
            cardRefs.current[0] = el;
          }}
          onClick={() => setActiveStep(0)}
          className={`rounded-3xl bg-white border-2 p-6 sm:p-8 transition-all duration-500 ${
            activeStep === 0
              ? 'border-emerald-500 shadow-xl scale-100 opacity-100'
              : 'border-slate-200 shadow-sm scale-[0.97] opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              1 / 6 • {lang === 'mn' ? 'Танилцуулга' : 'Welcome'}
            </span>
            {activeStep > 0 && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {lang === 'mn'
              ? 'Сайн байна уу! Таны хүйс болон нас хэд вэ?'
              : 'Welcome! What is your gender and age?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            {lang === 'mn'
              ? 'Жижиг үйлдэл хуримтлагдсаар зуны өмнө том өөрчлөлт авчирна. Эхлээд суурь бодисын солилцоо (BMR)-г тооцоолъё.'
              : 'Small daily actions compound into big changes by summer. Let’s start with your baseline metabolism.'}
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                {lang === 'mn' ? 'Таны нэр' : 'Your Name'}
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  onUpdateProfile((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                placeholder="Тэмүүлэн"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                {lang === 'mn' ? 'Хүйс сонгох' : 'Select Gender'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['male', 'female'] as const).map((g) => {
                  const active = profile.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onUpdateProfile((p) => ({ ...p, gender: g }))}
                      className={`py-4 px-4 rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 border-2 cursor-pointer ${
                        active
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{g === 'male' ? '👨' : '👩'}</span>
                      <span>
                        {g === 'male'
                          ? lang === 'mn'
                            ? 'Эрэгтэй'
                            : 'Male'
                          : lang === 'mn'
                          ? 'Эмэгтэй'
                          : 'Female'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">
                  {lang === 'mn' ? 'Нас' : 'Age'}
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {profile.age} {lang === 'mn' ? 'нас' : 'yrs'}
                </span>
              </div>
              <input
                type="range"
                min={16}
                max={75}
                value={profile.age}
                onChange={(e) =>
                  onUpdateProfile((p) => ({ ...p, age: Number(e.target.value) }))
                }
                className="w-full accent-emerald-600 cursor-pointer h-2.5"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>16</span>
                <span>30</span>
                <span>50</span>
                <span>75</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToStep(1);
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span>{lang === 'mn' ? 'Дараагийн карт руу' : 'Next Card'}</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ==================== CARD 2: HEIGHT (CM) & CURRENT WEIGHT (KG) ==================== */}
        <div
          ref={(el) => {
            cardRefs.current[1] = el;
          }}
          onClick={() => setActiveStep(1)}
          className={`rounded-3xl bg-white border-2 p-6 sm:p-8 transition-all duration-500 ${
            activeStep === 1
              ? 'border-emerald-500 shadow-xl scale-100 opacity-100'
              : 'border-slate-200 shadow-sm scale-[0.97] opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              2 / 6 • {lang === 'mn' ? 'Биеийн хэмжээс' : 'Body Measurements'}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${bmiInfo.colorClass}`}>
              BMI {bmiInfo.bmi}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {lang === 'mn'
              ? 'Таны өндөр болон одоогийн жин хэд вэ?'
              : 'What is your height and current weight?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            {lang === 'mn'
              ? `Ази хүний хэвийн жингийн хязгаар таны өндөрт: ${bmiInfo.healthyMinKg}–${bmiInfo.healthyMaxKg} кг байна.`
              : `Healthy Asian WPRO weight range for your height: ${bmiInfo.healthyMinKg}–${bmiInfo.healthyMaxKg} kg.`}
          </p>

          <div className="space-y-5">
            {/* Height */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">
                  {lang === 'mn' ? 'Өндөр (см)' : 'Height (cm)'}
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {profile.heightCm} cm
                </span>
              </div>
              <input
                type="range"
                min={145}
                max={205}
                value={profile.heightCm}
                onChange={(e) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    heightCm: Number(e.target.value),
                  }))
                }
                className="w-full accent-emerald-600 cursor-pointer h-2.5"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>145 cm</span>
                <span>175 cm</span>
                <span>205 cm</span>
              </div>
            </div>

            {/* Current Weight */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">
                  {lang === 'mn' ? 'Одоогийн жин (кг)' : 'Current Weight (kg)'}
                </span>
                <span className="text-2xl font-black text-emerald-600">
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
                className="w-full accent-emerald-600 cursor-pointer h-2.5"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>42 kg</span>
                <span>85 kg</span>
                <span>150 kg</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(0);
                }}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(2);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>{lang === 'mn' ? 'Дараагийн карт руу' : 'Next Card'}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== CARD 3: TARGET WEIGHT & SUMMER DATE (JUNE 15) ==================== */}
        <div
          ref={(el) => {
            cardRefs.current[2] = el;
          }}
          onClick={() => setActiveStep(2)}
          className={`rounded-3xl bg-white border-2 p-6 sm:p-8 transition-all duration-500 ${
            activeStep === 2
              ? 'border-emerald-500 shadow-xl scale-100 opacity-100'
              : 'border-slate-200 shadow-sm scale-[0.97] opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
              3 / 6 • {lang === 'mn' ? 'Зуны зорилт (Зун яг ална)' : 'Summer Goal'}
            </span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              -{plan.kgToLose} kg ({plan.daysUntilSummerTarget}{' '}
              {lang === 'mn' ? 'хоног' : 'days'})
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {lang === 'mn'
              ? 'Зун эхлэхэд (6 сарын 15) хэдэн кг болох зорилготой вэ?'
              : 'What is your target weight by the start of summer (June 15)?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            {lang === 'mn'
              ? 'Гулсуурыг хөдөлгөхөд таны өдөрт шатаах болон хасах шаардлагатай илчлэг автоматаар тооцоологдоно.'
              : 'Slide your target weight below—your required daily calorie deficit updates live.'}
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  {lang === 'mn' ? 'Зорилтот жин (кг)' : 'Target Weight (kg)'}
                </span>
                <span className="text-3xl font-black text-emerald-700">
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
                className="w-full accent-emerald-600 cursor-pointer h-2.5"
              />
              <div className="flex justify-between text-xs text-emerald-800 font-bold mt-2">
                <span>
                  {lang === 'mn' ? 'Нийт хасах:' : 'Total loss:'} -{plan.kgToLose} kg
                </span>
                <span>
                  {lang === 'mn' ? 'Шаардлагатай алдагдал:' : 'Required deficit:'} -
                  {plan.requiredDailyDeficitForTargetDate} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-amber-600" />
                {lang === 'mn'
                  ? 'Зорилтот огноо (Үндсэн: 6 сарын 15 — өөрчилж болно)'
                  : 'Target Summer Date (Default: June 15th — editable)'}
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
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900"
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
                  className="shrink-0 px-4 py-3 rounded-2xl text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer"
                >
                  06-15
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(1);
                }}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(3);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>{lang === 'mn' ? 'Дараагийн карт руу' : 'Next Card'}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== CARD 4: WORK-HOME TRAVEL (COMMUTE) ==================== */}
        <div
          ref={(el) => {
            cardRefs.current[3] = el;
          }}
          onClick={() => setActiveStep(3)}
          className={`rounded-3xl bg-white border-2 p-6 sm:p-8 transition-all duration-500 ${
            activeStep === 3
              ? 'border-emerald-500 shadow-xl scale-100 opacity-100'
              : 'border-slate-200 shadow-sm scale-[0.97] opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              4 / 6 • {lang === 'mn' ? 'Ажил – Гэр зорчилт' : 'Daily Commute'}
            </span>
            <span className="text-xs font-bold text-emerald-700">
              +{plan.commuteKcal} kcal ({plan.commuteActiveMeters} m/өдөр)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {lang === 'mn'
              ? 'Та гэр болон ажил/сургууль хооронд яаж зорчдог вэ?'
              : 'How do you travel between home and work/school?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            {lang === 'mn'
              ? 'Өдөр тутмын алхалт болон зорчилт нь таны суурь илчлэг шаталтын чухал хэсэг юм.'
              : 'Your daily commute is a powerful, automatic source of calorie burn.'}
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {commuteOptions.map((opt) => {
                const active = profile.commuteMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateProfile((p) => ({ ...p, commuteMethod: opt.id }))
                    }
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
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

            {profile.commuteMethod !== 'wfh' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-600">
                  {lang === 'mn' ? 'Нэг талдаа зай (км)' : 'One-way distance (km)'}
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
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(2);
                }}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(4);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>{lang === 'mn' ? 'Дараагийн карт руу' : 'Next Card'}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== CARD 5: WEEKLY EXERCISE ==================== */}
        <div
          ref={(el) => {
            cardRefs.current[4] = el;
          }}
          onClick={() => setActiveStep(4)}
          className={`rounded-3xl bg-white border-2 p-6 sm:p-8 transition-all duration-500 ${
            activeStep === 4
              ? 'border-emerald-500 shadow-xl scale-100 opacity-100'
              : 'border-slate-200 shadow-sm scale-[0.97] opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              5 / 6 • {lang === 'mn' ? 'Дасгал хөдөлгөөн' : 'Weekly Exercise'}
            </span>
            <span className="text-xs font-bold text-emerald-700">
              +{plan.dailyAvgExerciseKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {lang === 'mn'
              ? 'Долоо хоногт хэдэн удаа дасгал хийдэг вэ?'
              : 'How often do you exercise each week?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            {lang === 'mn'
              ? 'Дасгалын давтамж болон эрчмийг сонгоно уу.'
              : 'Tap your weekly workout frequency and intensity.'}
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                <Dumbbell className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600" />
                {lang === 'mn' ? 'Давтамж (7 хоногт)' : 'Frequency'}
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
                      className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {lang === 'mn' ? item.labelMn : item.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">
                {lang === 'mn' ? 'Дасгалын эрчим' : 'Intensity'}
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
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">
                        {lang === 'mn' ? item.labelMn : item.labelEn}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {lang === 'mn' ? item.descMn : item.descEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(3);
                }}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToStep(5);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>{lang === 'mn' ? 'Дараагийн карт руу' : 'Next Card'}</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== CARD 6: 3 DEFICIT OPTIONS & FINISH INTRO ==================== */}
        <div
          ref={(el) => {
            cardRefs.current[5] = el;
          }}
          onClick={() => setActiveStep(5)}
          className={`rounded-3xl bg-white border-2 p-6 sm:p-8 transition-all duration-500 ${
            activeStep === 5
              ? 'border-emerald-500 shadow-xl scale-100 opacity-100'
              : 'border-slate-200 shadow-sm scale-[0.97] opacity-60 hover:opacity-90'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
              6 / 6 • {lang === 'mn' ? 'Хурдаа сонгох' : 'Choose Your Pace'}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {plan.baselineTdeeKcal} kcal {lang === 'mn' ? 'суурь шаталт' : 'baseline'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            {lang === 'mn'
              ? 'Илчлэгийн алдагдлын 3 хувилбараас сонгоно уу'
              : 'Select one of the 3 Calorie Deficit Options'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            {lang === 'mn'
              ? 'Азийн эрүүл мэндийн судалгаа болон эмч нарын зөвлөмжид суурилсан 3 хурд:'
              : 'Based on Asian clinical studies and doctor recommendations:'}
          </p>

          <div className="space-y-3 mb-6">
            {(['light', 'medium', 'heavy'] as DeficitTier[]).map((tier) => {
              const info = plan.dynamicTiers[tier];
              const proj = plan.tierProjections[tier];
              const active = profile.deficitTier === tier;

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() =>
                    onUpdateProfile((prev) =>
                      syncProfileSlidersWithGoal({
                        ...prev,
                        deficitTier: tier,
                      })
                    )
                  }
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                    active
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">
                        {lang === 'mn' ? info.labelMn : info.labelEn}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        -{info.totalDeficitKcal} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {lang === 'mn' ? info.descMn : info.descEn}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-emerald-700">
                      {proj.projectedWeightBySummerKg} kg
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {profile.targetDate} {lang === 'mn' ? 'гэхэд' : 'projected'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToStep(4);
              }}
              className="px-4 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFinishIntro();
              }}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:brightness-105 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {lang === 'mn'
                  ? 'Төлөвлөгөө болон Хоолны жишээ харах →'
                  : 'View My Overview & Meal Plan →'}
              </span>
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
