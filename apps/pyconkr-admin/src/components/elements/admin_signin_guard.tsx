import { CircularProgress } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { useBackendAdminClient, useSignedInUserQuery } from "@frontend/common/hooks/useAdminAPI";

export const BackendAdminSignInGuard: FC<{ children: ReactNode }> = ErrorBoundary.with(
  { fallback: <>로그인 정보를 불러오는 중 문제가 발생했습니다.</> },
  Suspense.with({ fallback: <CircularProgress /> }, ({ children }) => {
    const backendAdminAPIClient = useBackendAdminClient();
    const { data } = useSignedInUserQuery(backendAdminAPIClient);

    if (!data) {
      addSnackbar("로그인 후 이용해주세요.", "error");
      return <Navigate to="/account/sign-in" replace />;
    }
    return children;
  })
);
