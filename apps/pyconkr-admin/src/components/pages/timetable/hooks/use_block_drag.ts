import { TimetableScheduleSchema, TimetableRoomSchema } from "@frontend/common/schemas/backendAdminAPI";
import { PointerEvent as ReactPointerEvent, RefObject, useEffect, useRef, useState } from "react";

import { addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { Block, DragMode, DragState, GridBounds, ScheduleOp } from "../types";
import { computeDragPreview, geomChanged, geomOf, isOverPalette } from "../utils/grid";
import { opsForBlockDelete, opsForBlockTransform, overlaps } from "../utils/schedule";

type UseBlockDragParams = {
  elRef: RefObject<HTMLDivElement | null>;
  bounds: GridBounds;
  rooms: TimetableRoomSchema[];
  daySchedules: TimetableScheduleSchema[];
  onCommit: (ops: ScheduleOp[]) => void;
};

export const useBlockDrag = ({ elRef, bounds, rooms, daySchedules, onCommit }: UseBlockDragParams) => {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const dragging = drag !== null;

  const startDrag = (mode: DragMode, block: Block) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 현재 그리드 영역의 열 폭(px) 실측 — 비동기 측정 대신 드래그 시작 시점에 계산.
    const gridWidth = elRef.current?.getBoundingClientRect().width ?? 0;
    const colW = bounds.columnCount > 0 ? gridWidth / bounds.columnCount : 0;
    if (colW <= 0) return;
    const state: DragState = { mode, block, originX: e.clientX, originY: e.clientY, colW, preview: geomOf(block), overPalette: false };
    dragRef.current = state;
    setDrag(state);
  };

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) =>
      setDrag((d) => {
        if (!d) return d;
        const preview = computeDragPreview(d, e.clientX, e.clientY, bounds);
        const overPalette = d.mode === "move" && isOverPalette(e.clientX, e.clientY);
        // 스냅된 geometry·팔레트 상태가 그대로면 그대로 반환해 포인터 이벤트마다의 그리드 재렌더를 건너뛴다.
        if (!geomChanged(preview, d.preview) && overPalette === d.overPalette) return d;
        return { ...d, preview, overPalette };
      });
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d) return;
      // 본문 드래그를 팔레트 위에서 놓으면 배치를 삭제(미배치로 되돌림).
      if (d.mode === "move" && isOverPalette(e.clientX, e.clientY)) {
        onCommitRef.current(opsForBlockDelete(d.block));
        return;
      }
      const preview = computeDragPreview(d, e.clientX, e.clientY, bounds);
      if (!geomChanged(preview, geomOf(d.block))) return;
      const targetRoomIds = rooms.slice(preview.startCol, preview.startCol + preview.colSpan).map((r) => r.id);
      const excludeIds = new Set(d.block.scheduleByRoom.values());
      if (targetRoomIds.some((roomId) => overlaps(daySchedules, roomId, preview.startMs, preview.endMs, excludeIds)))
        addSnackbar("해당 시간·발표장에 이미 배치된 발표가 있습니다.", "warning");
      else onCommitRef.current(opsForBlockTransform(d.block, targetRoomIds, preview.startMs, preview.endMs));
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, bounds, rooms, daySchedules]);

  return { drag, dragging, startDrag };
};
