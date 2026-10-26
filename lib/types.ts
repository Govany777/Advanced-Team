export interface ScoutUser {
  id: string
  fullName: string
  scoutCode: string
  rank: string // الرتبة الكشفية
  phone: string
  address: string
  password?: string
  points: number
  streak: number
  completedTasks: string[]
  unlockedBadges: string[]
  avatar: string
  joinedDate: string
  team?: string // اختياري للتوافق مع البيانات القديمة
}

export interface QuizQuestion {
  id: string
  question: string
  type?: 'اختياري' | 'صح وغلط' | 'مقالي'
  options?: string[]
  correctIndex?: number
  modelAnswer?: string
}

export interface Quiz {
  id: string
  title: string
  category: string
  type: string // 'اختياري' | 'صح وغلط' | 'مقالي'
  points: number
  durationMinutes: number
  password?: string // كلمة مرور السؤال التي يحددها الليدر
  opensAt: string
  closesAt: string
  questions: QuizQuestion[]
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  points: number
  category: string
  iconName: string
  completed?: boolean
}

export interface Badge {
  id: string
  title: string
  description: string
  requiredPoints: number
  icon: string
  levelName: string
  accentColor: string
}

export interface LeaderboardMember {
  id: string
  name: string
  rank: string
  score: number
  avatar: string
  initials: string
  team?: string
  isCurrentUser?: boolean
}

export interface QuestionAnswerDetail {
  questionId: string
  questionText: string
  questionType: 'اختياري' | 'صح وغلط' | 'مقالي' | string
  userAnswer: string | number
  userAnswerLabel?: string
  correctAnswer?: string | number
  correctAnswerLabel?: string
  isCorrect?: boolean
}

export interface QuizSubmission {
  id: string
  quizId: string
  quizTitle: string
  userId: string
  userName: string
  scoutCode: string
  userRank: string
  userAvatar?: string
  earnedPoints: number
  maxPoints: number
  submittedAt: string
  timeTakenSeconds: number
  answers: QuestionAnswerDetail[]
}

export interface QuizAnswerRecord {
  id?: string
  quizId: string
  quizTitle: string
  quizCategory: string
  quizType: string
  earnedPoints: number
  maxPoints: number
  answeredAt: string
  answers: QuestionAnswerDetail[]
}


