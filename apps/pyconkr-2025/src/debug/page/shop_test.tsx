import { Divider, Stack, Typography } from "@mui/material";
import React from "react";

import { CartStatus, OrderList, ProductImageCardList, ProductList, UserInfo } from "@frontend/shop/components/features";

export const ShopTestPage: React.FC = () => (
  <Stack>
    <Stack spacing={2} sx={{ px: 4, py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Shop Test Page
      </Typography>
      <Typography variant="h5" gutterBottom>
        계정 상태
      </Typography>
      <UserInfo />
      <Divider />
      <Typography variant="h5" gutterBottom>
        상품 목록
      </Typography>
      <ProductList category_group="2025" category="티켓" />
      <Typography variant="h5" gutterBottom>
        상품 목록 (이미지 카드)
      </Typography>
      <ProductImageCardList category_group="2025" category="티셔츠" />
      <Divider />
      <Typography variant="h5" gutterBottom>
        장바구니
      </Typography>
      <CartStatus />
      <Divider />
      <Typography variant="h5" gutterBottom>
        주문 내역
      </Typography>
      <OrderList />
    </Stack>
  </Stack>
);
