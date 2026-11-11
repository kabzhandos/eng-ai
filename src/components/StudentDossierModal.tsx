'use client';

import { useState } from 'react';
import {
  X,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StudentTopicRecord {
  topicId: string;
  title: string;
  level: string;
  isMastered: boolean;
  isBottleneck: boolean;
  totalAttempts: number;
  failedAttempts: number;
}

interface StudentAttemptRecord {
  id: string;
  isCorrect: boolean;
  studentAnswer: string;
  topicTitle: string;
  topicLevel: string;
  aiExplanation?: string | null;
  createdAt: string;
}

export interface StudentDossier {
  id: string;
  fullName: string;
  email: string;
  currentLevel: string;
  joinedAt: string;
  totalAttempts: number;
  accuracy: number;
  masteredCount: number;
  riskStatus: 'high' | 'medium' | 'low';
  bottlenecks: {
    topicId: string;
    title: string;
    level: string;
    failedAttempts: number;
  }[];
  recentAttempts: StudentAttemptRecord[];
  topicProgress: StudentTopicRecord[];
}

export default function StudentDossierModal({
  student,
  allTopics,
  onClose,
}: {
  student: StudentDossier | null;
  allTopics: { id: string; title: string; level: string }[];
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'mistakes'>('matrix');

  if (!student) return null;

  const mistakes = student.recentAttempts.filter((a) => !a.isCorrect);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shrink-0">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {student.fullName}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {student.currentLevel}
                </span>
                {student.riskStatus === 'high' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    Зона риска
                  </span>
                )}
                {student.riskStatus === 'medium' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    Требует внимания
                  </span>
                )}
                {student.riskStatus === 'low' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    В норме
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{student.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI row */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3.5 bg-zinc-50/30 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="block text-[11px] text-zinc-400 mb-0.5">Точность</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {student.accuracy}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="block text-[11px] text-zinc-400 mb-0.5">Освоено тем</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {student.masteredCount} / {allTopics.length || 12}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="block text-[11px] text-zinc-400 mb-0.5">Зависаний</span>
            <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
              {student.bottlenecks.length}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Матрица тем ({allTopics.length || 12})
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'mistakes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Журнал ошибок ({mistakes.length})
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {activeTab === 'matrix' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allTopics.map((topic) => {
                const prog = student.topicProgress.find((p) => p.topicId === topic.id);
                const isMastered = prog?.isMastered ?? false;
                const isBottleneck = prog?.isBottleneck ?? false;
                const total = prog?.totalAttempts ?? 0;

                let badge = (
                  <span className="text-[10px] font-medium text-zinc-400 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                    Не начато
                  </span>
                );

                if (isMastered) {
                  badge = (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Освоено
                    </span>
                  );
                } else if (isBottleneck) {
                  badge = (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Зависание ({prog?.failedAttempts} ош.)
                    </span>
                  );
                } else if (total > 0) {
                  badge = (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      В процессе ({total} поп.)
                    </span>
                  );
                }

                return (
                  <div
                    key={topic.id}
                    className="p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/40 dark:bg-zinc-800/30 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block">
                        [{topic.level}]
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {topic.title}
                      </span>
                    </div>
                    {badge}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {mistakes.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  Ученик пока не совершал серьезных ошибок в последних тренировках.
                </div>
              ) : (
                mistakes.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        [{m.topicLevel}] {m.topicTitle}
                      </span>
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Ответ ученика:</span>
                      <span className="font-mono font-bold text-rose-600 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/40 rounded">
                        {m.studentAnswer}
                      </span>
                    </div>
                    {m.aiExplanation && (
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-rose-100 dark:border-zinc-800">
                        {m.aiExplanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Закрыть досье
          </button>
        </div>
      </div>
    </div>
  );
}
