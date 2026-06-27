import { Global } from "@emotion/react";
import { CenteredPage, CommonContextProvider, ErrorFallback } from "@frontend/common/components";
import type { ContextOptions } from "@frontend/common/contexts";
import { captureSessionTokenFromURL, initFaro, registerChunkLoadErrorReloadHandler } from "@frontend/common/utils";
import { ShopContextProvider } from "@frontend/shop/components/common";
import { ContextOptions as ShopContextOptions } from "@frontend/shop/contexts";
import { CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import { FC, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./main.css";

import { FontSwitcher } from "./components/FontSwitcher.tsx";
import { IS_DEBUG_ENV } from "./consts";
import { LOCAL_STORAGE_LANGUAGE_KEY } from "./consts/local_stroage.ts";
import { PyConKRMDXComponents } from "./consts/mdx_components.ts";
import { AppContext, AppContextType } from "./contexts/app_context.tsx";
import { router } from "./router.tsx";
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
    onMutate: (_variables, mutation) => {
      queryClient.resetQueries({
        predicate: (query) => mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true,
      });
      queryClient.cancelQueries({
        predicate: (query) => mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true,
      });
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      queryClient.resetQueries({
        predicate: (query) => mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true,
      });
    },
  }),
});

// dev 서버에서는 vite proxy(/v1, /api)로 백엔드 호출 → relative URL 사용 (same-origin이라 CORS/쿠키 문제 회피)
const backendApiDomain = import.meta.env.DEV ? "" : import.meta.env.VITE_PYCONKR_BACKEND_API_DOMAIN;

const CommonOptions: ContextOptions = {
  appType: "main",
  language: "ko",
  debug: IS_DEBUG_ENV,
  baseUrl: ".",
  backendApiDomain,
  backendApiAbsoluteDomain: import.meta.env.VITE_PYCONKR_BACKEND_API_DOMAIN,
  accountsDomain: import.meta.env.VITE_PYCONKR_ACCOUNTS_DOMAIN,
  backendApiCSRFCookieName: import.meta.env.VITE_PYCONKR_BACKEND_CSRF_COOKIE_NAME,
  backendApiSessionCookieName: import.meta.env.VITE_PYCONKR_BACKEND_SESSION_COOKIE_NAME,
  backendApiTimeout: 10000,
  mdxComponents: PyConKRMDXComponents,
};

const ShopOptions: ShopContextOptions = {
  language: "ko",
  shopImpAccountId: import.meta.env.VITE_PYCONKR_SHOP_IMP_ACCOUNT_ID,
};

const SuspenseFallback = (
  <CenteredPage>
    <CircularProgress />
  </CenteredPage>
);

export const MainApp: FC = () => {
  const [appState, setAppContext] = useState<Omit<AppContextType, "setAppContext">>({
    language: (localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as "ko" | "en" | null) ?? "ko",
    shouldShowTitleBanner: true,
    shouldShowSponsorBanner: false,

    currentSiteMapDepth: [],

    title: "PyCon Korea 2026",
  });

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <SnackbarProvider>
          <AppContext.Provider value={{ ...appState, setAppContext }}>
            <CommonContextProvider options={{ ...CommonOptions, language: appState.language }}>
              <ShopContextProvider options={{ ...ShopOptions, language: appState.language }}>
                <ErrorBoundary fallback={ErrorFallback}>
                  <Suspense fallback={SuspenseFallback}>
                    <ThemeProvider theme={muiTheme}>
                      <CssBaseline />
                      <Global styles={globalStyles} />
                      <FontSwitcher />
                      <RouterProvider router={router} />
                    </ThemeProvider>
                  </Suspense>
                </ErrorBoundary>
              </ShopContextProvider>
            </CommonContextProvider>
          </AppContext.Provider>
        </SnackbarProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

initFaro({
  enabled: import.meta.env.PROD,
  url: import.meta.env.VITE_FARO_COLLECTOR_URL,
  app: {
    name: "pyconkr-2026",
    version: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.MODE as "development" | "production",
  },
});
registerChunkLoadErrorReloadHandler();
captureSessionTokenFromURL(import.meta.env.VITE_PYCONKR_BACKEND_SESSION_COOKIE_NAME);

createRoot(document.getElementById("root")!).render(<MainApp />);
