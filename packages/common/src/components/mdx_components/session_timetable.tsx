import { Box, ButtonBase, Chip, Stack, styled, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import * as R from "remeda";
import BackendSessionAPISchemas from "../../schemas/backendSessionAPI";
import { ErrorFallback } from "../error_handler";
import { StyledDivider } from "./styled_divider";

const TD_HEIGHT = 2.5;
const TD_WIDTH = 12.5;
const TD_WIDTH_MOBILE = 20;

type TimeTableData = {
  [date: string]: {
    [time: string]: {
      [room: string]:
        | {
            rowSpan: number;
            session: BackendSessionAPISchemas.SessionSchema;
          }
        | undefined;
    };
  };
};

const getDateStr = (date: Date) => date.toISOString().split("T")[0];
const getDateStringToStr = (dateString: string) => dateString.split("T")[0];
const getDetailedDateStr = (date: Date) => date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
const getPaddedTime = (time: Date) => `${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}`;
const isSession: (session: BackendSessionAPISchemas.SessionSchema) => boolean = (session) =>
  session.call_for_presentation_schedules &&
  session.call_for_presentation_schedules.length > 0 &&
  session.call_for_presentation_schedules[0].presentation_type_name == "Session";

const getRooms = (data: BackendSessionAPISchemas.SessionSchema[]) => {
  const rooms: Set<string> = new Set();
  data.forEach((session) => {
    if (session.room_schedules.length == 0) return;
    session.room_schedules[0].room_name && rooms.add(session.room_schedules[0].room_name);
  });
  return Array.from(rooms);
};

const getConfStartEndTimePerDay: (data: BackendSessionAPISchemas.SessionSchema[]) => {
  [date: string]: { start: Date; end: Date };
} = (data) => {
  const result: { [date: string]: { start: Date; end: Date } } = {};

  data.forEach((session) => {
    if (session.call_for_presentation_schedules.length == 0) return;
    if (session.call_for_presentation_schedules[0].start_at && session.call_for_presentation_schedules[0].end_at) {
      const startTime = session.call_for_presentation_schedules[0].start_at;
      const endTime = session.call_for_presentation_schedules[0].end_at;
      const date = getDateStringToStr(startTime);
      const startTimeAsDate = new Date(startTime);
      const endTimeAsDate = new Date(endTime);

      if (!result[date]) {
        result[date] = { start: startTimeAsDate, end: endTimeAsDate };
      } else {
        if (startTimeAsDate < result[date].start) result[date].start = startTimeAsDate;
        if (endTimeAsDate > result[date].end) result[date].end = endTimeAsDate;
      }
    }
  });

  return result;
};

const getEveryTenMinutesArr = (start: Date, end: Date) => {
  let time = new Date(start);
  const arr = [];

  while (time <= end) {
    arr.push(time);
    time = new Date(new Date(time).setMinutes(time.getMinutes() + 10));
  }
  return arr;
};

const getTimeTableData: (data: BackendSessionAPISchemas.SessionSchema[]) => TimeTableData = (data) => {
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
    if (session.call_for_presentation_schedules.length == 0) return;
    if (session.call_for_presentation_schedules[0].start_at && session.call_for_presentation_schedules[0].end_at) {
      const start = session.call_for_presentation_schedules[0].start_at;
      const end = session.call_for_presentation_schedules[0].end_at;
      const startAsDate = new Date(start);
      const endAsDate = new Date(end);
      const durationMin = (endAsDate.getTime() - startAsDate.getTime()) / 1000 / 60;
      if (session.room_schedules.length == 0) return;
      timeTableData[getDateStringToStr(start)][getPaddedTime(startAsDate)][session.room_schedules[0].room_name] = {
        rowSpan: durationMin / 10,
        session,
      };
    }
  });

  return timeTableData;
};

const ErrorHeading = styled(Typography)({
  fontSize: "1em",
  fontWeight: 400,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
});

