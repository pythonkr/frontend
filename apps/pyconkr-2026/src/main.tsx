import { Global } from "@emotion/react";
import * as Common from "@frontend/common";
import * as Shop from "@frontend/shop";
import { theme2026 } from "@frontend/theme";
import { CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App.tsx";
import { IS_DEBUG_ENV } from "./consts";
import { LOCAL_STORAGE_LANGUAGE_KEY } from "./consts/local_storage.ts";
import { PyConKRMDXComponents } from "./consts/mdx_components.ts";
import { AppContext, AppContextType } from "./contexts/app_context.tsx";

const muiTheme = createTheme(theme2026.muiTheme);

const eventConfig: Common.Contexts.EventConfig = {
  ...theme2026.event,
  assets: {
    ...theme2026.event.assets,
  },
};

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

const CommonOptions: Common.Contexts.ContextOptions = {
  language: "ko",
  debug: IS_DEBUG_ENV,
  baseUrl: ".",
  backendApiDomain: import.meta.env.VITE_PYCONKR_BACKEND_API_DOMAIN,
  backendApiTimeout: 10000,
  mdxComponents: PyConKRMDXComponents,
  eventConfig,
};

const ShopOptions: Shop.Contexts.ContextOptions = {
  language: "ko",
  shopApiDomain: import.meta.env.VITE_PYCONKR_SHOP_API_DOMAIN,
  shopApiCSRFCookieName: import.meta.env.VITE_PYCONKR_SHOP_CSRF_COOKIE_NAME,
  shopApiTimeout: 10000,
  shopImpAccountId: import.meta.env.VITE_PYCONKR_SHOP_IMP_ACCOUNT_ID,
};

const SuspenseFallback = (
  <Common.Components.CenteredPage>
    <CircularProgress />
  </Common.Components.CenteredPage>
);

const MainApp: React.FC = () => {
  const [appState, setAppContext] = React.useState<Omit<AppContextType, "setAppContext">>({
    language: (localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as "ko" | "en" | null) ?? "ko",
    shouldShowTitleBanner: true,
    shouldShowSponsorBanner: false,
    currentSiteMapDepth: [],
    title: eventConfig.eventName,
  });

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <SnackbarProvider>
          <BrowserRouter>
            <AppContext.Provider value={{ ...appState, setAppContext }}>
              <Common.Components.CommonContextProvider options={{ ...CommonOptions, language: appState.language }}>
                <Shop.Components.Common.ShopContextProvider options={{ ...ShopOptions, language: appState.language }}>
                  <ErrorBoundary fallback={Common.Components.ErrorFallback}>
                    <Suspense fallback={SuspenseFallback}>
                      <ThemeProvider theme={muiTheme}>
                        <CssBaseline />
                        <Global styles={theme2026.globalStyles} />
                        <App />
                      </ThemeProvider>
                    </Suspense>
                  </ErrorBoundary>
                </Shop.Components.Common.ShopContextProvider>
              </Common.Components.CommonContextProvider>
            </AppContext.Provider>
          </BrowserRouter>
        </SnackbarProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

ReactDom.createRoot(document.getElementById("root")!).render(<MainApp />);
