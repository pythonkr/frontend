import { TimetableScheduleSchema } from "@frontend/common/schemas/backendAdminAPI";

export type RoomInput = { name_ko: string; name_en: string };

export type ScheduleOp =
  | { kind: "create"; temp: TimetableScheduleSchema }
  | { kind: "update"; row: TimetableScheduleSchema }
  | { kind: "delete"; id: string };

export type Block = {
  key: string;
  presentation: string;
  startMs: number;
  endMs: number;
  startCol: number; // 좌측 방 열 인덱스
  colSpan: number; // 점유하는 방 열 수
  scheduleByRoom: Map<string, string>; // roomId -> scheduleId
};

export type DragMode = "move" | "resize-top" | "resize-bottom" | "resize-left" | "resize-right";
export type Geometry = { startCol: number; colSpan: number; startMs: number; endMs: number };
export type DragState = { mode: DragMode; block: Block; originX: number; originY: number; colW: number; preview: Geometry; overPalette: boolean };

// 그리드 좌표 변환에 필요한 치수(열 수 · 행 수 · 하루 시간 범위).
export type GridBounds = { columnCount: number; rowCount: number; dayStartMs: number; dayEndMs: number };
