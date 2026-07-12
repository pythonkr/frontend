import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Chip, CircularProgress, Stack, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { DateTime } from "luxon";
import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isArray, isEmpty, isString } from "remeda";

import { CenteredPage } from "@frontend/common/components/centered_page";
import { ErrorFallback } from "@frontend/common/components/error_handler";
import { BackendAPI, Common } from "@frontend/common/hooks";
import { SessionSchema } from "@frontend/common/schemas/backendAPI";
import { getSessionDetailUrl } from "@frontend/common/utils";

import { StyledDivider } from "./styled_divider";

const TD_HEIGHT = 4; // 10분 한 줄의 기본 높이(rem). rowHeight prop으로 재정의 가능하다.
const TD_MIN_WIDTH = 11; // 각 발표 열의 최소 너비(rem). 이보다 좁아지면 좌우 스크롤로 전환된다.
const TIME_COL_WIDTH = "4.5rem"; // 좌측 시간 열(고정) 너비

type TimeTableData = {
  [date: string]: {
    [time: string]: {
      [room: string]:
        | {
            rowSpan: number;
            session: SessionSchema;
          }
        | undefined;
    };
  };
};

const getPaddedTime = (time: DateTime) => `${time.hour}:${time.minute.toString().padStart(2, "0")}`;

const getRooms = (data: SessionSchema[]) => {
  return Array.from(new Set<string>(data.reduce((acc, s) => [...acc, ...s.room_schedules.map((r) => r.room_name)], [] as string[])));
};

const getRoomOrders = (data: SessionSchema[]): { [room: string]: number } => {
  return data.reduce(
    (acc, s) => {
      s.room_schedules.forEach((r) => (acc[r.room_name] = r.room_order));
      return acc;
    },
    {} as { [room: string]: number }
  );
};

