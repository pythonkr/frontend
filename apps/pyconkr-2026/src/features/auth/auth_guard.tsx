import { useShopClient, useUserStatus } from "@frontend/shop/hooks";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { createContext, FC, ReactNode, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PENDING_REDIRECT_KEY } from "@apps/pyconkr-2026/consts/local_stroage";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

type AuthGuardContextValue = { requestLogin: () => void };

const AuthGuardContext = createContext<AuthGuardContextValue | undefined>(undefined);

const ModalRoot: FC<{ open: boolean; onClose: () => void; children: ReactNode }> = ({ open, onClose, children }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth children={children} />
);
const ModalTitle: FC<{ children: ReactNode }> = ({ children }) => <DialogTitle children={children} />;
const ModalBody: FC<{ children: ReactNode }> = ({ children }) => <DialogContent children={<DialogContentText children={children} />} />;
const ModalActions: FC<{ children: ReactNode }> = ({ children }) => <DialogActions children={children} />;

/** 로그인 안내 모달 — compound component. */
export const AuthGuardModal = {
  Root: ModalRoot,
  Title: ModalTitle,
  Body: ModalBody,
  Actions: ModalActions,
};

/**
 * 로그인 가드 모달을 1회 마운트하는 Provider. (App.tsx에서 <Outlet/>을 감싸 라우터 내부에 위치)
 * 비로그인 액션 요청 시 모달을 열고, "로그인하기"는 현재 위치를 sessionStorage에 저장한 뒤 로그인 페이지로 이동합니다.
 */
export const AuthGuardModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useAppContext();

  const value = useMemo<AuthGuardContextValue>(() => ({ requestLogin: () => setOpen(true) }), []);

  const handleClose = () => setOpen(false);
  const handleLogin = () => {
    try {
      // 로그인 후 현재 화면으로 복귀하기 위해 현재 URL을 저장합니다. (same-origin이라 open-redirect 위험 없음)
      sessionStorage.setItem(PENDING_REDIRECT_KEY, window.location.href);
    } catch {
      // sessionStorage 미지원/차단 시 무시 — 복귀가 생략될 뿐 로그인 흐름은 유지됩니다.
    }
    setOpen(false);
    navigate("/account/sign-in");
  };

  const isKo = language === "ko";

  return (
    <AuthGuardContext.Provider value={value}>
      {children}
      <AuthGuardModal.Root open={open} onClose={handleClose}>
        <AuthGuardModal.Title children={isKo ? "로그인이 필요해요" : "Sign in required"} />
        <AuthGuardModal.Body
          children={
            isKo
              ? "내 시간표에 담으려면 로그인이 필요합니다. 로그인 화면으로 이동할까요?"
              : "Please sign in to save sessions to your schedule. Go to the sign-in page?"
          }
        />
        <AuthGuardModal.Actions>
          <Button color="inherit" onClick={handleClose} children={isKo ? "취소" : "Cancel"} />
          <Button variant="contained" onClick={handleLogin} children={isKo ? "로그인하기" : "Sign in"} />
        </AuthGuardModal.Actions>
      </AuthGuardModal.Root>
    </AuthGuardContext.Provider>
  );
};

/**
 * 인증 가드 훅. guard(action)은 인증되어 있으면 action을 실행하고,
 * 아니면 로그인 안내 모달을 여는 click 핸들러를 반환합니다.
 */
export const useAuthGuard = (): { guard: (action: () => void) => () => void } => {
  // 모든 훅을 조건/throw 이전에 호출 (rules-of-hooks 준수)
  const context = useContext(AuthGuardContext);
  const { data } = useUserStatus(useShopClient());
  if (!context) throw new Error("useAuthGuard must be used within an AuthGuardModalProvider");

  const isAuthenticated = data?.meta.is_authenticated === true;

  const guard = (action: () => void) => () => {
    if (isAuthenticated) action();
    else context.requestLogin();
  };

  return { guard };
};
