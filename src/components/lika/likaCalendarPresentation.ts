// ──────────────────────────────────────────────────────────────────────────
// Lika Calendar 표현 로직 (화면과 분리된 순수 함수 모듈)
//
// OOP 4대 특징의 TS 관용구 실현:
// - 추상화: ColorTheme / EventTheme interface가 "테마·이벤트 type → 표시 메타"의
//           계약을 공개. 소비자(컴포넌트)는 색/스티커 산출 방식을 모르고 계약에만 의존.
// - 캡슐화: 해시·스티커 풀·테마 맵·분기 로직을 이 모듈 안에 가두고 순수 함수만 export.
// - 다형성: COLOR_THEMES / EVENT_THEMES 디스패치 테이블로
//           같은 입력 타입에 테마·일정별 다른 출력.
// - 합성: EventTheme는 type별 base 색을 들고, 캘린더 색조는 ColorTheme와 합성된다.
// ──────────────────────────────────────────────────────────────────────────

// ── 색상 테마 (캡슐화: 캘린더 전체 색을 결정하는 토큰 묶음) ──────────────────

export type ColorThemeKey = 'pink' | 'yellow' | 'mint' | 'lavender' | 'peach' | 'sky';

export interface ColorTheme {
  key: ColorThemeKey;
  label: string;
  /** 루트 배경 그라데이션 */
  bgFrom: string;
  bgVia: string;
  bgTo: string;
  /** 강조색(타이틀/today/주요 버튼) */
  accent: string;
  /** 강조 보조(호버/today 라이트) */
  accentSoft: string;
  /** 카드/셀 테두리 */
  border: string;
  /** 칩/카드 연한 배경 */
  surface: string;
  /** bubbly-shadow 색 (accent rgba) */
  shadow: string;
}

export const COLOR_THEMES: Record<ColorThemeKey, ColorTheme> = {
  pink: {
    key: 'pink',
    label: '핑크',
    bgFrom: '#FFF5F7',
    bgVia: '#FFEBF0',
    bgTo: '#FFD5E2',
    accent: '#FF69B4',
    accentSoft: '#FFE4EC',
    border: '#FFC0CB',
    surface: '#FFF0F5',
    shadow: 'rgba(255, 105, 180, 0.25)',
  },
  yellow: {
    key: 'yellow',
    label: '노랑',
    bgFrom: '#FFFDF2',
    bgVia: '#FFF7D6',
    bgTo: '#FFEFA8',
    accent: '#F5A623',
    accentSoft: '#FFF3CC',
    border: '#FFE08A',
    surface: '#FFFBEB',
    shadow: 'rgba(245, 166, 35, 0.25)',
  },
  mint: {
    key: 'mint',
    label: '민트',
    bgFrom: '#F2FFFB',
    bgVia: '#D9FBEF',
    bgTo: '#B6F0DC',
    accent: '#1FB89A',
    accentSoft: '#D4F6EC',
    border: '#9EE7D2',
    surface: '#EBFBF5',
    shadow: 'rgba(31, 184, 154, 0.25)',
  },
  lavender: {
    key: 'lavender',
    label: '라벤더',
    bgFrom: '#FAF6FF',
    bgVia: '#EEE4FF',
    bgTo: '#DCC9FF',
    accent: '#8A6BE0',
    accentSoft: '#EBE2FF',
    border: '#CDB8F2',
    surface: '#F3EEFF',
    shadow: 'rgba(138, 107, 224, 0.25)',
  },
  peach: {
    key: 'peach',
    label: '복숭아',
    bgFrom: '#FFF8F1',
    bgVia: '#FFE8D6',
    bgTo: '#FFD1C1',
    accent: '#FF7A66',
    accentSoft: '#FFE6DC',
    border: '#FFB7A8',
    surface: '#FFF1EA',
    shadow: 'rgba(255, 122, 102, 0.25)',
  },
  sky: {
    key: 'sky',
    label: '하늘',
    bgFrom: '#F3FBFF',
    bgVia: '#DDF2FF',
    bgTo: '#BFE5FF',
    accent: '#3197D6',
    accentSoft: '#DDF1FF',
    border: '#A9D9F5',
    surface: '#EEF8FF',
    shadow: 'rgba(49, 151, 214, 0.22)',
  },
};

/** 테마 키 → 토큰 묶음. 미정의는 pink 폴백(다형성 디스패치). */
export const getColorTheme = (key: ColorThemeKey): ColorTheme =>
  COLOR_THEMES[key] ?? COLOR_THEMES.pink;

export const COLOR_THEME_LIST: ColorTheme[] = Object.values(COLOR_THEMES);

// ── 이벤트 테마 (type별 base 색) ─────────────────────────────────────────────

