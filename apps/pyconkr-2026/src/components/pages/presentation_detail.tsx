import { Box, Chip, CircularProgress, Divider, Stack, styled, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { DateTime } from "luxon";
import { CSSProperties, FC, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { isString } from "remeda";

import { PageLayout } from "@apps/pyconkr-2026/components/layout/PageLayout";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";
import PyCon2025Logo from "@frontend/common/assets/pyconkr2025_logo.png";
import { CenteredPage, ErrorFallback, FallbackImage, LinkHandler, MDXRenderer } from "@frontend/common/components";
import { useBackendClient, useSessionQuery } from "@frontend/common/hooks/useAPI";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";

const PROFILE_IMAGE_SIZE = "7rem";

type SimplifiedSpeakerSchema = {
  id: string;
  nickname: string;
  image: string | null;
  biography: string;
};

const CenteredLoadingPage: FC = () => (
  <CenteredPage>
    <CircularProgress />
  </CenteredPage>
);

const StyledPresentationImage = styled(FallbackImage)(({ theme }) => ({
  maxWidth: "75%",
  maxHeight: "480px",
  aspectRatio: "1",
  margin: theme.spacing(4, 0),
  borderRadius: "2rem",
  border: `1px solid ${theme.palette.divider}`,

  [theme.breakpoints.down("lg")]: {
    maxWidth: "100%",
  },
}));

const HeaderTableCell = styled(TableCell)({
  width: "1%",
  whiteSpace: "nowrap",
  textAlign: "center",
});

const DescriptionBox = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2, 4),

  [theme.breakpoints.down("lg")]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },

  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
    a: { color: theme.palette.primary.main },
  },
}));

const BiographyBox = styled(Box)(({ theme }) => ({
  width: "100%",

  "& .markdown-body": {
    width: "100%",
    p: { margin: theme.spacing(2, 0) },
    a: { color: theme.palette.primary.main },
  },
}));

const ProfileImageContainer = styled(Stack)({
  minWidth: PROFILE_IMAGE_SIZE,
  width: PROFILE_IMAGE_SIZE,
  maxWidth: PROFILE_IMAGE_SIZE,
  minHeight: PROFILE_IMAGE_SIZE,
  height: PROFILE_IMAGE_SIZE,
  maxHeight: PROFILE_IMAGE_SIZE,
  overflow: "hidden",
  borderRadius: "50%",
  border: `1px solid rgba(0, 0, 0, 0.12)`,
});

const ProfileImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const ProfileImage = styled(FallbackImage)(ProfileImageStyle);

const ProfileImageErrorFallback: FC = () => (
  <Stack alignItems="center" justifyContent="center" sx={{ ...ProfileImageStyle }}>
    <img src={PyCon2025Logo} alt="PyCon 2025 Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
  </Stack>
);

const PresentationSpeakerItem: FC<{ speaker: SimplifiedSpeakerSchema }> = ({ speaker }) => {
  const { baseUrl, mdxComponents } = useCommonContext();
  return (
    <>
      <Stack direction="row" spacing={4} sx={{ px: 2, py: 1 }}>
        <ProfileImageContainer sx={{ flexGrow: 0 }}>
          <ProfileImage alt="Speaker Image" src={speaker.image || ""} errorFallback={<ProfileImageErrorFallback />} />
        </ProfileImageContainer>
        <Stack alignItems="flex-start" justifyContent="center" sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="700" fontSize="2rem" children={speaker.nickname} />
          {speaker.biography ? (
            <BiographyBox children={<MDXRenderer text={speaker.biography || ""} format="md" baseUrl={baseUrl} mdxComponents={mdxComponents} />} />
          ) : (
            <>
              <br />
              <br />
            </>
          )}
        </Stack>
      </Stack>
      <Divider flexItem />
    </>
  );
};

const PresentationImageFallback: FC<{ language: "ko" | "en" }> = ({ language }) => {
  const message =
    language === "ko" ? (
      <>
        지금은 발표 사진을 불러올 수 없어요
        <br />
        잠시 후 다시 시도해 주세요.
      </>
    ) : (
      <>
        Unable to load the presentation image at the moment.
        <br />
        Please try again later.
      </>
    );

  return <Typography variant="caption" color="textSecondary" children={message} />;
};

