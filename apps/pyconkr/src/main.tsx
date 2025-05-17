import * as React from "react";
import * as ReactDom from "react-dom/client";

import { Global } from "@emotion/react";
import { CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";

import * as Common from "@frontend/common";
import * as Shop from "@frontend/shop";

import { App } from "./App.tsx";
import { globalStyles, muiTheme } from "./styles/globalStyles.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          mutation.meta?.invalidates?.some((queryKey) =>
            matchQuery({ queryKey }, query)
          ) ?? true,
      });
    },
  }),
});

const CommonOptions: Common.Contexts.ContextOptions = {
  debug: import.meta.env.MODE === "development",
  baseUrl: '.',
};

const ShopOptions: Shop.Contexts.ContextOptions = {
  shopApiDomain: import.meta.env.VITE_PYCONKR_SHOP_API_DOMAIN,
  shopApiCSRFCookieName: import.meta.env.VITE_PYCONKR_SHOP_CSRF_COOKIE_NAME,
  shopApiTimeout: 10000,
  shopImpAccountId: import.meta.env.VITE_PYCONKR_SHOP_IMP_ACCOUNT_ID,
}

const CenteredPage: React.FC<React.PropsWithChildren> = ({ children }) => (
  <section
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100svh",
      width: "100svw",
    }}
  >
    <aside>{children}</aside>
  </section>
);

const ErrorBoundariedApp: React.FC = () => <ErrorBoundary fallback={<CenteredPage>문제가 발생했습니다, 새로고침을 해주세요.</CenteredPage>}>
  <Suspense fallback={<CenteredPage><CircularProgress /></CenteredPage>}>
    <App />
  </Suspense>
</ErrorBoundary>;

ReactDom.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Common.Components.CommonContextProvider options={CommonOptions}>
        <Shop.Components.Common.ShopContextProvider options={ShopOptions}>
          <ThemeProvider theme={muiTheme}>
            <SnackbarProvider>
              <CssBaseline />
              <Global styles={globalStyles} />
              <ErrorBoundariedApp />
            </SnackbarProvider>
          </ThemeProvider>
        </Shop.Components.Common.ShopContextProvider>
      </Common.Components.CommonContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
