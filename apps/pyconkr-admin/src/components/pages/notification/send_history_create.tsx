import { Fieldset } from "@frontend/common/components";
import { useBackendAdminClient, useCreateMutation, useListPaginatedQuery, useRenderTemplateMutation } from "@frontend/common/hooks/useAdminAPI";
import { Add, Close, Delete, Send, Visibility } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { NotificationChannel, NotificationChannelKind } from "@apps/pyconkr-admin/components/pages/notification/channels";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type AdminNotificationHistoryCreateProps = {
  channel: NotificationChannel;
};

type NotificationHistorySentToCreateRequest = {
  recipient: string;
  context: Record<string, unknown>;
};

type NotificationHistoryCreateRequest = {
  id?: string;
  template?: string | null;
  template_data?: string;
  sent_from?: string;
  sent_to_list: NotificationHistorySentToCreateRequest[];
};

type NotificationTemplateSchema = {
  id: string;
  str_repr: string;
  code: string;
  title: string;
  description: string;
  data: string;
  sent_from: string;
  template_variables: string[];
};

type OnMemorySentTo = {
  trackId: string;
  recipient: string;
  context: Record<string, string>;
};

const createEmptySentTo = (): OnMemorySentTo => ({
  trackId: Math.random().toString(36).substring(2, 15),
  recipient: "",
  context: {},
});

const NotAppliableToAllRecipientsFieldList = [
  "name",
  "email",
  "phone_number",
  "organization",
  "scancode_url",
  "성함",
  "성명",
  "이메일",
  "전화번호",
  "소속",
];

// ---- 검증 ----------------------------------------------------------------
const URL_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?].*)?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERNATIONAL_PHONE_REGEX = /^\+\d{1,4}[-\s]?\d+(?:[-\s]?\d+)*$/;
const KOREAN_PHONE_REGEX = /^01[016-9][-\s]?\d{3,4}[-\s]?\d{4}$/;

const isValidEmail = (value: string) => EMAIL_REGEX.test(value);
const isValidUrl = (value: string) => URL_REGEX.test(value);
const isValidPhone = (value: string) => KOREAN_PHONE_REGEX.test(value) || INTERNATIONAL_PHONE_REGEX.test(value);

const validateRecipientForKind = (kind: NotificationChannelKind, value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (kind === "email") return isValidEmail(trimmed) ? null : "이메일 형식이 아닙니다";
  return isValidPhone(trimmed) ? null : "휴대폰번호 형식이 아닙니다";
};

const validateTemplateVariable = (name: string, value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = name.toLowerCase();
  if (lower.includes("url")) return isValidUrl(trimmed) ? null : "URL 형식이 아닙니다";
  if (lower.includes("email")) return isValidEmail(trimmed) ? null : "이메일 형식이 아닙니다";
  if (lower.includes("phone")) return isValidPhone(trimmed) ? null : "휴대폰번호 형식이 아닙니다";
  return null;
};

// ---- 컴포넌트 ------------------------------------------------------------

type TemplateVariableFieldProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const TemplateVariableField: FC<TemplateVariableFieldProps> = ({ name, value, onChange, disabled }) => {
  const error = validateTemplateVariable(name, value);
  return (
    <TextField
      label={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      error={!!error}
      helperText={error || undefined}
      fullWidth
    />
  );
};

type SentToFormProps = {
  item: OnMemorySentTo;
  kind: NotificationChannelKind;
  perRecipientVarNames: string[];
  onChange: (item: OnMemorySentTo) => void;
  onRemove: (item: OnMemorySentTo) => void;
  onPreview?: (item: OnMemorySentTo) => void;
};

const SentToForm: FC<SentToFormProps> = ({ item, kind, perRecipientVarNames, onChange, onRemove, onPreview }) => {
  const setContextField = (varName: string, value: string) => onChange({ ...item, context: { ...item.context, [varName]: value } });
  const recipientError = validateRecipientForKind(kind, item.recipient);
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <TextField
            label="수신자 연락처"
            value={item.recipient}
            onChange={(e) => onChange({ ...item, recipient: e.target.value })}
            error={!!recipientError}
            helperText={recipientError || undefined}
            fullWidth
          />
          {perRecipientVarNames.length > 0 && (
            <Fieldset legend="템플릿 변수">
              <Stack spacing={1}>
                {perRecipientVarNames.map((varName) => (
                  <TemplateVariableField
                    key={varName}
                    name={varName}
                    value={item.context[varName] ?? ""}
                    onChange={(v) => setContextField(varName, v)}
                  />
                ))}
              </Stack>
            </Fieldset>
          )}
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            {onPreview && (
              <Button variant="outlined" color="info" size="small" startIcon={<Visibility />} onClick={() => onPreview(item)}>
                이 수신자 데이터로 미리보기
              </Button>
            )}
            <Button variant="outlined" color="error" size="small" startIcon={<Delete />} onClick={() => onRemove(item)}>
              수신자 삭제
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const InnerAdminNotificationHistoryCreate: FC<AdminNotificationHistoryCreateProps> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ channel }) => {
    const { app, kind, historyResource, templateResource } = channel;
    const navigate = useNavigate();
    const backendAdminClient = useBackendAdminClient();
    const createMutation = useCreateMutation<NotificationHistoryCreateRequest>(backendAdminClient, app, historyResource);

    const [formData, setFormData] = useState<{
      template: string | null;
      template_data: string;
      sent_from: string;
    }>({
      template: null,
      template_data: "",
      sent_from: "",
    });
    const [sentToList, setSentToList] = useState<OnMemorySentTo[]>([]);
    const [templateContext, setTemplateContext] = useState<Record<string, string>>({});
    const [globalVarFlags, setGlobalVarFlags] = useState<Record<string, boolean>>({});

    const templateListQuery = useListPaginatedQuery<NotificationTemplateSchema>(backendAdminClient, app, templateResource, { page_size: "200" });
    const renderTemplateMutation = useRenderTemplateMutation(backendAdminClient, app, templateResource);
    const selectedTemplate = templateListQuery.data.results.find((t) => t.id === formData.template) ?? null;
    const templateVariables = selectedTemplate?.template_variables ?? [];

    const isGlobalVar = (varName: string) => globalVarFlags[varName] ?? !NotAppliableToAllRecipientsFieldList.includes(varName);
    const perRecipientVarNames = templateVariables.filter((v) => !isGlobalVar(v));

    const onClose = () => navigate(`/${app}/${historyResource}`);
    const onAddSentTo = () => setSentToList((p) => [...p, createEmptySentTo()]);
    const onChangeSentTo = (item: OnMemorySentTo) => setSentToList((p) => p.map((s) => (s.trackId === item.trackId ? item : s)));
    const onRemoveSentTo = (item: OnMemorySentTo) => setSentToList((p) => p.filter((s) => s.trackId !== item.trackId));
    const onTemplateChange = (templateId: string | null) => {
      setFormData((p) => ({ ...p, template: templateId }));
      setTemplateContext({});
      setGlobalVarFlags({});
      if (templateId) {
        renderTemplateMutation.mutate({ id: templateId, context: {} });
      } else {
        renderTemplateMutation.reset();
      }
    };
    const onRefreshPreview = () => {
      if (!formData.template) return;
      renderTemplateMutation.mutate({ id: formData.template, context: templateContext });
    };
    const onPreviewWithRecipient = (item: OnMemorySentTo) => {
      if (!formData.template) return;
      const globalContext: Record<string, string> = {};
      templateVariables.forEach((varName) => {
        if (isGlobalVar(varName)) globalContext[varName] = templateContext[varName] ?? "";
      });
      renderTemplateMutation.mutate({ id: formData.template, context: { ...globalContext, ...item.context } });
    };
    const onToggleGlobalVar = (varName: string, checked: boolean) => setGlobalVarFlags((p) => ({ ...p, [varName]: checked }));

    const sentFromError = !selectedTemplate ? validateRecipientForKind(kind, formData.sent_from) : null;

    // 발송 버튼 비활성화 사유: 우선순위에 따라 첫 번째로 매칭되는 메시지 반환. 모두 통과하면 null.
    // 우선순위: 템플릿 선택 → 수신자 연락처 (누락/형식) → sent_from 형식 → 템플릿 변수 (누락/형식).
    const submitBlockMessage = ((): string | null => {
      if (!formData.template) return "템플릿을 선택해주세요";
      if (sentToList.length === 0 || sentToList.some((s) => !s.recipient.trim())) return "수신자 연락처 입력이 누락되었습니다";
      if (sentToList.some((s) => validateRecipientForKind(kind, s.recipient))) return "수신자 연락처 형식이 올바르지 않습니다";
      if (sentFromError) return "sent_from 형식이 올바르지 않습니다";
      for (const varName of templateVariables) {
        if (isGlobalVar(varName)) {
          const value = templateContext[varName] ?? "";
          if (!value.trim()) return "누락된 템플릿 변수 입력이 있습니다";
          if (validateTemplateVariable(varName, value)) return "템플릿 변수 입력 형식이 올바르지 않습니다";
        } else {
          for (const s of sentToList) {
            const value = s.context[varName] ?? "";
            if (!value.trim()) return "누락된 템플릿 변수 입력이 있습니다";
            if (validateTemplateVariable(varName, value)) return "템플릿 변수 입력 형식이 올바르지 않습니다";
          }
        }
      }
      return null;
    })();

    const buildPayload = (): NotificationHistoryCreateRequest => {
      const globalContext: Record<string, string> = {};
      templateVariables.forEach((varName) => {
        if (isGlobalVar(varName)) globalContext[varName] = templateContext[varName] ?? "";
      });
      return {
        template: formData.template,
        template_data: formData.template_data,
        sent_from: selectedTemplate ? selectedTemplate.sent_from : formData.sent_from,
        sent_to_list: sentToList.map((s) => ({
          recipient: s.recipient,
          context: { ...globalContext, ...s.context },
        })),
      };
    };

    const handleSubmit = () => {
      if (createMutation.isPending) return;
      if (sentToList.length === 0) {
        addSnackbar("수신자를 한 명 이상 추가해주세요.", "error");
        return;
      }

      createMutation.mutate(buildPayload(), {
        onSuccess: (data) => {
          addSnackbar("발송 요청을 완료했습니다.", "success");
          const newId = (data as NotificationHistoryCreateRequest).id;
          if (newId) navigate(`/${app}/${historyResource}/${newId}`);
        },
        onError: addErrorSnackbar,
      });
    };

    const title = `${app.toUpperCase()} > ${historyResource.toUpperCase()} > 새로 발송`;

    return (
      <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={onClose} children={<Close />} />
        </Stack>
        <Stack spacing={2} sx={{ my: 2 }}>
          <Stack direction="row" spacing={2}>
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <FormControl fullWidth>
                <InputLabel id="template-select-label">template</InputLabel>
                <Select
                  labelId="template-select-label"
                  label="template"
                  value={formData.template ?? ""}
                  onChange={(e) => onTemplateChange((e.target.value as string) || null)}
                >
                  <MenuItem value="">
                    <em>(없음)</em>
                  </MenuItem>
                  {templateListQuery.data.results.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.str_repr}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack spacing={1}>
                {!formData.template ? (
                  <Typography variant="body2" color="text.secondary">
                    템플릿을 선택해주세요.
                  </Typography>
                ) : templateVariables.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    이 템플릿은 변수가 없습니다.
                  </Typography>
                ) : (
                  <>
                    <TextField
                      label="sent_from"
                      value={selectedTemplate ? selectedTemplate.sent_from : formData.sent_from}
                      onChange={(e) => setFormData((p) => ({ ...p, sent_from: e.target.value }))}
                      disabled={!!selectedTemplate}
                      error={!!sentFromError}
                      helperText={selectedTemplate ? "선택된 템플릿의 sent_from 값을 사용합니다." : sentFromError || undefined}
                      fullWidth
                    />
                    <Fieldset legend="템플릿 변수">
                      {templateVariables.map((varName) => {
                        const isAllRecipientsForbidden = NotAppliableToAllRecipientsFieldList.includes(varName);
                        const globalChecked = isGlobalVar(varName);
                        return (
                          <Fragment key={varName}>
                            <TemplateVariableField
                              name={varName}
                              value={templateContext[varName] ?? ""}
                              onChange={(v) => setTemplateContext((p) => ({ ...p, [varName]: v }))}
                              disabled={!globalChecked}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={globalChecked}
                                  onChange={(_, checked) => onToggleGlobalVar(varName, checked)}
                                  disabled={isAllRecipientsForbidden}
                                />
                              }
                              label="모든 수신자에게 적용"
                            />
                          </Fragment>
                        );
                      })}
                    </Fieldset>
                  </>
                )}
              </Stack>
            </Stack>
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
              {!formData.template ? (
                <Typography variant="body2" color="text.secondary">
                  템플릿을 선택해주세요.
                </Typography>
              ) : renderTemplateMutation.isPending ? (
                <CircularProgress size={20} />
              ) : renderTemplateMutation.error ? (
                <Typography color="error">미리보기를 불러오지 못했습니다.</Typography>
              ) : renderTemplateMutation.data ? (
                <iframe
                  srcDoc={renderTemplateMutation.data}
                  style={{ width: "100%", minHeight: 500, maxHeight: "100%", height: "100%", border: "1px solid #ccc", borderRadius: 4 }}
                  title="템플릿 미리보기"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  미리보기를 준비하는 중입니다.
                </Typography>
              )}
              <Button variant="outlined" onClick={onRefreshPreview} disabled={!formData.template || renderTemplateMutation.isPending}>
                미리보기 갱신
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              수신자 목록 ({sentToList.length}건)
            </Typography>
            <Stack spacing={2}>
              <Button variant="outlined" startIcon={<Add />} onClick={onAddSentTo}>
                수신자 추가
              </Button>
              {sentToList.map((item) => (
                <SentToForm
                  key={item.trackId}
                  item={item}
                  kind={kind}
                  perRecipientVarNames={perRecipientVarNames}
                  onChange={onChangeSentTo}
                  onRemove={onRemoveSentTo}
                  onPreview={formData.template ? onPreviewWithRecipient : undefined}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title={submitBlockMessage ?? ""}>
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!!submitBlockMessage || createMutation.isPending}
                startIcon={<Send />}
              >
                발송
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    );
  })
);

export const AdminNotificationHistoryCreate: FC<AdminNotificationHistoryCreateProps> = (props) => (
  <BackendAdminSignInGuard>
    <InnerAdminNotificationHistoryCreate {...props} />
  </BackendAdminSignInGuard>
);
