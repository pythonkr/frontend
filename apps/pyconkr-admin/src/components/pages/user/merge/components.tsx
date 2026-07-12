import { UserMergeObjectSchema, UserMergeUserSchema } from "@frontend/common/schemas/backendAdminAPI";
import { ArrowRightAlt } from "@mui/icons-material";
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { FC } from "react";
import { Link as RouterLink } from "react-router-dom";

import { adminDetailPathFor } from "@apps/pyconkr-admin/routes";

export const UserSummaryCard: FC<{ title: string; user: UserMergeUserSchema; emphasize?: boolean }> = ({ title, user, emphasize }) => (
  <Box
    sx={{
      border: 1,
      borderColor: emphasize ? "primary.main" : "divider",
      borderRadius: 1,
      p: 2,
      flex: 1,
      minWidth: 220,
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {title}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
      <RouterLink to={`/user/userext/${user.id}`} target="_blank">
        <Typography variant="subtitle1" fontWeight={700}>
          {user.str_repr || user.username}
        </Typography>
      </RouterLink>
    </Stack>
    <Typography variant="body2" color="text.secondary">
      ID: {user.id}
    </Typography>
    {user.email && (
      <Typography variant="body2" color="text.secondary">
        {user.email}
      </Typography>
    )}
    {user.nickname && (
      <Typography variant="body2" color="text.secondary">
        닉네임: {user.nickname}
      </Typography>
    )}
  </Box>
);

export const MergeDirection: FC<{ source: UserMergeUserSchema; target: UserMergeUserSchema }> = ({ source, target }) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
    <UserSummaryCard title="원본 (병합 후 비활성화)" user={source} />
    <ArrowRightAlt sx={{ fontSize: 32, color: "text.secondary", transform: { xs: "rotate(90deg)", sm: "none" } }} />
    <UserSummaryCard title="대상 (유지)" user={target} emphasize />
  </Stack>
);

export const MergedObjectsTable: FC<{ objects: UserMergeObjectSchema[] }> = ({ objects }) => {
  if (!objects.length)
    return (
      <Typography variant="body2" color="text.secondary">
        이전되는 데이터가 없습니다.
      </Typography>
    );

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>앱</TableCell>
          <TableCell>리소스</TableCell>
          <TableCell>대상 ID</TableCell>
          <TableCell>필드</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {objects.map((o) => {
          const detailPath = adminDetailPathFor(o.target_type_app, o.target_type_resource, o.target_id);
          return (
            <TableRow key={o.id}>
              <TableCell>{o.target_type_app}</TableCell>
              <TableCell>{o.target_type_resource}</TableCell>
              <TableCell>{detailPath ? <RouterLink to={detailPath} target="_blank" rel="noopener" children={o.target_id} /> : o.target_id}</TableCell>
              <TableCell>{o.field_names.join(", ")}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
