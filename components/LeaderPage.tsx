'use client'

import React, { useState } from 'react'
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Plus,
  Minus,
  Trash2,
  BookOpenCheck,
  Zap,
  Clock,
  KeyRound,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  FileText,
  HelpCircle,
  Trophy,
  ChevronDown,
  ChevronUp,
  Timer,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { DailyQuest, Quiz, QuizSubmission, ScoutUser } from '@/lib/types'

interface LeaderPageProps {
  quizzes: Quiz[]
  onAddQuiz: (quiz: Quiz) => void
  onDeleteQuiz: (quizId: string) => void
  allScouts: ScoutUser[]
  onAwardScoutPoints: (scoutId: string, amount: number) => void
  onDeleteScout: (scoutId: string) => void
  dailyQuests: DailyQuest[]
  onAddQuest: (quest: DailyQuest) => void
  onDeleteQuest: (questId: string) => void
  submissions?: QuizSubmission[]
}

const QUEST_ICONS = ['🪢', '🧭', '🩹', '⛺', '📜', '🌲', '🔥', '🤝', '⚡', '🎖️']

export function LeaderPage({
  quizzes,
  onAddQuiz,
  onDeleteQuiz,
  allScouts,
  onAwardScoutPoints,
  onDeleteScout,
  dailyQuests,
  onAddQuest,
  onDeleteQuest,
  submissions = [],
}: LeaderPageProps) {


  // Authentication State
  const [passcode, setPasscode] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [authError, setAuthError] = useState('')

  // Active Tab inside Leader Dashboard
  const [activeTab, setActiveTab] = useState<'scouts' | 'quizzes' | 'quests' | 'submissions'>('scouts')
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // Submissions Tab State
  const [selectedQuizIdForSubmissions, setSelectedQuizIdForSubmissions] = useState<string>('all')
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null)


  // Scout Search & Custom Points
  const [scoutSearch, setScoutSearch] = useState('')
  const [customPointsInput, setCustomPointsInput] = useState<Record<string, string>>({})

  // Helper for format datetime-local
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`
  }

  // Quiz Form State
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('مبادئ كشفية')
  const [quizType, setQuizType] = useState<'اختياري' | 'صح وغلط' | 'مقالي'>('اختياري')
  const [quizPoints, setQuizPoints] = useState(25)
  const [durationMinutes, setDurationMinutes] = useState(5)
  const [quizPassword, setQuizPassword] = useState('') // كلمة سر السؤال
  const [opensAt, setOpensAt] = useState(formatDateTimeLocal(new Date()))
  const [closesAt, setClosesAt] = useState(
    formatDateTimeLocal(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  )

  // Question details
  const [questionText, setQuestionText] = useState('')
  const [mcOptions, setMcOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [tfCorrectIndex, setTfCorrectIndex] = useState(0)
  const [modelAnswer, setModelAnswer] = useState('')
  const [quizFormError, setQuizFormError] = useState('')

  // Quest Form State
  const [questTitle, setQuestTitle] = useState('')
  const [questDescription, setQuestDescription] = useState('')
  const [questPoints, setQuestPoints] = useState(20)
  const [questCategory, setQuestCategory] = useState('ريادة وعقد')
  const [questIcon, setQuestIcon] = useState('🪢')
  const [questFormError, setQuestFormError] = useState('')

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg)
    setTimeout(() => {
      setFeedbackMsg(null)
    }, 3500)
  }

  // Handle Leader Login
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode.trim() === '1911') {
      setIsUnlocked(true)
      setAuthError('')
    } else {
      setAuthError('كلمة المرور غير صحيحة! هذه اللوحة مخصصة للقائد فقط.')
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
    setPasscode('')
  }

  // Handle Custom Points
  const handleApplyCustomPoints = (scoutId: string, scoutName: string) => {
    const val = parseInt(customPointsInput[scoutId] || '', 10)
    if (isNaN(val) || val === 0) {
      alert('يرجى كتابة عدد نقاط صحيح (سواء موجب للزيادة أو سالب للخصم).')
      return
    }
    onAwardScoutPoints(scoutId, val)
    setCustomPointsInput((prev) => ({ ...prev, [scoutId]: '' }))
    showFeedback(
      val > 0
        ? `تمت إضافة +${val} نقطة للكشاف ${scoutName} بنجاح!`
        : `تم خصم ${Math.abs(val)} نقطة من الكشاف ${scoutName}.`
    )
  }

  // Handle Delete Scout with confirmation
  const handleConfirmDeleteScout = (scoutId: string, scoutName: string) => {
    if (window.confirm(`هل أنت متأكد تماماً من حذف الكشاف "${scoutName}" نهائياً من المنصة؟`)) {
      onDeleteScout(scoutId)
      showFeedback(`تم حذف الكشاف ${scoutName} بنجاح من قاعدة البيانات.`)
    }
  }

  // Handle Add Quiz
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    setQuizFormError('')

    if (!quizTitle.trim()) {
      setQuizFormError('يرجى إدخال عنوان المسابقة أو التحدي.')
      return
    }
    if (!questionText.trim()) {
      setQuizFormError('يرجى كتابة نص السؤال.')
      return
    }

    const openDate = new Date(opensAt)
    const closeDate = new Date(closesAt)
    if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) {
      setQuizFormError('يرجى تحديد موعد الفتح وموعد الإغلاق بشكل صحيح.')
      return
    }
    if (closeDate <= openDate) {
      setQuizFormError('يجب أن يكون موعد الإغلاق بعد موعد الفتح!')
      return
    }

    let finalOptions: string[] = []
    let finalCorrectIndex = 0

    if (quizType === 'اختياري') {
      const trimmed = mcOptions.map((o) => o.trim())
      if (trimmed.some((o) => !o)) {
        setQuizFormError('يرجى كتابة الخيارات الأربعة كاملة.')
        return
      }
      finalOptions = trimmed
      finalCorrectIndex = correctIndex
    } else if (quizType === 'صح وغلط') {
      finalOptions = ['صح (صواب)', 'خطأ (غير صحيح)']
      finalCorrectIndex = tfCorrectIndex
    } else {
      if (!modelAnswer.trim()) {
        setQuizFormError('يرجى كتابة الإجابة النموذجية المعتمدة للسؤال المقالي.')
        return
      }
      finalOptions = []
      finalCorrectIndex = 0
    }

    const newQuiz: Quiz = {
      id: 'quiz-' + Date.now(),
      title: quizTitle.trim(),
      category: quizCategory.trim() || 'عام',
      type: quizType,
      points: Number(quizPoints) || 20,
      durationMinutes: Number(durationMinutes) || 5,
      password: quizPassword.trim() || undefined, // كلمة سر السؤال
      opensAt: openDate.toISOString(),
      closesAt: closeDate.toISOString(),
      questions: [
        {
          id: 'q-' + Date.now(),
          question: questionText.trim(),
          type: quizType,
          options: finalOptions,
          correctIndex: finalCorrectIndex,
          modelAnswer: quizType === 'مقالي' ? modelAnswer.trim() : undefined,
        },
      ],
    }

    onAddQuiz(newQuiz)

    // Reset Form
    setQuizTitle('')
    setQuestionText('')
    setMcOptions(['', '', '', ''])
    setCorrectIndex(0)
    setTfCorrectIndex(0)
    setModelAnswer('')
    setQuizPassword('')
    setQuizFormError('')
    showFeedback(`تمت إضافة السؤال بنجاح! ${quizPassword ? '(محمي بكلمة سر)' : ''}`)
  }

  // Handle Add Quest
  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault()
    setQuestFormError('')

    if (!questTitle.trim()) {
      setQuestFormError('يرجى كتابة عنوان المهمة.')
      return
    }
    if (!questDescription.trim()) {
      setQuestFormError('يرجى كتابة تفاصيل المهمة.')
      return
    }

    const newQuest: DailyQuest = {
      id: 'quest-' + Date.now(),
      title: questTitle.trim(),
      description: questDescription.trim(),
      points: Number(questPoints) || 15,
      category: questCategory.trim() || 'عام',
      iconName: questIcon,
    }

    onAddQuest(newQuest)
    setQuestTitle('')
    setQuestDescription('')
    setQuestPoints(20)
    setQuestFormError('')
    showFeedback('تمت إضافة المهمة الكشفية اليومية بنجاح!')
  }

  const updateMcOption = (index: number, val: string) => {
    setMcOptions((prev) => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  // Filter scouts by search
  const filteredScouts = allScouts.filter((s) => {
    const q = scoutSearch.trim().toLowerCase()
    return (
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.scoutCode.toLowerCase().includes(q)
    )
  })

  // 1. LOCKED VIEW: ENTER LEADER PASSWORD (1911)
  if (!isUnlocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-10 animate-in fade-in">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-900/40 bg-gradient-to-b from-[#0e1a38] to-[#070f24] p-8 text-center text-white shadow-2xl shadow-blue-950/60">
          <div className="absolute -left-12 -top-12 size-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-12 -bottom-12 size-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Scout Logo */}
          <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-white p-2 shadow-2xl ring-4 ring-amber-400/60 overflow-hidden">
            <img src="/logo.png" alt="شعار الكشافة" className="h-full w-full object-contain rounded-full" />
          </div>

          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
            <Lock className="size-6" />
          </div>

          <h1 className="text-2xl font-black text-white">لوحة تحكم الليدر 🛡️</h1>
          <p className="mt-1.5 text-xs text-blue-200 leading-relaxed">
            المنطقة الإدارية المخصصة للقائد العام لإدارة المسابقات، الأسئلة، والتحكم بنقاط الكشافة والمشاركين.
          </p>

          {authError && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/15 p-3 text-xs font-semibold text-red-200">
              <AlertCircle className="size-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-300">
                أدخل كلمة مرور الليدر للدخول
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 text-center text-lg font-mono tracking-widest text-white placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
                <KeyRound className="absolute left-3.5 top-3.5 size-5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-600/30 transition hover:brightness-110 active:scale-95"
            >
              <Unlock className="size-4" />
              <span>تأكيد الدخول للوحة التحكم</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 2. UNLOCKED LEADER DASHBOARD
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-500/50 bg-[#0c1e3d] px-5 py-3 text-sm font-bold text-emerald-300 shadow-2xl shadow-emerald-950/70 ring-2 ring-emerald-500/30 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Leader Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1938] via-[#12234f] to-[#1a3575] p-6 text-white shadow-xl border border-blue-900/40">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-white p-1.5 shadow-md ring-2 ring-amber-400/60 shrink-0 overflow-hidden">
              <img src="/logo.png" alt="شعار الكشافة" className="h-full w-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40">
                  👑 قيادة مجموعة المتقدم
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  متصل كليدر
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black">لوحة تحكم الليدر الشاملة 🛡️</h1>
              <p className="text-xs text-blue-200">
                التحكم بالنقاط (زيادة ونقصان)، حذف المشاركين، وإضافة الأسئلة وتحديد باسورد ومواعيد كل سؤال
              </p>
            </div>
          </div>

          <button
            onClick={handleLock}
            className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/15 px-4 py-2.5 text-xs font-bold text-red-200 transition hover:bg-red-500/25 active:scale-95 shrink-0 self-start sm:self-center"
          >
            <Lock className="size-4 text-red-400" />
            <span>قفل اللوحة والخروج</span>
          </button>


        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-[#091228] p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('scouts')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition ${
            activeTab === 'scouts'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="size-4" />
          <span>المشاركون والنقاط ({allScouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition ${
            activeTab === 'quizzes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpenCheck className="size-4" />
          <span>إضافة وإدارة الأسئلة ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quests')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition ${
            activeTab === 'quests'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="size-4" />
          <span>مهام اليوم ({dailyQuests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition ${
            activeTab === 'submissions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="size-4 text-amber-400" />
          <span>سجل الإجابات والترتيب ({submissions.length})</span>
        </button>
      </div>


      {/* ================= TAB 1: SCOUTS & POINTS ================= */}
      {activeTab === 'scouts' && (
        <div className="space-y-6">
          
          {/* Search Bar */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                type="text"
                value={scoutSearch}
                onChange={(e) => setScoutSearch(e.target.value)}
                placeholder="ابحث عن مشارك بالاسم، كود الكشاف، أو رقم الهاتف..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-4 ps-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            </div>
            <div className="text-xs font-bold text-slate-500">
              إجمالي المشاركين: {filteredScouts.length} كشاف
            </div>
          </div>

          {/* Scouts List */}
          {filteredScouts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users className="mx-auto size-12 text-slate-300" />
              <h3 className="mt-3 text-base font-black text-slate-800">لا يوجد مشاركون مسجلون حالياً</h3>
              <p className="mt-1 text-xs text-slate-500">
                عندما يقوم أي كشاف بإنشاء حساب جديد، سيظهر مباشرة هنا لتتمكن من زيادة أو إنقاص نقاطه أو حذفه.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredScouts.map((scout) => (
                <div
                  key={scout.id}
                  className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                >
                  {/* Scout Info */}
                  <div className="flex items-center gap-3">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-inner ring-2 ring-slate-200">
                      {scout.avatar || '⚜️'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base">{scout.fullName}</h3>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {scout.rank}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        كود: <span className="font-mono font-bold text-slate-700">{scout.scoutCode}</span> • هاتف:{' '}
                        <span className="font-mono text-slate-700">{scout.phone}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-300/40">
                          النقاط الحالية: {scout.points} نقطة
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add / Deduct Points / Delete */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Quick Add Points */}
                    <div className="flex items-center gap-1 rounded-2xl bg-emerald-50 p-1 border border-emerald-200">
                      <span className="px-1.5 text-[10px] font-bold text-emerald-800">زيادة:</span>
                      <button
                        onClick={() => {
                          onAwardScoutPoints(scout.id, 5)
                          showFeedback(`تمت إضافة +5 نقاط لـ ${scout.fullName}`)
                        }}
                        className="rounded-xl bg-emerald-600 px-2 py-1 text-xs font-black text-white hover:bg-emerald-700"
                        title="إضافة 5 نقاط"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => {
                          onAwardScoutPoints(scout.id, 10)
                          showFeedback(`تمت إضافة +10 نقاط لـ ${scout.fullName}`)
                        }}
                        className="rounded-xl bg-emerald-600 px-2 py-1 text-xs font-black text-white hover:bg-emerald-700"
                        title="إضافة 10 نقاط"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => {
                          onAwardScoutPoints(scout.id, 25)
                          showFeedback(`تمت إضافة +25 نقطة لـ ${scout.fullName}`)
                        }}
                        className="rounded-xl bg-emerald-600 px-2 py-1 text-xs font-black text-white hover:bg-emerald-700"
                        title="إضافة 25 نقطة"
                      >
                        +25
                      </button>
                    </div>

                    {/* Quick Deduct Points */}
                    <div className="flex items-center gap-1 rounded-2xl bg-rose-50 p-1 border border-rose-200">
                      <span className="px-1.5 text-[10px] font-bold text-rose-800">خصم:</span>
                      <button
                        onClick={() => {
                          onAwardScoutPoints(scout.id, -5)
                          showFeedback(`تم خصم 5 نقاط من ${scout.fullName}`)
                        }}
                        className="rounded-xl bg-rose-600 px-2 py-1 text-xs font-black text-white hover:bg-rose-700"
                        title="خصم 5 نقاط"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => {
                          onAwardScoutPoints(scout.id, -10)
                          showFeedback(`تم خصم 10 نقاط من ${scout.fullName}`)
                        }}
                        className="rounded-xl bg-rose-600 px-2 py-1 text-xs font-black text-white hover:bg-rose-700"
                        title="خصم 10 نقاط"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => {
                          onAwardScoutPoints(scout.id, -25)
                          showFeedback(`تم خصم 25 نقطة من ${scout.fullName}`)
                        }}
                        className="rounded-xl bg-rose-600 px-2 py-1 text-xs font-black text-white hover:bg-rose-700"
                        title="خصم 25 نقطة"
                      >
                        -25
                      </button>
                    </div>

                    {/* Custom Points Input */}
                    <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1">
                      <input
                        type="number"
                        placeholder="±نقاط"
                        value={customPointsInput[scout.id] || ''}
                        onChange={(e) =>
                          setCustomPointsInput({
                            ...customPointsInput,
                            [scout.id]: e.target.value,
                          })
                        }
                        className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-800 focus:outline-none"
                      />
                      <button
                        onClick={() => handleApplyCustomPoints(scout.id, scout.fullName)}
                        className="rounded-xl bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-700"
                        title="تطبيق النقاط المخصصة"
                      >
                        تطبيق
                      </button>
                    </div>

                    {/* Delete Scout Button */}
                    <button
                      onClick={() => handleConfirmDeleteScout(scout.id, scout.fullName)}
                      className="flex size-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                      title="حذف هذا المشارك نهائياً"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: QUESTIONS & QUIZZES ================= */}
      {activeTab === 'quizzes' && (
        <div className="space-y-8">
          
          {/* Add Question Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  إضافة سؤال / مسابقة كشفية جديدة ✍️
                </h3>
                <p className="text-xs text-slate-500">
                  يمكنك إضافة سؤال اختياري أو صح وغلط أو مقالي، وتحديد كلمة سر للدخول ومواعيد الفتح والغلق
                </p>
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">
                تحكم القائد
              </span>
            </div>

            {quizFormError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle className="size-4 shrink-0 text-red-500" />
                <span>{quizFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuiz} className="mt-5 space-y-4">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    عنوان السؤال / التحدي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="مثال: تحدي تقاليد التحية الكشفية"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    التصنيف الكشفي
                  </label>
                  <input
                    type="text"
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value)}
                    placeholder="مثال: ريادة وعقد، تقاليد، إسعافات"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Type & Points & Duration */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    نوع السؤال <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value as 'اختياري' | 'صح وغلط' | 'مقالي')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="اختياري">اختيار من متعدد (٤ اختيارات)</option>
                    <option value="صح وغلط">صح أم خطأ (نعم / لا)</option>
                    <option value="مقالي">سؤال مقالي (كتابة وشرح) ✍️</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    النقاط المكتسبة
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={quizPoints}
                    onChange={(e) => setQuizPoints(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    المدة بالدقائق
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* QUESTION PASSWORD (عشان ندخل ع السؤال لازم باسورد ده انا احطو برضو) */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                  <KeyRound className="size-4 text-amber-600" />
                  <span>كلمة مرور السؤال (باسورد لدخول السؤال):</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-700">
                  إذا وضعت كلمة سر هنا، لن يتمكن الكشاف من فتح السؤال والإجابة عليه إلا بعد إدخال هذه الكلمة التي تعطيها له. (اتركه فارغاً إذا كنت تريده متاحاً للجميع بدون باسورد).
                </p>
                <input
                  type="text"
                  value={quizPassword}
                  onChange={(e) => setQuizPassword(e.target.value)}
                  placeholder="مثال: scout2026 أو اتركه فارغاً بدون باسورد"
                  className="mt-2 w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* OPEN & CLOSE SCHEDULE DATES (كل سؤال أحدد معاد فتح وغلق ليه) */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                  <Clock className="size-4 text-blue-600" />
                  <span>مواعيد الإتاحة (تحديد ميعاد الفتح والغلق):</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-blue-800">
                      تاريخ ووقت الفتح (بداية السؤال)
                    </label>
                    <input
                      type="datetime-local"
                      value={opensAt}
                      onChange={(e) => setOpensAt(e.target.value)}
                      className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-blue-800">
                      تاريخ ووقت الغلق (الديدلاين النهائي)
                    </label>
                    <input
                      type="datetime-local"
                      value={closesAt}
                      onChange={(e) => setClosesAt(e.target.value)}
                      className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  نص السؤال الكشفي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="اكتب نص السؤال بدقة هنا..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* OPTIONS FOR MCQ */}
              {quizType === 'اختياري' && (
                <div className="space-y-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      الخيارات الأربعة (حدد الإجابة الصحيحة بالضغط على الزر):
                    </label>
                    <span className="text-[11px] font-bold text-emerald-600">
                      ✓ الزر الأخضر هو الإجابة الصحيحة
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mcOptions.map((opt, idx) => {
                      const isCorrect = correctIndex === idx
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 rounded-xl p-2 transition border ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setCorrectIndex(idx)}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black transition shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <Check className="size-3.5 stroke-[3]" />
                                <span>الإجابة الصحيحة</span>
                              </>
                            ) : (
                              <span>تحديد كصحيحة</span>
                            )}
                          </button>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateMcOption(idx, e.target.value)}
                            placeholder={`نص الاختيار رقم ${idx + 1}`}
                            className="w-full bg-transparent px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* OPTIONS FOR TRUE / FALSE */}
              {quizType === 'صح وغلط' && (
                <div className="space-y-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700">
                    حدد الإجابة الصحيحة للسؤال (صح أم خطأ):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTfCorrectIndex(0)}
                      className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-black transition border ${
                        tfCorrectIndex === 0
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Check className="size-4" />
                      <span>صح (صواب) هي الإجابة الصحيحة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTfCorrectIndex(1)}
                      className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-black transition border ${
                        tfCorrectIndex === 1
                          ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-2 ring-rose-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <X className="size-4" />
                      <span>خطأ (غير صحيح) هي الإجابة الصحيحة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ESSAY MODEL ANSWER */}
              {quizType === 'مقالي' && (
                <div className="space-y-2 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <FileText className="size-4 text-blue-600" />
                    <span>الإجابة النموذجية المعتمدة من القائد (تظهر للكشاف بعد الحل):</span>
                  </div>
                  <textarea
                    rows={3}
                    value={modelAnswer}
                    onChange={(e) => setModelAnswer(e.target.value)}
                    placeholder="اكتب هنا الشرح الكامل أو الإجابة النموذجية الصحيحة للمقارنة..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110 active:scale-95"
              >
                <Plus className="size-4" />
                <span>حفظ وإضافة السؤال للويب فورياً</span>
              </button>
            </form>
          </div>

          {/* List of current questions */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800">
              قائمة المسابقات والأسئلة الحالية المتاحة ({quizzes.length})
            </h4>

            {quizzes.length === 0 ? (
              <p className="text-xs text-slate-500">لا توجد أسئلة مضافة حالياً.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{quiz.title}</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {quiz.type}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          +{quiz.points} نقطة
                        </span>
                        {quiz.password ? (
                          <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                            <KeyRound className="size-3" />
                            <span>باسورد: {quiz.password}</span>
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            بدون باسورد
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {quiz.questions?.[0]?.question}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>يفتح: {new Date(quiz.opensAt).toLocaleString('ar-EG')}</span>
                        <span>•</span>
                        <span>يغلق: {new Date(quiz.closesAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف مسابقة "${quiz.title}"؟`)) {
                          onDeleteQuiz(quiz.id)
                          showFeedback(`تم حذف مسابقة "${quiz.title}".`)
                        }
                      }}
                      className="flex size-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white shrink-0 self-end sm:self-center"
                      title="حذف هذا السؤال"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DAILY QUESTS ================= */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          
          {/* Add Quest Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              إضافة مهمة كشفية يومية جديدة ⚡
            </h3>

            {questFormError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle className="size-4 shrink-0 text-red-500" />
                <span>{questFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuest} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">عنوان المهمة</label>
                <input
                  type="text"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="مثال: تطبيق عقدة الحطاب بالحبل الكشفي"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">تفاصيل ومطلوب المهمة</label>
                <textarea
                  rows={2}
                  value={questDescription}
                  onChange={(e) => setQuestDescription(e.target.value)}
                  placeholder="اشرح المطلوب للكشاف لإتمام هذه المهمة..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">التصنيف</label>
                  <input
                    type="text"
                    value={questCategory}
                    onChange={(e) => setQuestCategory(e.target.value)}
                    placeholder="مثال: ريادة وعقد، تقاليد"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">النقاط</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={questPoints}
                    onChange={(e) => setQuestPoints(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">أيقونة المهمة</label>
                <div className="flex flex-wrap gap-2">
                  {QUEST_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setQuestIcon(ic)}
                      className={`flex size-9 items-center justify-center rounded-xl text-base transition ${
                        questIcon === ic
                          ? 'bg-amber-500 text-white scale-110 shadow'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition"
              >
                <Plus className="size-4" />
                <span>إضافة المهمة لصفحة الهوم فورياً</span>
              </button>
            </form>
          </div>

          {/* Current Quests */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-800">
              مهام اليوم الحالية ({dailyQuests.length})
            </h4>

            {dailyQuests.length === 0 ? (
              <p className="text-xs text-slate-500">لا توجد مهام يومية مضافة حتى الآن.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {dailyQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quest.iconName || '⚡'}</span>
                      <div>
                        <p className="text-sm font-black text-slate-900">{quest.title}</p>
                        <p className="text-xs text-slate-500">{quest.description}</p>
                        <span className="mt-1 inline-block text-[10px] font-bold text-amber-700">
                          +{quest.points} نقطة • {quest.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteQuest(quest.id)}
                      className="flex size-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white shrink-0"
                      title="حذف هذه المهمة"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: QUIZ SUBMISSIONS & RANKINGS ================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Header Card & Filter */}
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 border border-amber-200">
                🏆 سجل الإجابات والأسبقية
              </span>
              <h3 className="mt-2 text-xl font-black text-slate-900">ترتيب الكشافة في حل الأسئلة</h3>
              <p className="mt-1 text-xs text-slate-500">
                متابعة دقيقة لمواعيد إرسال الإجابات، ترتيب الفائزين (الأول، الثاني، الثالث...)، وتفاصيل الإجابات الصحيحة والخاطئة.
              </p>
            </div>

            {/* Quiz Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 shrink-0">فلترة بالسؤال:</label>
              <select
                value={selectedQuizIdForSubmissions}
                onChange={(e) => setSelectedQuizIdForSubmissions(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="all">جميع الأسئلة ({submissions.length} إجابة)</option>
                {quizzes.map((q) => {
                  const count = submissions.filter((s) => s.quizId === q.id).length
                  return (
                    <option key={q.id} value={q.id}>
                      {q.title} ({count} حل)
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {(() => {
            const filtered = submissions
              .filter((s) =>
                selectedQuizIdForSubmissions === 'all'
                  ? true
                  : s.quizId === selectedQuizIdForSubmissions
              )
              .sort(
                (a, b) =>
                  new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
              )

            if (filtered.length === 0) {
              return (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <Trophy className="mx-auto size-12 text-slate-300" />
                  <h4 className="mt-4 text-base font-bold text-slate-800">لا توجد إجابات مسجلة حتى الآن</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    عندما يقوم الكشافة بحل الأسئلة، ستظهر إجاباتهم وترتيبهم بالأسبقية هنا لحظياً.
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-3">
                {filtered.map((sub, idx) => {
                  const isExpanded = expandedSubmissionId === sub.id
                  const isFirst = idx === 0
                  const isSecond = idx === 1
                  const isThird = idx === 2

                  const rankTitle = isFirst
                    ? '🥇 المركز الأول (الأسرع حلاً)'
                    : isSecond
                    ? '🥈 المركز الثاني'
                    : isThird
                    ? '🥉 المركز الثالث'
                    : `المركز ${idx + 1}`

                  return (
                    <div
                      key={sub.id}
                      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md ${
                        isFirst
                          ? 'border-amber-300 ring-1 ring-amber-400/40'
                          : isSecond
                          ? 'border-slate-300'
                          : isThird
                          ? 'border-amber-600/40'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Scout and Rank info */}
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`flex size-11 items-center justify-center rounded-2xl text-sm font-black shrink-0 ${
                              isFirst
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 ring-2 ring-amber-300'
                                : isSecond
                                ? 'bg-slate-200 text-slate-900 ring-2 ring-slate-300'
                                : isThird
                                ? 'bg-amber-700 text-white ring-2 ring-amber-600'
                                : 'bg-slate-100 text-slate-700 font-bold'
                            }`}
                          >
                            {idx + 1}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900">{sub.userName}</h4>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                  isFirst
                                    ? 'bg-amber-100 text-amber-900'
                                    : isSecond
                                    ? 'bg-slate-100 text-slate-700'
                                    : isThird
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {rankTitle}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              كود: <strong className="font-mono text-slate-800">{sub.scoutCode}</strong> • {sub.userRank} • المسابقة:{' '}
                              <strong className="text-blue-600">{sub.quizTitle}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Timing, Score & Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="rounded-2xl bg-slate-50 px-3.5 py-2 text-right border border-slate-100">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Timer className="size-3.5 text-blue-600" />
                              <span>
                                {sub.timeTakenSeconds < 60
                                  ? `${sub.timeTakenSeconds} ثانية`
                                  : `${Math.floor(sub.timeTakenSeconds / 60)} دقيقة و ${sub.timeTakenSeconds % 60} ثانية`}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(sub.submittedAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-emerald-50 px-3.5 py-2 text-center border border-emerald-200">
                            <span className="text-xs font-black text-emerald-800">
                              +{sub.earnedPoints} / {sub.maxPoints} نقطة
                            </span>
                          </div>

                          {/* Quick Bonus points for fast solver */}
                          <button
                            onClick={() => {
                              onAwardScoutPoints(sub.userId, 5)
                              setFeedbackMsg(`تم منح 5 نقاط إضافية للكشاف ${sub.userName} لسرعة الحل! ⚡`)
                              setTimeout(() => setFeedbackMsg(null), 3500)
                            }}
                            className="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-800 hover:bg-amber-100 active:scale-95 transition"
                            title="مكافأة سرعة +5 نقاط"
                          >
                            +5 نقاط سرعة ⚡
                          </button>

                          {/* Toggle Details Button */}
                          <button
                            onClick={() =>
                              setExpandedSubmissionId(isExpanded ? null : sub.id)
                            }
                            className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                          >
                            <span>{isExpanded ? 'إخفاء الإجابات' : 'عرض الإجابات'}</span>
                            {isExpanded ? (
                              <ChevronUp className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Question Answers Details */}
                      {isExpanded && sub.answers && sub.answers.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-3">
                          <p className="text-xs font-black text-slate-700">تفاصيل إجابات الكشاف على الأسئلة:</p>
                          <div className="space-y-2.5">
                            {sub.answers.map((ans, aIdx) => (
                              <div
                                key={aIdx}
                                className={`rounded-2xl p-4 text-xs border ${
                                  ans.isCorrect
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-bold text-slate-900">
                                    سؤال {aIdx + 1}: {ans.questionText}
                                  </p>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black shrink-0 ${
                                      ans.isCorrect
                                        ? 'bg-emerald-200/60 text-emerald-800'
                                        : 'bg-rose-200/60 text-rose-800'
                                    }`}
                                  >
                                    {ans.isCorrect ? (
                                      <>
                                        <CheckCircle className="size-3" />
                                        <span>إجابة صحيحة</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="size-3" />
                                        <span>إجابة خاطئة</span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                <div className="mt-2 space-y-1 text-[11px]">
                                  <p>
                                    إجابة الكشاف:{' '}
                                    <strong className="font-semibold text-slate-800">
                                      {ans.userAnswerLabel || String(ans.userAnswer)}
                                    </strong>
                                  </p>
                                  {!ans.isCorrect && (
                                    <p className="text-emerald-700">
                                      الإجابة الصحيحة المعتمدة:{' '}
                                      <strong>
                                        {ans.correctAnswerLabel || String(ans.correctAnswer)}
                                      </strong>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}
    </div>

  )
}
