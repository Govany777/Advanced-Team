'use client'

import React, { useState } from 'react'
import {
  Award,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  Zap,
} from 'lucide-react'
import { Badge, DailyQuest, ScoutUser } from '@/lib/types'
import { DEFAULT_BADGES } from '@/lib/initialData'

interface HomePageProps {
  currentUser: ScoutUser | null
  onOpenAuth: () => void
  onNavigateQuizzes: () => void
  onNavigateLeaderboard: () => void
  onUpdateUser: (updatedUser: ScoutUser) => void
  leaderboardPreview: Array<{ name: string; score: number; rank: string; avatar: string }>
  dailyQuests: DailyQuest[]
}

export function HomePage({
  currentUser,
  onOpenAuth,
  onNavigateQuizzes,
  onNavigateLeaderboard,
  onUpdateUser,
  leaderboardPreview,
  dailyQuests,
}: HomePageProps) {
  const [completedQuestNotice, setCompletedQuestNotice] = useState<string | null>(null)

  // Current Arabic Date
  const todayArabic = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Calculate Scout Level & Next Goal
  const points = currentUser?.points ?? 0
  let currentLevel = 'كشاف مبتدئ'
  let nextLevelGoal = 50
  let levelIndex = 1

  if (points >= 350) {
    currentLevel = 'قائد كشفي متميز'
    nextLevelGoal = 500
    levelIndex = 5
  } else if (points >= 220) {
    currentLevel = 'عريف كشفي متقدم'
    nextLevelGoal = 350
    levelIndex = 4
  } else if (points >= 120) {
    currentLevel = 'كشاف أول معتمد'
    nextLevelGoal = 220
    levelIndex = 3
  } else if (points >= 50) {
    currentLevel = 'كشاف ثانٍ متمرس'
    nextLevelGoal = 120
    levelIndex = 2
  }

  // Complete a Daily Quest
  const handleCompleteQuest = (quest: DailyQuest) => {
    if (!currentUser) {
      onOpenAuth()
      return
    }

    const alreadyDone = currentUser.completedTasks?.includes(quest.id)
    if (alreadyDone) return

    const newPoints = currentUser.points + quest.points
    const newCompletedTasks = [...(currentUser.completedTasks || []), quest.id]

    // Check newly unlocked badges
    const newUnlockedBadges = [...(currentUser.unlockedBadges || [])]
    DEFAULT_BADGES.forEach((b) => {
      if (newPoints >= b.requiredPoints && !newUnlockedBadges.includes(b.id)) {
        newUnlockedBadges.push(b.id)
      }
    })

    const updated: ScoutUser = {
      ...currentUser,
      points: newPoints,
      completedTasks: newCompletedTasks,
      unlockedBadges: newUnlockedBadges,
    }

    onUpdateUser(updated)
    setCompletedQuestNotice(`عاش يا بطل! أتممت مهمة "${quest.title}" وحصلت على +${quest.points} نقطة! ⚜️`)
    setTimeout(() => {
      setCompletedQuestNotice(null)
    }, 4000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification for completed quest */}
      {completedQuestNotice && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#0c1e3d] px-5 py-3 text-sm font-bold text-emerald-300 shadow-2xl shadow-emerald-950/60 ring-2 ring-emerald-500/30 animate-in slide-in-from-bottom-5">
          <Sparkles className="size-5 text-amber-400 shrink-0" />
          <span>{completedQuestNotice}</span>
        </div>
      )}

      {/* Hero Welcome Banner with Official Scouting Logo */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1938] via-[#12234f] to-[#1a316c] p-6 text-white shadow-xl shadow-blue-950/20 sm:p-8 border border-blue-900/40">
        <div className="absolute -left-12 -top-12 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            
            {/* Top Tag & Logo */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-blue-200">
              <div className="flex size-11 items-center justify-center rounded-full bg-white p-1 shadow-md ring-2 ring-amber-400/60 overflow-hidden">
                <img src="/logo.png" alt="شعار الكشافة" className="h-full w-full object-contain rounded-full" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                <Calendar className="size-3.5 text-cyan-300" />
                {todayArabic}
              </span>
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-300 ring-1 ring-amber-400/30 font-bold">
                ⚜️ مرحلة المتقدم الكشفية
              </span>
            </div>

            {/* Personalized Greeting */}
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
                {currentUser ? (
                  <>
                    ازيك يا <span className="text-cyan-300">{currentUser.fullName}</span> 👋
                  </>
                ) : (
                  'أهلاً بك في منصة كشافة المتقدم'
                )}
              </h1>

              {/* Motivational Message */}
              {currentUser ? (
                <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 max-w-xl">
                  <Sparkles className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-300 mb-0.5">رسالتك الكشفية اليوم:</p>
                    <p className="text-xs font-semibold text-blue-100 leading-relaxed">
                      "كن مستعداً دائماً! مجموعتك الكشفية فخورة بك، والكشاف الصادق النافع يصنع الفارق بأخلاقه وهمته العالية أينما كان ⚜️"
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-blue-200 max-w-xl">
                  سجل انضمامك الآن لتشارك في التحديات والمسابقات وحصد الأوسمة الكشفية في المجموعة.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onNavigateQuizzes}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110 active:scale-95"
              >
                <BookOpenCheck className="size-4" />
                <span>بدء مسابقات اليوم</span>
              </button>
              <button
                onClick={onNavigateLeaderboard}
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95"
              >
                <Trophy className="size-4 text-amber-400" />
                <span>لوحة الشرف</span>
              </button>
              {!currentUser && (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95"
                >
                  <Sparkles className="size-4" />
                  <span>انضمام كشاف جديد</span>
                </button>
              )}
            </div>
          </div>

          {/* Level Progress Card */}
          {currentUser && (
            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:w-80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-200">المستوى الكشفي</span>
                  <p className="text-base font-black text-white">{currentLevel}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
                  <Crown className="size-6" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-blue-200">
                  <span>التقدم للرتبة التالية</span>
                  <span>{points} / {nextLevelGoal} نقطة</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-black/30 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, Math.round((points / nextLevelGoal) * 100)))}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-blue-200">
                <span>المستوى {levelIndex} من 5</span>
                <span className="text-amber-300">كن مستعداً دائماً ⚜️</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Points */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">إجمالي النقاط</span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Award className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{points}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Sparkles className="size-3.5" />
            <span>نقطة تميز كشفي</span>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">شعلة الالتزام</span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Flame className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {currentUser?.streak ?? 1} <span className="text-base font-semibold text-slate-500">أيام</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-600">
            <span>حماسك متواصل في المجموعة</span>
          </div>
        </div>

        {/* Card 3: Badges */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">الشارات والأوسمة</span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <ShieldCheck className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">
            {currentUser?.unlockedBadges?.length ?? 1} <span className="text-base font-semibold text-slate-400">/ 6</span>
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600">
            <span>شارات كشفية مكتسبة</span>
          </div>
        </div>

        {/* Card 4: Rank & Group */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">الرتبة الكشفية</span>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Trophy className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-xl font-black text-slate-900 truncate">
            {currentUser?.rank ?? 'كشاف مبتدئ'}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <span>كشافة مرحلة المتقدم</span>
          </div>
        </div>
      </section>

      {/* Main 2-column layout: Quests & Badges */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left 2 Cols: Interactive Daily Quests */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Daily Quests Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-amber-500" />
                <h2 className="text-xl font-black text-slate-900">مهام وتحديات اليوم الكشفية</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                أنجز المهام الكشفية اليومية لترقية رتبتك وجمع النقاط
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              تتجدد دورياً ⚡
            </span>
          </div>

          {/* Quests List */}
          <div className="space-y-3">
            {dailyQuests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <span className="text-4xl">⚡</span>
                <p className="mt-3 text-sm font-black text-slate-700">لم يضف القائد مهام اليوم بعد</p>
                <p className="mt-1 text-xs text-slate-400">
                  تابع هذه الصفحة — سيضيف القائد مهام كشفية جديدة قريباً!
                </p>
              </div>
            ) : (
              dailyQuests.map((quest) => {
                const isCompleted = currentUser?.completedTasks?.includes(quest.id)
                return (
                  <div
                    key={quest.id}
                    className={`group flex flex-col justify-between gap-4 rounded-3xl border p-5 transition-all sm:flex-row sm:items-center ${
                      isCompleted
                        ? 'border-emerald-200/80 bg-emerald-50/50'
                        : 'border-slate-200/80 bg-white shadow-sm hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                        }`}
                      >
                        {quest.iconName || '⚡'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {quest.category}
                          </span>
                          <span className="text-xs font-bold text-amber-600">
                            +{quest.points} نقطة
                          </span>
                        </div>
                        <h3 className="mt-1 text-sm font-black text-slate-900">{quest.title}</h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                          {quest.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 sm:self-center">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm">
                          <CheckCircle2 className="size-4" />
                          <span>تم الإنجاز ✓</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCompleteQuest(quest)}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 sm:w-auto"
                        >
                          <CheckCircle2 className="size-4" />
                          <span>إتمام المهمة الآن</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Col: Badges & Scout ID */}
        <div className="space-y-6">
          
          {/* Scout Badges Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-blue-600" />
                <h3 className="font-black text-slate-900">أوسمة وشارات الكشافة</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {currentUser?.unlockedBadges?.length || 1} من {DEFAULT_BADGES.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {DEFAULT_BADGES.map((b) => {
                const isUnlocked =
                  currentUser?.unlockedBadges?.includes(b.id) ||
                  points >= b.requiredPoints

                return (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between rounded-2xl p-3.5 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/60'
                        : 'bg-slate-50 border border-slate-200/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm ${
                          isUnlocked ? 'bg-white shadow' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {b.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-900">{b.title}</p>
                          {isUnlocked && (
                            <CheckCircle2 className="size-3.5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {b.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-left shrink-0 pe-1">
                      {isUnlocked ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          مكتسبة
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          {b.requiredPoints} نقطة
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scout Official ID Card with Logo */}
          {currentUser ? (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-5 text-emerald-600" />
                  <h3 className="font-black text-slate-900">بطاقة الكشاف الرسمية</h3>
                </div>
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  تعديل البيانات
                </button>
              </div>

              {/* Watermark Logo */}
              <div className="absolute left-4 bottom-4 size-20 opacity-10 pointer-events-none">
                <img src="/logo.png" alt="شعار الكشافة" className="h-full w-full object-contain" />
              </div>

              <div className="mt-4 space-y-3 text-xs font-medium text-slate-600 relative z-10">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-400 font-bold">كود الكشاف:</span>
                  <span className="font-mono font-bold text-blue-700">{currentUser.scoutCode}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-400 font-bold">الاسم الكامل:</span>
                  <span className="font-bold text-slate-900">{currentUser.fullName}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-400 font-bold">الرتبة الكشفية:</span>
                  <span className="font-bold text-slate-900">{currentUser.rank}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-400 font-bold">رقم الهاتف:</span>
                  <span className="font-mono font-bold text-slate-900">{currentUser.phone}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-400 font-bold">المنطقة / العنوان:</span>
                  <span className="font-bold text-slate-900">{currentUser.address}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-blue-300 bg-blue-50/50 p-6 text-center">
              <ShieldCheck className="mx-auto size-10 text-blue-500" />
              <h3 className="mt-3 font-black text-slate-900">سجل بياناتك الكشفية الآن</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                احصل على بطاقة الكشاف الرقمية وابدأ في احتساب درجاتك وأوسمتك في المجموعة.
              </p>
              <button
                onClick={onOpenAuth}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
              >
                <span>تسجيل كشاف جديد</span>
              </button>
            </div>
          )}

          {/* Quick Group Champions Preview */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" />
                <h3 className="font-black text-slate-900">أبطال المجموعة الكشفية</h3>
              </div>
              <button
                onClick={onNavigateLeaderboard}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                عرض الكل
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {leaderboardPreview.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-400">
                  لا يوجد كشافة مسجلين بعد. سجل أول حساب كشاف لتظهر في قائمة الشرف!
                </div>
              ) : (
                leaderboardPreview.slice(0, 3).map((scout, idx) => (
                  <div
                    key={scout.name}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900'
                            : 'bg-amber-700 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-900">{scout.name}</p>
                        <p className="text-[10px] text-slate-500">{scout.rank}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {scout.score} نقطة
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
