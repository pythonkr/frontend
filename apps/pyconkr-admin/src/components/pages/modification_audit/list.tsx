import { useBackendAdminClient, useListQuery } from "@frontend/common/hooks/useAdminAPI";
import { CircularProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { Link } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";

type ListRowType = {
  id: string;
  status: "approved" | "rejected" | "requested" | "cancelled";
  str_repr: string;
  created_at: string;
  updated_at: string;
};

const InnerAdminModificationAuditList: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const backendAdminClient = useBackendAdminClient();
    const listQuery = useListQuery<ListRowType>(backendAdminClient, "participant_portal_api", "modificationaudit");

    return (
      <Stack sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Typography variant="h5" children="수정 심사 목록" />
        <br />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "25%" }}>ID</TableCell>
              <TableCell sx={{ width: "17.5%" }}>상태</TableCell>
              <TableCell sx={{ width: "40%" }}>이름</TableCell>
              <TableCell sx={{ width: "17.5%" }}>요청 시각</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listQuery.data?.map((item) => {
              const link = `/modification-audit/modification-audit/${item.id}`;
              const isRequested = item.status === "requested";
              return (
                <TableRow key={item.id}>
                  <TableCell children={<Link to={link} children={item.id} />} />
                  <TableCell>
                    <Typography variant="body2" fontWeight={isRequested ? 700 : 400} color={isRequested ? "primary" : "textSecondary"}>
                      {item.status}
                    </Typography>
                  </TableCell>
                  <TableCell children={<Link to={link} children={item.str_repr} />} />
                  <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Stack>
    );
  })
);

export const AdminModificationAuditList: FC = () => (
  <BackendAdminSignInGuard>
    <InnerAdminModificationAuditList />
  </BackendAdminSignInGuard>
);