export interface EventTheme {
  /** 칩 컨테이너 Tailwind 클래스 (테마 색조와 합성) */
  className: string;
}

export const EVENT_THEMES: Record<string, EventTheme> = {
  방송: {
    className: 'border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100',
  },
  ASMR: {
    className: 'border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100',
  },
  휴방: {
    className: 'border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 cloud-badge',
  },
  합방: {
    className: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100',
  },
  콘텐츠: {
    className: 'border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100',
  },
  대회: {
    className: 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  },
  공지: {
    className: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
  },
  노래: {
    className: 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
  },
  기타: {
    className: 'border-pink-200 bg-pink-50 text-pink-500 hover:bg-pink-50',
  },
};

/** 이벤트 type → 테마. 미정의 type은 '기타'로 폴백(다형성 디스패치). */
export const getEventTheme = (type: string): EventTheme =>
  EVENT_THEMES[type] ?? EVENT_THEMES.기타;

export type LikaFontKey =
  | 'gaegu'
  | 'jua'
  | 'gamja'
  | 'poor'
  | 'dongle'
  | 'nanumPen'
  | 'hiMelody'
  | 'singleDay'
  | 'bagel'
  | 'sunflower';

export interface LikaFontOption {
  key: LikaFontKey;
  label: string;
  family: string;
}

export const LIKA_FONT_OPTIONS: LikaFontOption[] = [
  { key: 'gaegu', label: '개구', family: "'Gaegu', 'Jua', sans-serif" },
  { key: 'jua', label: '주아', family: "'Jua', 'Gaegu', sans-serif" },
  { key: 'gamja', label: '감자꽃', family: "'Gamja Flower', 'Gaegu', sans-serif" },
  { key: 'poor', label: '푸어', family: "'Poor Story', 'Gaegu', sans-serif" },
  { key: 'dongle', label: '동글', family: "'Dongle', 'Gaegu', sans-serif" },
  { key: 'nanumPen', label: '펜글씨', family: "'Nanum Pen Script', 'Gaegu', sans-serif" },
  { key: 'hiMelody', label: '멜로디', family: "'Hi Melody', 'Gaegu', sans-serif" },
  { key: 'singleDay', label: '싱글데이', family: "'Single Day', 'Gaegu', sans-serif" },
  { key: 'bagel', label: '베이글', family: "'Bagel Fat One', 'Jua', sans-serif" },
  { key: 'sunflower', label: '해바라기', family: "'Sunflower', 'Jua', sans-serif" },
];

export const getLikaFont = (key: LikaFontKey): LikaFontOption =>
  LIKA_FONT_OPTIONS.find((font) => font.key === key) ?? LIKA_FONT_OPTIONS[0];

export type LikaDensityKey = 'compact' | 'balanced' | 'full';
export type LikaShapeKey = 'neat' | 'soft' | 'bubble';
export type LikaCalStyleKey = 'standard' | 'hand' | 'postit';
export type WeeklyEmotePos = 'left' | 'right';
export interface WeeklyEmoteEntry { src: string; pos: WeeklyEmotePos; }
export type WeeklyCardSizeKey = 'story' | 'post' | 'wide';

export const DENSITY_LABELS: Record<LikaDensityKey, string> = {
  compact: '촘촘',
  balanced: '기본',
  full: '가득',
};

export const SHAPE_LABELS: Record<LikaShapeKey, string> = {
  neat: '단정',
  soft: '말랑',
  bubble: '버블',
};

export const WEEKLY_SIZE_LABELS: Record<WeeklyCardSizeKey, string> = {
  story: '스토리',
  post: '기본',
  wide: '넓게',
};

/** "20:00" → "오후 8시" / "오후 8시 30분". 빈값·비정상 입력은 안전 폴백. */
export const formatKoreanTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  const ampm = hour >= 12 ? '오후' : '오전';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  const minStr = minute === 0 ? '' : ` ${minute}분`;
  return `${ampm} ${hour}시${minStr}`;
};

/** 일정 없는 날의 안내 문구. 월요일은 정기휴방. */
export const getEmptyDayMessage = (dayOfWeek: number): string =>
  dayOfWeek === 1
    ? '정기휴방(리카 컨디션회복날~)'
    : '휴방(리카 컨디션 회복하는날)';

export const getEmptyDaySticker = (dayOfWeek: number): string =>
  dayOfWeek === 1 ? 'rest' : '☾';

// ──────────────────────────────────────────────────────────────────────────
// 월간 캘린더 셀 표현 (화면과 분리된 순수 상수·함수)
//
// 캡슐화: 밀도/모양/스타일별 수치·색·SVG 생성 분기를 이 모듈에 가둔다.
// 다형성: calendarStyle('standard'|'hand'|'postit')에 따라 셀/칩 스타일을
//         산출하는 분기 함수(getMonthCellStyle 등). 같은 입력 타입, 스타일별 다른 출력.
// ──────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react';
import type { LikaSchedule } from '../../api/client';

