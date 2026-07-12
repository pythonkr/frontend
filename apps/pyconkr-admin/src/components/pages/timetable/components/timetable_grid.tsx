import { dayBoundsMs, formatMs, stepsBetween } from "@frontend/common/utils";
import { UnfoldMore } from "@mui/icons-material";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { FC, useMemo, useRef } from "react";

import {
  TIMETABLE_DEFAULT_DAY_END_HOUR,
  TIMETABLE_DEFAULT_DAY_START_HOUR,
  TIMETABLE_DEFAULT_DURATION_MS,
  TIMETABLE_GUTTER,
  TIMETABLE_HALF_HOUR_ROWS,
  TIMETABLE_HOUR_ROWS,
  TIMETABLE_MIN_COL,
  TIMETABLE_ROW_H,
  TIMETABLE_SLOT_MS,
} from "../const";
import { RoomHeaderCell } from "./room_header_cell";
import { TimetableBlock } from "./timetable_block";
import { useTimetable } from "../contexts/use_timetable";
import { useBlockDrag } from "../hooks/use_block_drag";
import { useEdgeAutoScroll } from "../hooks/use_edge_auto_scroll";
import { usePaletteDrop } from "../hooks/use_palette_drop";
import { useRoomReorder } from "../hooks/use_room_reorder";
import { GridBounds } from "../types";
import { geomOf } from "../utils/grid";
import { groupSchedulesToBlocks, opsForBlockDelete } from "../utils/schedule";

const GRID_LINES =
  `repeating-linear-gradient(to bottom, rgba(0,0,0,0.11) 0, rgba(0,0,0,0.11) 1px, transparent 1px, transparent ${TIMETABLE_HOUR_ROWS * TIMETABLE_ROW_H}px),` +
  `repeating-linear-gradient(to bottom, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent ${TIMETABLE_ROW_H}px)`;

