import { useState } from 'react';
import {
  ChevronDown,
  LayoutGrid,
  Palette,
  Settings2,
  Sparkles,
  Type,
} from 'lucide-react';
import {
  COLOR_THEME_LIST,
  DENSITY_LABELS,
  LIKA_FONT_OPTIONS,
  SHAPE_LABELS,
  type ColorTheme,
  type ColorThemeKey,
  type LikaCalStyleKey,
  type LikaDensityKey,
  type LikaFontKey,
  type LikaShapeKey,
  type WeeklyEmotePos,
  type WeeklyEmoteEntry,
} from './likaCalendarPresentation';

const MAX_WEEKLY_EMOTE_PRESETS = 26;

const WEEKLY_EMOTE_PRESETS = Array.from({ length: MAX_WEEKLY_EMOTE_PRESETS }, (_, index) => ({
  label: `리카 ${index + 1}`,
  src: `/img/lika-week-emotes/lika_icon${index + 1}.webp`,
}));

const resizeImage = (file: File, maxPx = 250): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });

interface LikaEditBarProps {
  theme: ColorTheme;
  monthThemeKey: ColorThemeKey;
  weekThemeKey: ColorThemeKey;
  onMonthThemeChange: (key: ColorThemeKey) => void;
  onWeekThemeChange: (key: ColorThemeKey) => void;
  fontKey: LikaFontKey;
  onFontChange: (font: LikaFontKey) => void;
  density: LikaDensityKey;
  onDensityChange: (density: LikaDensityKey) => void;
  shape: LikaShapeKey;
  onShapeChange: (shape: LikaShapeKey) => void;
  textScale: number;
  onTextScaleChange: (scale: number) => void;
  stickerScale: number;
  onStickerScaleChange: (scale: number) => void;
  showWeeklyEmotes: boolean;
  onShowWeeklyEmotesChange: (show: boolean) => void;
  weeklyEmotes: Record<string, WeeklyEmoteEntry>;
  onWeeklyEmoteChange: (day: number, entry: WeeklyEmoteEntry | null) => void;
  showLikaBadge: boolean;
  onShowLikaBadgeChange: (show: boolean) => void;
  showEventTime: boolean;
  onShowEventTimeChange: (show: boolean) => void;
  weekCardWidth: number;
  onWeekCardWidthChange: (width: number) => void;
  calendarStyle: LikaCalStyleKey;
  onCalendarStyleChange: (style: LikaCalStyleKey) => void;
}

function ToggleButton({
  pressed,
  label,
  onClick,
  theme,
  className = '',
  style,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
  theme: ColorTheme;
  className?: string;
  style?: React.CSSProperties;
}) {
  const colorStyle = pressed
    ? { backgroundColor: theme.accent, color: '#fff' }
    : { backgroundColor: theme.surface, color: theme.accent };

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${className}`}
      style={{ ...colorStyle, ...style }}
    >
      {label}
    </button>
  );
}

function ThemeSwatches({
  value,
  onChange,
}: {
  value: ColorThemeKey;
  onChange: (key: ColorThemeKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_THEME_LIST.map((t) => {
        const selected = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            aria-label={`${t.label} 테마`}
            aria-pressed={selected}
            title={t.label}
            onClick={() => onChange(t.key)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
              selected ? 'ring-2 ring-offset-2' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${t.bgVia}, ${t.accent})`,
              borderColor: t.border,
              ...(selected ? ({ '--tw-ring-color': t.accent } as React.CSSProperties) : {}),
            }}
          />
        );
      })}
    </div>
  );
}

function WeeklyEmotePresetButton({
  preset,
  selected,
  theme,
  title,
  onClick,
}: {
  preset: { label: string; src: string };
  selected: boolean;
  theme: ColorTheme;
  title: string;
  onClick: () => void;
}) {
  const [isMissing, setIsMissing] = useState(false);

  if (isMissing) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="overflow-hidden rounded-xl border bg-white transition-all hover:scale-105 active:scale-95"
      style={{ borderColor: selected ? theme.accent : theme.border }}
      title={title}
    >
      <img
        src={preset.src}
        alt={preset.label}
        loading="lazy"
        decoding="async"
        className="aspect-square w-full object-cover"
        onError={() => setIsMissing(true)}
      />
    </button>
  );
}


/**
 * 리카 페이지 편집 바 — 색상·폰트·밀도·모양·이미지 등 캘린더 표현을 사이트에서 즉시 조정.
 */
