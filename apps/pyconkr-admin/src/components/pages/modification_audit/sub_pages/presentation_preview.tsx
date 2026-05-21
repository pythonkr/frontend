import { Card, Divider, TextField, Typography } from "@mui/material";

import { PreviewImageField, PreviewMarkdownField, PreviewTextField } from "@apps/pyconkr-admin/components/pages/modification_audit/components";
import { Fieldset } from "@frontend/common/components";

import { PresentationPreviewSchema, SubModificationAuditPageType } from "./types";

type PresentationSpeakerPreviewItemProps = {
  originalSpeaker: PresentationPreviewSchema["speakers"][number];
  modifiedSpeaker: PresentationPreviewSchema["speakers"][number];
};

const isSpeakerModified = (original: PresentationPreviewSchema["speakers"][number], modified: PresentationPreviewSchema["speakers"][number]) => {
  return (
    original.id !== modified.id ||
    original.user.id !== modified.user.id ||
    original.biography_ko !== modified.biography_ko ||
    original.biography_en !== modified.biography_en ||
    original.image !== modified.image
  );
};

const PresentationSpeakerPreviewItem: React.FC<PresentationSpeakerPreviewItemProps> = ({ originalSpeaker, modifiedSpeaker }) => {
  const innerSpeakerPreviewItem = (
    <Fieldset legend={`발표자: ${modifiedSpeaker.user.nickname_ko} (${modifiedSpeaker.user.nickname_en})`}>
      <Fieldset legend="발표자 별칭">
        <TextField fullWidth disabled variant="outlined" value={modifiedSpeaker.user.nickname_ko} label="발표자 별칭 (국문)" sx={{ my: 1 }} />
        <TextField fullWidth disabled variant="outlined" value={modifiedSpeaker.user.nickname_en} label="발표자 별칭 (영문)" sx={{ my: 1 }} />
      </Fieldset>
      <PreviewImageField originalDataset={originalSpeaker} previewDataset={modifiedSpeaker} name="image_id" label="발표자 이미지" />
      <Fieldset legend="발표자 약력">
        <PreviewMarkdownField originalDataset={originalSpeaker} previewDataset={modifiedSpeaker} name="biography_ko" label="발표자 약력 (국문)" />
        <PreviewMarkdownField originalDataset={originalSpeaker} previewDataset={modifiedSpeaker} name="biography_en" label="발표자 약력 (영문)" />
      </Fieldset>
    </Fieldset>
  );

  return isSpeakerModified(originalSpeaker, modifiedSpeaker) ? (
    <Card sx={{ width: "100%", backgroundColor: "rgba(255, 255, 0, 0.1)" }} children={innerSpeakerPreviewItem} />
  ) : (
    innerSpeakerPreviewItem
  );
};

export const PresentationPreviewSubPage: SubModificationAuditPageType<PresentationPreviewSchema> = ({ original, modified }) => {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" children="발표 내용" />
      <Fieldset legend="제목">
        <PreviewTextField originalDataset={original} previewDataset={modified} name="title_ko" label="제목 (한국어)" />
        <PreviewTextField originalDataset={original} previewDataset={modified} name="title_en" label="제목 (영어)" />
      </Fieldset>
      <Fieldset legend="발표 자료 URL">
        <PreviewTextField originalDataset={original} previewDataset={modified} name="slideshow_url" label="발표 자료 URL" />
      </Fieldset>
      <Fieldset legend="요약">
        <PreviewTextField originalDataset={original} previewDataset={modified} multiline name="summary_ko" label="요약 (한국어)" />
        <PreviewTextField originalDataset={original} previewDataset={modified} multiline name="summary_en" label="요약 (영어)" />
      </Fieldset>
      <Fieldset legend="상세 설명">
        <PreviewMarkdownField originalDataset={original} previewDataset={modified} name="description_ko" label="상세 설명 (한국어)" />
        <PreviewMarkdownField originalDataset={original} previewDataset={modified} name="description_en" label="상세 설명 (영어)" />
      </Fieldset>
      <PreviewImageField originalDataset={original} previewDataset={modified} name="image_id" label="발표 이미지" />

      <Divider sx={{ my: 1, borderColor: "black" }} />
      <Typography variant="h6" fontWeight="bold" children="발표자 정보" />
      {modified.speakers.map((speaker) => (
        <PresentationSpeakerPreviewItem
          key={speaker.id}
          originalSpeaker={original.speakers.find((s) => s.id === speaker.id) || speaker}
          modifiedSpeaker={speaker}
        />
      ))}
    </>
  );
};
