import { BackendAPIClientError } from "@frontend/common/apis";
import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { useParticipantPortalClient, useSignedInUserQuery, useUpdateMeMutation } from "@frontend/common/hooks/useParticipantPortalAPI";
import { SendAndArchive } from "@mui/icons-material";
import { Alert, Button, Link as MuiLink, SelectChangeEvent, Stack } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useState } from "react";

import { SubmitConfirmDialog } from "@apps/pyconkr-participant-portal/components/dialogs/submit_confirm";
import { ErrorPage } from "@apps/pyconkr-participant-portal/components/elements/error_page";
import { LoadingPage } from "@apps/pyconkr-participant-portal/components/elements/loading_page";
import { MultiLanguageField } from "@apps/pyconkr-participant-portal/components/elements/multilang_field";
import { PublicFileSelector } from "@apps/pyconkr-participant-portal/components/elements/public_file_selector";
import { CurrentlyModAuditInProgress } from "@apps/pyconkr-participant-portal/components/elements/requested_modification_audit_available_header";
import { SignInGuard } from "@apps/pyconkr-participant-portal/components/elements/signin_guard";
import { PrimaryTitle } from "@apps/pyconkr-participant-portal/components/elements/titles";
import { Page } from "@apps/pyconkr-participant-portal/components/page";
import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";

export type ProfileSchema = {
  email: string;
  nickname_ko: string | null;
  nickname_en: string | null;
  image: string | null;
};

type ProfileEditorState = ProfileSchema & {
  openSubmitConfirmDialog: boolean;
};

const DummyProfile: ProfileSchema = {
  email: "",
  nickname_ko: "",
  nickname_en: "",
  image: null,
};

const InnerProfileEditor: FC = () => {
  const { language } = useAppContext();
  const { accountsDomain } = useCommonContext();
  const participantPortalClient = useParticipantPortalClient();
  const { data: profile } = useSignedInUserQuery(participantPortalClient);
  const updateMeMutation = useUpdateMeMutation(participantPortalClient);
  const [editorState, setEditorState] = useState<ProfileEditorState>({
    openSubmitConfirmDialog: false,
    ...(profile || DummyProfile),
  });

  const titleStr = language === "ko" ? "프로필 정보 수정" : "Edit Profile Information";
  const submitStr = language === "ko" ? "제출" : "Submit";
  const speakerImageStr = language === "ko" ? "프로필 이미지" : "Profile Image";
  const submitSucceedStr =
    language === "ko"
      ? "프로필 정보 수정을 요청했어요. 검토 후 반영될 예정이에요."
      : "Profile information update requested. It will be applied after review.";

  const openSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, openSubmitConfirmDialog: true }));
  const closeSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, openSubmitConfirmDialog: false }));

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const setImageId = (image: string | null) => setEditorState((ps) => ({ ...ps, image }));
  const onImageSelectChange = (e: SelectChangeEvent<string | null>) => setImageId(e.target.value);
  const setNickname = (value: string | undefined, lang: "ko" | "en") => setEditorState((ps) => ({ ...ps, [`nickname_${lang}`]: value }));

  const updateMe = () => {
    const { nickname_ko, nickname_en, image } = editorState;
    updateMeMutation.mutate(
      {
        nickname_ko: nickname_ko || null,
        nickname_en: nickname_en || null,
        image: image || null,
      },
      {
        onSuccess: () => {
          addSnackbar(submitSucceedStr, "success");
          closeSubmitConfirmDialog();
        },
        onError: (error) => {
          console.error("Updating profile failed:", error);

          let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          if (error instanceof BackendAPIClientError) errorMessage = error.message;

          addSnackbar(errorMessage, "error");
        },
      }
    );
  };

  const modificationAuditId = profile?.requested_modification_audit_id || "";
  const formDisabled = profile?.has_requested_modification_audit || updateMeMutation.isPending;

  const accountsLink = accountsDomain ? (
    <MuiLink href={accountsDomain} target="_blank" rel="noopener noreferrer">
      accounts.pycon.kr
    </MuiLink>
  ) : (
    "accounts.pycon.kr"
  );

  return (
    <>
      <SubmitConfirmDialog
        open={editorState.openSubmitConfirmDialog}
        onClose={closeSubmitConfirmDialog}
        onSubmit={updateMe}
        disabled={formDisabled}
      />
      <Page>
        {profile?.has_requested_modification_audit && <CurrentlyModAuditInProgress language={language} modificationAuditId={modificationAuditId} />}
        <PrimaryTitle variant="h4" children={titleStr} />
        <Stack spacing={2} sx={{ width: "100%", flexGrow: 1 }}>
          <PublicFileSelector label={speakerImageStr} value={editorState.image} onChange={onImageSelectChange} disabled={formDisabled} />
          <MultiLanguageField
            label={{ ko: "닉네임", en: "Nickname" }}
            value={{
              ko: editorState.nickname_ko || "",
              en: editorState.nickname_en || "",
            }}
            disabled={formDisabled}
            onChange={setNickname}
            description={{
              ko: "닉네임은 발표자 소개에 사용됩니다. 청중이 기억하기 쉬운 이름을 입력해주세요.",
              en: "The nickname will be used in the speaker biography. Please enter a name that is easy for the audience to remember.",
            }}
            name="nickname"
            fullWidth
          />
          <Alert severity="info">
            {language === "ko" ? (
              <>소셜 로그인 및 비밀번호 변경 등 로그인 계정 관리는 {accountsLink} 에서 수정해주세요.</>
            ) : (
              <>Login account management such as social login and password change can be done at {accountsLink}.</>
            )}
          </Alert>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SendAndArchive />}
            onClick={openSubmitConfirmDialog}
            children={submitStr}
            disabled={formDisabled}
          />
        </Stack>
      </Page>
    </>
  );
};

