import { SendAndArchive } from "@mui/icons-material";
import { Box, Button, Divider, SelectChangeEvent, Stack, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { FC, ReactNode, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { SubmitConfirmDialog } from "@apps/pyconkr-participant-portal/components/dialogs/submit_confirm";
import { BlockQuote } from "@apps/pyconkr-participant-portal/components/elements/blockquote";
import { ErrorPage } from "@apps/pyconkr-participant-portal/components/elements/error_page";
import { LoadingPage } from "@apps/pyconkr-participant-portal/components/elements/loading_page";
import { MultiLanguageField, MultiLanguageMarkdownField } from "@apps/pyconkr-participant-portal/components/elements/multilang_field";
import { PublicFileSelector } from "@apps/pyconkr-participant-portal/components/elements/public_file_selector";
import { CurrentlyModAuditInProgress } from "@apps/pyconkr-participant-portal/components/elements/requested_modification_audit_available_header";
import { SignInGuard } from "@apps/pyconkr-participant-portal/components/elements/signin_guard";
import { PrimaryTitle, SecondaryTitle } from "@apps/pyconkr-participant-portal/components/elements/titles";
import { Page } from "@apps/pyconkr-participant-portal/components/page";
import { useAppContext } from "@apps/pyconkr-participant-portal/contexts/app_context";
import { BackendAPIClientError } from "@frontend/common/apis";
import { Fieldset } from "@frontend/common/components";
import {
  useParticipantPortalClient,
  useRetrievePresentationQuery,
  useUpdatePresentationMutation,
} from "@frontend/common/hooks/useParticipantPortalAPI";

type SessionUpdateSchema = {
  id: string;
  title_ko: string;
  title_en: string;
  summary_ko: string;
  summary_en: string;
  description_ko: string;
  description_en: string;
  slideshow_url: string | null;
  image: string | null;

  speakers: {
    id: string; // UUID of the speaker
    biography_ko: string; // Biography in Korean
    biography_en: string; // Biography in English
    image: string | null; // PK of the speaker's image
  }[];
};

export type SessionSchema = SessionUpdateSchema & {
  speakers: (SessionUpdateSchema["speakers"][number] & {
    user: {
      id: number; // UUID of the user
      email: string; // Email of the user
      nickname_ko: string | null; // Nickname in Korean
      nickname_en: string | null; // Nickname in English
    };
  })[];
};

type SessionEditorFormProps = {
  disabled?: boolean;
  showSubmitButton?: boolean;
  onSubmit?: (session: SessionUpdateSchema) => void;
  language: "ko" | "en";
  defaultValue: SessionSchema;
};

type SessionEditorFormState = SessionSchema;

export const SessionEditorForm: FC<SessionEditorFormProps> = ({ disabled, language, defaultValue, showSubmitButton, onSubmit }) => {
  const [formState, setFormState] = useState<SessionEditorFormState>(defaultValue);

  const setTitle = (value: string | undefined, lang: "ko" | "en") => setFormState((ps) => ({ ...ps, [`title_${lang}`]: value }));
  const setSummary = (value: string | undefined, lang: "ko" | "en") => setFormState((ps) => ({ ...ps, [`summary_${lang}`]: value }));
  const setDescription = (value: string | undefined, lang: "ko" | "en") => setFormState((ps) => ({ ...ps, [`description_${lang}`]: value }));
  const setSlideshowUrl = (slideshow_url: string) => setFormState((ps) => ({ ...ps, slideshow_url }));
  const setImage = (image: string | null) => setFormState((ps) => ({ ...ps, image }));
  const setSpeakerImage = (image: string | null) => setFormState((ps) => ({ ...ps, speakers: [{ ...speaker, image }] }));
  const setSpeakerBiography = (value: string | undefined, lang: "ko" | "en") =>
    setFormState((ps) => ({ ...ps, speakers: [{ ...speaker, [`biography_${lang}`]: value }] }));
  const onImageSelectChange = (e: SelectChangeEvent<string | null>) => setImage(e.target.value);
  const onSpeakerImageSelectChange = (e: SelectChangeEvent<string | null>) => setSpeakerImage(e.target.value);

  const onSubmitButtonClick = () => onSubmit?.(formState);

  // 유저는 하나의 세션에 발표자가 한번만 가능하고, 백엔드에서 본 유저의 세션 발표자 정보만 제공하므로, 첫 번째 발표자 정보를 사용해도 안전합니다.
  const speaker = formState.speakers[0];

  const titleStr = language === "ko" ? "발표 정보 수정" : "Edit Session Information";
  const slideShowStr = language === "ko" ? "발표 슬라이드쇼 URL" : "Session Slideshow URL";
  const slideShowDescription =
    language === "ko" ? (
      <Typography variant="body2" color="textSecondary">
        발표 중에 사용할 슬라이드 자료 URL을 입력해주세요. (선택 사항)
      </Typography>
    ) : (
      <Typography variant="body2" color="textSecondary">
        Please enter the URL of the slideshow material to be used during the session. (Optional)
      </Typography>
    );
  const sessionEditDescription =
    language === "ko" ? (
      <Typography variant="body2" color="textSecondary">
        청취자가 발표에 흥미를 가질 수 있도록 제목과 요약, 설명을 작성해주세요.
        <br />
        (한국어와 영어 둘 중 하나만 작성하면, 홈페이지가 다른 언어로 설정되어 있더라도 작성한 언어의 내용만 보여져요. 해외에서 오시는 분들을 위해
        &nbsp;양 언어를 작성하는 것을 추천합니다.)
      </Typography>
    ) : (
      <Typography variant="body2" color="textSecondary">
        Please write the title, summary, and description to spark the interest of the audience in your session.
        <br />
        (If you write in only one of the languages, the content will be displayed in that language even if the website is set to a different language.
        &nbsp;We recommend writing in both languages for the benefit of international attendees.)
      </Typography>
    );
  const titleStrForSpeaker = language === "ko" ? "발표자 정보 수정" : "Edit Speaker Information";
  const speakerEditDescription =
    language === "ko" ? (
      <Typography variant="body2" color="textSecondary">
        발표자 소개는 청취자가 발표자를 이해하는 데 도움이 됩니다.
        <br />
        (한국어와 영어 둘 중 하나만 작성하면, 홈페이지가 다른 언어로 설정되어 있더라도 작성한 언어의 내용만 보여져요. 해외에서 오시는 분들을 위해
        &nbsp;양 언어를 작성하는 것을 추천합니다.)
      </Typography>
    ) : (
      <Typography variant="body2" color="textSecondary">
        The speaker biography helps the audience understand the speaker.
        <br />
        (If you write in only one of the languages, the content will be displayed in that language even if the website is set to a different language.
        &nbsp;We recommend writing in both languages for the benefit of international attendees.)
      </Typography>
    );
  const sessionImageStr = language === "ko" ? "발표 이미지" : "Session Image";
  const speakerImageStr = language === "ko" ? "발표자 이미지" : "Speaker Image";
  const submitStr = language === "ko" ? "제출" : "Submit";

  return (
    <>
      <PrimaryTitle variant="h4" children={titleStr} />
      <Box sx={{ width: "100%", mb: 2, textAlign: "start" }} children={sessionEditDescription} />
      <Stack spacing={2} sx={{ width: "100%" }}>
        <MultiLanguageField
          label={{ ko: "발표 제목", en: "Session Title" }}
          value={{ ko: formState.title_ko, en: formState.title_en }}
          onChange={setTitle}
          disabled={disabled}
          fullWidth
        />
        <Fieldset legend={slideShowStr}>
          <BlockQuote children={slideShowDescription} />
          <TextField
            label={slideShowStr}
            value={formState.slideshow_url || ""}
            onChange={(e) => setSlideshowUrl(e.target.value)}
            disabled={disabled}
            sx={{ mt: 2 }}
            fullWidth
          />
        </Fieldset>
        <MultiLanguageField
          label={{ ko: "발표 요약", en: "Session Summary" }}
          description={{ ko: "발표를 짧게 요약해주세요.", en: "Please enter the short session summary." }}
          value={{ ko: formState.summary_ko, en: formState.summary_en }}
          onChange={setSummary}
          disabled={disabled}
          multiline
          rows={4}
          fullWidth
        />
        <MultiLanguageMarkdownField
          label={{ ko: "발표 상세", en: "Session Description" }}
          description={{
            ko: "발표의 상세 내용을 입력해주세요.\n상세 설명은 마크다운 문법을 지원합니다.",
            en: "Please enter the description of the session.\nDetailed descriptions support Markdown syntax.",
          }}
          value={{ ko: formState.description_ko, en: formState.description_en }}
          disabled={disabled}
          onChange={setDescription}
        />
        <PublicFileSelector label={sessionImageStr} value={formState.image} disabled={disabled} onChange={onImageSelectChange} />
        <Divider />

        <SecondaryTitle variant="h5" children={titleStrForSpeaker} />
        <Box sx={{ width: "100%", mb: 2, textAlign: "start" }} children={speakerEditDescription} />
        <MultiLanguageField
          label={{ ko: "발표자 별칭", en: "Speaker Nickname" }}
          description={{
            ko: (
              <Stack spacing={1}>
                <Typography variant="body2" color="textSecondary" children="발표자 별칭은 프로필 편집에서 변경할 수 있어요." />
                <Link to="/user" children={<Button size="small" variant="contained" children="프로필 수정 페이지로 이동" />} />
              </Stack>
            ),
            en: (
              <Stack spacing={1}>
                <Typography variant="body2" color="textSecondary" children="You can change speaker nickname in the profile editor." />
                <Link to="/user" children={<Button size="small" variant="contained" children="Go to Profile Editor" />} />
              </Stack>
            ),
          }}
          // value={{ ko: speaker.user.nickname_ko || "", en: speaker.user.nickname_en || "" }}
          disabled
          fullWidth
        />
        <MultiLanguageMarkdownField
          label={{ ko: "발표자 소개", en: "Speaker Biography" }}
          value={{ ko: speaker.biography_ko || "", en: speaker.biography_en || "" }}
          onChange={setSpeakerBiography}
          disabled={disabled}
          description={{
            ko: "본인의 소개를 입력해주세요.\n본인 소개는 마크다운 문법을 지원합니다.",
            en: "Please enter your biography.\nBiographies support Markdown syntax.",
          }}
        />
        <PublicFileSelector label={speakerImageStr} value={speaker.image} disabled={disabled} onChange={onSpeakerImageSelectChange} />
        {showSubmitButton && (
          <Button variant="contained" startIcon={<SendAndArchive />} onClick={onSubmitButtonClick} disabled={disabled} children={submitStr} />
        )}
      </Stack>
    </>
  );
};

type SessionEditorState = {
  openSubmitConfirmDialog: boolean;
  formData?: SessionUpdateSchema;
};

const InnerSessionEditor: FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const { language } = useAppContext();
  const [editorState, setEditorState] = useState<SessionEditorState>({ openSubmitConfirmDialog: false });
  const participantPortalClient = useParticipantPortalClient();
  const updateSessionMutation = useUpdatePresentationMutation(participantPortalClient);
  const { data: session } = useRetrievePresentationQuery(participantPortalClient, sessionId || "");

  if (!sessionId || !session) return <Navigate to="/" replace />;

  const submitSucceedStr =
    language === "ko"
      ? "발표 정보 수정을 요청했어요. 검토 후 반영될 예정이에요."
      : "Presentation information update requested. It will be applied after review.";

  const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const openSubmitConfirmDialog = (formData: SessionUpdateSchema) => setEditorState((ps) => ({ ...ps, openSubmitConfirmDialog: true, formData }));
  const closeSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, openSubmitConfirmDialog: false }));

  const updateSession = () => {
    if (!editorState.formData) return;

    updateSessionMutation.mutate(editorState.formData, {
      onSuccess: () => {
        addSnackbar(submitSucceedStr, "success");
        closeSubmitConfirmDialog();
      },
      onError: (error) => {
        console.error("Updating session failed:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        if (error instanceof BackendAPIClientError) errorMessage = error.message;

        addSnackbar(errorMessage, "error");
      },
    });
  };

  const modificationAuditId = session.requested_modification_audit_id || "";
  const formDisabled = session.has_requested_modification_audit || updateSessionMutation.isPending;

  return (
    <>
      <SubmitConfirmDialog
        open={editorState.openSubmitConfirmDialog}
        onClose={closeSubmitConfirmDialog}
        onSubmit={updateSession}
        disabled={formDisabled}
      />
      <Page>
        {session.has_requested_modification_audit && <CurrentlyModAuditInProgress language={language} modificationAuditId={modificationAuditId} />}
        <SessionEditorForm disabled={formDisabled} language={language} defaultValue={session} onSubmit={openSubmitConfirmDialog} showSubmitButton />
      </Page>
    </>
  );
};

export const SessionEditor: FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerSessionEditor />} />)
);
