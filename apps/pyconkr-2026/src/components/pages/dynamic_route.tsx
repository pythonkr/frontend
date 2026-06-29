import { BackendAPIClientError } from "@frontend/common/apis";
import { CenteredPage, ErrorFallback, MDXSections } from "@frontend/common/components";
import { useBackendClient, usePageQuery } from "@frontend/common/hooks/useAPI";
import { CircularProgress } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { FC, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { isEmpty, isString } from "remeda";

import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

const LoginRequired: FC = () => <>401 Login Required</>;
const PermissionDenied: FC = () => <>403 Permission Denied</>;
const PageNotFound: FC = () => <>404 Not Found</>;
const CenteredLoadingPage: FC = () => (
  <CenteredPage>
    <CircularProgress />
  </CenteredPage>
);

const throwPageNotFound: (message: string) => never = (message) => {
  const errorStr = `RouteRenderer: ${message}`;
  const axiosError = new AxiosError(errorStr, errorStr, undefined, undefined, {
    status: 404,
  } as AxiosResponse);
  throw new BackendAPIClientError(axiosError);
};

const RouteErrorFallback: FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  if (error instanceof BackendAPIClientError) {
    switch (error.status) {
      case 401:
        return <LoginRequired />;
      case 403:
        return <PermissionDenied />;
      case 404:
        return <PageNotFound />;
      default:
        return <ErrorFallback error={error} reset={reset} />;
    }
  }
  return <ErrorFallback error={error} reset={reset} />;
};

const WaitedCenteredLoadingPage: FC = Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
  const [isFetching, setIsFetching] = useState(true);
  const qClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = qClient.getQueryCache().subscribe(() => setIsFetching(qClient.isFetching() > 0));
    return () => unsubscribe();
  }, [qClient]);

  return isFetching ? <CenteredLoadingPage /> : <PageNotFound />;
});

const InnerPageRenderer: FC<{ id: string }> = Suspense.with({ fallback: <CenteredLoadingPage /> }, ({ id }) => {
  const { setAppContext } = useAppContext();
  const backendClient = useBackendClient();
  const { data } = usePageQuery(backendClient, id);

  useEffect(() => {
    setAppContext((prev) => ({
      ...prev,
      title: data.title,
      shouldShowTitleBanner: data.show_top_title_banner,
      shouldShowSponsorBanner: data.show_bottom_sponsor_banner,
    }));
  }, [data, setAppContext]);

  return <MDXSections css={data.css} sections={data.sections} />;
});

export const PageRenderer: FC<{ id: string }> = ({ id }) => (
  <ErrorBoundary fallback={RouteErrorFallback} resetKeys={[id]}>
    <InnerPageRenderer id={id} />
  </ErrorBoundary>
);

export const RouteRenderer: FC = ErrorBoundary.with(
  { fallback: RouteErrorFallback },
  Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
    const { pathname } = useLocation();
    const { siteMapNode, currentSiteMapDepth } = useAppContext();
    const routeInfo = !isEmpty(currentSiteMapDepth) && currentSiteMapDepth[currentSiteMapDepth.length - 1];

    useEffect(() => {
      if (siteMapNode && !isEmpty(currentSiteMapDepth) && !routeInfo) {
        console.warn(`Route not found in site map: ${pathname}`);
      }
    }, [pathname, siteMapNode, currentSiteMapDepth, routeInfo]);

    if (!(siteMapNode && routeInfo)) return <WaitedCenteredLoadingPage />;
    if (isString(routeInfo.page)) return <PageRenderer id={routeInfo.page} />;
    if (isString(routeInfo.external_link)) window.location.replace(routeInfo.external_link);
    return <PageNotFound />;
  })
);

export const PageIdParamRenderer: FC = Suspense.with({ fallback: <CenteredLoadingPage /> }, () => {
  const { id } = useParams();
  if (!id) throwPageNotFound("Page ID is required");
  return <PageRenderer id={id} />;
});
