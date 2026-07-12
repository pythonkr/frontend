import { PresentationSchema, PresentationTypeSchema, TimetableRoomSchema, TimetableScheduleSchema } from "@frontend/common/schemas/backendAdminAPI";
import { createContext, useContext } from "react";

import { RoomInput, ScheduleOp } from "../types";

export type TimetableContextValue = {
  eventId: string;
  orderedRooms: TimetableRoomSchema[];
  visibleRooms: TimetableRoomSchema[]; // orderedRooms 에서 접힌 방을 제외한 열 집합
  collapsedRoomIds: Set<string>;
  toggleRoomCollapsed: (roomId: string) => void;
  presentationsById: Map<string, PresentationSchema>;
  presentationTypes: PresentationTypeSchema[];
  highlightTypeId: string;
  setHighlightTypeId: (id: string) => void;
  days: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  daySchedules: TimetableScheduleSchema[];
  placedPresentationIds: Set<string>;
  dirty: boolean;
  saving: boolean;
  applyLocal: (ops: ScheduleOp[]) => void;
  discard: () => void;
  save: () => Promise<void>;
  commitRoomOrder: (orderedRoomIds: string[]) => void;
  serverChanged: boolean;
  reload: () => void;
  draggingPresentationId: string | null;
  setDraggingPresentationId: (id: string | null) => void;
  roomDialogRoom: TimetableRoomSchema | null | undefined; // undefined=닫힘, null=추가 다이얼로그, TimetableRoomSchema=수정 다이얼로그.
  setRoomDialogRoom: (room: TimetableRoomSchema | null | undefined) => void;
  submitRoom: (values: RoomInput) => void;
  deleteRoom: () => void;
  dialogRoomScheduleCount: number;
};

export const TimetableContext = createContext<TimetableContextValue | null>(null);

export const useTimetable = (): TimetableContextValue => {
  const ctx = useContext(TimetableContext);
  if (!ctx) throw new Error("useTimetable 은 TimetableProvider 안에서만 사용할 수 있습니다.");
  return ctx;
};
