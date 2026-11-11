'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Flame,
  AlertTriangle,
  Trophy,
  Keyboard,
  MousePointerClick,
} from 'lucide-react';
import { QuestionPayload, CefrLevel } from '@/types';

interface TopicInfo {
  id: string;
  title: string;
  level: CefrLevel;
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.topicId as string;

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<TopicInfo | null>(null);
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'options' | 'manual'>('options');
  const [manualText, setManualText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    isMastered: boolean;
    isBottleneck: boolean;
    consecutiveCorrect: number;
  } | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setManualText('');
    setResult(null);

    try {
      const res = await fetch(`/api/practice/question?topicId=${topicId}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setTopic(data.topic);
      setQuestion(data.question);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchQuestion();
    }
  }, [topicId]);

  const handleSelectOption = (opt: string) => {
    if (result || submitting) return;
    setSelectedOption(opt);
    setManualText(opt);
  };

  const handleManualChange = (val: string) => {
    if (result || submitting) return;
    setManualText(val);
    setSelectedOption(val);
  };

  const handleSubmit = async () => {
    const finalAnswer = selectedOption || manualText;
    if (!finalAnswer?.trim() || !question || submitting || result) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          questionPayload: question,
          studentAnswer: finalAnswer.trim(),
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center animate-bounce mb-3 text-2xl">
          🎲
        </div>
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
          ИИ создает персональное задание...
        </p>
        <p className="text-xs text-stone-400 mt-1">Лексика строго подобрана под твой уровень</p>
      </div>
    );
  }

  if (!question || !topic) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-stone-500">Не удалось загрузить задание.</p>
        <Link href="/" className="inline-block mt-4 text-xs font-semibold text-indigo-600">
          Вернуться к темам
        </Link>
      </div>
    );
  }

  // Format question sentence highlighting the blanks "_____"
  const parts = question.question.split('_____');
  const activeAnswer = selectedOption || manualText;

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-2 sm:py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К темам</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800">
            {topic.level}
          </span>
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 truncate max-w-[220px]">
            {topic.title}
          </span>
        </div>
      </div>

      {/* Bottleneck Warning Banner */}
      {result?.isBottleneck && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Зона особого внимания:</span> на эту тему затрачено уже 5+ попыток. Внимательно изучи подсказку перед продолжением.
          </div>
        </div>
      )}

      {/* Mastered Celebration Banner */}
      {result?.isMastered && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
          <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">🎉 Тема усвоена!</span> Ты успешно решил серию заданий подряд.
          </div>
        </div>
      )}

      {/* Main Exercise Card (Paper EdTech style) */}
      <div className="bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-4 pb-3 border-b border-stone-100 dark:border-stone-800/60">
            <span className="flex items-center gap-1.5 font-semibold text-stone-500 dark:text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Генерация на лету</span>
            </span>

            <div className="flex items-center gap-3">
              {result && (
                <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Серия: {result.consecutiveCorrect}
                </span>
              )}

              {/* Mode Toggle: Multiple Choice vs Fill in Blank */}
              {!result && (
                <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-xl text-[11px]">
                  <button
                    onClick={() => setInputMode('options')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      inputMode === 'options'
                        ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    <MousePointerClick className="w-3 h-3" />
                    Тест
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      inputMode === 'manual'
                        ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    <Keyboard className="w-3 h-3" />
                    Ввод
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 leading-relaxed my-6 sm:my-8">
            {parts[0]}
            <span
              className={`inline-block mx-1.5 px-3 py-1 rounded-xl font-extrabold border-2 transition-all ${
                result
                  ? result.isCorrect
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 text-rose-800 dark:text-rose-200'
                  : activeAnswer
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-800 dark:text-indigo-200'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400 min-w-[75px] text-center'
              }`}
            >
              {activeAnswer || '.....'}
            </span>
            {parts[1] || ''}
          </div>

          {/* Input Mode 1: Manual typing input */}
          {inputMode === 'manual' && !result && (
            <div className="mt-6">
              <label className="block text-xs font-semibold text-stone-500 mb-2">
                Введи пропущенное слово или фразу:
              </label>
              <input
                type="text"
                autoFocus
                value={manualText}
                onChange={(e) => handleManualChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Напечатай ответ..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-base font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-stone-900 transition-all"
              />
            </div>
          )}

          {/* Input Mode 2: Multiple Choice Options Grid */}
          {(inputMode === 'options' || !!result) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {question.options.map((opt, idx) => {
                const isSelected = activeAnswer?.toLowerCase() === opt.toLowerCase();
                let btnStyle =
                  'border-stone-200/90 dark:border-stone-700/80 bg-white dark:bg-[#151B27] text-stone-800 dark:text-stone-200 hover:border-indigo-400 hover:bg-indigo-50/20';

                if (result) {
                  if (isSelected && result.isCorrect) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20';
                  } else if (opt === result.correctAnswer) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !result.isCorrect) {
                    btnStyle =
                      'border-rose-400 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-bold';
                  } else {
                    btnStyle = 'opacity-50 border-stone-200 dark:border-stone-800 text-stone-400';
                  }
                } else if (isSelected) {
                  btnStyle =
                    'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/20';
                }

                return (
                  <button
                    key={idx}
                    disabled={!!result || submitting}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left text-sm sm:text-base font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {result && opt === result.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {result && isSelected && !result.isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Retry Explanation Box */}
        {result && (
          <div
            className={`mt-6 p-4 sm:p-5 rounded-2xl border transition-all ${
              result.isCorrect
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider">
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Отлично! Ответ верный</span>
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Smart Retry: Разбор от ИИ</span>
                </>
              )}
            </div>
            <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-medium">
              {result.explanation}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-end">
          {!result ? (
            <button
              onClick={handleSubmit}
              disabled={!activeAnswer?.trim() || submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? 'Проверяем...' : 'Проверить ответ'}
            </button>
          ) : (
            <button
              onClick={fetchQuestion}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{result.isCorrect ? 'Следующее задание' : 'Отработать ошибку (Новый пример)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
