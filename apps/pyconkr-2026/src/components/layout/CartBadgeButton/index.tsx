import { useCart, useShopClient } from "@frontend/shop/hooks";
import { ShoppingCart } from "@mui/icons-material";
import { Badge, badgeClasses, IconButton, styled } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { Link as RouterLink } from "react-router-dom";

type CartBadgeButtonProps = { onClose?: () => void };

type InnerCartBadgeButtonPropType = CartBadgeButtonProps & {
  loading?: boolean;
  count?: number;
};

// `as typeof IconButton`으로 styled가 잃어버린 polymorphic 타입(component/to)을 복원한다.
const ColoredIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.nonFocus,
  "&:hover": { color: theme.palette.primary.dark },
  "&:active": { color: theme.palette.primary.main },
  transition: "color 0.4s ease, background-color 0.4s ease",
})) as typeof IconButton;

const InnerCartBadge = styled(Badge)({ [`& .${badgeClasses.badge}`]: { top: "-12px", right: "-3px" } });

const InnerCartBadgeButton: FC<InnerCartBadgeButtonPropType> = ({ loading, count, onClose }) => {
  if (!loading && (count === undefined || count <= 0)) return null;

  return (
    <ColoredIconButton loading={loading} component={RouterLink} to="/store/cart" onClick={() => onClose?.()}>
      <ShoppingCart />
      {count !== undefined && count > 0 && <InnerCartBadge badgeContent={count} color="primary" overlap="circular" />}
    </ColoredIconButton>
  );
};

const CartBadgeButtonContent: FC<CartBadgeButtonProps> = ({ onClose }) => {
  const shopAPIClient = useShopClient();
  const { data: cart } = useCart(shopAPIClient);
  return <InnerCartBadgeButton count={cart?.products.length} loading={false} onClose={onClose} />;
};

export const CartBadgeButton: FC<CartBadgeButtonProps> = ({ onClose }) => (
  <ErrorBoundary fallback={<InnerCartBadgeButton onClose={onClose} />}>
    <Suspense fallback={<InnerCartBadgeButton loading onClose={onClose} />}>
      <CartBadgeButtonContent onClose={onClose} />
    </Suspense>
  </ErrorBoundary>
);
