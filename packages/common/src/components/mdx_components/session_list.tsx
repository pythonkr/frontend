import { Box, Button, Chip, CircularProgress, Stack, styled, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, ReactNode, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isArray, isEmpty, isString } from "remeda";

import { ErrorFallback } from "@frontend/common/components/error_handler";
import { FallbackImage } from "@frontend/common/components/fallback_image";
import { BackendAPI, Common } from "@frontend/common/hooks";
import { SessionSchema } from "@frontend/common/schemas/backendAPI";

import { StyledDivider } from "./styled_divider";

const EXCLUDE_CATEGORIES = ["후원사", "Sponsor"];

const SessionItem: FC<{
  session: SessionSchema;
  enableLink?: boolean;
  fallbackImage?: ReactNode;
  getSessionUrl?: (session: SessionSchema) => string;
  renderSessionAction?: (session: SessionSchema) => ReactNode;
}> = Suspense.with({ fallback: <CircularProgress /> }, ({ session, enableLink, fallbackImage, getSessionUrl, renderSessionAction }) => {
  const sessionTitle = session.title.replace("\\n", "\n");

  let speakerImgSrc = session.image || "";
  if (!speakerImgSrc && isArray(session.speakers) && !isEmpty(session.speakers)) {
    for (const speaker of session.speakers) {
      if (speaker.image) {
        speakerImgSrc = speaker.image;
        break;
      }
    }
  }

  const sessionDetailedUrl = getSessionUrl ? getSessionUrl(session) : undefined;
  const result = (
    <SessionItemContainer direction="row">
      <SessionImageContainer
        children={
          <SessionImage
            src={speakerImgSrc}
            alt="Session Image"
            loading="lazy"
            errorFallback={<SessionImageErrorFallback>{fallbackImage}</SessionImageErrorFallback>}
          />
        }
      />
      <Stack direction="column" sx={{ flexGrow: 1, py: 0.5, gap: 0.75 }}>
        <SessionTitle children={sessionTitle} />
        {session.summary && <Typography variant="subtitle1" sx={{ whiteSpace: "pre-wrap" }} children={session.summary} />}
        <Stack direction="row" spacing={0.5}>
          {session.speakers.map((speaker) => (
            <Chip key={speaker.id} size="small" label={speaker.nickname} />
          ))}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {session.categories.map((tag) => (
            <Chip key={tag.id} variant="outlined" color="primary" size="small" label={tag.name} />
          ))}
        </Stack>
      </Stack>
    </SessionItemContainer>
  );
  const linkedResult =
    enableLink && sessionDetailedUrl ? <Link to={sessionDetailedUrl} style={{ textDecoration: "none" }} children={result} /> : result;
  return (
    <>
      {renderSessionAction ? (
        <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }} children={linkedResult} />
          <Box
            sx={{ flexShrink: 0, pl: 1, pr: { xs: 1, md: 2 } }}
            onClick={(event) => event.stopPropagation()}
            children={renderSessionAction(session)}
          />
        </Stack>
      ) : (
        linkedResult
      )}
      <StyledDivider />
    </>
  );
});

type SessionListPropType = {
  event?: string;
  types?: string | string[];
  enableLink?: boolean;
  fallbackImage?: ReactNode;
  getSessionUrl?: (session: SessionSchema) => string;
  renderSessionAction?: (session: SessionSchema) => ReactNode;
};

export const SessionList: FC<SessionListPropType> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ event, types, enableLink, fallbackImage, getSessionUrl, renderSessionAction }) => {
    const { language } = Common.useCommonContext();
    const backendAPIClient = BackendAPI.useBackendClient();
    const params = { ...(event && { event }), ...(types && { types: isString(types) ? types : types.join(",") }) };
    const { data: sessions } = BackendAPI.useSessionsQuery(backendAPIClient, params);

    const warningMessage =
      language === "ko"
        ? "* 발표 목록은 발표자 사정에 따라 변동될 수 있습니다."
        : "* The list of sessions may change due to the speaker's circumstances.";

    const [selectedCategoryIds, setSelectedCategories] = useState<string[]>([]);
    const toggleCategory = (catId: string) => setSelectedCategories((ps) => (ps.includes(catId) ? ps.filter((id) => id !== catId) : [...ps, catId]));
    const categories = useMemo(
      () =>
        sessions
          .map((s) => s.categories)
          .flat()
          .filter((o1, i, a) => a.findIndex((o2) => o2.id === o1.id) === i)
          .filter((cat) => !EXCLUDE_CATEGORIES.includes(cat.name)),
      [sessions]
    );
    const filteredSessions = useMemo(() => {
      return sessions.filter((session) => {
        const sessionCategoryIds: string[] = session.categories.map((category) => category.id);
        return selectedCategoryIds.length === 0 || selectedCategoryIds.some((cat) => sessionCategoryIds.includes(cat));
      });
    }, [sessions, selectedCategoryIds]);

    return (
      <Box sx={{ my: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ width: "100%", textAlign: "right", my: 0.5, fontSize: "0.6rem" }} children={warningMessage} />
          <StyledDivider />
          {categories && categories.length > 1 && (
            <>
              <Stack direction="row" sx={{ flexWrap: "wrap", justifyContent: "center", gap: "0.1rem 0.2rem", my: 1 }}>
                {categories.map((cat) => (
                  <CategoryButtonStyle
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    children={cat.name}
                    selected={selectedCategoryIds.some((selectedCatId) => selectedCatId === cat.id)}
                  />
                ))}
              </Stack>
              <StyledDivider />
            </>
          )}
        </Box>
        {filteredSessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            enableLink={enableLink}
            fallbackImage={fallbackImage}
            getSessionUrl={getSessionUrl}
            renderSessionAction={renderSessionAction}
          />
        ))}
      </Box>
    );
  })
);

const CategoryButtonStyle = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: "14rem",

  wordBreak: "keep-all",
  whiteSpace: "nowrap",

  backgroundColor: selected ? theme.palette.primary.light : "transparent",
  color: selected ? theme.palette.primary.main : theme.palette.primary.light,
  "&:hover": {
    color: theme.palette.primary.dark,
  },
}));

const SessionItemContainer = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0.5rem 1.5rem",
  gap: "1.5rem",
  minHeight: "9rem",

  [theme.breakpoints.down("md")]: {
    fontSize: "0.75rem",
    padding: "0.5rem",
    gap: "1rem",

    "& .MuiChip-labelSmall": {
      fontSize: "0.75em",
    },
  },
}));

const SessionImageContainer = styled(Stack)({
  alignItems: "center",
  justifyContent: "center",

  width: "6rem",
  minWidth: "6rem",
  maxWidth: "6rem",
  height: "6rem",
  minHeight: "6rem",
  maxHeight: "6rem",
});

const SessionImage = styled(FallbackImage)(({ theme }) => ({
  border: `1px solid color-mix(in srgb, ${theme.palette.primary.light} 50%, transparent 50%)`,

  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
}));

const SessionImageErrorFallbackBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  border: `1px solid color-mix(in srgb, ${theme.palette.primary.light} 50%, transparent 50%)`,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const SessionImageErrorFallback: FC<{ children?: ReactNode }> = ({ children }) => (
  <SessionImageErrorFallbackBox>{children}</SessionImageErrorFallbackBox>
);

const SessionTitle = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: 600,
  lineHeight: 1.25,
  textDecoration: "none",
  whiteSpace: "pre-wrap",
});
