'use client'

import { useEffect, useState } from 'react'
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Clock3,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  AlertCircle,
  Lock,
  KeyRound,
  Check,
  FileText,
  Medal,
  Users,
  Timer,
} from 'lucide-react'
import { QuestionAnswerDetail, Quiz, QuizSubmission, ScoutUser } from '@/lib/types'

interface QuizzesPageProps {
  currentUser: ScoutUser | null
  quizzes: Quiz[]
  submissions?: QuizSubmission[]
  onOpenAuth: () => void
  onAwardQuizPoints: (points: number, quizTitle: string) => void
  onSubmitQuiz?: (submission: QuizSubmission) => void
}

export function QuizzesPage({
  currentUser,
  quizzes,
  submissions = [],
  onOpenAuth,
  onAwardQuizPoints,
  onSubmitQuiz,
}: QuizzesPageProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [quizStartTime, setQuizStartTime] = useState(0)

  // Question Password Prompt State
  const [passwordModalQuiz, setPasswordModalQuiz] = useState<Quiz | null>(null)
  const [enteredPassword, setEnteredPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Ranking / Solvers Modal State
  const [rankingModalQuiz, setRankingModalQuiz] = useState<Quiz | null>(null)

  // Countdown timer effect
  useEffect(() => {
    if (!activeQuiz || quizFinished) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Time is up, auto finish quiz
          setTimeout(() => {
            finishQuizInternal()
          }, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [activeQuiz, quizFinished, selectedAnswers, essayAnswers, quizStartTime])

  // Trigger taking a quiz
  const handleInitiateQuiz = (quiz: Quiz) => {
    if (!currentUser) {
      onOpenAuth()
      return
    }

    // Check deadlines
    const now = new Date()
    const openDate = new Date(quiz.opensAt)
    const closeDate = new Date(quiz.closesAt)

    if (now < openDate) {
      alert(`هذه المسابقة لم تبدأ بعد! موعد الفتح: ${openDate.toLocaleString('ar-EG')}`)
      return
    }

    if (now > closeDate) {
      alert(`عذراً، انتهى الموعد المحدد لهذه المسابقة وأغلقت في: ${closeDate.toLocaleString('ar-EG')}`)
      return
    }

    // Check if already completed by user
    const hasAlreadySubmitted = submissions.some(
      (s) => s.quizId === quiz.id && s.userId === currentUser.id
    )
    if (hasAlreadySubmitted) {
      alert('لقد قمت بحل هذه المسابقة بالفعل! لا يُسمح بإعادة الحل.')
      return
    }

    // Check if Question is Password Protected
    if (quiz.password && quiz.password.trim() !== '') {
      setPasswordModalQuiz(quiz)
      setEnteredPassword('')
      setPasswordError('')
    } else {
      startQuizDirectly(quiz)
    }
  }

  // Verify Question Password
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordModalQuiz) return

    if (enteredPassword.trim() === passwordModalQuiz.password?.trim()) {
      const q = passwordModalQuiz
      setPasswordModalQuiz(null)
      startQuizDirectly(q)
    } else {
      setPasswordError('كلمة مرور السؤال غير صحيحة! تواصل مع الليدر للحصول على كلمة المرور.')
    }
  }

  const startQuizDirectly = (quiz: Quiz) => {
    const totalSecs = Math.max(30, (quiz.durationMinutes || 5) * 60)
    setSecondsLeft(totalSecs)
    setQuizStartTime(Date.now())
    setActiveQuiz(quiz)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setEssayAnswers({})
    setQuizFinished(false)
    setScore(0)
    setCorrectCount(0)
  }

  // Answer selection for MCQ & TF
  const handleSelectAnswer = (optionIdx: number) => {
    if (quizFinished) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }))
  }

  // Essay answer
  const handleEssayChange = (text: string) => {
    if (quizFinished) return
    setEssayAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: text,
    }))
  }

  // Finish Quiz and calculate results
  const finishQuizInternal = () => {
    if (!activeQuiz || !currentUser) return

    let correct = 0
    const details: QuestionAnswerDetail[] = []

    activeQuiz.questions.forEach((q, idx) => {
      if (q.type === 'مقالي') {
        const text = essayAnswers[idx]?.trim() || ''
        const isAnswered = text.length > 0
        if (isAnswered) correct++
        details.push({
          questionId: q.id,
          questionText: q.question,
          questionType: 'مقالي',
          userAnswer: text,
          userAnswerLabel: text || 'لم تتم الإجابة',
          correctAnswer: q.modelAnswer || 'الإجابة النموذجية المعتمدة',
          correctAnswerLabel: q.modelAnswer || 'الإجابة النموذجية المعتمدة',
          isCorrect: isAnswered,
        })
      } else {
        const scoutChoice = selectedAnswers[idx]
        const isCorrect = scoutChoice !== undefined && scoutChoice === q.correctIndex
        if (isCorrect) correct++
        details.push({
          questionId: q.id,
          questionText: q.question,
          questionType: q.type || 'اختياري',
          userAnswer: scoutChoice !== undefined ? scoutChoice : -1,
          userAnswerLabel: scoutChoice !== undefined && q.options ? q.options[scoutChoice] : 'لم تتم الإجابة',
          correctAnswer: q.correctIndex !== undefined ? q.correctIndex : -1,
          correctAnswerLabel: q.correctIndex !== undefined && q.options ? q.options[q.correctIndex] : '',
          isCorrect,
        })
      }
    })

    const totalQuestions = activeQuiz.questions.length || 1
    const earnedPoints = Math.round((correct / totalQuestions) * activeQuiz.points)
    const timeTakenSeconds = Math.max(1, Math.round((Date.now() - (quizStartTime || Date.now())) / 1000))

    setCorrectCount(correct)
    setScore(earnedPoints)
    setQuizFinished(true)

    const submission: QuizSubmission = {
      id: `sub_${activeQuiz.id}_${currentUser.id}_${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      userId: currentUser.id,
      userName: currentUser.fullName,
      scoutCode: currentUser.scoutCode,
      userRank: currentUser.rank,
      userAvatar: currentUser.avatar,
      earnedPoints,
      maxPoints: activeQuiz.points,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answers: details,
    }

    if (onSubmitQuiz) {
      onSubmitQuiz(submission)
    } else if (earnedPoints > 0) {
      onAwardQuizPoints(earnedPoints, activeQuiz.title)
    }
  }

  const handleFinishQuiz = () => {
    finishQuizInternal()
  }


  // Helper to determine quiz status
  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date()
    const openDate = new Date(quiz.opensAt)
    const closeDate = new Date(quiz.closesAt)

    if (now < openDate) {
      return {
        label: 'لم تبدأ بعد',
        detail: `تفتح: ${openDate.toLocaleString('ar-EG')}`,
        canPlay: false,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: Clock,
      }
    }
    if (now > closeDate) {
      return {
        label: 'أغلقت المسابقة',
        detail: `أغلقت: ${closeDate.toLocaleString('ar-EG')}`,
        canPlay: false,
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
        icon: Lock,
      }
    }
    return {
      label: 'متاحة الآن',
      detail: `الديدلاين: ${closeDate.toLocaleString('ar-EG')}`,
      canPlay: true,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1938] via-[#152a5c] to-[#1e3a7a] p-6 text-white shadow-xl sm:flex-row sm:items-center border border-blue-900/30">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-white p-1.5 shadow-md ring-2 ring-amber-400/60 shrink-0 overflow-hidden">
              <img src="/logo.png" alt="شعار الكشافة" className="h-full w-full object-contain rounded-full" />
            </div>
            <div>
              <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/30">
                🎯 التحديات الكشفية
              </span>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">الأسئلة والمسابقات الكشفية</h1>
              <p className="mt-1 text-xs font-semibold text-blue-200">
                أجب عن الأسئلة المتاحة قبل انتهاء الديدلاين، أدخل كلمة سر السؤال إذا كان محمياً، واكسب نقاطاً لمجموعتك!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 shrink-0 self-start sm:self-center">
            <BookOpenCheck className="size-6 text-cyan-300" />
            <div>
              <p className="text-[10px] text-blue-200">الأسئلة المتاحة</p>
              <p className="text-xl font-black">{quizzes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpenCheck className="mx-auto size-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">لا توجد أسئلة أو مسابقات متاحة حالياً</h2>
          <p className="mt-1 text-xs text-slate-500">
            سيظهر هنا ما يضيفه قائد المجموعة لاحقاً مع مواعيد الفتح والإغلاق وكلمة السر المخصصة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const status = getQuizStatus(quiz)
            const StatusIcon = status.icon
            const quizSubs = submissions
              .filter((s) => s.quizId === quiz.id)
              .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
            const isCompletedByUser = currentUser
              ? quizSubs.some((s) => s.userId === currentUser.id)
              : false
            const userSub = currentUser ? quizSubs.find((s) => s.userId === currentUser.id) : null

            return (
              <div
                key={quiz.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-blue-300"
              >
                <div>
                  {/* Status Badge & Reward Points */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black border ${status.badgeClass}`}
                    >
                      <StatusIcon className="size-3.5" />
                      <span>{status.label}</span>
                    </span>

                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Sparkles className="size-3.5" />
                      +{quiz.points} نقطة
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-black text-slate-900">{quiz.title}</h3>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-blue-600">{quiz.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{quiz.type}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="size-3 text-slate-400" />
                      {quiz.durationMinutes || 5} دقائق
                    </span>
                    {quiz.password && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          <Lock className="size-2.5" />
                          <span>يتطلب باسورد</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Deadline info */}
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Clock3 className="size-3.5 text-blue-600" />
                      <span>{status.detail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <HelpCircle className="size-3.5 text-slate-400" />
                      <span>عدد الأسئلة: {quiz.questions?.length || 1}</span>
                    </div>
                  </div>

                  {/* Solvers & Rankings preview */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setRankingModalQuiz(quiz)}
                      className="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Trophy className="size-3.5 text-amber-500" />
                      <span>لوحة الأسرع حلاً ({quizSubs.length})</span>
                    </button>

                    {isCompletedByUser && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <Check className="size-3" />
                        <span>تم الحل (+{userSub?.earnedPoints || 0})</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    disabled={!status.canPlay || isCompletedByUser}
                    onClick={() => handleInitiateQuiz(quiz)}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black transition ${
                      isCompletedByUser
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed opacity-90'
                        : status.canPlay
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompletedByUser ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span>تم حل المسابقة بنجاح ✓</span>
                      </>
                    ) : status.canPlay ? (
                      <>
                        {quiz.password ? <KeyRound className="size-4" /> : <Play className="size-4" />}
                        <span>
                          {quiz.password
                            ? 'فتح السؤال (يتطلب باسورد)'
                            : 'ابدأ التحدي الآن'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5" />
                        <span>{status.label}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* QUESTION PASSWORD PROMPT MODAL */}
      {passwordModalQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0d1836] p-6 text-center text-white shadow-2xl">
            <button
              onClick={() => setPasswordModalQuiz(null)}
              className="absolute left-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
            >
              <X className="size-4" />
            </button>

            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
              <KeyRound className="size-7" />
            </div>

            <h3 className="text-lg font-black text-white">هذا السؤال محمي بكلمة مرور</h3>
            <p className="mt-1 text-xs text-blue-200">
              حدد القائد كلمة سر خاصة لفتح مسابقة: <strong>"{passwordModalQuiz.title}"</strong>
            </p>

            {passwordError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/20 p-2.5 text-xs text-red-200 border border-red-500/30">
                <AlertCircle className="size-4 shrink-0 text-red-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPassword} className="mt-4 space-y-3">
              <input
                type="text"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="أدخل كلمة مرور السؤال هنا..."
                autoFocus
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 text-center text-sm font-bold text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-black text-white shadow-lg hover:brightness-110 active:scale-95"
              >
                تأكيد وبدء السؤال
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700/50 bg-[#0d1836] text-white shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0a132b] px-6 py-4">
              <div>
                <h3 className="text-base font-black text-white">{activeQuiz.title}</h3>
                <p className="text-xs text-blue-200">
                  سؤال {currentQuestionIndex + 1} من {activeQuiz.questions.length} • ({activeQuiz.type})
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!quizFinished && (
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 transition-all ${
                      secondsLeft < 60
                        ? 'bg-rose-500/20 text-rose-300 ring-rose-500/50 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 ring-amber-500/40'
                    }`}
                  >
                    <Timer className="size-3.5" />
                    <span>
                      {Math.floor(secondsLeft / 60)}:
                      {secondsLeft % 60 < 10 ? '0' : ''}
                      {secondsLeft % 60}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>


            <div className="p-6">
              {!quizFinished ? (
                <div>
                  {activeQuiz.questions[currentQuestionIndex] ? (
                    <div>
                      {/* Question Text */}
                      <div className="mb-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                        <span className="text-xs font-bold text-cyan-300">نص السؤال:</span>
                        <h4 className="mt-1 text-base font-bold text-white leading-relaxed">
                          {activeQuiz.questions[currentQuestionIndex].question}
                        </h4>
                      </div>

                      {/* Options for MCQ and TF */}
                      {activeQuiz.questions[currentQuestionIndex].type !== 'مقالي' &&
                        activeQuiz.questions[currentQuestionIndex].options && (
                          <div className="space-y-3">
                            {activeQuiz.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                              const isSelected = selectedAnswers[currentQuestionIndex] === optIdx
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectAnswer(optIdx)}
                                  className={`flex w-full items-center justify-between rounded-2xl p-4 text-right text-sm font-semibold transition-all ${
                                    isSelected
                                      ? 'bg-blue-600 text-white ring-2 ring-cyan-300 shadow-md'
                                      : 'bg-white/5 text-slate-200 hover:bg-white/10'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <div
                                    className={`flex size-5 items-center justify-center rounded-full border ${
                                      isSelected
                                        ? 'border-white bg-white text-blue-600'
                                        : 'border-white/30'
                                    }`}
                                  >
                                    {isSelected && <span className="size-2 rounded-full bg-blue-600" />}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}

                      {/* Essay Question Input */}
                      {activeQuiz.questions[currentQuestionIndex].type === 'مقالي' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-300">
                            اكتب إجابتك وشرحك بالتفصيل هنا:
                          </label>
                          <textarea
                            rows={4}
                            value={essayAnswers[currentQuestionIndex] || ''}
                            onChange={(e) => handleEssayChange(e.target.value)}
                            placeholder="اكتب إجابتك الكشفية هنا..."
                            className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
                        <button
                          disabled={currentQuestionIndex === 0}
                          onClick={() => setCurrentQuestionIndex((idx) => Math.max(0, idx - 1))}
                          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold disabled:opacity-30"
                        >
                          السابق
                        </button>

                        {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                          <button
                            onClick={() => setCurrentQuestionIndex((idx) => idx + 1)}
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700"
                          >
                            التالي
                          </button>
                        ) : (
                          <button
                            onClick={handleFinishQuiz}
                            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-black text-white hover:brightness-110 shadow-lg shadow-teal-700/30"
                          >
                            إنهاء المسابقة وحساب النتيجة
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                /* QUIZ RESULT BREAKDOWN */
                <div className="py-4 text-center">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/40">
                    <Trophy className="size-10" />
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-white">
                    {score > 0 ? 'عاش يا بطل! ⚜️' : 'تم إنهاء التحدي!'}
                  </h3>
                  <p className="mt-1 text-sm text-blue-200">
                    أنجزت التحدي وحصلت على +{score} نقطة تمت إضافتها لرصيدك الكشفي!
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                    <CheckCircle2 className="size-3.5" />
                    <span>تم تسجيل إجابتك بنجاح ولا يمكن إعادة الحل</span>
                  </div>

                  {/* Answers review */}
                  <div className="mt-5 space-y-2 text-right max-h-60 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-400">مراجعة الإجابات النموذجية:</p>
                    {activeQuiz.questions.map((q, idx) => {
                      if (q.type === 'مقالي') {
                        return (
                          <div
                            key={q.id}
                            className="rounded-2xl p-3.5 text-xs border bg-blue-950/40 border-blue-500/40 text-blue-100"
                          >
                            <p className="font-bold text-white mb-1.5">{q.question}</p>
                            <p className="text-slate-300">
                              إجابتك: <strong>{essayAnswers[idx] || 'لم تجب'}</strong>
                            </p>
                            {q.modelAnswer && (
                              <p className="mt-2 text-emerald-300 border-t border-white/10 pt-1.5">
                                الإجابة النموذجية المعتمدة من القائد: <strong>{q.modelAnswer}</strong>
                              </p>
                            )}
                          </div>
                        )
                      }

                      const scoutChoice = selectedAnswers[idx]
                      const isCorrect = scoutChoice === q.correctIndex

                      return (
                        <div
                          key={q.id}
                          className={`rounded-2xl p-3.5 text-xs border ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                          }`}
                        >
                          <p className="font-bold text-white mb-1.5">{q.question}</p>
                          <div className="flex flex-col gap-1 text-[11px]">
                            <span>
                              إجابتك:{' '}
                              <strong>
                                {scoutChoice !== undefined && q.options
                                  ? q.options[scoutChoice]
                                  : 'لم تجب'}
                              </strong>{' '}
                              {isCorrect ? '✓ (صحيحة)' : '✗ (خاطئة)'}
                            </span>
                            {!isCorrect && q.options && q.correctIndex !== undefined && (
                              <span className="text-emerald-300">
                                الإجابة الصحيحة: <strong>{q.options[q.correctIndex]}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-xs font-black text-white hover:brightness-110 shadow-lg shadow-blue-600/30 active:scale-95 transition"
                    >
                      العودة لقائمة المسابقات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* RANKING & SOLVERS MODAL */}
      {rankingModalQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0d1836] p-6 text-white shadow-2xl">
            <button
              onClick={() => setRankingModalQuiz(null)}
              className="absolute left-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40">
                <Trophy className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">لوحة شرف الأسرع حلاً</h3>
                <p className="text-xs text-blue-200">
                  مسابقة: <strong>{rankingModalQuiz.title}</strong>
                </p>
              </div>
            </div>

            {(() => {
              const solvers = submissions
                .filter((s) => s.quizId === rankingModalQuiz.id)
                .sort(
                  (a, b) =>
                    new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
                )

              if (solvers.length === 0) {
                return (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-xs text-slate-400">
                    <p>لم يقم أي كشاف بحل هذا السؤال حتى الآن.</p>
                    <p className="mt-1 text-[11px] text-amber-300">كن أول من يحل واحتل المركز الأول! 🥇</p>
                  </div>
                )
              }

              return (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pe-1">
                  {solvers.map((sub, idx) => {
                    const isFirst = idx === 0
                    const isSecond = idx === 1
                    const isThird = idx === 2

                    const medalBadge = isFirst
                      ? '🥇 المركز الأول'
                      : isSecond
                      ? '🥈 المركز الثاني'
                      : isThird
                      ? '🥉 المركز الثالث'
                      : `المركز ${idx + 1}`

                    return (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between rounded-2xl p-3.5 border transition ${
                          isFirst
                            ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-400/30'
                            : isSecond
                            ? 'bg-slate-300/10 border-slate-300/30'
                            : isThird
                            ? 'bg-amber-700/10 border-amber-700/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-8 items-center justify-center rounded-xl text-xs font-black shrink-0 ${
                              isFirst
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                                : isSecond
                                ? 'bg-slate-300 text-slate-950'
                                : isThird
                                ? 'bg-amber-700 text-white'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-white">{sub.userName}</h4>
                              <span className="text-[10px] text-amber-300 font-bold">{medalBadge}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              كود: {sub.scoutCode} • {sub.userRank}
                            </p>
                          </div>
                        </div>

                        <div className="text-left text-xs">
                          <div className="font-mono font-bold text-cyan-300">
                            {sub.timeTakenSeconds < 60
                              ? `${sub.timeTakenSeconds} ثانية`
                              : `${Math.floor(sub.timeTakenSeconds / 60)}د و ${sub.timeTakenSeconds % 60}ث`}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-bold">
                            +{sub.earnedPoints} / {sub.maxPoints} نقطة
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => setRankingModalQuiz(null)}
                className="rounded-2xl bg-white/10 px-6 py-2.5 text-xs font-bold text-white hover:bg-white/20"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
