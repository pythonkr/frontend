import { DateTime } from "luxon";

/**
 * ISO 시각 문자열을 자정 기준 분(minute)으로 변환합니다.
 * 유효하지 않은 입력이면 NaN을 반환합니다.
 */
export const toMinutesOfDay = (value: string): number => {
  const dt = DateTime.fromISO(value);
  return dt.isValid ? dt.hour * 60 + dt.minute : Number.NaN;
};

/** dt를 같은 날의 granularityMin 경계로 내림한 DateTime을 반환합니다. */
export const floorToGranularity = (dt: DateTime, granularityMin: number): DateTime => {
  const base = dt.startOf("day");
  const minutes = dt.diff(base, "minutes").minutes;
  return base.plus({ minutes: Math.floor(minutes / granularityMin) * granularityMin });
};

/** dt를 같은 날의 granularityMin 경계로 올림한 DateTime을 반환합니다. */
export const ceilToGranularity = (dt: DateTime, granularityMin: number): DateTime => {
  const base = dt.startOf("day");
  const minutes = dt.diff(base, "minutes").minutes;
  return base.plus({ minutes: Math.ceil(minutes / granularityMin) * granularityMin });
};

/**
 * dayStart를 1번 라인으로 두고, dt가 위치할 1-based CSS grid line 번호를 반환합니다.
 * (예: granularityMin=5 이면 dayStart 기준 5분마다 라인이 1씩 증가)
 */
export const minutesToGridLine = (dt: DateTime, dayStart: DateTime, granularityMin: number): number => {
  return Math.round(dt.diff(dayStart, "minutes").minutes / granularityMin) + 1;
};

export const toMs = (iso: string): number => DateTime.fromISO(iso).toMillis();
export const toNaiveISO = (ms: number): string => DateTime.fromMillis(ms).toISO({ includeOffset: false })!;
export const isoDateOf = (iso: string): string => DateTime.fromISO(iso).toISODate()!;
export const formatMs = (ms: number, format: string): string => DateTime.fromMillis(ms).toFormat(format);
export const floorToMinute = (ms: number): number => Math.floor(ms / 60_000) * 60_000;

const ceilToHour = (dt: DateTime): DateTime =>
  dt.minute > 0 || dt.second > 0 || dt.millisecond > 0 ? dt.startOf("hour").plus({ hours: 1 }) : dt.startOf("hour");

// [startISO, endISO] 를 하루 간격 ISO date 목록으로 나열.
export const eachDayISO = (startISO: string, endISO: string): string[] => {
  const days: string[] = [];
  let cursor = DateTime.fromISO(startISO).startOf("day");
  const end = DateTime.fromISO(endISO).startOf("day");
  while (cursor <= end) {
    days.push(cursor.toISODate()!);
    cursor = cursor.plus({ days: 1 });
  }
  return days;
};

// 하루 표시 시간 범위(ms). 기본 [startHour, endHour] 를 spans 를 덮도록 정시 단위로 확장.
export const dayBoundsMs = (
  isoDate: string,
  startHour: number,
  endHour: number,
  spans: readonly { start_at: string; end_at: string }[]
): { dayStartMs: number; dayEndMs: number } => {
  const base = DateTime.fromISO(isoDate);
  let start = base.set({ hour: startHour, minute: 0, second: 0, millisecond: 0 });
  let end = base.set({ hour: endHour, minute: 0, second: 0, millisecond: 0 });
  for (const s of spans) {
    const spanStart = DateTime.fromISO(s.start_at).startOf("hour");
    const spanEnd = ceilToHour(DateTime.fromISO(s.end_at));
    if (spanStart < start) start = spanStart;
    if (spanEnd > end) end = spanEnd;
  }
  return { dayStartMs: start.toMillis(), dayEndMs: end.toMillis() };
};

export const dayTabLabel = (isoDate: string, index: number): string =>
  `Day ${index + 1} · ${DateTime.fromISO(isoDate).setLocale("ko").toFormat("M월 d일 (EEE)")}`;
