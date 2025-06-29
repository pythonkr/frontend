import { CircularProgress, Stack, Typography } from "@mui/material";
import * as React from "react";

import { useAppContext } from "../../contexts/app_context";
import { Page } from "../page";

export const LoadingPage: React.FC = () => {
  const { language } = useAppContext();
  const loadingStr = language === "ko" ? "페이지를 불러오는 중입니다..." : "Loading...";

  return (
    <Page>
      <Stack alignItems="center" justifyContent="center" sx={{ width: "100%", flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom children={loadingStr} />
        <CircularProgress />
      </Stack>
    </Page>
  );
};