const getConfStartEndTimePerDay: (data: SessionSchema[]) => {
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

const getTimeTableData: (data: SessionSchema[]) => TimeTableData = (data) => {
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

const SessionColumn: FC<{
  rowSpan: number;
  colSpan?: number;
  session: SessionSchema;
  linkable?: boolean;
  selectedDate: string;
}> = ({ rowSpan, colSpan, session, linkable, selectedDate }) => {
  const sessionUrl = linkable ? getSessionDetailUrl(session) : undefined;
  const clickable = isArray(session.speakers) && !isEmpty(session.speakers) && !!sessionUrl;
  // Firefox는 rowSpan된 td의 height를 계산할 때 rowSpan을 고려하지 않습니다. 따라서 직접 계산하여 height를 설정합니다.
  const sessionBoxHeight = `calc(var(--td-h, ${TD_HEIGHT}rem) * ${rowSpan})`;
  return (
    <SessionTableCell rowSpan={rowSpan} colSpan={colSpan}>
      {clickable ? (
        <Link to={sessionUrl!} style={{ textDecoration: "none", display: "block" }} state={{ selectedDate: selectedDate }}>
          <SessionBox className="clickable" sx={{ height: sessionBoxHeight, gap: 0.75, padding: "0.5rem" }}>
            <SessionTitle children={session.title.replace("\\n", "\n")} align="center" />
            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: "100%", flexWrap: "wrap", gap: 0.5 }}>
              {session.speakers.map((speaker) => (
                <Chip key={speaker.id} size="small" label={speaker.nickname} />
              ))}
            </Stack>
          </SessionBox>
        </Link>
      ) : (
        <SessionBox sx={{ height: sessionBoxHeight, gap: 0.75, padding: "0.5rem" }}>
          <SessionTitle children={session.title.replace("\\n", "\n")} align="center" />
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

const BreakTime: FC<{ language: "ko" | "en"; duration: number }> = ({ language, duration }) => {
  const text = language === "ko" ? `휴식 (${duration}분)` : `Break Time (${duration}min.)`;
  return <Typography variant="subtitle2" fontWeight="500" children={text} />;
};

type SessionTimeTablePropType = {
  /** 세션을 조회할 이벤트 이름(name_ko 또는 name_en). 미지정 시 최신 활성 이벤트를 사용한다. */
  event?: string;
  /** 필터할 세션 유형. 단일 문자열 또는 배열(내부에서 콤마로 join). */
  types?: string | string[];
  /** 지정 시 시간표 상단에 '세션 발표 추가' 버튼을 표시하고 이 경로로 이동합니다. */
  proposeSessionUrl?: string;
  /** 10분 한 줄의 높이(rem). 기본값 4. 값을 키우면 시간표가 세로로 늘어난다. */
  rowHeight?: number;
};

/**
 * 발표 세션을 날짜·시간·장소(room) 기준의 표로 보여주는 타임테이블.
 * 날짜 선택 탭, 장소별 열, 휴식 시간 표시를 포함한다.
 * @example <Common__Components__Session__TimeTable types="talk" />
 */
export const SessionTimeTable: FC<SessionTimeTablePropType> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CenteredPage children={<CircularProgress />} /> }, ({ event, types, proposeSessionUrl, rowHeight = TD_HEIGHT }) => {
    const location = useLocation();
    const tdHeight = Number(rowHeight) || TD_HEIGHT; // MDX에서 문자열로 들어와도 안전하게 처리

    const [confDate, setConfDate] = useState<string>(location.state?.selectedDate ?? "");

    const { language, appType } = Common.useCommonContext();
    const linkable = appType === "main";
    const backendAPIClient = BackendAPI.useBackendClient();
    const params = { ...(event && { event }), ...(types && { types: isString(types) ? types : types.join(",") }) };
    const { data: sessionList } = BackendAPI.useSessionsQuery(backendAPIClient, params);

    const timeTableData = getTimeTableData(sessionList);
    const dates = Object.keys(timeTableData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const rooms: { [room: string]: number } = getRooms(sessionList).reduce((acc, room) => ({ ...acc, [room]: 0 }), {});
    const roomCount = Object.keys(rooms).length;
    const roomOrders = getRoomOrders(sessionList);
    const sortedRoomList = Object.keys(rooms).sort((a, b) => roomOrders[a] - roomOrders[b] || a.localeCompare(b));

    const [selectedDate, setSelectedDate] = useState<string>(location.state?.selectedDate ?? (confDate || dates[0]));
    const selectedTableData = timeTableData[selectedDate];

    let breakCount = 0;

    const warningMessage =
      language === "ko"
        ? "* 발표 목록은 발표자 사정에 따라 변동될 수 있습니다."
        : "* The list of sessions may change due to the speaker's circumstances.";

    const proposeSessionLabel = language === "ko" ? "세션 발표 추가" : "Propose a Session";

    return (
      <Stack direction="column" sx={{ width: "100%" }}>
        {proposeSessionUrl && (
          <Stack direction="row" justifyContent="flex-end" sx={{ width: "100%", mb: 1 }}>
            <Button component={Link} to={proposeSessionUrl} variant="outlined" color="primary" size="small" startIcon={<AddRoundedIcon />}>
              {proposeSessionLabel}
            </Button>
          </Stack>
        )}
        <Typography variant="body2" sx={{ width: "100%", textAlign: "right", my: 0.5, fontSize: "0.6rem" }} children={warningMessage} />
        <StyledDivider />
        {dates.length > 1 && (
          <>
            <Stack spacing={2} direction="row" justifyContent="center" alignItems="center">
              {dates.map((date, i) => {
                const dateStr = DateTime.fromISO(date).setLocale(language).toLocaleString({ weekday: "long", month: "long", day: "numeric" });
                return (
                  <Button
                    variant="text"
                    key={date}
                    onClick={() => {
                      setConfDate(date);
                      setSelectedDate(date);
                    }}
                    className={selectedDate === date ? "selected" : ""}
                  >
                    <SessionDateItemContainer direction="column">
                      <SessionDateTitle children={"Day " + (i + 1)} isSelected={selectedDate === date} />
                      <SessionDateSubTitle children={dateStr} isSelected={selectedDate === date} />
                    </SessionDateItemContainer>
                  </Button>
                );
              })}
            </Stack>
            <StyledDivider />
          </>
        )}
        <SessionTableContainer>
          <SessionTableScroll>
            <SessionTable
              sx={{
                "--td-h": `${tdHeight}rem`, // 10분당 높이(셀·세션 박스가 공유)
                minWidth: `calc(${TIME_COL_WIDTH} + ${roomCount} * ${TD_MIN_WIDTH}rem)`, // 이보다 좁아지면 좌우 스크롤
              }}
            >
              {/* table-layout: fixed 의 열 너비 정의 (시간 열 고정, 나머지 균등 분배) */}
              <colgroup>
                <col style={{ width: TIME_COL_WIDTH }} />
                {sortedRoomList.map((room) => (
                  <col key={room} />
                ))}
              </colgroup>
              <TableHead>
                <SessionTableCell></SessionTableCell>
                {sortedRoomList.map((room) => (
                  <SessionTableCell key={room} sx={{ padding: "1rem" }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ whiteSpace: "pre-wrap", overflowWrap: "break-word", fontWeight: 600, textAlign: "center" }}
                      children={room.replace("\\n", "\n")}
                    />
                  </SessionTableCell>
                ))}
              </TableHead>
              <SessionTableBody>
                <SessionTableRow children={<SessionTableCell colSpan={roomCount + 1} />} /> {/* dummy first row */}
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

                      // I really hate this, but I can't think of a better way to do this.
                      const height = (tdHeight * breakCount) / (breakCount <= 2 ? 1 : 3);
                      const isLast = i === a.length - 1;
                      const duration = breakCount * 10; // 10 minutes per row
                      return (
                        <SessionTableRow>
                          <SessionTableCell rowSpan={breakCount} sx={{ height: `${height}rem !important`, border: "unset" }} align="center">
                            <TimeLabel>{time}</TimeLabel>
                          </SessionTableCell>
                          <SessionTableCell
                            colSpan={roomCount}
                            rowSpan={breakCount}
                            sx={{
                              height: `${height}rem !important`,
                              borderTop: (t) => `1px solid ${t.palette.divider} !important`,
                              borderBottom: isLast ? "transparent" : (t) => `1px solid ${t.palette.divider} !important`,
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
                        <SessionTableCell align="center">
                          <TimeLabel>{time}</TimeLabel>
                        </SessionTableCell>
                        <SessionColumn
                          rowSpan={firstSessionInfo.rowSpan}
                          colSpan={roomCount}
                          session={firstSessionInfo.session}
                          linkable={linkable}
                          selectedDate={selectedDate}
                        />
                      </SessionTableRow>
                    );
                  }

                  return (
                    <SessionTableRow>
                      <SessionTableCell align="center" children={time} />
                      {sortedRoomList.map((room) => {
                        const roomDatum = roomData[room];
                        if (roomDatum === undefined) {
                          // 진행 중인 세션이 없는 경우, 해당 줄에서는 해당 room의 빈 column을 생성합니다.
                          if (rooms[room] <= 0) return <SessionTableCell />;
                          // 진행 중인 세션이 있는 경우, 이번 줄에서는 해당 세션들만큼 column을 생성하지 않습니다.
                          rooms[room] -= 1;
                          return null;
                        }
                        // 세션이 여러 줄에 걸쳐있는 경우, n-1 줄만큼 해당 room에 column을 생성하지 않도록 합니다.
                        if (roomDatum.rowSpan > 1) rooms[room] = roomDatum.rowSpan - 1;
                        return (
                          <SessionColumn
                            key={room}
                            rowSpan={roomDatum.rowSpan}
                            session={roomDatum.session}
                            linkable={linkable}
                            selectedDate={selectedDate}
                          />
                        );
                      })}
                    </SessionTableRow>
                  );
                })}
              </SessionTableBody>
            </SessionTable>
          </SessionTableScroll>
        </SessionTableContainer>
      </Stack>
    );
  })
);

