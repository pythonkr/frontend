import { useBackendAdminClient, useCreateMutation, useListPaginatedQuery, useRemovePreparedMutation } from "@frontend/common/hooks/useAdminAPI";
import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

type EmailAddressRow = {
  id: number;
  user: string;
  email: string;
  verified: boolean;
  primary: boolean;
  str_repr: string;
};

type EmailAddressCreateRequest = {
  id?: number;
  user: string;
  email: string;
  verified: boolean;
  primary: boolean;
};

const InnerEmailAddressSection: FC<{ userId: string }> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ userId }) => {
    const client = useBackendAdminClient();
    const listQuery = useListPaginatedQuery<EmailAddressRow>(client, "allauth", "emailaddress", { user: userId });
    const items = listQuery.data?.results ?? [];

    const [newEmail, setNewEmail] = useState("");
    const [newVerified, setNewVerified] = useState(false);
    const [newPrimary, setNewPrimary] = useState(false);

    const createMutation = useCreateMutation<EmailAddressCreateRequest>(client, "allauth", "emailaddress");
    const removeMutation = useRemovePreparedMutation(client, "allauth", "emailaddress");

    const handleCreate = (e: FormEvent) => {
      e.preventDefault();
      const email = newEmail.trim();
      if (!email) return;
      createMutation.mutate(
        { user: userId, email, verified: newVerified, primary: newPrimary },
        {
          onSuccess: () => {
            addSnackbar("이메일 주소를 추가했습니다.", "success");
            setNewEmail("");
            setNewVerified(false);
            setNewPrimary(false);
          },
          onError: addErrorSnackbar,
        }
      );
    };

    const handleDelete = (id: number, email: string) => {
      if (!window.confirm(`'${email}'을(를) 삭제하시겠습니까?`)) return;
      removeMutation.mutate(String(id), {
        onSuccess: () => addSnackbar("이메일 주소를 삭제했습니다.", "success"),
        onError: addErrorSnackbar,
      });
    };

    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Divider />
        <Typography variant="h6">이메일 주소 ({items.length})</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>이메일</TableCell>
              <TableCell align="center" sx={{ width: 120 }}>
                verified
              </TableCell>
              <TableCell align="center" sx={{ width: 120 }}>
                primary
              </TableCell>
              <TableCell align="right" sx={{ width: 80 }}>
                작업
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary" }}>
                  등록된 이메일 주소가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {items.map((ea) => (
              <TableRow key={ea.id} hover>
                <TableCell>
                  <Link to={`/allauth/emailaddress/${ea.id}`}>{ea.email}</Link>
                </TableCell>
                <TableCell align="center">{ea.verified ? <Chip label="verified" size="small" color="success" /> : "—"}</TableCell>
                <TableCell align="center">{ea.primary ? <Chip label="primary" size="small" color="primary" /> : "—"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(ea.id, ea.email)}
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
        <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            type="email"
            label="새 이메일 주소"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            size="small"
            sx={{ minWidth: 280 }}
          />
          <FormControlLabel control={<Checkbox checked={newVerified} onChange={(e) => setNewVerified(e.target.checked)} />} label="verified" />
          <FormControlLabel control={<Checkbox checked={newPrimary} onChange={(e) => setNewPrimary(e.target.checked)} />} label="primary" />
          <Button type="submit" variant="contained" startIcon={<Add />} disabled={createMutation.isPending}>
            추가
          </Button>
        </Box>
      </Stack>
    );
  })
);

export const EmailAddressSection: FC<{ userId: string }> = (props) => <InnerEmailAddressSection {...props} />;
