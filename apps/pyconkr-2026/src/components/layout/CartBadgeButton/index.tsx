import { ShoppingCart } from "@mui/icons-material";
import { Badge, badgeClasses, IconButton, styled } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { useCart, useShopClient } from "@frontend/shop/hooks";

type InnerCartBadgeButtonPropType = {
  loading?: boolean;
  count?: number;
};

const ColoredIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.nonFocus,
  "&:hover": { color: theme.palette.primary.dark },
  "&:active": { color: theme.palette.primary.main },
  transition: "color 0.4s ease, background-color 0.4s ease",
}));

const InnerCartBadge = styled(Badge)({ [`& .${badgeClasses.badge}`]: { top: "-12px", right: "-3px" } });

const InnerCartBadgeButton: FC<InnerCartBadgeButtonPropType> = ({ loading, count }) => {
  const navigate = useNavigate();

  return (
    <ColoredIconButton loading={loading} onClick={() => navigate("/store/cart")}>
      <ShoppingCart />
      {count !== undefined && count > 0 && <InnerCartBadge badgeContent={count} color="primary" overlap="circular" />}
    </ColoredIconButton>
  );
};

export const CartBadgeButton: FC = Suspense.with(
  { fallback: <InnerCartBadgeButton loading /> },
  ErrorBoundary.with({ fallback: <InnerCartBadgeButton /> }, () => {
    const shopAPIClient = useShopClient();
    const { data: cart } = useCart(shopAPIClient);
    return <InnerCartBadgeButton count={cart?.products.length} loading={false} />;
  })
);
