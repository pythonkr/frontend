import { TimetableRoomSchema } from "@frontend/common/schemas/backendAdminAPI";
import { DragIndicator, Edit, UnfoldLess } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { TIMETABLE_MIN_COL } from "../const";

type RoomHeaderCellProps = {
  room: TimetableRoomSchema;
  index: number;
  isSource: boolean;
  isTarget: boolean;
  reordering: boolean;
  onReorderOver: (index: number) => void;
  onReorderDrop: (index: number) => void;
  onReorderStart: (index: number) => void;
  onReorderEnd: () => void;
  onEdit?: (room: TimetableRoomSchema) => void;
  onCollapse?: (room: TimetableRoomSchema) => void;
};

export const RoomHeaderCell: FC<RoomHeaderCellProps> = ({
  room,
  index,
  isSource,
  isTarget,
  reordering,
  onReorderOver,
  onReorderDrop,
  onReorderStart,
  onReorderEnd,
  onEdit,
  onCollapse,
}) => (
  <Box
    onDragOver={
      reordering
        ? (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            onReorderOver(index);
          }
        : undefined
    }
    onDrop={reordering ? () => onReorderDrop(index) : undefined}
    sx={{
      flex: "1 1 0",
      minWidth: TIMETABLE_MIN_COL,
      px: 0.5,
      py: 0.75,
      borderLeft: 1,
      borderColor: "divider",
      userSelect: "none",
      opacity: isSource ? 0.4 : 1,
      bgcolor: isTarget ? "action.hover" : undefined,
      boxShadow: isTarget ? (t) => `inset 3px 0 0 ${t.palette.primary.main}` : undefined,
    }}
  >
    <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", room.id);
          onReorderStart(index);
        }}
        onDragEnd={onReorderEnd}
        title="드래그로 순서 변경"
        sx={{ cursor: "grab", flexShrink: 0, touchAction: "none", color: "text.disabled" }}
        children={<DragIndicator fontSize="small" />}
      />
      <Typography variant="subtitle2" noWrap children={room.name_ko} sx={{ flexGrow: 1, textAlign: "center", minWidth: 0 }} />
      {onEdit && (
        <IconButton
          size="small"
          onClick={() => onEdit(room)}
          aria-label="발표장 편집"
          sx={{ flexShrink: 0, p: 0.25 }}
          children={<Edit sx={{ fontSize: 16 }} />}
        />
      )}
      {onCollapse && (
        <IconButton
          size="small"
          onClick={() => onCollapse(room)}
          aria-label="발표장 접기"
          title="이 발표장 접기"
          sx={{ flexShrink: 0, p: 0.25 }}
          children={<UnfoldLess sx={{ fontSize: 16, transform: "rotate(90deg)" }} />}
        />
      )}
    </Stack>
  </Box>
);
