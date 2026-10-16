'use client';

import React, { useState, useRef } from 'react';
import {
  UserProfile,
  CaloriePlanSummary,
  DailyProgressLog,
  FriendRacer,
  kcalToWalkingMeters,
  walkingMetersToKcal,
} from '@/lib/calorieEngine';
import { Language, TRANSLATIONS } from '@/lib/i18n';
import {
  Flame,
  Footprints,
  Flag,
  Ghost,
  Trophy,
  Plus,
  RotateCcw,
  Sparkles,
  Send,
  Utensils,
  Zap,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Check,
  Share2,
} from 'lucide-react';

interface HomeJourneyProps {
  profile: UserProfile;
  plan: CaloriePlanSummary;
  lang: Language;
  todayLog: DailyProgressLog;
  historyLogs: DailyProgressLog[];
  friends: FriendRacer[];
  personalBestKcal: number;
  onUpdateTodayLog: (updater: (prev: DailyProgressLog) => DailyProgressLog) => void;
  onAddFriend: (name: string, relation: 'friend' | 'family') => void;
}

export default function HomeJourney({
  profile,
  plan,
  lang,
  todayLog,
  historyLogs,
  friends,
  personalBestKcal,
  onUpdateTodayLog,
  onAddFriend,
}: HomeJourneyProps) {
  const t = TRANSLATIONS[lang];
  const trackScrollRef = useRef<HTMLDivElement>(null);

  const [leaderboardSort, setLeaderboardSort] = useState<'burn' | 'distance' | 'weightLoss'>('burn');
  const [selectedRacerId, setSelectedRacerId] = useState<string | null>(null);
  const [nudgeToast, setNudgeToast] = useState<string | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendRelation, setNewFriendRelation] = useState<'friend' | 'family'>('friend');
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<DailyProgressLog | null>(null);

  // Base daily active burn goal from user's plan
  const baseActiveGoalKcal = Math.max(250, plan.totalDailyTargetActiveBurnKcal);

  // If user includes extra calorie intake (> 0), their calorie burn goal shifts FURTHER RIGHT!
  const effectiveBurnGoalKcal = baseActiveGoalKcal + todayLog.extraIntakeKcal;

  // User's current active burn today:
  const walkKcalToday = walkingMetersToKcal(todayLog.walkedMeters, profile.weightKg);
  const commuteKcalToday = todayLog.commuteCompleted ? plan.commuteKcal : 0;
  const totalBurnTodayKcal = walkKcalToday + todayLog.exerciseBurnKcal + commuteKcalToday;

  const totalDistanceTodayMeters =
    todayLog.walkedMeters +
    (todayLog.commuteCompleted ? plan.commuteActiveMeters : 0) +
    kcalToWalkingMeters(todayLog.exerciseBurnKcal, profile.weightKg);

  // Net calorie deficit achieved today
  const netDeficitTodayKcal = Math.max(
    0,
    totalBurnTodayKcal +
      profile.dietCutKcal +
      todayLog.fastingBonusKcal -
      todayLog.extraIntakeKcal
  );

  const isGoalReached = totalBurnTodayKcal >= effectiveBurnGoalKcal;
  const overdoneKcal = Math.max(0, totalBurnTodayKcal - effectiveBurnGoalKcal);
  const currentPersonalBestKcal = Math.max(personalBestKcal, totalBurnTodayKcal);

  // Track maximum scale (kcal)
  const maxTrackKcal = Math.max(
    1100,
    effectiveBurnGoalKcal + 250,
    totalBurnTodayKcal + 200,
    currentPersonalBestKcal + 150,
    ...friends.map((f) => Math.max(f.todayBurnKcal, f.todayGoalKcal) + 150)
  );

  const getTrackPercent = (kcal: number) =>
    Math.min(97, Math.max(2, (kcal / maxTrackKcal) * 100));

  // Handlers for 1-tap movement & food intake logging
  const handleAddWalkMeters = (metersToAdd: number) => {
    onUpdateTodayLog((prev) => ({
      ...prev,
      walkedMeters: prev.walkedMeters + metersToAdd,
    }));
  };

  const handleAddExerciseKcal = (kcalToAdd: number) => {
    onUpdateTodayLog((prev) => ({
      ...prev,
      exerciseBurnKcal: prev.exerciseBurnKcal + kcalToAdd,
    }));
  };

  const handleToggleCommute = () => {
    onUpdateTodayLog((prev) => ({
      ...prev,
      commuteCompleted: !prev.commuteCompleted,
    }));
  };

  const handleAddExtraIntake = (extraKcal: number) => {
    onUpdateTodayLog((prev) => ({
      ...prev,
      extraIntakeKcal: Math.max(0, prev.extraIntakeKcal + extraKcal),
      fastingBonusKcal: 0,
    }));
  };

  const handleToggleFastingBonus = (bonusKcal: number) => {
    onUpdateTodayLog((prev) => ({
      ...prev,
      fastingBonusKcal: prev.fastingBonusKcal === bonusKcal ? 0 : bonusKcal,
      extraIntakeKcal: 0,
    }));
  };

  const handleResetToday = () => {
    onUpdateTodayLog((prev) => ({
      ...prev,
      walkedMeters: 0,
      exerciseBurnKcal: 0,
      commuteCompleted: false,
      extraIntakeKcal: 0,
      fastingBonusKcal: 0,
    }));
  };

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!trackScrollRef.current) return;
    const offset = direction === 'right' ? 360 : -360;
    trackScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const triggerNudge = (friendName: string, message: string) => {
    setNudgeToast(`${friendName} руу "${message}" илгээлээ!`);
    setTimeout(() => setNudgeToast(null), 3500);
  };

  /**
   * Light-Mode Duolingo / GitHub Commit Heatmap Color Scale
   * Progressively deeper & brighter emerald/lime/amber colors for higher daily calorie deficits!
   */
  const getDeficitHeatmapStyle = (deficitKcal: number) => {
    if (deficitKcal <= 100) {
      return {
        bg: 'bg-slate-100 border-slate-200 text-slate-500',
        labelMn: 'Бага (<100 ккал)',
        labelEn: 'Minimal (<100 kcal)',
        level: 0,
      };
    }
    if (deficitKcal < 350) {
      return {
        bg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
        labelMn: 'Хөнгөн (100–349 ккал)',
        labelEn: 'Light (100–349 kcal)',
        level: 1,
      };
    }
    if (deficitKcal < 550) {
      return {
        bg: 'bg-emerald-300 border-emerald-400 text-emerald-950 font-bold shadow-xs',
        labelMn: 'Дундаж (350–549 ккал)',
        labelEn: 'Solid (350–549 kcal)',
        level: 2,
      };
    }
    if (deficitKcal < 750) {
      return {
        bg: 'bg-emerald-500 border-emerald-600 text-white font-extrabold shadow-sm shadow-emerald-500/30',
        labelMn: 'Өндөр (550–749 ккал)',
        labelEn: 'High (550–749 kcal)',
        level: 3,
      };
    }
    return {
      bg: 'bg-gradient-to-br from-emerald-500 via-lime-500 to-amber-500 border-amber-400 text-white font-black shadow-md shadow-emerald-500/40 ring-1 ring-amber-300',
      labelMn: 'Супер шаталт / Мацаг (750+ ккал)',
      labelEn: 'Super Deficit / Fasting (750+ kcal)',
      level: 4,
    };
  };

  // Combine 27 past days + today's live day for the 28-day monthly grid
  const liveTodayEntry: DailyProgressLog = {
    ...todayLog,
    netDeficitAchievedKcal: netDeficitTodayKcal,
    totalBurnAchievedKcal: totalBurnTodayKcal,
    effectiveBurnGoalKcal,
    walkedMeters: totalDistanceTodayMeters,
  };
  const full28Days = [...historyLogs.slice(-27), liveTodayEntry];
  const last7Days = full28Days.slice(-7);

  // Build unified ranking list (User + Friends/Family)
  const allParticipants = [
    {
      id: 'me',
      name: `${profile.name} (${lang === 'mn' ? 'Та' : 'You'})`,
      isMe: true,
      relation: 'family' as const,
      avatarColor: 'from-emerald-500 to-teal-600',
      badgeEmoji: '⭐',
      todayBurnKcal: totalBurnTodayKcal,
      todayGoalKcal: effectiveBurnGoalKcal,
      todayWalkedMeters: totalDistanceTodayMeters,
      weightLostKg: Number(
        Math.max(0.5, (netDeficitTodayKcal / 7700) * 18).toFixed(1)
      ),
      goalCompletionPct: Math.round((totalBurnTodayKcal / effectiveBurnGoalKcal) * 100),
      weeklyDeficitStreak: last7Days.map((d) => d.netDeficitAchievedKcal),
      lastActiveTextMn: isGoalReached
        ? `Зорилгоо +${overdoneKcal} ккал-аар давууллаа!`
        : todayLog.extraIntakeKcal > 0
        ? `Илүү хоол (+${todayLog.extraIntakeKcal} ккал) орсон тул бариа холдсон`
        : 'Өнөөдрийн замналаа үргэлжлүүлж байна',
      lastActiveTextEn: isGoalReached
        ? `Surpassed daily burn goal by +${overdoneKcal} kcal!`
        : todayLog.extraIntakeKcal > 0
        ? `Logged +${todayLog.extraIntakeKcal} kcal intake -> Goal shifted right`
        : 'Progressing along today’s linear track',
    },
    ...friends.map((f) => ({ ...f, isMe: false })),
  ].sort((a, b) => {
    if (leaderboardSort === 'burn') return b.todayBurnKcal - a.todayBurnKcal;
    if (leaderboardSort === 'distance') return b.todayWalkedMeters - a.todayWalkedMeters;
    return b.weightLostKg - a.weightLostKg;
  });

  // Generate tick marks every 150 kcal along the horizontal track
  const tickMarksKcal: number[] = [];
  for (let k = 0; k <= maxTrackKcal; k += 150) {
    tickMarksKcal.push(k);
  }

  return (
    <div className="space-y-8 pb-12">
      {/* TOAST NOTIFICATION FOR NUDGES */}
      {nudgeToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{nudgeToast}</span>
        </div>
      )}

      {/* TOP SUMMARY BAR (WHITE / LIGHT THEME) */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-amber-50/40 border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'mn' ? 'Өдөр бүрийн шугаман ахиц' : 'Daily Linear Progress'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t.homeHeaderTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-3xl">
              {t.homeHeaderSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTrack('left')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack('right')}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{lang === 'mn' ? 'Баруун тийш гүйлгэх' : 'Scroll Right'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LIVE DAILY METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">
              {lang === 'mn' ? 'Өнөөдөр шатаасан (Идэвхтэй)' : 'Active Burn Today'}
            </div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">
              {totalBurnTodayKcal} <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {(totalDistanceTodayMeters / 1000).toFixed(2)} km (
              {totalDistanceTodayMeters.toLocaleString()} m)
            </div>
          </div>

          <div
            className={`rounded-2xl p-3.5 border shadow-2xs ${
              todayLog.extraIntakeKcal > 0
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
              <span>
                {lang === 'mn' ? 'Өнөөдрийн шатаах бариа' : 'Today’s Burn Goal Flag'}
              </span>
              {todayLog.extraIntakeKcal > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  +{todayLog.extraIntakeKcal} kcal холдсон
                </span>
              )}
            </div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {effectiveBurnGoalKcal}{' '}
              <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {isGoalReached ? (
                <span className="text-emerald-600 font-bold">
                  🎉 Зорилгоо +{overdoneKcal} ккал давуулсан!
                </span>
              ) : (
                <span>
                  {lang === 'mn' ? 'Бариа хүртэл:' : 'Remaining:'}{' '}
                  {effectiveBurnGoalKcal - totalBurnTodayKcal} kcal (
                  {kcalToWalkingMeters(
                    effectiveBurnGoalKcal - totalBurnTodayKcal,
                    profile.weightKg
                  )}{' '}
                  m)
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-cyan-50/70 border border-cyan-200 p-3.5 shadow-2xs">
            <div className="text-xs font-semibold text-cyan-800 flex items-center gap-1">
              <Ghost className="w-3.5 h-3.5 text-cyan-600" />
              {lang === 'mn' ? 'Хувийн дээд амжилт (Ghost)' : 'Personal Best (Ghost)'}
            </div>
            <div className="text-xl font-black text-cyan-700 mt-0.5">
              {currentPersonalBestKcal} <span className="text-xs font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-cyan-700 font-medium mt-1">
              ≈{' '}
              {(
                kcalToWalkingMeters(currentPersonalBestKcal, profile.weightKg) / 1000
              ).toFixed(1)}{' '}
              km{' '}
              {totalBurnTodayKcal >= personalBestKcal && (
                <span className="text-amber-600 font-bold">• NEW RECORD!</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 shadow-2xs">
            <div className="text-xs font-semibold text-emerald-800">
              {lang === 'mn' ? 'Өнөөдрийн цэвэр алдагдал' : 'Today’s Net Deficit'}
            </div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              -{netDeficitTodayKcal} <span className="text-xs font-normal">kcal</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {getDeficitHeatmapStyle(netDeficitTodayKcal)[
                lang === 'mn' ? 'labelMn' : 'labelEn'
              ]}
            </div>
          </div>
        </div>

        {/* =====================================================================
            RIGHT-FACING SIDE-SCROLLABLE LINEAR JOURNEY TRACK (LIGHT THEME)
           ===================================================================== */}
        <div
          ref={trackScrollRef}
          className="relative w-full overflow-x-auto rounded-2xl bg-white border border-slate-200 p-4 pb-6 select-none shadow-inner"
        >
          {/* Wide inner canvas so user can scroll rightwards */}
          <div className="relative min-w-[980px] h-64 pt-6">
            {/* LEGEND AT TOP OF TRACK */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-4 px-2">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  {lang === 'mn'
                    ? 'Таны байршил ба Зорилгын туг'
                    : 'Your Avatar & Goal Flag'}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-cyan-700">
                  <Ghost className="w-3.5 h-3.5 text-cyan-600" />
                  {lang === 'mn'
                    ? 'Таны Ghost (Дээд амжилт)'
                    : 'Personal Best Ghost'}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-700">
                  <Flag className="w-3.5 h-3.5 text-amber-500" />
                  {lang === 'mn'
                    ? 'Найз / Гэр бүлийн байршил ба тэдний шатаах зорилго'
                    : 'Friends/Family & Their Daily Burn Goals'}
                </span>
              </div>
              <span className="text-slate-500 font-semibold">
                {lang === 'mn'
                  ? 'Эхлэл (0 ккал) ➔ Баруун тийш уралдах'
                  : 'Start (0 kcal) ➔ Race Rightward'}
              </span>
            </div>

            {/* HORIZONTAL ROAD / TRACK LINE */}
            <div className="relative h-16 mt-14 mx-6 rounded-2xl bg-slate-100 border border-slate-300 flex items-center">
              {/* Active green progress bar for Current User */}
              <div
                className="h-full rounded-l-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-lime-400 transition-all duration-500 shadow-xs"
                style={{ width: `${getTrackPercent(totalBurnTodayKcal)}%` }}
              />

              {/* Direction Arrows along the road */}
              <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-25 text-slate-500 font-black text-lg">
                <span>➔</span>
                <span>➔</span>
                <span>➔</span>
                <span>➔</span>
                <span>➔</span>
                <span>➔</span>
              </div>

              {/* TICK MARKS (KCAL + METERS/KM) */}
              {tickMarksKcal.map((kcalTick) => {
                const leftPct = getTrackPercent(kcalTick);
                const metersTick = kcalToWalkingMeters(kcalTick, profile.weightKg);
                return (
                  <div
                    key={kcalTick}
                    className="absolute top-full mt-2 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${leftPct}%` }}
                  >
                    <div className="w-0.5 h-2.5 bg-slate-300 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700">
                      {kcalTick} kcal
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {(metersTick / 1000).toFixed(1)} km ({metersTick}m)
                    </span>
                  </div>
                );
              })}

              {/* 1. PERSONAL BEST GHOST MARKER */}
              <div
                className="absolute -top-12 -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
                style={{ left: `${getTrackPercent(currentPersonalBestKcal)}%` }}
              >
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-400 text-[10px] font-bold text-cyan-800 whitespace-nowrap flex items-center gap-1 shadow-xs">
                  <Ghost className="w-3 h-3 text-cyan-600" />
                  <span>Ghost: {currentPersonalBestKcal} kcal</span>
                </div>
                <div className="w-0.5 h-10 border-l-2 border-dashed border-cyan-500" />
              </div>

              {/* 2. FRIENDS & FAMILY GOAL FLAGS + AVATARS ON THE TRACK */}
              {friends.map((friend, idx) => {
                const avatarLeft = getTrackPercent(friend.todayBurnKcal);
                const goalLeft = getTrackPercent(friend.todayGoalKcal);
                const verticalOffset = idx % 2 === 0 ? '-top-11' : '-bottom-12';

                return (
                  <React.Fragment key={friend.id}>
                    {/* Friend's Daily Calorie Burn Goal Marker (Visible to User!) */}
                    <div
                      onClick={() => setSelectedRacerId(friend.id)}
                      className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
                      style={{ left: `${goalLeft}%` }}
                      title={`${friend.name} Goal: ${friend.todayGoalKcal} kcal`}
                    >
                      <div className="h-full w-0.5 border-l-2 border-dotted border-amber-500/80" />
                      <div className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-[9px] font-bold text-amber-800 whitespace-nowrap shadow-2xs group-hover:scale-105">
                        🎯 {friend.name.split(' ')[0]}: {friend.todayGoalKcal}
                      </div>
                    </div>

                    {/* Friend's Live Avatar on the Linear Track */}
                    <button
                      type="button"
                      onClick={() => setSelectedRacerId(friend.id)}
                      className={`absolute ${verticalOffset} -translate-x-1/2 flex flex-col items-center group cursor-pointer transition-all duration-500 z-20`}
                      style={{ left: `${avatarLeft}%` }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${friend.avatarColor} border-2 border-white shadow-md flex items-center justify-center text-xs font-bold text-white group-hover:scale-110 transition-transform`}
                      >
                        {friend.badgeEmoji}
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-bold text-slate-800 whitespace-nowrap shadow-2xs">
                        {friend.name.split(' ')[0]} ({friend.todayBurnKcal})
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}

              {/* 3. USER'S OWN DAILY CALORIE BURN GOAL FLAG (SHIFTS RIGHT WHEN EXTRA FOOD IS LOGGED!) */}
              <div
                className="absolute -top-14 bottom-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-20"
                style={{ left: `${getTrackPercent(effectiveBurnGoalKcal)}%` }}
              >
                <div
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-extrabold whitespace-nowrap shadow-md flex items-center gap-1 ${
                    todayLog.extraIntakeKcal > 0
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-emerald-600 text-white border-emerald-700'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'mn' ? 'Таны бариа:' : 'Your Goal:'}{' '}
                    {effectiveBurnGoalKcal} kcal
                  </span>
                </div>
                <div className="w-1 flex-1 bg-gradient-to-b from-emerald-500 to-amber-500" />
              </div>

              {/* 4. USER'S LIVE AVATAR (FRONT & CENTER) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-30"
                style={{ left: `${getTrackPercent(totalBurnTodayKcal)}%` }}
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-white">
                  🏃
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] whitespace-nowrap shadow-xs">
                  {lang === 'mn' ? 'ТА' : 'YOU'}: {totalBurnTodayKcal} kcal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SELECTED FRIEND QUICK NUDGE BAR */}
        {selectedRacerId && (
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-300 p-4 flex flex-wrap items-center justify-between gap-3">
            {(() => {
              const f = friends.find((x) => x.id === selectedRacerId);
              if (!f) return null;
              return (
                <>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{f.badgeEmoji}</span>
                      <span>{f.name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700 font-bold">
                        {f.todayBurnKcal} / {f.todayGoalKcal} kcal ({f.todayWalkedMeters} m)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {lang === 'mn' ? f.lastActiveTextMn : f.lastActiveTextEn}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        triggerNudge(f.name, '💪 Зун яг ална шүү! Өнөөдөр алхаарай!')
                      }
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      💪 Алхаарай!
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerNudge(f.name, '🔥 Гайхалтай шатааж байна, бариа ойртлоо!')
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      🔥 Бариа ойртлоо!
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* =====================================================================
            ONE-TAP DAILY LOGGING CONTROLS (MOVEMENT + FOOD INTAKE GOAL SHIFTER)
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Left Box: Add Walking (m / km) & Exercise */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-600" />
                {lang === 'mn'
                  ? '1. Алхалт ба Дасгал нэмэх (Урагшлах)'
                  : '1. Log Walking (m/km) & Exercise (Move Right)'}
              </span>
              <button
                type="button"
                onClick={handleResetToday}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {lang === 'mn' ? 'Тэглэх' : 'Reset day'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleToggleCommute}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  todayLog.commuteCompleted
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {lang === 'mn'
                  ? `Ажил–Гэр зорчилт (+${plan.commuteKcal} ккал / ${plan.commuteActiveMeters}м)`
                  : `Commute (+${plan.commuteKcal} kcal / ${plan.commuteActiveMeters}m)`}
              </button>

              <button
                type="button"
                onClick={() => handleAddWalkMeters(500)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
              >
                +500 m {lang === 'mn' ? 'алхалт' : 'walk'}
              </button>

              <button
                type="button"
                onClick={() => handleAddWalkMeters(1000)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
              >
                +1.0 km (1,000 m)
              </button>

              <button
                type="button"
                onClick={() => handleAddWalkMeters(2500)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
              >
                +2.5 km (2,500 m)
              </button>

              <button
                type="button"
                onClick={() => handleAddExerciseKcal(200)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer"
              >
                🏋️ +30 мин дасгал (+200 kcal)
              </button>
            </div>
          </div>

          {/* Right Box: Food Intake / Fasting Adjuster (Shifts Burn Goal Flag!) */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-600" />
                {lang === 'mn'
                  ? '2. Хоолны илчлэг & Мацаг (Барианы шугам өөрчлөгдөнө)'
                  : '2. Food Intake & Fasting (Shifts Goal Line)'}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {todayLog.extraIntakeKcal > 0
                  ? `+${todayLog.extraIntakeKcal} kcal илүү идсэн`
                  : todayLog.fastingBonusKcal > 0
                  ? `Мацаг / Хөнгөн: +${todayLog.fastingBonusKcal} kcal алдагдал`
                  : lang === 'mn'
                  ? 'Хэвийн'
                  : 'On target'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleFastingBonus(250)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  todayLog.fastingBonusKcal === 250
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-lime-50 text-emerald-800 border-lime-300 hover:bg-lime-100'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {lang === 'mn'
                  ? 'Орой хөнгөн / Мацаг (+250 ккал алдагдал)'
                  : 'Fasting / Light Dinner (+250 kcal deficit)'}
              </button>

              <button
                type="button"
                onClick={() => handleAddExtraIntake(180)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer"
              >
                🍰 +Амттан / Ундаа (+180 kcal ➔ Бариа холдоно)
              </button>

              <button
                type="button"
                onClick={() => handleAddExtraIntake(350)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer"
              >
                🥟 +Илүү хоол (+350 kcal ➔ Бариа холдоно)
              </button>

              {(todayLog.extraIntakeKcal > 0 || todayLog.fastingBonusKcal > 0) && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateTodayLog((prev) => ({
                      ...prev,
                      extraIntakeKcal: 0,
                      fastingBonusKcal: 0,
                    }))
                  }
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {lang === 'mn' ? 'Хоол хэвийн болгох' : 'Clear food adjustment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          WEEKLY & MONTHLY DEFICIT HEATMAP (DUOLINGO / GITHUB COMMIT STYLE)
         ===================================================================== */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              {t.heatmapTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.heatmapDesc}</p>
          </div>

          {/* Brightness Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
            <span>{lang === 'mn' ? 'Бага' : 'Low'}</span>
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 inline-block" />
            <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            <span className="w-3.5 h-3.5 rounded bg-emerald-300 border border-emerald-400 inline-block" />
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 inline-block" />
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-br from-emerald-500 via-lime-500 to-amber-500 border border-amber-400 inline-block" />
            <span className="font-bold text-emerald-700">
              {lang === 'mn' ? 'Өндөр алдагдал (750+ ккал)' : 'High Deficit (750+ kcal)'}
            </span>
          </div>
        </div>

        {/* WEEKLY 7-DAY STREAK BAR (DUOLINGO STYLE) */}
        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
            <span>
              {lang === 'mn'
                ? 'Сүүлийн 7 хоногийн эрчим (Duolingo Streak)'
                : 'This Week’s 7-Day Deficit Intensity'}
            </span>
            <span className="text-emerald-700 font-extrabold">
              {lang === 'mn' ? '7 хоногийн нийт:' : '7-Day Total:'} -
              {last7Days
                .reduce((s, d) => s + d.netDeficitAchievedKcal, 0)
                .toLocaleString()}{' '}
              kcal (≈{' '}
              {(
                last7Days.reduce((s, d) => s + d.netDeficitAchievedKcal, 0) / 7700
              ).toFixed(2)}{' '}
              kg)
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {last7Days.map((day, idx) => {
              const style = getDeficitHeatmapStyle(day.netDeficitAchievedKcal);
              const isToday = idx === last7Days.length - 1;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedHeatmapDay(day)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    style.bg
                  } ${
                    isToday
                      ? 'ring-2 ring-amber-500 scale-[1.03]'
                      : 'hover:scale-105'
                  }`}
                >
                  <span className="text-[10px] opacity-85 font-semibold">
                    {isToday ? (lang === 'mn' ? 'Өнөөдөр' : 'Today') : day.date.slice(5)}
                  </span>
                  <span className="text-sm sm:text-base font-black">
                    -{day.netDeficitAchievedKcal}
                  </span>
                  <span className="text-[10px] opacity-90">
                    {(day.walkedMeters / 1000).toFixed(1)} km
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MONTHLY 28-DAY GITHUB-STYLE COMMIT MATRIX */}
        <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>
              {lang === 'mn'
                ? 'Сүүлийн 28 хоногийн GitHub Commit матриц (Дарж дэлгэрэнгүй харна уу)'
                : '28-Day GitHub-Style Deficit Commit Matrix (Tap any day)'}
            </span>
            <span className="text-amber-700 font-extrabold">
              {lang === 'mn' ? '28 хоногийн нийт хассан өөх:' : '28-Day Fat Burned:'} ≈{' '}
              {(
                full28Days.reduce((s, d) => s + d.netDeficitAchievedKcal, 0) / 7700
              ).toFixed(2)}{' '}
              kg
            </span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
            {full28Days.map((day, idx) => {
              const style = getDeficitHeatmapStyle(day.netDeficitAchievedKcal);
              const isToday = idx === full28Days.length - 1;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedHeatmapDay(day)}
                  className={`h-11 rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer ${
                    style.bg
                  } ${isToday ? 'ring-2 ring-amber-500' : 'hover:scale-105'}`}
                  title={`${day.date}: -${day.netDeficitAchievedKcal} kcal deficit (${day.walkedMeters} m)`}
                >
                  <span className="text-[9px] leading-none opacity-80">
                    {day.date.slice(8)}
                  </span>
                  <span className="text-[11px] font-extrabold leading-tight">
                    -{day.netDeficitAchievedKcal}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedHeatmapDay && (
            <div className="mt-3 p-3.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 shadow-2xs">
              <div>
                <strong className="text-emerald-700">{selectedHeatmapDay.date}</strong>:{' '}
                {lang === 'mn' ? 'Цэвэр алдагдал' : 'Net Deficit'}{' '}
                <strong>-{selectedHeatmapDay.netDeficitAchievedKcal} kcal</strong> •{' '}
                {lang === 'mn' ? 'Алхалт:' : 'Walked:'}{' '}
                <strong>
                  {selectedHeatmapDay.walkedMeters} m (
                  {(selectedHeatmapDay.walkedMeters / 1000).toFixed(2)} km)
                </strong>
                {selectedHeatmapDay.fastingBonusKcal > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-lime-100 text-emerald-800 font-bold">
                    ⚡ Мацаг / Хөнгөн оройн хоол (+{selectedHeatmapDay.fastingBonusKcal} kcal)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedHeatmapDay(null)}
                className="text-slate-400 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          FRIENDS & FAMILY RANKINGS + MINI COMMIT STREAKS + INVITE
         ===================================================================== */}
      <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {lang === 'mn'
                ? 'Найз нөхөд & Гэр бүлийн жагсаалт (Зун яг ална баг)'
                : 'Friends & Family Leaderboard & Goal Tracker'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {lang === 'mn'
                ? 'Хэн хамгийн хол алхсан, их илчлэг шатаасан болон жин хассанаар эрэмбэлж, бие биедээ урам өгөөрэй.'
                : 'Compare daily calorie burn, distance walked (km/m), weight loss, and 7-day deficit streaks.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Ranking Metric Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(
                [
                  { id: 'burn', labelMn: 'Шатаасан ккал', labelEn: 'Top Calorie' },
                  { id: 'distance', labelMn: 'Зам (км/м)', labelEn: 'Distance (km)' },
                  { id: 'weightLoss', labelMn: 'Хассан жин', labelEn: 'Weight Loss' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeaderboardSort(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    leaderboardSort === tab.id
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'mn' ? tab.labelMn : tab.labelEn}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddFriendModal((v) => !v)}
              className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'mn' ? 'Найз / Гэр бүл нэмэх' : 'Add Friend/Family'}</span>
            </button>
          </div>
        </div>

        {/* Add Friend Inline Box */}
        {showAddFriendModal && (
          <div className="rounded-2xl bg-amber-50/70 border border-amber-300 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <input
                type="text"
                placeholder={
                  lang === 'mn'
                    ? 'Найз эсвэл гэр бүлийн гишүүний нэр...'
                    : 'Friend or family member name...'
                }
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 min-w-[220px]"
              />
              <select
                value={newFriendRelation}
                onChange={(e) =>
                  setNewFriendRelation(e.target.value as 'friend' | 'family')
                }
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900"
              >
                <option value="friend">{lang === 'mn' ? 'Найз' : 'Friend'}</option>
                <option value="family">{lang === 'mn' ? 'Гэр бүл' : 'Family'}</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!newFriendName.trim()) return;
                  onAddFriend(newFriendName.trim(), newFriendRelation);
                  setNewFriendName('');
                  setShowAddFriendModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                {lang === 'mn' ? 'Уралдаанд нэмэх' : 'Add to Track'}
              </button>
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {lang === 'mn' ? 'Таны урилгын код:' : 'Your Invite Code:'}{' '}
                <strong className="text-amber-800 font-mono">ZUN-2027</strong>
              </span>
            </div>
          </div>
        )}

        {/* Leaderboard Rows */}
        <div className="space-y-3">
          {allParticipants.map((person, index) => {
            const pct = Math.min(
              140,
              Math.round((person.todayBurnKcal / Math.max(1, person.todayGoalKcal)) * 100)
            );
            return (
              <div
                key={person.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  person.isMe
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 text-center font-black text-sm text-slate-500">
                    #{index + 1}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${person.avatarColor} flex items-center justify-center text-base text-white shadow-sm shrink-0`}
                  >
                    {person.badgeEmoji}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {person.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                        {person.relation === 'family'
                          ? lang === 'mn'
                            ? 'Гэр бүл'
                            : 'Family'
                          : lang === 'mn'
                          ? 'Найз'
                          : 'Friend'}
                      </span>
                      {pct >= 100 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                          Зорилго биелсэн ({pct}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {lang === 'mn' ? person.lastActiveTextMn : person.lastActiveTextEn}
                    </p>
                  </div>
                </div>

                {/* Right side: 7-day mini GitHub streak + metrics + cheer button */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4">
                  {/* Mini 7-day Commit Indicator */}
                  <div className="flex items-center gap-1" title="7-Day Deficit Streak">
                    {person.weeklyDeficitStreak.map((defVal, i) => {
                      const st = getDeficitHeatmapStyle(defVal);
                      return (
                        <div
                          key={i}
                          className={`w-3.5 h-3.5 rounded-sm border ${st.bg}`}
                          title={`Day ${i + 1}: -${defVal} kcal`}
                        />
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="text-right min-w-[145px]">
                    <div className="text-sm font-extrabold text-slate-900">
                      {person.todayBurnKcal}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        / {person.todayGoalKcal} kcal
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      {(person.todayWalkedMeters / 1000).toFixed(2)} km (
                      {person.todayWalkedMeters} m) • -{person.weightLostKg} kg
                    </div>
                  </div>

                  {!person.isMe && (
                    <button
                      type="button"
                      onClick={() =>
                        triggerNudge(
                          person.name,
                          '🔥 Зун яг ална! Өнөөдрийн бариандаа хүрээрэй!'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-500 hover:text-white text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      👋 Урам өгөх
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
