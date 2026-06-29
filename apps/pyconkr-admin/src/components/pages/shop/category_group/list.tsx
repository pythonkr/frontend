import { FC } from "react";
import { Link } from "react-router-dom";

import { AdminList, AdminListColumn } from "@apps/pyconkr-admin/components/layouts/admin_list";

const columns: AdminListColumn[] = [
  {
    field: "name",
    header: "이름",
    width: "40%",
    render: (row) => {
      const id = row.id as string;
      const name = String(row.name ?? "");
      return <Link to={`/shop/categorygroup/${id}`}>{name}</Link>;
    },
  },
  {
    field: "priority",
    header: "우선순위",
    align: "right",
    render: (row) => String(row.priority ?? 0),
  },
  {
    field: "categories",
    header: "하위 카테고리 수",
    align: "right",
    render: (row) => {
      const cats = row.categories;
      return Array.isArray(cats) ? cats.length.toLocaleString() : "0";
    },
  },
];

export const ShopCategoryGroupListPage: FC = () => <AdminList app="shop" resource="categorygroup" columns={columns} enableRowActions />;
