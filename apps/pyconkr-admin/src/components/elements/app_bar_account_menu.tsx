import { useBackendAdminClient, useSignOutMutation, useSignedInUserQuery } from "@frontend/common/hooks/useAdminAPI";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { AccountCircle, Login, Logout, OpenInNew } from "@mui/icons-material";
import { CircularProgress, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

const SignedInMenu: FC<{ id: number; username: string; email: string }> = ({ id, username, email }) => {
  const navigate = useNavigate();
  const { accountsDomain } = useCommonContext();
  const backendAdminAPIClient = useBackendAdminClient();
  const signOutMutation = useSignOutMutation(backendAdminAPIClient);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleViewProfile = () => {
    handleClose();
    navigate(`/user/userext/${id}`);
  };

  const handleOpenAccountsPortal = () => {
    handleClose();
    window.open(accountsDomain, "_blank", "noopener,noreferrer");
  };

  const handleSignOut = () => {
    handleClose();
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        addSnackbar("로그아웃 되었습니다.", "success");
        navigate("/account/sign-in");
      },
      onError: addErrorSnackbar,
    });
  };

  return (
    <>
      <Tooltip title={`${username} (계정 메뉴 열기)`}>
        <IconButton color="inherit" onClick={handleOpen} disabled={signOutMutation.isPending}>
          <AccountCircle />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} keepMounted>
        <MenuItem onClick={handleViewProfile}>
          <ListItemText primary={username} secondary={email || "이메일 없음"} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenAccountsPortal}>
          <ListItemIcon>
            <OpenInNew fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="PyCon 계정 관리" secondary="accounts.pycon.kr" />
        </MenuItem>
        <MenuItem onClick={handleSignOut} disabled={signOutMutation.isPending}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>로그아웃</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const AppBarAccountMenuInner: FC = () => {
  const navigate = useNavigate();
  const backendAdminAPIClient = useBackendAdminClient();
  const { data: userInfo } = useSignedInUserQuery(backendAdminAPIClient);

  if (!userInfo) {
    return (
      <Tooltip title="로그인">
        <IconButton color="inherit" onClick={() => navigate("/account/sign-in")}>
          <Login />
        </IconButton>
      </Tooltip>
    );
  }

  return <SignedInMenu id={userInfo.id} username={userInfo.username} email={userInfo.email} />;
};

export const AppBarAccountMenu: FC = ErrorBoundary.with(
  { fallback: <></> },
  Suspense.with({ fallback: <CircularProgress size={24} sx={{ color: "white" }} /> }, AppBarAccountMenuInner)
);
