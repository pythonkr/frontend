import {
  TimetableRoomOp,
  TimetableRoomSchema,
  TimetableSavePayload,
  TimetableScheduleOp,
  TimetableScheduleSchema,
} from "@frontend/common/schemas/backendAdminAPI";
import { toMs } from "@frontend/common/utils";

import { isTempId } from "./schedule";

type TimetableState = { rooms: TimetableRoomSchema[]; schedules: TimetableScheduleSchema[] };

const roomChanged = (a: TimetableRoomSchema, b: TimetableRoomSchema): boolean =>
  a.name_ko !== b.name_ko || a.name_en !== b.name_en || a.order !== b.order;

// 시간은 offset 유무가 달라도 epoch 로 비교.
const scheduleChanged = (a: TimetableScheduleSchema, b: TimetableScheduleSchema): boolean =>
  a.room_id !== b.room_id || a.presentation !== b.presentation || toMs(a.start_at) !== toMs(b.start_at) || toMs(a.end_at) !== toMs(b.end_at);

// 신규(temp id)=create(방은 ref 로 신규 스케줄과 연결), baseline 에서 사라진 항목=delete, 그 외 변경=update.
export const computeTimetableOps = (baseline: TimetableState, working: TimetableState): TimetableSavePayload => {
  const baseRoom = new Map(baseline.rooms.map((r) => [r.id, r]));
  const workRoomIds = new Set(working.rooms.map((r) => r.id));
  const rooms: TimetableRoomOp[] = [];
  for (const r of working.rooms) {
    if (isTempId(r.id)) rooms.push({ op: "create", ref: r.id, name_ko: r.name_ko, name_en: r.name_en, order: r.order });
    else {
      const base = baseRoom.get(r.id);
      if (base && roomChanged(base, r)) rooms.push({ op: "update", id: r.id, name_ko: r.name_ko, name_en: r.name_en, order: r.order });
    }
  }
  for (const r of baseline.rooms) if (!workRoomIds.has(r.id)) rooms.push({ op: "delete", id: r.id });

  const baseSched = new Map(baseline.schedules.map((s) => [s.id, s]));
  const workSchedIds = new Set(working.schedules.map((s) => s.id));
  const schedules: TimetableScheduleOp[] = [];
  for (const s of working.schedules) {
    if (isTempId(s.id)) schedules.push({ op: "create", room_id: s.room_id, presentation: s.presentation, start_at: s.start_at, end_at: s.end_at });
    else {
      const base = baseSched.get(s.id);
      if (base && scheduleChanged(base, s))
        schedules.push({ op: "update", id: s.id, room_id: s.room_id, presentation: s.presentation, start_at: s.start_at, end_at: s.end_at });
    }
  }
  for (const s of baseline.schedules) if (!workSchedIds.has(s.id)) schedules.push({ op: "delete", id: s.id });

  return { rooms, schedules };
};
