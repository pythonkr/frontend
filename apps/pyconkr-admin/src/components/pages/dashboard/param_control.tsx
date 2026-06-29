import { DashboardChartParam, DashboardDateRangeValue, DashboardParamOption } from "@frontend/common/schemas/backendAdminAPI";
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC } from "react";

import { ParamValue, ParamValues } from "./params";

// 이벤트→티켓 종속 필터: 옵션이 event_id 를 들고 있으면, 선택된 이벤트의 것만 노출.
const visibleOptions = (param: DashboardChartParam, values: ParamValues): DashboardParamOption[] => {
  const options = param.options ?? [];
  const selectedEvent = values["event_id"];
  if (selectedEvent && options.some((o) => "event_id" in o)) {
    return options.filter((o) => o.event_id === selectedEvent);
  }
  return options;
};

type ParamControlProps = {
  param: DashboardChartParam;
  value: ParamValue;
  values: ParamValues; // 종속 필터 판단용 전체 값
  onChange: (key: string, value: ParamValue) => void;
  size?: "small" | "medium";
};

export const ParamControl: FC<ParamControlProps> = ({ param, value, values, onChange, size = "small" }) => {
  const set = (v: ParamValue) => onChange(param.key, v);

  switch (param.type) {
    case "date_range": {
      const dr = (value as DashboardDateRangeValue | undefined) ?? { date_from: "", date_to: "" };
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size={size}
            type="date"
            label={param.label}
            value={dr.date_from ?? ""}
            onChange={(e) => set({ ...dr, date_from: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />
          <Typography variant="body2" color="text.secondary">
            ~
          </Typography>
          <TextField
            size={size}
            type="date"
            label="종료"
            value={dr.date_to ?? ""}
            onChange={(e) => set({ ...dr, date_to: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />
        </Stack>
      );
    }

    case "select": {
      const options = visibleOptions(param, values);
      return (
        <TextField
          select
          size={size}
          label={param.label}
          value={(value as string) ?? ""}
          onChange={(e) => set(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {!param.required && param.default == null && (
            <MenuItem value="">
              <em>전체</em>
            </MenuItem>
          )}
          {options.map((o) => (
            <MenuItem key={String(o.value)} value={String(o.value)}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    case "multi_select": {
      const options = visibleOptions(param, values);
      const selected = (Array.isArray(value) ? value : []) as string[];
      const labelFor = (val: string) => options.find((o) => String(o.value) === val)?.label ?? val;
      return (
        <FormControl size={size} sx={{ minWidth: 200, maxWidth: 360 }}>
          <InputLabel>{param.label}</InputLabel>
          <Select
            multiple
            value={selected}
            input={<OutlinedInput label={param.label} />}
            onChange={(e) => set(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
            renderValue={(vals) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(vals as string[]).map((v) => (
                  <Chip key={v} label={labelFor(v)} size="small" />
                ))}
              </Box>
            )}
          >
            {options.length === 0 && (
              <MenuItem disabled>
                <em>선택 가능한 항목이 없습니다.</em>
              </MenuItem>
            )}
            {options.map((o) => {
              const val = String(o.value);
              return (
                <MenuItem key={val} value={val}>
                  <Checkbox checked={selected.includes(val)} size="small" />
                  <ListItemText primary={o.label} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      );
    }

    case "boolean":
      return <FormControlLabel control={<Checkbox size="small" checked={!!value} onChange={(e) => set(e.target.checked)} />} label={param.label} />;

    case "number":
      return (
        <TextField
          size={size}
          type="number"
          label={param.label}
          value={value === undefined || value === null ? "" : (value as number)}
          onChange={(e) => set(e.target.value === "" ? "" : Number(e.target.value))}
          sx={{ minWidth: 140 }}
        />
      );

    case "date":
      return (
        <TextField
          size={size}
          type="date"
          label={param.label}
          value={(value as string) ?? ""}
          onChange={(e) => set(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
      );

    case "text":
    default:
      return (
        <TextField size={size} label={param.label} value={(value as string) ?? ""} onChange={(e) => set(e.target.value)} sx={{ minWidth: 180 }} />
      );
  }
};
