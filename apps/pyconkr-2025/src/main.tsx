import { Global } from "@emotion/react";
import { CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import { FC, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { CenteredPage, CommonContextProvider, ErrorFallback } from "@frontend/common/components";
import type { ContextOptions } from "@frontend/common/contexts";
import { registerChunkLoadErrorReloadHandler } from "@frontend/common/utils";
import { ShopContextProvider } from "@frontend/shop/components/common";
import { ContextOptions as ShopContextOptions } from "@frontend/shop/contexts";

import { App } from "./App.tsx";
import { IS_DEBUG_ENV } from "./consts";
import { LOCAL_STORAGE_LANGUAGE_KEY } from "./consts/local_stroage.ts";
import { PyConKRMDXComponents } from "./consts/mdx_components.ts";
import { AppContext, AppContextType } from "./contexts/app_context.tsx";
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

const backendApiDomainEnv: string = import.meta.env.VITE_PYCONKR_BACKEND_API_DOMAIN;
const backendApiDomain = backendApiDomainEnv.startsWith("http://") ? "" : backendApiDomainEnv;

const CommonOptions: ContextOptions = {
  language: "ko",
  debug: IS_DEBUG_ENV,
  baseUrl: ".",
  backendApiDomain,
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

    title: "PyCon Korea 2025",
  });

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <SnackbarProvider>
          <BrowserRouter>
            <AppContext.Provider value={{ ...appState, setAppContext }}>
              <CommonContextProvider options={{ ...CommonOptions, language: appState.language }}>
                <ShopContextProvider options={{ ...ShopOptions, language: appState.language }}>
                  <ErrorBoundary fallback={ErrorFallback}>
                    <Suspense fallback={SuspenseFallback}>
                      <ThemeProvider theme={muiTheme}>
                        <CssBaseline />
                        <Global styles={globalStyles} />
                        <App />
                      </ThemeProvider>
                    </Suspense>
                  </ErrorBoundary>
                </ShopContextProvider>
              </CommonContextProvider>
            </AppContext.Provider>
          </BrowserRouter>
        </SnackbarProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

registerChunkLoadErrorReloadHandler();

createRoot(document.getElementById("root")!).render(<MainApp />);
