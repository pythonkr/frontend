import { Global } from "@emotion/react";
import { Components } from "@frontend/common";
import type { ContextOptions } from "@frontend/common/src/contexts";
import { CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
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

const CommonOptions: ContextOptions = {
  language: "ko",
  debug: IS_DEBUG_ENV,
  baseUrl: ".",
  backendApiDomain: import.meta.env.VITE_PYCONKR_BACKEND_API_DOMAIN,
  backendApiTimeout: 10000,
  mdxComponents: PyConKRMDXComponents,
};

const SuspenseFallback = (
  <Components.CenteredPage>
    <CircularProgress sx={{ color: "#ed5ebd" }} />
  </Components.CenteredPage>
);

const MainApp: React.FC = () => {
  const [appState, setAppContext] = React.useState<Omit<AppContextType, "setAppContext">>({
    language: (localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as "ko" | "en" | null) ?? "ko",
    shouldShowTitleBanner: true,
    shouldShowSponsorBanner: false,

    currentSiteMapDepth: [],

    title: "PyCon Korea 2026",
  });

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <SnackbarProvider>
          <BrowserRouter>
            <AppContext.Provider value={{ ...appState, setAppContext }}>
              <Components.CommonContextProvider options={{ ...CommonOptions, language: appState.language }}>
                <ErrorBoundary fallback={Components.ErrorFallback}>
                  <Suspense fallback={SuspenseFallback}>
                    <ThemeProvider theme={muiTheme}>
                      <CssBaseline />
                      <Global styles={globalStyles} />
                      <App />
                    </ThemeProvider>
                  </Suspense>
                </ErrorBoundary>
              </Components.CommonContextProvider>
            </AppContext.Provider>
          </BrowserRouter>
        </SnackbarProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

ReactDom.createRoot(document.getElementById("root")!).render(<MainApp />);
