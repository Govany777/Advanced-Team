'use client'

import React from 'react'
import {
  ShieldCheck,
  UserRound,
  LogOut,
  Trophy,
  BookOpenCheck,
  Home,
  Menu,
  X,
  Shield,
  Sparkles,
} from 'lucide-react'
import { ScoutUser } from '@/lib/types'

interface NavbarProps {
  currentUser: ScoutUser | null
  activeTab: string
  setActiveTab: (tab: string) => void
  onOpenAuth: () => void
  onOpenAdmin: () => void
  onLogout: () => void
}

export function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navLinks = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'quizzes', label: 'المسابقات والمهام', icon: BookOpenCheck },
    { id: 'leaderboard', label: 'لوحة الشرف', icon: Trophy },
    { id: 'leader', label: 'لوحة الليدر 🛡️', icon: Shield },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-blue-950/20 bg-[#0c1938]/95 backdrop-blur-md text-white shadow-lg shadow-black/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Logo & Scout Branding with Official Scout Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex cursor-pointer items-center gap-3 transition-transform hover:scale-[1.02]"
          >
            <div className="relative flex size-12 items-center justify-center rounded-full bg-white p-1 shadow-md shadow-blue-500/20 ring-2 ring-amber-400/60 shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="شعار الكشافة"
                className="h-full w-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">مجموعة المتقدم الكشفية</span>
                <span className="hidden rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-400/30 sm:inline-block">
                  كن مستعداً
                </span>
              </div>
              <p className="text-xs font-medium text-blue-200/80">كشافة مرحلة المتقدم • الكاروزي</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              const isLeaderTab = item.id === 'leader'

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? isLeaderTab
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                      : isLeaderTab
                      ? 'text-amber-300 hover:bg-amber-400/10'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Scout Points Badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-3 py-1.5 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>{currentUser.points} نقطة</span>
                </div>

                {/* Profile Pill */}
                <button
                  onClick={onOpenAuth}
                  title="تعديل الملف الشخصي"
                  className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-1.5 pe-4 ps-2 text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white/30"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-blue-500 text-base shadow">
                    {currentUser.avatar || '⚜️'}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold leading-none text-white max-w-[110px] truncate sm:max-w-none">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-blue-200 leading-tight">
                      {currentUser.rank}
                    </p>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="تسجيل الخروج"
                  className="hidden sm:flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition hover:brightness-110 active:scale-95"
              >
                <UserRound className="size-4" />
                <span>دخول / انضمام كشاف</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition md:hidden hover:bg-white/10"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 py-4 md:hidden animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                const isLeaderTab = item.id === 'leader'
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      isActive
                        ? isLeaderTab
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-blue-600 text-white'
                        : isLeaderTab
                        ? 'text-amber-300 hover:bg-amber-400/10'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}

              {currentUser && (
                <button
                  onClick={() => {
                    onLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="size-5" />
                  <span>تسجيل الخروج</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* TOP MOTIVATIONAL GREETING BAR WHEN LOGGED IN (NO PATROL) */}
      {currentUser && (
        <div className="border-t border-white/10 bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-blue-900/80 px-4 py-2 text-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">👋</span>
              <span className="font-black text-amber-300">ازيك يا {currentUser.fullName}</span>
              <span className="hidden sm:inline text-blue-400">•</span>
              <span className="hidden sm:inline text-blue-100 font-medium">
                شعارك الكشفي: كن مستعداً دائماً! مجموعتك فخورة بك وسر على طريق التميز والأخلاق الكشفية ⚜️
              </span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px]">
              <span>{currentUser.rank}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
