'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  DailyProgressLog,
  FriendRacer,
  INITIAL_FRIENDS_AND_FAMILY,
  calculateCaloriePlan,
  generateInitialHeatmapHistory,
} from '@/lib/calorieEngine';
import { Language, TRANSLATIONS } from '@/lib/i18n';
import IntroOnboarding from '@/components/IntroOnboarding';
import HomeJourney from '@/components/HomeJourney';
import LearnSection from '@/components/LearnSection';
import BodyRecompSection from '@/components/BodyRecompSection';
import AuthModal from '@/components/AuthModal';
import {
  Flame,
  Sliders,
  BookOpen,
  Activity,
  UserCheck,
  Globe,
  LogIn,
} from 'lucide-react';

type ActiveTab = 'intro' | 'home' | 'learn' | 'body';

export default function ZunygalnaApp() {
  const [lang, setLang] = useState<Language>('mn');
  const [activeTab, setActiveTab] = useState<ActiveTab>('intro');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [friends, setFriends] = useState<FriendRacer[]>(INITIAL_FRIENDS_AND_FAMILY);
  const [personalBestKcal, setPersonalBestKcal] = useState<number>(680);
  const [authUser, setAuthUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [todayLog, setTodayLog] = useState<DailyProgressLog>({
    date: todayDateStr,
    walkedMeters: 2200,
    exerciseBurnKcal: 140,
    commuteCompleted: true,
    extraIntakeKcal: 0,
    fastingBonusKcal: 0,
    netDeficitAchievedKcal: 520,
    totalBurnAchievedKcal: 430,
    effectiveBurnGoalKcal: 540,
  });

  const plan = useMemo(() => calculateCaloriePlan(profile), [profile]);

  const [historyLogs, setHistoryLogs] = useState<DailyProgressLog[]>(() =>
    generateInitialHeatmapHistory(550)
  );

  // Load saved state from localStorage on client mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('zunygalna_profile_v1');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      const savedToday = localStorage.getItem('zunygalna_today_v1');
      if (savedToday) {
        setTodayLog(JSON.parse(savedToday));
      }
      const savedAuth = localStorage.getItem('zunygalna_auth_v1');
      if (savedAuth) {
        setAuthUser(JSON.parse(savedAuth));
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zunygalna_profile_v1', JSON.stringify(profile));
    } catch {
      // Ignore storage write errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('zunygalna_today_v1', JSON.stringify(todayLog));
    } catch {
      // Ignore storage write errors
    }
  }, [todayLog]);

  const handleAddFriend = (name: string, relation: 'friend' | 'family') => {
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-blue-600',
    ];
    const emojis = ['🏃', '🔥', '⚡', '🌟', '💪'];
    const randomBurn = Math.round(280 + Math.random() * 340);
    const randomGoal = Math.round(450 + Math.random() * 200);

    const newFriend: FriendRacer = {
      id: `friend-${Date.now()}`,
      name,
      relation,
      avatarColor: colors[friends.length % colors.length],
      badgeEmoji: emojis[friends.length % emojis.length],
      todayBurnKcal: randomBurn,
      todayGoalKcal: randomGoal,
      todayWalkedMeters: Math.round(randomBurn * 10.5),
      weightLostKg: Number((1.2 + Math.random() * 3.0).toFixed(1)),
      goalCompletionPct: Math.round((randomBurn / randomGoal) * 100),
      weeklyDeficitStreak: [420, 510, 480, 610, 530, 490, randomBurn],
      lastActiveTextMn: 'Дөнгөж сая уралдаанд нэгдлээ!',
      lastActiveTextEn: 'Just joined your linear journey!',
    };
    setFriends((prev) => [newFriend, ...prev]);
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#060a12] text-slate-100 pb-24">
      {/* STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  Зун яг ална
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zunygalna
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* Right Controls: Language Switcher (MN / EN) + Login/Register */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setLang((l) => (l === 'mn' ? 'en' : 'mn'))}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
              title="Toggle Mongolian / English"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'mn' ? 'MN 🇲🇳' : 'EN 🇬🇧'}</span>
            </button>

            {authUser ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{authUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 font-extrabold text-xs shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.loginBtn}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'intro' && (
          <IntroOnboarding
            profile={profile}
            plan={plan}
            lang={lang}
            onUpdateProfile={setProfile}
            onGoToHomeJourney={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'home' && (
          <HomeJourney
            profile={profile}
            plan={plan}
            lang={lang}
            todayLog={todayLog}
            historyLogs={historyLogs}
            friends={friends}
            personalBestKcal={personalBestKcal}
            onUpdateTodayLog={(updater) => {
              setTodayLog((prev) => {
                const next = updater(prev);
                return next;
              });
            }}
            onAddFriend={handleAddFriend}
          />
        )}

        {activeTab === 'learn' && <LearnSection profile={profile} lang={lang} />}

        {activeTab === 'body' && (
          <BodyRecompSection
            profile={profile}
            plan={plan}
            lang={lang}
            onUpdateProfile={setProfile}
          />
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR (HOME, PLAN/INTRO, LEARN, BODY/FURTHER) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-slate-950/90 border-t border-slate-800">
        <div className="max-w-xl mx-auto px-3 py-2 grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`py-2 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-[11px]">{t.navHome}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('intro')}
            className={`py-2 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'intro'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[11px]">{t.navIntro}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`py-2 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'learn'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[11px]">{t.navLearn}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`py-2 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'body'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[11px]">{t.navBody}</span>
          </button>
        </div>
      </nav>

      {/* LOGIN / REGISTRATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        lang={lang}
        currentName={profile.name}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessAuth={(userData) => {
          setAuthUser(userData);
          setProfile((prev) => ({ ...prev, name: userData.name }));
          try {
            localStorage.setItem('zunygalna_auth_v1', JSON.stringify(userData));
          } catch {
            // Ignore
          }
        }}
      />
    </div>
  );
}
