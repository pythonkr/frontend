import { Typography } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";

import { AdminList, AdminListColumn } from "@apps/pyconkr-admin/components/layouts/admin_list";

const detailPath = (id: string) => `/participant_portal_api/modificationaudit/${id}`;

const columns: AdminListColumn[] = [
  { field: "id", header: "ID", width: "25%" },
  {
    field: "status",
    header: "상태",
    width: "17.5%",
    render: (row) => {
      const isRequested = row.status === "requested";
      return (
        <Typography variant="body2" fontWeight={isRequested ? 700 : 400} color={isRequested ? "primary" : "textSecondary"}>
          {String(row.status)}
        </Typography>
      );
    },
  },
  {
    field: "str_repr",
    header: "이름",
    width: "40%",
    render: (row) => <Link to={detailPath(String(row.id))}>{String(row.str_repr)}</Link>,
  },
  {
    field: "created_at",
    header: "요청 시각",
    width: "17.5%",
    render: (row) => new Date(String(row.created_at)).toLocaleString(),
  },
];

// 수정 심사는 CRUD가 아닌 승인/반려 워크플로우라 생성/수정/삭제 액션을 숨기고, 상세는 전용 심사 페이지로 연결한다.
export const AdminModificationAuditList: FC = () => (
  <AdminList
    app="participant_portal_api"
    resource="modificationaudit"
    title="수정 심사 목록"
    columns={columns}
    hideCreateNew
    hideCreatedAt
    hideUpdatedAt
  />
);
