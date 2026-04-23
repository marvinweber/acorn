import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { t } from '../i18n';

const EMOJI_OPTIONS = [
  '🌰', '🏦', '💰', '🎯', '🏠', '🚗', '✈️', '🏖️',
  '🎓', '💊', '🛒', '🎁', '📱', '💻', '🌍', '🏋️',
  '🎵', '📚', '🐾', '☕', '🍕', '🎮', '⌚', '🚀',
  '🌱', '💎', '🪙', '💵', '🏆', '🔑', '🛠️', '👶',
  '🐶', '🐱', '🎨', '📷', '🎬', '🏊', '🚲', '🛻',
  '🏥', '⚽', '🎸', '🍺', '🧳', '🌸', '❄️', '🔥',
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
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => { onChange(emoji); setOpen(false); }}
              className={`text-2xl p-2 rounded-lg transition-colors cursor-pointer hover:bg-[#374151] ${
                value === emoji ? 'bg-[#374151] ring-2 ring-brand' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
