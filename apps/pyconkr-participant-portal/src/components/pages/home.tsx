import * as Common from "@frontend/common";
import { Button, List, ListItem, ListItemButton, ListItemText, Stack, styled, Typography, useMediaQuery } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../../contexts/app_context";
import { ErrorPage } from "../elements/error_page";
import { Fieldset } from "../elements/fieldset";
import { LoadingPage } from "../elements/loading_page";
import { SignInGuard } from "../elements/signin_guard";
import { Page } from "../page";

const ProfileImageSize: React.CSSProperties["width" | "height"] = "8rem";

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

const ProfileImageStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
  textAlign: "center",
};

const ProfileImage = styled(Common.Components.FallbackImage)(ProfileImageStyle);

const ProfileImageFallback: React.FC<{ language: "ko" | "en" }> = ({ language }) => {
  const noProfileImageText = language === "ko" ? "프로필 이미지가 없습니다." : "No profile image.";
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

const InnerLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useAppContext();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const participantPortalAPIClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
  const { data: profile } = Common.Hooks.BackendParticipantPortalAPI.useSignedInUserQuery(participantPortalAPIClient);
  const { data: sessions } = Common.Hooks.BackendParticipantPortalAPI.useListPresentationsQuery(participantPortalAPIClient);

  if (!profile) {
    return (
      <Page>
        <Typography variant="h4" component="h1" gutterBottom>
          {language === "ko" ? "로그인이 필요합니다." : "Login is required."}
        </Typography>
      </Page>
    );
  }

  const greetingStr = language === "ko" ? `안녕하세요, ${profile.nickname}님!` : `Hello, ${profile.nickname}!`;
  const myInfoStr = language === "ko" ? "내 정보" : "My Information";
  const auditStr = language === "ko" ? "수정 요청" : "Audit Requests";
  const sessionsStr = language === "ko" ? "발표 목록" : "Sessions";
  // const sponsorsStr = language === "ko" ? "후원사 정보" : "Sponsor informations";
  const userNameStr = language === "ko" ? `계정명 : ${profile.username}` : `Username : ${profile.username}`;
  const nickNameStr = language === "ko" ? `별칭 : ${profile.nickname}` : `Nickname : ${profile.nickname}`;
  const emailStr = language === "ko" ? `이메일 : ${profile.email}` : `Email : ${profile.email}`;
  const editProfileStr = language === "ko" ? "프로필 수정" : "Edit Profile";

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
                <Button variant="contained" size="small" onClick={() => navigate("/user")} children={editProfileStr} />
              </Stack>
            </Stack>
          </Stack>
        </Fieldset>
        <FieldsetContainer>
          <ProperWidthFieldset legend={auditStr}>
            <List>
              <ListItem>준비 중입니다.</ListItem>
            </List>
          </ProperWidthFieldset>
          <ProperWidthFieldset legend={sessionsStr}>
            <List>
              {sessions?.map((s) => (
                <ListItem key={s.id} disablePadding sx={{ cursor: "pointer", border: "1px solid #ccc" }}>
                  <ListItemButton children={<ListItemText primary={s.title} />} onClick={() => navigate(`/session/${s.id}`)} />
                </ListItem>
              ))}
            </List>
          </ProperWidthFieldset>
          {/* <ProperWidthFieldset legend={sponsorsStr}>
            <List></List>
          </ProperWidthFieldset> */}
        </FieldsetContainer>
      </Stack>
    </Page>
  );
};

export const LandingPage: React.FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerLandingPage />} />)
);
