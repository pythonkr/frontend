import { useBackendAdminClient, useRenderTemplateMutation, useRetrieveQuery } from "@frontend/common/hooks/useAdminAPI";
import { Close, Visibility } from "@mui/icons-material";
import { Box, Button, Chip, CircularProgress, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";

const APP = "notification";
const RESOURCE = "nhncloudkakaoalimtalknotificationtemplate";

type KakaoAlimTalkTemplateSchema = {
  id: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  str_repr: string;
  code: string;
  title: string;
  description: string;
  data: string;
  sent_from: string;
  template_variables: string[];
};

const isValidJson = (s: string): boolean => {
  if (!s.trim()) return true;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

const InnerAdminKakaoAlimTalkTemplateEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const backendAdminClient = useBackendAdminClient();
    const { data: retrievedData } = useRetrieveQuery<KakaoAlimTalkTemplateSchema>(backendAdminClient, APP, RESOURCE, id || "");

    const [contextJson, setContextJson] = useState("{}");
    const renderMutation = useRenderTemplateMutation(backendAdminClient, APP, RESOURCE);

    const onClose = () => navigate(`/${APP}/${RESOURCE}`);
    const jsonValid = isValidJson(contextJson);

    const handlePreview = () => {
      if (!id || renderMutation.isPending || !jsonValid) return;
      const context = contextJson.trim() ? JSON.parse(contextJson) : {};
      renderMutation.mutate({ id, context });
    };

    const title = `${APP.toUpperCase()} > ${RESOURCE.toUpperCase()} > ${id ? id : ""}`;

    if (!retrievedData) return null;

    return (
      <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={onClose} children={<Close />} />
        </Stack>
        <Stack spacing={2} sx={{ my: 2 }}>
          <TextField label="code" value={retrievedData.code} disabled fullWidth />
          <TextField label="title" value={retrievedData.title} disabled fullWidth />
          <TextField label="description" value={retrievedData.description} disabled multiline minRows={2} fullWidth />
          <TextField label="sent_from" value={retrievedData.sent_from} disabled helperText="NHN Cloud Console에서 관리됩니다." fullWidth />
          <TextField label="data" value={retrievedData.data} disabled multiline minRows={6} fullWidth />

          {retrievedData.template_variables.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                템플릿 변수
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {retrievedData.template_variables.map((v) => (
                  <Chip key={v} label={v} size="small" />
                ))}
              </Stack>
            </Box>
          )}

          {id && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                미리보기
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="context (JSON)"
                  value={contextJson}
                  onChange={(e) => setContextJson(e.target.value)}
                  error={!jsonValid}
                  helperText={jsonValid ? '예: {"name": "홍길동"}' : "유효한 JSON이 아닙니다."}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <Button variant="outlined" startIcon={<Visibility />} onClick={handlePreview} disabled={renderMutation.isPending || !jsonValid}>
                  미리보기 갱신
                </Button>
                {renderMutation.isPending ? (
                  <CircularProgress size={20} />
                ) : renderMutation.error ? (
                  <Typography color="error">미리보기를 불러오지 못했습니다.</Typography>
                ) : renderMutation.data ? (
                  <iframe
                    srcDoc={renderMutation.data}
                    style={{ width: "100%", height: 400, border: "1px solid #ccc", borderRadius: 4 }}
                    title="카카오 알림톡 템플릿 미리보기"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    미리보기 갱신 버튼을 눌러주세요.
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    );
  })
);

export const AdminKakaoAlimTalkTemplateEditor: FC = () => (
  <BackendAdminSignInGuard>
    <InnerAdminKakaoAlimTalkTemplateEditor />
  </BackendAdminSignInGuard>
);
