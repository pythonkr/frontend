import React from "react";

import { Divider, Stack, Typography } from "@mui/material";

import * as Shop from "@frontend/shop";

export const ShopTestPage: React.FC = () => (
  <Stack>
    <Stack spacing={2} sx={{ px: 4, backgroundColor: "#ddd", py: 2 }}>
      <Typography variant="h4" gutterBottom>Shop Test Page</Typography>
      <Typography variant="h5" gutterBottom>계정 상태</Typography>
      <Shop.Components.Features.UserInfo />
      <Divider />
      <Typography variant="h5" gutterBottom>상품 목록</Typography>
      <Shop.Components.Features.ProductList />
      <Divider />
      <Typography variant="h5" gutterBottom>장바구니</Typography>
      <Shop.Components.Features.CartStatus />
      <Divider />
      <Typography variant="h5" gutterBottom>주문 내역</Typography>
      <Shop.Components.Features.OrderList />
    </Stack>
  </Stack>
);
