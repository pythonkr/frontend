import * as React from "react";

export const PriceDisplay: React.FC<{ price: number; label?: string }> = ({
  price,
  label,
}) => {
  return <>{(label ? `${label} : ` : "") + price.toLocaleString()}원</>;
};
