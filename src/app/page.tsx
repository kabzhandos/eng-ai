import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap,
  Target,
  ShieldCheck,
  GraduationCap,
  Compass,
  Star,
  BookOpen,
  Heart,
  Smile,
} from 'lucide-react';
import { CefrLevel } from '@/types';
import StudentQuestionsSection from '@/components/StudentQuestionsSection';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    // Landing view for unauthenticated visitors
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-14 text-center">
        {/* Friendly Hero Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Умный тренажер без зубрежки и скучных тестов</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 max-w-2xl leading-[1.15]">
          Английская грамматика, которую ты наконец{' '}
          <span className="text-indigo-600 dark:text-indigo-400 underline decoration-amber-300 dark:decoration-amber-500 decoration-wavy decoration-2">
            полюбишь
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
          ИИ создает живые примеры в реальном времени под твой уровень. Ошибся? Никаких двоек: система по-человечески объяснит правило и сразу предложит свежий пример.
        </p>

        {/* Tactile CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Начать бесплатно</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/placement"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 font-semibold text-sm transition-all shadow-2xs"
          >
            Пройти тест уровня (20 вопросов)
          </Link>
        </div>

        {/* Feature Cards Grid (Paper style) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 text-left max-w-4xl w-full">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 text-xl">
              🎲
            </div>
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1.5">
              Новые примеры каждый раз
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Больше никаких статических сборников. Предложения генерируются на лету — тренируй интуицию, а не память на ответы.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 text-xl">
              💡
            </div>
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1.5">
              Smart Retry (Разбор ошибок)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Не просто красный крестик. ИИ бережно объяснит, почему ответ неверен, подскажет лайфхак-маркер и даст закрепить правило.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-purple-300 dark:hover:border-purple-800 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 text-xl">
              🌱
            </div>
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mb-1.5">
              Словарь под твой уровень
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Если учишь правило A2, ты не встретишь незнакомых заумных слов из C1. Ты учишь чистую грамматику без стресса.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Teacher redirect / prompt
  if (user.role === 'TEACHER') {
    return (
      <div className="py-12 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4 text-2xl">
          👩‍🏫
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Здравствуйте, {user.fullName}!
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Вы вошли в систему как преподаватель. Управляйте учебными группами, слепыми зонами и фокусными темами.
        </p>
        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          Перейти в панель учителя
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Student Dashboard: Grammar Topic Tree, Enrolled Class Focus Topic & Question Flags
  const [topics, enrolledMembership, questionFlags] = await Promise.all([
    prisma.grammarTopic.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        progressRecords: {
          where: { userId: user.userId },
        },
      },
    }),
    prisma.classMember.findFirst({
      where: { studentId: user.userId },
      include: {
        class: {
          include: {
            focusTopic: true,
          },
        },
      },
    }),
    prisma.teacherQuestionFlag.findMany({
      where: { studentId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        topic: { select: { id: true, title: true, level: true } },
      },
    }),
  ]);

  const teacherFocusTopic = enrolledMembership?.class?.focusTopic;

  const formattedFlags = questionFlags.map((qf) => ({
    id: qf.id,
    topicId: qf.topicId,
    topicTitle: qf.topic.title,
    topicLevel: qf.topic.level,
    questionText: qf.questionText,
    studentAnswer: qf.studentAnswer,
    correctAnswer: qf.correctAnswer,
    explanation: qf.explanation,
    studentComment: qf.studentComment,
    status: qf.status,
    createdAt: qf.createdAt.toISOString(),
  }));

  const levelOrder: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const topicsByLevel: Record<CefrLevel, typeof topics> = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
  };

  topics.forEach((t) => {
    const lvl = t.level as CefrLevel;
    if (topicsByLevel[lvl]) {
      topicsByLevel[lvl].push(t);
    }
  });

  const masteredCount = topics.filter(
    (t) => t.progressRecords[0]?.isMastered
  ).length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner (Warm EdTech style) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
            <span>👋</span>
            <span>Добро пожаловать в тренажер</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50">
            Привет, {user.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Твой подтвержденный уровень:{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800">
              {user.currentLevel}
            </span>
            <span className="mx-2 text-stone-300">•</span>
            <span>Выбирай тему и решай в своем темпе</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/placement"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-all"
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Тест уровня (20 вопр.)</span>
          </Link>

          <div className="flex items-center gap-3 bg-amber-50/60 dark:bg-amber-950/30 px-4 py-2.5 rounded-2xl border border-amber-200/70 dark:border-amber-800/60">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Освоено
              </span>
              <span className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {masteredCount} / {topics.length} тем
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Focus Assignment Banner */}
      {teacherFocusTopic && (
        <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                🎯 Задание от преподавателя ({enrolledMembership?.class?.name})
              </span>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                Тема недели: [{teacherFocusTopic.level}] {teacherFocusTopic.title}
              </h2>
            </div>
          </div>
          <Link
            href={`/practice/${teacherFocusTopic.id}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>Выполнить задание</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Student Question Flags (Пометки "Спросить учителя") */}
      <StudentQuestionsSection initialFlags={formattedFlags} />

      {/* Topics Tree by CEFR Levels */}
      <div className="space-y-7 pt-2">
        {levelOrder.map((lvl) => {
          const levelTopics = topicsByLevel[lvl];
          if (!levelTopics || levelTopics.length === 0) return null;

          const levelEmoji = lvl === 'A1' ? '🌱' : lvl === 'A2' ? '🌿' : lvl === 'B1' ? '🚀' : '⭐';
          const levelDesc =
            lvl === 'A1'
              ? 'Начальный — базовые конструкции и привычки'
              : lvl === 'A2'
              ? 'Элементарный — прошедшее время и сравнения'
              : lvl === 'B1'
              ? 'Средний — времена Perfect и Conditionals 1-2'
              : 'Выше среднего — пассивный залог и сложные модальные глаголы';

          return (
            <div key={lvl} className="space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-extrabold text-xs border border-stone-200/60 dark:border-stone-700">
                  <span>{levelEmoji}</span>
                  <span>Уровень {lvl}</span>
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {levelDesc}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {levelTopics.map((topic) => {
                  const progress = topic.progressRecords[0] || null;
                  const isMastered = progress?.isMastered ?? false;
                  const isBottleneck = progress?.isBottleneck ?? false;

                  return (
                    <div
                      key={topic.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between bg-white dark:bg-[#19202E] ${
                        isMastered
                          ? 'border-emerald-300/80 dark:border-emerald-800/80 shadow-2xs'
                          : isBottleneck
                          ? 'border-amber-300 dark:border-amber-800/80 shadow-2xs'
                          : 'border-[#EEE8DE] dark:border-[#273145] hover:border-indigo-300 dark:hover:border-indigo-700 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            Тема #{topic.orderIndex}
                          </span>

                          {isMastered && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Освоено
                            </span>
                          )}

                          {isBottleneck && !isMastered && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80">
                              <AlertTriangle className="w-3 h-3" />
                              Зона внимания
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug mb-1.5">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400">
                          {progress?.totalAttempts ? `Попыток: ${progress.totalAttempts}` : 'Еще не решали'}
                        </span>

                        <Link
                          href={`/practice/${topic.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <span>{isMastered ? 'Повторить' : 'Решать'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
