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
  Award,
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

  // Completed Test Screen (Cozy EdTech Paper Style)
  if (finalResult) {
    const { assignedLevel, totalCorrect, totalQuestions, breakdown } = finalResult;
    const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

    return (
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-sm p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
            🏆
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            20 вопросов успешно пройдены!
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-50 mt-1 mb-2">
            Твой уровень: {assignedLevel}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto mb-6 leading-relaxed">
            {assignedLevel === 'A1' &&
              'Начальный уровень. Открыты базовые грамматические структуры: Present Simple, глагол to be, местоимения и артикли.'}
            {assignedLevel === 'A2' &&
              'Элементарный уровень. Отличная база! Доступны Past Simple, модальные глаголы и сравнительные конструкции.'}
            {assignedLevel === 'B1' &&
              'Средний уровень. Уверенное владение! Открыты времена группы Perfect, Conditionals и страдательный залог (Passive Voice).'}
            {assignedLevel === 'B2' &&
              'Продвинутый уровень. Превосходный результат! Доступны Past Modals, смешанные условные предложения и инверсия.'}
          </p>

          {/* Level Breakdown Progress Bars */}
          <div className="p-5 rounded-2xl bg-[#FBF9F5] dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] mb-6 text-left space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 pb-2 border-b border-[#EEE8DE] dark:border-[#273145]">
              <span>Срез по уровням сложности:</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                Итог: {totalCorrect} из {totalQuestions}
              </span>
            </div>

            {levels.map((lvl) => {
              const item = breakdown?.[lvl] || { correct: 0, total: 5 };
              const percent = Math.round((item.correct / item.total) * 100);

              return (
                <div key={lvl}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      Уровень {lvl}
                    </span>
                    <span className="text-stone-500 font-mono text-[11px]">
                      {item.correct} / {item.total} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
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
            className="btn-tactile w-full py-3.5 px-6 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <span>Начать персональные тренировки</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !currentQ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center animate-bounce mb-3 text-2xl">
          🧭
        </div>
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
          Подготовка 20 диагностических вопросов...
        </p>
        <p className="text-xs text-stone-400 mt-1">От легких (A1) к продвинутым (B2)</p>
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
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <h1 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Входное тестирование
            </h1>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/40">
            Вопрос {currentIndex + 1} из {totalCount}
          </span>
        </div>

        {/* 20-step progress bar */}
        <div className="w-full h-2.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card (Warm Paper Style) */}
      <div className="bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Level Block Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              {blockLabel}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              Сложность: {currentQ.levelBlock}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-lg sm:text-2xl font-medium text-stone-900 dark:text-stone-50 leading-relaxed my-6">
            {parts[0]}
            <span
              className={`inline-block mx-1.5 px-3.5 py-1 rounded-xl font-bold border-2 transition-all ${
                selectedOption
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 min-w-[70px] text-center'
              }`}
            >
              {selectedOption || '.....'}
            </span>
            {parts[1] || ''}
          </div>

          {/* Options Grid with Tactile 3D Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={idx}
                  disabled={submitting}
                  onClick={() => setSelectedOption(opt)}
                  className={`btn-tactile p-4 rounded-2xl border-2 text-left text-sm sm:text-base font-medium transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/20'
                      : 'border-[#EEE8DE] dark:border-[#273145] hover:border-indigo-300 bg-white dark:bg-[#141A26] text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-[#EEE8DE] dark:border-[#273145] flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedOption || submitting}
            className="btn-tactile w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
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
