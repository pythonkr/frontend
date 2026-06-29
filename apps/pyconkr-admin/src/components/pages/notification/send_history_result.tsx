import {
  useBackendAdminClient,
  useRenderSentToQuery,
  useRetrieveQuery,
  useRetryHistoryMutation,
  useRetrySentToMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { Add, Close, ExpandLess, ExpandMore, Replay } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, MouseEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { NotificationChannel } from "@apps/pyconkr-admin/components/pages/notification/channels";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type AdminNotificationHistoryEditorProps = {
  channel: NotificationChannel;
};

type NotificationStatus = "CREATED" | "SENDING" | "SENT" | "FAILED";

type NotificationHistorySentToStatusSummary = {
  created: number;
  sending: number;
  sent: number;
  failed: number;
};

type NotificationHistorySentToSchema = {
  id: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  str_repr: string;
  recipient: string;
  context: Record<string, unknown>;
  status: NotificationStatus;
  failure_reason: string | null;
};

type NotificationHistorySchema = {
  id: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  str_repr: string;
  template: string | null;
  template_code: string;
  template_data: string;
  sent_from: string;
  sent_to_list: NotificationHistorySentToSchema[];
  sent_to_status_summary: NotificationHistorySentToStatusSummary;
};

const STATUS_COLOR: Record<NotificationStatus, "info" | "warning" | "success" | "error"> = {
  CREATED: "info",
  SENDING: "warning",
  SENT: "success",
  FAILED: "error",
};
const ReadOnlyFieldNames: (keyof NotificationHistorySchema)[] = ["id", "created_at", "created_by", "sent_from"];

type SentToListItemProps = {
  item: NotificationHistorySentToSchema;
  app: string;
  resource: string;
  historyId: string;
  selected: boolean;
  onSelect: (sentToId: string) => void;
};

const SentToListItem: FC<SentToListItemProps> = ({ item, app, resource, historyId, selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const backendAdminClient = useBackendAdminClient();
  const retryMutation = useRetrySentToMutation(backendAdminClient, app, resource, historyId, item.id);

  const handleClick = () => {
    setOpen((o) => !o);
    onSelect(item.id);
  };

  const handleRetry = (e: MouseEvent) => {
    e.stopPropagation();
    if (retryMutation.isPending) return;
    if (!window.confirm("재시도하시겠습니까?")) return;
    retryMutation.mutate(undefined, {
      onSuccess: () => addSnackbar("재시도 요청을 완료했습니다.", "success"),
      onError: addErrorSnackbar,
    });
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        selected={selected}
        sx={(theme) => ({
          backgroundColor: alpha(theme.palette[STATUS_COLOR[item.status]].main, 0.1),
          "&:hover": { backgroundColor: alpha(theme.palette[STATUS_COLOR[item.status]].main, 0.2) },
          "&.Mui-selected": { backgroundColor: alpha(theme.palette[STATUS_COLOR[item.status]].main, 0.25) },
          "&.Mui-selected:hover": { backgroundColor: alpha(theme.palette[STATUS_COLOR[item.status]].main, 0.3) },
        })}
      >
        <ListItemText>{String(item.recipient)}</ListItemText>
        <Chip label={item.status} color={STATUS_COLOR[item.status]} size="small" sx={{ mr: 1 }} />
        {item.status === "FAILED" && (
          <IconButton size="small" color="error" onClick={handleRetry} disabled={retryMutation.isPending} title="재시도" sx={{ mr: 1 }}>
            <Replay fontSize="small" />
          </IconButton>
        )}
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {Object.keys(item.context).length >= 1 ? (
          <List>
            {Object.entries(item.context).map(([key, value]) => (
              <ListItemButton key={key} sx={{ pl: 4 }}>
                <ListItemText>{key}</ListItemText>
                <ListItemText>{String(value)}</ListItemText>
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography sx={{ pl: 4, fontStyle: "italic" }}>컨텍스트 데이터가 없습니다.</Typography>
        )}
      </Collapse>
    </>
  );
};

const InnerAdminNotificationHistoryEditor: FC<AdminNotificationHistoryEditorProps> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ channel }) => {
    const { app, historyResource, templateResource } = channel;
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();

    const backendAdminClient = useBackendAdminClient();
    const { data: retrievedData } = useRetrieveQuery<NotificationHistorySchema>(backendAdminClient, app, historyResource, id || "");
    const [statusFilter, setStatusFilter] = useState<Record<NotificationStatus, boolean>>({
      CREATED: true,
      SENDING: true,
      SENT: true,
      FAILED: true,
    });
    const [selectedSentToId, setSelectedSentToId] = useState<string | null>(null);
    const [renderTab, setRenderTab] = useState<0 | 1>(0);
    const renderQuery = useRenderSentToQuery(backendAdminClient, app, historyResource, id ?? "", selectedSentToId);
    const retryHistoryMutation = useRetryHistoryMutation(backendAdminClient, app, historyResource, id ?? "");

    if (!retrievedData) return null;

    const selectedItem = retrievedData.sent_to_list.find((s) => s.id === selectedSentToId) ?? null;
    const onClose = () => navigate(`/${app}/${historyResource}`);
    const goToCreateNew = () => navigate(`/${app}/${historyResource}/create`);
    const failedCount = retrievedData.sent_to_status_summary.failed;
    const handleRetryAllFailed = () => {
      if (retryHistoryMutation.isPending || failedCount === 0) return;
      if (!window.confirm(`실패한 ${failedCount}건을 재시도하시겠습니까?`)) return;
      retryHistoryMutation.mutate(undefined, {
        onSuccess: () => addSnackbar(`${failedCount}건의 재시도 요청을 완료했습니다.`, "success"),
        onError: addErrorSnackbar,
      });
    };

    return (
      <Box sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">{`${app.toUpperCase()} > ${historyResource.toUpperCase()} > 발송 이력`}</Typography>
          <IconButton onClick={onClose} children={<Close />} />
        </Stack>
        {id && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>필드</TableCell>
                  <TableCell>값</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ReadOnlyFieldNames.map((key) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{retrievedData[key] == null ? "" : String(retrievedData[key])}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>template</TableCell>
                  <TableCell>
                    <Link to={`/${app}/${templateResource}/${retrievedData.template}`}>{retrievedData.template_code}</Link>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <br />
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    color={STATUS_COLOR.CREATED}
                    checked={statusFilter.CREATED}
                    onChange={(_, checked) => setStatusFilter((p) => ({ ...p, CREATED: checked }))}
                    disabled={retrievedData.sent_to_status_summary.created === 0}
                  />
                }
                label={`대기 : ${retrievedData.sent_to_status_summary.created}`}
              />
              <FormControlLabel
                control={
                  <Switch
                    color={STATUS_COLOR.SENDING}
                    checked={statusFilter.SENDING}
                    onChange={(_, checked) => setStatusFilter((p) => ({ ...p, SENDING: checked }))}
                    disabled={retrievedData.sent_to_status_summary.sending === 0}
                  />
                }
                label={`진행 : ${retrievedData.sent_to_status_summary.sending}`}
              />
              <FormControlLabel
                control={
                  <Switch
                    color={STATUS_COLOR.SENT}
                    checked={statusFilter.SENT}
                    onChange={(_, checked) => setStatusFilter((p) => ({ ...p, SENT: checked }))}
                    disabled={retrievedData.sent_to_status_summary.sent === 0}
                  />
                }
                label={`성공 : ${retrievedData.sent_to_status_summary.sent}`}
              />
              <FormControlLabel
                control={
                  <Switch
                    color={STATUS_COLOR.FAILED}
                    checked={statusFilter.FAILED}
                    onChange={(_, checked) => setStatusFilter((p) => ({ ...p, FAILED: checked }))}
                    disabled={failedCount === 0}
                  />
                }
                label={`실패 : ${failedCount}`}
              />
              <Button
                variant="outlined"
                color={STATUS_COLOR.FAILED}
                size="small"
                startIcon={<Replay />}
                onClick={handleRetryAllFailed}
                disabled={failedCount === 0 || retryHistoryMutation.isPending}
                style={{ marginLeft: "auto" }}
              >
                실패 항목 재시도
              </Button>
            </Stack>
          </>
        )}
        <br />
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          <Stack sx={{ width: "100%" }}>
            <List disablePadding>
              {retrievedData.sent_to_list
                .filter((item) => statusFilter[item.status])
                .map((item) => (
                  <SentToListItem
                    key={item.id}
                    item={item}
                    app={app}
                    resource={historyResource}
                    historyId={retrievedData.id}
                    selected={selectedSentToId === item.id}
                    onSelect={setSelectedSentToId}
                  />
                ))}
            </List>
          </Stack>
          <Stack sx={{ width: "100%" }}>
            {selectedItem ? (
              <>
                {selectedItem.status === "FAILED" && (
                  <Tabs value={renderTab} onChange={(_, v) => setRenderTab(v as 0 | 1)} sx={{ mb: 1 }}>
                    <Tab label="실패 사유" />
                    <Tab label="렌더링 결과" />
                  </Tabs>
                )}
                {selectedItem.status === "FAILED" && renderTab === 0 ? (
                  <Box
                    component="pre"
                    sx={{
                      p: 2,
                      m: 0,
                      backgroundColor: "grey.100",
                      borderRadius: 1,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                    }}
                  >
                    <code>{selectedItem.failure_reason || "(실패 사유 없음)"}</code>
                  </Box>
                ) : renderQuery.isLoading ? (
                  <CircularProgress />
                ) : renderQuery.error ? (
                  <Typography color="error">렌더링 결과를 불러오지 못했습니다.</Typography>
                ) : (
                  <iframe srcDoc={renderQuery.data ?? ""} style={{ width: "100%", minHeight: 500, border: "1px solid #ccc", borderRadius: 4 }} />
                )}
              </>
            ) : (
              "옆의 수신자 목록을 클릭하면, 수신자에게 보내진 알림의 모습을 볼 수 있습니다."
            )}
          </Stack>
        </Stack>
        <br />
        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button variant="outlined" color="info" onClick={goToCreateNew} startIcon={<Add />}>
            새로 보내기
          </Button>
        </Stack>
      </Box>
    );
  })
);

export const AdminNotificationHistoryEditor: FC<AdminNotificationHistoryEditorProps> = (props) => (
  <BackendAdminSignInGuard>
    <InnerAdminNotificationHistoryEditor {...props} />
  </BackendAdminSignInGuard>
);
