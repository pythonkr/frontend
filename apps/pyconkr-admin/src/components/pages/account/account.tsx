import { CircularProgress } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";
import { Navigate } from "react-router-dom";

import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { useBackendAdminClient, useSignedInUserQuery } from "@frontend/common/hooks/useAdminAPI";

export const AccountRedirectPage: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const backendAdminAPIClient = useBackendAdminClient();
    const { data } = useSignedInUserQuery(backendAdminAPIClient);

    return data ? <Navigate to="/account/manage" replace /> : <Navigate to="/account/sign-in" replace />;
  })
);
