import { CircularProgress } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { CenteredPage, CommonContextProvider } from "@frontend/common/components";
import type { ContextOptions } from "@frontend/common/contexts";
import { registerChunkLoadErrorReloadHandler } from "@frontend/common/utils";
import { ShopContextProvider } from "@frontend/shop/components/common";
import { ContextOptions as ShopContextOptions } from "@frontend/shop/contexts";

import { Layout } from "./components/layouts/global";
import { LandingPage } from "./components/pages/home";
import { PyConKRMDXComponents } from "./consts/mdx_components";
import { RegisteredRoutes, RouteDefinitions } from "./routes";

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
        predicate: (query) => mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true,
      });
      queryClient.resetQueries({
        predicate: (query) => mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true,
      });
    },
  }),
});

const backendApiDomainEnv: string = import.meta.env.VITE_PYCONKR_BACKEND_API_DOMAIN;
const backendApiDomain = backendApiDomainEnv.startsWith("http://") ? "" : backendApiDomainEnv;

const CommonOptions: ContextOptions = {
  debug: true,
  language: "ko",
  baseUrl: ".",
  frontendDomain: import.meta.env.VITE_PYCONKR_FRONTEND_DOMAIN,
  backendApiDomain,
  backendApiTimeout: 10000,
  backendApiCSRFCookieName: import.meta.env.VITE_PYCONKR_BACKEND_CSRF_COOKIE_NAME,
  mdxComponents: PyConKRMDXComponents,
};

const ShopOptions: ShopContextOptions = {
  language: "ko",
  shopImpAccountId: import.meta.env.VITE_PYCONKR_SHOP_IMP_ACCOUNT_ID,
};

registerChunkLoadErrorReloadHandler();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary fallback={<CenteredPage>문제가 발생했습니다, 새로고침을 해주세요.</CenteredPage>}>
      <Suspense
        fallback={
          <CenteredPage>
            <CircularProgress />
          </CenteredPage>
        }
      >
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools buttonPosition="top-right" position="right" />
          <CommonContextProvider options={CommonOptions}>
            <ShopContextProvider options={ShopOptions}>
              <SnackbarProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<Layout routes={RouteDefinitions} />}>
                      <Route path="/" element={<LandingPage />} />
                      {Object.entries(RegisteredRoutes).map(([path, element]) => (
                        <Route key={path} path={path} element={element} />
                      ))}
                      <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </SnackbarProvider>
            </ShopContextProvider>
          </CommonContextProvider>
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
