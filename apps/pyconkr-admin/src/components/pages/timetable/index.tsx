import { dayTabLabel } from "@frontend/common/utils";
import { Add, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { Link as RouterLink } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ChoicePicker } from "@apps/pyconkr-admin/components/elements/choice_picker";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { useAppContext } from "@apps/pyconkr-admin/contexts/app_context";
import { resourceLabel } from "@apps/pyconkr-admin/utils/label";

import { TimetablePalette } from "./components/palette";
import { RoomDialog } from "./components/room_dialog";
import { TimetableGrid } from "./components/timetable_grid";
import { TimetableProvider } from "./contexts/timetable_provider";
import { useSelectedEvent } from "./contexts/use_selected_event";
import { useTimetable } from "./contexts/use_timetable";

const TimetableBoardShell: FC = () => {
  const {
    eventId,
    orderedRooms,
    days,
    selectedDate,
    setSelectedDate,
    dirty,
    saving,
    save,
    discard,
    setRoomDialogRoom,
    serverChanged,
    reload,
    presentationTypes,
    highlightTypeId,
    setHighlightTypeId,
  } = useTimetable();

  return (
    <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        <Tabs
          value={selectedDate}
          onChange={(_, value) => setSelectedDate(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flexShrink: 1, minWidth: 0 }}
        >
          {days.map((day, index) => (
            <Tab key={day} value={day} label={dayTabLabel(day, index)} />
          ))}
        </Tabs>
        <Box sx={{ flexGrow: 1 }} />
        <FormControl size="small" sx={{ flexShrink: 0, minWidth: 160 }}>
          <InputLabel>타입 강조</InputLabel>
          <Select label="타입 강조" value={highlightTypeId} onChange={(e) => setHighlightTypeId(e.target.value)}>
            <MenuItem value="" children={<em>강조 없음</em>} />
            {presentationTypes.map((t) => (
              <MenuItem key={t.id} value={t.id} children={resourceLabel(t)} />
            ))}
          </Select>
        </FormControl>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setRoomDialogRoom(null)}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
          children="장소 추가"
        />
        {dirty && <Chip size="small" color="warning" variant="outlined" label="저장 안 됨" sx={{ flexShrink: 0 }} />}
        <Button size="small" color="inherit" onClick={discard} disabled={!dirty || saving} sx={{ flexShrink: 0 }} children="취소" />
        <Button
          size="small"
          variant="contained"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save />}
          onClick={save}
          disabled={!dirty || saving}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
          children="저장"
        />
      </Stack>

      {serverChanged && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ flexShrink: 0, py: 0, alignItems: "center" }}
          action={<Button color="inherit" size="small" onClick={reload} children="새로고침" />}
        >
          다른 사람이 시간표를 변경했습니다. 저장하면 최신 내용으로 병합이 필요합니다.
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ width: 300, flexShrink: 0, minHeight: 0 }} children={<TimetablePalette />} />
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {orderedRooms.length === 0 ? (
            <Stack spacing={1} sx={{ p: 3 }} alignItems="flex-start">
              <Typography color="text.secondary" children="이 이벤트에 등록된 장소(Room)가 없습니다." />
              <Link component={RouterLink} to={`/event/event/${eventId}`} children="이벤트 설정 → 발표 설정 → 장소에서 장소를 추가하세요." />
            </Stack>
          ) : (
            <TimetableGrid />
          )}
        </Box>
      </Stack>

      <RoomDialog />
    </Stack>
  );
};

const SessionTimetableInner: FC = () => {
  const { eventId, setEventId } = useSelectedEvent();
  const { confirmLeaveIfUnsaved } = useAppContext();
  const changeEvent = (value: string | number | null | undefined) => {
    if (confirmLeaveIfUnsaved()) setEventId(value);
  };

  return (
    <Stack spacing={2} sx={{ height: "calc(100vh - 132px)" }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Typography variant="h5" sx={{ flexShrink: 0 }} children="시간표 편집" />
        <Box sx={{ minWidth: 320 }}>
          <ErrorBoundary fallback={ErrorFallback}>
            <Suspense fallback={<CircularProgress size={20} />}>
              <ChoicePicker source={{ app: "event", resource: "event" }} value={eventId} onChange={changeEvent} />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Stack>

      {eventId ? (
        <ErrorBoundary key={eventId} fallback={ErrorFallback}>
          <Suspense fallback={<CircularProgress />}>
            <TimetableProvider eventId={eventId}>
              <TimetableBoardShell />
            </TimetableProvider>
          </Suspense>
        </ErrorBoundary>
      ) : (
        <Typography color="text.secondary">상단에서 이벤트를 선택하세요.</Typography>
      )}
    </Stack>
  );
};

export const SessionTimetablePage: FC = () => (
  <BackendAdminSignInGuard>
    <SessionTimetableInner />
  </BackendAdminSignInGuard>
);
