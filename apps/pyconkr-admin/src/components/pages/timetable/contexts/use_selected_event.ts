import { useState } from "react";

import { TIMETABLE_EVENT_STORAGE_KEY } from "../const";

const readStoredEventId = (): string | null => {
  try {
    return localStorage.getItem(TIMETABLE_EVENT_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const useSelectedEvent = () => {
  const [eventId, setEventIdState] = useState<string | null>(readStoredEventId);
  const setEventId = (value: string | number | null | undefined) => {
    const next = value != null ? String(value) : null;
    setEventIdState(next);
    try {
      if (next) localStorage.setItem(TIMETABLE_EVENT_STORAGE_KEY, next);
      else localStorage.removeItem(TIMETABLE_EVENT_STORAGE_KEY);
    } catch {
      /* localStorage 비가용 시 무시 */
    }
  };
  return { eventId, setEventId };
};
