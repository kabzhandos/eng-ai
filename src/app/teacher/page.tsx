'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Target,
  BookOpen,
  Info,
  ShieldCheck,
} from 'lucide-react';
import StudentDossierModal, { StudentDossier } from '@/components/StudentDossierModal';
import TeacherMetricsSettingsModal, {
  TeacherMetricPreferences,
  DEFAULT_TEACHER_PREFS,
} from '@/components/TeacherMetricsSettingsModal';

interface GrammarTopicRef {
  id: string;
  title: string;
  level: string;
  slug?: string;
}

interface ClassBlindspot {
  topicTitle: string;
  topicLevel: string;
  errorCount: number;
  affectedStudents: number;
  percentAffected: number;
}

interface EnrichedClass {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  focusTopic?: GrammarTopicRef | null;
  focusTopicId?: string | null;
  focusCompletedCount: number;
  totalStudents: number;
  blindspots: ClassBlindspot[];
  aiLessonAdvice: string;
  students: StudentDossier[];
}

export default function TeacherDashboard() {
  const router = useRouter();

  const [classes, setClasses] = useState<EnrichedClass[]>([]);
  const [allTopics, setAllTopics] = useState<GrammarTopicRef[]>([]);
  const [loading, setLoading] = useState(true);

  // Class creation state
  const [newClassName, setNewClassName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentDossier | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Metrics preferences with localStorage persistence
  const [prefs, setPrefs] = useState<TeacherMetricPreferences>(DEFAULT_TEACHER_PREFS);

  useEffect(() => {
    // Load prefs from localStorage
    try {
      const saved = localStorage.getItem('engai_teacher_prefs');
      if (saved) {
        setPrefs(JSON.parse(saved));
      }
    } catch {}

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/teacher/classes');
      if (res.status === 403 || res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setClasses(data.classes || []);
      setAllTopics(data.allTopics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrefs = (newPrefs: TeacherMetricPreferences) => {
    setPrefs(newPrefs);
    try {
      localStorage.setItem('engai_teacher_prefs', JSON.stringify(newPrefs));
    } catch {}
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || creating) return;
    setCreating(true);

    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      if (res.ok) {
        setNewClassName('');
        setShowCreateForm(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSetFocusTopic = async (classId: string, focusTopicId: string) => {
    try {
      await fetch('/api/teacher/classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, focusTopicId }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-zinc-500">Загрузка данных преподавателя...</p>
      </div>
    );
  }

  // Aggregate global stats across classes
  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalBottlenecks = classes.reduce(
    (acc, c) => acc + c.students.reduce((sAcc, s) => sAcc + s.bottlenecks.length, 0),
    0
  );
  const highRiskStudents = classes.reduce(
    (acc, c) => acc + c.students.filter((s) => s.riskStatus === 'high').length,
    0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Кабинет преподавателя
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Управление учебными группами, слепые зоны и аналитика успеваемости
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Включить / отключить отображение метрик"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Настройка метрик</span>
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Новый класс</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Лаконичный вид) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
          <span className="block text-[11px] font-semibold text-zinc-400">Всего учеников</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
            {totalStudents}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
          <span className="block text-[11px] font-semibold text-zinc-400">Групп / классов</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
            {classes.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
          <span className="block text-[11px] font-semibold text-zinc-400">Зон зависания</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
            {totalBottlenecks}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs">
          <span className="block text-[11px] font-semibold text-zinc-400">В зоне риска</span>
          <span className="text-xl font-bold text-amber-500 mt-0.5 block">
            {highRiskStudents} учеников
          </span>
        </div>
      </div>

      {/* Create Class Drawer / Form */}
      {showCreateForm && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 transition-all">
          <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-2">
            Создать новый класс
          </h3>
          <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              required
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Название (например: 10-А класс Английский)"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="space-y-6">
        {classes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              У вас еще нет созданных классов
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Нажмите «Новый класс» выше и скопируйте инвайт-код для учеников
            </p>
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden"
            >
              {/* Class Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/30 dark:bg-zinc-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {cls.name}
                    </h2>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      • {cls.students.length} учеников
                    </span>
                  </div>
                </div>

                {/* Invite Code Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Код для учеников:</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800">
                    <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 text-xs tracking-wider">
                      {cls.inviteCode}
                    </span>
                    <button
                      onClick={() => copyInviteCode(cls.inviteCode)}
                      title="Скопировать инвайт-код"
                      className="p-0.5 text-zinc-400 hover:text-indigo-600 transition-colors"
                    >
                      {copiedCode === cls.inviteCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Metric 1: AI Lesson Advice */}
              {prefs.showAiAdvice && cls.aiLessonAdvice && (
                <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-950 dark:text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">ИИ-совет к уроку: </span>
                    {cls.aiLessonAdvice}
                  </div>
                </div>
              )}

              {/* Optional Metric 2: Class Blindspots & Focus Topic Grid */}
              {(prefs.showBlindspots || prefs.showFocusTopic) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 sm:px-5 mt-3">
                  {/* Blindspots block */}
                  {prefs.showBlindspots && (
                    <div className="p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          Слепые зоны класса (Топ ошибок)
                        </span>
                      </div>
                      {cls.blindspots.length === 0 ? (
                        <p className="text-[11px] text-zinc-400">
                          Ошибок пока нет, класс решает стабильно.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {cls.blindspots.map((bs, bsIdx) => (
                            <div
                              key={bsIdx}
                              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50"
                            >
                              <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                                [{bs.topicLevel}] {bs.topicTitle}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                                {bs.percentAffected}% учеников ({bs.errorCount} ош.)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Focus topic block */}
                  {prefs.showFocusTopic && (
                    <div className="p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-500" />
                          Фокусная тема недели (ДЗ)
                        </span>
                        {cls.focusTopic && (
                          <span className="text-[10px] text-zinc-400">
                            Сдали: {cls.focusCompletedCount} из {cls.students.length}
                          </span>
                        )}
                      </div>

                      <select
                        value={cls.focusTopicId || ''}
                        onChange={(e) => handleSetFocusTopic(cls.id, e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                      >
                        <option value="">-- Выберите тему недели для закрепления --</option>
                        {allTopics.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.level}] {t.title}
                          </option>
                        ))}
                      </select>

                      {cls.focusTopic && (
                        <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>
                            Тема недели «{cls.focusTopic.title}» закреплена у всех учеников вверху.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Students Table */}
              <div className="p-4 sm:p-5">
                {cls.students.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-400">
                    В этом классе пока нет учеников. Передайте им код приглашения{' '}
                    <span className="font-mono font-bold text-indigo-600">{cls.inviteCode}</span>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {cls.students.map((student) => {
                      return (
                        <div
                          key={student.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 px-2 rounded-xl transition-colors"
                        >
                          {/* Student Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                                  {student.fullName}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700">
                                  {student.currentLevel}
                                </span>
                                {prefs.showRiskStatus && (
                                  <>
                                    {student.riskStatus === 'high' && (
                                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Высокий риск зависания" />
                                    )}
                                    {student.riskStatus === 'medium' && (
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Требует внимания" />
                                    )}
                                    {student.riskStatus === 'low' && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="В норме" />
                                    )}
                                  </>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400">{student.email}</span>
                            </div>
                          </div>

                          {/* Dynamic Metrics */}
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {prefs.showAccuracy && (
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 block">Точность</span>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                  {student.accuracy}%
                                </span>
                              </div>
                            )}

                            {prefs.showMastered && (
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 block">Освоено тем</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {student.masteredCount} / {allTopics.length || 12}
                                </span>
                              </div>
                            )}

                            {/* Bottlenecks tags */}
                            <div className="min-w-[140px]">
                              {student.bottlenecks.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {student.bottlenecks.map((b, bIdx) => (
                                    <span
                                      key={bIdx}
                                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                    >
                                      [{b.level}] {b.title}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  Нет зависаний
                                </span>
                              )}
                            </div>

                            {/* Dossier button */}
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1"
                            >
                              <span>Досье</span>
                              <ChevronRight className="w-3 h-3 text-zinc-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Deep-Dive Dossier Modal */}
      <StudentDossierModal
        student={selectedStudent}
        allTopics={allTopics}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Metrics Preferences Modal */}
      <TeacherMetricsSettingsModal
        isOpen={isSettingsOpen}
        prefs={prefs}
        onSave={handleSavePrefs}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
