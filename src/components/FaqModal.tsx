'use client';

import { useState } from 'react';
import { HelpCircle, X, ChevronDown, Sparkles, BookOpen, Target, ShieldCheck, Zap, Users } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  icon: any;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'ИИ и генерация',
    icon: Sparkles,
    question: 'Как ИИ генерирует задания и почему они не повторяются?',
    answer:
      'В EngAI полностью отсутствует статическая база вопросов. Каждое задание формируется нейросетью Gemini 3.5 Flash в реальном времени. В промпт закладывается строгое ограничение по уровню словаря (CEFR A1–B2) и грамматическое правило темы, благодаря чему списать или зазубрить готовый тест невозможно.',
  },
  {
    category: 'Обучение',
    icon: Target,
    question: 'Что такое Smart Retry и как работает разбор ошибок?',
    answer:
      'Если ученик ошибается, система не дает тот же самый пример повторно. Вместо этого ИИ анализирует конкретную ошибку, формулирует понятное объяснение на русском языке с мнемоническим лайфхаком и мгновенно предлагает абсолютно новое предложение на это же правило.',
  },
  {
    category: 'Тестирование',
    icon: BookOpen,
    question: 'Как устроено входное тестирование (Placement Test)?',
    answer:
      'Тест состоит из 20 вопросов, разделенных на 4 прогрессивных блока: 5 вопросов уровня A1, 5 — A2, 5 — B1 и 5 — B2. По итогам рассчитывается срез знаний и автоматически подтверждается стартовый уровень ученика с разблокировкой грамматического дерева.',
  },
  {
    category: 'Для учителей',
    icon: ShieldCheck,
    question: 'Что такое «Зона зависания» (Bottleneck) и как она вычисляется?',
    answer:
      'Если ученик совершает 5 и более ошибок на одном грамматическом правиле, система поднимает красный флаг «Bottleneck». В панели учителя эта тема подсвечивается красным — это сигнал педагогу разобрать данное правило с учеником индивидуально или у доски со всем классом.',
  },
  {
    category: 'Для учителей',
    icon: Users,
    question: 'Как создать класс и привязать учеников?',
    answer:
      'Учитель в своем кабинете нажимает «Создать класс» и получает уникальный 6-значный инвайт-код (например, ENG10A). Ученики вводят этот код при регистрации или в своем профиле, после чего автоматически попадают в сводную ведомость преподавателя.',
  },
  {
    category: 'Производительность',
    icon: Zap,
    question: 'Почему задания появляются моментально и без задержек?',
    answer:
      'Реализована пакетная прегенерация (Batching 10x): за 1 сетевой запрос к ИИ генерируется пачка из 10 заданий с готовыми ответами и пояснениями. Проверка ответов ученика происходит локально за 1 миллисекунду, не расходуя суточный лимит запросов.',
  },
];

export default function FaqModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredFaq = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Справка и FAQ по функционалу
              </h2>
              <p className="text-xs text-zinc-500">
                Ответы на ключевые вопросы по работе платформы EngAI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 pt-4 pb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по вопросам (ИИ, Smart Retry, Bottleneck)..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Accordion List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2.5">
          {filteredFaq.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-8">Ничего не найдено по вашему запросу.</p>
          ) : (
            filteredFaq.map((item, idx) => {
              const isOpen = openIndex === idx;
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span>EngAI v1.0 • Платформа адаптивного изучения грамматики</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

