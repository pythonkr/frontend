import { SessionSchema } from "@frontend/common/schemas/backendAPI";
import { ceilToGranularity, floorToGranularity, minutesToGridLine } from "@frontend/common/utils";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Alert, Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DateTime } from "luxon";
import { FC, Fragment, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

const GRANULARITY_MIN = 5; // 세션 배치 정밀도(분)
const HOUR_FLOOR_MIN = 60; // 하루 시작/끝을 정시 경계로 맞춤
const PX_PER_SLOT = 9; // GRANULARITY_MIN당 높이 → 1시간 ≈ 108px
const TIME_COL_PX = 52;
const ROOM_MIN_PX = 132;
const HEADER_PX = 44;
const DAY_QUERY_KEY = "day";

type Placement = {
  key: string;
  session: SessionSchema;
  room: string;
  start: DateTime;
  end: DateTime;
  dayKey: string;
};

type DayConfig = {
  dayKey: string;
  label: string;
  rooms: string[];
  dayStart: DateTime;
  dayEnd: DateTime;
  lineCount: number;
  placements: Placement[];
  overlapKeys: Set<string>;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const intersects = (a: Placement, b: Placement): boolean => a.start < b.end && b.start < a.end;

/** 같은 날 안에서 시간이 겹치는(=동시에 들을 수 없는) placement key 집합. O(n^2) — my-schedule(소량)에만 사용. */
const detectOverlapKeys = (placements: Placement[]): Set<string> => {
  const result = new Set<string>();
  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      if (intersects(placements[i], placements[j])) {
        result.add(placements[i].key);
        result.add(placements[j].key);
      }
    }
  }
  return result;
};

/** 세션 → room_schedule 단위 placement로 평탄화. 유효하지 않은(역전/파싱 실패) 일정은 제외합니다. */
const buildPlacements = (sessions: SessionSchema[]): Placement[] =>
  sessions.flatMap((session) =>
    session.room_schedules
      .map((schedule): Placement | null => {
        const start = DateTime.fromISO(schedule.start_at);
        const end = DateTime.fromISO(schedule.end_at);
        const dayKey = start.toISODate();
        if (!start.isValid || !end.isValid || end <= start || !dayKey) return null;
        return { key: `${session.id}:${schedule.id}`, session, room: schedule.room_name, start, end, dayKey };
      })
      .filter((placement): placement is Placement => placement !== null)
  );

/** placement를 날짜별로 묶어 config-as-data(컬럼=강의실, 시간 눈금)로 선언합니다. */
const buildDayConfigs = (placements: Placement[], locale: string): DayConfig[] => {
  const byDay = new Map<string, Placement[]>();
  for (const placement of placements) {
    const list = byDay.get(placement.dayKey) ?? [];
    list.push(placement);
    byDay.set(placement.dayKey, list);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([dayKey, dayPlacements]) => {
      const rooms = [...new Set(dayPlacements.map((p) => p.room))].sort((a, b) => a.localeCompare(b));
      const minStart = dayPlacements.reduce((min, p) => (p.start < min ? p.start : min), dayPlacements[0].start);
      const maxEnd = dayPlacements.reduce((max, p) => (p.end > max ? p.end : max), dayPlacements[0].end);
      const dayStart = floorToGranularity(minStart, HOUR_FLOOR_MIN);
      const dayEnd = ceilToGranularity(maxEnd, HOUR_FLOOR_MIN);
      const lineCount = minutesToGridLine(dayEnd, dayStart, GRANULARITY_MIN);
      const label = DateTime.fromISO(dayKey).setLocale(locale).toLocaleString({ weekday: "long", month: "long", day: "numeric" });
      return { dayKey, label, rooms, dayStart, dayEnd, lineCount, placements: dayPlacements, overlapKeys: detectOverlapKeys(dayPlacements) };
    });
};

type HourMark = { line: number; text: string };

const buildHourMarks = (day: DayConfig): HourMark[] => {
  const marks: HourMark[] = [];
  let time = day.dayStart;
  while (time <= day.dayEnd) {
    marks.push({ line: minutesToGridLine(time, day.dayStart, GRANULARITY_MIN), text: time.toFormat("HH:mm") });
    time = time.plus({ minutes: HOUR_FLOOR_MIN });
  }
  return marks;
};

const SessionCard: FC<{ placement: Placement; overlap: boolean; getSessionUrl?: (session: SessionSchema) => string }> = ({
  placement,
  overlap,
  getSessionUrl,
}) => {
  const { session, start, end } = placement;
  const timeRange = `${start.toFormat("HH:mm")}–${end.toFormat("HH:mm")}`;
  const url = getSessionUrl?.(session);

  const body = (
    <Box
      sx={(theme) => ({
        height: "100%",
        overflow: "hidden",
        borderRadius: "0.5rem",
        padding: "0.25rem 0.4rem",
        border: `1px solid ${overlap ? theme.palette.warning.main : theme.palette.primary.light}`,
        backgroundColor: overlap ? `${theme.palette.warning.light}26` : `${theme.palette.primary.light}1A`,
        cursor: url ? "pointer" : "default",
        transition: "background-color 0.2s ease",
        "&:hover": url ? { backgroundColor: `${theme.palette.primary.light}3A` } : undefined,
      })}
    >
      <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
        {overlap && <WarningAmberRoundedIcon color="warning" sx={{ fontSize: "0.85rem", flexShrink: 0 }} />}
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          children={session.title.replace("\\n", " ")}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.62rem", lineHeight: 1.2 }} children={timeRange} />
      {session.speakers.length > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontSize: "0.62rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          children={session.speakers.map((speaker) => speaker.nickname).join(", ")}
        />
      )}
    </Box>
  );

  return url ? <Link to={url} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }} children={body} /> : body;
};

