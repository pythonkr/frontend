export const APP = "event";

export const TIMETABLE_PRESENTATION_DND_MIME = "application/x-presentation-id";
export const TIMETABLE_PALETTE_DROP_ATTR = "data-timetable-palette";
export const TIMETABLE_EVENT_STORAGE_KEY = "timetable.selectedEventId";

export const TIMETABLE_SLOT_MIN = 10; // 시간표 한 줄 = 10분
export const TIMETABLE_SLOT_MS = TIMETABLE_SLOT_MIN * 60 * 1000;

export const TIMETABLE_ROW_H = 20; // 10분 한 줄의 픽셀 높이
export const TIMETABLE_HOUR_ROWS = 6; // 60분 = 6줄
export const TIMETABLE_HALF_HOUR_ROWS = 3; // 30분 = 3줄 (시간 눈금 간격)
export const TIMETABLE_MIN_COL = 140;
export const TIMETABLE_GUTTER = 60;
export const TIMETABLE_HANDLE = 8;
export const TIMETABLE_DEFAULT_DURATION_MS = 30 * 60 * 1000;
export const TIMETABLE_DEFAULT_DAY_START_HOUR = 8;
export const TIMETABLE_DEFAULT_DAY_END_HOUR = 19;
export const TIMETABLE_SCROLL_EDGE_THRESHOLD = 56;
export const TIMETABLE_SCROLL_MAX_SPEED = 16;
export const TIMETABLE_DIM_OPACITY = 0.3;