export const DENSITY_CONFIG: Record<
  LikaDensityKey,
  { maxVisible: number; cellMinHeight: string; dayGap: string; chipPadding: string; weekDayMinHeight: string }
> = {
  compact: {
    maxVisible: 3,
    cellMinHeight: '0',
    dayGap: '0.25rem',
    chipPadding: '0.22rem 0.35rem',
    weekDayMinHeight: '62px',
  },
  balanced: {
    maxVisible: 4,
    cellMinHeight: '0',
    dayGap: '0.35rem',
    chipPadding: '0.28rem 0.42rem',
    weekDayMinHeight: '72px',
  },
  full: {
    maxVisible: 5,
    cellMinHeight: '0',
    dayGap: '0.45rem',
    chipPadding: '0.32rem 0.45rem',
    weekDayMinHeight: '84px',
  },
};

export const SHAPE_RADIUS: Record<LikaShapeKey, { cell: string; chip: string; panel: string }> = {
  neat: { cell: '14px', chip: '8px', panel: '22px' },
  soft: { cell: '22px', chip: '12px', panel: '36px' },
  bubble: { cell: '30px', chip: '999px', panel: '44px' },
};

// 손그림 모드 — 요일별 점선 테두리 색 (일~토)
export const HAND_DAY_BORDER: readonly string[] = [
  '#E07070', // 일 — 빨강
  '#D4C040', // 월 — 노랑
  '#E070A0', // 화 — 핑크
  '#50B878', // 수 — 초록
  '#E08830', // 목 — 주황
  '#5080D0', // 금 — 파랑
  '#9060CC', // 토 — 보라
];

