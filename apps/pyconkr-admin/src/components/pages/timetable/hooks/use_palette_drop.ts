import { TimetableScheduleSchema, TimetableRoomSchema } from "@frontend/common/schemas/backendAdminAPI";
import { clamp } from "@frontend/common/utils";
import { DragEvent, RefObject, useEffect, useState } from "react";

import { addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { TIMETABLE_DEFAULT_DURATION_MS, TIMETABLE_PRESENTATION_DND_MIME, TIMETABLE_SLOT_MS } from "../const";
import { GridBounds, ScheduleOp } from "../types";
import { cellFromPoint } from "../utils/grid";
import { opsForCreate, overlaps } from "../utils/schedule";

type UsePaletteDropParams = {
  elRef: RefObject<HTMLDivElement | null>;
  bounds: GridBounds;
  rooms: TimetableRoomSchema[];
  daySchedules: TimetableScheduleSchema[];
  onCommit: (ops: ScheduleOp[]) => void;
  draggingPresentationId: string | null;
};

export const usePaletteDrop = ({ elRef, bounds, rooms, daySchedules, onCommit, draggingPresentationId }: UsePaletteDropParams) => {
  const [dropPreview, setDropPreview] = useState<{ startCol: number; startMs: number } | null>(null);
  useEffect(() => {
    if (!draggingPresentationId) setDropPreview(null);
  }, [draggingPresentationId]);

  const cellFrom = (clientX: number, clientY: number) => {
    const el = elRef.current;
    return el ? cellFromPoint(el.getBoundingClientRect(), clientX, clientY, bounds) : null;
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!draggingPresentationId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const cell = cellFrom(e.clientX, e.clientY);
    // 대상 셀이 그대로면 그대로 반환해 dragover 이벤트마다의 그리드 재렌더를 건너뛴다.
    setDropPreview((prev) => (prev && cell && prev.startCol === cell.startCol && prev.startMs === cell.startMs ? prev : cell));
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const presentationId = e.dataTransfer.getData(TIMETABLE_PRESENTATION_DND_MIME) || draggingPresentationId;
    const cell = cellFrom(e.clientX, e.clientY);
    setDropPreview(null);
    if (!presentationId || !cell) return;
    const startMs = clamp(cell.startMs, bounds.dayStartMs, bounds.dayEndMs - TIMETABLE_SLOT_MS);
    const endMs = Math.min(startMs + TIMETABLE_DEFAULT_DURATION_MS, bounds.dayEndMs);
    const roomId = rooms[cell.startCol].id;
    if (overlaps(daySchedules, roomId, startMs, endMs, new Set())) {
      addSnackbar("해당 시간·발표장에 이미 배치된 발표가 있습니다.", "warning");
      return;
    }
    onCommit(opsForCreate(presentationId, roomId, startMs, endMs));
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropPreview(null);
  };

  return { dropPreview, onDragOver, onDrop, onDragLeave };
};