export const ProfileEditor: FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerProfileEditor />} />)
);

type ProfileEditorFormProps = {
  disabled?: boolean;
  showSubmitButton?: boolean;
  onSubmit?: (profile: ProfileSchema) => void;
  language: "ko" | "en";
  defaultValue: ProfileSchema;
};

// TODO: FIXME: 언젠간 위의 ProfileEditor를 아래 ProfileEditorForm에 마이그레이션해야 함
export const ProfileEditorForm: FC<ProfileEditorFormProps> = ({ disabled, language, defaultValue, showSubmitButton, onSubmit }) => {
  const [formState, setFormState] = useState<ProfileSchema>(defaultValue);
  const setImageId = (image: string | null) => setFormState((ps) => ({ ...ps, image }));
  const onImageSelectChange = (e: SelectChangeEvent<string | null>) => setImageId(e.target.value);
  const setNickname = (value: string | undefined, lang: "ko" | "en") => setFormState((ps) => ({ ...ps, [`nickname_${lang}`]: value }));

  const onSubmitClick = () => onSubmit?.(formState);

  const titleStr = language === "ko" ? "프로필 정보 수정" : "Edit Profile Information";
  const submitStr = language === "ko" ? "제출" : "Submit";
  const speakerImageStr = language === "ko" ? "프로필 이미지" : "Profile Image";

  return (
    <>
      <PrimaryTitle variant="h4" children={titleStr} />
      <Stack spacing={2} sx={{ width: "100%", flexGrow: 1 }}>
        <PublicFileSelector label={speakerImageStr} value={formState.image} disabled={disabled} onChange={onImageSelectChange} />
        <MultiLanguageField
          label={{ ko: "닉네임", en: "Nickname" }}
          value={{
            ko: formState.nickname_ko || "",
            en: formState.nickname_en || "",
          }}
          disabled={disabled}
          onChange={setNickname}
          description={{
            ko: "닉네임은 발표자 소개에 사용됩니다. 청중이 기억하기 쉬운 이름을 입력해주세요.",
            en: "The nickname will be used in the speaker biography. Please enter a name that is easy for the audience to remember.",
          }}
          name="nickname"
          fullWidth
        />
        {showSubmitButton && (
          <Button variant="contained" fullWidth startIcon={<SendAndArchive />} onClick={onSubmitClick} children={submitStr} disabled={disabled} />
        )}
      </Stack>
    </>
  );
};
