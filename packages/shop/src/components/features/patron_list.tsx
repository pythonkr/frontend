import { CircularProgress, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";

import { AutoTextLinking } from "@frontend/common/components";
import { usePatrons, useShopClient } from "@frontend/shop/hooks";

const InnerPatronList: FC<{ year: number }> = ErrorBoundary.with(
  { fallback: <>개인후원자 목록을 불러오는 중 문제가 발생했습니다.</> },
  Suspense.with({ fallback: <CircularProgress /> }, ({ year }) => {
    const shopAPIClient = useShopClient();
    const { data } = usePatrons(shopAPIClient, year);
    return data.map((patron) => (
      <Stack key={patron.name} spacing={1} sx={{ my: 2 }}>
        <Typography variant="h5" sx={(theme) => ({ fontWeight: 400, color: theme.palette.primary.dark })} children={patron.name} />
        <Typography variant="subtitle1" sx={(theme) => ({ a: { color: theme.palette.primary.main }, whiteSpace: "pre-wrap" })}>
          <AutoTextLinking children={patron.contribution_message.replace("\\n", "\n") || "Weave with Python!"} />
        </Typography>
      </Stack>
    ));
  })
);

export const PatronList: FC<{ year: number }> = ({ year }) => <Stack children={<InnerPatronList year={year} />} />;
