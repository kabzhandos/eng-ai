import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Zap,
  Target,
  ShieldCheck,
  GraduationCap,
  Compass,
} from 'lucide-react';
import { CefrLevel } from '@/types';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    // Landing view for unauthenticated visitors
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
        {/* Hero badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Генеративный ИИ вместо статических баз вопросов</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-2xl leading-tight">
          Изучайте грамматику английского{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            без зазубривания ответов
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Каждое задание генерируется нейросетью в реальном времени под ваш уровень (A1–B2). При ошибке ИИ объясняет суть правила и тут же дает совершенно новый пример.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
          >
            Начать тренировки
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-sm transition-all"
          >
            Войти в аккаунт
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl w-full">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              Zero Static Questions
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Невозможно списать или запомнить тест. Каждое предложение генерируется с нуля под ваш уровень.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              Smart Retry (Разбор ошибок)
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Ошиблись? ИИ объяснит на понятном русском языке, почему ваш ответ неверен, и предложит новое задание.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
              Контроль зависаний
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Если ученик буксует на правиле больше 5 раз, система сразу сигнализирует об этом учителю.
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
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Здравствуйте, {user.fullName}!
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          Вы вошли в систему как преподаватель. Управляйте учебными группами и отслеживайте зоны зависания учеников.
        </p>
        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-colors"
        >
          Перейти в панель учителя
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Student Dashboard: Grammar Topic Tree & Enrolled Class Focus Topic
  const [topics, enrolledMembership] = await Promise.all([
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
  ]);

  const teacherFocusTopic = enrolledMembership?.class?.focusTopic;

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
    <div className="space-y-8">
      {/* Student Level Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-lg shadow-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
            Личный кабинет ученика
          </span>
          <h1 className="text-2xl font-bold mt-1">{user.fullName}</h1>
          <p className="text-xs text-indigo-100 mt-1">
            Текущий подтвержденный уровень:{' '}
            <span className="font-bold underline decoration-indigo-300">
              {user.currentLevel}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/placement"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold text-white border border-white/20 transition-all shadow-sm"
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Тест уровня (Placement)</span>
          </Link>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
            <Trophy className="w-6 h-6 text-amber-300 shrink-0" />
            <div className="text-left">
              <span className="block text-[11px] text-indigo-100">Усвоено тем</span>
              <span className="text-lg font-bold">
                {masteredCount} / {topics.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Focus Assignment Banner */}
      {teacherFocusTopic && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Задание от преподавателя ({enrolledMembership?.class?.name})
              </span>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Фокус недели: [{teacherFocusTopic.level}] {teacherFocusTopic.title}
              </h2>
            </div>
          </div>
          <Link
            href={`/practice/${teacherFocusTopic.id}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>Выполнить задание</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Topics Tree by CEFR Levels */}
      <div className="space-y-8">
        {levelOrder.map((lvl) => {
          const levelTopics = topicsByLevel[lvl];
          if (!levelTopics || levelTopics.length === 0) return null;

          const isCurrentOrPassedLevel =
            levelOrder.indexOf(lvl) <= levelOrder.indexOf(user.currentLevel as CefrLevel);

          return (
            <div key={lvl} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs">
                  Уровень {lvl}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {lvl === 'A1' && 'Начальный — базовые конструкции и рутины'}
                  {lvl === 'A2' && 'Элементарный — прошедшее время и сравнения'}
                  {lvl === 'B1' && 'Средний — времена группы Perfect и Conditionals 1-2'}
                  {lvl === 'B2' && 'Выше среднего — пассив, модальные глаголы догадки'}
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
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between bg-white dark:bg-zinc-900 ${
                        isMastered
                          ? 'border-emerald-300 dark:border-emerald-800 shadow-sm'
                          : isBottleneck
                          ? 'border-rose-300 dark:border-rose-800 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            Тема #{topic.orderIndex}
                          </span>

                          {isMastered && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Освоено
                            </span>
                          )}

                          {isBottleneck && !isMastered && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Зона зависания
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">
                          {progress?.totalAttempts ? `Попыток: ${progress.totalAttempts}` : 'Еще не решали'}
                        </span>

                        <Link
                          href={`/practice/${topic.id}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-colors flex items-center gap-1"
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
