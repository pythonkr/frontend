import { Button, Chip, CircularProgress, Stack, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { DateTime } from "luxon";
import * as React from "react";
import { Link } from "react-router-dom";
import * as R from "remeda";

import Hooks from "../../hooks";
import BackendAPISchemas from "../../schemas/backendAPI";
import { CenteredPage } from "../centered_page";
import { ErrorFallback } from "../error_handler";
import { StyledDivider } from "./styled_divider";

const TD_HEIGHT = 4;
const TD_WIDTH = 15;
const TD_WIDTH_MOBILE = 20;

export type SessionTimeTableStyles = {
  layout?: {
    tdHeight?: number;
    tdWidth?: number;
    tdWidthMobile?: number;
  };
  dateItemContainer?: {
    padding?: string;
  };
  dateTitle?: {
    fontSize?: string;
    fontWeight?: number | string;
    lineHeight?: number | string;
  };
  dateSubTitle?: {
    fontSize?: string;
    fontWeight?: number | string;
    lineHeight?: number | string;
  };
  sessionTitle?: {
    fontSize?: string;
    fontWeight?: number | string;
    lineHeight?: number | string;
  };
  sessionBox?: {
    padding?: string;
    borderRadius?: string;
    gap?: string;
  };
  tableCell?: {
    padding?: string;
  };
  tableContainer?: {
    gap?: string;
  };
};

type TimeTableData = {
  [date: string]: {
    [time: string]: {
      [room: string]:
        | {
            rowSpan: number;
            session: BackendAPISchemas.SessionSchema;
          }
        | undefined;
    };
  };
};

const getPaddedTime = (time: DateTime) => `${time.hour}:${time.minute.toString().padStart(2, "0")}`;

const getRooms = (data: BackendAPISchemas.SessionSchema[]) => {
  return Array.from(new Set<string>(data.reduce((acc, s) => [...acc, ...s.room_schedules.map((r) => r.room_name)], [] as string[])));
};

const getConfStartEndTimePerDay: (data: BackendAPISchemas.SessionSchema[]) => {
  [date: string]: { start: DateTime; end: DateTime };
} = (data) => {
  const startTimes = data.reduce((acc, s) => [...acc, ...s.room_schedules.map((r) => DateTime.fromISO(r.start_at))], [] as DateTime[]);
  const endTimes = data.reduce((acc, s) => [...acc, ...s.room_schedules.map((r) => DateTime.fromISO(r.end_at))], [] as DateTime[]);
  const allTimes = [...startTimes, ...endTimes];

  const timesPerDay = allTimes.reduce(
    (acc, time) => {
      const dateStr = time.toISODate();
      if (!dateStr) throw new Error("Invalid date string");

      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(time);
      return acc;
    },
    {} as { [date: string]: DateTime[] }
  );
  return Object.entries(timesPerDay).reduce(
    (acc, [date, times]) => {
      const start = times.reduce((min, t) => (t < min ? t : min), times[0]);
      const end = times.reduce((max, t) => (t > max ? t : max), times[0]);
      acc[date] = { start, end };
      return acc;
    },
    {} as { [date: string]: { start: DateTime; end: DateTime } }
  );
};

const getEveryTenMinutesArr = (start: DateTime, end: DateTime) => {
  let time = start;
  const arr = [];

  while (time <= end) {
    arr.push(time);
    time = time.plus({ minutes: 10 });
  }
  return arr;
};

const getTimeTableData: (data: BackendAPISchemas.SessionSchema[]) => TimeTableData = (data) => {
  // Initialize timeTableData structure
  const timeTableData: TimeTableData = Object.entries(getConfStartEndTimePerDay(data)).reduce(
    (acc, [date, { start, end }]) => ({
      ...acc,
      [date]: getEveryTenMinutesArr(start, end).reduce((acc, time) => ({ ...acc, [getPaddedTime(time)]: {} }), {}),
    }),
    {}
  );

  // Fill timeTableData with session data
  data.forEach((session) => {
    session.room_schedules.forEach((schedule) => {
      const start = DateTime.fromISO(schedule.start_at);
      const end = DateTime.fromISO(schedule.end_at);

      if (!start.isValid || !end.isValid) {
        console.warn(`Invalid start or end time for session ${session.id} in room ${schedule.room_name}`);
        return;
      }

      const durationMin = (end.toMillis() - start.toMillis()) / 1000 / 60;
      timeTableData[start.toISODate()][getPaddedTime(start)][schedule.room_name] = { rowSpan: durationMin / 10, session };
    });
  });

  return timeTableData;
};

const SessionColumn: React.FC<{
  rowSpan: number;
  colSpan?: number;
  session: BackendAPISchemas.SessionSchema;
  getSessionUrl?: (session: BackendAPISchemas.SessionSchema) => string;
  styles?: SessionTimeTableStyles;
}> = ({ rowSpan, colSpan, session, getSessionUrl, styles }) => {
  const clickable = R.isArray(session.speakers) && !R.isEmpty(session.speakers);
  // Firefox는 rowSpan된 td의 height를 계산할 때 rowSpan을 고려하지 않습니다. 따라서 직접 계산하여 height를 설정합니다.
  const tdHeight = styles?.layout?.tdHeight ?? TD_HEIGHT;
  const sessionBoxHeight = `${tdHeight * rowSpan}rem`;
  const urlSafeTitle = session.title
    .replace(/ /g, "-")
    .replace(/([.])/g, "_")
    .replace(/(?![.0-9A-Za-zㄱ-ㅣ가-힣-])./g, "");
  const sessionUrl = getSessionUrl ? getSessionUrl(session) : `/presentations/${session.id}#${urlSafeTitle}`;
  return (
    <SessionTableCell tableStyles={styles} rowSpan={rowSpan} colSpan={colSpan}>
      {clickable ? (
        <Link to={sessionUrl} style={{ textDecoration: "none", display: "block" }}>
          <SessionBox
            tableStyles={styles}
            className="clickable"
            sx={{ height: sessionBoxHeight, gap: 0.75, padding: "0.5rem" }}
          >
            <SessionTitle tableStyles={styles} children={session.title.replace("\\n", "\n")} align="center" />
            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: "100%", flexWrap: "wrap", gap: 0.5 }}>
              {session.speakers.map((speaker) => (
                <Chip key={speaker.id} size="small" label={speaker.nickname} />
              ))}
            </Stack>
          </SessionBox>
        </Link>
      ) : (
        <SessionBox
          tableStyles={styles}
          sx={{ height: sessionBoxHeight, gap: 0.75, padding: "0.5rem" }}
        >
          <SessionTitle tableStyles={styles} children={session.title.replace("\\n", "\n")} align="center" />
          <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: "100%", flexWrap: "wrap", gap: 0.5 }}>
            {session.speakers.map((speaker) => (
              <Chip key={speaker.id} size="small" label={speaker.nickname} />
            ))}
          </Stack>
        </SessionBox>
      )}
    </SessionTableCell>
  );
};

