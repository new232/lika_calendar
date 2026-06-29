import React from 'react';
import { type LikaSchedule } from '../../api/client';
import {
  getKstDateString,
  getMonthEventTone,
  getMonthCellStyle,
  getMonthDayNumberStyle,
  getMonthChipStyle,
  WEEKDAY_HEADERS,
  POSTIT_CELL_COLORS,
  POSTIT_TAPE_COLORS,
  POSTIT_ROTS,
  type ColorTheme,
  type LikaCalStyleKey,
  type LikaDensityKey,
  type LikaShapeKey,
} from './likaCalendarPresentation';

interface LikaMonthViewProps {
  gridDays: Date[];
  eventsByDate: Record<string, LikaSchedule[]>;
  currentDate: Date;
  calendarStyle: LikaCalStyleKey;
  monthTheme: ColorTheme;
  densityConfig: { maxVisible: number; cellMinHeight: string; dayGap: string; chipPadding: string; weekDayMinHeight: string };
  density: LikaDensityKey;
  shape: LikaShapeKey;
  showEventTime: boolean;
  monthEventFontSize: string;
  onOverflowClick: (dateStr: string, events: LikaSchedule[]) => void;
}

/** 월간 뷰 — 요일 헤더 + 셀 그리드. 스타일 분기는 presentation 순수 함수에 위임. */
export default function LikaMonthView({
  gridDays,
  eventsByDate,
  currentDate,
  calendarStyle,
  monthTheme,
  densityConfig,
  density,
  shape,
  showEventTime,
  monthEventFontSize,
  onOverflowClick,
}: LikaMonthViewProps) {
  const isHand = calendarStyle === 'hand';
  const isPostit = calendarStyle === 'postit';

  return (
    <div
      className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden p-3 sm:p-5"
      style={isHand ? {
        background: '#FDFDF0',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #C8CFA4 40px)',
        border: '1.5px solid #C8C8A4',
        borderRadius: '12px',
        maxWidth: '1560px',
        height: 'calc(100vh - 148px)',
        maxHeight: 'calc(100vh - 148px)',
      } : isPostit ? {
        background: '#FDF8F0',
        border: '1.5px solid #E8D8C0',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(180,140,100,0.15)',
        maxWidth: '1560px',
        height: 'calc(100vh - 148px)',
        maxHeight: 'calc(100vh - 148px)',
      } : {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: monthTheme.border,
        border: '1px solid',
        borderRadius: '34px',
        boxShadow: `0 18px 42px ${monthTheme.shadow}`,
        maxWidth: '1560px',
        height: 'calc(100vh - 148px)',
        maxHeight: 'calc(100vh - 148px)',
      }}
    >
      <div className={`grid grid-cols-7 pb-2 text-center ${isPostit ? 'gap-2 sm:gap-2.5 sm:pb-3' : 'gap-1.5 sm:gap-2 sm:pb-3'}`}>
        {WEEKDAY_HEADERS.map((weekday, wi) => (
          <div
            key={weekday.label}
            className={isHand
              ? "flex min-h-10 items-center justify-center px-2 leading-none sm:min-h-[52px]"
              : isPostit
                ? "relative flex min-h-8 items-center justify-center overflow-hidden sm:min-h-[44px]"
                : "flex min-h-10 items-center justify-center rounded-[16px] px-2 text-lg font-black leading-none sm:min-h-[52px] sm:text-2xl"}
            style={isHand ? {
              fontFamily: "'Caveat', cursive",
              fontSize: '1.4rem',
              fontWeight: 700,
              color: weekday.handText,
              borderBottom: `3px solid ${weekday.handLine}`,
              background: 'transparent',
            } : isPostit ? {
              background: POSTIT_TAPE_COLORS[wi],
              opacity: 0.88,
              transform: `rotate(${(wi % 2 === 0 ? -0.7 : 0.7)}deg)`,
              borderRadius: '2px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              fontFamily: "'Caveat', cursive",
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#5A3A1A',
            } : { backgroundColor: weekday.bg, color: weekday.color }}
          >
            {isPostit && (
              <span style={{ position: 'relative', zIndex: 1 }}>{weekday.label}</span>
            )}
            {!isPostit && weekday.label}
          </div>
        ))}
      </div>

      <div
        className={isHand
          ? "grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-1"
          : isPostit
            ? "grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-2"
            : "grid min-h-0 flex-1 auto-rows-fr grid-cols-7 overflow-hidden rounded-[24px] border-l border-t"}
        style={isHand || isPostit ? {} : { borderColor: '#FFDCE7' }}
      >
        {gridDays.map((day, idx) => {
          const kstDate = getKstDateString(day);
          const dayEvents = eventsByDate[kstDate] || [];
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = kstDate === getKstDateString(new Date());
          const dayColor = day.getDay() === 0 ? '#F03A3A' : day.getDay() === 6 ? '#1874D1' : '#5B3B3B';

          const visibleEvents = dayEvents.slice(0, densityConfig.maxVisible);
          const hiddenCount = dayEvents.length - visibleEvents.length;

          const postitRot = isPostit
            ? POSTIT_ROTS[(day.getDate() + day.getMonth() * 3) % POSTIT_ROTS.length]
            : 0;
          const postitCellColor = isPostit
            ? (isToday ? '#FFEEF8' : POSTIT_CELL_COLORS[day.getDay()])
            : '';
          const postitTapeColor = isPostit ? POSTIT_TAPE_COLORS[day.getDay()] : '';

          return (
            <div
              key={idx}
              className={`group relative flex min-h-0 flex-col transition-all ${
                isCurrentMonth ? '' : 'opacity-30'
              } ${isHand ? 'p-1.5 sm:p-2' : isPostit ? 'postit-cell p-1.5 sm:p-2' : 'border-b border-r bg-white hover:bg-pink-50/40 p-1.5 sm:p-2'}`}
              style={getMonthCellStyle({
                calendarStyle,
                dayOfWeek: day.getDay(),
                isToday,
                accent: monthTheme.accent,
                accentSoft: monthTheme.accentSoft,
                cellMinHeight: densityConfig.cellMinHeight,
                postitRot,
                postitCellColor,
              })}
            >
              {/* 포스트잇 테이프 상단 */}
              {isPostit && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-1deg)',
                  width: '36%',
                  height: '12px',
                  background: postitTapeColor,
                  opacity: 0.7,
                  borderRadius: '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  zIndex: 2,
                }} />
              )}
              <span
                className="leading-none text-[1rem] font-black sm:text-[1.3rem]"
                style={getMonthDayNumberStyle(calendarStyle, dayColor)}
              >
                {day.getDate()}
              </span>

              {/* Event chips — 셀을 세로로 꽉 채우게 stack */}
              <div className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden" style={{ gap: '0.35rem' }}>
                {visibleEvents.map((event, eventIndex) => {
                  const tone = getMonthEventTone(event, eventIndex);

                  const ChipElement = (
                    <div
                      className="relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden text-center font-black leading-tight text-[#3E3E3E] transition-transform duration-200 hover:scale-[1.015] active:scale-95"
                      style={getMonthChipStyle({
                        calendarStyle,
                        tone,
                        shape,
                        chipPadding: densityConfig.chipPadding,
                        fontSize: monthEventFontSize,
                      })}
                    >
                      {showEventTime && event.time && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.66em] font-black leading-none text-[#FF7B22] shadow-sm">
                          {event.time}
                        </span>
                      )}
                      <span
                        className="min-w-0 max-w-full overflow-hidden break-keep px-2 text-center"
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: density === 'compact' ? 2 : 3,
                        }}
                      >
                        {event.title}
                      </span>
                    </div>
                  );

                  return event.url ? (
                    <a
                      key={event.id}
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block min-h-0 w-full flex-1"
                      title={`${event.title} (클릭 시 이동)`}
                    >
                      {ChipElement}
                    </a>
                  ) : (
                    <div key={event.id} className="min-h-0 w-full flex-1">
                      {ChipElement}
                    </div>
                  );
                })}

                {hiddenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOverflowClick(kstDate, dayEvents);
                    }}
                    className="mt-auto self-center rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold shadow-sm transition-all hover:brightness-95"
                    style={{ color: monthTheme.accent, backgroundColor: monthTheme.accentSoft, borderColor: monthTheme.border }}
                  >
                    +{hiddenCount}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
