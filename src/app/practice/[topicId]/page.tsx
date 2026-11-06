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
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center animate-bounce mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          ИИ генерирует персональное задание...
        </p>
        <p className="text-xs text-zinc-400 mt-1">Лексика строго адаптирована под ваш уровень</p>
      </div>
    );
  }

  if (!question || !topic) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">Не удалось загрузить задание.</p>
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
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-4 sm:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К списку тем</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {topic.level}
          </span>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
            {topic.title}
          </span>
        </div>
      </div>

      {/* Bottleneck Warning Banner */}
      {result?.isBottleneck && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Зона особого внимания:</span> на эту тему затрачено уже 5+ попыток. Внимательно изучите подсказки ниже перед продолжением.
          </div>
        </div>
      )}

      {/* Mastered Celebration Banner */}
      {result?.isMastered && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Тема усвоена!</span> Вы успешно решили серию заданий подряд.
          </div>
        </div>
      )}

      {/* Main Exercise Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Генерация ИИ в реальном времени
            </span>

            <div className="flex items-center gap-3">
              {result && (
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Flame className="w-3.5 h-3.5" />
                  Серия: {result.consecutiveCorrect}
                </span>
              )}

              {/* Mode Toggle: Multiple Choice vs Fill in Blank */}
              {!result && (
                <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[11px]">
                  <button
                    onClick={() => setInputMode('options')}
                    className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      inputMode === 'options'
                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    <MousePointerClick className="w-3 h-3" />
                    Тест
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      inputMode === 'manual'
                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-zinc-500'
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
          <div className="text-lg sm:text-2xl font-medium text-zinc-900 dark:text-zinc-50 leading-relaxed my-6">
            {parts[0]}
            <span
              className={`inline-block mx-1.5 px-3 py-1 rounded-xl font-bold border-2 transition-all ${
                result
                  ? result.isCorrect
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-950/60 border-red-500 text-red-700 dark:text-red-300'
                  : activeAnswer
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 min-w-[70px] text-center'
              }`}
            >
              {activeAnswer || '.....'}
            </span>
            {parts[1] || ''}
          </div>

          {/* Input Mode 1: Manual typing input */}
          {inputMode === 'manual' && !result && (
            <div className="mt-6">
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                Введите пропущенное слово или фразу на английском:
              </label>
              <input
                type="text"
                autoFocus
                value={manualText}
                onChange={(e) => handleManualChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Введите ваш ответ..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm sm:text-base font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
            </div>
          )}

          {/* Input Mode 2: Multiple Choice Options Grid */}
          {(inputMode === 'options' || !!result) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {question.options.map((opt, idx) => {
                const isSelected = activeAnswer?.toLowerCase() === opt.toLowerCase();
                let btnStyle =
                  'border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200';

                if (result) {
                  if (isSelected && result.isCorrect) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20';
                  } else if (opt === result.correctAnswer) {
                    btnStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (isSelected && !result.isCorrect) {
                    btnStyle =
                      'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-bold';
                  } else {
                    btnStyle = 'opacity-50 border-zinc-200 dark:border-zinc-800 text-zinc-400';
                  }
                } else if (isSelected) {
                  btnStyle =
                    'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold ring-2 ring-indigo-500/20';
                }

                return (
                  <button
                    key={idx}
                    disabled={!!result || submitting}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border-2 text-left text-sm sm:text-base transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {result && opt === result.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {result && isSelected && !result.isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
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
            className={`mt-6 p-4 sm:p-5 rounded-2xl border ${
              result.isCorrect
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider">
              {result.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Отлично! Ответ верный
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 text-amber-600 animate-pulse" />
                  Smart Retry: Разбор ошибки от ИИ
                </>
              )}
            </div>
            <div className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
              {result.explanation}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
          {!result ? (
            <button
              onClick={handleSubmit}
              disabled={!activeAnswer?.trim() || submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-40"
            >
              {submitting ? 'Проверка...' : 'Проверить ответ'}
            </button>
          ) : (
            <button
              onClick={fetchQuestion}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