const BreakTime: React.FC<{ language: "ko" | "en"; duration: number }> = ({ language, duration }) => {
  const text = language === "ko" ? `휴식 (${duration}분)` : `Break Time (${duration}min.)`;
  return <Typography variant="subtitle2" fontWeight="500" children={text} />;
};

type SessionTimeTablePropType = {
  event?: string;
  types?: string | string[];
  getSessionUrl?: (session: BackendAPISchemas.SessionSchema) => string;
  styles?: SessionTimeTableStyles;
};

export const SessionTimeTable: React.FC<SessionTimeTablePropType> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CenteredPage children={<CircularProgress />} /> }, ({ event, types, getSessionUrl, styles }) => {
    const [confDate, setConfDate] = React.useState("");

    const { language } = Hooks.Common.useCommonContext();
    const backendAPIClient = Hooks.BackendAPI.useBackendClient();
    const params = { ...(event && { event }), ...(types && { types: R.isString(types) ? types : types.join(",") }) };
    const { data: sessionList } = Hooks.BackendAPI.useSessionsQuery(backendAPIClient, params);

    const timeTableData = getTimeTableData(sessionList);
    const dates = Object.keys(timeTableData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const rooms: { [room: string]: number } = getRooms(sessionList).reduce((acc, room) => ({ ...acc, [room]: 0 }), {});
    const roomCount = Object.keys(rooms).length;
    const sortedRoomList = Object.keys(rooms).sort();

    const selectedDate = confDate || dates[0];
    const selectedTableData = timeTableData[selectedDate];

    let breakCount = 0;

    const warningMessage =
      language === "ko"
        ? "* 발표 목록은 발표자 사정에 따라 변동될 수 있습니다."
        : "* The list of sessions may change due to the speaker's circumstances.";

    return (
      <Stack direction="column" sx={{ width: "100%" }}>
        <Typography variant="body2" sx={{ width: "100%", textAlign: "right", my: 0.5, fontSize: "0.6rem" }} children={warningMessage} />
        <StyledDivider />
        <Stack spacing={2} direction="row" justifyContent="center" alignItems="center">
          {dates.map((date, i) => {
            const dateStr = DateTime.fromISO(date).setLocale(language).toLocaleString({ weekday: "long", month: "long", day: "numeric" });
            return (
              <Button variant="text" key={date} onClick={() => setConfDate(date)} className={selectedDate === date ? "selected" : ""}>
                <SessionDateItemContainer tableStyles={styles} direction="column">
                  <SessionDateTitle tableStyles={styles} children={"Day " + (i + 1)} isSelected={selectedDate === date} />
                  <SessionDateSubTitle tableStyles={styles} children={dateStr} isSelected={selectedDate === date} />
                </SessionDateItemContainer>
              </Button>
            );
          })}
        </Stack>
        <StyledDivider />
        <SessionTableContainer tableStyles={styles}>
          <SessionTable tableStyles={styles}>
            <TableHead>
              <SessionTableCell tableStyles={styles}></SessionTableCell>
              {sortedRoomList.map((room) => (
                <SessionTableCell tableStyles={styles} key={room} sx={{ padding: "1rem" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ whiteSpace: "pre-wrap", fontWeight: 600, textAlign: "center" }}
                    children={room.replace("\\n", "\n")}
                  />
                </SessionTableCell>
              ))}
            </TableHead>
            <SessionTableBody>
              <SessionTableRow children={<SessionTableCell tableStyles={styles} colSpan={roomCount + 1} />} /> {/* dummy first row */}
              {Object.entries(selectedTableData).map(([time, roomData], i, a) => {
                const hasSession = Object.values(rooms).some((c) => c >= 1) || Object.values(roomData).some((room) => room !== undefined);

                if (!hasSession) {
                  if (breakCount > 1) {
                    breakCount--;
                    return <SessionTableRow />;
                  } else {
                    // 지금부터 다음 세션이 존재하기 전까지의 휴식 시간을 계산합니다.
                    breakCount = 1;
                    for (let bi = i + 1; bi < a.length; bi++) {
                      if (Object.values(a[bi][1]).some((room) => room !== undefined)) break;
                      breakCount += 1;
                    }

                    const tdHeight = styles?.layout?.tdHeight ?? TD_HEIGHT;
                    // I really hate this, but I can't think of a better way to do this.
                    const height = (tdHeight * breakCount) / (breakCount <= 2 ? 1 : 3);
                    const isLast = i === a.length - 1;
                    const duration = breakCount * 10; // 10 minutes per row
                    return (
                      <SessionTableRow>
                        <SessionTableCell
                          tableStyles={styles}
                          sx={{
                            height: `${height}rem !important`,
                            transform: `translateY(-${height / 2}rem) !important`,
                            border: "unset",
                          }}
                          align="center"
                        >
                          {time}
                        </SessionTableCell>
                        <SessionTableCell
                          tableStyles={styles}
                          colSpan={roomCount + 1}
                          rowSpan={breakCount}
                          sx={{
                            height: `${height}rem !important`,
                            borderTop: (t) => `1px solid ${t.palette.divider} !important`,
                            borderBottom: isLast ? "transparernt" : (t) => `1px solid ${t.palette.divider} !important`,
                          }}
                        >
                          <Stack direction="column" justifyContent="center" alignItems="center">
                            {!isLast && <BreakTime language={language} duration={duration} />}
                          </Stack>
                        </SessionTableCell>
                      </SessionTableRow>
                    );
                  }
                }

                // 만약 동일 세션이 모든 방에서 진행되는 경우, 해당 줄에서는 colSpan이 roomCount인 column을 생성합니다.
                const sessionIds = new Set(Object.values(roomData).map((room) => room?.session.id));
                const firstSessionInfo = Object.values(roomData)[0];
                if (sessionIds.size === 1 && firstSessionInfo !== undefined) {
                  Object.keys(rooms).forEach((room) => (rooms[room] = firstSessionInfo.rowSpan - 1));
                  return (
                    <SessionTableRow>
                      <SessionTableCell tableStyles={styles} align="center" children={time} />
                      <SessionColumn rowSpan={firstSessionInfo.rowSpan} colSpan={roomCount} session={firstSessionInfo.session} getSessionUrl={getSessionUrl} styles={styles} />
                    </SessionTableRow>
                  );
                }

                return (
                  <SessionTableRow>
                    <SessionTableCell tableStyles={styles} align="center" children={time} />
                    {sortedRoomList.map((room) => {
                      const roomDatum = roomData[room];
                      if (roomDatum === undefined) {
                        // 진행 중인 세션이 없는 경우, 해당 줄에서는 해당 room의 빈 column을 생성합니다.
                        if (rooms[room] <= 0) return <SessionTableCell tableStyles={styles} />;
                        // 진행 중인 세션이 있는 경우, 이번 줄에서는 해당 세션들만큼 column을 생성하지 않습니다.
                        rooms[room] -= 1;
                        return null;
                      }
                      // 세션이 여러 줄에 걸쳐있는 경우, n-1 줄만큼 해당 room에 column을 생성하지 않도록 합니다.
                      if (roomDatum.rowSpan > 1) rooms[room] = roomDatum.rowSpan - 1;
                      return <SessionColumn key={room} rowSpan={roomDatum.rowSpan} session={roomDatum.session} getSessionUrl={getSessionUrl} styles={styles} />;
                    })}
                  </SessionTableRow>
                );
              })}
            </SessionTableBody>
          </SessionTable>
        </SessionTableContainer>
      </Stack>
    );
  })
);

