import { SessionSchema } from "@frontend/common/schemas/backendAPI";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Button, CircularProgress } from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";
import { useAuthGuard } from "@apps/pyconkr-2026/features/auth/auth_guard";
import { showScheduleToast } from "@apps/pyconkr-2026/features/schedule/schedule_toast";
import { useMyScheduleIds, useToggleScheduleMutation } from "@apps/pyconkr-2026/features/schedule/use_my_schedule";

/** 담기 토글 버튼의 상태 — boolean(isMember/isLoading) 조합 대신 단일 discriminated union으로 모델링. */
export type ScheduleToggle =
  | { status: "idle"; action: "add" }
  | { status: "idle"; action: "remove" }
  | { status: "in-flight"; action: "add" | "remove" };

export const deriveScheduleToggle = (isMember: boolean, isPending: boolean): ScheduleToggle =>
  isPending
    ? { status: "in-flight", action: isMember ? "remove" : "add" }
    : isMember
      ? { status: "idle", action: "remove" }
      : { status: "idle", action: "add" };

const assertNever = (value: never): never => {
  throw new Error(`Unhandled ScheduleToggle: ${JSON.stringify(value)}`);
};

type ToggleView = {
  label: string;
  color: "primary" | "inherit";
  variant: "contained" | "outlined";
  disabled: boolean;
  spinner: boolean;
};

/** union을 라벨/스타일/disabled로 선언적으로 매핑합니다(exhaustive switch). */
const toggleView = (toggle: ScheduleToggle, isKo: boolean): ToggleView => {
  switch (toggle.status) {
    case "in-flight":
      return {
        label: toggle.action === "add" ? (isKo ? "추가" : "Add") : isKo ? "빼기" : "Remove",
        color: toggle.action === "add" ? "primary" : "inherit",
        variant: toggle.action === "add" ? "contained" : "outlined",
        disabled: true,
        spinner: true,
      };
    case "idle":
      switch (toggle.action) {
        case "add":
          return { label: isKo ? "추가" : "Add", color: "primary", variant: "contained", disabled: false, spinner: false };
        case "remove":
          return { label: isKo ? "빼기" : "Remove", color: "inherit", variant: "outlined", disabled: false, spinner: false };
        default:
          return assertNever(toggle);
      }
    default:
      return assertNever(toggle);
  }
};

/** 세션 행 우측의 추가/빼기 토글 버튼. 비로그인은 가드 모달, optimistic 반영, 성공 토스트(+CTA)까지 처리합니다. */
export const SessionScheduleToggleButton: FC<{ session: SessionSchema }> = ({ session }) => {
  const { language } = useAppContext();
  const { data: ids } = useMyScheduleIds();
  const mutation = useToggleScheduleMutation();
  const { guard } = useAuthGuard();
  const navigate = useNavigate();

  const isKo = language === "ko";
  const isMember = ids.has(session.id);
  const view = toggleView(deriveScheduleToggle(isMember, mutation.isPending), isKo);

  const handleToggle = () => {
    const wasMember = isMember;
    mutation.mutate(
      { sessionId: session.id },
      {
        onSuccess: () => {
          if (wasMember) {
            showScheduleToast({
              message: isKo ? "내 시간표에서 뺐어요" : "Removed from your schedule",
              severity: "info",
              action: { label: isKo ? "되돌리기" : "Undo", onClick: () => mutation.mutate({ sessionId: session.id }) },
            });
          } else {
            showScheduleToast({
              message: isKo ? "내 시간표에 담았어요" : "Added to your schedule",
              severity: "success",
              action: { label: isKo ? "내 시간표 보기" : "View my schedule", onClick: () => navigate("/my/timetable") },
            });
          }
        },
        onError: () => {
          showScheduleToast({
            message: isKo ? "문제가 발생했어요. 잠시 후 다시 시도해 주세요." : "Something went wrong. Please try again.",
            severity: "error",
          });
        },
      }
    );
  };

  return (
    <Button
      type="button"
      size="small"
      color={view.color}
      variant={view.variant}
      disabled={view.disabled}
      onClick={guard(handleToggle)}
      startIcon={
        view.spinner ? (
          <CircularProgress size={14} color="inherit" />
        ) : isMember ? (
          <CheckRoundedIcon fontSize="small" />
        ) : (
          <AddRoundedIcon fontSize="small" />
        )
      }
      sx={{ minWidth: "4.75rem", whiteSpace: "nowrap", flexShrink: 0 }}
      children={view.label}
    />
  );
};
