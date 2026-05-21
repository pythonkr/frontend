import { Add, Clear, FilterList, RestartAlt } from "@mui/icons-material";
import { Box, Button, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { FC, useState } from "react";

import { ChoicesResponse, OpenAPIParameterSchema } from "@frontend/common/schemas/backendAdminAPI";
type AdminListFilterProps = {
  parameters: OpenAPIParameterSchema[];
  values: Record<string, string>;
  choices?: ChoicesResponse;
  onApply: (values: Record<string, string>) => void;
};

export const AdminListFilter: FC<AdminListFilterProps> = ({ parameters, values, choices, onApply }) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>(values);

  // 외부 values prop 변경 시 동기화 (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [prevValues, setPrevValues] = useState(values);
  if (prevValues !== values) {
    setPrevValues(values);
    setLocalValues(values);
  }

  const handleChange = (name: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const cleaned = Object.fromEntries(Object.entries(localValues).filter(([, v]) => v !== ""));
    onApply(cleaned);
  };

  const handleClear = () => {
    setLocalValues({});
    onApply({});
  };

  if (parameters.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack spacing={2} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterList fontSize="small" />
          <span>필터</span>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", alignItems: "flex-start" }}>
          {parameters.map((param) => (
            <FilterField
              key={param.name}
              param={param}
              value={localValues[param.name] || ""}
              choices={choices?.[param.name]}
              onChange={handleChange}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleApply} size="small">
            적용
          </Button>
          <Button variant="text" onClick={handleClear} size="small" startIcon={<RestartAlt />}>
            초기화
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

type ChoiceItem = { const: string | null; title: string };

type FilterFieldProps = {
  param: OpenAPIParameterSchema;
  value: string;
  choices?: ChoiceItem[];
  onChange: (name: string, value: string) => void;
};

const FilterField: FC<FilterFieldProps> = ({ param, value, choices, onChange }) => {
  const { name, schema, description } = param;

  if (schema?.type === "array") return <ArrayFilterField name={name} items={schema.items} value={value} onChange={onChange} />;
  if (schema?.enum) return <EnumFilterField name={name} options={schema.enum} value={value} onChange={onChange} />;

  if (choices && choices.length > 0) {
    return (
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>{name}</InputLabel>
        <Select value={value} label={name} onChange={(e) => onChange(name, e.target.value as string)}>
          <MenuItem value="">
            <em>전체</em>
          </MenuItem>
          {choices.map((choice) => (
            <MenuItem key={choice.const ?? "__null__"} value={choice.const ?? ""}>
              {choice.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const inputType = schema?.type === "integer" || schema?.type === "number" ? "number" : "text";
  const helperText = schema?.format === "uuid" ? "UUID" : description || undefined;

  return (
    <TextField
      label={name}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      size="small"
      type={inputType}
      helperText={helperText}
      sx={{ minWidth: 200 }}
    />
  );
};

type EnumFilterFieldProps = {
  name: string;
  options: string[];
  value: string;
  onChange: (name: string, value: string) => void;
};

const EnumFilterField: FC<EnumFilterFieldProps> = ({ name, options, value, onChange }) => {
  const selectedValues = value ? value.split(",") : [];

  const handleChange = (newValues: string | string[]) => {
    const arr = typeof newValues === "string" ? newValues.split(",") : newValues;
    onChange(name, arr.filter((v) => v !== "").join(","));
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{name}</InputLabel>
      <Select
        multiple
        value={selectedValues}
        label={name}
        onChange={(e) => handleChange(e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((v) => (
              <Chip key={v} label={v} size="small" />
            ))}
          </Box>
        )}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

type ArrayFilterFieldProps = {
  name: string;
  items?: { type?: string; enum?: string[] };
  value: string;
  onChange: (name: string, value: string) => void;
};

const ArrayFilterField: FC<ArrayFilterFieldProps> = ({ name, items, value, onChange }) => {
  const values = value ? value.split(",") : [];

  const updateValues = (newValues: string[]) => onChange(name, newValues.filter((v) => v !== "").join(","));
  const handleAdd = () => updateValues([...values, ""]);
  const handleRemove = (index: number) => updateValues(values.filter((_, i) => i !== index));

  const handleItemChange = (index: number, newValue: string) => {
    const newValues = [...values];
    newValues[index] = newValue;
    updateValues(newValues);
  };

  const inputType = items?.type === "integer" || items?.type === "number" ? "number" : "text";

  return (
    <Box sx={{ minWidth: 200 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <InputLabel sx={{ fontSize: "0.875rem" }}>{name}</InputLabel>
          <IconButton size="small" onClick={handleAdd}>
            <Add fontSize="small" />
          </IconButton>
        </Stack>
        {values.map((v, index) => (
          <Stack key={index} direction="row" spacing={0.5} alignItems="center">
            {items?.enum ? (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select value={v} onChange={(e) => handleItemChange(index, e.target.value as string)} displayEmpty>
                  <MenuItem value="">
                    <em>선택</em>
                  </MenuItem>
                  {items.enum.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField value={v} onChange={(e) => handleItemChange(index, e.target.value)} size="small" type={inputType} sx={{ minWidth: 150 }} />
            )}
            <IconButton size="small" onClick={() => handleRemove(index)}>
              <Clear fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};
