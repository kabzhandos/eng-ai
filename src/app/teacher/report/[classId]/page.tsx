'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  Calendar,
  Layers,
  BookOpen,
  Users,
  MessageSquare,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import { ClassAiReportData } from '@/lib/ai/generator';

interface ReportPayload {
  reportInfo: {
    generatedAt: string;
    teacherName: string;
    teacherEmail: string;
    className: string;
    classId: string;
    inviteCode: string;
    isArchived: boolean;
    focusTopic?: { id: string; title: string; level: string } | null;
  };
  metrics: {
    totalStudents: number;
    activeStudentsCount: number;
    averageAccuracy: number;
    totalAttemptsCount: number;
    totalMasteredCount: number;
    riskStudentsCount: number;
    pendingQuestionsCount: number;
  };
  blindspots: Array<{
    topicTitle: string;
    topicLevel: string;
    errorCount: number;
    affectedStudents: number;
    percentAffected: number;
  }>;
  students: Array<{
    id: string;
    fullName: string;
    email: string;
    currentLevel: string;
    accuracy: number;
    totalAttempts: number;
    masteredCount: number;
    riskStatus: 'high' | 'medium' | 'low';
    isArchived: boolean;
    bottlenecks: Array<{ title: string; level: string; failedAttempts: number }>;
    pendingFlagsCount: number;
  }>;
  pendingQuestions: Array<{
    id: string;
    studentName: string;
    topicTitle: string;
    topicLevel: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    studentComment?: string | null;
    createdAt: string;
  }>;
  aiAnalysis: ClassAiReportData;
}

