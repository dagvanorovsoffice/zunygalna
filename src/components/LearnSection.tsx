'use client';

import React, { useState } from 'react';
import { UserProfile, kcalToWalkingMeters } from '@/lib/calorieEngine';
import { Language } from '@/lib/i18n';
import {
  BookOpen,
  AlertTriangle,
  Dumbbell,
  Flame,
  Footprints,
  TrendingUp,
  Share2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface LearnSectionProps {
  profile: UserProfile;
  lang: Language;
}

export default function LearnSection({ profile, lang }: LearnSectionProps) {
  const [selectedSugarIdx, setSelectedSugarIdx] = useState(0);
  const [addedMuscleKg, setAddedMuscleKg] = useState(2.5);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const sugarComparisons = [
    {
      nameMn: '500 мл хийжүүлсэн чихэртэй ундаа + 1 жижиг шоколад',
      nameEn: '500 ml Sugary Soda + 1 Chocolate Bar',
      kcal: 460,
      sugarGrams: 78,
      satietyHours: 0.5,
      realFoodEquivalentMn:
        '60г цагаан будаа + 90г өөхгүй үхрийн мах + 150г жигнэсэн брокколи/ногоо + 1 өндөг (455 ккал)',
      realFoodEquivalentEn:
        '60g white rice + 90g lean beef + 150g steamed vegetables + 1 boiled egg (455 kcal)',
      effectMn:
        'Цусан дахь сахарыг 20 минутад огцом өсгөж, инсулин ялгаруулснаар өөх хуримтлалыг идэвхжүүлж 45 минутын дараа дахин өлсгөнө.',
      effectEn:
        'Spikes blood glucose within 20 mins, triggers high insulin fat storage, and causes rebound hunger in 45 mins.',
    },
    {
      nameMn: 'Бэлэн гоймон (1 уут) + хиам (50г)',
      nameEn: 'Instant Fried Noodles (1 pack) + 50g Processed Sausage',
      kcal: 540,
      sugarGrams: 14,
      satietyHours: 1.2,
      realFoodEquivalentMn:
        '120г тахианы цээж мах + 120г гурвалжин будаа + 150г шинэ ногооны салат (520 ккал)',
      realFoodEquivalentEn:
        '120g chicken breast + 120g cooked buckwheat + 150g fresh vegetable salad (520 kcal)',
      effectMn:
        'Хэт боловсруулсан өөх тос, давс нь биед ус хадгалж хавагнуулахаас гадна булчингийн нөхөн төлжилтөд шаардлагатай уураггүй.',
      effectEn:
        'Ultra-processed trans/saturated fats and high sodium cause water retention while providing minimal muscle-repairing protein.',
    },
    {
      nameMn: 'Чихэртэй сироптой кофе (450 мл) + 1 гурилан боов',
      nameEn: 'Sweet Flavored Latte (450 ml) + 1 Pastry',
      kcal: 590,
      sugarGrams: 64,
      satietyHours: 1.0,
      realFoodEquivalentMn:
        '100г үхрийн махтай, 150г ногоотой халуун шөл + 65г хар талх + 100г аарц (560 ккал)',
      realFoodEquivalentEn:
        '100g lean beef & 150g vegetable soup + 65g whole rye bread + 100g curd (560 kcal)',
      effectMn:
        'Шингэн илчлэг тархинд цадсан дохио өгдөггүй тул өдрийн нийт илчлэгийг мэдэгдэхүйц хэтрүүлдэг.',
      effectEn:
        'Liquid sugar calories bypass natural satiety receptors, silently wiping out your entire daily calorie deficit.',
    },
  ];

  const currentSugarItem = sugarComparisons[selectedSugarIdx];
  const walkMetersToBurnSugar = kcalToWalkingMeters(
    currentSugarItem.kcal,
    profile.weightKg
  );

  // Muscle BMR & NEAT boost math:
  // 1 kg of skeletal muscle increases resting BMR by ~14 kcal/day and active daily movement expenditure by ~26 kcal/day = ~40 kcal/day total
  const dailyExtraBurnFromMuscle = Math.round(addedMuscleKg * 40);
  const yearlyExtraKcalFromMuscle = dailyExtraBurnFromMuscle * 365;
  const yearlyFatEquivalentKg = Number((yearlyExtraKcalFromMuscle / 7700).toFixed(1));

  const socialPosts = [
    {
      id: 'post-1',
      tagMn: 'Өдрийн пост #1 • Инстаграм / Фэйсбүүк',
      tagEn: 'Daily Social Post #1 • IG / FB',
      titleMn: 'Автобусны 1 буудал өмнө буух = Жилд -4.8 кг өөх!',
      titleEn: 'Getting Off 1 Bus Stop Early = -4.8 kg Fat Per Year!',
      bodyMn:
        'Өдөр бүр ажил руугаа болон гэр лүүгээ 1.2 км (1,200 м) илүү алхахад өдөрт ~100 ккал шатаана. Энэ жижигхэн зуршил 1 жилийн дотор 36,500 ккал буюу ~4.8 кг цэвэр өөх шатаадаг.',
      bodyEn:
        'Walking just 1.2 km (1,200 m) extra on your daily commute burns ~100 kcal/day. Over 365 days, that single small habit burns 36,500 kcal (~4.8 kg of pure fat).',
      ctaMn: 'Зун яг ална апп руу орж өөрийн зорчилтын илчлэгээ тооцоолоорой →',
      ctaEn: 'Tap to calculate your commute burn in Zunygalna →',
    },
    {
      id: 'post-2',
      tagMn: 'Өдрийн пост #2 • Инстаграм / Фэйсбүүк',
      tagEn: 'Daily Social Post #2 • IG / FB',
      titleMn: '60г будаа + 50г мах + 100г ногоо яагаад хамгийн зөв харьцаа вэ?',
      titleEn: 'Why 60g Rice + 50g–80g Beef + 100g+ Veggies Works Wonders',
      bodyMn:
        'Хоолоо бүрэн хорих биш, харин тавган дээрх ногоогоо 100г+ болгож, цагаан будаагаа 60г орчимд барихад өлсөхгүйгээр өдөрт -500 ккал алдагдалд орно.',
      bodyEn:
        'Instead of starving, keeping steamed rice around 60g while loading 100g+ of vegetables and lean beef lets you hit a -500 kcal deficit with full satiety.',
      ctaMn: 'Өөрийн жинд таарсан хоолны граммыг Зун яг ална аппаас хараарай →',
      ctaEn: 'See your personalized metric meal grams in Zunygalna →',
    },
    {
      id: 'post-3',
      tagMn: 'Өдрийн пост #3 • Инстаграм / Фэйсбүүк',
      tagEn: 'Daily Social Post #3 • IG / FB',
      titleMn: 'Булчин бол унтаж байхад ч өөх шатаадаг зуух юм',
      titleEn: 'Muscle Mass Burns Calories Even While You Sleep',
      bodyMn:
        'Зөвхөн өлсөж жин хасвал булчин хамт хайлж, суурь шаталт (BMR) унадаг. Харин алхалт + дасгал + уураг хослуулбал булчингийн хувь өсөж, эргээд таргалахгүй биетэй болно.',
      bodyEn:
        'Crash dieting melts muscle and slows your BMR. Combining daily movement with protein builds muscle so your body burns more calories 24/7.',
      ctaMn: 'Найзуудтайгаа өнөөдрийн шугаман уралдаанд нэгдээрэй →',
      ctaEn: 'Join your friends on today’s linear journey →',
    },
  ];

  const handleCopyShareCard = (id: string, title: string, body: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${title}\n\n${body}\n\n#ЗунЯгАлна #Zunygalna`);
    }
    setCopiedCardId(id);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          {lang === 'mn'
            ? 'Эрүүл мэндийн боловсрол ба Жижиг үйлдлийн хүч'
            : 'Science-Backed Nutrition & Lifestyle Education'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === 'mn'
            ? 'Биеэ ойлгох нь: Сахар, Илчлэг, Булчин ба Хөдөлгөөн'
            : 'Understand Your Body: Sugar, Calories, Muscle & Daily Movement'}
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          {lang === 'mn'
            ? 'Өдөр тутмын жижиг сонголтууд хуримтлагдсаар зуны өмнө ямар том өөрчлөлт авчирдгийг бодитоор туршиж үзээрэй.'
            : 'Explore how avoiding processed sugars, building lean muscle, and adding small daily walks compound into dramatic transformations.'}
        </p>
      </div>

      {/* MODULE 1: SUGAR & PROCESSED FOODS VS. WHOLE FOODS + WALKING EQUIVALENT */}
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              {lang === 'mn'
                ? '1. Сахар ба Боловсруулсан хүнсний далд урхи'
                : '1. The Hidden Trap of Sugar & Ultra-Processed Foods'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'mn'
                ? 'Яагаад бага идсэн юм шиг мөртлөө жин хасагддаггүй вэ? Доорх хүнснүүдээс сонгож харьцуулаарай.'
                : 'Why do processed snacks sabotage fat loss? Tap an item below to see its walking burn cost and real-food equivalent.'}
            </p>
          </div>
        </div>

        {/* Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sugarComparisons.map((item, idx) => {
            const active = selectedSugarIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSugarIdx(idx)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-rose-950/60 border-rose-400 text-white shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-extrabold text-rose-300 mb-1">
                  {item.kcal} kcal • {item.sugarGrams}g {lang === 'mn' ? 'сахар' : 'sugar'}
                </div>
                <div className="text-xs font-bold text-white leading-snug">
                  {lang === 'mn' ? item.nameMn : item.nameEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparison Split Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Processed Food Impact */}
          <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                {lang === 'mn' ? 'Боловсруулсан / Чихэртэй хүнс' : 'Processed / Sugary Choice'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-slate-950">
                {currentSugarItem.kcal} kcal
              </span>
            </div>
            <p className="text-sm font-bold text-white">
              {lang === 'mn' ? currentSugarItem.nameMn : currentSugarItem.nameEn}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'mn' ? currentSugarItem.effectMn : currentSugarItem.effectEn}
            </p>
            <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-200">
              <span className="flex items-center gap-1.5 font-bold">
                <Footprints className="w-4 h-4 text-rose-400" />
                {lang === 'mn' ? 'Шатаахад шаардлагатай алхалт:' : 'Walking required to burn off:'}
              </span>
              <span className="font-black text-sm text-rose-300">
                {(walkMetersToBurnSugar / 1000).toFixed(1)} km (
                {walkMetersToBurnSugar.toLocaleString()} m)
              </span>
            </div>
          </div>

          {/* Whole Food Plate Equivalent */}
          <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                {lang === 'mn'
                  ? 'Яг ижил илчлэгтэй эрүүл бүтэн хоол'
                  : 'Same Calories in Real Whole Food'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-slate-950">
                4–5 {lang === 'mn' ? 'цаг цатгалан' : 'hrs full'}
              </span>
            </div>
            <p className="text-sm font-bold text-white">
              {lang === 'mn'
                ? currentSugarItem.realFoodEquivalentMn
                : currentSugarItem.realFoodEquivalentEn}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'mn'
                ? 'Уураг болон эслэг нь хоол боловсруулах явцад өөрөө 20–30% илчлэг зарцуулж (Thermic Effect of Food), булчинг тэжээж өөхийг хайлуулна.'
                : 'Whole protein and fibrous vegetables burn 20–30% of their own calories during digestion (Thermic Effect), nourish muscle, and keep insulin stable.'}
            </p>
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span>{lang === 'mn' ? 'Нэмэлт элсэн чихэр:' : 'Added refined sugar:'}</span>
              <span>0 g</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE 2: MUSCLE MASS = DAILY CALORIE BURN MULTIPLIER */}
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              {lang === 'mn'
                ? '2. Булчингийн масс нэмэгдэхэд өдрийн илчлэг шаталт хэрхэн өөрчлөгддөг вэ?'
                : '2. How Increasing Muscle Mass Boosts Your Daily Calorie Burn'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'mn'
                ? 'Гулсуурыг хөдөлгөж булчингийн жин нэмэгдэхэд таны бие өдөр бүр болон жилд хэдэн ккал илүү шатаахыг хараарай.'
                : 'Drag the slider to see how adding lean skeletal muscle raises your resting & active daily calorie burn.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {lang === 'mn' ? 'Нэмэгдүүлэх булчингийн масс (кг):' : 'Added Lean Muscle Mass (kg):'}
            </span>
            <span className="text-xl font-black text-emerald-400">
              +{addedMuscleKg} kg {lang === 'mn' ? 'булчин' : 'muscle'}
            </span>
          </div>

          <input
            type="range"
            min={0.5}
            max={6.0}
            step={0.5}
            value={addedMuscleKg}
            onChange={(e) => setAddedMuscleKg(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">
                {lang === 'mn' ? 'Өдрийн шаталтын нэмэгдэл' : 'Extra Daily Calorie Burn'}
              </div>
              <div className="text-xl font-black text-emerald-400 mt-1">
                +{dailyExtraBurnFromMuscle} kcal/{lang === 'mn' ? 'өдөр' : 'day'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'mn'
                  ? 'Тайван үеийн (BMR) + хөдөлгөөний шаталт'
                  : 'Resting BMR + higher active output'}
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <div className="text-xs text-slate-400">
                {lang === 'mn' ? '1 жилд автоматаар шатаах илчлэг' : '1-Year Automatic Burn'}
              </div>
              <div className="text-xl font-black text-amber-400 mt-1">
                +{yearlyExtraKcalFromMuscle.toLocaleString()} kcal
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'mn' ? '365 хоногийн турш тасралтгүй' : 'Compounded over 365 days'}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4">
              <div className="text-xs text-emerald-300">
                {lang === 'mn' ? 'Жилд хайлуулах өөхтэй тэнцэх хэмжээ' : 'Equivalent Yearly Fat Burned'}
              </div>
              <div className="text-xl font-black text-white mt-1">
                ≈ {yearlyFatEquivalentKg} kg {lang === 'mn' ? 'өөх' : 'fat'}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                {lang === 'mn'
                  ? 'Буцаж таргалахаас (Yo-yo effect) бүрэн сэргийлнэ'
                  : 'Prevents rebound weight gain permanently'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE 3: DAILY SOCIAL MEDIA HEALTH POSTS (IG / FB FUNNEL CARDS) */}
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {lang === 'mn'
                ? '3. Сошиал медиа өдөр тутмын зөвлөгөө (Instagram / Facebook хуваалцах картууд)'
                : '3. Daily Social Media Health Cards (Instagram / Facebook Funnel)'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'mn'
                ? 'Найз нөхөд, гэр бүлдээ хуваалцаж хамтдаа "Зун яг ална" замналд уриалах бэлэн постууд.'
                : 'Shareable daily micro-insights designed to drive friends and family from Instagram & Facebook into the app.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {socialPosts.map((post) => {
            const isCopied = copiedCardId === post.id;
            return (
              <div
                key={post.id}
                className="rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/40 border border-slate-800 p-5 flex flex-col justify-between gap-4 shadow-lg"
              >
                <div className="space-y-2.5">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {lang === 'mn' ? post.tagMn : post.tagEn}
                  </span>
                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {lang === 'mn' ? post.titleMn : post.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'mn' ? post.bodyMn : post.bodyEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="text-[11px] font-semibold text-emerald-400">
                    {lang === 'mn' ? post.ctaMn : post.ctaEn}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyShareCard(
                        post.id,
                        lang === 'mn' ? post.titleMn : post.titleEn,
                        lang === 'mn' ? post.bodyMn : post.bodyEn
                      )
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {lang === 'mn' ? 'Пост хуулагдлаа!' : 'Copied for IG/FB!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'mn'
                            ? 'IG / FB пост хуулах'
                            : 'Copy Post for IG / FB'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
