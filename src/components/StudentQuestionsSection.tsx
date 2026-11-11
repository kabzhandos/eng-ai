'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Check, Trash2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

export interface StudentFlagItem {
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

export default function StudentQuestionsSection({
  initialFlags,
}: {
  initialFlags: StudentFlagItem[];
}) {
  const [flags, setFlags] = useState<StudentFlagItem[]>(initialFlags);
  const [isOpen, setIsOpen] = useState(true);

  if (flags.length === 0) return null;

  const pendingCount = flags.filter((f) => f.status === 'PENDING').length;

  const handleDelete = async (flagId: string) => {
    try {
      const res = await fetch(`/api/questions/flag?flagId=${flagId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFlags((prev) => prev.filter((f) => f.id !== flagId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (flagId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'RESOLVED' : 'PENDING';
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm overflow-hidden transition-all">
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer bg-[#FAF8F5]/60 dark:bg-[#141A26]/40 select-none border-b border-[#EEE8DE] dark:border-[#273145]"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🙋‍♂️</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-50">
                Мои вопросы учителю
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {pendingCount} активных
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Пометки к заданиям для совместного разбора на уроке
            </p>
          </div>
        </div>

        <button className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Flagged items list */}
      {isOpen && (
        <div className="p-5 divide-y divide-[#EEE8DE] dark:divide-[#273145] space-y-3">
          {flags.map((flag) => {
            const isPending = flag.status === 'PENDING';
            return (
              <div
                key={flag.id}
                className="pt-3 first:pt-0 flex flex-col gap-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      [{flag.topicLevel}] {flag.topicTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isPending
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {isPending ? 'Ждёт урока' : 'Разобрано'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(flag.id, flag.status)}
                      title={isPending ? 'Отметить как разобрано' : 'Вернуть в активные'}
                      className="btn-tactile px-2.5 py-1 rounded-xl text-[10px] font-bold border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-stone-700 dark:text-stone-200 hover:border-emerald-400 flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{isPending ? 'Разобрано' : 'Вернуть'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(flag.id)}
                      title="Удалить пометку"
                      className="p-1 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sentence */}
                <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] font-medium text-stone-900 dark:text-stone-100">
                  {flag.questionText}
                </div>

                {/* Answers & Comment */}
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <div>
                    <span className="text-stone-400">Твой ответ: </span>
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
                  {flag.studentComment && (
                    <div className="w-full mt-1 p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-950 dark:text-amber-200">
                      <span className="font-bold">Вопрос: </span>
                      {flag.studentComment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