export default function ClassReportPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.classId as string;

  const [data, setData] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/classes/report?classId=${classId}`);
      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Ошибка загрузки отчета');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchReport();
    }
  }, [classId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center animate-bounce mb-3 text-2xl">
          🤖
        </div>
        <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
          Формирование методического ИИ-отчёта...
        </h2>
        <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
          Нейросеть агрегирует ошибки группы, анализирует лингвистические слепые зоны и строит план коррекции
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-2">
          {error || 'Не удалось сформировать отчёт'}
        </h2>
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs mt-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в кабинет преподавателя</span>
        </Link>
      </div>
    );
  }

  const { reportInfo, metrics, blindspots, students, pendingQuestions, aiAnalysis } = data;
  const formattedDate = new Date(reportInfo.generatedAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto w-full py-4 space-y-6">
      {/* Top Toolbar (Hidden when printing to PDF) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-xs">
        <Link
          href="/teacher"
          className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>В кабинет учителя</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            title="Обновить аналитику от ИИ"
            className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Обновить</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-tactile inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700"
          >
            <Printer className="w-4 h-4" />
            <span>Скачать в PDF / Распечатать</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Sheet (A4 styling) */}
      <div className="print-card bg-white text-stone-900 border border-[#EEE8DE] rounded-3xl shadow-sm p-6 sm:p-10 space-y-7">
        {/* Document Header */}
        <div className="border-b-2 border-stone-200 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-base tracking-tight text-indigo-700">
                  EngAI • Educational Platform
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Педагогическая аналитика
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                ОТЧЁТ ОБ УСПЕВАЕМОСТИ И МЕТОДИЧЕСКИЙ АНАЛИЗ
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Учебная группа: <span className="font-bold text-stone-800">{reportInfo.className}</span> • Инвайт-код: <span className="font-mono font-bold">{reportInfo.inviteCode}</span>
              </p>
            </div>

            <div className="text-right text-xs text-stone-500 shrink-0">
              <span className="block font-bold text-stone-800">{reportInfo.teacherName}</span>
              <span className="block text-[11px] text-stone-400">{reportInfo.teacherEmail}</span>
              <span className="block text-[11px] text-stone-400 mt-1">Дата: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* 4 Summary KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200 text-center">
            <span className="block text-[11px] font-semibold text-stone-500">Учеников в классе</span>
            <span className="text-2xl font-extrabold text-stone-900 mt-0.5 block">
              {metrics.totalStudents}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200 text-center">
            <span className="block text-[11px] font-semibold text-stone-500">Средняя точность</span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-0.5 block">
              {metrics.averageAccuracy}%
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200 text-center">
            <span className="block text-[11px] font-semibold text-stone-500">Зон зависания</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-0.5 block">
              {blindspots.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200 text-center">
            <span className="block text-[11px] font-semibold text-stone-500">В группе риска</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-0.5 block">
              {metrics.riskStudentsCount}
            </span>
          </div>
        </div>

        {/* Block 1: Executive Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              1. Педагогическое резюме от ИИ (Executive Summary)
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
            {aiAnalysis.executiveSummary}
          </div>
        </div>

        {/* Block 2: Root Cause Analysis */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              2. Диагностический разбор системных слепых зон (Root-Cause Analysis)
            </h2>
          </div>

          {aiAnalysis.rootCauseAnalysis.length === 0 ? (
            <p className="text-xs text-stone-500 italic p-3">
              Системных слепых зон не выявлено. Группа усваивает грамматический материал в пределах нормы.
            </p>
          ) : (
            <div className="space-y-2.5">
              {aiAnalysis.rootCauseAnalysis.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-[#FBF9F5] text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span className="text-xs">
                      [{item.topicLevel}] {item.topicTitle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                      Проблемная зона
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    <span className="font-bold text-stone-900">Диагноз ИИ: </span>
                    {item.pedagogicalDiagnosis}
                  </p>
                  <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-950 font-medium leading-relaxed">
                    <span className="font-bold">Методическая рекомендация: </span>
                    {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Block 3: Remedial Action Plan */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              3. Поурочный план коррекции на 2 недели (Action Plan)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiAnalysis.actionPlan.map((plan, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200 bg-[#FBF9F5] text-xs space-y-2"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                  <span className="font-extrabold text-indigo-700">{plan.week}</span>
                  <span className="font-bold text-stone-800 truncate max-w-[180px]">
                    {plan.focusArea}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-stone-900 block">Разминка (5-10 мин):</span>
                  <p className="text-stone-600 leading-relaxed">{plan.warmupActivity}</p>
                </div>
                <div className="space-y-0.5 pt-1">
                  <span className="font-bold text-stone-900 block">Сигнальные слова / маркеры:</span>
                  <p className="text-stone-600 font-mono text-[11px]">{plan.keySignalsToEmphasize}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 4: Differentiation Advice */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              4. Дифференцированный подход (работа со слабыми и сильными учениками)
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-stone-200 text-xs text-stone-700 leading-relaxed">
            {aiAnalysis.differentiationAdvice}
          </div>
        </div>

        {/* Block 5: Student Roster Table */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              5. Сводный табель успеваемости учеников ({students.length})
            </h2>
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-stone-200 font-bold text-stone-700">
                <tr>
                  <th className="py-2.5 px-3">ФИО Ученика</th>
                  <th className="py-2.5 px-3">Уровень</th>
                  <th className="py-2.5 px-3 text-center">Точность</th>
                  <th className="py-2.5 px-3 text-center">Попыток</th>
                  <th className="py-2.5 px-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-semibold text-stone-900">
                      {st.fullName}
                      {st.isArchived && (
                        <span className="ml-2 text-[10px] text-stone-400 font-normal">(Архив)</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-600">
                      {st.currentLevel}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">
                      {st.accuracy}%
                    </td>
                    <td className="py-2 px-3 text-center text-stone-500">
                      {st.totalAttempts}
                    </td>
                    <td className="py-2 px-3">
                      {st.riskStatus === 'high' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Зона риска
                        </span>
                      ) : st.riskStatus === 'medium' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Внимание
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          В норме
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Block 6: Pending Student Questions (if any) */}
        {pendingQuestions.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
                6. Пометки учеников («Спросить учителя») к уроку ({pendingQuestions.length})
              </h2>
            </div>

            <div className="space-y-2">
              {pendingQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-2xl border border-amber-200 bg-amber-50/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold text-stone-800 text-[11px]">
                    <span>
                      {q.studentName} • [{q.topicLevel}] {q.topicTitle}
                    </span>
                    <span className="text-stone-400 font-mono">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200 font-medium">
                    {q.questionText}
                  </div>
                  {q.studentComment && (
                    <p className="text-amber-900 text-[11px]">
                      <span className="font-bold">Вопрос: </span>
                      {q.studentComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Footer: Formal Signatures for School Administration */}
        <div className="pt-8 border-t-2 border-stone-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs text-stone-600">
          <div>
            <span className="block font-bold text-stone-900">Преподаватель:</span>
            <span className="block mt-1">{reportInfo.teacherName}</span>
          </div>

          <div className="w-64 border-b border-stone-400 pb-1 text-center text-stone-400">
            Подпись: ______________________
          </div>

          <div className="text-right">
            <span className="block font-bold text-stone-900">Дата утверждения:</span>
            <span className="block mt-1">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
