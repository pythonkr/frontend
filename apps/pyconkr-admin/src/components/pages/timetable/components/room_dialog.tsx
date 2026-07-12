import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { FC, FormEvent, useEffect, useState } from "react";

import { useTimetable } from "../contexts/use_timetable";

export const RoomDialog: FC = () => {
  const { roomDialogRoom, setRoomDialogRoom, dialogRoomScheduleCount: scheduleCount, submitRoom: onSubmit, deleteRoom: onDelete } = useTimetable();
  const open = roomDialogRoom !== undefined;
  const room = roomDialogRoom ?? null;
  const onClose = () => setRoomDialogRoom(undefined);
  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");

  useEffect(() => {
    if (!open) return;
    setNameKo(room?.name_ko ?? "");
    setNameEn(room?.name_en ?? "");
  }, [open, room]);

  const isEdit = room !== null;
  const canSubmit = nameKo.trim().length > 0;

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name_ko: nameKo.trim(), name_en: nameEn.trim() });
  };

  const handleDelete = () => {
    const warning = scheduleCount > 0 ? `\n이 장소에 배치된 세션 ${scheduleCount}개의 일정도 함께 삭제됩니다.` : "";
    if (window.confirm(`'${room?.name_ko}' 장소를 삭제하시겠습니까?\n${warning}`)) onDelete();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? "장소 수정" : "장소 추가"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="이름 (한국어)" required fullWidth value={nameKo} onChange={(e) => setNameKo(e.target.value)} autoFocus />
            <TextField label="이름 (영어)" required fullWidth value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
          <Stack direction="row" spacing={1}>
            {isEdit && <Button color="error" variant="text" onClick={handleDelete} children="삭제" />}
            <Button color="inherit" variant="text" onClick={onClose} children="취소" />
            <Button type="submit" variant="contained" disabled={!canSubmit} children={isEdit ? "수정" : "추가"} />
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
};
