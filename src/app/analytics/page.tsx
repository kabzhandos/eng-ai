'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  Flame,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { CefrLevel } from '@/types';

interface AnalyticsData {
  summary: {
    totalAttempts: number;
    correctAttempts: number;
    accuracyPercentage: number;
    masteredCount: number;
    bottleneckCount: number;
    benchmarkPercent: number;
    currentLevel: string;
  };
  levelStats: Record<
    CefrLevel,
    { total: number; correct: number; masteredTopics: number }
  >;
  recentAttempts: {
    id: string;
    topicTitle: string;
    topicLevel: string;
    isCorrect: boolean;
    studentAnswer: string;
    createdAt: string;
  }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Загрузка статистики и аналитики...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        Не удалось загрузить данные аналитики.
      </div>
    );
  }

  const { summary, levelStats, recentAttempts } = data;
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К списку тем</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Уровень: {summary.currentLevel}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Статистика и аналитика успеваемости
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Детальный срез точности, прогресс по уровням CEFR и динамика тренировок
        </p>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
          <span className="block text-xs font-semibold text-zinc-400 mb-1">Точность ответов</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {summary.accuracyPercentage}%
          </span>
          <span className="block text-[11px] text-zinc-400 mt-1">
            {summary.correctAttempts} из {summary.totalAttempts}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
          <span className="block text-xs font-semibold text-zinc-400 mb-1">Освоено тем</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.masteredCount}
          </span>
          <span className="block text-[11px] text-zinc-400 mt-1">
            3+ верных подряд
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
          <span className="block text-xs font-semibold text-zinc-400 mb-1">Зоны зависания</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {summary.bottleneckCount}
          </span>
          <span className="block text-[11px] text-zinc-400 mt-1">
            &gt;5 ошибок на правило
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
          <span className="block text-xs font-semibold text-zinc-400 mb-1">Рейтинг потока</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
            ТОП {100 - summary.benchmarkPercent || 15}%
          </span>
          <span className="block text-[11px] text-zinc-400 mt-1">
            Среди учеников
          </span>
        </div>
      </div>

      {/* Global Benchmark Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Ваш результат выше, чем у {summary.benchmarkPercent}% сверстников!
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Система генерирует уникальные задания без повторений, развивая интуитивное понимание грамматических правил.
          </p>
        </div>
      </div>

      {/* Level Breakdown Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Разбивка по уровням CEFR (A1–B2)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levels.map((lvl) => {
            const stat = levelStats[lvl] || { total: 0, correct: 0, masteredTopics: 0 };
            const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

            return (
              <div
                key={lvl}
                className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                    Уровень {lvl}
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Точность: {pct}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden my-3">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Решено заданий: {stat.total}</span>
                  <span>Освоено тем: {stat.masteredTopics}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts History */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          История последних ответов
        </h2>

        {recentAttempts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-6 text-center">
            Вы еще не выполнили ни одного задания. Выберите тему на главной странице и начните тренировку!
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {att.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {att.topicTitle}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-zinc-400">
                      [{att.topicLevel}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <span className="font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {att.studentAnswer}
                  </span>
                  <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                    {new Date(att.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

