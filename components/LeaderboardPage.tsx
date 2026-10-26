'use client'

import React, { useState } from 'react'
import {
  Crown,
  Download,
  Medal,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { ScoutUser } from '@/lib/types'

interface LeaderboardPageProps {
  currentUser: ScoutUser | null
  allScouts: ScoutUser[]
}

export function LeaderboardPage({ currentUser, allScouts }: LeaderboardPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Sort scouts by points descending
  const sortedScouts = [...allScouts].sort((a, b) => b.points - a.points)

  // Filter scouts by search
  const filteredScouts = sortedScouts.filter((s) => {
    const q = searchTerm.toLowerCase()
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.scoutCode.toLowerCase().includes(q) ||
      s.phone.includes(q)
    )
  })

  // Export CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = ['المركز', 'كود الكشاف', 'اسم الكشاف', 'الرتبة الكشفية', 'رقم الهاتف', 'مجموع النقاط']
    const rows = sortedScouts.map((s, idx) => [
      idx + 1,
      s.scoutCode,
      `"${s.fullName}"`,
      `"${s.rank}"`,
      `"${s.phone}"`,
      s.points,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `كشف-درجات-كشافة-المتقدم-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const topThree = sortedScouts.slice(0, 3)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner with Scout Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1938] via-[#152a5c] to-[#1e3a7a] p-6 text-white shadow-xl border border-blue-900/30">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-white p-1.5 shadow-md ring-2 ring-amber-400/60 shrink-0 overflow-hidden">
              <img src="/logo.png" alt="شعار الكشافة" className="h-full w-full object-contain rounded-full" />
            </div>
            <div>
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
                🏆 لوحة الشرف الكشفية
              </span>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">ترتيب الكشافة والمتصدرين</h1>
              <p className="mt-1 text-xs font-semibold text-blue-200">
                شرف التميز في مجموعة المتقدم! كل نقطة ترفع من مكانتك في لوحة الشرف الكشفية.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-95 shrink-0 self-start sm:self-center"
          >
            <Download className="size-4 text-cyan-300" />
            <span>تصدير كشف الدرجات (Excel)</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          
          {/* Rank 2 (Silver) */}
          <div className="order-2 sm:order-1 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm relative overflow-hidden">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-inner ring-2 ring-slate-300">
              🥈
            </div>
            <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-700">
              المركز الثاني
            </span>
            <h3 className="mt-2 font-black text-slate-900 text-base">{topThree[1].fullName}</h3>
            <p className="text-xs text-slate-500">{topThree[1].rank}</p>
            <p className="mt-2 font-mono text-xl font-black text-blue-600">{topThree[1].points} نقطة</p>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 sm:order-2 rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/60 to-white p-6 text-center shadow-md relative overflow-hidden -translate-y-2">
            <div className="absolute top-2 right-2 text-amber-500">
              <Sparkles className="size-5" />
            </div>
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-400 text-3xl shadow-md ring-4 ring-amber-200 text-slate-900">
              🥇
            </div>
            <span className="mt-3 inline-block rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-black text-amber-800 ring-1 ring-amber-400/40">
              المركز الأول (بطل المجموعة)
            </span>
            <h3 className="mt-2 font-black text-slate-950 text-lg">{topThree[0].fullName}</h3>
            <p className="text-xs font-bold text-blue-600">{topThree[0].rank}</p>
            <p className="mt-2 font-mono text-2xl font-black text-amber-600">{topThree[0].points} نقطة</p>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 sm:order-3 rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm relative overflow-hidden">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-inner ring-2 ring-amber-700/40">
              🥉
            </div>
            <span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-bold text-amber-900">
              المركز الثالث
            </span>
            <h3 className="mt-2 font-black text-slate-900 text-base">{topThree[2].fullName}</h3>
            <p className="text-xs text-slate-500">{topThree[2].rank}</p>
            <p className="mt-2 font-mono text-xl font-black text-blue-600">{topThree[2].points} نقطة</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم الكشاف، الرتبة، أو الكود..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-4 ps-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3 top-3 size-4 text-slate-400" />
        </div>
        <div className="text-xs font-bold text-slate-500">
          عدد المتصدرين: {filteredScouts.length} كشاف
        </div>
      </div>

      {/* Scouts Table (NO PATROL COLUMN) */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {filteredScouts.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="mx-auto size-12 text-slate-300" />
            <h3 className="mt-3 text-base font-black text-slate-800">لا يوجد كشافة مسجلين بعد</h3>
            <p className="mt-1 text-xs text-slate-500">
              سجل حسابك ككشاف جديد لتكون أول المتصدرين في لوحة الشرف الكشفية!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <tr>
                  <th className="py-4 px-5 font-bold">الترتيب</th>
                  <th className="py-4 px-5 font-bold">الكشاف</th>
                  <th className="py-4 px-5 font-bold">الرتبة الكشفية</th>
                  <th className="py-4 px-5 font-bold">كود العضوية</th>
                  <th className="py-4 px-5 font-bold">مجموع النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScouts.map((scout, idx) => {
                  const isCurrentUser = currentUser?.id === scout.id
                  return (
                    <tr
                      key={scout.id}
                      className={`transition-colors ${
                        isCurrentUser ? 'bg-blue-50/70 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex size-7 items-center justify-center rounded-xl text-xs font-black ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-900'
                              : idx === 2
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-base">
                            {scout.avatar || '⚜️'}
                          </span>
                          <div>
                            <p className="font-black text-slate-900">
                              {scout.fullName}
                              {isCurrentUser && (
                                <span className="mr-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">
                                  أنت
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-700">{scout.rank}</td>
                      <td className="py-4 px-5 font-mono text-slate-400">{scout.scoutCode}</td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-sm font-black text-blue-600">
                          {scout.points} نقطة
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