const SessionColumn: React.FC<{
  rowSpan: number;
  colSpan?: number;
  session: BackendSessionAPISchemas.SessionSchema;
}> = ({ rowSpan, colSpan, session }) => {
  const navigate = useNavigate();
  const clickable = R.isArray(session.speakers) && !R.isEmpty(session.speakers);
  // Firefox는 rowSpan된 td의 height를 계산할 때 rowSpan을 고려하지 않습니다. 따라서 직접 계산하여 height를 설정합니다.
  const sessionBoxHeight = `${TD_HEIGHT * rowSpan}rem`;
  const urlSafeTitle = session.title
    .replace(/ /g, "-")
    .replace(/([.])/g, "_")
    .replace(/(?![.0-9A-Za-zㄱ-ㅣ가-힣-])./g, "");
  return (
    <SessionTableCell rowSpan={rowSpan} colSpan={colSpan}>
      <SessionBox
        onClick={() => clickable && navigate(`/session/${session.id}#${urlSafeTitle}`)}
        className={clickable ? "clickable" : ""}
        sx={{ height: sessionBoxHeight, gap: 0.75, padding: "0.5rem" }}
      >
        <SessionTitle children={session.title} align="center" />
        <SessionSpeakerItemContainer direction="row">
          {session.speakers.map((speaker) => (
            <Chip key={speaker.id} size="small" label={speaker.nickname} />
          ))}
        </SessionSpeakerItemContainer>
        <SessionTimeTableItemTagContainer direction="row">
          {session.categories.map((category) => (
            <Chip key={category.id} variant="outlined" color="primary" size="small" label={category.name} />
          ))}
        </SessionTimeTableItemTagContainer>
      </SessionBox>
    </SessionTableCell>
  );
};

export const SessionTimeTable: React.FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <ErrorHeading>{"세션 시간표를 불러오는 중 입니다."}</ErrorHeading> }, () => {
    React.useEffect(() => window.scrollTo(0, 0), []);
    const [confDate, setConfDate] = React.useState("");

    const sessionRawData: BackendSessionAPISchemas.SessionSchema[] = [];
    const timeTableData = getTimeTableData(sessionRawData);
    const dates = Object.keys(timeTableData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const rooms: { [room: string]: number } = getRooms(sessionRawData).reduce((acc, room) => ({ ...acc, [room]: 0 }), {});
    const roomCount = Object.keys(rooms).length;
    const sortedRoomList = Object.keys(rooms).sort();

    const selectedDate = confDate || dates[0];
    const selectedTableData = timeTableData[selectedDate];

    let breakCount = 0;

    return (
      <Box sx={{ flexDirection: "column", width: "90%" }}>
        <WarningText children={"* 발표 목록은 발표자 사정에 따라 변동될 수 있습니다."} />
        <ColoredDivider />
        <SessionDateTabContainer>
          {dates.map((date, i) => {
            return (
              <ButtonBase key={date} onClick={() => setConfDate(date)} className={selectedDate === date ? "selected" : ""}>
                <SessionDateItemContainer direction="column">
                  <SessionDateTitle children={"Day " + (i + 1)} isSelected={selectedDate === date} />
                  <SessionDateSubTitle children={getDetailedDateStr(new Date(date))} isSelected={selectedDate === date} />
                </SessionDateItemContainer>
              </ButtonBase>
            );
          })}
        </SessionDateTabContainer>
        <ColoredDivider />
        <SessionTableContainer>
          <SessionTable>
            <TableHead>
              <SessionTableCell></SessionTableCell>
              {sortedRoomList.map((room) => {
                return (
                  <SessionTableCell key={room}>
                    <RoomTitle align="center">{room}</RoomTitle>
                  </SessionTableCell>
                );
              })}
            </TableHead>
            <SessionTableBody>
              <SessionTableRow>
                <SessionTableCell colSpan={roomCount + 1}></SessionTableCell>
              </SessionTableRow>
              {Object.entries(selectedTableData).map(([time, roomData], i, a) => {
                const hasSession = Object.values(rooms).some((c) => c >= 1) || Object.values(roomData).some((room) => room !== undefined);

                if (!hasSession) {
                  if (breakCount > 1) {
                    breakCount--;
                    return <SessionTableRow></SessionTableRow>;
                  } else {
                    // 지금부터 다음 세션이 존재하기 전까지의 휴식 시간을 계산합니다.
                    breakCount = 1;
                    for (let bi = i + 1; bi < a.length; bi++) {
                      if (Object.values(a[bi][1]).some((room) => room !== undefined)) break;
                      breakCount += 1;
                    }

                    // I really hate this, but I can't think of a better way to do this.
                    const height = (TD_HEIGHT * breakCount) / (breakCount <= 2 ? 1 : 3);
                    return (
                      <SessionTableRow>
                        <SessionTableCell
                          sx={{
                            height: `${height}rem`,
                            transform: `translateY(-${height / 2}rem)`,
                            border: "unset",
                          }}
                          align="center"
                        >
                          {time}
                        </SessionTableCell>
                        <SessionTableCell colSpan={roomCount + 1} rowSpan={breakCount} sx={{ height: `${height}rem` }}>
                          <Box
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {i !== a.length - 1 && <RestTitle>{"휴식"}</RestTitle>}
                          </Box>
                        </SessionTableCell>
                      </SessionTableRow>
                    );
                  }
                }

                // 만약 세션 타입이 아닌 발표가 존재하는 경우, 해당 줄에서는 colSpan이 roomCount인 column을 생성합니다.
                const nonSessionTypeData = Object.values(roomData).find((room) => room !== undefined && room.session && isSession(room.session));
                if (nonSessionTypeData) {
                  Object.keys(rooms).forEach((room) => (rooms[room] = nonSessionTypeData.rowSpan - 1));
                  return (
                    <SessionTableRow>
                      <SessionTableCell align="center">{time}</SessionTableCell>
                      <SessionColumn rowSpan={nonSessionTypeData.rowSpan} colSpan={roomCount} session={nonSessionTypeData.session} />
                    </SessionTableRow>
                  );
                }

                return (
                  <SessionTableRow>
                    <SessionTableCell align="center">{time}</SessionTableCell>
                    {sortedRoomList.map((room) => {
                      const roomDatum = roomData[room];
                      if (roomDatum === undefined) {
                        // 진행 중인 세션이 없는 경우, 해당 줄에서는 해당 room의 빈 column을 생성합니다.
                        if (rooms[room] <= 0) return <SessionTableCell></SessionTableCell>;
                        // 진행 중인 세션이 있는 경우, 이번 줄에서는 해당 세션들만큼 column을 생성하지 않습니다.
                        rooms[room] -= 1;
                        return null;
                      }
                      // 세션이 여러 줄에 걸쳐있는 경우, n-1 줄만큼 해당 room에 column을 생성하지 않도록 합니다.
                      if (roomDatum.rowSpan > 1) rooms[room] = roomDatum.rowSpan - 1;
                      return <SessionColumn key={room} rowSpan={roomDatum.rowSpan} session={roomDatum.session} />;
                    })}
                  </SessionTableRow>
                );
              })}
            </SessionTableBody>
          </SessionTable>
        </SessionTableContainer>
      </Box>
    );
  })
);

