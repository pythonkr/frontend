import { FallbackImage } from "@frontend/common/components";
import {
  useListPresentationsQuery,
  useModificationAuditsQuery,
  useParticipantPortalClient,
  useSignedInUserQuery,
} from "@frontend/common/hooks/useParticipantPortalAPI";
import {
  Button,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { CSSProperties, FC, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { isEmpty } from "remeda";

import { ErrorPage } from "@apps/pyconkr-participant-portal/components/elements/error_page";
import { Fieldset } from "@apps/pyconkr-participant-portal/components/elements/fieldset";
import { LoadingPage } from "@apps/pyconkr-participant-portal/components/elements/loading_page";
import { SignInGuard } from "@apps/pyconkr-participant-portal/components/elements/signin_guard";
import { Page } from "@apps/pyconkr-participant-portal/components/page";
import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";

const ProfileImageSize: CSSProperties["width" | "height"] = "8rem";

type AuditState = "requested" | "approved" | "rejected" | "cancelled";

const TranslatedAuditState: Record<AuditState, { ko: string; en: string }> = {
  requested: { ko: "심사 진행 중", en: "Under review" },
  approved: { ko: "승인 후 반영됨", en: "Approved and applied" },
  rejected: { ko: "거절됨", en: "Rejected" },
  cancelled: { ko: "취소됨", en: "Cancelled" },
};

const FieldsetContainer = styled(Stack)({
  width: "100%",
  flexWrap: "wrap",
  flexDirection: "row",
  gap: "1rem",
});

const ProperWidthFieldset = styled(Fieldset)({
  width: "100%",
  flex: "1 1 450px",
});

const ProfileImageContainer = styled(Stack)({
  alignItems: "center",
  justifyContent: "center",

  width: ProfileImageSize,
  minWidth: ProfileImageSize,
  maxWidth: ProfileImageSize,
  height: ProfileImageSize,
  minHeight: ProfileImageSize,
  maxHeight: ProfileImageSize,
});

const ProfileImageStyle: CSSProperties = {
  border: "1px solid #ccc",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
  textAlign: "center",
};

const ProfileImage = styled(FallbackImage)(ProfileImageStyle);

const ProfileImageFallback: FC<{ language: "ko" | "en" }> = ({ language }) => {
  const noProfileImageText = language === "ko" ? "프로필 이미지가 없어요." : "No profile image.";
  const registerProfileImageText = language === "ko" ? "이미지를 등록해주세요." : "Please register your profile image.";

  return (
    <Stack sx={ProfileImageStyle} alignItems="center" justifyContent="center">
      <Typography variant="caption" color="textSecondary">
        {noProfileImageText}
        <br />
        {registerProfileImageText}
      </Typography>
    </Stack>
  );
};

type InnerLandingPageState = {
  showAllAudits: boolean;
};

const InnerLandingPage: FC = () => {
  const { language } = useAppContext();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const participantPortalAPIClient = useParticipantPortalClient();
  const { data: profile } = useSignedInUserQuery(participantPortalAPIClient);
  const { data: audits } = useModificationAuditsQuery(participantPortalAPIClient);
  const { data: sessions } = useListPresentationsQuery(participantPortalAPIClient);

  const ongoingAudits = audits.filter((audit) => audit.status === "requested");
  const [state, setState] = useState<InnerLandingPageState>({ showAllAudits: isEmpty(ongoingAudits) });

  if (!profile) {
    return (
      <Page>
        <Typography variant="h4" component="h1" gutterBottom>
          {language === "ko" ? "로그인이 필요합니다." : "Login is required."}
        </Typography>
      </Page>
    );
  }

  const filteredAudits = state.showAllAudits ? audits : ongoingAudits;
  const toggleShowAllAudits = () => setState((ps) => ({ ...ps, showAllAudits: !ps.showAllAudits }));

  const greetingStr = language === "ko" ? `안녕하세요, ${profile.nickname}님!` : `Hello, ${profile.nickname}!`;
  const myInfoStr = language === "ko" ? "내 정보" : "My Information";
  const auditStr = language === "ko" ? "수정 요청" : "Modification Requests";
  const sessionsStr = language === "ko" ? "발표 목록" : "Sessions";
  // const sponsorsStr = language === "ko" ? "후원사 정보" : "Sponsor informations";
  const userNameStr = language === "ko" ? `계정명 : ${profile.username}` : `Username : ${profile.username}`;
  const nickNameStr = language === "ko" ? `별칭 : ${profile.nickname}` : `Nickname : ${profile.nickname}`;
  const emailStr = language === "ko" ? `이메일 : ${profile.email}` : `Email : ${profile.email}`;
  const editProfileStr = language === "ko" ? "프로필 수정" : "Edit Profile";
  const showReviewOngoingAuditsStr = language === "ko" ? "현재 심사가 진행 중인 수정 요청만 보기" : "Show only review ongoing modification requests";
  const ongoingAuditEmptyStr = language === "ko" ? "진행 중인 수정 요청이 없습니다." : "No ongoing modification requests.";
  const auditEmptyStr = language === "ko" ? "수정 요청이 없습니다." : "No modification requests.";

  return (
    <Page>
      <Typography variant="h4" component="h1" gutterBottom children={greetingStr} />
      <Stack direction="column" sx={{ width: "100%", gap: "1rem" }}>
        <Fieldset legend={myInfoStr} style={{ width: "100%" }}>
          <Stack sx={{ width: "100%" }} alignItems="center" justifyContent="center" spacing={2}>
            <Stack direction={isMobile ? "column" : "row"} sx={{ width: isMobile ? "max-content" : "100%", gap: "1rem" }} alignItems="center">
              <ProfileImageContainer>
                <ProfileImage src={profile.profile_image || ""} alt="Profile Image" errorFallback={<ProfileImageFallback language={language} />} />
              </ProfileImageContainer>
              <Stack direction="column" sx={{ gap: "0.5rem", maxWidth: isMobile ? "max-content" : "100%", flexGrow: isMobile ? 0 : 1 }}>
                <Typography variant="h6" children={nickNameStr} />
                <Typography variant="body1" children={userNameStr} />
                <Typography variant="body1" children={emailStr} />
              </Stack>
              <Stack sx={{ width: "100%", maxWidth: "8rem" }}>
                <Button variant="contained" size="small" component={RouterLink} to="/user" children={editProfileStr} />
              </Stack>
            </Stack>
          </Stack>
        </Fieldset>
        <FieldsetContainer>
          <ProperWidthFieldset legend={auditStr}>
            {audits.length !== 0 && (
              <FormGroup>
                <FormControlLabel
                  control={<Switch value={!state.showAllAudits} onChange={toggleShowAllAudits} size="small" />}
                  label={showReviewOngoingAuditsStr}
                  labelPlacement="start"
                />
              </FormGroup>
            )}
            <List>
              {filteredAudits.length > 0 ? (
                filteredAudits.map((audit) => {
                  const navigateTo =
                    audit.status !== "requested"
                      ? `/modification-audit/${audit.id}`
                      : audit.instance_type === "presentation"
                        ? `/session/${audit.instance_id}`
                        : `/user`;
                  return (
                    <ListItem key={audit.id} disablePadding sx={{ cursor: "pointer", border: "1px solid #ccc" }}>
                      <ListItemButton
                        component={RouterLink}
                        to={navigateTo}
                        children={<ListItemText primary={audit.str_repr} secondary={TranslatedAuditState[audit.status][language]} />}
                      />
                    </ListItem>
                  );
                })
              ) : (
                <ListItem disablePadding sx={{ cursor: "pointer", border: "1px solid #ccc" }}>
                  <ListItemButton children={<ListItemText primary={state.showAllAudits ? auditEmptyStr : ongoingAuditEmptyStr} />} />
                </ListItem>
              )}
            </List>
          </ProperWidthFieldset>
          {sessions && (
            <ProperWidthFieldset legend={sessionsStr}>
              <List>
                {sessions.map((s) => (
                  <ListItem key={s.id} disablePadding sx={{ cursor: "pointer", border: "1px solid #ccc" }}>
                    <ListItemButton component={RouterLink} to={`/session/${s.id}`} children={<ListItemText primary={s.title} />} />
                  </ListItem>
                ))}
              </List>
            </ProperWidthFieldset>
          )}
          {/* <ProperWidthFieldset legend={sponsorsStr}>
            <List></List>
          </ProperWidthFieldset> */}
        </FieldsetContainer>
      </Stack>
    </Page>
  );
};

export const LandingPage: FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerLandingPage />} />)
);
