import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { DailyQuest, Quiz, QuizAnswerRecord, QuizSubmission, ScoutUser } from './types'

// Collection references
export const SCOUTS_COLLECTION = 'scouts'
export const QUIZZES_COLLECTION = 'quizzes'
export const QUESTS_COLLECTION = 'quests'
export const SUBMISSIONS_COLLECTION = 'submissions'


// -------------------------------------------------------------
// SCOUTS REALTIME SUBSCRIPTION & OPERATIONS
// -------------------------------------------------------------

export function subscribeScouts(
  onData: (scouts: ScoutUser[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, SCOUTS_COLLECTION), orderBy('points', 'desc'))
    return onSnapshot(
      q,
      (snapshot) => {
        const scouts: ScoutUser[] = []
        snapshot.forEach((docSnap) => {
          scouts.push(docSnap.data() as ScoutUser)
        })
        onData(scouts)
      },
      (err) => {
        console.warn('Firestore subscribeScouts error, falling back to local:', err)
        if (onError) onError(err)
      }
    )
  } catch (err: any) {
    console.warn('subscribeScouts init error:', err)
    if (onError) onError(err)
    return () => {}
  }
}

export async function saveScoutToFirestore(scout: ScoutUser): Promise<void> {
  const scoutRef = doc(db, SCOUTS_COLLECTION, scout.id)
  await setDoc(
    scoutRef,
    {
      ...scout,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function deleteScoutFromFirestore(scoutId: string): Promise<void> {
  const scoutRef = doc(db, SCOUTS_COLLECTION, scoutId)
  await deleteDoc(scoutRef)
}

export async function updateScoutPointsInFirestore(
  scoutId: string,
  deltaPoints: number
): Promise<void> {
  const scoutRef = doc(db, SCOUTS_COLLECTION, scoutId)
  await updateDoc(scoutRef, {
    points: increment(deltaPoints),
    updatedAt: serverTimestamp(),
  })
}

// -------------------------------------------------------------
// HIERARCHICAL ANSWERS STORAGE (scouts/{scoutId}/answers/{quizId})
// -------------------------------------------------------------

/**
 * Saves a quiz answer record under the scout's hierarchical document:
 * /scouts/{scoutId}/answers/{quizId}
 * Also increments the scout's total points and marks the task as completed.
 */
export async function saveScoutAnswerRecord(
  scoutId: string,
  record: QuizAnswerRecord
): Promise<void> {
  // 1. Save in hierarchical subcollection
  const answerDocRef = doc(db, SCOUTS_COLLECTION, scoutId, 'answers', record.quizId)
  await setDoc(answerDocRef, {
    ...record,
    savedAt: serverTimestamp(),
  })

  // 2. Update parent scout points and completedTasks
  const scoutRef = doc(db, SCOUTS_COLLECTION, scoutId)
  const scoutSnap = await getDoc(scoutRef)
  if (scoutSnap.exists()) {
    const data = scoutSnap.data() as ScoutUser
    const currentCompleted = Array.isArray(data.completedTasks) ? data.completedTasks : []
    const updatedCompleted = currentCompleted.includes(record.quizTitle)
      ? currentCompleted
      : [...currentCompleted, record.quizTitle]

    await updateDoc(scoutRef, {
      points: increment(record.earnedPoints),
      completedTasks: updatedCompleted,
      updatedAt: serverTimestamp(),
    })
  }
}

/**
 * Retrieves all submitted quiz answers for a given scout.
 * Used for the hierarchical viewer when a leader or scout clicks on an ID.
 */
export async function getScoutAnswerRecords(scoutId: string): Promise<QuizAnswerRecord[]> {
  try {
    const answersCol = collection(db, SCOUTS_COLLECTION, scoutId, 'answers')
    const q = query(answersCol, orderBy('answeredAt', 'desc'))
    const snap = await getDocs(q)
    const records: QuizAnswerRecord[] = []
    snap.forEach((d) => {
      records.push(d.data() as QuizAnswerRecord)
    })
    return records
  } catch (e) {
    console.warn(`Could not fetch answers for scout ${scoutId}:`, e)
    return []
  }
}

// -------------------------------------------------------------
// QUIZZES OPERATIONS
// -------------------------------------------------------------

export function subscribeQuizzes(
  onData: (quizzes: Quiz[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, QUIZZES_COLLECTION))
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Quiz[] = []
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Quiz)
        })
        onData(list)
      },
      (err) => {
        console.warn('Firestore subscribeQuizzes error:', err)
        if (onError) onError(err)
      }
    )
  } catch (err: any) {
    if (onError) onError(err)
    return () => {}
  }
}

export async function saveQuizToFirestore(quiz: Quiz): Promise<void> {
  const quizRef = doc(db, QUIZZES_COLLECTION, quiz.id)
  await setDoc(
    quizRef,
    {
      ...quiz,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function deleteQuizFromFirestore(quizId: string): Promise<void> {
  const quizRef = doc(db, QUIZZES_COLLECTION, quizId)
  await deleteDoc(quizRef)
}

// -------------------------------------------------------------
// QUESTS OPERATIONS
// -------------------------------------------------------------

export function subscribeQuests(
  onData: (quests: DailyQuest[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, QUESTS_COLLECTION))
    return onSnapshot(
      q,
      (snapshot) => {
        const list: DailyQuest[] = []
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as DailyQuest)
        })
        onData(list)
      },
      (err) => {
        console.warn('Firestore subscribeQuests error:', err)
        if (onError) onError(err)
      }
    )
  } catch (err: any) {
    if (onError) onError(err)
    return () => {}
  }
}

export async function saveQuestToFirestore(quest: DailyQuest): Promise<void> {
  const questRef = doc(db, QUESTS_COLLECTION, quest.id)
  await setDoc(
    questRef,
    {
      ...quest,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function deleteQuestFromFirestore(questId: string): Promise<void> {
  const questRef = doc(db, QUESTS_COLLECTION, questId)
  await deleteDoc(questRef)
}

// -------------------------------------------------------------
// QUIZ SUBMISSIONS OPERATIONS (TRACKING SCOUT ANSWERS & ORDER)
// -------------------------------------------------------------

export function subscribeSubmissions(
  onData: (submissions: QuizSubmission[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'asc'))
    return onSnapshot(
      q,
      (snapshot) => {
        const list: QuizSubmission[] = []
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as QuizSubmission)
        })
        onData(list)
      },
      (err) => {
        console.warn('Firestore subscribeSubmissions error:', err)
        if (onError) onError(err)
      }
    )
  } catch (err: any) {
    if (onError) onError(err)
    return () => {}
  }
}

export async function saveQuizSubmissionToFirestore(submission: QuizSubmission): Promise<void> {
  const ref = doc(db, SUBMISSIONS_COLLECTION, submission.id)
  await setDoc(
    ref,
    {
      ...submission,
      timestamp: serverTimestamp(),
    },
    { merge: true }
  )
}

