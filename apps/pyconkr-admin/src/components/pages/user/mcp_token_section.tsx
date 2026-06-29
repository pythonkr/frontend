import { useBackendAdminClient, useListPaginatedQuery, useRemovePreparedMutation, useRetrieveQuery } from "@frontend/common/hooks/useAdminAPI";
import { ContentCopy, Delete, VpnKey } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useMutation } from "@tanstack/react-query";
import { FC, useState } from "react";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type McpTokenRow = {
  id: string;
  user: string;
  last_used_at: string | null;
  created_at: string;
  str_repr: string;
};

type IssueTokenResponse = {
  token: string;
};

type UserStatus = {
  is_active: boolean;
  is_superuser: boolean;
};

const formatDateTime = (value: string | null): string => (value ? new Date(value).toLocaleString("ko-KR") : "—");

const InnerMcpTokenSection: FC<{ userId: string }> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ userId }) => {
    const client = useBackendAdminClient();
    const listQuery = useListPaginatedQuery<McpTokenRow>(client, "user", "mcptoken", { user: userId });
    const items = listQuery.data?.results ?? [];

    // 발급된 토큰은 사용자가 비활성/비슈퍼유저가 되면 무효가 된다(행은 남아있음). 발급 가능 여부와 토큰 유효성 표시에 사용.
    const userQuery = useRetrieveQuery<UserStatus>(client, "user", "userext", userId);
    const isActiveSuperuser = !!userQuery.data?.is_active && !!userQuery.data?.is_superuser;

    const [issuedToken, setIssuedToken] = useState<string | null>(null);

    const issueMutation = useMutation({
      mutationFn: async () => client.post<IssueTokenResponse, undefined>(`v1/admin-api/user/userext/${userId}/mcp-token/`, undefined),
      onSuccess: (data) => {
        setIssuedToken(data.token);
        addSnackbar("MCP 토큰을 발급했습니다.", "success");
      },
      onError: addErrorSnackbar,
    });

    const removeMutation = useRemovePreparedMutation(client, "user", "mcptoken");

    const handleRevoke = (id: string) => {
      if (!window.confirm("이 토큰을 폐기하시겠습니까? 폐기 후에는 즉시 사용할 수 없습니다.")) return;
      removeMutation.mutate(id, {
        onSuccess: () => addSnackbar("토큰을 폐기했습니다.", "success"),
        onError: addErrorSnackbar,
      });
    };

    const copyToken = () => {
      if (!issuedToken) return;
      navigator.clipboard.writeText(issuedToken).then(
        () => addSnackbar("토큰이 클립보드에 복사되었습니다.", "success"),
        () => addSnackbar("클립보드 복사에 실패했습니다.", "error")
      );
    };

    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="h6">MCP 토큰 ({items.length})</Typography>
          <Tooltip title={isActiveSuperuser ? "" : "활성 슈퍼유저에게만 발급할 수 있습니다."}>
            <span>
              <Button
                variant="contained"
                startIcon={<VpnKey />}
                onClick={() => issueMutation.mutate()}
                disabled={issueMutation.isPending || !isActiveSuperuser}
              >
                토큰 발급
              </Button>
            </span>
          </Tooltip>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          MCP 토큰은 활성 슈퍼유저에게만 발급할 수 있습니다. 발급된 토큰 값은 발급 직후 한 번만 확인할 수 있으니 안전한 곳에 보관하세요. 사용자가
          비활성화되거나 슈퍼유저 권한을 잃으면 발급된 토큰은 모두 무효가 됩니다(행은 자동 삭제되지 않습니다).
        </Typography>
        {!isActiveSuperuser && items.length > 0 && (
          <Alert severity="warning">이 사용자는 활성 슈퍼유저가 아니므로 발급된 토큰이 모두 무효 상태입니다.</Alert>
        )}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell sx={{ width: 200 }}>발급일</TableCell>
              <TableCell sx={{ width: 200 }}>마지막 사용</TableCell>
              <TableCell align="center" sx={{ width: 90 }}>
                상태
              </TableCell>
              <TableCell align="right" sx={{ width: 80 }}>
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
                  발급된 MCP 토큰이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {items.map((token) => (
              <TableRow key={token.id} hover>
                <TableCell>
                  <code>{token.id}</code>
                </TableCell>
                <TableCell>{formatDateTime(token.created_at)}</TableCell>
                <TableCell>{formatDateTime(token.last_used_at)}</TableCell>
                <TableCell align="center">
                  {isActiveSuperuser ? (
                    <Chip label="유효" size="small" color="success" />
                  ) : (
                    <Tooltip title="사용자가 비활성/비슈퍼유저 상태여서 무효입니다.">
                      <Chip label="무효" size="small" color="default" variant="outlined" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleRevoke(token.id)} disabled={removeMutation.isPending} aria-label="폐기">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={issuedToken !== null} maxWidth="sm" fullWidth onClose={() => setIssuedToken(null)}>
          <DialogTitle>MCP 토큰이 발급되었습니다</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              아래 토큰 값은 다시 확인할 수 없으니 반드시 복사해 두세요. 토큰을 폐기하려면 목록에서 삭제하면 됩니다.
            </DialogContentText>
            <TextField
              fullWidth
              multiline
              maxRows={6}
              value={issuedToken ?? ""}
              slotProps={{
                input: {
                  readOnly: true,
                  sx: { wordBreak: "break-all", fontFamily: "monospace", fontSize: "0.8rem" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={copyToken} edge="end" aria-label="복사">
                        <ContentCopy />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIssuedToken(null)}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  })
);

export const McpTokenSection: FC<{ userId: string }> = (props) => <InnerMcpTokenSection {...props} />;
