import { saveTimetable } from "@frontend/common/apis/admin_api";
import { formatBackendErrorMessage } from "@frontend/common/apis/client";
import {
  adminTimetableQueryKey,
  useBackendAdminClient,
  useListAllQuery,
  useRetrieveQuery,
  useTimetableQuery,
} from "@frontend/common/hooks/useAdminAPI";
import {
  EventSchema,
  PresentationSchema,
  PresentationTypeSchema,
  TimetableRoomSchema,
  TimetableScheduleSchema,
} from "@frontend/common/schemas/backendAdminAPI";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { APP } from "../const";
import { RoomInput, ScheduleOp } from "../types";
import { computeTimetableOps } from "../utils/diff";
import { applyOps, makeTempId } from "../utils/schedule";

export const useTimetableReferenceData = (eventId: string) => {
  const client = useBackendAdminClient();
  const { data: presentations } = useListAllQuery<PresentationSchema>(client, APP, "presentation", { event: eventId });
  const { data: presentationTypes } = useListAllQuery<PresentationTypeSchema>(client, APP, "presentationtype", { event: eventId });
  const { data: event } = useRetrieveQuery<EventSchema>(client, APP, "event", eventId);
  return { presentations, presentationTypes, event };
};

const makeTempRoom = (rooms: TimetableRoomSchema[], name_ko: string, name_en: string): TimetableRoomSchema => ({
  id: makeTempId(),
  name_ko,
  name_en: name_en || null,
  order: rooms.length > 0 ? Math.max(...rooms.map((r) => r.order ?? 0)) + 10 : 0,
});

// 방+스케줄 통합 드래프트: baseline(서버) 대비 working(편집본)을 op-diff 로 If-Match PUT. 412 면 서버 상태로 되돌림.
export const useTimetableDraft = (eventId: string) => {
  const client = useBackendAdminClient();
  const queryClient = useQueryClient();
  const { data } = useTimetableQuery(client, eventId);

  const [baseline, setBaseline] = useState(data); // dirty 중 고정되는 서버 스냅샷(version 포함)
  const [rooms, setRooms] = useState<TimetableRoomSchema[]>(data.rooms);
  const [schedules, setSchedules] = useState<TimetableScheduleSchema[]>(data.schedules);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setBaseline(data);
      setRooms(data.rooms);
      setSchedules(data.schedules);
    }
  }, [data, dirty]);

  const applyLocal = (ops: ScheduleOp[]) => {
    if (saving || ops.length === 0) return;
    setSchedules((s) => applyOps(s, ops));
    setDirty(true);
  };
  const editRooms = (updater: (rooms: TimetableRoomSchema[]) => TimetableRoomSchema[]) => {
    if (saving) return;
    setRooms(updater);
    setDirty(true);
  };

  const addRoom = ({ name_ko, name_en }: RoomInput) => editRooms((rs) => [...rs, makeTempRoom(rs, name_ko, name_en)]);
  const updateRoom = (room: TimetableRoomSchema, { name_ko, name_en }: RoomInput) =>
    editRooms((rs) => rs.map((r) => (r.id === room.id ? { ...r, name_ko, name_en: name_en || null } : r)));
  const removeRoom = (room: TimetableRoomSchema) => {
    if (saving) return;
    setRooms((rs) => rs.filter((r) => r.id !== room.id));
    setSchedules((s) => s.filter((sc) => sc.room_id !== room.id));
    setDirty(true);
  };
  const commitRoomOrder = (orderedRoomIds: string[]) =>
    editRooms((rs) => {
      const byId = new Map(rs.map((r) => [r.id, r]));
      return orderedRoomIds.flatMap((id, index) => {
        const room = byId.get(id);
        return room ? [{ ...room, order: index * 10 }] : [];
      });
    });

  const discard = () => {
    setRooms(baseline.rooms);
    setSchedules(baseline.schedules);
    setDirty(false);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = computeTimetableOps(baseline, { rooms, schedules });
      const result = await saveTimetable(client, eventId, baseline.version)(payload);
      const next = { rooms: result.rooms, schedules: result.schedules, version: result.version };
      queryClient.setQueryData(adminTimetableQueryKey(eventId), next);
      setBaseline(next);
      setRooms(result.rooms);
      setSchedules(result.schedules);
      setDirty(false);
      if (result.conflict) addSnackbar("다른 사람이 시간표를 변경해 최신 상태로 되돌렸습니다. 내용을 확인 후 다시 저장해주세요.", "warning");
      else addSnackbar("시간표를 저장했습니다.", "success");
    } catch (error) {
      addSnackbar(formatBackendErrorMessage(error, "시간표 저장 중 문제가 발생했습니다. 페이지를 새로고침해 상태를 확인해주세요."), "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    rooms,
    schedules,
    version: baseline.version,
    dirty,
    saving,
    applyLocal,
    addRoom,
    updateRoom,
    removeRoom,
    commitRoomOrder,
    discard,
    save,
  };
};
