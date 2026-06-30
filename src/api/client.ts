export interface LikaSchedule {
  id: string;
  title: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  members: string[];
  tags: string[];
  type: string;
  url?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate: string;
  tags: string[];
  members: string[];
  platform: string;
  url: string;
  memo: string;
}

const USE_MOCK = import.meta.env.VITE_MOCK === 'true';
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const NOTION_MEMBER_KEY = '리카';

function resolveType(title: string, tags: string[]): string {
  const tagType = tags
    .map((tag) => {
      if (tag.includes('휴방')) return '휴방';
      if (tag.includes('ASMR')) return 'ASMR';
      if (tag.includes('합방') || tag.includes('콜라보')) return '합방';
      if (tag.includes('콘텐츠') || tag.includes('컨텐츠')) return '콘텐츠';
      if (tag.includes('대회')) return '대회';
      if (tag.includes('방송')) return '방송';
      if (tag.includes('공지')) return '공지';
      if (tag.includes('노래')) return '노래';
      return null;
    })
    .find(Boolean);
  if (tagType) return tagType;

  const src = `${title} ${tags.join(' ')}`;
  if (src.includes('휴방')) return '휴방';
  if (src.includes('ASMR')) return 'ASMR';
  if (src.includes('합방') || src.includes('콜라보')) return '합방';
  if (src.includes('콘텐츠') || src.includes('컨텐츠')) return '콘텐츠';
  if (src.includes('대회')) return '대회';
  if (src.includes('방송')) return '방송';
  if (src.includes('공지')) return '공지';
  if (src.includes('노래')) return '노래';
  return '기타';
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function toTimeLabel(iso: string): string | undefined {
  if (!iso.includes('T')) return undefined;
  if (iso.endsWith('T00:00:00.000Z')) return undefined;
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Seoul',
  }).format(new Date(iso));
}

function mapToLikaSchedule(event: CalendarEvent): LikaSchedule {
  return {
    id: event.id,
    title: event.title,
    date: toDateKey(event.date),
    time: toTimeLabel(event.date),
    endDate: event.endDate ? toDateKey(event.endDate) : undefined,
    endTime: event.endDate ? toTimeLabel(event.endDate) : undefined,
    members: event.members,
    tags: event.tags,
    type: resolveType(event.title, event.tags),
    url: event.url || undefined,
  };
}

function createMockLikaCalendar(from: string): LikaSchedule[] {
  const base = new Date(from);
  const types = ['방송', 'ASMR', '휴방', '합방', '콘텐츠', '노래'];
  const titles: Record<string, string> = {
    방송: '리카 저녁 방송', ASMR: '리카 ASMR 방송', 휴방: '리카 휴방',
    합방: '리카 합방', 콘텐츠: '리카 콘텐츠', 노래: '리카 노래 방송',
  };
  const results: LikaSchedule[] = [];
  for (let i = 0; i < 28; i++) {
    if (Math.random() > 0.45) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const type = types[Math.floor(Math.random() * types.length)];
      results.push({
        id: `mock-${i}`,
        title: titles[type],
        date: d.toISOString().slice(0, 10),
        time: type === '휴방' ? undefined : `${18 + Math.floor(Math.random() * 4)}:00`,
        members: ['리카'],
        tags: [],
        type,
      });
    }
  }
  return results;
}

export const apiGetLikaCalendar = async (from: string, to: string): Promise<LikaSchedule[]> => {
  if (USE_MOCK) return createMockLikaCalendar(from);

  const res = await fetch(`${BASE}/lika-calendar`);
  if (!res.ok) throw new Error(`Calendar API failed: ${res.status}`);

  const all: CalendarEvent[] = await res.json();

  return all
    .filter((e) => e.date >= from && e.date <= to + 'T99')
    .map(mapToLikaSchedule);
};
