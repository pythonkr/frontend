import * as Common from "@frontend/common";
import { SendAndArchive } from "@mui/icons-material";
import { Box, Button, Divider, SelectChangeEvent, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import * as React from "react";
import { Navigate, useParams } from "react-router-dom";
import * as R from "remeda";

import { useAppContext } from "../../contexts/app_context";
import { SubmitConfirmDialog } from "../dialogs/submit_confirm";
import { ErrorPage } from "../elements/error_page";
import { LoadingPage } from "../elements/loading_page";
import { MultiLanguageField, MultiLanguageMarkdownField } from "../elements/multilang_field";
import { PublicFileSelector } from "../elements/public_file_selector";
import { SignInGuard } from "../elements/signin_guard";
import { PrimaryTitle, SecondaryTitle } from "../elements/titles";
import { Page } from "../page";

type SessionUpdateSchema = {
  title_ko: string;
  title_en: string;
  summary_ko: string;
  summary_en: string;
  description_ko: string;
  description_en: string;
  image?: string | null;

  speakers: {
    id: string; // UUID of the speaker
    biography_ko: string; // Biography in Korean
    biography_en: string; // Biography in English
    image?: string | null; // PK of the speaker's image
  }[];
};

type SessionEditorState = SessionUpdateSchema & {
  openSubmitConfirmDialog: boolean;
};

const DummySessionInfo: SessionUpdateSchema = {
  title_ko: "",
  title_en: "",
  summary_ko: "",
  summary_en: "",
  description_ko: "",
  description_en: "",
  image: null,

  speakers: [],
};

const InnerSessionEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { language } = useAppContext();
  const participantPortalClient = Common.Hooks.BackendParticipantPortalAPI.useParticipantPortalClient();
  const updateSessionMutation = Common.Hooks.BackendParticipantPortalAPI.useUpdatePresentationMutation(participantPortalClient);
  const { data: session } = Common.Hooks.BackendParticipantPortalAPI.useRetrievePresentationQuery(participantPortalClient, id || "");
  const [editorState, setEditorState] = React.useState<SessionEditorState>({
    openSubmitConfirmDialog: false,
    ...(session || DummySessionInfo),
  });

  if (!id || !session || !(R.isArray(editorState.speakers) && !R.isEmpty(editorState.speakers))) return <Navigate to="/" replace />;

  // 유저는 하나의 세션에 발표자가 한번만 가능하고, 백엔드에서 본 유저의 세션 발표자 정보만 제공하므로, 첫 번째 발표자 정보를 사용해도 안전합니다.
  const speaker = editorState.speakers[0];

  const titleStr = language === "ko" ? "발표 정보 수정" : "Edit Session Information";
  const submitStr = language === "ko" ? "제출" : "Submit";
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
  const submitSucceedStr =
    language === "ko"
      ? "발표 정보 수정을 요청했어요. 검토 후 반영될 예정이에요."
      : "Presentation information update requested. It will be applied after review.";

  const addSnackbar = (c: string | React.ReactNode, variant: OptionsObject["variant"]) =>
    enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

  const openSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, openSubmitConfirmDialog: true }));
  const closeSubmitConfirmDialog = () => setEditorState((ps) => ({ ...ps, openSubmitConfirmDialog: false }));

  const setTitle = (value: string | undefined, lang: "ko" | "en") => setEditorState((ps) => ({ ...ps, [`title_${lang}`]: value }));
  const setSummary = (value: string | undefined, lang: "ko" | "en") => setEditorState((ps) => ({ ...ps, [`summary_${lang}`]: value }));
  const setDescription = (value: string | undefined, lang: "ko" | "en") => setEditorState((ps) => ({ ...ps, [`description_${lang}`]: value }));
  const setImage = (image: string | null | undefined) => setEditorState((ps) => ({ ...ps, image }));
  const setSpeakerImage = (image: string | null | undefined) => setEditorState((ps) => ({ ...ps, speakers: [{ ...speaker, image }] }));
  const setSpeakerBiography = (value: string | undefined, lang: "ko" | "en") =>
    setEditorState((ps) => ({ ...ps, speakers: [{ ...speaker, [`biography_${lang}`]: value }] }));

  const onImageSelectChange = (e: SelectChangeEvent<string | null | undefined>) => setImage(e.target.value);
  const onSpeakerImageSelectChange = (e: SelectChangeEvent<string | null | undefined>) => setSpeakerImage(e.target.value);

  const updateSession = () => {
    updateSessionMutation.mutate(
      {
        id: id,
        title_ko: editorState.title_ko,
        title_en: editorState.title_en,
        summary_ko: editorState.summary_ko,
        summary_en: editorState.summary_en,
        description_ko: editorState.description_ko,
        description_en: editorState.description_en,
        image: editorState.image || null,
      },
      {
        onSuccess: () => {
          addSnackbar(submitSucceedStr, "success");
          closeSubmitConfirmDialog();
        },
        onError: (error) => {
          console.error("Updating session failed:", error);

          let errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          if (error instanceof Common.BackendAPIs.BackendAPIClientError) errorMessage = error.message;

          addSnackbar(errorMessage, "error");
        },
      }
    );
  };

  return (
    <>
      <SubmitConfirmDialog open={editorState.openSubmitConfirmDialog} onClose={closeSubmitConfirmDialog} onSubmit={updateSession} />
      <Page>
        <PrimaryTitle variant="h4" children={titleStr} />
        <Box sx={{ width: "100%", mb: 2, textAlign: "start" }} children={sessionEditDescription} />
        <Stack spacing={2} sx={{ width: "100%" }}>
          <MultiLanguageField
            label={{ ko: "발표 제목", en: "Session Title" }}
            value={{ ko: editorState.title_ko, en: editorState.title_en }}
            onChange={setTitle}
            fullWidth
          />
          <MultiLanguageField
            label={{ ko: "발표 요약", en: "Session Summary" }}
            description={{ ko: "발표를 짧게 요약해주세요.", en: "Please enter the short session summary." }}
            value={{ ko: editorState.summary_ko, en: editorState.summary_en }}
            onChange={setSummary}
            multiline
            rows={4}
            fullWidth
          />
          <MultiLanguageMarkdownField
            label={{ ko: "발표 내용", en: "Session Description" }}
            description={{
              ko: "발표의 상세 내용을 입력해주세요.\n상세 설명은 마크다운 문법을 지원합니다.",
              en: "Please enter the description of the session.\nDetailed descriptions support Markdown syntax.",
            }}
            value={{ ko: editorState.description_ko, en: editorState.description_en }}
            onChange={setDescription}
          />
          <PublicFileSelector label={sessionImageStr} value={editorState.image} onChange={onImageSelectChange} />
          <Divider />

          <SecondaryTitle variant="h5" children={titleStrForSpeaker} />
          <Box sx={{ width: "100%", mb: 2, textAlign: "start" }} children={speakerEditDescription} />
          <MultiLanguageMarkdownField
            label={{ ko: "발표자 소개", en: "Speaker Biography" }}
            value={{ ko: speaker.biography_ko || "", en: speaker.biography_en || "" }}
            onChange={setSpeakerBiography}
            description={{
              ko: "본인의 소개를 입력해주세요.\n본인 소개는 마크다운 문법을 지원합니다.",
              en: "Please enter your biography.\nBiographies support Markdown syntax.",
            }}
          />
          <PublicFileSelector label={speakerImageStr} value={speaker.image} onChange={onSpeakerImageSelectChange} />

          <Stack>
            <Button variant="contained" startIcon={<SendAndArchive />} onClick={openSubmitConfirmDialog} children={submitStr} />
          </Stack>
        </Stack>
      </Page>
    </>
  );
};

export const SessionEditor: React.FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerSessionEditor />} />)
);
