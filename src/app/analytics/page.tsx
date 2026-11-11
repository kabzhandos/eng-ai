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
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center animate-bounce mx-auto mb-3 text-2xl">
          📊
        </div>
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
          Загрузка аналитики успеваемости...
        </p>
        <p className="text-xs text-stone-400 mt-1">Сбор данных по пройденным упражнениям</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-sm text-stone-500">
        Не удалось загрузить данные аналитики.
      </div>
    );
  }

  const { summary, levelStats, recentAttempts } = data;
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full py-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-xs font-bold text-stone-600 dark:text-stone-300 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>К списку тем</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
            Твой уровень: {summary.currentLevel}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">
            Статистика успеваемости
          </h1>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Детальный срез точности, прогресс по уровням CEFR и история тренировок
        </p>
      </div>

      {/* Summary KPI Grid (Cozy Paper Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm text-center">
          <span className="block text-xs font-semibold text-stone-400 mb-1">Точность ответов</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {summary.accuracyPercentage}%
          </span>
          <span className="block text-[11px] text-stone-400 mt-1">
            {summary.correctAttempts} из {summary.totalAttempts}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm text-center">
          <span className="block text-xs font-semibold text-stone-400 mb-1">Освоено тем</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.masteredCount}
          </span>
          <span className="block text-[11px] text-stone-400 mt-1">
            3+ верных подряд
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm text-center">
          <span className="block text-xs font-semibold text-stone-400 mb-1">Зоны зависания</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {summary.bottleneckCount}
          </span>
          <span className="block text-[11px] text-stone-400 mt-1">
            &gt;5 ошибок на правило
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm text-center">
          <span className="block text-xs font-semibold text-stone-400 mb-1">Рейтинг потока</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
            ТОП {100 - summary.benchmarkPercent || 15}%
          </span>
          <span className="block text-[11px] text-stone-400 mt-1">
            Среди учеников
          </span>
        </div>
      </div>

      {/* Global Benchmark Banner */}
      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm text-xl">
          🚀
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
            Твой результат выше, чем у {summary.benchmarkPercent}% сверстников!
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
            Система генерирует уникальные задания без повторений, развивая интуитивное понимание грамматических правил.
          </p>
        </div>
      </div>

      {/* Level Breakdown Grid */}
      <div className="bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-50 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Разбивка по уровням CEFR (A1–B2)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levels.map((lvl) => {
            const stat = levelStats[lvl] || { total: 0, correct: 0, masteredTopics: 0 };
            const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

            return (
              <div
                key={lvl}
                className="p-4 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                    Уровень {lvl}
                  </span>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Точность: {pct}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden my-3">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>Решено: {stat.total}</span>
                  <span>Освоено тем: {stat.masteredTopics}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts History */}
      <div className="bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-50 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          История последних ответов
        </h2>

        {recentAttempts.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">
            Вы еще не выполнили ни одного задания. Выберите тему на главной странице и начните тренировку!
          </p>
        ) : (
          <div className="divide-y divide-[#EEE8DE] dark:divide-[#273145]">
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
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {att.topicTitle}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-stone-400">
                      [{att.topicLevel}]
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <span className="font-mono px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs">
                    {att.studentAnswer}
                  </span>
                  <span className="text-[11px] text-stone-400 whitespace-nowrap">
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