const SessionDateItemContainer = styled(Stack)({
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem 3rem",
});

const SessionDateTitle = styled(Typography)<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  fontSize: "2.25em",
  fontWeight: 600,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
  color: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
}));

const SessionDateSubTitle = styled(Typography)<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  fontSize: "1em",
  fontWeight: 600,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
  color: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
}));

const SessionTitle = styled(Typography)({
  fontSize: "1.125em",
  fontWeight: 600,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word", // 고정 너비 열에서 긴 제목 줄바꿈
});

// 시간 라벨을 자기 높이의 절반만큼 올려 셀 상단(격자선)에 맞춘다
const TimeLabel = styled("span")({
  display: "inline-block",
  transform: "translateY(-50%)",
});

const SessionTableScroll = styled("div")({
  width: "100%",
  overflowX: "auto",
  overscrollBehaviorX: "none", // 좌우 스크롤이 뒤로가기 등 상위로 전파되지 않도록
  WebkitOverflowScrolling: "touch",
});

const SessionTable = styled(Table)(({ theme }) => ({
  width: "100%",
  maxWidth: "60rem",
  marginInline: "auto",
  tableLayout: "fixed", // 모든 발표 열을 동일 너비로 (colSpan은 열 수에 비례해 확장)
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  flex: 1,

  "*": {
    textAlign: "center",
  },

  "tbody > th": {
    border: "unset",
  },

  "tr:first-child td": {
    borderTop: "unset",
    height: `calc(var(--td-h, ${TD_HEIGHT}rem) / 2)`,
  },

  td: {
    height: `var(--td-h, ${TD_HEIGHT}rem)`,
  },

  // 좌측 시간 열: 가로 스크롤 시 고정. 배경은 변형 없이 셀 박스를 그대로 덮어 이웃 행과 빈틈없이 이어진다.
  "th:first-child, td:first-child": {
    position: "sticky",
    left: 0,
    zIndex: 2,
    verticalAlign: "top",
    backgroundColor: theme.palette.background.default,
  },

  "td:first-child": {
    borderTop: "unset",
  },

  "td:not(:first-child)": {
    borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
  },
}));

const SessionTableBody = styled(TableBody)({
  gap: "1rem",
});

const SessionTableRow = styled(TableRow)({
  alignItems: "center",
  justifyContent: "center",
});

const SessionTableCell = styled(TableCell)({
  padding: "0 0.5rem",
  alignItems: "center",
  justifyContent: "center",
  border: "unset",
});

const SessionBox = styled(Stack)(({ theme }) => ({
  height: "100%",
  padding: "0.25rem",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  border: `1px solid color-mix(in srgb, ${theme.palette.primary.light} 50%, transparent 50%)`,
  borderRadius: "0.5rem",

  backgroundColor: `${theme.palette.primary.light}1A`,
  transition: "all 0.25s ease",
  gap: "0.5rem",

  "&.clickable": {
    cursor: "pointer",
  },

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

const SessionTableContainer = styled(Stack)({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  flex: 1,
});
