'use client'

import React, { useState } from 'react'
import {
  User,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  UserPlus,
  LogIn,
  Shield,
} from 'lucide-react'
import { ScoutUser } from '@/lib/types'
import { SCOUT_RANKS } from '@/lib/initialData'

interface LoginPageProps {
  currentUser: ScoutUser | null
  allScouts?: ScoutUser[]
  onSuccess: (user: ScoutUser) => void
  onClose?: () => void
  onSwitchToAdmin: () => void
}

const AVATAR_OPTIONS = ['⚜️', '🦅', '🐆', '🐺', '🦁', '⚡', '🧭', '🔥']

export function LoginPage({
  currentUser,
  allScouts = [],
  onSuccess,
  onClose,
  onSwitchToAdmin,
}: LoginPageProps) {

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [duplicateUser, setDuplicateUser] = useState<ScoutUser | null>(null)

  // Login form state
  const [loginPhoneOrCode, setLoginPhoneOrCode] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register / Edit form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '')
  const [rank, setRank] = useState(currentUser?.rank || SCOUT_RANKS[0])
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [address, setAddress] = useState(currentUser?.address || '')
  const [password, setPassword] = useState(currentUser?.password || '')
  const [avatar, setAvatar] = useState(currentUser?.avatar || '⚜️')
  const [acceptedPromise, setAcceptedPromise] = useState(true)

  // Get active scouts list (prefer props, fallback to localStorage)
  const getScoutsList = (): ScoutUser[] => {
    if (allScouts && allScouts.length > 0) return allScouts
    try {
      const stored = localStorage.getItem('elmotaqadem_all_scouts')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setDuplicateUser(null)

    const identifier = loginPhoneOrCode.trim()
    const pass = loginPassword.trim()

    if (!identifier) {
      setError('يرجى إدخال رقم الهاتف أو كود الكشاف المسجل.')
      return
    }

    if (!pass) {
      setError('يرجى إدخال كلمة المرور الخاصة بحسابك.')
      return
    }

    try {
      const scoutList = getScoutsList()

      // Find user by phone, scout code, or name
      const foundScout = scoutList.find(
        (s) =>
          s.phone.trim() === identifier ||
          s.scoutCode.trim().toLowerCase() === identifier.toLowerCase() ||
          s.fullName.trim().toLowerCase() === identifier.toLowerCase()
      )

      if (!foundScout) {
        setError(
          'هذا الحساب غير مسجل في قاعدة البيانات! يمكنك إنشاء حساب جديد من تبويب "انضمام كشاف جديد".'
        )
        return
      }

      // Check password
      if (foundScout.password && foundScout.password !== pass) {
        setError('كلمة المرور غير صحيحة! يرجى التأكد من كتابتها بشكل صحيح.')
        return
      }

      setSuccessMsg(`أهلاً بعودتك يا بطل، ${foundScout.fullName}! جارٍ تسجيل الدخول ومزامنة بياناتك...`)
      setTimeout(() => {
        onSuccess(foundScout)
      }, 500)
    } catch {
      setError('حدث خطأ أثناء محاولة تسجيل الدخول.')
    }
  }

  // Handle Registration / Profile Update
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setDuplicateUser(null)

    if (!fullName.trim()) {
      setError('يرجى كتابة الاسم الثلاثي للكشاف.')
      return
    }
    if (!phone.trim()) {
      setError('يرجى كتابة رقم الهاتف للتواصل والمتابعة.')
      return
    }
    if (!password.trim()) {
      setError('يرجى إدخال كلمة مرور لحماية حسابك.')
      return
    }
    if (!acceptedPromise) {
      setError('يرجى الموافقة على الالتزام بالوعد والقانون الكشفي.')
      return
    }

    // Check if phone is already registered
    if (!currentUser) {
      const scoutList = getScoutsList()
      const existing = scoutList.find((s) => s.phone.trim() === phone.trim())
      if (existing) {
        setDuplicateUser(existing)
        setError(`رقم الهاتف هذا مسجل بالفعل باسم الكشاف (${existing.fullName})!`)
        return
      }
    }

    const updatedUser: ScoutUser = {
      id: currentUser ? currentUser.id : 'scout-' + Date.now(),
      fullName: fullName.trim(),
      scoutCode: currentUser?.scoutCode || 'SCOUT-' + Math.floor(100 + Math.random() * 900),
      rank,
      phone: phone.trim(),
      address: address.trim() || 'غير محدد',
      password: password.trim(),
      points: currentUser ? currentUser.points : 25,
      streak: currentUser ? currentUser.streak : 1,
      completedTasks: currentUser ? currentUser.completedTasks : [],
      unlockedBadges: currentUser ? currentUser.unlockedBadges : ['badge-welcome'],
      avatar,
      joinedDate: currentUser?.joinedDate || new Date().toISOString().split('T')[0],
    }

    setSuccessMsg(
      currentUser
        ? 'تم تحديث بيانات الملف الشخصي بنجاح!'
        : 'تم إنشاء حسابك بنجاح وجارٍ حفظه في Firebase! مرحباً بك يا بطل ⚜️'
    )

    setTimeout(() => {
      onSuccess(updatedUser)
    }, 600)
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/50 bg-[#0d1836] text-white shadow-2xl shadow-blue-950/50">
        
        {/* Close Button if user can cancel/close */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute left-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        )}

        {/* Top Header Card with Scout Logo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-[#0b1633] p-6 text-center">
          <div className="absolute -left-10 -top-10 size-36 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 size-36 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          {/* Official Scouting Logo */}
          <div className="mx-auto mb-3 flex size-24 items-center justify-center rounded-full bg-white p-2 shadow-2xl ring-4 ring-amber-400/60 overflow-hidden">
            <img
              src="/logo.png"
              alt="شعار الكشافة"
              className="h-full w-full object-contain rounded-full"
            />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {currentUser ? 'تعديل بيانات الكشاف' : 'منصة مجموعة المتقدم الكشفية'}
          </h2>
          <p className="mt-1 text-xs font-semibold text-blue-200">
            {currentUser
              ? 'تحديث الرتبة الكشفية والمعلومات الشخصية'
              : 'إذا كانت هذه زيارتك الأولى أنشئ حساباً جديداً، أو سجل دخولك للمتابعة'}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
            <span>⚜️</span>
            <span>بالمحبة اخدموا بعضكم بعضاً • كن مستعداً</span>
          </div>
        </div>

        {/* Tab Navigation (Login vs Register) */}
        {!currentUser && (
          <div className="flex border-b border-white/10 bg-[#0a122a] p-1.5">
            <button
              onClick={() => {
                setActiveTab('login')
                setError('')
                setSuccessMsg('')
              }}
              className={`flex items-center justify-center gap-2 flex-1 rounded-2xl py-3 text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="size-4" />
              <span>تسجيل الدخول للكشاف</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setError('')
                setSuccessMsg('')
              }}
              className={`flex items-center justify-center gap-2 flex-1 rounded-2xl py-3 text-sm font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="size-4" />
              <span>انضمام كشاف جديد (إنشاء حساب)</span>
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Alerts */}
          {error && (
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/15 p-3.5 text-xs font-semibold text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{error}</span>
              </div>

              {duplicateUser && (
                <div className="mt-2 flex flex-wrap gap-2 border-t border-amber-500/20 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login')
                      setLoginPhoneOrCode(duplicateUser.phone)
                      setError('')
                      setDuplicateUser(null)
                    }}
                    className="rounded-xl bg-amber-400 px-3 py-1.5 font-black text-slate-950 hover:bg-amber-300 transition"
                  >
                    تسجيل الدخول بهذا الحساب 🔑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: ScoutUser = {
                        ...duplicateUser,
                        fullName: fullName.trim() || duplicateUser.fullName,
                        rank,
                        phone: phone.trim(),
                        address: address.trim() || duplicateUser.address,
                        password: password.trim() || duplicateUser.password,
                        avatar,
                      }
                      setSuccessMsg('تم تحديث بيانات حسابك وجارٍ الحفظ في Firebase...')
                      setDuplicateUser(null)
                      setTimeout(() => onSuccess(updated), 500)
                    }}
                    className="rounded-xl bg-white/10 px-3 py-1.5 font-bold text-white hover:bg-white/20 transition"
                  >
                    تحديث بيانات هذا الحساب ✏️
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-200">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}


          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && !currentUser && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">
                  رقم الهاتف أو كود الكشاف المسجل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginPhoneOrCode}
                    onChange={(e) => setLoginPhoneOrCode(e.target.value)}
                    placeholder="أدخل رقم هاتفك أو كود الكشاف (مثال: 01012345678)"
                    dir="ltr"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pe-4 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-right"
                  />
                  <Phone className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الخاصة بحسابك"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pe-11 ps-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                <span>تسجيل الدخول</span>
                <ArrowRight className="size-4 rotate-180" />
              </button>

              {/* Note for new scouts */}
              <div className="rounded-2xl bg-blue-950/40 p-3.5 text-center border border-white/10">
                <p className="text-xs text-slate-300 leading-relaxed">
                  أول مرة تدخل المنصة؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register')
                      setError('')
                    }}
                    className="font-bold text-cyan-300 hover:underline"
                  >
                    اضغط هنا لإنشاء حساب كشاف جديد أولاً
                  </button>
                </p>
              </div>

              {/* Switch to Admin */}
              <div className="flex items-center justify-end text-xs text-slate-400">
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="inline-flex items-center gap-1 font-bold text-cyan-400 hover:underline"
                >
                  <Shield className="size-3.5 text-amber-400" />
                  <span>بوابة الليدر والمشرف (كلمة سر 1911) 🛡️</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER OR EDIT PROFILE (NO PATROL SELECTION!) */}
          {(activeTab === 'register' || currentUser) && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">
                  الاسم الكامل للكشاف <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: يوسف أحمد منصور"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pe-4 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                  />
                  <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">
                  الرتبة الكشفية
                </label>
                <div className="relative">
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#132247] py-3 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {SCOUT_RANKS.map((r) => (
                      <option key={r} value={r} className="bg-[#132247] text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-300">
                    رقم الهاتف <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pe-4 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none text-right"
                    />
                    <Phone className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-300">
                    العنوان أو المنطقة
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="مثال: القاهرة"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pe-4 ps-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">
                  كلمة المرور للحساب <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="اختر كلمة مرور لتسجيل الدخول بها لاحقاً"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pe-11 ps-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">
                  شارة الكشاف / الرمز المفضل
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`flex size-10 items-center justify-center rounded-xl text-lg transition-all ${
                        avatar === av
                          ? 'bg-blue-600 scale-110 ring-2 ring-cyan-400 shadow-md'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scout Promise Acceptance */}
              <label className="mt-1 flex items-start gap-2.5 cursor-pointer select-none rounded-xl bg-blue-950/40 p-3 ring-1 ring-white/10">
                <input
                  type="checkbox"
                  checked={acceptedPromise}
                  onChange={(e) => setAcceptedPromise(e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-blue-600 cursor-pointer"
                />
                <span className="text-[11px] leading-relaxed text-blue-200">
                  أعد بشرفي أن أبذل جهدي لأقوم بواجبي نحو الله ثم الوطن، وأن أساعد الناس في كل حين، وأعمل بقانون الكشافة ⚜️.
                </span>
              </label>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-700/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                <span>{currentUser ? 'حفظ التعديلات' : 'إنشاء الحساب وبدء النشاط الكشفي'}</span>
                <CheckCircle2 className="size-4" />
              </button>

              {!currentUser && (
                <p className="text-center text-xs text-slate-400">
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login')
                      setError('')
                    }}
                    className="font-bold text-blue-400 hover:underline"
                  >
                    اضغط هنا لتسجيل الدخول
                  </button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

