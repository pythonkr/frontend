import { useBackendAdminClient, useIssueGoogleOAuth2AccessTokenMutation } from "@frontend/common/hooks/useAdminAPI";
import { GoogleOAuth2AccessTokenResponseSchema } from "@frontend/common/schemas/backendAdminAPI";
import { VpnKey } from "@mui/icons-material";
import { Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { FC, ReactNode, useState } from "react";
import { useParams } from "react-router-dom";

import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type CachedToken = { issuedAt: number; response: GoogleOAuth2AccessTokenResponseSchema };
type TokenState = { issuedAt: Date; response: GoogleOAuth2AccessTokenResponseSchema };

const LOCAL_STORAGE_KEY_PREFIX = "googleoauth2-access-token-";

const buildLocalStorageKey = (id: string) => `${LOCAL_STORAGE_KEY_PREFIX}${id}`;

const loadCachedToken = (id: string): TokenState | null => {
  try {
    const raw = window.localStorage.getItem(buildLocalStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedToken;
    const expiryMs = parsed.issuedAt + (parsed.response.expires_in ?? 0) * 1000;
    if (expiryMs <= Date.now()) {
      window.localStorage.removeItem(buildLocalStorageKey(id));
      return null;
    }
    return { issuedAt: new Date(parsed.issuedAt), response: parsed.response };
  } catch {
    return null;
  }
};

export const AdminGoogleOAuth2Editor: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const backendAdminClient = useBackendAdminClient();
  const [tokenState, setTokenState] = useState<TokenState | null>(() => (id ? loadCachedToken(id) : null));

  const accessTokenMutation = useIssueGoogleOAuth2AccessTokenMutation(backendAdminClient, id ?? "");

  const handleIssueToken = () => {
    if (!id || accessTokenMutation.isPending) return;
    accessTokenMutation.mutate(undefined, {
      onSuccess: (response) => {
        const issuedAt = new Date();
        setTokenState({ issuedAt, response });
        window.localStorage.setItem(buildLocalStorageKey(id), JSON.stringify({ issuedAt: issuedAt.getTime(), response }));
        addSnackbar("Access Token을 발급했습니다.", "success");
      },
      onError: addErrorSnackbar,
    });
  };

  const renderValue = (key: string, value: unknown): ReactNode => {
    if (Array.isArray(value)) {
      return (
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {value.map((v, idx) => (
            <li key={idx}>{String(v)}</li>
          ))}
        </Box>
      );
    }
    if (value == null) return "";
    if (key === "expires_in" && typeof value === "number" && tokenState) {
      return new Date(tokenState.issuedAt.getTime() + value * 1000).toLocaleString();
    }
    return String(value);
  };

  return (
    <AdminEditor app="external_api" resource="googleoauth2" id={id}>
      {id && (
        <Stack spacing={2} sx={{ my: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleIssueToken} disabled={accessTokenMutation.isPending} startIcon={<VpnKey />}>
            Access Token 발급
          </Button>
          {tokenState && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                발급 결과
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "30%" }}>필드</TableCell>
                    <TableCell>값</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(tokenState.response).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell sx={{ wordBreak: "break-all" }}>{renderValue(key, value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Stack>
      )}
    </AdminEditor>
  );
};
