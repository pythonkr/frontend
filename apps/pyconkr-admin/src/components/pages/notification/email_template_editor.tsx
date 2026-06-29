import {
  useBackendAdminClient,
  useCreateMutation,
  useRenderTemplateMutation,
  useRetrieveQuery,
  useUpdateMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { type EmailDocument, MailEditor, type MailEditorHandle, parseEmailDocument } from "@mu-software/mail-editor";
import { Add, Close, Save, Visibility } from "@mui/icons-material";
import { Box, Button, Chip, CircularProgress, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { DEFAULT_INITIAL_DOCUMENT } from "@apps/pyconkr-admin/components/pages/notification/email_template_default_document";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

const APP = "notification";
const RESOURCE = "emailnotificationtemplate";

type EmailTemplateMetaFormData = {
  code: string;
  title: string;
  description: string;
  sent_from: string;
};

type EmailTemplatePayload = EmailTemplateMetaFormData & {
  data: string;
  editor_source: EmailDocument;
};

type EmailTemplateSchema = EmailTemplatePayload & {
  id: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  str_repr: string;
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

const toInitialDocument = (source: EmailTemplateSchema["editor_source"] | undefined): EmailDocument => {
  if (!source) return DEFAULT_INITIAL_DOCUMENT;
  try {
    return typeof source === "string" ? parseEmailDocument(source) : source;
  } catch {
    return DEFAULT_INITIAL_DOCUMENT;
  }
};

const InnerAdminEmailTemplateEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const backendAdminClient = useBackendAdminClient();
    const { data: retrievedData } = useRetrieveQuery<EmailTemplateSchema>(backendAdminClient, APP, RESOURCE, id || "");

    const [meta, setMeta] = useState<EmailTemplateMetaFormData>(() => ({
      code: retrievedData?.code ?? "",
      title: retrievedData?.title ?? "",
      description: retrievedData?.description ?? "",
      sent_from: retrievedData?.sent_from ?? "",
    }));
    const [contextJson, setContextJson] = useState("{}");

    const editorRef = useRef<MailEditorHandle>(null);
    const initialDocument = useMemo(() => toInitialDocument(retrievedData?.editor_source), [retrievedData?.editor_source]);

    const createMutation = useCreateMutation<EmailTemplatePayload>(backendAdminClient, APP, RESOURCE);
    const updateMutation = useUpdateMutation<EmailTemplatePayload>(backendAdminClient, APP, RESOURCE, id || "");
    const renderMutation = useRenderTemplateMutation(backendAdminClient, APP, RESOURCE);

    const setField = <K extends keyof EmailTemplateMetaFormData>(key: K, value: EmailTemplateMetaFormData[K]) =>
      setMeta((p) => ({ ...p, [key]: value }));
    const onClose = () => navigate(`/${APP}/${RESOURCE}`);

    const isPending = createMutation.isPending || updateMutation.isPending;
    const jsonValid = isValidJson(contextJson);

    const handleSubmit = async () => {
      if (isPending) return;
      if (!editorRef.current) {
        addSnackbar("에디터가 아직 준비되지 않았습니다.", "error");
        return;
      }
      const editor_source = editorRef.current.exportEmailDocument();
      const data = await editorRef.current.exportHTML();
      const payload: EmailTemplatePayload = { ...meta, data, editor_source };
      if (id) {
        updateMutation.mutate(payload, {
          onSuccess: () => addSnackbar("수정했습니다.", "success"),
          onError: addErrorSnackbar,
        });
      } else {
        createMutation.mutate(payload, {
          onSuccess: (created) => {
            addSnackbar("생성했습니다.", "success");
            const newId = (created as EmailTemplatePayload & { id?: string }).id;
            if (newId) navigate(`/${APP}/${RESOURCE}/${newId}`);
          },
          onError: addErrorSnackbar,
        });
      }
    };

    const handlePreview = () => {
      if (!id || renderMutation.isPending || !jsonValid) return;
      const context = contextJson.trim() ? JSON.parse(contextJson) : {};
      renderMutation.mutate({ id, context });
    };

    const title = `${APP.toUpperCase()} > ${RESOURCE.toUpperCase()} > ${id ? "편집: " + id : "새 객체 추가"}`;

    return (
      <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={onClose} children={<Close />} />
        </Stack>
        <Stack spacing={2} sx={{ my: 2 }}>
          <TextField label="code" value={meta.code} onChange={(e) => setField("code", e.target.value)} fullWidth />
          <TextField label="title" value={meta.title} onChange={(e) => setField("title", e.target.value)} fullWidth />
          <TextField
            label="description"
            value={meta.description}
            onChange={(e) => setField("description", e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            label="sent_from"
            value={meta.sent_from}
            onChange={(e) => setField("sent_from", e.target.value)}
            helperText="발신 이메일 주소"
            fullWidth
          />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              본문 에디터
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              변수는 {"{{ name }}"} 형식으로 사용합니다. 저장 시 EmailDocument JSON은 editor_source에, 렌더된 HTML은 data 필드에 기록됩니다.
            </Typography>
            <Box sx={{ height: 800, border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
              <MailEditor ref={editorRef} initialDocument={initialDocument} />
            </Box>
          </Box>

          {retrievedData && retrievedData.template_variables.length > 0 && (
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
                    style={{ width: "100%", height: 500, border: "1px solid #ccc", borderRadius: 4 }}
                    title="이메일 템플릿 미리보기"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    미리보기 갱신 버튼을 눌러주세요. 최신 본문을 미리보려면 먼저 저장해주세요.
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isPending} startIcon={id ? <Save /> : <Add />}>
            {id ? "수정" : "새 객체 추가"}
          </Button>
        </Stack>
      </Box>
    );
  })
);

export const AdminEmailTemplateEditor: FC = () => (
  <BackendAdminSignInGuard>
    <InnerAdminEmailTemplateEditor />
  </BackendAdminSignInGuard>
);
