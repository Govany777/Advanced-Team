'use client'

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { HomePage } from '@/components/HomePage'
import { QuizzesPage } from '@/components/QuizzesPage'
import { LeaderboardPage } from '@/components/LeaderboardPage'
import { LoginPage } from '@/components/LoginPage'
import { LeaderPage } from '@/components/LeaderPage'
import { DailyQuest, Quiz, QuizSubmission, ScoutUser } from '@/lib/types'
import { DEFAULT_BADGES, DEFAULT_DAILY_QUESTS, DEFAULT_QUIZZES, SAMPLE_SCOUTS } from '@/lib/initialData'
import {
  subscribeScouts,
  subscribeQuizzes,
  subscribeQuests,
  subscribeSubmissions,
  saveScoutToFirestore,
  deleteScoutFromFirestore,
  updateScoutPointsInFirestore,
  saveQuizToFirestore,
  deleteQuizFromFirestore,
  saveQuestToFirestore,
  deleteQuestFromFirestore,
  saveQuizSubmissionToFirestore,
} from '@/lib/firebaseService'

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'quizzes' | 'leaderboard' | 'leader'>('home')
  const [currentUser, setCurrentUser] = useState<ScoutUser | null>(null)
  const [allScouts, setAllScouts] = useState<ScoutUser[]>(SAMPLE_SCOUTS)
  const [quizzes, setQuizzes] = useState<Quiz[]>(DEFAULT_QUIZZES)
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(DEFAULT_DAILY_QUESTS)
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)


  // Auto-reset legacy local storage once to start 100% fresh with Firebase
  const handleResetAllData = () => {
    try {
      localStorage.removeItem('elmotaqadem_all_scouts')
      localStorage.removeItem('elmotaqadem_current_user')
      localStorage.removeItem('elmotaqadem_quiz_submissions')
      localStorage.removeItem('elmotaqadem_daily_quests')
      localStorage.setItem('elmotaqadem_v3_fresh_firebase_start', 'true')
    } catch (e) {
      console.error(e)
    }
    setAllScouts([])
    setCurrentUser(null)
    setSubmissions([])
    setDailyQuests([])
  }

  // Hydrate from localStorage first, then subscribe to Firestore
  useEffect(() => {
    // 0. Clean reset legacy mock data if not yet migrated
    try {
      const resetFlag = localStorage.getItem('elmotaqadem_v3_fresh_firebase_start')
      if (!resetFlag) {
        localStorage.removeItem('elmotaqadem_all_scouts')
        localStorage.removeItem('elmotaqadem_current_user')
        localStorage.removeItem('elmotaqadem_quiz_submissions')
        localStorage.removeItem('elmotaqadem_daily_quests')
        localStorage.setItem('elmotaqadem_v3_fresh_firebase_start', 'true')
      }
    } catch (e) {
      console.error(e)
    }

    // 1. Load from localStorage (fast hydration)
    try {
      const storedScoutsStr = localStorage.getItem('elmotaqadem_all_scouts')
      if (storedScoutsStr) setAllScouts(JSON.parse(storedScoutsStr))
    } catch (e) { console.error(e) }

    try {
      const storedUserStr = localStorage.getItem('elmotaqadem_current_user')
      if (storedUserStr) setCurrentUser(JSON.parse(storedUserStr))
    } catch (e) { console.error(e) }

    try {
      const storedQuizzesStr = localStorage.getItem('elmotaqadem_quizzes')
      if (storedQuizzesStr) setQuizzes(JSON.parse(storedQuizzesStr))
    } catch (e) { console.error(e) }

    try {
      const storedQuestsStr = localStorage.getItem('elmotaqadem_daily_quests')
      if (storedQuestsStr) setDailyQuests(JSON.parse(storedQuestsStr))
    } catch (e) { console.error(e) }

    try {
      const storedSubmissionsStr = localStorage.getItem('elmotaqadem_quiz_submissions')
      if (storedSubmissionsStr) setSubmissions(JSON.parse(storedSubmissionsStr))
    } catch (e) { console.error(e) }

    // 2. Subscribe to Firestore real-time updates (overrides localStorage when data arrives)
    const unsubScouts = subscribeScouts(
      (scouts) => {
        setAllScouts(scouts)
        localStorage.setItem('elmotaqadem_all_scouts', JSON.stringify(scouts))
        setFirebaseReady(true)
      },
      () => {
        console.warn('Firestore scouts subscription failed – using localStorage')
      }
    )

    const unsubQuizzes = subscribeQuizzes(
      (list) => {
        if (list.length > 0) {
          setQuizzes(list)
          localStorage.setItem('elmotaqadem_quizzes', JSON.stringify(list))
        }
      },
      () => {
        console.warn('Firestore quizzes subscription failed – using localStorage')
      }
    )

    const unsubQuests = subscribeQuests(
      (list) => {
        if (list.length > 0) {
          setDailyQuests(list)
          localStorage.setItem('elmotaqadem_daily_quests', JSON.stringify(list))
        }
      },
      () => {
        console.warn('Firestore quests subscription failed – using localStorage')
      }
    )

    const unsubSubmissions = subscribeSubmissions(
      (list) => {
        setSubmissions(list)
        localStorage.setItem('elmotaqadem_quiz_submissions', JSON.stringify(list))
      },
      () => {
        console.warn('Firestore submissions subscription failed – using localStorage')
      }
    )

    return () => {
      unsubScouts()
      unsubQuizzes()
      unsubQuests()
      unsubSubmissions()
    }
  }, [])



  // Sync helpers – writes to BOTH localStorage and Firestore
  const saveScouts = (updatedScouts: ScoutUser[]) => {
    setAllScouts(updatedScouts)
    try {
      localStorage.setItem('elmotaqadem_all_scouts', JSON.stringify(updatedScouts))
    } catch (e) { console.error(e) }
  }

  const saveCurrentUser = (user: ScoutUser | null) => {
    setCurrentUser(user)
    try {
      if (user) {
        localStorage.setItem('elmotaqadem_current_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('elmotaqadem_current_user')
      }
    } catch (e) { console.error(e) }
  }

  const handleUpdateUser = (updatedUser: ScoutUser) => {
    saveCurrentUser(updatedUser)
    const exists = allScouts.some((s) => s.id === updatedUser.id)
    const updatedList = exists
      ? allScouts.map((s) => (s.id === updatedUser.id ? updatedUser : s))
      : [updatedUser, ...allScouts]
    saveScouts(updatedList)

    // Sync to Firestore
    saveScoutToFirestore(updatedUser).catch((err) =>
      console.warn('Failed to sync scout to Firestore:', err)
    )
  }

  const handleLoginSuccess = (user: ScoutUser) => {
    handleUpdateUser(user)
    setIsAuthModalOpen(false)
  }

  const handleLogout = () => {
    saveCurrentUser(null)
  }

  // Quizzes Points Award
  const handleAwardQuizPoints = (points: number, quizTitle: string) => {
    if (!currentUser) return

    const newPoints = currentUser.points + points
    const newCompletedTasks = [...(currentUser.completedTasks || []), quizTitle]
    const newUnlockedBadges = [...(currentUser.unlockedBadges || [])]

    DEFAULT_BADGES.forEach((b) => {
      if (newPoints >= b.requiredPoints && !newUnlockedBadges.includes(b.id)) {
        newUnlockedBadges.push(b.id)
      }
    })

    const updatedUser: ScoutUser = {
      ...currentUser,
      points: newPoints,
      completedTasks: newCompletedTasks,
      unlockedBadges: newUnlockedBadges,
    }

    handleUpdateUser(updatedUser)
  }

  // Quiz submission handler (records scout answers, order, timing, and score)
  const handleQuizSubmission = (submission: QuizSubmission) => {
    const updatedSubmissions = [submission, ...submissions]
    setSubmissions(updatedSubmissions)
    try {
      localStorage.setItem('elmotaqadem_quiz_submissions', JSON.stringify(updatedSubmissions))
    } catch (e) { console.error(e) }

    if (submission.earnedPoints > 0) {
      handleAwardQuizPoints(submission.earnedPoints, submission.quizTitle)
    }

    saveQuizSubmissionToFirestore(submission).catch((err) =>
      console.warn('Failed to sync submission to Firestore:', err)
    )
  }

  // Admin / Leader Actions

  const handleAddQuiz = (quiz: Quiz) => {
    const updated = [quiz, ...quizzes]
    setQuizzes(updated)
    try {
      localStorage.setItem('elmotaqadem_quizzes', JSON.stringify(updated))
    } catch (e) { console.error(e) }

    // Sync to Firestore
    saveQuizToFirestore(quiz).catch((err) =>
      console.warn('Failed to sync quiz to Firestore:', err)
    )
  }

  const handleDeleteQuiz = (quizId: string) => {
    const updated = quizzes.filter((q) => q.id !== quizId)
    setQuizzes(updated)
    try {
      localStorage.setItem('elmotaqadem_quizzes', JSON.stringify(updated))
    } catch (e) { console.error(e) }

    // Sync to Firestore
    deleteQuizFromFirestore(quizId).catch((err) =>
      console.warn('Failed to delete quiz from Firestore:', err)
    )
  }

  const handleAddQuest = (quest: DailyQuest) => {
    const updated = [quest, ...dailyQuests]
    setDailyQuests(updated)
    try {
      localStorage.setItem('elmotaqadem_daily_quests', JSON.stringify(updated))
    } catch (e) { console.error(e) }

    // Sync to Firestore
    saveQuestToFirestore(quest).catch((err) =>
      console.warn('Failed to sync quest to Firestore:', err)
    )
  }

  const handleDeleteQuest = (questId: string) => {
    const updated = dailyQuests.filter((q) => q.id !== questId)
    setDailyQuests(updated)
    try {
      localStorage.setItem('elmotaqadem_daily_quests', JSON.stringify(updated))
    } catch (e) { console.error(e) }

    // Sync to Firestore
    deleteQuestFromFirestore(questId).catch((err) =>
      console.warn('Failed to delete quest from Firestore:', err)
    )
  }

  // Award or Deduct Scout Points
  const handleAwardScoutPoints = (scoutId: string, amount: number) => {
    const updatedList = allScouts.map((s) => {
      if (s.id === scoutId) {
        const newPoints = Math.max(0, s.points + amount)
        const newBadges = [...(s.unlockedBadges || [])]
        DEFAULT_BADGES.forEach((b) => {
          if (newPoints >= b.requiredPoints && !newBadges.includes(b.id)) {
            newBadges.push(b.id)
          }
        })
        return { ...s, points: newPoints, unlockedBadges: newBadges }
      }
      return s
    })

    saveScouts(updatedList)

    if (currentUser && currentUser.id === scoutId) {
      const updatedCurrent = updatedList.find((s) => s.id === scoutId)
      if (updatedCurrent) {
        saveCurrentUser(updatedCurrent)
      }
    }

    // Sync full updated scout to Firestore
    const updatedScout = updatedList.find((s) => s.id === scoutId)
    if (updatedScout) {
      saveScoutToFirestore(updatedScout).catch((err) =>
        console.warn('Failed to sync scout points to Firestore:', err)
      )
    }
  }

  // Delete Scout Participant
  const handleDeleteScout = (scoutId: string) => {
    const updatedList = allScouts.filter((s) => s.id !== scoutId)
    saveScouts(updatedList)
    if (currentUser && currentUser.id === scoutId) {
      saveCurrentUser(null)
    }

    // Sync to Firestore
    deleteScoutFromFirestore(scoutId).catch((err) =>
      console.warn('Failed to delete scout from Firestore:', err)
    )
  }

  // Leaderboard Previews
  const leaderboardPreview = [...allScouts]
    .sort((a, b) => b.points - a.points)
    .map((s) => ({
      name: s.fullName,
      score: s.points,
      rank: s.rank,
      avatar: s.avatar,
    }))

  return (
    <div className="min-h-screen bg-[#081127] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as 'home' | 'quizzes' | 'leaderboard' | 'leader')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setActiveTab('leader')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomePage
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onNavigateQuizzes={() => setActiveTab('quizzes')}
            onNavigateLeaderboard={() => setActiveTab('leaderboard')}
            onUpdateUser={handleUpdateUser}
            leaderboardPreview={leaderboardPreview}
            dailyQuests={dailyQuests}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizzesPage
            currentUser={currentUser}
            quizzes={quizzes}
            submissions={submissions}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onAwardQuizPoints={handleAwardQuizPoints}
            onSubmitQuiz={handleQuizSubmission}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardPage currentUser={currentUser} allScouts={allScouts} />
        )}

        {activeTab === 'leader' && (
          <LeaderPage
            quizzes={quizzes}
            onAddQuiz={handleAddQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            allScouts={allScouts}
            onAwardScoutPoints={handleAwardScoutPoints}
            onDeleteScout={handleDeleteScout}
            dailyQuests={dailyQuests}
            onAddQuest={handleAddQuest}
            onDeleteQuest={handleDeleteQuest}
            submissions={submissions}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-950/40 bg-[#060c1d] py-6 text-center text-xs text-blue-300/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-6 overflow-hidden rounded-full bg-white p-0.5">
              <img src="/logo.png" alt="لوجو الكشافة" className="h-full w-full object-contain" />
            </div>
            <span className="text-amber-400 font-bold">مجموعة المتقدم الكشفية</span>
            <span>-</span>
            <span>بالمحبة اخدموا بعضكم بعضاً • كن مستعداً</span>
          </div>
          <div>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} كشافة مرحلة المتقدم • الكاروزي
          </div>
        </div>
      </footer>

      {/* Login & Register Modal */}
      {isAuthModalOpen && (
        <LoginPage
          currentUser={currentUser}
          allScouts={allScouts}
          onSuccess={handleLoginSuccess}
          onClose={() => setIsAuthModalOpen(false)}
          onSwitchToAdmin={() => {
            setIsAuthModalOpen(false)
            setActiveTab('leader')
          }}
        />
      )}

    </div>

  )
}