const SessionDateItemContainer = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "tableStyles",
})<{ tableStyles?: SessionTimeTableStyles }>(({ tableStyles }) => ({
  alignItems: "center",
  justifyContent: "center",
  padding: tableStyles?.dateItemContainer?.padding ?? "1rem 3rem",
}));

const SessionDateTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "tableStyles",
})<{ isSelected: boolean; tableStyles?: SessionTimeTableStyles }>(({ theme, isSelected, tableStyles }) => ({
  fontSize: tableStyles?.dateTitle?.fontSize ?? "2.25em",
  fontWeight: tableStyles?.dateTitle?.fontWeight ?? 600,
  lineHeight: tableStyles?.dateTitle?.lineHeight ?? 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
  color: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
}));

const SessionDateSubTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "tableStyles",
})<{ isSelected: boolean; tableStyles?: SessionTimeTableStyles }>(({ theme, isSelected, tableStyles }) => ({
  fontSize: tableStyles?.dateSubTitle?.fontSize ?? "1em",
  fontWeight: tableStyles?.dateSubTitle?.fontWeight ?? 600,
  lineHeight: tableStyles?.dateSubTitle?.lineHeight ?? 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
  color: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
}));

const SessionTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "tableStyles",
})<{ tableStyles?: SessionTimeTableStyles }>(({ tableStyles }) => ({
  fontSize: tableStyles?.sessionTitle?.fontSize ?? "1.125em",
  fontWeight: tableStyles?.sessionTitle?.fontWeight ?? 600,
  lineHeight: tableStyles?.sessionTitle?.lineHeight ?? 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
}));

