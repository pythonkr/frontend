import { formatBackendErrorMessage } from "@frontend/common/apis/client";
import { useBackendAdminClient, useDashboardChartDataQuery } from "@frontend/common/hooks/useAdminAPI";
import { DashboardChartDefinition, isMetricChartData } from "@frontend/common/schemas/backendAdminAPI";
import { Alert, Box, Checkbox, Chip, CircularProgress, FormControlLabel, Paper, Stack, Typography } from "@mui/material";
import { FC, useMemo, useState } from "react";

import { MetricView, SeriesChartView } from "./chart_views";
import { ParamControl } from "./param_control";
import { buildPayload, canFetch, effectiveValues, initialCardValues, isCardControlled, ParamValue, ParamValues } from "./params";

type CardProps = {
  chart: DashboardChartDefinition;
  sharedKeys: Set<string>;
  sharedValues: ParamValues;
  applyNonce: number; // 공통 조회/초기화 신호 — 증가할 때마다 카드 기간을 공통값으로 되돌린다.
};

// 카드 로컬 파라미터 + 차트별 조정 기간 + 공통 필터를 합쳐 독립 조회한다.
const useChartCard = ({ chart, sharedKeys, sharedValues, applyNonce }: CardProps) => {
  const client = useBackendAdminClient();
  const cardParams = useMemo(() => chart.params.filter((p) => isCardControlled(p, sharedKeys)), [chart, sharedKeys]);
  // 그 중 공통에서 시드되는 것(date_range) — 공통 조회/초기화 시 여기에 맞춰 되돌린다.
  const sharedCardParams = useMemo(() => cardParams.filter((p) => sharedKeys.has(p.key)), [cardParams, sharedKeys]);

  const [cardValues, setCardValues] = useState<ParamValues>(() => initialCardValues(cardParams, sharedKeys, sharedValues));
  const setLocal = (key: string, value: ParamValue) => setCardValues((prev) => ({ ...prev, [key]: value }));

  // 공통 조회/초기화(applyNonce 증가)마다 카드 기간을 공통값으로 되돌린다 — 값 변화 여부와 무관.
  // (렌더 중 상태 보정: React 권장 패턴, useEffect 불필요)
  const [prevNonce, setPrevNonce] = useState(applyNonce);
  if (prevNonce !== applyNonce) {
    setPrevNonce(applyNonce);
    setCardValues((prev) => {
      const next = { ...prev };
      for (const p of sharedCardParams) next[p.key] = sharedValues[p.key];
      return next;
    });
  }

  const values = effectiveValues(chart, sharedKeys, sharedValues, cardValues);
  const enabled = canFetch(chart.params, values);
  const payload = buildPayload(chart.params, values);
  const query = useDashboardChartDataQuery(client, chart, payload, enabled);

  return { cardParams, values, setLocal, query, enabled };
};

const LocalParamControls: FC<{
  params: DashboardChartDefinition["params"];
  values: ParamValues;
  onChange: (key: string, value: ParamValue) => void;
}> = ({ params, values, onChange }) =>
  params.length === 0 ? null : (
    <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
      {params.map((p) => (
        <ParamControl key={p.key} param={p} value={values[p.key]} values={values} onChange={onChange} />
      ))}
    </Stack>
  );

const CardBody: FC<{
  enabled: boolean;
  query: ReturnType<typeof useChartCard>["query"];
  children: (data: NonNullable<ReturnType<typeof useChartCard>["query"]["data"]>) => React.ReactNode;
}> = ({ enabled, query, children }) => {
  if (!enabled) return <Typography color="text.secondary">조회 조건(기간 등)을 선택해주세요.</Typography>;
  if (query.isPending) return <CircularProgress size={28} />;
  if (query.isError) return <Alert severity="error">{formatBackendErrorMessage(query.error, "데이터를 불러오지 못했습니다.")}</Alert>;
  if (!query.data) return <Typography color="text.secondary">데이터가 없습니다.</Typography>;
  return <>{children(query.data)}</>;
};

export const MetricCard: FC<CardProps> = (props) => {
  const { cardParams, values, setLocal, query, enabled } = useChartCard(props);
  const { chart } = props;
  return (
    <Paper variant="outlined" sx={{ p: 2, minWidth: 200, flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {chart.title}
      </Typography>
      <LocalParamControls params={cardParams} values={values} onChange={setLocal} />
      <Box sx={{ minHeight: 64, display: "flex", alignItems: "center" }}>
        <CardBody enabled={enabled} query={query}>
          {(data) => (isMetricChartData(data) ? <MetricView chart={chart} data={data} /> : null)}
        </CardBody>
      </Box>
    </Paper>
  );
};

export const SeriesCard: FC<CardProps> = (props) => {
  const { cardParams, values, setLocal, query, enabled } = useChartCard(props);
  const { chart } = props;
  const [trimEmpty, setTrimEmpty] = useState(true); // 라인 차트: 양 끝 값-없는 구간 잘라 보기
  return (
    <Paper variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">{chart.title}</Typography>
          {chart.unit && <Chip label={chart.unit} size="small" variant="outlined" />}
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
          <LocalParamControls params={cardParams} values={values} onChange={setLocal} />
          {chart.type === "line" && (
            <FormControlLabel
              control={<Checkbox size="small" checked={trimEmpty} onChange={(e) => setTrimEmpty(e.target.checked)} />}
              label="값 있는 구간만"
              sx={{ mr: 0 }}
            />
          )}
        </Stack>
      </Stack>
      <Box sx={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CardBody enabled={enabled} query={query}>
          {(data) =>
            !isMetricChartData(data) ? (
              data.data.length === 0 ? (
                <Typography color="text.secondary">표시할 데이터가 없습니다.</Typography>
              ) : (
                <Box sx={{ width: "100%" }}>
                  <SeriesChartView chart={chart} data={data} trimEmpty={trimEmpty} />
                </Box>
              )
            ) : null
          }
        </CardBody>
      </Box>
    </Paper>
  );
};
