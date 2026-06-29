import { useBackendAdminClient, useDashboardChartsQuery } from "@frontend/common/hooks/useAdminAPI";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, useMemo, useState } from "react";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";

import { MetricCard, SeriesCard } from "./chart_card";
import { SharedFilterBar } from "./filter_bar";
import { computeSharedParams, initialValues, ParamValues } from "./params";

const InnerDashboard: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const client = useBackendAdminClient();
    const { data: charts } = useDashboardChartsQuery(client);

    const sharedParams = useMemo(() => computeSharedParams(charts), [charts]);
    const sharedKeys = useMemo(() => new Set(sharedParams.map((p) => p.key)), [sharedParams]);
    const [sharedValues, setSharedValues] = useState<ParamValues>(() => initialValues(sharedParams));
    // 조회/초기화마다 증가 — 값이 그대로여도 카드 로컬 기간 override 를 공통값으로 되돌리는 신호.
    const [applyNonce, setApplyNonce] = useState(0);
    const applyShared = (values: ParamValues) => {
      setSharedValues(values);
      setApplyNonce((n) => n + 1);
    };

    const metricCharts = useMemo(() => charts.filter((c) => c.type === "metric"), [charts]);
    const seriesCharts = useMemo(() => charts.filter((c) => c.type !== "metric"), [charts]);

    return (
      <Stack spacing={2} sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }}>
        <Typography variant="h5">통계 대시보드</Typography>

        {charts.length === 0 && <Typography color="text.secondary">등록된 차트가 없습니다.</Typography>}

        {sharedParams.length > 0 && <SharedFilterBar params={sharedParams} initial={sharedValues} onApply={applyShared} />}

        {metricCharts.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={2}>
            {metricCharts.map((chart) => (
              <MetricCard key={chart.id} chart={chart} sharedKeys={sharedKeys} sharedValues={sharedValues} applyNonce={applyNonce} />
            ))}
          </Stack>
        )}

        {seriesCharts.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
            {seriesCharts.map((chart) => (
              <SeriesCard key={chart.id} chart={chart} sharedKeys={sharedKeys} sharedValues={sharedValues} applyNonce={applyNonce} />
            ))}
          </Box>
        )}
      </Stack>
    );
  })
);

export const DashboardPage: FC = () => (
  <BackendAdminSignInGuard>
    <InnerDashboard />
  </BackendAdminSignInGuard>
);
