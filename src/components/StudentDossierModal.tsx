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
  HelpCircle,
  MessageSquare,
  Check,
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

export interface QuestionFlagRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  topicLevel: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation?: string | null;
  studentComment?: string | null;
  status: string;
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
  questionFlags?: QuestionFlagRecord[];
  pendingFlagsCount?: number;
}

export default function StudentDossierModal({
  student,
  allTopics,
  onClose,
  onFlagStatusChange,
}: {
  student: StudentDossier | null;
  allTopics: { id: string; title: string; level: string }[];
  onClose: () => void;
  onFlagStatusChange?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'mistakes' | 'flags'>('matrix');
  const [updatingFlagId, setUpdatingFlagId] = useState<string | null>(null);
  const [flags, setFlags] = useState<QuestionFlagRecord[]>(student?.questionFlags || []);

  if (!student) return null;

  const mistakes = student.recentAttempts.filter((a) => !a.isCorrect);
  const currentFlags = flags.length > 0 ? flags : student.questionFlags || [];
  const pendingFlags = currentFlags.filter((f) => f.status === 'PENDING');

  const handleToggleFlagStatus = async (flagId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'RESOLVED' : 'PENDING';
    setUpdatingFlagId(flagId);
    try {
      const res = await fetch('/api/questions/flag', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, status: nextStatus }),
      });
      if (res.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.id === flagId ? { ...f, status: nextStatus } : f))
        );
        if (onFlagStatusChange) onFlagStatusChange();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingFlagId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EEE8DE] dark:border-[#273145] flex items-start justify-between bg-[#FAF8F5]/60 dark:bg-[#141A26]/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shrink-0 border border-indigo-100 dark:border-indigo-800/40">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-50">
                  {student.fullName}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-[#EEE8DE] dark:border-[#273145]">
                  {student.currentLevel}
                </span>
                {student.riskStatus === 'high' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400">
                    Зона риска
                  </span>
                )}
                {student.riskStatus === 'medium' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400">
                    Требует внимания
                  </span>
                )}
                {student.riskStatus === 'low' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400">
                    В норме
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">{student.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI row */}
        <div className="grid grid-cols-3 gap-2 px-6 py-3.5 bg-[#FAF8F5]/30 dark:bg-[#141A26]/30 border-b border-[#EEE8DE] dark:border-[#273145] text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145]">
            <span className="block text-[11px] text-stone-400 mb-0.5 font-medium">Точность</span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {student.accuracy}%
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145]">
            <span className="block text-[11px] text-stone-400 mb-0.5 font-medium">Освоено тем</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {student.masteredCount} / {allTopics.length || 12}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145]">
            <span className="block text-[11px] text-stone-400 mb-0.5 font-medium">Вопросов учителю</span>
            <span className={`text-base font-extrabold ${pendingFlags.length > 0 ? 'text-amber-500' : 'text-stone-500'}`}>
              {pendingFlags.length}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#EEE8DE] dark:border-[#273145] px-6 pt-2 bg-white dark:bg-[#19202E]">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Матрица тем ({allTopics.length || 12})</span>
          </button>

          <button
            onClick={() => setActiveTab('flags')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'flags'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>Вопросы учителю ({currentFlags.length})</span>
            {pendingFlags.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('mistakes')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'mistakes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Ошибки ({mistakes.length})</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5 bg-[#FAF8F5]/40 dark:bg-[#121620]/40">
          {activeTab === 'matrix' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allTopics.map((topic) => {
                const prog = student.topicProgress.find((p) => p.topicId === topic.id);
                const isMastered = prog?.isMastered ?? false;
                const isBottleneck = prog?.isBottleneck ?? false;
                const total = prog?.totalAttempts ?? 0;

                // Flags for this topic
                const topicFlags = currentFlags.filter(
                  (f) => f.topicId === topic.id && f.status === 'PENDING'
                );

                let badge = (
                  <span className="text-[10px] font-medium text-stone-400 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                    Не начато
                  </span>
                );

                if (isMastered) {
                  badge = (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Освоено
                    </span>
                  );
                } else if (isBottleneck) {
                  badge = (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Зависание ({prog?.failedAttempts} ош.)
                    </span>
                  );
                } else if (total > 0) {
                  badge = (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                      В процессе ({total} поп.)
                    </span>
                  );
                }

                return (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] flex flex-col justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 block">
                          [{topic.level}]
                        </span>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-1">
                          {topic.title}
                        </span>
                      </div>
                      {badge}
                    </div>

                    {/* Question flag marker directly in the matrix! */}
                    {topicFlags.length > 0 && (
                      <div className="mt-1 pt-1.5 border-t border-amber-100 dark:border-amber-900/40 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>
                          {topicFlags.length} вопр. на разбор
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-3">
              {currentFlags.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  <div className="text-3xl mb-2">🙋‍♂️</div>
                  Ученик пока не оставлял пометок «Спросить учителя».
                </div>
              ) : (
                currentFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                      flag.status === 'PENDING'
                        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between text-stone-400 text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        [{flag.topicLevel}] {flag.topicTitle}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{new Date(flag.createdAt).toLocaleDateString()}</span>
                        <button
                          disabled={updatingFlagId === flag.id}
                          onClick={() => handleToggleFlagStatus(flag.id, flag.status)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                            flag.status === 'PENDING'
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{flag.status === 'PENDING' ? 'Отметить как разобрано' : 'Разобрано'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="p-3 rounded-xl bg-white dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] font-medium text-stone-900 dark:text-stone-100 leading-relaxed">
                      {flag.questionText}
                    </div>

                    {/* Answers comparison */}
                    <div className="flex flex-wrap gap-4 text-[11px]">
                      <div>
                        <span className="text-stone-400">Ответ ученика: </span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {flag.studentAnswer || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400">Правильный ответ: </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {flag.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Student's Comment / Question */}
                    {flag.studentComment && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200">
                        <span className="font-bold">Комментарий ученика: </span>
                        {flag.studentComment}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'mistakes' && (
            <div className="space-y-2.5">
              {mistakes.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  Ученик пока не совершал серьезных ошибок в последних тренировках.
                </div>
              ) : (
                mistakes.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-stone-400 text-[11px]">
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        [{m.topicLevel}] {m.topicTitle}
                      </span>
                      <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">Ответ ученика:</span>
                      <span className="font-mono font-bold text-rose-600 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                        {m.studentAnswer}
                      </span>
                    </div>
                    {m.aiExplanation && (
                      <div className="text-[11px] text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-[#141A26]/80 p-2.5 rounded-xl border border-rose-100 dark:border-[#273145]">
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
        <div className="px-6 py-3.5 bg-[#FAF8F5] dark:bg-[#141A26] border-t border-[#EEE8DE] dark:border-[#273145] flex justify-end">
          <button
            onClick={onClose}
            className="btn-tactile px-5 py-2 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors shadow-xs"
          >
            Закрыть досье
          </button>
        </div>
      </div>
    </div>
  );
}
