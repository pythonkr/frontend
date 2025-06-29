import { FormControl, InputLabel, Select, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import * as React from "react";

import { ErrorPage } from "../elements/error_page";
import { LoadingPage } from "../elements/loading_page";
import { SignInGuard } from "../elements/signin_guard";
import { Page } from "../page";

const InnerSponsorEditor: React.FC = () => {
  return (
    <SignInGuard>
      <Page>
        <Typography variant="h4" component="h1" gutterBottom children="후원사 정보 수정" />
        <form>
          <Stack>
            <Tabs>
              <Tab value="ko" label="한국어 (Korean)" />
              <Tab value="en" label="영어 (English)" />
            </Tabs>
            <TextField label="후원사명" />
            <TextField label="후원사 설명" multiline rows={4} />
            <FormControl fullWidth>
              <InputLabel children="로고 파일 선택 (Select logo files)" />
              <Select />
            </FormControl>
          </Stack>
        </form>
      </Page>
    </SignInGuard>
  );
};

export const SponsorEditor: React.FC = ErrorBoundary.with(
  { fallback: ErrorPage },
  Suspense.with({ fallback: <LoadingPage /> }, () => <SignInGuard children={<InnerSponsorEditor />} />)
);
