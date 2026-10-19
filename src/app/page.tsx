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
  syncProfileSlidersWithGoal,
} from '@/lib/calorieEngine';
import { Language, TRANSLATIONS } from '@/lib/i18n';
import IntroGuidedTour from '@/components/IntroGuidedTour';
import OverviewPage from '@/components/OverviewPage';
import HomeJourney from '@/components/HomeJourney';
import ShopSection from '@/components/ShopSection';
import LearnSection from '@/components/LearnSection';
import BodyRecompSection from '@/components/BodyRecompSection';
import AuthModal from '@/components/AuthModal';
import SettingsModal from '@/components/SettingsModal';
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  BookOpen,
  Settings,
  User,
} from 'lucide-react';

type ActiveSubmenu = 'overview' | 'team' | 'shop' | 'learn';

export default function ZunygalnaApp() {
  const [lang, setLang] = useState<Language>('mn');
  // Guided tour mode: shown first with NO bottom submenus until finished, or when editing a card
  const [isIntroActive, setIsIntroActive] = useState<boolean>(true);
  const [introInitialStep, setIntroInitialStep] = useState<number>(0);

  // Main 4 submenus after Intro finishes:
  // 1st: Overview (Ерөнхий), 2nd: Team (Баг), 3rd: Shop (Дэлгүүр), 4th: Learn (Мэдлэг)
  const [activeTab, setActiveTab] = useState<ActiveSubmenu>('overview');

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [friends, setFriends] = useState<FriendRacer[]>(INITIAL_FRIENDS_AND_FAMILY);
  const [personalBestKcal] = useState<number>(680);
  const [authUser, setAuthUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

  const [historyLogs] = useState<DailyProgressLog[]>(() =>
    generateInitialHeatmapHistory(550)
  );

  // Load saved state from localStorage on client mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('zunygalna_profile_v3');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        setProfile(syncProfileSlidersWithGoal(parsed));
      }
      const savedIntroCompleted = localStorage.getItem('zunygalna_intro_done_v3');
      if (savedIntroCompleted === 'true') {
        setIsIntroActive(false);
      }
      const savedToday = localStorage.getItem('zunygalna_today_v3');
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
      localStorage.setItem('zunygalna_profile_v3', JSON.stringify(profile));
    } catch {
      // Ignore storage write errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('zunygalna_today_v3', JSON.stringify(todayLog));
    } catch {
      // Ignore storage write errors
    }
  }, [todayLog]);

  const handleFinishIntro = () => {
    setIsIntroActive(false);
    setActiveTab('overview');
    try {
      localStorage.setItem('zunygalna_intro_done_v3', 'true');
    } catch {
      // Ignore storage write errors
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditIntroStep = (stepIndex: number) => {
    setIntroInitialStep(stepIndex);
    setIsIntroActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // ==================== 1. GUIDED TOUR MODE (NO SUBMENUS SHOWN) ====================
  if (isIntroActive) {
    return (
      <IntroGuidedTour
        profile={profile}
        plan={plan}
        lang={lang}
        initialStep={introInitialStep}
        onUpdateProfile={setProfile}
        onFinishIntro={handleFinishIntro}
      />
    );
  }

  // ==================== 2. MAIN APP SHELL AFTER INTRO FINISHES ====================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-24">
      {/* STICKY TOP HEADER WITH PROFILE & SETTINGS TOP RIGHT */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveTab('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
                  Зун яг ална
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Zunygalna
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t.appTagline}
              </p>
            </div>
          </div>

          {/* TOP-RIGHT: SETTINGS & PROFILE */}
          <div className="flex items-center gap-2.5">
            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              title={lang === 'mn' ? 'Тохиргоо' : 'Settings'}
            >
              <Settings className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">
                {lang === 'mn' ? 'Тохиргоо' : 'Settings'}
              </span>
            </button>

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-extrabold text-emerald-900 flex items-center gap-1.5 cursor-pointer transition-colors"
              title={lang === 'mn' ? 'Профайл' : 'Profile'}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>
                {authUser
                  ? authUser.name
                  : profile.name || (lang === 'mn' ? 'Профайл' : 'Profile')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* 1st SUBMENU: OVERVIEW (Ерөнхий) */}
        {activeTab === 'overview' && (
          <OverviewPage
            profile={profile}
            plan={plan}
            lang={lang}
            onUpdateProfile={setProfile}
            onEditStep={handleEditIntroStep}
            onGoToTeamTab={() => {
              setActiveTab('team');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 2nd SUBMENU: БАГ (Team Linear Journey & Leaderboard) */}
        {activeTab === 'team' && (
          <HomeJourney
            profile={profile}
            plan={plan}
            lang={lang}
            todayLog={todayLog}
            historyLogs={historyLogs}
            friends={friends}
            personalBestKcal={personalBestKcal}
            onUpdateTodayLog={(updater) => {
              setTodayLog((prev) => updater(prev));
            }}
            onAddFriend={handleAddFriend}
          />
        )}

        {/* 3rd SUBMENU: SHOP (Дэлгүүр) */}
        {activeTab === 'shop' && <ShopSection lang={lang} />}

        {/* 4th SUBMENU: LEARN (Мэдлэг + Биеийн бүтэц) */}
        {activeTab === 'learn' && (
          <div className="space-y-10">
            <LearnSection profile={profile} lang={lang} />
            <div className="pt-6 border-t-2 border-emerald-200">
              <BodyRecompSection
                profile={profile}
                plan={plan}
                lang={lang}
                onUpdateProfile={setProfile}
              />
            </div>
          </div>
        )}
      </main>

      {/* STICKY BOTTOM NAVIGATION BAR (4 SUBMENUS: OVERVIEW, БАГ, SHOP, LEARN) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/95 border-t border-slate-200 shadow-lg">
        <div className="max-w-xl mx-auto px-3 py-2 grid grid-cols-4 gap-1.5">
          {[
            {
              id: 'overview' as ActiveSubmenu,
              label: lang === 'mn' ? 'Ерөнхий' : 'Overview',
              icon: <LayoutGrid className="w-4 h-4" />,
              badge: `-${plan.totalDailyNetDeficitKcal}`,
            },
            {
              id: 'team' as ActiveSubmenu,
              label: lang === 'mn' ? 'Баг' : 'Team',
              icon: <Users className="w-4 h-4" />,
              badge: `${(todayLog.walkedMeters / 1000).toFixed(1)}km`,
            },
            {
              id: 'shop' as ActiveSubmenu,
              label: lang === 'mn' ? 'Дэлгүүр' : 'Shop',
              icon: <ShoppingBag className="w-4 h-4" />,
              badge: null,
            },
            {
              id: 'learn' as ActiveSubmenu,
              label: lang === 'mn' ? 'Мэдлэг' : 'Learn',
              icon: <BookOpen className="w-4 h-4" />,
              badge: null,
            },
          ].map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative py-2 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1">
                  {item.icon}
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* PROFILE / AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        currentName={profile.name}
        onSuccessAuth={(user) => {
          setAuthUser(user);
          setProfile((p) => ({ ...p, name: user.name }));
          try {
            localStorage.setItem('zunygalna_auth_v1', JSON.stringify(user));
          } catch {
            // Ignore
          }
        }}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={lang}
        onChangeLang={setLang}
        profile={profile}
        onUpdateProfile={setProfile}
        onRestartIntro={() => handleEditIntroStep(0)}
      />
    </div>
  );
}
