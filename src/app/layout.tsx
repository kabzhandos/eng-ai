import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EngAI — ИИ-тренажер грамматики английского языка',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
          EngAI — Индивидуальное обучение грамматике на базе генеративного ИИ
        </footer>
      </body>
    </html>
  );
}
