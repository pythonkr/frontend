import { Alert, AlertColor, Button, Stack, Typography } from "@mui/material";
import { closeSnackbar, enqueueSnackbar, SnackbarKey } from "notistack";
import { FC, forwardRef, ReactNode } from "react";

type ScheduleToastRootProps = { children: ReactNode; severity: AlertColor; onClose: () => void };

const ScheduleToastRoot = forwardRef<HTMLDivElement, ScheduleToastRootProps>(function ScheduleToastRoot({ children, severity, onClose }, ref) {
  return (
    <Alert ref={ref} severity={severity} variant="filled" elevation={6} onClose={onClose} sx={{ width: "100%", alignItems: "center" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ width: "100%" }} children={children} />
    </Alert>
  );
});

const ScheduleToastMessage: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography variant="body2" sx={{ fontWeight: 600 }} children={children} />
);

const ScheduleToastActionButton: FC<{ children: ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <Button color="inherit" size="small" variant="outlined" onClick={onClick} sx={{ flexShrink: 0, whiteSpace: "nowrap" }} children={children} />
);

/** 일정 담기/빼기 결과 토스트 — compound component. */
export const ScheduleToast = Object.assign(ScheduleToastRoot, {
  Message: ScheduleToastMessage,
  Action: ScheduleToastActionButton,
});

export type ScheduleToastActionConfig = { label: string; onClick: () => void };
export type ShowScheduleToastOptions = { message: string; severity?: AlertColor; action?: ScheduleToastActionConfig };

/**
 * notistack로 일정 토스트를 노출합니다. content 콜백으로 snackbar key를 받아 Action에서 닫을 수 있습니다.
 * (SnackbarProvider가 RouterProvider 바깥이라 토스트 내부에서는 useNavigate 불가 → onClick은 호출부가 주입합니다.)
 */
export const showScheduleToast = ({ message, severity = "success", action }: ShowScheduleToastOptions): SnackbarKey =>
  enqueueSnackbar(message, {
    anchorOrigin: { vertical: "bottom", horizontal: "center" },
    autoHideDuration: 4000,
    content: (key, displayed) => (
      <ScheduleToast severity={severity} onClose={() => closeSnackbar(key)}>
        <ScheduleToast.Message>{displayed}</ScheduleToast.Message>
        {action ? (
          <ScheduleToast.Action
            onClick={() => {
              closeSnackbar(key);
              action.onClick();
            }}
            children={action.label}
          />
        ) : null}
      </ScheduleToast>
    ),
  });
