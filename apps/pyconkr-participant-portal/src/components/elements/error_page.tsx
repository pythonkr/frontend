import * as Common from "@frontend/common";
import { Stack } from "@mui/material";
import * as React from "react";

import { Page } from "../page";

export const ErrorPage: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  return (
    <Page>
      <Stack alignItems="center" justifyContent="center" sx={{ width: "100%", flexGrow: 1 }}>
        <Common.Components.ErrorFallback error={error} reset={reset} />
      </Stack>
    </Page>
  );
};