const SessionTable = styled(Table, {
  shouldForwardProp: (prop) => prop !== "tableStyles",
})<{ tableStyles?: SessionTimeTableStyles }>(({ tableStyles }) => {
  const tdHeight = tableStyles?.layout?.tdHeight ?? TD_HEIGHT;
  const tdWidth = tableStyles?.layout?.tdWidth ?? TD_WIDTH;
  const tdWidthMobile = tableStyles?.layout?.tdWidthMobile ?? TD_WIDTH_MOBILE;

  return {
    width: "100%",
    maxWidth: "60rem",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    flex: 1,

    "*": { textAlign: "center" },
    "tbody > th": { border: "unset" },

    "tr:first-child td": {
      borderTop: "unset",
      transform: "unset",
      height: `${tdHeight / 2}rem`,
    },

    td: { height: `${tdHeight}rem` },

    "td:first-child": {
      borderTop: "unset",
      transform: `translateY(-${tdHeight / 2}rem)`,
      width: "1.5rem",
    },

    "td:not(:first-child)": {
      width: `${tdWidth}vw`,
      maxWidth: `${tdWidth}vw`,
      borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
    },

    "@media only screen and (max-width: 810px)": {
      "td:not(:first-child)": {
        width: `${tdWidthMobile}vw`,
        maxWidth: `${tdWidthMobile}vw`,
      },
    },
  };
});