/** 손그림 스타일 셀 테두리를 SVG background-image로 생성 (크레파스 느낌). */
export const crayonBorderBg = (stroke: string, dashed: boolean, sw = 2) => {
  const s = stroke.startsWith('#') ? '%23' + stroke.slice(1) : stroke;
  const dash = dashed ? `stroke-dasharray='7 4' stroke-linecap='round'` : '';
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
    `<rect x='2' y='2' width='96' height='96' fill='none' stroke='${s}' stroke-width='${sw}' ${dash} rx='3' ry='3'/>` +
    `</svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml,${svg}")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat' as const,
  };
};

// 포스트잇 모드 — 셀 배경색 / 테이프 색 / 기울기 (일~토)
// 일=빨강 / 월=노랑 / 화=핑크 / 수=초록 / 목=주황 / 금=파랑 / 토=보라
export const POSTIT_CELL_COLORS = ['#FFD8D8','#FFFAC8','#FFE0F0','#C8F0D8','#FFE4C0','#C8DCFF','#E8D0FF'];
export const POSTIT_TAPE_COLORS = ['#FF9898','#F0D848','#F090C0','#60C888','#F0A040','#6090E0','#A070D0'];
export const POSTIT_ROTS      = [-1.5, 1.2, -0.8, 1.8, -1.2, 0.8, -1.8, -0.5, 1.5, -1.0, 0.5, -2.0, 1.0];

// 일(SUN)=빨강 / 월(MON)=노랑 / 화(TUE)=핑크 / 수(WED)=초록 / 목(THU)=주황 / 금(FRI)=파랑 / 토(SAT)=보라
export const WEEKDAY_HEADERS = [
  { label: 'SUN', bg: '#FFB8B8', color: '#FFFFFF', handText: '#CC4040', handLine: '#FFB8B8' },
  { label: 'MON', bg: '#FFF5A8', color: '#7A6000', handText: '#C09000', handLine: '#FFF5A8' },
  { label: 'TUE', bg: '#FFD0E8', color: '#9A3060', handText: '#CC4488', handLine: '#FFD0E8' },
  { label: 'WED', bg: '#C0EDD0', color: '#2A7048', handText: '#30A060', handLine: '#C0EDD0' },
  { label: 'THU', bg: '#FFD8A8', color: '#904000', handText: '#D06020', handLine: '#FFD8A8' },
  { label: 'FRI', bg: '#B8D8FF', color: '#1A4898', handText: '#2868CC', handLine: '#B8D8FF' },
  { label: 'SAT', bg: '#DCC0FF', color: '#4A1898', handText: '#7840CC', handLine: '#DCC0FF' },
];

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const getKstDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const MONTH_EVENT_TONES = [
  { bg: '#FFC8D3', border: '#F7B7C3' },
  { bg: '#FFDFAE', border: '#F3C98D' },
  { bg: '#FFF8BD', border: '#F0E99B' },
  { bg: '#CBE8CC', border: '#B8DDBA' },
  { bg: '#B7DCF7', border: '#A5D0EF' },
  { bg: '#DEB6E4', border: '#D2A5DA' },
  { bg: '#B9E7D8', border: '#A4DCCB' },
];

/** 이벤트 색조. 휴방은 회색, 그 외는 (id·type·title) 해시로 톤 디스패치. */
export const getMonthEventTone = (event: LikaSchedule, index: number) => {
  const isRest = event.type.includes('휴방') || event.title.includes('휴방');
  if (isRest) {
    return { bg: '#D9D9D9', border: '#CFCFCF' };
  }

  let hash = index;
  const key = `${event.id}-${event.type}-${event.title}`;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MONTH_EVENT_TONES[Math.abs(hash) % MONTH_EVENT_TONES.length];
};

// ── 월간 셀 스타일 디스패치 (다형성: calendarStyle별 다른 출력) ───────────────

interface MonthCellStyleInput {
  calendarStyle: LikaCalStyleKey;
  dayOfWeek: number;
  isToday: boolean;
  /** monthTheme.accent */
  accent: string;
  /** monthTheme.accentSoft */
  accentSoft: string;
  cellMinHeight: string;
  postitRot: number;
  postitCellColor: string;
}

/** 월간 셀 컨테이너 인라인 style을 calendarStyle별로 산출. */
export const getMonthCellStyle = ({
  calendarStyle,
  dayOfWeek,
  isToday,
  accent,
  accentSoft,
  cellMinHeight,
  postitRot,
  postitCellColor,
}: MonthCellStyleInput): CSSProperties => {
  if (calendarStyle === 'hand') {
    return {
      ...crayonBorderBg(
        isToday ? accent : HAND_DAY_BORDER[dayOfWeek],
        !isToday,
        isToday ? 3 : 2,
      ),
      backgroundColor: isToday ? `${accentSoft}99` : 'transparent',
      borderRadius: 0,
      minHeight: cellMinHeight,
    };
  }
  if (calendarStyle === 'postit') {
    return {
      '--pi-rot': `rotate(${postitRot}deg)`,
      backgroundColor: postitCellColor,
      borderRadius: '4px',
      boxShadow: isToday
        ? `0 4px 16px rgba(255,100,180,0.35), 0 2px 6px rgba(0,0,0,0.12)`
        : '0 3px 10px rgba(0,0,0,0.12)',
      border: isToday ? '2px solid #FF69B4' : '1px solid rgba(255,255,255,0.6)',
      minHeight: cellMinHeight,
      transform: `rotate(${postitRot}deg)`,
    } as CSSProperties;
  }
  return {
    borderColor: '#FFDCE7',
    borderStyle: 'dashed',
    borderRadius: 0,
    minHeight: cellMinHeight,
  };
};

/** 월간 셀 날짜 숫자 span의 인라인 style을 calendarStyle별로 산출. */
export const getMonthDayNumberStyle = (
  calendarStyle: LikaCalStyleKey,
  dayColor: string,
): CSSProperties => {
  if (calendarStyle === 'hand') {
    return { fontFamily: "'Caveat', cursive", color: dayColor };
  }
  if (calendarStyle === 'postit') {
    return { fontFamily: "'Caveat', cursive", fontSize: '0.85rem', color: '#7A5A3A', alignSelf: 'flex-end', lineHeight: 1 };
  }
  return { color: dayColor };
};

interface MonthChipStyleInput {
  calendarStyle: LikaCalStyleKey;
  tone: { bg: string; border: string };
  shape: LikaShapeKey;
  chipPadding: string;
  fontSize: string;
}

/** 월간 이벤트 칩의 인라인 style을 calendarStyle별로 산출. */
export const getMonthChipStyle = ({
  calendarStyle,
  tone,
  shape,
  chipPadding,
  fontSize,
}: MonthChipStyleInput): CSSProperties => {
  if (calendarStyle === 'hand') {
    return {
      backgroundColor: tone.bg + 'CC',
      borderRadius: '2px',
      padding: chipPadding,
      fontSize,
      fontFamily: "'Caveat', cursive",
    };
  }
  if (calendarStyle === 'postit') {
    return {
      backgroundColor: 'rgba(255,255,255,0.75)',
      border: 'none',
      borderRadius: '2px',
      padding: chipPadding,
      fontSize,
      fontFamily: "'Caveat', cursive",
    };
  }
  return {
    backgroundColor: tone.bg,
    borderColor: tone.border,
    border: '1px solid',
    borderRadius: shape === 'neat' ? '18px' : '24px',
    padding: chipPadding,
    fontSize,
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
  };
};
