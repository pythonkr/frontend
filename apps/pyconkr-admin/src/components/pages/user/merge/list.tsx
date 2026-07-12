import { UserMergeHistoryListSchema, UserMergeUserSchema } from "@frontend/common/schemas/backendAdminAPI";
import { Chip, Stack } from "@mui/material";
import { FC } from "react";
import { Link as RouterLink } from "react-router-dom";

import { AdminList, AdminListColumn } from "@apps/pyconkr-admin/components/layouts/admin_list";

const USER_SOURCE = { app: "user", resource: "userext" };
const UserCell: FC<{ user?: UserMergeUserSchema }> = ({ user }) => {
  if (!user) return <>-</>;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <RouterLink to={`/user/userext/${user.id}`} target="_blank">
        {user.str_repr || user.username}
      </RouterLink>
    </Stack>
  );
};

const columns: AdminListColumn[] = [
  {
    field: "id",
    header: "ID",
    width: "22%",
  },
  {
    field: "source",
    header: "원본 (비활성화)",
    width: "23%",
    render: (row) => <UserCell user={(row as unknown as UserMergeHistoryListSchema).source} />,
  },
  {
    field: "target",
    header: "대상 (유지)",
    width: "23%",
    render: (row) => <UserCell user={(row as unknown as UserMergeHistoryListSchema).target} />,
  },
  {
    field: "is_self_merge",
    header: "종류",
    width: "8%",
    render: (row) => ((row as unknown as UserMergeHistoryListSchema).is_self_merge ? "본인" : "관리자"),
  },
  {
    field: "reverted_at",
    header: "상태",
    width: "10%",
    render: (row) =>
      (row as unknown as UserMergeHistoryListSchema).reverted_at ? (
        <Chip size="small" label="되돌림" />
      ) : (
        <Chip size="small" color="success" label="병합됨" />
      ),
  },
  {
    field: "created_at",
    header: "병합 일시",
    width: "14%",
    render: (row) => new Date((row as unknown as UserMergeHistoryListSchema).created_at).toLocaleString(),
  },
];

export const AdminUserMergeList: FC = () => (
  <AdminList
    app="user"
    resource="usermergehistory"
    title="계정 병합 이력"
    columns={columns}
    hideCreatedAt
    hideUpdatedAt
    filterChoicesFrom={{ source: USER_SOURCE, target: USER_SOURCE }}
  />
);
