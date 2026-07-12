import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { UserSignInAccount, UserSignInMethod } from "@frontend/shop/components/common";
import { useShopClient, useSignOutMutation, useUserStatus } from "@frontend/shop/hooks";
import { UserSignedInStatus } from "@frontend/shop/schemas";
import { AccountCircle, CalendarMonth, Login, Logout, ManageAccounts, Person, Receipt } from "@mui/icons-material";
import { Button, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, styled, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, MouseEvent, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

const ColoredIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.nonFocus,
  "&:hover": { color: theme.palette.primary.dark },
  "&:active": { color: theme.palette.primary.main },
  transition: "color 0.4s ease, background-color 0.4s ease",
}));

const ColoredTextButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.nonFocus,
  textTransform: "none",
  fontWeight: 500,
  maxWidth: "12rem",
  "& .MuiButton-startIcon": { marginRight: theme.spacing(0.75) },
  "&:hover": { color: theme.palette.primary.dark, backgroundColor: "transparent" },
  "&:active": { color: theme.palette.primary.main },
  transition: "color 0.4s ease, background-color 0.4s ease",
}));

const LabelText = styled("span")({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

type UserMenuButtonProps = { onClose?: () => void; showLabel?: boolean };

type InnerUserMenuButtonPropType = UserMenuButtonProps & {
  loading?: boolean;
  user?: UserSignedInStatus["data"]["user"];
  onSignOut?: () => void;
};

const InnerUserMenuButton: FC<InnerUserMenuButtonPropType> = ({ loading, user, onSignOut, onClose, showLabel }) => {
  const { language } = useAppContext();
  const { accountsDomain } = useCommonContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const signInLabel = language === "ko" ? "로그인" : "Sign In";
  const myPageLabel = language === "ko" ? "마이페이지" : "My Page";
  const myScheduleLabel = language === "ko" ? "내 시간표" : "My Schedule";
  const orderHistoryLabel = language === "ko" ? "결제 내역" : "Order History";
  const manageAccountLabel = language === "ko" ? "계정 관리" : "Manage Account";
  const signOutLabel = language === "ko" ? "로그아웃" : "Sign Out";

  const closeAll = () => {
    handleMenuClose();
    onClose?.();
  };

  const goToAccounts = () => {
    handleMenuClose();
    onClose?.();
    window.open(accountsDomain, "_blank", "noopener,noreferrer");
  };

  const handleSignOut = () => {
    handleMenuClose();
    onClose?.();
    onSignOut?.();
  };

  const triggerIcon = user ? <AccountCircle /> : <Login />;
  const triggerLabel = user ? user.display || user.email : signInLabel;
  const ariaProps = {
    "aria-controls": open ? "user-menu" : undefined,
    "aria-haspopup": "true" as const,
    "aria-expanded": open ? ("true" as const) : undefined,
  };

  return (
    <>
      {showLabel ? (
        <ColoredTextButton loading={loading} onClick={handleOpen} startIcon={triggerIcon} {...ariaProps}>
          <LabelText>{triggerLabel}</LabelText>
        </ColoredTextButton>
      ) : (
        <ColoredIconButton loading={loading} onClick={handleOpen} {...ariaProps}>
          {triggerIcon}
        </ColoredIconButton>
      )}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 180, mt: 0.5 } } }}
      >
        {user ? (
          [
            <UserNameItem key="username" disabled>
              <Typography variant="body2" sx={{ fontWeight: 600, color: (theme) => theme.palette.text.primary }} component="span">
                <UserSignInAccount /> ( 소셜 로그인 - <UserSignInMethod /> )
              </Typography>
            </UserNameItem>,
            <Divider key="divider" sx={{ my: 0.5 }} />,
            <MenuItem key="mypage" component={RouterLink} to="/my" onClick={closeAll}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>{myPageLabel}</ListItemText>
            </MenuItem>,
            <MenuItem key="my-timetable" component={RouterLink} to="/my/timetable" onClick={closeAll}>
              <ListItemIcon>
                <CalendarMonth fontSize="small" />
              </ListItemIcon>
              <ListItemText>{myScheduleLabel}</ListItemText>
            </MenuItem>,
            <MenuItem key="orders" component={RouterLink} to="/store/order-histories" onClick={closeAll}>
              <ListItemIcon>
                <Receipt fontSize="small" />
              </ListItemIcon>
              <ListItemText>{orderHistoryLabel}</ListItemText>
            </MenuItem>,
            <MenuItem key="accounts" onClick={goToAccounts}>
              <ListItemIcon>
                <ManageAccounts fontSize="small" />
              </ListItemIcon>
              <ListItemText>{manageAccountLabel}</ListItemText>
            </MenuItem>,
            <MenuItem key="signout" onClick={handleSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>{signOutLabel}</ListItemText>
            </MenuItem>,
          ]
        ) : (
          <MenuItem component={RouterLink} to="/account/sign-in" onClick={closeAll}>
            <ListItemIcon>
              <Login fontSize="small" />
            </ListItemIcon>
            <ListItemText>{signInLabel}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const UserMenuButtonContent: FC<UserMenuButtonProps> = ({ onClose, showLabel }) => {
  const shopAPIClient = useShopClient();
  const signOutMutation = useSignOutMutation(shopAPIClient);
  const { data } = useUserStatus(shopAPIClient);

  return <InnerUserMenuButton user={data?.data.user} onSignOut={signOutMutation.mutate} onClose={onClose} showLabel={showLabel} />;
};

export const UserMenuButton: FC<UserMenuButtonProps> = ({ onClose, showLabel }) => (
  <ErrorBoundary fallback={<InnerUserMenuButton onClose={onClose} showLabel={showLabel} />}>
    <Suspense fallback={<InnerUserMenuButton loading onClose={onClose} showLabel={showLabel} />}>
      <UserMenuButtonContent onClose={onClose} showLabel={showLabel} />
    </Suspense>
  </ErrorBoundary>
);

const UserNameItem = styled(MenuItem)(({ theme }) => ({
  opacity: 1,
  "&.Mui-disabled": { opacity: 1 },
  pointerEvents: "none",
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));
