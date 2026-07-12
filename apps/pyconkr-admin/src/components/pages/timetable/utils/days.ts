import { EventSchema, TimetableScheduleSchema } from "@frontend/common/schemas/backendAdminAPI";
import { eachDayISO, isoDateOf } from "@frontend/common/utils";
import { DateTime } from "luxon";

// 이벤트 기간 + 스케줄에 등장하는 날짜를 합쳐 Day 탭 목록(ISO date)을 만든다.
export const computeDays = (event: EventSchema | null, schedules: TimetableScheduleSchema[]): string[] => {
  const days = new Set<string>();
  if (event?.event_start_at && event?.event_end_at) eachDayISO(event.event_start_at, event.event_end_at).forEach((d) => days.add(d));
  for (const s of schedules) days.add(isoDateOf(s.start_at));
  const sorted = [...days].sort();
  return sorted.length > 0 ? sorted : [DateTime.now().toISODate()!];
};
