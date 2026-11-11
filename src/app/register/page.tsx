'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, User, Mail, Lock, KeyRound, GraduationCap, Users } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          inviteCode: role === 'STUDENT' ? inviteCode : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка при регистрации');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Не удалось подключиться к серверу');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#19202E] border border-[#EEE8DE] dark:border-[#273145] rounded-3xl shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 items-center justify-center mb-3 text-2xl shadow-inner">
            ✨
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">Создание аккаунта</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Выбери роль и начни интерактивное изучение грамматики
          </p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FBF9F5] dark:bg-[#141A26] border border-[#EEE8DE] dark:border-[#273145] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'STUDENT'
                ? 'bg-white dark:bg-[#19202E] text-indigo-600 dark:text-indigo-400 shadow-sm border border-[#EEE8DE] dark:border-[#273145]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Ученик
          </button>
          <button
            type="button"
            onClick={() => setRole('TEACHER')}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              role === 'TEACHER'
                ? 'bg-white dark:bg-[#19202E] text-indigo-600 dark:text-indigo-400 shadow-sm border border-[#EEE8DE] dark:border-[#273145]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Учитель
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Имя и фамилия
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              />
            </div>
          </div>

          {role === 'STUDENT' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Код класса от учителя (опционально)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="НАПР. 9XYZ4A"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EEE8DE] dark:border-[#273145] bg-[#FBF9F5] dark:bg-[#141A26] text-stone-900 dark:text-stone-100 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-tactile w-full py-3 px-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Создание...' : 'Зарегистрироваться'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500 dark:text-stone-400 font-medium">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
