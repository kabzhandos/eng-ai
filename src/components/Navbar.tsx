'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, LogOut, GraduationCap, Users, BarChart3, HelpCircle, Sun, Moon } from 'lucide-react';
import { AuthSession } from '@/types';
import FaqModal from './FaqModal';

export default function Navbar({ initialUser }: { initialUser?: AuthSession | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthSession | null>(initialUser || null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('engai_theme', nextTheme);
    } catch {}
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/85 dark:bg-[#121620]/85 backdrop-blur-md border-b border-[#EEE8DE] dark:border-[#242C3D] transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-50 tracking-tight">
                EngAI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                <span>✨</span> ИИ-тьютор
              </span>
            </div>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
              className="btn-tactile p-2 rounded-xl text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-[#19202E] hover:bg-white dark:hover:bg-[#20293A] border border-[#EEE8DE] dark:border-[#273145] shadow-2xs transition-all flex items-center justify-center"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in fade-in zoom-in-75 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>

            {/* FAQ Button */}
            <button
              onClick={() => setIsFaqOpen(true)}
              className="btn-tactile flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-[#19202E] hover:bg-white dark:hover:bg-[#20293A] border border-[#EEE8DE] dark:border-[#273145] shadow-2xs transition-all"
              title="Часто задаваемые вопросы"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>FAQ</span>
            </button>

            {user ? (
              <>
                {user.role === 'TEACHER' ? (
                  <Link
                    href="/teacher"
                    className="btn-tactile flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Панель учителя</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/analytics"
                      className="btn-tactile hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-[#19202E] hover:bg-white dark:hover:bg-[#20293A] border border-[#EEE8DE] dark:border-[#273145] shadow-2xs transition-all"
                      title="Моя статистика"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Аналитика</span>
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                      <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Уровень {user.currentLevel}</span>
                    </div>
                  </>
                )}

                <div className="hidden md:flex flex-col text-right pl-1">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-100 leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {user.role === 'TEACHER' ? 'Преподаватель' : 'Ученик'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Выйти"
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-800 transition-colors"
                >
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="btn-tactile text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FAQ Modal */}
      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
    </>
  );
}