const WarningText = styled(Typography)({
  paddingLeft: "1rem",
  backgroundColor: "unset",
  textAlign: "right",
  margin: 0,
  padding: 0,
  border: "unset",
  fontSize: "1rem",
  lineHeight: 2,
  fontWeight: 300,
});

const SessionTimeTableItemTagContainer = styled(Stack)({
  alignItems: "center",
  justifyContent: "center",
});

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

const RestTitle = styled(Typography)({
  fontSize: "1em",
  fontWeight: 500,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
});

const SessionTitle = styled(Typography)({
  fontSize: "1.125em",
  fontWeight: 600,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
});

const RoomTitle = styled(Typography)({
  fontSize: "1.25em",
  fontWeight: 500,
});

const ColoredDivider = styled(StyledDivider)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const SessionSpeakerItemContainer = styled(Stack)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const SessionTable = styled(Table)({
  width: "100%",
  maxWidth: "60rem",
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
    transform: "unset",
    height: `${TD_HEIGHT / 2}rem`,
  },

  td: {
    height: `${TD_HEIGHT}rem`,
  },

  "td:first-child": {
    borderTop: "unset",
    transform: `translateY(-${TD_HEIGHT / 2}rem)`,
    width: "1.5rem",
  },

  "td:not(:first-child)": {
    width: `${TD_WIDTH}vw`,
    maxWidth: `${TD_WIDTH}vw`,
    borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
  },

  "@media only screen and (max-width: 810px)": {
    "td:not(:first-child)": {
      width: `${TD_WIDTH_MOBILE}vw`,
      maxWidth: `${TD_WIDTH_MOBILE}vw`,
    },
  },
});

const SessionTableBody = styled(TableBody)({
  gap: "1rem",
});

const SessionTableRow = styled(TableRow)({
  alignItems: "center",
  justifyContent: "center",
});

const SessionTableCell = styled(TableCell)({
  alignItems: "center",
  justifyContent: "center",
  border: "unset",
});

const SessionDateTabContainer = styled(Box)({
  display: "flex",
  gap: "2rem",
  justifyContent: "center",
  alignItems: "center",
  button: {
    backgroundColor: "unset",
    border: "unset",
    "&.selected": {
      color: `rgba(255, 255, 255, 1)`,
    },
  },
  "h1, h2, h3, h4, h5, h6": {
    margin: 0,
    color: "inherit",
  },
});

const SessionBox = styled(Box)(({ theme }) => ({
  height: "100%",
  // margin: "0.25rem",
  padding: "0.25rem",
  display: "flex",
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

const SessionTableContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  flex: 1,
});