export default function LikaEditBar({
  theme,
  monthThemeKey,
  weekThemeKey,
  onMonthThemeChange,
  onWeekThemeChange,
  fontKey,
  onFontChange,
  density,
  onDensityChange,
  shape,
  onShapeChange,
  textScale,
  onTextScaleChange,
  stickerScale,
  onStickerScaleChange,
  showWeeklyEmotes,
  onShowWeeklyEmotesChange,
  weeklyEmotes,
  onWeeklyEmoteChange,
  showLikaBadge,
  onShowLikaBadgeChange,
  showEventTime,
  onShowEventTimeChange,
  weekCardWidth,
  onWeekCardWidthChange,
  calendarStyle,
  onCalendarStyleChange,
}: LikaEditBarProps) {
  const [open, setOpen] = useState(false);
  const [openEmoteDay, setOpenEmoteDay] = useState<number | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="편집 바 열기"
        aria-expanded={false}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: theme.accent, boxShadow: `0 10px 30px ${theme.shadow}` }}
      >
        <Settings2 className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex max-h-[min(88vh,800px)] w-[min(360px,calc(100vw-32px))] flex-col rounded-3xl border-2 bg-white/95 p-4 text-gray-700 shadow-2xl backdrop-blur-md"
      style={{ borderColor: theme.border, boxShadow: `0 10px 30px ${theme.shadow}` }}
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette className="h-4 w-4" style={{ color: theme.accent }} />
          <span className="text-sm font-bold" style={{ color: theme.accent }}>
            리카 캘린더 꾸미기
          </span>
        </div>
        <button
          type="button"
          aria-label="편집 바 접기"
          aria-expanded={true}
          onClick={() => setOpen(false)}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      <div className="pink-scrollbar -mr-1 flex flex-1 flex-col gap-5 overflow-y-auto pr-1">

        {/* ── 월간 캘린더 스타일 ── */}
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-gray-500">
            <Sparkles className="h-3.5 w-3.5" />
            월간 스타일
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <ToggleButton
              pressed={calendarStyle === 'standard'}
              label="기본"
              theme={theme}
              onClick={() => onCalendarStyleChange('standard')}
            />
            <ToggleButton
              pressed={calendarStyle === 'hand'}
              label="손그림 ✏️"
              theme={theme}
              onClick={() => onCalendarStyleChange('hand')}
            />
            <ToggleButton
              pressed={calendarStyle === 'postit'}
              label="포스트잇 📌"
              theme={theme}
              onClick={() => onCalendarStyleChange('postit')}
            />
          </div>
        </section>

        {/* ── 색상 ── */}
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-gray-500">
            <LayoutGrid className="h-3.5 w-3.5" />
            월간 색상
          </div>
          <ThemeSwatches value={monthThemeKey} onChange={onMonthThemeChange} />
        </section>

        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-gray-500">
            <LayoutGrid className="h-3.5 w-3.5" />
            주간 색상
          </div>
          <ThemeSwatches value={weekThemeKey} onChange={onWeekThemeChange} />
        </section>

        {/* ── 폰트 ── */}
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-gray-500">
            <Type className="h-3.5 w-3.5" />
            폰트
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {LIKA_FONT_OPTIONS.map((font) => (
              <ToggleButton
                key={font.key}
                pressed={font.key === fontKey}
                label={font.label}
                theme={theme}
                className="min-h-10 text-base leading-none"
                style={{ fontFamily: font.family, fontSize: '1rem', lineHeight: 1 }}
                onClick={() => onFontChange(font.key)}
              />
            ))}
          </div>
        </section>

        {/* ── 주간 이모티콘 ── */}
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-500">
              <Sparkles className="h-3.5 w-3.5" />
              주간 이모티콘
            </div>
            {Object.keys(weeklyEmotes).length > 0 && (
              <button
                type="button"
                onClick={() => [1, 2, 3, 4, 5, 6, 0].forEach((day) => onWeeklyEmoteChange(day, null))}
                className="rounded-lg px-2 py-0.5 text-[10px] font-bold text-gray-400 transition-colors hover:bg-gray-100"
              >
                전체 삭제
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {([
              { label: '월', day: 1 }, { label: '화', day: 2 }, { label: '수', day: 3 },
              { label: '목', day: 4 }, { label: '금', day: 5 }, { label: '토', day: 6 },
              { label: '일', day: 0 },
            ] as const).map(({ label, day }) => {
              const selected = weeklyEmotes[String(day)];
              const isListOpen = openEmoteDay === day;
              return (
                <div key={day} className="rounded-2xl border bg-white/75 p-2" style={{ borderColor: theme.border }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 shrink-0 rounded-lg px-1 py-1 text-center text-xs font-bold"
                      style={{ backgroundColor: theme.surface, color: theme.accent }}
                    >
                      {label}
                    </span>
                    {selected ? (
                      <img src={selected.src} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed text-[10px] font-bold text-gray-300" style={{ borderColor: theme.border }}>
                        없음
                      </span>
                    )}

                    <div className="flex gap-1">
                      {(['left', 'right'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => {
                            if (selected) onWeeklyEmoteChange(day, { ...selected, pos });
                          }}
                          disabled={!selected}
                          className="rounded-lg px-2 py-1 text-[10px] font-black transition-all disabled:opacity-35"
                          style={
                            selected?.pos === pos
                              ? { backgroundColor: theme.accent, color: '#fff' }
                              : { backgroundColor: theme.surface, color: theme.accent }
                          }
                        >
                          {pos === 'left' ? '앞' : '뒤'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenEmoteDay(isListOpen ? null : day)}
                      className="ml-auto rounded-xl px-2 py-1 text-[10px] font-black transition-all"
                      style={{ backgroundColor: theme.surface, color: theme.accent }}
                    >
                      {isListOpen ? '닫기' : '선택'}
                    </button>
                    {selected && (
                      <button
                        type="button"
                        onClick={() => onWeeklyEmoteChange(day, null)}
                        className="rounded-full px-1.5 py-1 text-[10px] font-black text-gray-300 transition-colors hover:text-gray-500"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  {isListOpen && (
                    <div className="mt-2 rounded-2xl border bg-white p-2" style={{ borderColor: theme.border }}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-gray-400">이미지 선택</span>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async () => {
                              const file = input.files?.[0];
                              if (!file) return;
                              const data = await resizeImage(file, 420);
                              onWeeklyEmoteChange(day, { src: data, pos: selected?.pos ?? 'right' });
                            };
                            input.click();
                          }}
                          className="rounded-lg px-2 py-1 text-[10px] font-black"
                          style={{ backgroundColor: theme.surface, color: theme.accent }}
                        >
                          업로드
                        </button>
                      </div>
                      <div className="pink-scrollbar grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                        {WEEKLY_EMOTE_PRESETS.map((preset) => (
                          <WeeklyEmotePresetButton
                            key={`${day}-${preset.src}`}
                            preset={preset}
                            selected={selected?.src === preset.src}
                            theme={theme}
                            title={`${label} ${preset.label}`}
                            onClick={() => {
                              onWeeklyEmoteChange(day, { src: preset.src, pos: selected?.pos ?? 'right' });
                              setOpenEmoteDay(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 주간 카드 너비 ── */}
        <section>
          <label htmlFor="lika-week-width" className="mb-2 block text-xs font-extrabold text-gray-500">
            주간 카드 너비 {weekCardWidth}%
          </label>
          <input
            id="lika-week-width"
            type="range"
            min="20"
            max="100"
            step="5"
            value={weekCardWidth}
            onChange={(e) => onWeekCardWidthChange(Number(e.target.value))}
            className="w-full accent-pink-400"
          />
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>좁게</span>
            <span>넓게</span>
          </div>
        </section>

        {/* ── 레이아웃 ── */}
        <section>
          <p className="mb-2 text-xs font-extrabold text-gray-500">일정 밀도</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['compact', 'balanced', 'full'] as const).map((item) => (
              <ToggleButton
                key={item}
                pressed={item === density}
                label={DENSITY_LABELS[item]}
                theme={theme}
                onClick={() => onDensityChange(item)}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-extrabold text-gray-500">박스 모양</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['neat', 'soft', 'bubble'] as const).map((item) => (
              <ToggleButton
                key={item}
                pressed={item === shape}
                label={SHAPE_LABELS[item]}
                theme={theme}
                onClick={() => onShapeChange(item)}
              />
            ))}
          </div>
        </section>

        {/* ── 크기 슬라이더 ── */}
        <section>
          <label htmlFor="lika-text-scale" className="mb-2 block text-xs font-extrabold text-gray-500">
            글자 크기 {textScale.toFixed(1)}x
          </label>
          <input
            id="lika-text-scale"
            type="range"
            min="0.7"
            max="2.5"
            step="0.1"
            value={textScale}
            onChange={(e) => onTextScaleChange(Number(e.target.value))}
            className="w-full accent-pink-400"
          />
        </section>

        <section>
          <label htmlFor="lika-sticker-scale" className="mb-2 block text-xs font-extrabold text-gray-500">
            주간 이모티콘 크기 {stickerScale.toFixed(1)}x
          </label>
          <input
            id="lika-sticker-scale"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={stickerScale}
            onChange={(e) => onStickerScaleChange(Number(e.target.value))}
            className="w-full accent-pink-400"
          />
        </section>

        {/* ── 표시 옵션 ── */}
        <section>
          <p className="mb-2 text-xs font-extrabold text-gray-500">표시 옵션</p>
          <div className="grid grid-cols-2 gap-1.5">
            <ToggleButton
              pressed={!showWeeklyEmotes}
              label="이모티콘 숨김"
              theme={theme}
              onClick={() => onShowWeeklyEmotesChange(!showWeeklyEmotes)}
            />
            <ToggleButton
              pressed={showLikaBadge}
              label="리카 얼굴"
              theme={theme}
              onClick={() => onShowLikaBadgeChange(!showLikaBadge)}
            />
            <ToggleButton
              pressed={showEventTime}
              label="시간 표시"
              theme={theme}
              onClick={() => onShowEventTimeChange(!showEventTime)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