export const MyTimetableGrid: FC<{ mySessions: SessionSchema[]; getSessionUrl?: (session: SessionSchema) => string }> = ({
  mySessions,
  getSessionUrl,
}) => {
  const { language } = useAppContext();
  const isKo = language === "ko";
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down("sm"));
  const roomMinPx = isNarrow ? 104 : ROOM_MIN_PX;
  const [searchParams, setSearchParams] = useSearchParams();

  const placements = useMemo(() => buildPlacements(mySessions), [mySessions]);
  const dayConfigs = useMemo(() => buildDayConfigs(placements, language), [placements, language]);

  const dayParam = searchParams.get(DAY_QUERY_KEY);
  const activeDay = dayConfigs.find((day) => day.dayKey === dayParam) ?? dayConfigs[0];

  if (dayConfigs.length === 0 || !activeDay) {
    return (
      <Stack spacing={1.5} alignItems="center" sx={{ py: 8 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }} children={isKo ? "아직 담은 세션이 없어요" : "No sessions saved yet"} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
          children={isKo ? "세션 목록에서 ‘추가’를 눌러 시간표를 채워보세요." : "Tap “Add” on the session list to build your schedule."}
        />
      </Stack>
    );
  }

  const selectDay = (dayKey: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DAY_QUERY_KEY, dayKey);
        return next;
      },
      { replace: true }
    );

  const hourMarks = buildHourMarks(activeDay);
  const toRow = (line: number) => line + 1; // 헤더 행(row 1) 보정
  const gridHeight = HEADER_PX + (activeDay.lineCount - 1) * PX_PER_SLOT;

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
        {dayConfigs.map((day, index) => (
          <Button
            key={day.dayKey}
            variant={day.dayKey === activeDay.dayKey ? "contained" : "text"}
            onClick={() => selectDay(day.dayKey)}
            sx={{ flexDirection: "column", px: 3, py: 1, lineHeight: 1.2 }}
          >
            <Typography component="span" sx={{ fontWeight: 700 }} children={`Day ${index + 1}`} />
            <Typography component="span" variant="caption" children={day.label} />
          </Button>
        ))}
      </Stack>

      {activeDay.overlapKeys.size > 0 && (
        <Alert severity="warning" variant="outlined">
          {isKo ? "시간이 겹치는 세션이 있어요. 노란색으로 표시했어요." : "Some sessions overlap in time (highlighted in yellow)."}
        </Alert>
      )}

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `${TIME_COL_PX}px repeat(${activeDay.rooms.length}, minmax(${roomMinPx}px, 1fr))`,
            gridTemplateRows: `${HEADER_PX}px repeat(${activeDay.lineCount - 1}, ${PX_PER_SLOT}px)`,
            minWidth: `${TIME_COL_PX + activeDay.rooms.length * roomMinPx}px`,
            height: `${gridHeight}px`,
          }}
        >
          {/* 시간 눈금선 + 라벨 (절대 배치) */}
          {hourMarks.map(({ line, text }) => {
            const top = HEADER_PX + (line - 1) * PX_PER_SLOT;
            return (
              <Fragment key={text}>
                <Box
                  sx={(theme) => ({
                    position: "absolute",
                    left: `${TIME_COL_PX}px`,
                    right: 0,
                    top: `${top}px`,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    zIndex: 0,
                  })}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    width: `${TIME_COL_PX}px`,
                    top: `${top}px`,
                    transform: "translateY(-50%)",
                    pr: 0.75,
                    textAlign: "right",
                    zIndex: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem" }} children={text} />
                </Box>
              </Fragment>
            );
          })}

          {/* 강의실 헤더 */}
          {activeDay.rooms.map((room, index) => (
            <Box
              key={room}
              sx={(theme) => ({
                gridColumn: index + 2,
                gridRow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                zIndex: 3,
              })}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, whiteSpace: "pre-wrap", textAlign: "center", lineHeight: 1.15 }}
                children={room.replace("\\n", "\n")}
              />
            </Box>
          ))}

          {/* 세션 카드 */}
          {activeDay.placements.map((placement) => {
            const columnIndex = activeDay.rooms.indexOf(placement.room);
            if (columnIndex < 0) return null;
            // startLine은 마지막 라인 직전까지만 클램프 → endLine clamp 범위가 역전되지 않고 그리드 밖 implicit row가 생기지 않음
            const startLine = clamp(minutesToGridLine(placement.start, activeDay.dayStart, GRANULARITY_MIN), 1, activeDay.lineCount - 1);
            const endLine = clamp(minutesToGridLine(placement.end, activeDay.dayStart, GRANULARITY_MIN), startLine + 1, activeDay.lineCount);
            return (
              <Box
                key={placement.key}
                sx={{ gridColumn: columnIndex + 2, gridRow: `${toRow(startLine)} / ${toRow(endLine)}`, padding: "1px 2px", zIndex: 2, minWidth: 0 }}
              >
                <SessionCard placement={placement} overlap={activeDay.overlapKeys.has(placement.key)} getSessionUrl={getSessionUrl} />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
};
