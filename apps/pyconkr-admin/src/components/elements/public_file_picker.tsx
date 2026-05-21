import { OpenInNew } from "@mui/icons-material";
import { Autocomplete, Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useBackendAdminClient, useChoicesQuery, usePublicFileQuery } from "@frontend/common/hooks/useAdminAPI";

type Option = { value: string; label: string };

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  // choices를 가져올 위치 (RJSF choices endpoint 활용)
  choicesApp: string;
  choicesResource: string;
  choicesField: string;
  // 확장자 화이트리스트 (대소문자 무시, 점 prefix 없이). 미지정 시 모든 파일 노출.
  acceptExtensions?: string[];
};

const PREVIEW_SIZE = 56;

const previewBoxSx = {
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
  flexShrink: 0,
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "action.hover",
  overflow: "hidden",
};

const ImagePreview: FC<{ id: string }> = ErrorBoundary.with(
  { fallback: () => <Box sx={previewBoxSx} /> },
  Suspense.with(
    {
      fallback: (
        <Box sx={previewBoxSx}>
          <CircularProgress size={20} />
        </Box>
      ),
    },
    ({ id }) => {
      const client = useBackendAdminClient();
      const { data } = usePublicFileQuery(client, id);
      if (!data) return <Box sx={previewBoxSx} />;
      const isImage = data.mimetype?.startsWith("image/");
      if (!isImage) {
        return (
          <Box
            component="a"
            href={data.file}
            target="_blank"
            rel="noopener"
            sx={{ ...previewBoxSx, fontSize: 11, textDecoration: "none", color: "text.secondary" }}
          >
            파일
          </Box>
        );
      }
      return (
        <Box component="a" href={data.file} target="_blank" rel="noopener" sx={previewBoxSx} title="원본 보기">
          <Box component="img" src={data.file} alt="" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </Box>
      );
    }
  )
);

export const PublicFilePicker: FC<Props> = ({ label = "이미지", value, onChange, choicesApp, choicesResource, choicesField, acceptExtensions }) => {
  const client = useBackendAdminClient();
  const choicesQuery = useChoicesQuery(client, choicesApp, choicesResource);
  const options: Option[] = useMemo(() => {
    const all = (choicesQuery.data?.[choicesField] ?? []).map((item) => ({ value: item.const ?? "", label: item.title }));
    if (!acceptExtensions || acceptExtensions.length === 0) return all;
    const allowed = acceptExtensions.map((e) => e.toLowerCase());
    return all.filter((opt) => allowed.some((ext) => opt.label.toLowerCase().endsWith(`.${ext}`)));
  }, [choicesQuery.data, choicesField, acceptExtensions]);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {value ? <ImagePreview id={value} /> : <Box sx={previewBoxSx} />}
      <Autocomplete
        options={options}
        value={selected}
        onChange={(_, newValue) => onChange(newValue?.value ?? "")}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(a, b) => a.value === b.value}
        sx={{ flexGrow: 1, minWidth: 240 }}
        renderInput={(params) => <TextField {...params} label={label} placeholder="파일을 선택하세요" />}
      />
      <Button
        component={RouterLink}
        to="/file/publicfile/create"
        target="_blank"
        variant="outlined"
        size="small"
        startIcon={<OpenInNew />}
        sx={{ flexShrink: 0 }}
      >
        새 파일 업로드
      </Button>
    </Stack>
  );
};
