import { PresentationSchema } from "@frontend/common/schemas/backendAdminAPI";
import { formatMs, stepsBetween } from "@frontend/common/utils";
import { Close } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { PointerEvent as ReactPointerEvent, FC } from "react";

import { resourceLabel } from "@apps/pyconkr-admin/utils/label";

import { TIMETABLE_DIM_OPACITY, TIMETABLE_HANDLE, TIMETABLE_ROW_H, TIMETABLE_SLOT_MS } from "../const";
import { Block, DragMode, Geometry } from "../types";

const HANDLE_BASE = { position: "absolute" as const, zIndex: 6, touchAction: "none" as const };
const HANDLE_SX = {
  top: { ...HANDLE_BASE, top: 0, left: 0, right: 0, height: TIMETABLE_HANDLE, cursor: "ns-resize" },
  bottom: { ...HANDLE_BASE, bottom: 0, left: 0, right: 0, height: TIMETABLE_HANDLE, cursor: "ns-resize" },
  left: { ...HANDLE_BASE, top: 0, bottom: 0, left: 0, width: TIMETABLE_HANDLE, cursor: "ew-resize" },
  right: { ...HANDLE_BASE, top: 0, bottom: 0, right: 0, width: TIMETABLE_HANDLE, cursor: "ew-resize" },
} as const;

type TimetableBlockProps = {
  block: Block;
  geom: Geometry;
  isDragging: boolean;
  toPalette: boolean;
  presentation?: PresentationSchema;
  dimmed: boolean;
  columnCount: number;
  dayStartMs: number;
  interactionDisabled: boolean;
  onStartDrag: (mode: DragMode, block: Block) => (e: ReactPointerEvent) => void;
  onDelete: () => void;
};

export const TimetableBlock: FC<TimetableBlockProps> = ({
  block,
  geom,
  isDragging,
  toPalette,
  presentation,
  dimmed,
  columnCount,
  dayStartMs,
  interactionDisabled,
  onStartDrag,
  onDelete,
}) => (
  <Box
    onPointerDown={onStartDrag("move", block)}
    sx={{
      position: "absolute",
      top: stepsBetween(dayStartMs, geom.startMs, TIMETABLE_SLOT_MS) * TIMETABLE_ROW_H + 1,
      height: stepsBetween(geom.startMs, geom.endMs, TIMETABLE_SLOT_MS) * TIMETABLE_ROW_H - 2,
      left: `${(geom.startCol / columnCount) * 100}%`,
      width: `${(geom.colSpan / columnCount) * 100}%`,
      px: 0.5,
      touchAction: "none",
      cursor: "move",
      zIndex: isDragging ? 5 : 2,
      pointerEvents: interactionDisabled ? "none" : "auto",
    }}
  >
    <Box
      sx={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        borderRadius: 1,
        border: 1,
        borderStyle: toPalette ? "dashed" : "solid",
        borderColor: toPalette ? "error.main" : "primary.dark",
        bgcolor: toPalette ? "error.light" : isDragging ? "primary.light" : "primary.main",
        color: "primary.contrastText",
        boxShadow: isDragging ? 4 : 1,
        opacity: isDragging ? (toPalette ? 0.85 : 0.9) : dimmed ? TIMETABLE_DIM_OPACITY : 1,
        transition: "opacity 0.15s ease",
        p: 0.5,
      }}
    >
      <Typography variant="caption" sx={{ display: "block", fontWeight: 600, lineHeight: 1.2, wordBreak: "break-word" }}>
        {presentation ? resourceLabel(presentation) : "(알 수 없는 발표)"}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>
        {formatMs(geom.startMs, "HH:mm")}-{formatMs(geom.endMs, "HH:mm")}
      </Typography>

      <IconButton
        size="small"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        sx={{ position: "absolute", top: 0, right: 0, zIndex: 7, color: "primary.contrastText", p: 0.25 }}
        aria-label="삭제"
        children={<Close sx={{ fontSize: 14 }} />}
      />

      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Box key={side} onPointerDown={onStartDrag(`resize-${side}`, block)} sx={HANDLE_SX[side]} />
      ))}
    </Box>
  </Box>
);