const SessionTableBody = styled(TableBody)({
  gap: "1rem",
});

const SessionTableRow = styled(TableRow)({
  alignItems: "center",
  justifyContent: "center",
});

const SessionTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "tableStyles",
})<{ tableStyles?: SessionTimeTableStyles }>(({ tableStyles }) => ({
  padding: tableStyles?.tableCell?.padding ?? "0 0.5rem",
  alignItems: "center",
  justifyContent: "center",
  border: "unset",
}));

const SessionBox = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "tableStyles",
})<{ tableStyles?: SessionTimeTableStyles }>(({ theme, tableStyles }) => ({
  height: "100%",
  padding: tableStyles?.sessionBox?.padding ?? "0.25rem",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  border: `1px solid color-mix(in srgb, ${theme.palette.primary.light} 50%, transparent 50%)`,
  borderRadius: tableStyles?.sessionBox?.borderRadius ?? "0.5rem",
  backgroundColor: `${theme.palette.primary.light}1A`,
  transition: "all 0.25s ease",
  gap: tableStyles?.sessionBox?.gap ?? "0.5rem",

  "&.clickable": { cursor: "pointer" },

  h6: {
    margin: 0,
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.8rem",
    transition: "all 0.25s ease",
  },

  kbd: {
    backgroundColor: "rgba(222, 240, 128, 0.5)",
    padding: "0.1rem 0.25rem",
    margin: "0.5rem 0.25rem 0 0.25rem",
    borderRadius: "0.25rem",
    color: "black",
    fontSize: "0.6rem",
    transition: "all 0.25s ease",
  },

  "&:hover": {
    borderColor: `${theme.palette.primary.dark}`,
    backgroundColor: `${theme.palette.primary.light}57`,

    h6: {
      color: "rgba(255, 255, 255, 1)",
      transition: "all 0.25s ease",
    },

    kbd: {
      backgroundColor: "rgba(222, 240, 128, 0.75)",
      transition: "all 0.25s ease",
    },
  },

  "@media only screen and (max-width: 810px)": {
    fontSize: "0.75rem",
    margin: "0.1rem",
    padding: "0.1rem",
    h6: {
      fontSize: "0.666rem",
    },
    kbd: {
      fontSize: "0.45rem",
      margin: "0.25rem 0.1rem",
    },
  },
}));

const SessionTableContainer = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "tableStyles",
})<{ tableStyles?: SessionTimeTableStyles }>(({ tableStyles }) => ({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: tableStyles?.tableContainer?.gap ?? "1rem",
  flex: 1,
}));
