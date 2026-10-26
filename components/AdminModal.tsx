'use client'

import React, { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
  Sparkles,
  BookOpenCheck,
  Calendar,
  Clock,
  HelpCircle,
  Check,
  Zap,
  FileText,
} from 'lucide-react'
import { DailyQuest, Quiz, ScoutUser } from '@/lib/types'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  quizzes: Quiz[]
  onAddQuiz: (quiz: Quiz) => void
  onDeleteQuiz: (quizId: string) => void
  allScouts: ScoutUser[]
  onAwardScoutPoints: (scoutId: string, amount: number) => void
  onDeleteScout: (scoutId: string) => void
  dailyQuests: DailyQuest[]
  onAddQuest: (quest: DailyQuest) => void
  onDeleteQuest: (questId: string) => void
}

const QUEST_ICONS = ['🪢', '🧭', '🩹', '⛺', '📜', '🌲', '🔥', '🤝', '⚡', '🎖️']

export function AdminModal({
  isOpen,
  onClose,
  quizzes,
  onAddQuiz,
  onDeleteQuiz,
  allScouts,
  onAwardScoutPoints,
  onDeleteScout,
  dailyQuests,
  onAddQuest,
  onDeleteQuest,
}: AdminModalProps) {
  const [passcode, setPasscode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'quizzes' | 'quests' | 'scouts'>('quizzes')

  // Helper function to format datetime-local string (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`
  }

  // Quiz Form state
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('مبادئ كشفية')
  const [quizType, setQuizType] = useState<'اختياري' | 'صح وغلط' | 'مقالي'>('اختياري')
  const [quizPoints, setQuizPoints] = useState(25)
  const [durationMinutes, setDurationMinutes] = useState(5)

  // Deadlines (Open & Close Dates)
  const now = new Date()
  const defaultClose = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const [opensAt, setOpensAt] = useState(formatDateTimeLocal(now))
  const [closesAt, setClosesAt] = useState(formatDateTimeLocal(defaultClose))

  // Question details
  const [questionText, setQuestionText] = useState('')
  // For Multiple Choice: 4 options
  const [mcOptions, setMcOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  // For True / False: 0 = صح, 1 = خطأ
  const [tfCorrectIndex, setTfCorrectIndex] = useState(0)
  // For Essay Questions: Model Answer
  const [modelAnswer, setModelAnswer] = useState('')

  // Daily Quest Form state
  const [questTitle, setQuestTitle] = useState('')
  const [questDescription, setQuestDescription] = useState('')
  const [questPoints, setQuestPoints] = useState(20)
  const [questCategory, setQuestCategory] = useState('ريادة وعقد')
  const [questIcon, setQuestIcon] = useState('🪢')

  if (!isOpen) return null

  // Unlock Admin portal: Passcode is verified silently without leaking!
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode.trim() === '1911' || passcode.trim() === 'admin') {
      setUnlocked(true)
      setError('')
    } else {
      setError('رمز المرور السري غير صحيح! يرجى إدخال الرمز الصحيح الخاص بالقائد.')
    }
  }

  // Handle Creating Quiz
  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!quizTitle.trim()) {
      setError('يرجى إدخال عنوان المسابقة.')
      return
    }

    if (!questionText.trim()) {
      setError('يرجى كتابة نص السؤال.')
      return
    }

    // Validate Dates
    const openDate = new Date(opensAt)
    const closeDate = new Date(closesAt)
    if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) {
      setError('يرجى تحديد موعد الفتح وموعد الإغلاق بشكل صحيح.')
      return
    }
    if (closeDate <= openDate) {
      setError('يجب أن يكون موعد الإغلاق بعد موعد الفتح!')
      return
    }

    let finalOptions: string[] = []
    let finalCorrectIndex = 0

    if (quizType === 'اختياري') {
      const trimmedOptions = mcOptions.map((opt) => opt.trim())
      if (trimmedOptions.some((opt) => !opt)) {
        setError('يرجى ملء جميع الاختيارات الأربعة للسؤال الاختياري.')
        return
      }
      finalOptions = trimmedOptions
      finalCorrectIndex = correctIndex
    } else if (quizType === 'صح وغلط') {
      finalOptions = ['صح (صواب)', 'خطأ (غير صحيح)']
      finalCorrectIndex = tfCorrectIndex
    } else {
      // Essay question
      if (!modelAnswer.trim()) {
        setError('يرجى كتابة الإجابة النموذجية المعتمدة للسؤال المقالي.')
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
      opensAt: openDate.toISOString(),
      closesAt: closeDate.toISOString(),
      questions: [
        {
          id: 'q-' + Date.now(),
          question: questionText.trim(),
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
    setError('')
    alert('تمت إضافة السؤال بنجاح وأصبح متاحاً بالمواعيد المحددة!')
  }

  // Handle Creating Daily Quest
  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!questTitle.trim()) {
      setError('يرجى كتابة عنوان المهمة الكشفية.')
      return
    }

    if (!questDescription.trim()) {
      setError('يرجى كتابة تفاصيل المهمة الكشفية وما هو المطلوب.')
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
    setError('')
    alert('تمت إضافة المهمة الكشفية اليومية بنجاح وستظهر الآن في صفحة الهوم للكشافة!')
  }

  const updateMcOption = (index: number, value: string) => {
    setMcOptions((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0d1836] text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#091228] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/30 text-cyan-300 ring-1 ring-cyan-400/30">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">بوابة القائد والمشرف الكشفي</h2>
              <p className="text-xs text-blue-200">إدارة المسابقات والمهام اليومية ودرجات الكشافة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6">
          {!unlocked ? (
            /* PASSCODE FORM - PURE PASSWORD (NO LEAKED HINTS) */
            <form onSubmit={handleUnlock} className="mx-auto max-w-sm py-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 ring-1 ring-white/20">
                <Lock className="size-8" />
              </div>
              <h3 className="text-lg font-black text-white">تسجيل دخول القائد</h3>
              <p className="mt-1 text-xs text-slate-400">
                أدخل رمز الأمان السري المخصص لقيادة مجموعة المتقدم الكشفية
              </p>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/20 p-3 text-xs text-red-300 border border-red-500/30">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="mt-4 w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 text-center text-base font-mono tracking-widest text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none"
              />

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition"
              >
                تأكيد الدخول الآمن
              </button>
            </form>
          ) : (
            /* UNLOCKED ADMIN DASHBOARD */
            <div className="space-y-6">
              
              {/* 3 Tabs */}
              <div className="flex border-b border-white/10 bg-[#091228] p-1 rounded-2xl">
                <button
                  onClick={() => {
                    setActiveTab('quizzes')
                    setError('')
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                    activeTab === 'quizzes'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpenCheck className="size-3.5" />
                  <span>الأسئلة والمسابقات ({quizzes.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('quests')
                    setError('')
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                    activeTab === 'quests'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="size-3.5" />
                  <span>مهام اليوم ({dailyQuests.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('scouts')
                    setError('')
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                    activeTab === 'scouts'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="size-3.5" />
                  <span>الكشافة ({allScouts.length})</span>
                </button>
              </div>

              {/* TAB 1: ADD QUIZ (MCQ + TRUE/FALSE + ESSAY) */}
              {activeTab === 'quizzes' && (
                <div className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-500/20 p-3 text-xs text-red-300 border border-red-500/30">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateQuiz} className="space-y-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-cyan-300">إضافة سؤال كشفي جديد</h3>
                      <span className="text-[11px] text-slate-400">اختياري، صح وغلط، أو مقالي</span>
                    </div>

                    {/* Title & Category */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">عنوان المسابقة</label>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          placeholder="مثال: مهارات التخييم ونصب الخيام"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">التصنيف الكشفي</label>
                        <input
                          type="text"
                          value={quizCategory}
                          onChange={(e) => setQuizCategory(e.target.value)}
                          placeholder="مثال: ريادة وعقد، إسعافات، تقاليد"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Question Type & Points & Duration */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">نوع السؤال</label>
                        <select
                          value={quizType}
                          onChange={(e) => setQuizType(e.target.value as 'اختياري' | 'صح وغلط' | 'مقالي')}
                          className="w-full rounded-xl border border-white/10 bg-[#132247] p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="اختياري">اختيار من متعدد (٤ خيارات)</option>
                          <option value="صح وغلط">صح أم خطأ (نعم / لا)</option>
                          <option value="مقالي">سؤال مقالي (كتابة وشرح) ✍️</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">نقاط المكافأة</label>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={quizPoints}
                          onChange={(e) => setQuizPoints(Number(e.target.value))}
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">المدة بالدقائق</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* DEADLINE DATES: Open & Close */}
                    <div className="rounded-xl bg-blue-950/40 p-3 border border-blue-800/40 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Clock className="size-4" />
                        <span>موعد وديدلاين إتاحة المسابقة (مواعيد الفتح والإغلاق):</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-slate-300">
                            تاريخ ووقت الفتح (البداية)
                          </label>
                          <input
                            type="datetime-local"
                            value={opensAt}
                            onChange={(e) => setOpensAt(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-slate-300">
                            تاريخ ووقت الإغلاق (الديدلاين النهائي)
                          </label>
                          <input
                            type="datetime-local"
                            value={closesAt}
                            onChange={(e) => setClosesAt(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question text */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">نص السؤال</label>
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="اكتب نص السؤال الكشفي بدقة هنا..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* OPTIONS ACCORDING TO QUESTION TYPE */}
                    {quizType === 'اختياري' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            الخيارات الأربعة (حدد الإجابة الصحيحة بالضغط عليها):
                          </label>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            ✓ الخيار الأخضر هو الإجابة الصحيحة
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
                                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                                    : 'bg-white/5 border-white/10'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setCorrectIndex(idx)}
                                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black transition shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-500 text-slate-950 shadow'
                                      : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'
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
                                  className="w-full bg-transparent px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {quizType === 'صح وغلط' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">
                          حدد الإجابة النموذجية للسؤال (صح أم خطأ):
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setTfCorrectIndex(0)}
                            className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-black transition border ${
                              tfCorrectIndex === 0
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-400/50'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
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
                                ? 'bg-rose-600 text-white border-rose-400 shadow-md ring-2 ring-rose-400/50'
                                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <X className="size-4" />
                            <span>خطأ (غير صحيح) هي الإجابة الصحيحة</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {quizType === 'مقالي' && (
                      <div className="space-y-2 rounded-xl bg-blue-950/30 p-3 border border-blue-800/30">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                          <FileText className="size-4" />
                          <span>الإجابة النموذجية المعتمدة من القائد (تظهر للكشاف بعد الإجابة):</span>
                        </div>
                        <textarea
                          rows={3}
                          value={modelAnswer}
                          onChange={(e) => setModelAnswer(e.target.value)}
                          placeholder="اكتب هنا الشرح أو الإجابة النموذجية الكاملة للسؤال المقالي ليقارن بها الكشاف إجابته..."
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-95 transition"
                    >
                      <Plus className="size-4" />
                      <span>حفظ وإضافة السؤال فورياً</span>
                    </button>
                  </form>

                  {/* List of current quizzes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400">المسابقات والأسئلة الحالية</h4>
                    {quizzes.length === 0 ? (
                      <p className="text-xs text-slate-500">لا توجد مسابقات حالياً.</p>
                    ) : (
                      quizzes.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{q.title}</span>
                              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">
                                {q.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {q.category} • {q.points} نقطة • يغلق:{' '}
                              {new Date(q.closesAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <button
                            onClick={() => onDeleteQuiz(q.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10"
                            title="حذف المسابقة"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ADD & MANAGE DAILY QUESTS */}
              {activeTab === 'quests' && (
                <div className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-500/20 p-3 text-xs text-red-300 border border-red-500/30">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateQuest} className="space-y-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-amber-300">إضافة مهمة كشفية يومية جديدة</h3>
                      <span className="text-[11px] text-slate-400">ستظهر في صفحة الهوم للكشافة</span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">عنوان المهمة</label>
                      <input
                        type="text"
                        value={questTitle}
                        onChange={(e) => setQuestTitle(e.target.value)}
                        placeholder="مثال: تطبيق العقدة الوتدية بحبل كشفي"
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-300">وصف ومطلوب المهمة</label>
                      <textarea
                        rows={2}
                        value={questDescription}
                        onChange={(e) => setQuestDescription(e.target.value)}
                        placeholder="اشرح للكشاف ما هو المطلوب منه بالضبط لإتمام هذه المهمة..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">التصنيف الكشفي</label>
                        <input
                          type="text"
                          value={questCategory}
                          onChange={(e) => setQuestCategory(e.target.value)}
                          placeholder="مثال: ريادة وعقد، تقاليد، إسعافات"
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-300">النقاط المكتسبة</label>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={questPoints}
                          onChange={(e) => setQuestPoints(Number(e.target.value))}
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Quest Icon selector */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-300">رمز / أيقونة المهمة</label>
                      <div className="flex flex-wrap gap-2">
                        {QUEST_ICONS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setQuestIcon(ic)}
                            className={`flex size-9 items-center justify-center rounded-xl text-base transition ${
                              questIcon === ic
                                ? 'bg-amber-500 text-slate-950 scale-110 shadow'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
                    >
                      <Plus className="size-4" />
                      <span>إضافة المهمة إلى مهام اليوم</span>
                    </button>
                  </form>

                  {/* List of current daily quests */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400">مهام اليوم الحالية</h4>
                    {dailyQuests.length === 0 ? (
                      <p className="text-xs text-slate-500">لا توجد مهام يومية مضافة حتى الآن.</p>
                    ) : (
                      dailyQuests.map((quest) => (
                        <div
                          key={quest.id}
                          className="flex items-center justify-between rounded-xl bg-white/5 p-3 ring-1 ring-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{quest.iconName || '⚡'}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{quest.title}</p>
                              <p className="text-[10px] text-blue-200">
                                {quest.category} • +{quest.points} نقطة
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => onDeleteQuest(quest.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10"
                            title="حذف المهمة"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MANAGE SCOUTS */}
              {activeTab === 'scouts' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300">
                      قائمة الكشافة المسجلين الحقيقيين ({allScouts.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      مكافأة الكشاف بنقاط فورية للنشاط والطابور
                    </span>
                  </div>

                  {allScouts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-xs text-slate-400">
                      لا يوجد أي كشاف مسجل حتى الآن. عند قيام الكشاف بإنشاء حساب جديد سيظهر هنا تلقائياً.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {allScouts.map((scout) => (
                        <div
                          key={scout.id}
                          className="flex flex-col gap-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{scout.avatar || '⚜️'}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{scout.fullName}</p>
                              <p className="text-[10px] text-blue-200">
                                {scout.team} • {scout.rank} • النقاط: {scout.points} • هاتف: {scout.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => onAwardScoutPoints(scout.id, 10)}
                              className="rounded-lg bg-emerald-600/30 px-2 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-600/50"
                            >
                              +10 نقاط
                            </button>
                            <button
                              onClick={() => onAwardScoutPoints(scout.id, 25)}
                              className="rounded-lg bg-blue-600/30 px-2 py-1 text-[10px] font-bold text-cyan-300 hover:bg-blue-600/50"
                            >
                              +25 نقطة
                            </button>
                            <button
                              onClick={() => onDeleteScout(scout.id)}
                              className="p-1 text-slate-400 hover:text-red-400"
                              title="حذف هذا الكشاف"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
