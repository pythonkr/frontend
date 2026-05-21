import { Card, CardContent, Palette, PaletteColor, styled, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { isArray, isEmpty } from "remeda";

import { ErrorPage } from "@apps/pyconkr-participant-portal/components/elements/error_page";
import { LoadingPage } from "@apps/pyconkr-participant-portal/components/elements/loading_page";
import { SignInGuard } from "@apps/pyconkr-participant-portal/components/elements/signin_guard";
import { Page } from "@apps/pyconkr-participant-portal/components/page";
import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";
import { useModificationAuditPreviewQuery, useParticipantPortalClient } from "@frontend/common/hooks/useParticipantPortalAPI";

import { ProfileEditorForm, ProfileSchema } from "./profile_editor";
import { SessionEditorForm, SessionSchema } from "./session_editor";

const StyledAlertCard = styled(Card)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  ".MuiCardContent-root": {
    "&:last-child": {
      paddingBottom: "initial",
      padding: theme.spacing(2),
    },
  },
}));

const StyledNoticeHeader: FC<{ pName: keyof Palette; text: ReactNode }> = ({ pName, text }) => (
  <StyledAlertCard sx={(t) => ({ backgroundColor: (t.palette[pName] as PaletteColor).main, color: (t.palette[pName] as PaletteColor).contrastText })}>
    <CardContent>
      <Typography variant="body1" sx={{ fontWeight: 700 }} children={text} />
    </CardContent>
  </StyledAlertCard>
);

type ModificationAuditStatus = "requested" | "approved" | "rejected" | "cancelled";

type AuditNoticeHeaderProps = {
  language: "ko" | "en";
  audit: {
    status: ModificationAuditStatus;
    comments: {
      content: string;
      created_by: { is_superuser: boolean };
    }[];
  };
};

const ApprovedAuditNoticeHeader: FC<AuditNoticeHeaderProps> = ({ language }) => {
  const text = language === "ko" ? "승인되어 반영된 수정 요청입니다." : "This is a modification request that has been approved and applied.";
  return <StyledNoticeHeader pName="success" text={text} />;
};

const RequestedAuditNoticeHeader: FC<AuditNoticeHeaderProps> = ({ language }) => {
  const text =
    language === "ko"
      ? "현재 파이콘 준비 위원회가 수정 요청을 확인 중입니다."
      : "The PyCon Korea Organizing Committee is currently reviewing your modification request.";
  return <StyledNoticeHeader pName="info" text={text} />;
};

const RejectedAuditNoticeHeader: FC<AuditNoticeHeaderProps> = ({ language, audit }) => {
  const auditRejectedText = language === "ko" ? "수정 요청이 반려되었습니다. " : "Your modification request has been rejected. ";
  const rejectReasonIsText = language === "ko" ? "반려 사유는 다음과 같습니다: " : "The reason for rejection is as follows: ";

  let body: ReactNode = auditRejectedText;
  if (isArray(audit.comments) && !isEmpty(audit.comments.filter((c) => c.created_by.is_superuser))) {
    // 운영자가 쓴 가장 첫번째 코멘트를 반려 사유로 사용
    const rejectedReason = audit.comments.filter((c) => c.created_by.is_superuser)[0].content;
    body = (
      <>
        {auditRejectedText + rejectReasonIsText}
        <br />
        <pre style={{ whiteSpace: "pre-wrap" }}>{rejectedReason}</pre>
      </>
    );
  }
  return <StyledNoticeHeader pName="error" text={body} />;
};

const CancelledAuditNoticeHeader: FC<AuditNoticeHeaderProps> = ({ language }) => {
  const text = language === "ko" ? "취소한 수정 요청입니다." : "This is a modification request that you have cancelled.";
  return <StyledNoticeHeader pName="warning" text={text} />;
};

const AuditNoticeHeader: FC<AuditNoticeHeaderProps> = ({ language, audit }) => {
  switch (audit.status) {
    case "approved":
      return <ApprovedAuditNoticeHeader language={language} audit={audit} />;
    case "requested":
      return <RequestedAuditNoticeHeader language={language} audit={audit} />;
    case "rejected":
      return <RejectedAuditNoticeHeader language={language} audit={audit} />;
    case "cancelled":
      return <CancelledAuditNoticeHeader language={language} audit={audit} />;
    default:
      return <StyledAlertCard children={<CardContent children="알 수 없는 상태입니다." />} />;
  }
};

export const InnerModificationAuditPreview: FC = () => {
  const { language } = useAppContext();
  const { auditId } = useParams<{ auditId?: string }>();
  const participantPortalClient = useParticipantPortalClient();
  const { data: auditData } = useModificationAuditPreviewQuery(participantPortalClient, auditId ?? "");

  if (!auditData) return <Navigate to="/" replace />;

  return (
    <Page>
      <AuditNoticeHeader language={language} audit={auditData.modification_audit} />
      {auditData.modification_audit.instance_type === "presentation" && (
        <SessionEditorForm disabled language={language} defaultValue={auditData.modified as SessionSchema} />
      )}
      {auditData.modification_audit.instance_type === "userext" && (
        <ProfileEditorForm disabled language={language} defaultValue={auditData.modified as ProfileSchema} />
      )}
    </Page>
  );
};

export const ModificationAuditPreview: FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerModificationAuditPreview />} />)
);
