'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Compass,
  ArrowLeft,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { QuestionPayload, CefrLevel } from '@/types';

interface PlacementQuestion extends QuestionPayload {
  levelBlock: CefrLevel;
  questionNumber: number;
}

interface BreakdownItem {
  correct: number;
  total: number;
}

interface TestResults {
  assignedLevel: CefrLevel;
  totalQuestions: number;
  totalCorrect: number;
  breakdown: Record<CefrLevel, BreakdownItem>;
}

export default function PlacementTestPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<
    Array<{ questionNumber: number; levelBlock: CefrLevel; isCorrect: boolean }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<TestResults | null>(null);

  useEffect(() => {
    fetch('/api/placement')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.questions) {
          setQuestions(data.questions);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [router]);

  const currentQ = questions[currentIndex];
  const totalCount = questions.length || 20;
  const progressPercent = Math.round(((currentIndex + 1) / totalCount) * 100);

  const handleNext = async () => {
    if (!selectedOption || !currentQ || submitting) return;

    const isCorrect =
      selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    const updatedAnswers = [
      ...userAnswers,
      {
        questionNumber: currentQ.questionNumber,
        levelBlock: currentQ.levelBlock,
        isCorrect,
      },
    ];
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 >= totalCount) {
      // Completed all 20 questions! Submit to backend
      setSubmitting(true);
      try {
        const res = await fetch('/api/placement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: updatedAnswers }),
        });
        const data = await res.json();
        setFinalResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Move to next question
    setSelectedOption(null);
    setCurrentIndex(currentIndex + 1);
  };

  // Completed Test Screen
  if (finalResult) {
    const { assignedLevel, totalCorrect, totalQuestions, breakdown } = finalResult;
    const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

    return (
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Тестирование из 20 вопросов завершено
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1 mb-2">
            Уровень: {assignedLevel}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-6 leading-relaxed">
            {assignedLevel === 'A1' &&
              'Начальный уровень. Открыты базовые грамматические структуры: Present Simple, глагол to be, местоимения и артикли.'}
            {assignedLevel === 'A2' &&
              'Элементарный уровень. Вы уверенно справились с Past Simple, модальными глаголами и степенями сравнения.'}
            {assignedLevel === 'B1' &&
              'Средний уровень. Вы продемонстрировали хорошее владение временами Perfect, условными предложениями и Passive Voice.'}
            {assignedLevel === 'B2' &&
              'Продвинутый уровень. Отличный результат! Вам открыты все сложные темы: Past Modals, смешанные Conditionals и инверсия.'}
          </p>

          {/* Level Breakdown Progress Bars */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 mb-6 text-left space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-200 dark:border-zinc-700">
              <span>Срез по уровням сложности:</span>
              <span>Итог: {totalCorrect} из {totalQuestions}</span>
            </div>

            {levels.map((lvl) => {
              const item = breakdown?.[lvl] || { correct: 0, total: 5 };
              const percent = Math.round((item.correct / item.total) * 100);

              return (
                <div key={lvl}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Уровень {lvl}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      {item.correct} / {item.total} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent >= 80
                          ? 'bg-emerald-500'
                          : percent >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/"
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            Перейти к программе обучения
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !currentQ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Подготовка 20 диагностических вопросов...
        </p>
        <p className="text-xs text-zinc-400 mt-1">От легких (A1) к сложным (B2)</p>
      </div>
    );
  }

  const parts = currentQ.question.split('_____');

  // Friendly block label
  let blockLabel = '';
  if (currentQ.levelBlock === 'A1') blockLabel = 'Блок 1 из 4: Начальный уровень (A1)';
  else if (currentQ.levelBlock === 'A2') blockLabel = 'Блок 2 из 4: Элементарный уровень (A2)';
  else if (currentQ.levelBlock === 'B1') blockLabel = 'Блок 3 из 4: Средний уровень (B1)';
  else if (currentQ.levelBlock === 'B2') blockLabel = 'Блок 4 из 4: Продвинутый уровень (B2)';

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-6">
      {/* Top Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h1 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Входное тестирование (20 вопросов)
            </h1>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            Вопрос {currentIndex + 1} из {totalCount}
          </span>
        </div>

        {/* 20-step progress bar */}
        <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Level Block Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-3.5 h-3.5" />
              {blockLabel}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Сложность: {currentQ.levelBlock}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-lg sm:text-2xl font-medium text-zinc-900 dark:text-zinc-50 leading-relaxed my-6">
            {parts[0]}
            <span
              className={`inline-block mx-1.5 px-3 py-1 rounded-xl font-bold border-2 transition-all ${
                selectedOption
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 min-w-[70px] text-center'
              }`}
            >
              {selectedOption || '.....'}
            </span>
            {parts[1] || ''}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={idx}
                  disabled={submitting}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-4 rounded-2xl border-2 text-left text-sm sm:text-base transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedOption || submitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>
              {currentIndex + 1 === totalCount ? 'Завершить тест' : 'Следующий вопрос'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
