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
  HelpCircle,
  Send,
  Check,
  MessageSquare,
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

  // Ask Teacher state
  const [showAskModal, setShowAskModal] = useState(false);
  const [teacherNote, setTeacherNote] = useState('');
  const [sendingFlag, setSendingFlag] = useState(false);
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setManualText('');
    setResult(null);
    setFlagSubmitted(false);
    setShowAskModal(false);
    setTeacherNote('');

    try {
      const res = await fetch(`/api/practice/question?topicId=${topicId}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
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

  const handleSendToTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !topic || sendingFlag) return;
    setSendingFlag(true);

    try {
      const res = await fetch('/api/questions/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          questionText: question.question,
          studentAnswer: selectedOption || manualText || '',
          correctAnswer: question.correctAnswer,
          explanation: question.explanationRu,
          studentComment: teacherNote.trim() || 'Требуется разбор с учителем',
        }),
      });

      if (res.ok) {
        setFlagSubmitted(true);
        setShowAskModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingFlag(false);
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
          className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-xs font-bold text-stone-600 dark:text-stone-300 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>К темам</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
            {topic.level}
          </span>
          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate max-w-[220px]">
            {topic.title}
          </span>
        </div>
      </div>

      {/* Bottleneck Warning Banner */}
      {result?.isBottleneck && (
        <div className="mb-4 p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Зона особого внимания:</span> на эту тему затрачено уже 5+ попыток. Внимательно изучи подсказку перед продолжением.
          </div>
        </div>
      )}

      {/* Mastered Celebration Banner */}
      {result?.isMastered && (
        <div className="mb-4 p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 shadow-sm">
          <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Тема освоена!</span> Серия правильных ответов подряд выполнена.
          </div>
        </div>
      )}

      {/* Main Question Card (Warm Cozy Paper Style) */}
      <div className="bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Top Meta */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EEE8DE] dark:border-[#273145]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-400">Генерация ИИ в реальном времени</span>
            </div>

            <div className="flex items-center gap-2">
              {result && (
                <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Серия: {result.consecutiveCorrect}</span>
                </div>
              )}

              {/* Mode Toggle */}
              {!result && (
                <div className="flex items-center p-1 bg-[#FBF9F5] dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] rounded-xl text-xs">
                  <button
                    onClick={() => setInputMode('options')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      inputMode === 'options'
                        ? 'bg-white dark:bg-[#19202E] text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <MousePointerClick className="w-3 h-3" />
                    <span>Выбор</span>
                  </button>
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      inputMode === 'manual'
                        ? 'bg-white dark:bg-[#19202E] text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <Keyboard className="w-3 h-3" />
                    <span>Ввод</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question Sentence */}
          <div className="text-lg sm:text-2xl font-medium text-stone-900 dark:text-stone-50 leading-relaxed my-7">
            {parts[0]}
            <span
              className={`inline-block mx-1.5 px-3.5 py-1 rounded-2xl font-bold border-2 transition-all ${
                result
                  ? result.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300'
                  : activeAnswer
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-800 dark:text-indigo-300'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 min-w-[70px] text-center'
              }`}
            >
              {activeAnswer || '.....'}
            </span>
            {parts[1] || ''}
          </div>

          {/* Input Mode 1: Manual typing */}
          {inputMode === 'manual' && !result && (
            <div className="mt-4">
              <input
                type="text"
                autoFocus
                value={manualText}
                onChange={(e) => handleManualChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Напечатай ответ..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-base font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-indigo-600 shadow-inner transition-all"
              />
            </div>
          )}

          {/* Input Mode 2: Multiple Choice Options Grid */}
          {(inputMode === 'options' || !!result) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {question.options.map((opt, idx) => {
                const isSelected = activeAnswer?.toLowerCase() === opt.toLowerCase();
                let btnStyle =
                  'border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#141A26] text-stone-800 dark:text-stone-200 hover:border-indigo-300';

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
                    btnStyle = 'opacity-40 border-[#EEE8DE] dark:border-[#273145] text-stone-400';
                  }
                } else if (isSelected) {
                  btnStyle =
                    'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/20';
                }

                return (
                  <button
                    key={idx}
                    disabled={!!result || submitting}
                    onClick={() => handleSelectOption(opt)}
                    className={`btn-tactile p-4 sm:p-5 rounded-2xl border-2 text-left text-sm sm:text-base font-medium transition-all flex items-center justify-between ${btnStyle}`}
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
            className={`mt-6 p-5 rounded-3xl border transition-all ${
              result.isCorrect
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
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

        {/* Bottom Actions Row */}
        <div className="mt-8 pt-4 border-t border-[#EEE8DE] dark:border-[#273145] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Ask Teacher Button */}
          <div className="w-full sm:w-auto">
            {flagSubmitted ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>Вопрос сохранен учителю</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAskModal(true)}
                className="btn-tactile w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-stone-700 dark:text-stone-300 text-xs font-bold hover:border-amber-400 hover:text-amber-600 shadow-xs"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Спросить учителя</span>
              </button>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="w-full sm:w-auto">
            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={!activeAnswer?.trim() || submitting}
                className="btn-tactile w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-40"
              >
                {submitting ? 'Проверяем...' : 'Проверить ответ'}
              </button>
            ) : (
              <button
                onClick={fetchQuestion}
                className="btn-tactile w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {result.isCorrect ? 'Следующее задание' : 'Отработать ошибку (Новый пример)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ask Teacher Modal Dialog */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🙋‍♂️</span>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-50">
                  Пометить вопрос для учителя
                </h3>
              </div>
              <button
                onClick={() => setShowAskModal(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
              Этот вопрос сохранится в твоем личном кабинете, а учитель увидит его в матрице тем на следующем занятии.
            </p>

            {/* Question sentence snippet */}
            <div className="p-3.5 rounded-2xl bg-[#FBF9F5] dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] text-xs font-medium text-stone-800 dark:text-stone-200 mb-4 leading-relaxed">
              {question.question}
            </div>

            <form onSubmit={handleSendToTeacher}>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Твой комментарий или вопрос (необязательно):
              </label>
              <textarea
                rows={3}
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="Например: Не понимаю разницу между вариантами A и B в этом предложении..."
                className="w-full p-3.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner mb-4 resize-none"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={sendingFlag}
                  className="btn-tactile px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingFlag ? 'Отправка...' : 'Отправить учителю'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
