import { useBackendAdminClient, useListPaginatedQuery, useRemovePreparedMutation } from "@frontend/common/hooks/useAdminAPI";
import { Delete } from "@mui/icons-material";
import { Alert, CircularProgress, Divider, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { Link } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type SocialAccountRow = {
  id: number;
  user: string;
  provider: string;
  uid: string;
  last_login: string | null;
  date_joined: string;
  extra_data: Record<string, unknown>;
  str_repr: string;
};

const InnerSocialAccountSection: FC<{ userId: string }> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ userId }) => {
    const client = useBackendAdminClient();
    const listQuery = useListPaginatedQuery<SocialAccountRow>(client, "allauth", "socialaccount", { user: userId });
    const items = listQuery.data?.results ?? [];
    const removeMutation = useRemovePreparedMutation(client, "allauth", "socialaccount");

    const handleDelete = (id: number, label: string) => {
      if (
        !window.confirm(
          `'${label}'을(를) 삭제하시겠습니까?\n\n이 사용자에게 다른 소셜 계정이 남아있지 않다면, 연결된 모든 이메일 주소도 함께 삭제됩니다.`
        )
      )
        return;
      removeMutation.mutate(String(id), {
        onSuccess: () => addSnackbar("소셜 계정을 삭제했습니다.", "success"),
        onError: addErrorSnackbar,
      });
    };

    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Divider />
        <Typography variant="h6">소셜 계정 ({items.length})</Typography>
        <Alert severity="info" variant="outlined">
          소셜 계정은 OAuth 로그인 시 자동으로 생성됩니다. 어드민에서는 삭제만 가능합니다.
        </Alert>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 140 }}>Provider</TableCell>
              <TableCell>UID</TableCell>
              <TableCell sx={{ width: 180 }}>최근 로그인</TableCell>
              <TableCell sx={{ width: 180 }}>가입일</TableCell>
              <TableCell align="right" sx={{ width: 80 }}>
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
                  연결된 소셜 계정이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {items.map((sa) => (
              <TableRow key={sa.id} hover>
                <TableCell>{sa.provider}</TableCell>
                <TableCell>
                  <Link to={`/allauth/socialaccount/${sa.id}`}>
                    <code>{sa.uid}</code>
                  </Link>
                </TableCell>
                <TableCell>{sa.last_login ? new Date(sa.last_login).toLocaleString() : "—"}</TableCell>
                <TableCell>{new Date(sa.date_joined).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(sa.id, sa.str_repr || `${sa.provider}:${sa.uid}`)}
                    disabled={removeMutation.isPending}
                    aria-label="삭제"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    );
  })
);

export const SocialAccountSection: FC<{ userId: string }> = (props) => <InnerSocialAccountSection {...props} />;