export const TimetableGrid: FC = () => {
  const {
    visibleRooms: rooms,
    orderedRooms,
    collapsedRoomIds,
    toggleRoomCollapsed,
    presentationsById,
    daySchedules,
    selectedDate,
    highlightTypeId,
    draggingPresentationId,
    applyLocal: onCommit,
    commitRoomOrder,
    setRoomDialogRoom: onEditRoom,
  } = useTimetable();

  const collapsedRooms = useMemo(() => orderedRooms.filter((r) => collapsedRoomIds.has(r.id)), [orderedRooms, collapsedRoomIds]);
  // 리오더는 보이는 방만 다루므로, 접힌 방을 원래 슬롯에 고정한 채 전체 순서를 재구성해 커밋한다 (접힌 방 유실 방지).
  const onReorderRooms = (nextVisibleIds: string[]) => {
    let vi = 0;
    commitRoomOrder(orderedRooms.map((r) => (collapsedRoomIds.has(r.id) ? r.id : nextVisibleIds[vi++])));
  };

  const { dayStartMs, dayEndMs } = useMemo(
    () => dayBoundsMs(selectedDate, TIMETABLE_DEFAULT_DAY_START_HOUR, TIMETABLE_DEFAULT_DAY_END_HOUR, daySchedules),
    [selectedDate, daySchedules]
  );
  const n = rooms.length;
  const rowCount = stepsBetween(dayStartMs, dayEndMs, TIMETABLE_SLOT_MS);
  const bounds = useMemo<GridBounds>(() => ({ columnCount: n, rowCount, dayStartMs, dayEndMs }), [n, rowCount, dayStartMs, dayEndMs]);

  const elRef = useRef<HTMLDivElement | null>(null);
  const colIndexByRoom = useMemo(() => new Map(rooms.map((r, i) => [r.id, i])), [rooms]);
  const blocks = useMemo(() => groupSchedulesToBlocks(daySchedules, colIndexByRoom), [daySchedules, colIndexByRoom]);
  const timeMarks = useMemo(() => {
    const marks: { row: number; label: string }[] = [];
    for (let row = 0; row <= rowCount; row += TIMETABLE_HALF_HOUR_ROWS)
      marks.push({ row, label: formatMs(dayStartMs + row * TIMETABLE_SLOT_MS, "HH:mm") });
    return marks;
  }, [rowCount, dayStartMs]);

  const { drag, dragging, startDrag } = useBlockDrag({ elRef, bounds, rooms, daySchedules, onCommit });
  const reorder = useRoomReorder({ rooms, onReorderRooms });
  const palette = usePaletteDrop({ elRef, bounds, rooms, daySchedules, onCommit, draggingPresentationId });
  const autoScroll = useEdgeAutoScroll(draggingPresentationId !== null);

  return (
    <Paper variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 접은 발표장 복원 바 */}
      {collapsedRooms.length > 0 && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ flexShrink: 0, flexWrap: "wrap", gap: 0.5, px: 1, py: 0.5, borderBottom: 1, borderColor: "divider" }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }} children="접은 발표장" />
          {collapsedRooms.map((room) => (
            <Chip
              key={room.id}
              size="small"
              variant="outlined"
              label={room.name_ko}
              icon={<UnfoldMore sx={{ transform: "rotate(90deg)" }} />}
              onClick={() => toggleRoomCollapsed(room.id)}
              title="펼치기"
            />
          ))}
        </Stack>
      )}
      <Box
        ref={autoScroll.scrollRef}
        onDragOver={draggingPresentationId ? autoScroll.onDragOver : undefined}
        onDragLeave={draggingPresentationId ? (e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && autoScroll.stop() : undefined}
        onDrop={autoScroll.stop}
        sx={{ overflow: "auto", flex: 1, minHeight: 0, overscrollBehavior: "none" }}
      >
        <Box sx={{ minWidth: TIMETABLE_GUTTER + n * TIMETABLE_MIN_COL }}>
          {/* 방 헤더 (sticky) — 드래그로 열 순서 변경 */}
          <Stack direction="row" sx={{ position: "sticky", top: 0, zIndex: 3, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
            <Box sx={{ width: TIMETABLE_GUTTER, flexShrink: 0 }} />
            {rooms.map((room, i) => (
              <RoomHeaderCell
                key={room.id}
                room={room}
                index={i}
                isSource={reorder.roomDrag?.fromIndex === i}
                isTarget={reorder.roomDrag != null && reorder.roomDrag.overIndex === i && reorder.roomDrag.fromIndex !== i}
                reordering={reorder.roomDrag != null}
                onReorderOver={reorder.onReorderOver}
                onReorderDrop={reorder.onReorderDrop}
                onReorderStart={reorder.onReorderStart}
                onReorderEnd={reorder.onReorderEnd}
                onEdit={onEditRoom}
                onCollapse={(r) => toggleRoomCollapsed(r.id)}
              />
            ))}
          </Stack>

          {/* 본문: 시간 눈금 + 그리드 */}
          <Stack direction="row">
            <Box sx={{ width: TIMETABLE_GUTTER, flexShrink: 0, position: "relative", height: rowCount * TIMETABLE_ROW_H }}>
              {timeMarks.map((mark) => (
                <Typography
                  key={mark.row}
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: mark.row * TIMETABLE_ROW_H - 8,
                    right: 6,
                    color: "text.secondary",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {mark.label}
                </Typography>
              ))}
            </Box>

            <Box
              ref={elRef}
              onDragOver={palette.onDragOver}
              onDrop={palette.onDrop}
              onDragLeave={palette.onDragLeave}
              sx={{
                position: "relative",
                flex: "1 1 0",
                minWidth: n * TIMETABLE_MIN_COL,
                height: rowCount * TIMETABLE_ROW_H,
                backgroundImage: GRID_LINES,
                userSelect: dragging ? "none" : undefined,
              }}
            >
              {/* 방 열 구분선 */}
              <Stack direction="row" sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {rooms.map((room) => (
                  <Box key={room.id} sx={{ flex: "1 1 0", minWidth: TIMETABLE_MIN_COL, borderLeft: 1, borderColor: "divider" }} />
                ))}
              </Stack>

              {/* 드롭 미리보기 */}
              {palette.dropPreview && (
                <Box
                  sx={{
                    position: "absolute",
                    top: stepsBetween(dayStartMs, palette.dropPreview.startMs, TIMETABLE_SLOT_MS) * TIMETABLE_ROW_H,
                    height: (TIMETABLE_DEFAULT_DURATION_MS / TIMETABLE_SLOT_MS) * TIMETABLE_ROW_H,
                    left: `${(palette.dropPreview.startCol / n) * 100}%`,
                    width: `${(1 / n) * 100}%`,
                    p: 0.5,
                    pointerEvents: "none",
                    border: "2px dashed",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    bgcolor: "primary.main",
                    opacity: 0.18,
                  }}
                />
              )}

              {/* 블록 */}
              {blocks.map((block) => {
                const active = drag?.block.key === block.key;
                const presentation = presentationsById.get(block.presentation);
                return (
                  <TimetableBlock
                    key={block.key}
                    block={block}
                    geom={active && drag ? drag.preview : geomOf(block)}
                    isDragging={active}
                    toPalette={active && !!drag?.overPalette}
                    presentation={presentation}
                    dimmed={highlightTypeId !== "" && presentation?.type !== highlightTypeId}
                    columnCount={n}
                    dayStartMs={dayStartMs}
                    interactionDisabled={draggingPresentationId !== null}
                    onStartDrag={startDrag}
                    onDelete={() => onCommit(opsForBlockDelete(block))}
                  />
                );
              })}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};
