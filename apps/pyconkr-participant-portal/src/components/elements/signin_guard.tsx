import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useParticipantPortalClient, useSignedInUserQuery } from "@frontend/common/hooks/useParticipantPortalAPI";

import { ErrorPage } from "./error_page";
import { LoadingPage } from "./loading_page";

export const SignInGuard: FC<PropsWithChildren> = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, ({ children }) => {
    const participantPortalClient = useParticipantPortalClient();
    const { data } = useSignedInUserQuery(participantPortalClient);

    return data ? children : <Navigate to="/signin" replace />;
  })
);
