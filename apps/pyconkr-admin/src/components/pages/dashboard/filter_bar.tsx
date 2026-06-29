import { DashboardChartParam, DashboardDateRangeValue } from "@frontend/common/schemas/backendAdminAPI";
import { RestartAlt } from "@mui/icons-material";
import { Button, Paper, Stack } from "@mui/material";
import { FC, useState } from "react";

import { ParamControl } from "./param_control";
import { initialValues, ParamValue, ParamValues } from "./params";

// event_id 변경 시: 종속 티켓 선택을 비우고, 그 이벤트의 통계 기간으로 date_range 를 자동 채운다(조정 가능).
const applyEventChange = (changedKey: string, params: DashboardChartParam[], values: ParamValues): ParamValues => {
  if (changedKey !== "event_id") return values;
  const next = { ...values };

  // 다른 이벤트의 티켓 선택이 남지 않도록 종속 multi_select 비우기.
  for (const p of params) {
    if (p.type === "multi_select" && (p.options ?? []).some((o) => "event_id" in o)) next[p.key] = [];
  }

  // 선택 이벤트의 통계 기간이 있으면 date_range 프리필 (없는 쪽은 현재 값 유지).
  const eventId = values["event_id"];
  const eventOption = params.find((p) => p.key === "event_id")?.options?.find((o) => String(o.value) === eventId);
  const dateParam = params.find((p) => p.type === "date_range");
  if (eventId && dateParam && (eventOption?.date_from || eventOption?.date_to)) {
    const cur = (next[dateParam.key] as DashboardDateRangeValue | undefined) ?? { date_from: "", date_to: "" };
    next[dateParam.key] = { date_from: eventOption.date_from ?? cur.date_from, date_to: eventOption.date_to ?? cur.date_to };
  }

  return next;
};

type FilterBarProps = {
  params: DashboardChartParam[];
  initial: ParamValues;
  onApply: (values: ParamValues) => void;
};

export const SharedFilterBar: FC<FilterBarProps> = ({ params, initial, onApply }) => {
  const [draft, setDraft] = useState<ParamValues>(initial);

  const handleChange = (key: string, value: ParamValue) => {
    setDraft((prev) => applyEventChange(key, params, { ...prev, [key]: value }));
  };

  const handleReset = () => {
    const reset = initialValues(params);
    setDraft(reset);
    onApply(reset);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
        {params.map((p) => (
          <ParamControl key={p.key} param={p} value={draft[p.key]} values={draft} onChange={handleChange} />
        ))}
        <Stack direction="row" spacing={1}>
          <Button variant="contained" size="small" onClick={() => onApply(draft)}>
            조회
          </Button>
          <Button variant="text" size="small" startIcon={<RestartAlt />} onClick={handleReset}>
            초기화
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
