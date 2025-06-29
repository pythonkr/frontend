import * as Common from "@frontend/common";
import { AccountCircle } from "@mui/icons-material";
import { AppBar, ButtonBase, CircularProgress, IconButton, Menu, MenuItem, Stack, styled, Toolbar, Tooltip, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import * as React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { LOCAL_STORAGE_LANGUAGE_KEY } from "../consts/local_stroage";
import { useAppContext } from "../contexts/app_context";

const FullPage = styled(Stack)({
  minHeight: "100vh",
  backgroundColor: "#f0f0f0",
});

const ToggleContainer = styled("div")(({ theme }) => ({
  display: "flex",
  width: "6rem",
  height: 29,
  border: `2px solid ${theme.palette.primary.light}`,
  borderRadius: 15,
  padding: 2,
  gap: 2,
}));

const LanguageButton = styled(ButtonBase)<{ isActive: boolean }>(({ theme, isActive }) => ({
  flex: 1,
  height: "100%",
  borderRadius: 13,
  fontSize: "0.75rem",
  fontWeight: 600,
  transition: "all 0.2s ease",
  backgroundColor: "transparent",
  color: isActive ? theme.palette.primary.contrastText : theme.palette.primary.dark,

  ...(isActive && {
    fontWeight: 700,
    backgroundColor: theme.palette.primary.dark,
  }),

  "&:hover": {
    color: theme.palette.primary.contrastText,
    backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.primary.light,
  },

  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  textRendering: "optimizeLegibility",
  WebkitTextStroke: "0.5px transparent",
}));

type ProfileMenuButtonProps = {
  loading?: boolean;
  signedIn?: boolean;
};

type ProfileMenuButtonState = {
  anchorEl?: HTMLElement | null;
};

const InnerProfileMenuButton: React.FC<ProfileMenuButtonProps> = ({ loading, signedIn }) => {
  const navigate = useNavigate();
  const participantPortalClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
  const [btnState, setBtnState] = React.useState<ProfileMenuButtonState>({});
  const openMenu: React.MouseEventHandler<HTMLButtonElement> = (evt) => setBtnState((ps) => ({ ...ps, anchorEl: evt.currentTarget }));
  const closeMenu = () => setBtnState((ps) => ({ ...ps, anchorEl: undefined }));
  const { language } = useAppContext();
  const accountStr = language === "ko" ? "계정" : "Account";
  const signInStr = language === "ko" ? "로그인" : "Sign In";
  const signOutStr = language === "ko" ? "로그아웃" : "Sign Out";
  const editProfileStr = language === "ko" ? "프로필 편집" : "Edit Profile";

  const goToProfileEditor = () => {
    navigate("/user");
    closeMenu();
  };
  const goToSignIn = () => navigate("/signin");
  const signOutMutation = Common.Hooks.BackendParticipantPortalAPI.useSignOutMutation(participantPortalClient);
  const onSignInOutClick = () => {
    if (signedIn) signOutMutation.mutate();
    else goToSignIn();

    closeMenu();
  };

  return (
    <>
      <Tooltip title={accountStr} placement="bottom">
        <IconButton children={loading ? <CircularProgress size={24} /> : <AccountCircle />} disabled={loading} onClick={openMenu} />
      </Tooltip>
      <Menu open={!!btnState.anchorEl} anchorEl={btnState.anchorEl} onClose={closeMenu}>
        {signedIn && <MenuItem children={editProfileStr} onClick={goToProfileEditor} />}
        <MenuItem children={signedIn ? signOutStr : signInStr} onClick={onSignInOutClick} />
      </Menu>
    </>
  );
};

const ProfileMenuButton: React.FC = ErrorBoundary.with(
  { fallback: <InnerProfileMenuButton /> },
  Suspense.with({ fallback: <InnerProfileMenuButton loading /> }, () => {
    const participantPortalClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
    const { data } = Common.Hooks.BackendParticipantPortalAPI.useSignedInUserQuery(participantPortalClient);

    return <InnerProfileMenuButton signedIn={!!data} />;
  })
);

export const Layout: React.FC = () => {
  const { language, setAppContext } = useAppContext();
  const toggleLanguage = () =>
    setAppContext((ps) => {
      const language = ps.language === "ko" ? "en" : "ko";
      localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, language);
      return { ...ps, language };
    });

  const titleStr = language === "ko" ? "PyCon Korea 참가자 포탈" : "PyCon Korea Participant Portal";

  return (
    <FullPage>
      <AppBar position="fixed" sx={{ backgroundColor: "rgba(192, 224, 256, 0.25)", backdropFilter: "blur(10px)" }}>
        <Toolbar sx={{ justifyContent: "flex-start", gap: "1rem", px: "2rem" }} disableGutters>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography variant="h6" children={titleStr} sx={{ color: "black", fontWeight: "bolder" }} />
          </Link>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ marginLeft: "auto" }}>
            <ToggleContainer onClick={toggleLanguage}>
              <LanguageButton isActive={language === "ko"} children="KO" />
              <LanguageButton isActive={language === "en"} children="EN" />
            </ToggleContainer>
            <ProfileMenuButton />
          </Stack>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Stack alignItems="center" justifyContent="center" children={<Outlet />} />
    </FullPage>
  );
};
