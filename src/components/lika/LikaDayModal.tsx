import { X, ExternalLink } from 'lucide-react';
import { type LikaSchedule } from '../../api/client';
import { getEventTheme, type ColorTheme } from './likaCalendarPresentation';

interface LikaDayModalProps {
  selectedDayEvents: { dateStr: string; events: LikaSchedule[] };
  theme: ColorTheme;
  onClose: () => void;
}

/** overflow(+N) day 모달 — 해당 날짜 전체 일정 목록. 표현만 담당. */
export default function LikaDayModal({ selectedDayEvents, theme, onClose }: LikaDayModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="animate-scale-up w-full max-w-sm rounded-3xl border bg-white p-5 shadow-2xl" style={{ borderColor: theme.border }}>
        <div className="mb-4 flex items-center justify-between border-b border-pink-50 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase tracking-tight">memo</span>
            <h3 className="font-bold" style={{ color: theme.accent }}>
              {selectedDayEvents.dateStr.split('-')[1]}월 {selectedDayEvents.dateStr.split('-')[2]}일 일정
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-1 text-gray-400 transition-all hover:bg-pink-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="pink-scrollbar flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1">
          {selectedDayEvents.events.map((event) => {
            const eventTheme = getEventTheme(event.type);

            return (
              <div
                key={event.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 shadow-sm ${eventTheme.className}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="break-all text-xs font-bold tracking-tight text-gray-800">
                      {event.title}
                    </span>
                    <span className="mt-0.5 text-[10px] font-bold text-gray-400">
                      {event.time || '하루 일정'}
                    </span>
                  </div>
                </div>

                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-extrabold text-white shadow-sm transition-all"
                    style={{ backgroundColor: theme.accent }}
                  >
                    이동
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
