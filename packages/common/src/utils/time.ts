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
