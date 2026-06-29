import { AutoTextLinking } from "@frontend/common/components";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC } from "react";

import { usePatrons, useShopClient } from "@frontend/shop/hooks";

const InnerPatronList: FC<{ year: number; fallbackMessage: string }> = ErrorBoundary.with(
  { fallback: <>개인후원자 목록을 불러오는 중 문제가 발생했습니다.</> },
  Suspense.with({ fallback: <CircularProgress /> }, ({ year, fallbackMessage }) => {
    const shopAPIClient = useShopClient();
    const { data } = usePatrons(shopAPIClient, year);
    return data.map((patron) => (
      <Stack key={patron.name} spacing={1} sx={{ my: 2 }}>
        <Typography variant="h5" sx={(theme) => ({ fontWeight: 400, color: theme.palette.primary.dark })} children={patron.name} />
        <Typography variant="subtitle1" sx={(theme) => ({ a: { color: theme.palette.primary.main }, whiteSpace: "pre-wrap" })}>
          <AutoTextLinking children={patron.contribution_message.replace("\\n", "\n") || fallbackMessage} />
        </Typography>
      </Stack>
    ));
  })
);

/**
 * 특정 연도의 개인 후원자 목록을 후원자 이름과 후원 한마디와 함께 보여준다.
 * 후원 한마디 안의 URL 은 자동으로 링크 처리된다.
 * @example <Shop__Feature__PatronList year={2026} />
 */
export const PatronList: FC<{
  /** 후원자를 조회할 연도(예: `2026`). */
  year: number;
  /** 후원자가 후원 한마디를 작성하지 않았을 때 대신 보여줄 기본 메시지. */
  fallbackMessage?: string;
}> = ({ year, fallbackMessage = "Weave with Python!" }) => <Stack children={<InnerPatronList year={year} fallbackMessage={fallbackMessage} />} />;
