import {
  DashboardChartDefinition,
  MetricChartDataResponse,
  SeriesChartDataPoint,
  SeriesChartDataResponse,
} from "@frontend/common/schemas/backendAdminAPI";
import { ArrowDownward, ArrowUpward, Remove } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { FC, memo } from "react";

import { formatWithUnit, numberFormatter } from "./params";

const CHART_HEIGHT = 320;

const toNumber = (v: number | string | null | undefined): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

// y축 눈금: value_format 적용, 단위는 안 붙인다(눈금은 숫자만).
const makeAxisFormatter = (valueFormat?: string | null) => {
  const fmt = numberFormatter(valueFormat);
  return (v: number | string | null | undefined) => (typeof v === "number" ? fmt(v) : String(v ?? ""));
};

// 시리즈가 1개면 범례 숨김 (명시적으로 켠 경우 제외).
const shouldHideLegend = (chart: DashboardChartDefinition, seriesCount: number) =>
  chart.options?.show_legend === false || (seriesCount <= 1 && chart.options?.show_legend !== true);

// 백엔드가 0으로 채워 보낸 양 끝 빈(모든 시리즈 0) 구간을 잘라 데이터 구간에 맞춘다 (중간 0 은 보존).
const trimEmptyEdges = (data: SeriesChartDataResponse): SeriesChartDataResponse => {
  const isEmpty = (d: SeriesChartDataPoint) => data.series.every((s) => toNumber(d.values?.[s.key]) === 0);
  let start = 0;
  let end = data.data.length - 1;
  while (start <= end && isEmpty(data.data[start])) start += 1;
  while (end >= start && isEmpty(data.data[end])) end -= 1;
  if (start > end || (start === 0 && end === data.data.length - 1)) return data; // 자를 게 없으면 원본
  return { ...data, data: data.data.slice(start, end + 1) };
};

export const MetricView: FC<{ chart: DashboardChartDefinition; data: MetricChartDataResponse }> = ({ chart, data }) => {
  const comparison = data.comparison;
  const DirectionIcon = comparison?.direction === "up" ? ArrowUpward : comparison?.direction === "down" ? ArrowDownward : Remove;
  const directionColor = comparison?.direction === "up" ? "success.main" : comparison?.direction === "down" ? "error.main" : "text.secondary";

  return (
    <Stack spacing={0.5} sx={{ py: 1 }}>
      <Typography variant="h3" component="div" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
        {formatWithUnit(data.value, chart.unit, chart.options?.value_format)}
      </Typography>
      {comparison && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: directionColor }}>
          <DirectionIcon fontSize="small" />
          <Typography variant="body2">
            {comparison.label} {formatWithUnit(comparison.value, comparison.unit ?? chart.unit, chart.options?.value_format)}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

// SVG 렌더가 무거워 memo — chart/data/trimEmpty 동일하면 재렌더 생략.
export const SeriesChartView = memo(
  ({ chart, data, trimEmpty }: { chart: DashboardChartDefinition; data: SeriesChartDataResponse; trimEmpty?: boolean }) => {
    const hideLegend = shouldHideLegend(chart, data.series.length);
    const valueFormat = chart.options?.value_format;

    if (chart.type === "pie") {
      const pieData = data.data.map((d, index) => ({
        id: index,
        value: toNumber(d.value ?? (d.values ? Object.values(d.values)[0] : 0)),
        label: d.label,
        ...(d.color ? { color: d.color } : {}),
      }));
      return (
        <PieChart
          height={CHART_HEIGHT}
          hideLegend={hideLegend}
          series={[{ data: pieData, valueFormatter: (item) => formatWithUnit(item.value, chart.unit, valueFormat) }]}
        />
      );
    }

    // line/bar 공통 시리즈 구성. 차트별 차이(showMark / stack)는 아래에서 덧붙인다.
    const view = chart.type === "line" && trimEmpty ? trimEmptyEdges(data) : data;
    const xLabels = view.data.map((d) => d.label);
    const series = view.series.map((s) => ({
      data: view.data.map((d) => toNumber(d.values?.[s.key])),
      label: s.name,
      valueFormatter: (v: number | null) => (v === null ? "—" : formatWithUnit(v, chart.unit, valueFormat)),
      ...(s.color ? { color: s.color } : {}),
    }));
    const xAxisBase = { data: xLabels, label: chart.options?.x_axis_label ?? undefined };
    const yAxis = [{ label: chart.options?.y_axis_label ?? chart.unit ?? undefined, valueFormatter: makeAxisFormatter(valueFormat) }];

    if (chart.type === "line") {
      const showMark = xLabels.length <= 40;
      return (
        <LineChart
          height={CHART_HEIGHT}
          hideLegend={hideLegend}
          xAxis={[{ ...xAxisBase, scaleType: "point" }]}
          yAxis={yAxis}
          series={series.map((s) => ({ ...s, showMark }))}
        />
      );
    }

    const stacked = !!chart.options?.stacked;
    return (
      <BarChart
        height={CHART_HEIGHT}
        hideLegend={hideLegend}
        xAxis={[{ ...xAxisBase, scaleType: "band" }]}
        yAxis={yAxis}
        series={stacked ? series.map((s) => ({ ...s, stack: "total" })) : series}
      />
    );
  }
);
SeriesChartView.displayName = "SeriesChartView";
