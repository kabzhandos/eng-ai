'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, LogOut, GraduationCap, Users, BarChart3, HelpCircle } from 'lucide-react';
import { AuthSession } from '@/types';
import FaqModal from './FaqModal';

export default function Navbar({ initialUser }: { initialUser?: AuthSession | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthSession | null>(initialUser || null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                EngAI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                AI English Tutor
              </span>
            </div>
          </Link>

          {/* Right Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* FAQ Button */}
            <button
              onClick={() => setIsFaqOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-colors"
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
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Панель учителя</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/analytics"
                      className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-colors"
                      title="Моя статистика"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Аналитика</span>
                    </Link>
                    <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <GraduationCap className="w-3 h-3" />
                      <span>{user.currentLevel}</span>
                    </div>
                  </>
                )}

                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {user.role === 'TEACHER' ? 'Преподаватель' : 'Ученик'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Выйти"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Вход
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 transition-colors"
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
