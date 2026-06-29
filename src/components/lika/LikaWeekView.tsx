import { ExternalLink } from 'lucide-react';
import { type LikaSchedule } from '../../api/client';
import {
  getKstDateString,
  getEmptyDayMessage,
  formatKoreanTime,
  DAY_LABELS,
  type ColorTheme,
  type WeeklyEmoteEntry,
} from './likaCalendarPresentation';

interface LikaWeekViewProps {
  weekDays: Date[];
  eventsByDate: Record<string, LikaSchedule[]>;
  theme: ColorTheme;
  weekTheme: ColorTheme;
  radius: { cell: string; chip: string; panel: string };
  weekCardWidth: number;
  showLikaBadge: boolean;
  showWeeklyEmotes: boolean;
  weeklyEmotes: Record<string, WeeklyEmoteEntry>;
  showEventTime: boolean;
  weekEventFontSize: string;
}

/** 주간 뷰 — 7일 행. 데이터 가공은 presentation 함수에 위임, 표현만 담당. */
export default function LikaWeekView({
  weekDays,
  eventsByDate,
  theme,
  weekTheme,
  radius,
  weekCardWidth,
  showLikaBadge,
  showWeeklyEmotes,
  weeklyEmotes,
  showEventTime,
  weekEventFontSize,
}: LikaWeekViewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden border-2 shadow-sm"
        style={{
          background: `linear-gradient(to bottom, ${weekTheme.bgFrom}, ${weekTheme.bgVia})`,
          borderColor: weekTheme.border,
          borderRadius: radius.panel,
          maxWidth: `min(calc(${weekCardWidth}vw - 32px), 1600px)`,
        }}
      >
        {/* 헤더 — 아바타 + 타이틀 (compact) */}
        <div className="flex shrink-0 items-center justify-center gap-3 px-4 py-2 select-none">
          {showLikaBadge && (
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 shadow-sm" style={{ borderColor: weekTheme.border }}>
              <img src="/img/lika_page.png" alt="Lika" className="h-full w-full object-cover" />
            </div>
          )}
          <h2 className="shrink-0 whitespace-nowrap text-[clamp(1.5rem,2vw,2rem)] font-bold tracking-tight" style={{ color: theme.accent }}>
            리카 주간 일정표
          </h2>
        </div>

        {/* 7일 행 — flex-1로 균등 분배 */}
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 gap-1.5">
          {weekDays.map((day, idx) => {
            const kstDate = getKstDateString(day);
            const dayEvents = eventsByDate[kstDate] || [];
            const dayOfWeek = day.getDay();
            const isToday = kstDate === getKstDateString(new Date());

            const weeklyEmote = weeklyEmotes[String(dayOfWeek)];

            return (
              <div
                key={idx}
                className="relative flex min-h-0 flex-1 overflow-hidden border-2 bg-white/95 shadow-sm transition-all hover:shadow-md"
                style={{
                  borderColor: isToday ? weekTheme.accent : weekTheme.border,
                  borderRadius: radius.chip === '999px' ? '20px' : radius.chip,
                }}
              >
                {/* 요일 헤더 */}
                <div
                  className="relative z-10 flex w-20 shrink-0 select-none items-center justify-center border-r md:w-28"
                  style={{
                    backgroundColor: isToday ? weekTheme.accent : weekTheme.border,
                    color: isToday ? '#fff' : '#374151',
                    borderColor: isToday ? weekTheme.accent : weekTheme.border,
                  }}
                >
                  <span className="text-sm font-bold tracking-tight md:text-base">
                    {DAY_LABELS[dayOfWeek]} ({day.getDate()})
                  </span>
                </div>

                {showWeeklyEmotes && weeklyEmote?.pos === 'left' && (
                  <div className="relative z-10 flex shrink-0 items-center justify-center px-2">
                    <img
                      src={weeklyEmote.src}
                      alt=""
                      className="lika-week-emote shrink-0 select-none"
                    />
                  </div>
                )}

                {/* 이벤트 내용 */}
                <div className="relative z-10 flex min-h-0 flex-1 items-center justify-between gap-3 px-3 py-1">
                  <div className="flex min-h-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden">
                    {dayEvents.length === 0 ? (
                      <span
                        className="select-text truncate text-center font-bold italic text-gray-400"
                        style={{ fontSize: weekEventFontSize }}
                      >
                        {getEmptyDayMessage(dayOfWeek)}
                      </span>
                    ) : (
                      dayEvents.map((event) => (
                        <div key={event.id} className="flex flex-wrap items-center justify-center gap-1 text-center">
                          <span
                            className="select-text font-bold text-gray-800 leading-snug"
                            style={{ fontSize: weekEventFontSize }}
                          >
                            {showEventTime && event.time ? `${formatKoreanTime(event.time)} ` : ''}
                            {event.title}
                          </span>
                          {event.url && (
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold"
                              style={{ color: weekTheme.accent }}
                            >
                              이동
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {showWeeklyEmotes && weeklyEmote?.pos === 'right' ? (
                    <img
                      src={weeklyEmote.src}
                      alt=""
                      className="lika-week-emote shrink-0 select-none"
                    />
                  ) : (
                    <span className="w-0 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
