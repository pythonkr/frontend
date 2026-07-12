import { adminTimetableQueryKey, useBackendAdminClient, useTimetableVersionQuery } from "@frontend/common/hooks/useAdminAPI";
import { TimetableRoomSchema } from "@frontend/common/schemas/backendAdminAPI";
import { isoDateOf } from "@frontend/common/utils";
import { useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";

import { useAppContext } from "@apps/pyconkr-admin/contexts/app_context";

import { RoomInput } from "../types";
import { useTimetableDraft, useTimetableReferenceData } from "./timetable_hooks";
import { TimetableContext, TimetableContextValue } from "./use_timetable";
import { computeDays } from "../utils/days";

export const TimetableProvider: FC<{ eventId: string; children: ReactNode }> = ({ eventId, children }) => {
  const { presentations, presentationTypes, event } = useTimetableReferenceData(eventId);
  const { rooms, schedules, version, dirty, saving, applyLocal, addRoom, updateRoom, removeRoom, commitRoomOrder, discard, save } =
    useTimetableDraft(eventId);
  const [draggingPresentationId, setDraggingPresentationId] = useState<string | null>(null);
  const [highlightTypeId, setHighlightTypeId] = useState<string>("");
  const [roomDialogRoom, setRoomDialogRoom] = useState<TimetableRoomSchema | null | undefined>(undefined);
  const { setUnsavedChanges } = useAppContext();

  useEffect(() => {
    setUnsavedChanges(dirty);
    return () => setUnsavedChanges(false);
  }, [dirty, setUnsavedChanges]);

  useEffect(() => {
    if (!draggingPresentationId) return;
    const clear = () => setDraggingPresentationId(null);
    window.addEventListener("drop", clear);
    window.addEventListener("dragend", clear);
    return () => {
      window.removeEventListener("drop", clear);
      window.removeEventListener("dragend", clear);
    };
  }, [draggingPresentationId]);

  // 다른 관리자의 변경 감지: 편집 중이면 자주, 아니면 드물게 폴링.
  const client = useBackendAdminClient();
  const queryClient = useQueryClient();
  const { data: latestVersion } = useTimetableVersionQuery(client, eventId, dirty ? 20_000 : 60_000);
  const serverChanged = latestVersion != null && latestVersion !== version;
  const reloadBoard = () => queryClient.invalidateQueries({ queryKey: adminTimetableQueryKey(eventId) });
  const reload = () => {
    discard(); // 로컬 편집 파기 후 재조회 — 재조회가 끝나면 sync 이펙트가 최신으로 재시드.
    reloadBoard();
  };
  // 편집 중이 아닐 때 서버가 바뀌면 배너 없이 조용히 최신화(board 재조회 → 드래프트 재시드).
  useEffect(() => {
    if (serverChanged && !dirty) reloadBoard();
  }, [serverChanged, dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderedRooms = useMemo(() => [...rooms].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [rooms]);
  // 접힌 방(열에서 숨김). 세션 한정 in-memory 상태 — 새로고침 시 초기화.
  const [collapsedRoomIds, setCollapsedRoomIds] = useState<Set<string>>(new Set());
  const toggleRoomCollapsed = (roomId: string) =>
    setCollapsedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  const visibleRooms = useMemo(() => orderedRooms.filter((r) => !collapsedRoomIds.has(r.id)), [orderedRooms, collapsedRoomIds]);
  const days = useMemo(() => computeDays(event, schedules), [event, schedules]);
  const [selectedDate, setSelectedDate] = useState<string>(days[0]);
  useEffect(() => {
    if (!days.includes(selectedDate)) setSelectedDate(days[0]);
  }, [days, selectedDate]);

  const presentationsById = useMemo(() => new Map(presentations.map((p) => [p.id, p])), [presentations]);
  const placedPresentationIds = useMemo(() => new Set(schedules.map((s) => s.presentation)), [schedules]);
  const daySchedules = useMemo(() => schedules.filter((s) => isoDateOf(s.start_at) === selectedDate), [schedules, selectedDate]);

  const submitRoom = (values: RoomInput) => {
    if (roomDialogRoom) updateRoom(roomDialogRoom, values);
    else addRoom(values);
    setRoomDialogRoom(undefined);
  };
  const deleteRoom = () => {
    if (roomDialogRoom) removeRoom(roomDialogRoom);
    setRoomDialogRoom(undefined);
  };
  const dialogRoomScheduleCount = roomDialogRoom ? schedules.filter((s) => s.room_id === roomDialogRoom.id).length : 0;

  const value: TimetableContextValue = {
    eventId,
    orderedRooms,
    visibleRooms,
    collapsedRoomIds,
    toggleRoomCollapsed,
    presentationsById,
    presentationTypes,
    highlightTypeId,
    setHighlightTypeId,
    days,
    selectedDate,
    setSelectedDate,
    daySchedules,
    placedPresentationIds,
    dirty,
    saving,
    applyLocal,
    discard,
    save,
    commitRoomOrder,
    serverChanged,
    reload,
    draggingPresentationId,
    setDraggingPresentationId,
    roomDialogRoom,
    setRoomDialogRoom,
    submitRoom,
    deleteRoom,
    dialogRoomScheduleCount,
  };

  return <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>;
};
