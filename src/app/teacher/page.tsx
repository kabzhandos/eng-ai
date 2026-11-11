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
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center animate-bounce mx-auto mb-3 text-2xl">
          👨‍🏫
        </div>
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
          Загрузка кабинета преподавателя...
        </p>
        <p className="text-xs text-stone-400 mt-1">Подготовка аналитики и слепых зон классов</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEE8DE] dark:border-[#273145]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-50">
              Кабинет преподавателя
            </h1>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Управление группами, слепые зоны класса и персональная диагностика
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-tactile flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-xs font-bold text-stone-700 dark:text-stone-200 shadow-sm"
            title="Включить / отключить отображение метрик"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Настройка метрик</span>
          </button>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-tactile flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Новый класс</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Warm Cozy Paper Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Всего учеников</span>
            <span className="text-base">👥</span>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 block">
            {totalStudents}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Групп / классов</span>
            <span className="text-base">🏫</span>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 block">
            {classes.length}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">Зон зависания</span>
            <span className="text-base">⚠️</span>
          </div>
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
            {totalBottlenecks}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400">В зоне риска</span>
            <span className="text-base">🚨</span>
          </div>
          <span className="text-2xl font-extrabold text-amber-500 mt-1 block">
            {highRiskStudents}
          </span>
        </div>
      </div>

      {/* Create Class Drawer / Form */}
      {showCreateForm && (
        <div className="p-5 rounded-3xl bg-[#FBF9F5] dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] shadow-sm transition-all">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-2.5">
            Создать новый класс
          </h3>
          <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              required
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Название (например: 10-А класс Английский)"
              className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={creating}
              className="btn-tactile px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="space-y-6">
        {classes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E]">
            <div className="text-4xl mb-3">🏫</div>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              У вас еще нет созданных классов
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Нажмите «Новый класс» выше и передайте инвайт-код ученикам для подключения к группе
            </p>
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded-3xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] shadow-sm overflow-hidden"
            >
              {/* Class Header */}
              <div className="p-5 border-b border-[#EEE8DE] dark:border-[#273145] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]/60 dark:bg-[#141A26]/40">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-50">
                      {cls.name}
                    </h2>
                    <span className="text-[11px] font-semibold text-stone-400">
                      • {cls.students.length} учеников
                    </span>
                  </div>
                </div>

                {/* Invite Code Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    Код для учеников:
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
                    <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 text-xs tracking-wider">
                      {cls.inviteCode}
                    </span>
                    <button
                      onClick={() => copyInviteCode(cls.inviteCode)}
                      title="Скопировать инвайт-код"
                      className="p-0.5 text-stone-400 hover:text-indigo-600 transition-colors"
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
                <div className="mx-5 mt-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
                  <span className="text-base shrink-0 mt-0.5">💡</span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      ИИ-совет к уроку:{' '}
                    </span>
                    {cls.aiLessonAdvice}
                  </div>
                </div>
              )}

              {/* Optional Metric 2: Class Blindspots & Focus Topic Grid */}
              {(prefs.showBlindspots || prefs.showFocusTopic) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 px-5 mt-4">
                  {/* Blindspots block */}
                  {prefs.showBlindspots && (
                    <div className="p-4 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26]">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200 mb-2.5">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          Слепые зоны класса (Топ ошибок)
                        </span>
                      </div>
                      {cls.blindspots.length === 0 ? (
                        <p className="text-[11px] text-stone-400">
                          Ошибок пока нет, класс решает стабильно!
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {cls.blindspots.map((bs, bsIdx) => (
                            <div
                              key={bsIdx}
                              className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145]"
                            >
                              <span className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[200px]">
                                [{bs.topicLevel}] {bs.topicTitle}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
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
                    <div className="p-4 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26]">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200 mb-2.5">
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-500" />
                          Фокусная тема недели (ДЗ)
                        </span>
                        {cls.focusTopic && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            Сдали: {cls.focusCompletedCount} из {cls.students.length}
                          </span>
                        )}
                      </div>

                      <select
                        value={cls.focusTopicId || ''}
                        onChange={(e) => handleSetFocusTopic(cls.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-stone-800 dark:text-stone-200 focus:outline-none shadow-xs"
                      >
                        <option value="">-- Выберите тему недели для закрепления --</option>
                        {allTopics.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.level}] {t.title}
                          </option>
                        ))}
                      </select>

                      {cls.focusTopic && (
                        <div className="mt-2.5 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                          <Check className="w-3.5 h-3.5" />
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
              <div className="p-5">
                {cls.students.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400">
                    В этом классе пока нет учеников. Передайте им инвайт-код{' '}
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {cls.inviteCode}
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-[#EEE8DE] dark:divide-[#273145]">
                    {cls.students.map((student) => {
                      return (
                        <div
                          key={student.id}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#FBF9F5] dark:hover:bg-[#141A26]/50 px-3 rounded-2xl transition-colors"
                        >
                          {/* Student Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100 dark:border-indigo-800/40">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                                  {student.fullName}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-[#EEE8DE] dark:border-[#273145]">
                                  {student.currentLevel}
                                </span>
                                {prefs.showRiskStatus && (
                                  <>
                                    {student.riskStatus === 'high' && (
                                      <span
                                        className="w-2 h-2 rounded-full bg-rose-500 shrink-0"
                                        title="Высокий риск зависания"
                                      />
                                    )}
                                    {student.riskStatus === 'medium' && (
                                      <span
                                        className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                                        title="Требует внимания"
                                      />
                                    )}
                                    {student.riskStatus === 'low' && (
                                      <span
                                        className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                                        title="В норме"
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400">{student.email}</span>
                            </div>
                          </div>

                          {/* Dynamic Metrics */}
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {prefs.showAccuracy && (
                              <div className="text-right">
                                <span className="text-[10px] text-stone-400 block font-medium">Точность</span>
                                <span className="font-bold text-stone-800 dark:text-stone-200">
                                  {student.accuracy}%
                                </span>
                              </div>
                            )}

                            {prefs.showMastered && (
                              <div className="text-right">
                                <span className="text-[10px] text-stone-400 block font-medium">Освоено тем</span>
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
                                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
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
                              className="btn-tactile px-3 py-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#141A26] hover:bg-[#FBF9F5] text-stone-700 dark:text-stone-200 font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <span>Досье</span>
                              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
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
