import { clamp, snapToStep } from "@frontend/common/utils";

import { TIMETABLE_PALETTE_DROP_ATTR, TIMETABLE_ROW_H, TIMETABLE_SLOT_MS } from "../const";
import { Block, DragState, Geometry, GridBounds } from "../types";

// 포인터 좌표가 팔레트 위인지 (블록을 팔레트로 끌어 미배치 처리하기 위한 hit-test).
export const isOverPalette = (x: number, y: number): boolean => !!document.elementFromPoint(x, y)?.closest(`[${TIMETABLE_PALETTE_DROP_ATTR}]`);

export const geomOf = (b: Block): Geometry => ({ startCol: b.startCol, colSpan: b.colSpan, startMs: b.startMs, endMs: b.endMs });
export const geomChanged = (a: Geometry, b: Geometry): boolean =>
  a.startCol !== b.startCol || a.colSpan !== b.colSpan || a.startMs !== b.startMs || a.endMs !== b.endMs;

export const moveItem = <T>(arr: T[], from: number, to: number): T[] => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// 포인터 이동/리사이즈 중 미리보기 geometry 를 계산한다 (10분·열 스냅 + 그리드 경계 clamp).
export const computeDragPreview = (drag: DragState, clientX: number, clientY: number, bounds: GridBounds): Geometry => {
  const { columnCount, dayStartMs, dayEndMs } = bounds;
  const dCols = Math.round((clientX - drag.originX) / drag.colW);
  const dRows = Math.round((clientY - drag.originY) / TIMETABLE_ROW_H);
  const b = drag.block;
  const dur = b.endMs - b.startMs;
  switch (drag.mode) {
    case "move": {
      const startCol = clamp(b.startCol + dCols, 0, columnCount - b.colSpan);
      const startMs = clamp(snapToStep(b.startMs + dRows * TIMETABLE_SLOT_MS, TIMETABLE_SLOT_MS), dayStartMs, dayEndMs - dur);
      return { startCol, colSpan: b.colSpan, startMs, endMs: startMs + dur };
    }
    case "resize-top": {
      const startMs = clamp(snapToStep(b.startMs + dRows * TIMETABLE_SLOT_MS, TIMETABLE_SLOT_MS), dayStartMs, b.endMs - TIMETABLE_SLOT_MS);
      return { startCol: b.startCol, colSpan: b.colSpan, startMs, endMs: b.endMs };
    }
    case "resize-bottom": {
      const endMs = clamp(snapToStep(b.endMs + dRows * TIMETABLE_SLOT_MS, TIMETABLE_SLOT_MS), b.startMs + TIMETABLE_SLOT_MS, dayEndMs);
      return { startCol: b.startCol, colSpan: b.colSpan, startMs: b.startMs, endMs };
    }
    case "resize-left": {
      const startCol = clamp(b.startCol + dCols, 0, b.startCol + b.colSpan - 1);
      return { startCol, colSpan: b.startCol + b.colSpan - startCol, startMs: b.startMs, endMs: b.endMs };
    }
    case "resize-right": {
      const rightCol = clamp(b.startCol + b.colSpan - 1 + dCols, b.startCol, columnCount - 1);
      return { startCol: b.startCol, colSpan: rightCol - b.startCol + 1, startMs: b.startMs, endMs: b.endMs };
    }
  }
};

// 포인터 좌표 → 그리드 셀(시작 열·시작 시각). 빈 그리드면 null.
export const cellFromPoint = (rect: DOMRect, clientX: number, clientY: number, bounds: GridBounds): { startCol: number; startMs: number } | null => {
  const { columnCount, rowCount, dayStartMs } = bounds;
  if (columnCount === 0) return null;
  const col = clamp(Math.floor((clientX - rect.left) / (rect.width / columnCount)), 0, columnCount - 1);
  const row = clamp(Math.floor((clientY - rect.top) / TIMETABLE_ROW_H), 0, Math.max(rowCount - 1, 0));
  return { startCol: col, startMs: dayStartMs + row * TIMETABLE_SLOT_MS };
};
