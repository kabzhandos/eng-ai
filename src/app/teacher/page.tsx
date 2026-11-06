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
} from 'lucide-react';

interface BottleneckTopic {
  title: string;
  level: string;
}

interface StudentMember {
  id: string;
  fullName: string;
  email: string;
  currentLevel: string;
  topicProgress: {
    topic: BottleneckTopic;
  }[];
  attempts: {
    isCorrect: boolean;
    createdAt: string;
  }[];
}

interface TeacherClass {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  members: {
    student: StudentMember;
  }[];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/teacher/classes');
      if (res.status === 403 || res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

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
        fetchClasses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
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
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-zinc-500">Загрузка данных преподавателя...</p>
      </div>
    );
  }

  // Calculate total students and bottlenecks across all classes
  const totalStudents = classes.reduce((acc, c) => acc + c.members.length, 0);
  const totalBottlenecks = classes.reduce(
    (acc, c) =>
      acc +
      c.members.reduce(
        (mAcc, m) => mAcc + (m.student.topicProgress.length > 0 ? 1 : 0),
        0
      ),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Кабинет преподавателя
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Контроль успеваемости классов и выявление проблемных грамматических тем (Bottlenecks)
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
            <span className="block text-xs text-zinc-400">Учеников</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {totalStudents}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-sm text-center">
            <span className="block text-xs text-rose-600 dark:text-rose-400 font-medium">
              Зоны зависания
            </span>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
              {totalBottlenecks}
            </span>
          </div>
        </div>
      </div>

      {/* Create New Class Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          Создать новый класс / группу
        </h2>
        <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Например: 10-А класс (Английский профиль)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {creating ? 'Создание...' : 'Создать класс'}
          </button>
        </form>
      </div>

      {/* Classes List */}
      <div className="space-y-6">
        {classes.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <Users className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              У вас пока нет созданных классов
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Создайте класс выше и отправьте ученикам код приглашения для регистрации
            </p>
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Class Header */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {cls.name}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Учеников в группе: {cls.members.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Инвайт-код:</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-sm tracking-wider">
                      {cls.inviteCode}
                    </span>
                    <button
                      onClick={() => copyInviteCode(cls.inviteCode)}
                      title="Скопировать инвайт-код"
                      className="p-1 hover:text-indigo-600 text-zinc-400"
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

              {/* Students Table */}
              {cls.members.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  В этот класс еще никто не вступил. Передайте ученикам код{' '}
                  <span className="font-mono font-bold text-indigo-600">{cls.inviteCode}</span>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {cls.members.map(({ student }) => {
                    const hasBottlenecks = student.topicProgress.length > 0;
                    return (
                      <div
                        key={student.id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {student.fullName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {student.currentLevel}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-500">{student.email}</span>
                          </div>
                        </div>

                        {/* Bottleneck Warning Badges */}
                        <div className="flex-1 md:max-w-md">
                          {hasBottlenecks ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Зависание (&gt;5 ошибок):
                              </span>
                              {student.topicProgress.map((p, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                >
                                  [{p.topic.level}] {p.topic.title}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                              <Check className="w-3.5 h-3.5" />
                              Все темы усваиваются без аномальных задержек
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

