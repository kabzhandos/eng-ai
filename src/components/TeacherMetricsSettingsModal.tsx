'use client';

import { X, SlidersHorizontal, Check } from 'lucide-react';

export interface TeacherMetricPreferences {
  showBlindspots: boolean;
  showAiAdvice: boolean;
  showFocusTopic: boolean;
  showRiskStatus: boolean;
  showAccuracy: boolean;
  showMastered: boolean;
}

export const DEFAULT_TEACHER_PREFS: TeacherMetricPreferences = {
  showBlindspots: true,
  showAiAdvice: true,
  showFocusTopic: true,
  showRiskStatus: true,
  showAccuracy: true,
  showMastered: true,
};

export default function TeacherMetricsSettingsModal({
  isOpen,
  prefs,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  prefs: TeacherMetricPreferences;
  onSave: (newPrefs: TeacherMetricPreferences) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const toggle = (key: keyof TeacherMetricPreferences) => {
    onSave({
      ...prefs,
      [key]: !prefs[key],
    });
  };

  const options: { key: keyof TeacherMetricPreferences; label: string; desc: string }[] = [
    {
      key: 'showBlindspots',
      label: 'Слепые зоны класса (Топ проблемных тем)',
      desc: 'Выводит рейтинг грамматических правил, на которых спотыкается больше всего учеников.',
    },
    {
      key: 'showAiAdvice',
      label: 'ИИ-совет к следующему уроку',
      desc: 'Автоматический синтез рекомендаций от Gemini для 10-минутной разминки у доски.',
    },
    {
      key: 'showFocusTopic',
      label: 'Фокусная тема недели (ДЗ)',
      desc: 'Возможность закрепить тему недели для класса и контролировать прогресс сдачи.',
    },
    {
      key: 'showRiskStatus',
      label: 'Индикатор риска «Need Attention»',
      desc: 'Цветовой светофор (Красный / Желтый / Зеленый) для мгновенного выявления отстающих.',
    },
    {
      key: 'showAccuracy',
      label: 'Колонка точности ответов (%)',
      desc: 'Отображает процент правильных решений каждого ученика.',
    },
    {
      key: 'showMastered',
      label: 'Колонка освоенных тем (3+ верных подряд)',
      desc: 'Счетчик полностью пройденных грамматических веток.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Настройка отображения метрик
              </h2>
              <p className="text-xs text-zinc-500">Включайте только те блоки, которые вам нужны</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="py-4 space-y-3">
          {options.map((opt) => {
            const isChecked = prefs[opt.key];
            return (
              <div
                key={opt.key}
                onClick={() => toggle(opt.key)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{opt.label}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{opt.desc}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => onSave(DEFAULT_TEACHER_PREFS)}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
          >
            Сбросить по умолчанию
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
