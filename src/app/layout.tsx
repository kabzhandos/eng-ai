import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'EngAI — Уютный ИИ-тренажер грамматики английского',
  description: 'Индивидуальная адаптивная генерация заданий по грамматике и умный разбор ошибок с помощью ИИ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${jakarta.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('engai_theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] dark:bg-[#121620] text-[#1C2230] dark:text-[#EDF2F7] relative selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-950 dark:selection:text-indigo-200 transition-colors duration-200">
        {/* Cozy ambient glow background */}
        <div className="ambient-glow" aria-hidden="true" />

        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
            {children}
          </main>
          <footer className="py-7 border-t border-[#EEE8DE] dark:border-[#242C3D] text-center text-xs text-stone-500 dark:text-stone-400">
            <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span>EngAI</span>
                <span className="text-stone-300 dark:text-stone-600">•</span>
                <span>Умное и дружелюбное изучение английской грамматики</span>
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                Разработчик: Андамасова Ж.А.
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
