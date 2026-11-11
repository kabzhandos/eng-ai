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
  Archive,
  RotateCcw,
  Trash2,
  MessageSquare,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  X,
  Mail,
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
  isArchived?: boolean;
  archivedAt?: string | null;
  focusTopic?: GrammarTopicRef | null;
  focusTopicId?: string | null;
  focusCompletedCount: number;
  totalStudents: number;
  totalPendingFlags?: number;
  blindspots: ClassBlindspot[];
  aiLessonAdvice: string;
  students: StudentDossier[];
}

export default function TeacherDashboard() {
  const router = useRouter();

  const [classes, setClasses] = useState<EnrichedClass[]>([]);
  const [allTopics, setAllTopics] = useState<GrammarTopicRef[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab state: active vs archived classes
  const [classTab, setClassTab] = useState<'active' | 'archived'>('active');

  // Class creation state
  const [newClassName, setNewClassName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentDossier | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Student Roster Management States
  const [addingStudentClassId, setAddingStudentClassId] = useState<string | null>(null);
  const [studentEmailToAdd, setStudentEmailToAdd] = useState('');
  const [addingStudentLoading, setAddingStudentLoading] = useState(false);
  const [addStudentError, setAddStudentError] = useState<string | null>(null);

  const [movingStudent, setMovingStudent] = useState<{
    student: StudentDossier;
    sourceClassId: string;
    sourceClassName: string;
  } | null>(null);
  const [targetClassId, setTargetClassId] = useState('');
  const [movingLoading, setMovingLoading] = useState(false);

  // Filter archived students toggle per class
  const [showArchivedStudents, setShowArchivedStudents] = useState<Record<string, boolean>>({});

  // Metrics preferences with localStorage persistence
  const [prefs, setPrefs] = useState<TeacherMetricPreferences>(DEFAULT_TEACHER_PREFS);

  useEffect(() => {
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

  const handleToggleArchiveClass = async (classId: string, shouldArchive: boolean) => {
    try {
      await fetch('/api/teacher/classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, isArchived: shouldArchive }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (
      !confirm(
        `Вы уверены, что хотите окончательно удалить класс «${className}»? Это действие нельзя отменить.`
      )
    ) {
      return;
    }
    try {
      await fetch(`/api/teacher/classes?classId=${classId}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Student Roster Actions
  const handleAddStudent = async (classId: string) => {
    if (!studentEmailToAdd.trim() || addingStudentLoading) return;
    setAddingStudentLoading(true);
    setAddStudentError(null);

    try {
      const res = await fetch('/api/teacher/classes/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, email: studentEmailToAdd.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddStudentError(data.error || 'Ошибка добавления ученика');
      } else {
        setStudentEmailToAdd('');
        setAddingStudentClassId(null);
        fetchData();
      }
    } catch (e) {
      setAddStudentError('Не удалось связаться с сервером');
    } finally {
      setAddingStudentLoading(false);
    }
  };

  const handleRemoveStudentFromClass = async (
    classId: string,
    studentId: string,
    studentName: string,
    className: string
  ) => {
    if (
      !confirm(
        `Удалить ученика «${studentName}» из класса «${className}»? Ученик перестанет числиться в классе, но его аккаунт и прогресс сохранятся.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/teacher/classes/members?classId=${classId}&studentId=${studentId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleArchiveStudent = async (
    classId: string,
    studentId: string,
    shouldArchive: boolean
  ) => {
    try {
      const res = await fetch('/api/teacher/classes/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, studentId, isArchived: shouldArchive }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmMoveStudent = async () => {
    if (!movingStudent || !targetClassId || movingLoading) return;
    setMovingLoading(true);

    try {
      const res = await fetch('/api/teacher/classes/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: movingStudent.sourceClassId,
          studentId: movingStudent.student.id,
          targetClassId,
        }),
      });
      if (res.ok) {
        setMovingStudent(null);
        setTargetClassId('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMovingLoading(false);
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

  const activeClasses = classes.filter((c) => !c.isArchived);
  const archivedClasses = classes.filter((c) => c.isArchived);
  const displayedClasses = classTab === 'active' ? activeClasses : archivedClasses;

  // Aggregate global stats across active classes
  const totalStudents = activeClasses.reduce((acc, c) => acc + c.students.length, 0);
  const totalBottlenecks = activeClasses.reduce(
    (acc, c) => acc + c.students.reduce((sAcc, s) => sAcc + s.bottlenecks.length, 0),
    0
  );
  const highRiskStudents = activeClasses.reduce(
    (acc, c) => acc + c.students.filter((s) => s.riskStatus === 'high').length,
    0
  );
  const totalFlagsAcrossClasses = activeClasses.reduce(
    (acc, c) => acc + (c.totalPendingFlags || 0),
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
            Управление группами, составом учеников, слепыми зонами и вопросами
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
            <span className="text-xs font-semibold text-stone-400">Активных классов</span>
            <span className="text-base">🏫</span>
          </div>
          <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 block">
            {activeClasses.length}
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
            <span className="text-xs font-semibold text-stone-400">Вопросов на разбор</span>
            <span className="text-base">🙋‍♂️</span>
          </div>
          <span className={`text-2xl font-extrabold mt-1 block ${totalFlagsAcrossClasses > 0 ? 'text-amber-500' : 'text-stone-400'}`}>
            {totalFlagsAcrossClasses}
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

      {/* Tabs: Active vs Archived Classes */}
      <div className="flex items-center gap-2 border-b border-[#EEE8DE] dark:border-[#273145] pb-2">
        <button
          onClick={() => setClassTab('active')}
          className={`btn-tactile px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            classTab === 'active'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] text-stone-600 dark:text-stone-300'
          }`}
        >
          <span>Активные классы</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 dark:bg-black/20">
            {activeClasses.length}
          </span>
        </button>

        <button
          onClick={() => setClassTab('archived')}
          className={`btn-tactile px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            classTab === 'archived'
              ? 'bg-stone-800 text-white dark:bg-stone-700 shadow-sm'
              : 'bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] text-stone-600 dark:text-stone-300'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Архив классов</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {archivedClasses.length}
          </span>
        </button>
      </div>

      {/* Classes List */}
      <div className="space-y-6">
        {displayedClasses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E]">
            <div className="text-4xl mb-3">{classTab === 'active' ? '🏫' : '🗄️'}</div>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              {classTab === 'active'
                ? 'У вас еще нет активных классов'
                : 'В архиве пока нет сохранённых классов'}
            </h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              {classTab === 'active'
                ? 'Нажмите «Новый класс» выше и передайте инвайт-код ученикам для подключения к группе'
                : 'Сюда попадают классы, которые вы отправили в архив. Их можно восстановить в любой момент или удалить окончательно.'}
            </p>
          </div>
        ) : (
          displayedClasses.map((cls) => {
            const isAddingStudent = addingStudentClassId === cls.id;
            const isShowingArchived = showArchivedStudents[cls.id] || false;

            const regularStudents = cls.students.filter((s) => !s.isStudentArchived);
            const classArchivedStudents = cls.students.filter((s) => s.isStudentArchived);
            const displayedStudents = isShowingArchived ? cls.students : regularStudents;

            return (
              <div
                key={cls.id}
                className={`rounded-3xl border shadow-sm overflow-hidden transition-all ${
                  cls.isArchived
                    ? 'border-stone-300 dark:border-stone-800 bg-[#FBF9F5] dark:bg-[#141A26] opacity-90'
                    : 'border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E]'
                }`}
              >
                {/* Class Header */}
                <div className="p-5 border-b border-[#EEE8DE] dark:border-[#273145] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]/60 dark:bg-[#141A26]/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-50">
                        {cls.name}
                      </h2>
                      <span className="text-[11px] font-semibold text-stone-400">
                        • {regularStudents.length} активных учеников
                        {classArchivedStudents.length > 0 && ` (${classArchivedStudents.length} в архиве)`}
                      </span>
                      {cls.isArchived && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          Класс в архиве
                        </span>
                      )}
                      {(cls.totalPendingFlags ?? 0) > 0 && !cls.isArchived && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {cls.totalPendingFlags} вопр. от учеников
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center flex-wrap gap-2">
                    {!cls.isArchived ? (
                      <>
                        {/* Add Student Button */}
                        <button
                          onClick={() => {
                            setAddingStudentClassId(isAddingStudent ? null : cls.id);
                            setAddStudentError(null);
                          }}
                          className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-2xs hover:bg-indigo-100"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Добавить ученика</span>
                        </button>

                        {/* Invite Code */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mr-1">
                            Код:
                          </span>
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

                        {/* Archive Class */}
                        <button
                          onClick={() => handleToggleArchiveClass(cls.id, true)}
                          title="Отправить класс в архив"
                          className="btn-tactile flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          <Archive className="w-3.5 h-3.5 text-stone-400" />
                          <span>В архив</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleArchiveClass(cls.id, false)}
                          title="Восстановить класс из архива"
                          className="btn-tactile flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Восстановить класс</span>
                        </button>

                        <button
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                          title="Окончательно удалить класс"
                          className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Удалить класс</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Add Student Form Drawer */}
                {isAddingStudent && (
                  <div className="mx-5 mt-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                        Добавить ученика в «{cls.name}» по Email
                      </span>
                      <button
                        onClick={() => {
                          setAddingStudentClassId(null);
                          setAddStudentError(null);
                        }}
                        className="text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={studentEmailToAdd}
                          onChange={(e) => setStudentEmailToAdd(e.target.value)}
                          placeholder="Email зарегистрированного ученика (например: student@school.edu)"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#19202E] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                        />
                      </div>
                      <button
                        onClick={() => handleAddStudent(cls.id)}
                        disabled={addingStudentLoading || !studentEmailToAdd.trim()}
                        className="btn-tactile px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs disabled:opacity-50 whitespace-nowrap"
                      >
                        {addingStudentLoading ? 'Добавление...' : 'Добавить в класс'}
                      </button>
                    </div>

                    {addStudentError && (
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-2">
                        {addStudentError}
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Metric 1: AI Lesson Advice */}
                {!cls.isArchived && prefs.showAiAdvice && cls.aiLessonAdvice && (
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
                {!cls.isArchived && (prefs.showBlindspots || prefs.showFocusTopic) && (
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
                              Сдали: {cls.focusCompletedCount} из {regularStudents.length}
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Список учеников ({displayedStudents.length}):
                    </span>

                    {classArchivedStudents.length > 0 && (
                      <button
                        onClick={() =>
                          setShowArchivedStudents((prev) => ({
                            ...prev,
                            [cls.id]: !prev[cls.id],
                          }))
                        }
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {isShowingArchived
                          ? 'Скрыть архивных учеников'
                          : `Показать архивных учеников (${classArchivedStudents.length})`}
                      </button>
                    )}
                  </div>

                  {displayedStudents.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-400">
                      В этом классе пока нет активных учеников.{' '}
                      {!cls.isArchived && (
                        <>
                          Вы можете добавить ученика по кнопке{' '}
                          <span className="font-bold text-indigo-600">«Добавить ученика»</span> или передать инвайт-код{' '}
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {cls.inviteCode}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEE8DE] dark:divide-[#273145]">
                      {displayedStudents.map((student) => {
                        const isStudentArchived = student.isStudentArchived;
                        return (
                          <div
                            key={student.id}
                            className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs px-3 rounded-2xl transition-colors ${
                              isStudentArchived
                                ? 'bg-stone-100/60 dark:bg-stone-800/40 opacity-70'
                                : 'hover:bg-[#FBF9F5] dark:hover:bg-[#141A26]/50'
                            }`}
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
                                  {isStudentArchived && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                                      В архиве класса
                                    </span>
                                  )}
                                  {(student.pendingFlagsCount ?? 0) > 0 && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                      <MessageSquare className="w-2.5 h-2.5" />
                                      <span>{student.pendingFlagsCount} вопр.</span>
                                    </span>
                                  )}
                                  {prefs.showRiskStatus && !isStudentArchived && (
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

                            {/* Metrics & Roster Action Controls */}
                            <div className="flex flex-wrap items-center gap-3 text-xs">
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

                              {/* Student Actions */}
                              <div className="flex items-center gap-1.5 pl-2 border-l border-[#EEE8DE] dark:border-[#273145]">
                                {/* Dossier button */}
                                <button
                                  onClick={() => setSelectedStudent(student)}
                                  className="btn-tactile px-3 py-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#141A26] hover:bg-[#FBF9F5] text-stone-700 dark:text-stone-200 font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                                  title="Открыть досье и матрицу тем ученика"
                                >
                                  <span>Досье</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                                </button>

                                {/* Move student to another class */}
                                {activeClasses.length > 1 && (
                                  <button
                                    onClick={() =>
                                      setMovingStudent({
                                        student,
                                        sourceClassId: cls.id,
                                        sourceClassName: cls.name,
                                      })
                                    }
                                    title="Переместить ученика в другой класс"
                                    className="p-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#141A26] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-stone-500 hover:text-indigo-600 transition-colors shadow-2xs"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Archive / Restore student in class */}
                                <button
                                  onClick={() =>
                                    handleToggleArchiveStudent(
                                      cls.id,
                                      student.id,
                                      !isStudentArchived
                                    )
                                  }
                                  title={
                                    isStudentArchived
                                      ? 'Восстановить ученика в класс'
                                      : 'Отправить ученика в архив этого класса'
                                  }
                                  className={`p-1.5 rounded-xl border transition-colors shadow-2xs ${
                                    isStudentArchived
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                      : 'border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#141A26] text-stone-500 hover:text-stone-800'
                                  }`}
                                >
                                  {isStudentArchived ? (
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  ) : (
                                    <Archive className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Remove student from class */}
                                <button
                                  onClick={() =>
                                    handleRemoveStudentFromClass(
                                      cls.id,
                                      student.id,
                                      student.fullName,
                                      cls.name
                                    )
                                  }
                                  title="Удалить ученика из класса (открепить)"
                                  className="p-1.5 rounded-xl border border-[#EEE8DE] dark:border-[#273145] bg-white dark:bg-[#141A26] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 transition-colors shadow-2xs"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Move Student Modal Dialog */}
      {movingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-50">
                  Переместить ученика
                </h3>
              </div>
              <button
                onClick={() => setMovingStudent(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
              Перемещение ученика <span className="font-bold">{movingStudent.student.fullName}</span> из класса{' '}
              <span className="font-bold">«{movingStudent.sourceClassName}»</span> в другой класс:
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Выберите целевой класс:
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              >
                <option value="">-- Выберите класс назначения --</option>
                {activeClasses
                  .filter((c) => c.id !== movingStudent.sourceClassId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students.length} учеников)
                    </option>
                  ))}
              </select>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setMovingStudent(null)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={!targetClassId || movingLoading}
                  onClick={handleConfirmMoveStudent}
                  className="btn-tactile px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{movingLoading ? 'Перемещение...' : 'Переместить ученика'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Deep-Dive Dossier Modal */}
      <StudentDossierModal
        student={selectedStudent}
        allTopics={allTopics}
        onClose={() => setSelectedStudent(null)}
        onFlagStatusChange={fetchData}
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
