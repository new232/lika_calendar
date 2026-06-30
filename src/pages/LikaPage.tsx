import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { apiGetLikaCalendar, type LikaSchedule } from '../api/client';
import {
  getColorTheme,
  getLikaFont,
  DENSITY_CONFIG,
  SHAPE_RADIUS,
  type ColorThemeKey,
  type LikaDensityKey,
  type LikaFontKey,
  type LikaShapeKey,
  type LikaCalStyleKey,
  type WeeklyEmoteEntry,
} from '../components/lika/likaCalendarPresentation';
import LikaEditBar from '../components/lika/LikaEditBar';
import LikaMonthView from '../components/lika/LikaMonthView';
import LikaWeekView from '../components/lika/LikaWeekView';
import LikaDayModal from '../components/lika/LikaDayModal';

const MONTH_THEME_STORAGE_KEY = 'lika.monthColorTheme';
const WEEK_THEME_STORAGE_KEY = 'lika.weekColorTheme';
const FONT_STORAGE_KEY = 'lika.font';
const DENSITY_STORAGE_KEY = 'lika.density';
const SHAPE_STORAGE_KEY = 'lika.shape';
const TEXT_SCALE_STORAGE_KEY = 'lika.textScale';
const STICKER_SCALE_STORAGE_KEY = 'lika.stickerScale';
const SHOW_WEEKLY_EMOTES_STORAGE_KEY = 'lika.showWeeklyEmotes';
const WEEKLY_EMOTES_STORAGE_KEY = 'lika.weeklyEmotes';
const LIKA_BADGE_STORAGE_KEY = 'lika.showLikaBadge';
const EVENT_TIME_STORAGE_KEY = 'lika.showEventTime';
const WEEK_CARD_WIDTH_STORAGE_KEY = 'lika.weekCardWidth';
const CAL_STYLE_STORAGE_KEY = 'lika.calendarStyle';
const INITIAL_SETTINGS_VERSION_STORAGE_KEY = 'lika.initialSettingsVersion';
const INITIAL_SETTINGS_VERSION = '2026-06-30-font-size-week-width';

const boolFromStorage = (key: string, fallback: boolean) => {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;
  return saved === 'true';
};

const isValidWeeklyEmoteSrc = (src: unknown): src is string =>
  typeof src === 'string' &&
  (src.startsWith('data:image/') ||
    /^\/img\/lika-week-emotes\/lika_icon[1-9]\d*\.(png|webp)$/.test(src));

const normalizeWeeklyEmoteSrc = (src: string) =>
  src.replace(/^\/img\/lika-week-emotes\/(lika_icon[1-9]\d*)\.png$/, '/img/lika-week-emotes/$1.webp');

const normalizeWeeklyEmote = (value: unknown): WeeklyEmoteEntry | null => {
  if (isValidWeeklyEmoteSrc(value)) return { src: normalizeWeeklyEmoteSrc(value), pos: 'right' };
  if (!value || typeof value !== 'object') return null;

  const entry = value as { src?: unknown; pos?: unknown };
  if (!isValidWeeklyEmoteSrc(entry.src)) return null;

  return {
    src: normalizeWeeklyEmoteSrc(entry.src),
    pos: entry.pos === 'left' ? 'left' : 'right',
  };
};

const numberFromStorage = (key: string, fallback: number) => {
  const saved = Number(localStorage.getItem(key));
  return Number.isFinite(saved) ? saved : fallback;
};

const applyInitialSettings = () => {
  if (localStorage.getItem(INITIAL_SETTINGS_VERSION_STORAGE_KEY) === INITIAL_SETTINGS_VERSION) return;

  localStorage.setItem(FONT_STORAGE_KEY, 'jua');
  localStorage.setItem(TEXT_SCALE_STORAGE_KEY, '1');
  localStorage.setItem(WEEK_CARD_WIDTH_STORAGE_KEY, '35');
  localStorage.setItem(INITIAL_SETTINGS_VERSION_STORAGE_KEY, INITIAL_SETTINGS_VERSION);
};

