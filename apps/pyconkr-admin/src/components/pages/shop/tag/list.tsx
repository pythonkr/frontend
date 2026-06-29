import { Chip } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";

import { AdminList, AdminListColumn } from "@apps/pyconkr-admin/components/layouts/admin_list";

const formatStock = (stock: number) => (stock === 0 ? "무한대" : stock.toLocaleString());
const formatMaxPerUser = (qty: number) => (qty === 0 ? "제한 없음" : qty.toLocaleString());

const columns: AdminListColumn[] = [
  {
    field: "name_ko",
    header: "이름",
    width: "30%",
    render: (row) => {
      const id = row.id as string;
      const name = String(row.name_ko ?? row.name_en ?? "");
      const leftover = row.leftover_stock;
      const soldOut = typeof leftover === "number" && leftover <= 0;
      return (
        <>
          <Link to={`/shop/tag/${id}`}>{name}</Link>
          {soldOut && <Chip label="매진" size="small" color="error" sx={{ ml: 1 }} />}
        </>
      );
    },
  },
  {
    field: "stock",
    header: "재고",
    align: "right",
    render: (row) => formatStock(Number(row.stock ?? 0)),
  },
  {
    field: "max_quantity_per_user",
    header: "사용자당 최대 수량",
    align: "right",
    render: (row) => formatMaxPerUser(Number(row.max_quantity_per_user ?? 0)),
  },
  {
    field: "leftover_stock",
    header: "남은 재고",
    align: "right",
    render: (row) => {
      const v = row.leftover_stock;
      return v === null || v === undefined ? "—" : Number(v).toLocaleString();
    },
  },
];

export const ShopTagListPage: FC = () => <AdminList app="shop" resource="tag" columns={columns} enableRowActions />;
