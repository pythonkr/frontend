import { TimetableScheduleSchema } from "@frontend/common/schemas/backendAdminAPI";
import { floorToMinute, toMs, toNaiveISO } from "@frontend/common/utils";

import { Block, ScheduleOp } from "../types";

// ── 자동저장 연산(op) ───────────────────────────────────────────────────────

export const makeTempId = (): string => `temp-${Math.random().toString(36).slice(2)}`;
export const isTempId = (id: string): boolean => id.startsWith("temp-");

// op 목록을 현재 스케줄 배열에 적용해 optimistic 결과를 만든다.
export const applyOps = (schedules: TimetableScheduleSchema[], ops: ScheduleOp[]): TimetableScheduleSchema[] => {
  let next = schedules;
  for (const op of ops) {
    if (op.kind === "create") next = [...next, op.temp];
    else if (op.kind === "update") next = next.map((s) => (s.id === op.row.id ? op.row : s));
    else next = next.filter((s) => s.id !== op.id);
  }
  return next;
};

// ── 블록(같은 발표·시간의 연속된 방 묶음) ────────────────────────────────────

const groupKey = (presentation: string, startMs: number, endMs: number): string => `${presentation}__${startMs}__${endMs}`;

/**
 * 하루치 스케줄을 블록으로 그룹핑한다.
 * 같은 발표·시작·종료를 공유하고 방 열이 연속인 스케줄을 하나의 블록으로 묶는다.
 * (연속되지 않은 경우 각 연속 구간을 별도 블록으로 나눈다.)
 */
export const groupSchedulesToBlocks = (schedules: TimetableScheduleSchema[], colIndexByRoom: Map<string, number>): Block[] => {
  type Cell = { col: number; roomId: string; scheduleId: string };
  const groups = new Map<string, { presentation: string; startMs: number; endMs: number; cells: Cell[] }>();

  for (const s of schedules) {
    const col = colIndexByRoom.get(s.room_id);
    if (col === undefined) continue; // 다른 이벤트/삭제된 방
    const startMs = floorToMinute(toMs(s.start_at));
    const endMs = floorToMinute(toMs(s.end_at));
    const key = groupKey(s.presentation, startMs, endMs);
    const group = groups.get(key) ?? { presentation: s.presentation, startMs, endMs, cells: [] };
    group.cells.push({ col, roomId: s.room_id, scheduleId: s.id });
    groups.set(key, group);
  }

  const blocks: Block[] = [];
  for (const group of groups.values()) {
    const cells = group.cells.sort((a, b) => a.col - b.col);
    let run: Cell[] = [];
    const flush = () => {
      if (run.length === 0) return;
      const scheduleByRoom = new Map(run.map((c) => [c.roomId, c.scheduleId]));
      blocks.push({
        key: groupKey(group.presentation, group.startMs, group.endMs) + `__${run[0].col}`,
        presentation: group.presentation,
        startMs: group.startMs,
        endMs: group.endMs,
        startCol: run[0].col,
        colSpan: run.length,
        scheduleByRoom,
      });
      run = [];
    };
    for (const cell of cells) {
      if (run.length > 0 && cell.col !== run[run.length - 1].col + 1) flush();
      run.push(cell);
    }
    flush();
  }
  return blocks;
};

/**
 * 블록을 새 방 집합·시간으로 변형할 때 필요한 op 목록을 계산한다.
 * 유지되는 방의 스케줄은 그대로 두고(시간만 갱신), 비게 된 행은 새 방으로 재활용하거나 삭제해 같은 방 시간겹침(자기 충돌)을 피한다.
 */
export const opsForBlockTransform = (block: Block, targetRoomIds: string[], startMs: number, endMs: number): ScheduleOp[] => {
  const start_at = toNaiveISO(startMs);
  const end_at = toNaiveISO(endMs);
  const mkRow = (id: string, roomId: string): TimetableScheduleSchema => ({
    id,
    room_id: roomId,
    presentation: block.presentation,
    start_at,
    end_at,
  });

  const targetSet = new Set(targetRoomIds);
  const ops: ScheduleOp[] = [];
  const used = new Set<string>();
  const leftover: string[] = [];

  // 1) 유지되는 방: 시간만 갱신
  for (const [roomId, scheduleId] of block.scheduleByRoom) {
    if (targetSet.has(roomId)) {
      ops.push({ kind: "update", row: mkRow(scheduleId, roomId) });
      used.add(roomId);
    } else {
      leftover.push(scheduleId);
    }
  }
  // 2) 비어 있는 목표 방: 남은 행 재활용 → 없으면 새로 생성
  let li = 0;
  for (const roomId of targetRoomIds) {
    if (used.has(roomId)) continue;
    if (li < leftover.length) ops.push({ kind: "update", row: mkRow(leftover[li++], roomId) });
    else ops.push({ kind: "create", temp: mkRow(makeTempId(), roomId) });
  }
  // 3) 남는 행 삭제
  for (; li < leftover.length; li++) ops.push({ kind: "delete", id: leftover[li] });

  return ops;
};

export const opsForBlockDelete = (block: Block): ScheduleOp[] => Array.from(block.scheduleByRoom.values()).map((id) => ({ kind: "delete", id }));

export const opsForCreate = (presentation: string, roomId: string, startMs: number, endMs: number): ScheduleOp[] => [
  { kind: "create", temp: { id: makeTempId(), room_id: roomId, presentation, start_at: toNaiveISO(startMs), end_at: toNaiveISO(endMs) } },
];

// 같은 방에서 [startMs, endMs) 와 시간이 겹치는 스케줄이 있는지 (백엔드 filter_conflict 와 동일 규칙, 자기 자신 제외).
export const overlaps = (
  schedules: TimetableScheduleSchema[],
  roomId: string,
  startMs: number,
  endMs: number,
  excludeIds: ReadonlySet<string>
): boolean => schedules.some((s) => s.room_id === roomId && !excludeIds.has(s.id) && toMs(s.start_at) < endMs && toMs(s.end_at) > startMs);
