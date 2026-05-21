import { Stack } from "@mui/material";
import { FC } from "react";

import { Page } from "@apps/pyconkr-participant-portal/components/page";
import { ErrorFallback } from "@frontend/common/components";

export const ErrorPage: FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  return (
    <Page>
      <Stack alignItems="center" justifyContent="center" sx={{ width: "100%", flexGrow: 1 }}>
        <ErrorFallback error={error} reset={reset} />
      </Stack>
    </Page>
  );
};