export default function LikaPage() {
  applyInitialSettings();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    if (now.getFullYear() < 2026) {
      return new Date(2026, 5, 26);
    }
    return now;
  });

  // ── 편집 바 state (테마/폰트/밀도/장식) ──────────────────────────────
  const [monthThemeKey, setMonthThemeKey] = useState<ColorThemeKey>(() => {
    const saved = localStorage.getItem(MONTH_THEME_STORAGE_KEY) as ColorThemeKey | null;
    return saved ?? 'pink';
  });
  const [weekThemeKey, setWeekThemeKey] = useState<ColorThemeKey>(() => {
    const saved = localStorage.getItem(WEEK_THEME_STORAGE_KEY) as ColorThemeKey | null;
    return saved ?? 'yellow';
  });
  const [fontKey, setFontKey] = useState<LikaFontKey>(() => {
    const saved = localStorage.getItem(FONT_STORAGE_KEY) as LikaFontKey | null;
    return saved ?? 'jua';
  });
  const [density, setDensity] = useState<LikaDensityKey>(() => {
    const saved = localStorage.getItem(DENSITY_STORAGE_KEY) as LikaDensityKey | null;
    return saved ?? 'full';
  });
  const [shape, setShape] = useState<LikaShapeKey>(() => {
    const saved = localStorage.getItem(SHAPE_STORAGE_KEY) as LikaShapeKey | null;
    return saved ?? 'soft';
  });
  const [textScale, setTextScale] = useState(() =>
    Math.min(2.5, Math.max(0.7, numberFromStorage(TEXT_SCALE_STORAGE_KEY, 1.0))),
  );
  const [stickerScale, setStickerScale] = useState(() =>
    Math.min(2.0, Math.max(0.5, numberFromStorage(STICKER_SCALE_STORAGE_KEY, 1.15))),
  );
  const [showWeeklyEmotes, setShowWeeklyEmotes] = useState(() =>
    boolFromStorage(SHOW_WEEKLY_EMOTES_STORAGE_KEY, true),
  );
  const [weeklyEmotes, setWeeklyEmotes] = useState<Record<string, WeeklyEmoteEntry>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WEEKLY_EMOTES_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
      return Object.entries(saved).reduce<Record<string, WeeklyEmoteEntry>>((acc, [day, value]) => {
        const entry = normalizeWeeklyEmote(value);
        if (/^[0-6]$/.test(day) && entry) {
          acc[day] = entry;
        }
        return acc;
      }, {});
    }
    catch { return {}; }
  });
  const [showLikaBadge, setShowLikaBadge] = useState(() =>
    boolFromStorage(LIKA_BADGE_STORAGE_KEY, true),
  );
  const [showEventTime, setShowEventTime] = useState(() =>
    boolFromStorage(EVENT_TIME_STORAGE_KEY, true),
  );
  const [weekCardWidth, setWeekCardWidth] = useState(() =>
    Math.min(100, Math.max(20, numberFromStorage(WEEK_CARD_WIDTH_STORAGE_KEY, 35))),
  );
  const [calendarStyle, setCalendarStyle] = useState<LikaCalStyleKey>(() => {
    const saved = localStorage.getItem(CAL_STYLE_STORAGE_KEY);
    return (['hand', 'postit'].includes(saved ?? '') ? saved : 'standard') as LikaCalStyleKey;
  });
  const theme = getColorTheme(viewMode === 'month' ? monthThemeKey : weekThemeKey);
  const monthTheme = getColorTheme(monthThemeKey);
  const weekTheme = getColorTheme(weekThemeKey);
  const activeFont = getLikaFont(fontKey);
  const densityConfig = DENSITY_CONFIG[density] ?? DENSITY_CONFIG.full;
  const radius = SHAPE_RADIUS[shape] ?? SHAPE_RADIUS.soft;
  const monthEventFontSize = `clamp(${0.72 * textScale}rem, ${0.58 * textScale}rem + 0.28vw, ${1.08 * textScale}rem)`;
  const weekEventFontSize = `clamp(${0.9 * textScale}rem, ${0.72 * textScale}rem + 0.32vw, ${1.25 * textScale}rem)`;

  useEffect(() => {
    localStorage.setItem(MONTH_THEME_STORAGE_KEY, monthThemeKey);
    localStorage.setItem(WEEK_THEME_STORAGE_KEY, weekThemeKey);
    localStorage.setItem(FONT_STORAGE_KEY, fontKey);
    localStorage.setItem(DENSITY_STORAGE_KEY, density);
    localStorage.setItem(SHAPE_STORAGE_KEY, shape);
    localStorage.setItem(TEXT_SCALE_STORAGE_KEY, String(textScale));
    localStorage.setItem(STICKER_SCALE_STORAGE_KEY, String(stickerScale));
    localStorage.setItem(SHOW_WEEKLY_EMOTES_STORAGE_KEY, String(showWeeklyEmotes));
    localStorage.setItem(WEEKLY_EMOTES_STORAGE_KEY, JSON.stringify(weeklyEmotes));
    localStorage.setItem(LIKA_BADGE_STORAGE_KEY, String(showLikaBadge));
    localStorage.setItem(EVENT_TIME_STORAGE_KEY, String(showEventTime));
    localStorage.setItem(WEEK_CARD_WIDTH_STORAGE_KEY, String(weekCardWidth));
    localStorage.setItem(CAL_STYLE_STORAGE_KEY, calendarStyle);
  }, [monthThemeKey, weekThemeKey, fontKey, density, shape, textScale, stickerScale,
      showWeeklyEmotes, weeklyEmotes, showLikaBadge, showEventTime, weekCardWidth, calendarStyle]);

  const handleWeeklyEmoteChange = (day: number, entry: WeeklyEmoteEntry | null) => {
    setWeeklyEmotes((prev) => {
      const next = { ...prev };
      if (entry) next[String(day)] = entry;
      else delete next[String(day)];
      return next;
    });
  };


  const [schedules, setSchedules] = useState<LikaSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    events: LikaSchedule[];
  } | null>(null);

  // Fetch range helper
  const fetchRange = useMemo(() => {
    const fmt = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstGridDay = new Date(year, month, 1);
      firstGridDay.setDate(1 - firstGridDay.getDay());

      const lastGridDay = new Date(year, month + 1, 0);
      lastGridDay.setDate(lastGridDay.getDate() + (6 - lastGridDay.getDay()));

      return { from: fmt(firstGridDay), to: fmt(lastGridDay) };
    } else {
      const startOfWeek = new Date(currentDate);
      const dayIndex = currentDate.getDay();
      const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
      startOfWeek.setDate(currentDate.getDate() + diffToMonday);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return { from: fmt(startOfWeek), to: fmt(endOfWeek) };
    }
  }, [currentDate, viewMode]);

  // Load schedules
  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiGetLikaCalendar(fetchRange.from, fetchRange.to);
        if (active) {
          setSchedules(data);
        }
      } catch (err) {
        console.error('Failed to load Lika schedules:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 5 * 60 * 1000);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(intervalId);
    };
  }, [fetchRange]);

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, LikaSchedule[]> = {};
    schedules.forEach((event) => {
      const dStr = event.date;
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(event);
    });
    return map;
  }, [schedules]);

  // Month Grid calculations (dynamically determine 5 or 6 weeks)
  const gridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOfGrid = new Date(firstDay);
    startOfGrid.setDate(1 - firstDay.getDay());

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const day35 = new Date(startOfGrid);
    day35.setDate(day35.getDate() + 34);

    const totalDays = day35 >= lastDayOfMonth ? 35 : 42;

    const days: Date[] = [];
    const temp = new Date(startOfGrid);
    for (let i = 0; i < totalDays; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // Week Grid calculations (Monday-first)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayIndex = currentDate.getDay();
    const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex;
    startOfWeek.setDate(currentDate.getDate() + diffToMonday);

    const days: Date[] = [];
    const temp = new Date(startOfWeek);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // Navigate actions
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 5, 26));
  };

  return (
    <div
      className="lika-page relative flex h-screen w-full flex-col items-center overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgVia}, ${theme.bgTo})`,
        fontFamily: activeFont.family,
        paddingLeft: 'clamp(16px, 4vw, 96px)',
        paddingRight: 'clamp(16px, 4vw, 96px)',
        paddingTop: 'clamp(12px, 1.6vh, 24px)',
        paddingBottom: 'clamp(14px, 2vh, 28px)',
      }}
    >
      {/* Cute fonts & helpers — 페이지 전체에 Gaegu 적용 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Caveat:wght@400;700&family=Dongle:wght@400;700&family=Gaegu:wght@400;700&family=Gamja+Flower&family=Hi+Melody&family=Jua&family=Nanum+Pen+Script&family=Poor+Story&family=Single+Day&family=Sunflower:wght@500;700&display=swap');
        .lika-page, .lika-page button, .lika-page h1, .lika-page h2, .lika-page h3, .lika-page span, .lika-page p, .lika-page a {
          font-family: ${activeFont.family};
        }
        .lika-sticker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          padding: 0;
          color: #ff6aa8;
          font-family: 'Bagel Fat One', 'Jua', sans-serif;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0;
          text-shadow: 0 2px 0 #fff, 0 4px 12px rgba(255, 105, 180, 0.26);
          filter: drop-shadow(0 3px 5px rgba(255, 105, 180, 0.18));
          white-space: nowrap;
        }
        .lika-week-emote {
          width: clamp(3rem, ${3.2 * stickerScale}rem + 1.6vw, ${5.8 * stickerScale}rem);
          height: clamp(3rem, ${3.2 * stickerScale}rem + 1.6vw, ${5.8 * stickerScale}rem);
          object-fit: contain;
          filter: drop-shadow(0 7px 12px rgba(255, 105, 180, 0.18));
        }
        .cloud-badge { border-radius: 20px 10px 20px 10px; }
        .pink-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .pink-scrollbar::-webkit-scrollbar-track { background: #fff5f7; border-radius: 10px; }
        .pink-scrollbar::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 10px; }
        @keyframes postit-wobble {
          0%, 100% { transform: var(--pi-rot); }
          50% { transform: var(--pi-rot) translateY(-2px); }
        }
        .postit-cell { animation: postit-wobble 4s ease-in-out infinite; }
        .postit-cell:hover { transform: var(--pi-rot) scale(1.04) !important; z-index: 10; }
      `}</style>

      {/* Header banner */}
      <div className="relative z-10 mb-2 flex flex-col items-center text-center">
        <div
          className="flex items-center gap-2 rounded-full border-2 bg-white/70 px-5 py-2 backdrop-blur-sm"
          style={{ borderColor: theme.border, boxShadow: `0 10px 30px ${theme.shadow}` }}
        >
          {showLikaBadge && (
            <span className="h-8 w-8 overflow-hidden rounded-full border-2 bg-white" style={{ borderColor: theme.border }}>
              <img src="/img/lika_page.png" alt="" className="h-full w-full object-cover" />
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: theme.accent }}>
            리카 캘린더
          </h1>
          <span className="ml-1 hidden text-xs font-bold uppercase tracking-widest sm:inline" style={{ color: theme.border }}>
            Lika Calendar
          </span>
        </div>
      </div>

      {/* Main calendar — 풀뷰포트 (카드 래퍼 제거, 폭 100%) */}
      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col gap-3">
        {/* Navigation & controls */}
        <div className="flex shrink-0 flex-col items-center justify-between gap-2 sm:flex-row">
          <button
            onClick={handleToday}
            aria-label="오늘로 이동"
            className="flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-sm font-bold shadow-sm transition-all active:scale-95"
            style={{ color: theme.accent, backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <Calendar className="h-4 w-4" />
            오늘
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="이전"
              className="rounded-full border p-2 transition-all hover:scale-105 active:scale-90"
              style={{ color: theme.accent, borderColor: theme.border }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[120px] text-center text-xl font-bold tracking-tight md:text-2xl" style={{ color: theme.accent }}>
              {viewMode === 'month'
                ? `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}`
                : (() => {
                    const s = weekDays[0], e = weekDays[6];
                    return `${s.getMonth() + 1}/${s.getDate()} ~ ${e.getMonth() + 1}/${e.getDate()}`;
                  })()}
            </span>
            <button
              onClick={handleNext}
              aria-label="다음"
              className="rounded-full border p-2 transition-all hover:scale-105 active:scale-90"
              style={{ color: theme.accent, borderColor: theme.border }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div
            className="flex items-center gap-2 rounded-2xl border p-1 shadow-inner"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            {(['month', 'week'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                aria-pressed={viewMode === m}
                className="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
                style={
                  viewMode === m
                    ? { backgroundColor: theme.accent, color: '#fff' }
                    : { color: theme.accent }
                }
              >
                {m === 'month' ? '월간' : '주간'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {isLoading && schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-sm font-bold" style={{ color: theme.accent }}>
            <span className="mb-2 animate-bounce">Loading</span>
            일정을 불러오는 중입니다...
          </div>
        ) : (
          <div className="flex min-h-0 w-full flex-1 flex-col">
            {viewMode === 'month' ? (
              // ─── MONTHLY VIEW (풀뷰포트: 그리드가 가용 높이 채움) ───
              <LikaMonthView
                gridDays={gridDays}
                eventsByDate={eventsByDate}
                currentDate={currentDate}
                calendarStyle={calendarStyle}
                monthTheme={monthTheme}
                densityConfig={densityConfig}
                density={density}
                shape={shape}
                showEventTime={showEventTime}
                monthEventFontSize={monthEventFontSize}
                onOverflowClick={(dateStr, events) =>
                  setSelectedDayEvents({ dateStr, events })
                }
              />
            ) : (
              // ─── WEEKLY VIEW — 한 화면 꽉 채움 ───
              <LikaWeekView
                weekDays={weekDays}
                eventsByDate={eventsByDate}
                theme={theme}
                weekTheme={weekTheme}
                radius={radius}
                weekCardWidth={weekCardWidth}
                showLikaBadge={showLikaBadge}
                showWeeklyEmotes={showWeeklyEmotes}
                weeklyEmotes={weeklyEmotes}
                showEventTime={showEventTime}
                weekEventFontSize={weekEventFontSize}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit bar (fixed) */}
      <LikaEditBar
        theme={theme}
        monthThemeKey={monthThemeKey}
        weekThemeKey={weekThemeKey}
        onMonthThemeChange={setMonthThemeKey}
        onWeekThemeChange={setWeekThemeKey}
        fontKey={fontKey}
        onFontChange={setFontKey}
        density={density}
        onDensityChange={setDensity}
        shape={shape}
        onShapeChange={setShape}
        textScale={textScale}
        onTextScaleChange={setTextScale}
        stickerScale={stickerScale}
        onStickerScaleChange={setStickerScale}
        showWeeklyEmotes={showWeeklyEmotes}
        onShowWeeklyEmotesChange={setShowWeeklyEmotes}
        weeklyEmotes={weeklyEmotes}
        onWeeklyEmoteChange={handleWeeklyEmoteChange}
        showLikaBadge={showLikaBadge}
        onShowLikaBadgeChange={setShowLikaBadge}
        showEventTime={showEventTime}
        onShowEventTimeChange={setShowEventTime}
        weekCardWidth={weekCardWidth}
        onWeekCardWidthChange={setWeekCardWidth}
        calendarStyle={calendarStyle}
        onCalendarStyleChange={setCalendarStyle}
      />

      {/* Overflow day modal */}
      {selectedDayEvents && (
        <LikaDayModal
          selectedDayEvents={selectedDayEvents}
          theme={theme}
          onClose={() => setSelectedDayEvents(null)}
        />
      )}
    </div>
  );
}
