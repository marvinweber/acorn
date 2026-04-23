import { useState } from 'react';
import { t, type TranslationKey } from '../i18n';

interface Slide {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  bg: string;
}

const SLIDES: Slide[] = [
  { titleKey: 'onboarding_1_title', bodyKey: 'onboarding_1_body', bg: '#16a34a' },
  { titleKey: 'onboarding_why_title', bodyKey: 'onboarding_why_body', bg: '#78350f' },
  { titleKey: 'onboarding_2_title', bodyKey: 'onboarding_2_body', bg: '#3b82f6' },
  { titleKey: 'onboarding_3_title', bodyKey: 'onboarding_3_body', bg: '#16a34a' },
  { titleKey: 'onboarding_4_title', bodyKey: 'onboarding_4_body', bg: '#8b5cf6' },
  { titleKey: 'onboarding_5_title', bodyKey: 'onboarding_5_body', bg: '#f59e0b' },
  { titleKey: 'onboarding_6_title', bodyKey: 'onboarding_6_body', bg: '#06b6d4' },
];

interface Props {
  onDone: () => void;
}

export function Onboarding({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-100 bg-surface flex flex-col max-w-120 mx-auto">
      {/* Slide area */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 gap-6 transition-colors duration-300"
        style={{ background: `linear-gradient(160deg, ${slide.bg}22 0%, transparent 60%)` }}
      >
        {/* Large emoji */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg"
          style={{ background: `${slide.bg}33`, border: `2px solid ${slide.bg}55` }}
        >
          {extractEmoji(t(slide.titleKey))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            {stripEmoji(t(slide.titleKey))}
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            {t(slide.bodyKey)}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 py-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all cursor-pointer ${
              i === index ? 'w-6 h-2 bg-brand' : 'w-2 h-2 bg-[#374151]'
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-6 pb-10 gap-4">
        <button
          onClick={onDone}
          className="text-sm text-[#6b7280] hover:text-text-secondary transition-colors cursor-pointer"
        >
          {t('onboarding_skip')}
        </button>

        <button
          onClick={() => isLast ? onDone() : setIndex(i => i + 1)}
          className="flex-1 max-w-50 py-3 rounded-xl font-semibold text-white transition-colors cursor-pointer"
          style={{ background: slide.bg }}
        >
          {isLast ? t('onboarding_done') : t('onboarding_next')}
        </button>
      </div>
    </div>
  );
}

function extractEmoji(str: string): string {
  const match = str.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  return match?.[0] ?? '🌰';
}

function stripEmoji(str: string): string {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+$/u, '').trim();
}
