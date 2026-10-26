import { Badge, DailyQuest, Quiz, ScoutUser } from './types'

export const SCOUT_RANKS = [
  'كشاف مبتدئ ⚜️',
  'كشاف ثانٍ 🎖️',
  'كشاف أول 🥉',
  'مساعد عريف 🏅',
  'عريف أول 🎗️',
  'قائد كشفي 👑',
]

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'badge-100',
    title: 'وسام الكشاف المبادر (100 نقطة)',
    description: 'يُمنح عند وصول الكشاف إلى أول 100 نقطة من الأنشطة والمهام',
    requiredPoints: 100,
    icon: '🥉',
    levelName: 'المستوى الأول',
    accentColor: 'from-amber-600 to-amber-700',
  },
  {
    id: 'badge-200',
    title: 'وسام التميز الكشفي (200 نقطة)',
    description: 'يُمنح عند الوصول إلى 200 نقطة تقديراً للالتزام والتفوق',
    requiredPoints: 200,
    icon: '🥈',
    levelName: 'المستوى الثاني',
    accentColor: 'from-slate-400 to-slate-600',
  },
  {
    id: 'badge-300',
    title: 'وسام بطل المجموعة الكشفية (300 نقطة)',
    description: 'يُمنح عند جمع 300 نقطة لصالح المجموعة وروح المبادرة',
    requiredPoints: 300,
    icon: '🥇',
    levelName: 'المستوى الثالث',
    accentColor: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'badge-400',
    title: 'وسام الريادة الكشفية (400 نقطة)',
    description: 'يُمنح عند تحقيق 400 نقطة وإظهار روح القيادة والقدوة الحسنة',
    requiredPoints: 400,
    icon: '👑',
    levelName: 'المستوى الرابع',
    accentColor: 'from-purple-500 to-indigo-700',
  },
  {
    id: 'badge-500',
    title: 'وسام النجم الكشفي الذهبي (500 نقطة)',
    description: 'يُمنح عند كسر حاجز 500 نقطة تقديراً للعطاء والجهد الاستثنائي',
    requiredPoints: 500,
    icon: '🌟',
    levelName: 'المستوى الخامس',
    accentColor: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'badge-600',
    title: 'وسام شرف المجموعة الأكبر (600 نقطة)',
    description: 'أعلى وسام شرفي في المجموعة لمن يتجاوز 600 نقطة كشفية',
    requiredPoints: 600,
    icon: '⚜️',
    levelName: 'الرتبة الكبرى',
    accentColor: 'from-blue-600 to-cyan-500',
  },
]

export const DEFAULT_DAILY_QUESTS: DailyQuest[] = []

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-scout-basics',
    title: 'تحدي أساسيات وتقاليد الكشافة',
    category: 'مبادئ كشفية',
    type: 'اختياري',
    points: 30,
    durationMinutes: 5,
    opensAt: new Date(Date.now() - 86400000).toISOString(),
    closesAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'من هو مؤسس الحركة الكشفية العالمية؟',
        type: 'اختياري',
        options: [
          'اللورد روبرت بادن باول',
          'إرنست تومسون سيتون',
          'دانيال كارتر بيرد',
          'وليم بويس',
        ],
        correctIndex: 0,
      },
      {
        id: 'q2',
        question: 'ما هو الشعار الكشفي الدائم للكشاف؟',
        type: 'اختياري',
        options: ['دائماً مستعد', 'كن مستعداً', 'نحو القمة', 'شرف ووفاء'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        question: 'بأي يد يؤدي الكشاف التحية باليد والمصافحة؟',
        type: 'اختياري',
        options: [
          'المصافحة باليد اليمنى والتحية باليسرى',
          'المصافحة باليد اليسرى كرمز للأخوة والتحية باليمنى',
          'كلتا الحركتين باليد اليمنى فقط',
          'كلتا الحركتين باليد اليسرى فقط',
        ],
        correctIndex: 1,
      },
      {
        id: 'q4',
        question: 'ما هي العقدة المستخدمة لربط حبلين متساويين في السمك؟',
        type: 'اختياري',
        options: ['العقدة الأفقية (المربعة)', 'العقدة الوتدية', 'عقدة الحطاب', 'عقدة السماك'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'quiz-firstaid-field',
    title: 'اختبار الإسعافات الأولية الميدانية',
    category: 'إسعافات وطوارئ',
    type: 'اختياري',
    points: 25,
    durationMinutes: 4,
    opensAt: new Date(Date.now() - 86400000).toISOString(),
    closesAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    questions: [
      {
        id: 'fa1',
        question: 'ما هو أول تصرف سليم عند حدوث حرق بسيط من الدرجة الأولى؟',
        type: 'اختياري',
        options: [
          'وضع معجون أسنان أو زيت',
          'تبريد الحرق بماء جارٍ فاتر/بارد لمدة 10-15 دقيقة',
          'تغطية الحرق بقطن جاف فوراً',
          'فقء الفقاقيع الجلدية المتكونة',
        ],
        correctIndex: 1,
      },
      {
        id: 'fa2',
        question: 'عند حدوث نزيف خارجي، ما هي الخطوة الأهم للسيطرة عليه؟',
        type: 'اختياري',
        options: [
          'الضغط المباشر على الجرح بضمادة نظيفة ورفع العضو إن أمكن',
          'غسل الجرح بالماء والصابون بقوة',
          'ترك الجرح مكشوفاً للهواء ليجف',
          'وضع رباط ضاغط شديد على الرقبة',
        ],
        correctIndex: 0,
      },
      {
        id: 'fa3',
        question: 'ما هي وضعية الإفاقة السليمة للمصاب الفاقد للوعي الذي يتنفس بانتظام؟',
        type: 'اختياري',
        options: [
          'وضعه مستلقياً على ظهره مع رفع رأسه',
          'وضعه نائماً على بطنه',
          'وضعه على جنبه (الجانبية المستقرة) لضمان مجرى التنفس',
          'إجلاسه على كرسي وجعل رأسه للأمام',
        ],
        correctIndex: 2,
      },
    ],
  },
]

export const SAMPLE_SCOUTS: ScoutUser[] = []
