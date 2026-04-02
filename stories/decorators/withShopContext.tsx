import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import type { Decorator } from "@storybook/react-vite";

import * as Shop from "@frontend/shop";

const LANGUAGE = "ko";

export const withShopContext: Decorator = (Story, context) => {
  const [queryClient] = React.useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    const { mockUserStatus, mockProducts, mockCart, mockOrders, mockPatrons, mockPatronsYear } = context.parameters;

    if (mockUserStatus !== undefined) {
      client.setQueryData(["query", "shop", "user", LANGUAGE], mockUserStatus);
    }
    if (mockProducts !== undefined) {
      client.setQueryData(["query", "shop", "products", "", LANGUAGE], mockProducts);
    }
    if (mockCart !== undefined) {
      client.setQueryData(["query", "shop", "cart", LANGUAGE], mockCart);
    }
    if (mockOrders !== undefined) {
      client.setQueryData(["query", "shop", "orders", LANGUAGE], mockOrders);
    }
    if (mockPatrons !== undefined) {
      const year: number = mockPatronsYear ?? 2025;
      client.setQueryData(["query", "shop", "patrons", year], mockPatrons);
    }

    return client;
  });

  const shopOptions: Shop.Contexts.ContextOptions = {
    language: LANGUAGE,
    shopApiDomain: "http://localhost:8000",
    shopApiCSRFCookieName: "csrftoken",
    shopApiTimeout: 10000,
    shopImpAccountId: "imp_test",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Shop.Components.Common.ShopContextProvider options={shopOptions}>
        <Story />
      </Shop.Components.Common.ShopContextProvider>
    </QueryClientProvider>
  );
};
