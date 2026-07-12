import { TimetableRoomSchema } from "@frontend/common/schemas/backendAdminAPI";
import { useState } from "react";

import { moveItem } from "../utils/grid";

type RoomDragState = { fromIndex: number; overIndex: number };

type UseRoomReorderParams = {
  rooms: TimetableRoomSchema[];
  onReorderRooms: (orderedRoomIds: string[]) => void | Promise<void>;
};

export const useRoomReorder = ({ rooms, onReorderRooms }: UseRoomReorderParams) => {
  const [roomDrag, setRoomDrag] = useState<RoomDragState | null>(null);

  const onReorderDrop = (toIndex: number) => {
    if (!roomDrag) return;
    setRoomDrag(null);
    if (roomDrag.fromIndex === toIndex) return;
    onReorderRooms(
      moveItem(
        rooms.map((r) => r.id),
        roomDrag.fromIndex,
        toIndex
      )
    );
  };

  return {
    roomDrag,
    onReorderStart: (index: number) => setRoomDrag({ fromIndex: index, overIndex: index }),
    onReorderOver: (index: number) => setRoomDrag((d) => (d && d.overIndex !== index ? { ...d, overIndex: index } : d)),
    onReorderDrop,
    onReorderEnd: () => setRoomDrag(null),
  };
};
