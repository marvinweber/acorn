import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { t, TranslationKey } from '../i18n';

const EMOJI_CATEGORIES: { label: TranslationKey; emojis: string[] }[] = [
  { label: 'emoji_cat_money', emojis: ['🌰', '🏦', '💰', '💎', '🪙', '💵'] },
  { label: 'emoji_cat_home', emojis: ['🏠', '🔑', '🛠️', '🪴', '🪑', '🛋️'] },
  { label: 'emoji_cat_travel', emojis: ['🚗', '✈️', '🏖️', '🚲', '🛻', '🏍️', '⛵', '🧳', '🌍'] },
  { label: 'emoji_cat_tech', emojis: ['📱', '💻', '⌚', '🎧', '📷', '🚀'] },
  { label: 'emoji_cat_food', emojis: ['☕', '🍕', '🍺', '🍷'] },
  { label: 'emoji_cat_health', emojis: ['💊', '🏥', '🏋️', '🏊', '⚽', '🏆'] },
  { label: 'emoji_cat_fashion', emojis: ['🛒', '🎁', '👕', '👟', '🕶️', '🧴'] },
  { label: 'emoji_cat_entertainment', emojis: ['🎵', '🎸', '🎬', '🎨', '📚', '🎫', '🎯', '🎮'] },
  { label: 'emoji_cat_family', emojis: ['👶', '🐶', '🐱', '🐾', '🎓'] },
  { label: 'emoji_cat_nature', emojis: ['🌱', '🌸', '❄️', '🔥'] },
];

interface Props {
  value?: string;
  onChange: (emoji: string) => void;
}

export function EmojiPickerField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-text-secondary">{t('icon')}</label>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 bg-[#374151] border border-[#4b5563] rounded-lg px-3 py-2.5 text-left hover:border-brand transition-colors cursor-pointer"
        >
          <span className="text-2xl w-8 text-center">{value ?? '🌰'}</span>
          <span className="text-sm text-text-secondary">{t('pick_icon')}</span>
        </button>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t('pick_icon')}>
        <div className="flex flex-col gap-4">
          {EMOJI_CATEGORIES.map(({ label, emojis }) => (
            <div key={label}>
              <p className="text-xs text-text-secondary mb-1.5">{t(label)}</p>
              <div className="grid grid-cols-8 gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className={`text-2xl p-2 rounded-lg transition-colors cursor-pointer hover:bg-surface-raised ${
                      value === emoji ? 'bg-surface-raised ring-2 ring-brand' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
