import { DashboardChartDefinition, DashboardChartParam, DashboardDateRangeValue } from "@frontend/common/schemas/backendAdminAPI";
import { format as d3Format } from "d3-format";

export type ParamValue = unknown;
export type ParamValues = Record<string, ParamValue>;

const SHARED_MIN_CHARTS = 2;

// key 가 같아도 옵션/기본값이 다르면 별개 파라미터 (granularity 는 차트마다 선택지가 다름).
const signature = (p: DashboardChartParam) => `${p.type}|${JSON.stringify(p.options ?? null)}|${JSON.stringify(p.default ?? null)}`;

// 동일 정의로 2개 이상 차트에 등장하는 파라미터만 공통 필터로 승격 (event_id/ticket_ids/date_range).
export const computeSharedParams = (charts: DashboardChartDefinition[]): DashboardChartParam[] => {
  const byKey = new Map<string, { sigs: Set<string>; count: number; param: DashboardChartParam }>();
  const order: string[] = [];

  for (const chart of charts) {
    for (const p of chart.params) {
      const entry = byKey.get(p.key);
      if (entry) {
        entry.sigs.add(signature(p));
        entry.count += 1;
      } else {
        byKey.set(p.key, { sigs: new Set([signature(p)]), count: 1, param: p });
        order.push(p.key);
      }
    }
  }

  return order
    .map((key) => byKey.get(key)!)
    .filter((entry) => entry.sigs.size === 1 && entry.count >= SHARED_MIN_CHARTS)
    .map((entry) => entry.param);
};

const pad = (n: number) => String(n).padStart(2, "0");

export const toDateInput = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const defaultDateRange = (days = 30): DashboardDateRangeValue => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { date_from: toDateInput(from), date_to: toDateInput(to) };
};

export const defaultParamValue = (p: DashboardChartParam): ParamValue => {
  switch (p.type) {
    case "date_range":
      return defaultDateRange();
    case "multi_select":
      return Array.isArray(p.default) ? p.default : [];
    case "boolean":
      return typeof p.default === "boolean" ? p.default : false;
    case "number":
      return typeof p.default === "number" ? p.default : "";
    default:
      return p.default ?? "";
  }
};

export const initialValues = (params: DashboardChartParam[]): ParamValues => Object.fromEntries(params.map((p) => [p.key, defaultParamValue(p)]));

const isFilled = (p: DashboardChartParam, v: ParamValue): boolean => {
  if (p.type === "date_range") {
    const dr = v as Partial<DashboardDateRangeValue> | undefined;
    return !!dr?.date_from && !!dr?.date_to;
  }
  if (p.type === "multi_select") return Array.isArray(v) && v.length > 0;
  if (p.type === "boolean") return typeof v === "boolean";
  return v !== undefined && v !== null && v !== "";
};

export const canFetch = (params: DashboardChartParam[], values: ParamValues): boolean =>
  params.every((p) => !p.required || isFilled(p, values[p.key]));

// 빈 선택값(예: event_id="")은 빼서 백엔드 검증 오류를 피한다.
export const buildPayload = (params: DashboardChartParam[], values: ParamValues): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  for (const p of params) {
    const v = values[p.key];
    if (p.type === "boolean") payload[p.key] = !!v;
    else if (isFilled(p, v)) payload[p.key] = v;
  }
  return payload;
};

// 카드가 직접 편집: 공통이 아닌 파라미터 + 차트별 조정을 허용하는 기간(date_range).
export const isCardControlled = (p: DashboardChartParam, sharedKeys: Set<string>): boolean => !sharedKeys.has(p.key) || p.type === "date_range";

export const initialCardValues = (cardParams: DashboardChartParam[], sharedKeys: Set<string>, sharedValues: ParamValues): ParamValues =>
  Object.fromEntries(cardParams.map((p) => [p.key, sharedKeys.has(p.key) ? sharedValues[p.key] : defaultParamValue(p)]));

export const effectiveValues = (
  chart: DashboardChartDefinition,
  sharedKeys: Set<string>,
  sharedValues: ParamValues,
  cardValues: ParamValues
): ParamValues => {
  const out: ParamValues = {};
  for (const p of chart.params) out[p.key] = isCardControlled(p, sharedKeys) ? cardValues[p.key] : sharedValues[p.key];
  return out;
};

export const formatNumber = (n: number): string =>
  Number.isInteger(n) ? n.toLocaleString("ko-KR") : n.toLocaleString("ko-KR", { maximumFractionDigits: 2 });

// value_format(d3-format, 예: ",.0f")이 있으면 그대로, 없거나 잘못되면 기본 포맷.
const formatterCache = new Map<string, (n: number) => string>();
export const numberFormatter = (valueFormat?: string | null): ((n: number) => string) => {
  if (!valueFormat) return formatNumber;
  let fn = formatterCache.get(valueFormat);
  if (!fn) {
    try {
      fn = d3Format(valueFormat);
    } catch {
      fn = formatNumber;
    }
    formatterCache.set(valueFormat, fn);
  }
  return fn;
};

export const formatWithUnit = (value: number | string | null | undefined, unit?: string | null, valueFormat?: string | null): string => {
  if (value === null || value === undefined || value === "") return "—";
  const text = typeof value === "number" ? numberFormatter(valueFormat)(value) : String(value);
  if (!unit) return text;
  if (unit === "%") return `${text}%`;
  return `${text} ${unit}`;
};