export const PresentationDetailPage: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
    const { id } = useParams();
    const { language, setAppContext } = useAppContext();
    const { baseUrl, mdxComponents } = useCommonContext();
    const backendClient = useBackendClient();
    const { data: presentation } = useSessionQuery(backendClient, id || "");

    if (!id || !presentation) return <Navigate to="/" replace />;

    const descriptionFallback = language === "ko" ? "해당 발표의 설명은 준비 중이에요!" : "Description of the presentation is under preparation!";
    const categoriesStr = language === "ko" ? "카테고리" : "Categories";
    const speakersStr = language === "ko" ? "발표자" : "Speakers";
    const slideShowStr = language === "ko" ? "발표 슬라이드" : "Presentation Slideshow";
    const slideShowLinkStr = language === "ko" ? "링크" : "Link";

    const datetimeLabel = language === "ko" ? "발표 시각" : "Presentation Time";
    const datetimeSeparator = language === "ko" ? " ~ " : " - ";
    const minText = language === "ko" ? "분" : "min.";

    // 동일 시간별로 모아서 보여줌. 단, 방은 콤마(,)로 join해서 보여줌
    const scheduleMap: Record<string, string[]> = presentation.room_schedules.reduce(
      (acc, schedule) => {
        const startAt = DateTime.fromISO(schedule.start_at).setLocale(language);
        const endAt = DateTime.fromISO(schedule.end_at).setLocale(language);
        if (!startAt.isValid || !endAt.isValid) return acc; // 유효하지 않은 날짜는 무시

        const duration = Number.parseInt(endAt.diff(startAt, ["minutes"]).minutes.toString());
        const startAtFormatted = startAt.toLocaleString(DateTime.DATETIME_MED);
        // 동일 일자인 경우, 시간만 표시
        const endAtFormatted = endAt.toLocaleString(startAt.hasSame(endAt, "day") ? DateTime.TIME_SIMPLE : DateTime.DATETIME_MED);

        const key = `${startAtFormatted} ${datetimeSeparator} ${endAtFormatted} (${duration}${minText})`;
        const roomText = schedule.room_name.replace("\\n", "\n");
        if (!acc[key]) acc[key] = [roomText];
        else acc[key].push(roomText);
        return acc;
      },
      {} as Record<string, string[]>
    );

    useEffect(() => {
      setAppContext((prev) => ({
        ...prev,
        title: language === "ko" ? "발표 상세" : "Presentation Detail",
        shouldShowTitleBanner: true,
        shouldShowSponsorBanner: true,
      }));
    }, [language, presentation, setAppContext]);

    return (
      <PageLayout>
        <Typography
          variant="h4"
          sx={{ width: "100%", px: 2, pt: 0, pb: 1, fontWeight: "700", whiteSpace: "pre-wrap" }}
          children={presentation.title.replace("\\n", "\n")}
        />
        {presentation.summary && (
          <Typography
            variant="subtitle1"
            sx={{ width: "100%", px: 2, pt: 1, pb: 3, fontWeight: "600", whiteSpace: "pre-wrap" }}
            children={presentation.summary}
          />
        )}
        <Table sx={{ tableLayout: "auto" }}>
          <TableBody>
            {presentation.room_schedules.length
              ? Object.entries(scheduleMap).map(([datetime, rooms], index) => (
                  <TableRow key={datetime}>
                    {index === 0 && (
                      <HeaderTableCell rowSpan={Object.keys(scheduleMap).length}>
                        <Typography variant="subtitle1" fontWeight="bold" children={datetimeLabel} />
                      </HeaderTableCell>
                    )}
                    <TableCell>
                      <Stack direction="row" justifyContent="flex-start" alignItems="center" sx={{ width: "100%", flexWrap: "wrap", gap: 1 }}>
                        <Typography variant="subtitle1" children={datetime} />
                        <Stack direction="row" sx={{ flexGrow: 0, gap: 1, flexWrap: "wrap" }}>
                          {rooms.map((room, index) => (
                            <Chip key={index} sx={{ whiteSpace: "pre-wrap" }} label={room.replace("\\n", "\n")} />
                          ))}
                        </Stack>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {presentation.categories.length ? (
              <TableRow>
                <HeaderTableCell children={<Typography variant="subtitle1" fontWeight="bold" children={categoriesStr} />} />
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                    {presentation.categories.map((c) => (
                      <Chip key={c.id} size="small" variant="outlined" color="primary" label={c.name} />
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ) : null}
            {isString(presentation.public_slideshow_file) ? (
              <TableRow>
                <HeaderTableCell children={<Typography variant="subtitle1" fontWeight="bold" children={slideShowStr} />} />
                <TableCell sx={(theme) => ({ color: theme.palette.primary.main, textDecoration: "underline" })}>
                  <LinkHandler href={presentation.public_slideshow_file} children={slideShowLinkStr} />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        {presentation.image && (
          <StyledPresentationImage
            alt="Presentation Image"
            src={presentation.image}
            errorFallback={<PresentationImageFallback language={language} />}
          />
        )}
        <DescriptionBox>
          <MDXRenderer text={presentation.description || descriptionFallback} format="md" baseUrl={baseUrl} mdxComponents={mdxComponents} />
        </DescriptionBox>
        <Divider flexItem />
        {presentation.speakers && (
          <>
            <Typography variant="h5" fontWeight="bold" sx={{ width: "100%", px: 2, py: 4 }} children={speakersStr} />
            <Stack spacing={2} sx={{ width: "100%", px: 3 }}>
              {presentation.speakers.map((speaker) => (
                <PresentationSpeakerItem key={speaker.id} speaker={speaker as SimplifiedSpeakerSchema} />
              ))}
            </Stack>
          </>
        )}
      </PageLayout>
    );
  })
);
