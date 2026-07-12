import {
  useBackendAdminClient,
  usePublicFileQuery,
  useSelectablesQuery,
  useSignedInUserQuery,
  useUploadPublicFileMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { ChoiceItem, ChoiceMetaFieldDef, ChoiceMetaSchema, ChoiceMetaValue } from "@frontend/common/schemas/backendAdminAPI";
import { CloudUpload, PermMedia } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { DragEvent, FC, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

export type ChoicePickerOption = {
  value: string | number | null;
  label: string;
  meta?: Record<string, ChoiceMetaValue>;
};

type BaseProps = {
  id?: string;
  label?: string;
  options?: ChoicePickerOption[]; // enum(비관계형 choices) 폴백. source 지정 시 selectables 결과로 대체됨
  source?: { app: string; resource: string };
  optionFilter?: (option: ChoicePickerOption) => boolean; // source 조회 결과 사전 필터 (예: 확장자)
  required?: boolean;
  disabled?: boolean;
};

// 공개 파일 리소스. source 가 이것이면 ChoicePicker 가 썸네일 미리보기 + 업로드 탭을 제공한다.
const PUBLIC_FILE_SOURCE = { app: "file", resource: "publicfile" };
const isPublicFileSource = (source?: { app: string; resource: string }) =>
  source?.app === PUBLIC_FILE_SOURCE.app && source?.resource === PUBLIC_FILE_SOURCE.resource;

type SingleProps = BaseProps & {
  multiple?: false;
  value: string | number | null | undefined;
  onChange: (value: string | number | null | undefined) => void;
};

type MultipleProps = BaseProps & {
  multiple: true;
  value: (string | number)[] | null | undefined;
  onChange: (value: (string | number)[]) => void;
};

export type ChoicePickerProps = SingleProps | MultipleProps;

const MAX_VISIBLE_ROWS = 200;

const FILTER_STORAGE_PREFIX = "choicePicker.filters.";
type PersistedFilters = { metaValues: Record<string, string>; ranges: Record<string, { min: string; max: string }>; ownerOnly: boolean };
const loadPersistedFilters = (key?: string): PersistedFilters | null => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as PersistedFilters) : null;
  } catch {
    return null;
  }
};
const savePersistedFilters = (key: string, filters: PersistedFilters) => {
  try {
    localStorage.setItem(FILTER_STORAGE_PREFIX + key, JSON.stringify(filters));
  } catch {
    /* localStorage 비가용 시 무시 */
  }
};

type FilterKind = "boolean" | "select" | "range" | "search" | "none";
const filterKindFor = (def: ChoiceMetaFieldDef): FilterKind => {
  if (def.display === "image" || def.display === "filesize") return "none"; // 미리보기·파일크기는 필터 없음
  if (def.type === "boolean") return "boolean";
  if (def.filter === "select") return "select";
  if (def.type === "number") return "range";
  return "search";
};

// string/number 혼용 안전 비교
const sameValue = (a: ChoicePickerOption["value"], b: ChoicePickerOption["value"]) => String(a) === String(b);

const yearOf = (value: ChoiceMetaValue): string => {
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? String(value) : String(d.getFullYear());
};

const formatFileSize = (value: ChoiceMetaValue): string => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return String(value);
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
};

// 셀 표시·select 매칭 공통 문자열 (빈 값은 "")
const displayedString = (def: ChoiceMetaFieldDef, value: ChoiceMetaValue | undefined): string => {
  if (value === null || value === undefined || value === "") return "";
  if (def.display === "year") return yearOf(value);
  if (typeof value === "boolean") return value ? "예" : "아니오";
  return String(value);
};

const renderMetaCell = (def: ChoiceMetaFieldDef, value: ChoiceMetaValue | undefined) => {
  if (def.display === "image") {
    if (value === null || value === undefined || value === "") return "—";
    const url = String(value);
    // hover 시 확대 미리보기
    return (
      <Tooltip
        placement="right"
        slotProps={{
          tooltip: { sx: { maxWidth: "none", p: 0.5, bgcolor: "background.paper", boxShadow: 4, border: 1, borderColor: "divider" } },
        }}
        title={<Box component="img" src={url} alt="" sx={{ display: "block", maxWidth: 320, maxHeight: 320, objectFit: "contain" }} />}
      >
        <Box
          component="img"
          src={url}
          loading="lazy"
          alt=""
          sx={{ width: 40, height: 40, objectFit: "contain", display: "block", borderRadius: 0.5, cursor: "zoom-in" }}
        />
      </Tooltip>
    );
  }
  if (def.display === "filesize") {
    if (value === null || value === undefined || value === "") return "—";
    return formatFileSize(value);
  }
  return displayedString(def, value) || "—";
};

type ImplProps = {
  id?: string;
  label?: string;
  options: ChoicePickerOption[];
  metaSchema?: ChoiceMetaSchema;
  persistKey?: string;
  publicFile?: boolean;
  required?: boolean;
  disabled?: boolean;
  multiple: boolean;
  selectedValues: (string | number | null)[];
  onCommit: (values: (string | number | null)[]) => void;
};

const ChoicePickerImpl: FC<ImplProps> = ({
  id,
  label,
  options,
  metaSchema,
  persistKey,
  publicFile,
  required,
  disabled,
  multiple,
  selectedValues,
  onCommit,
}) => {
  const client = useBackendAdminClient();
  const { data: me } = useSignedInUserQuery(client);
  const meStr = me?.str_repr;

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [draft, setDraft] = useState<(string | number | null)[]>(selectedValues);
  const [titleQuery, setTitleQuery] = useState("");
  const [metaValues, setMetaValues] = useState<Record<string, string>>({});
  const [ranges, setRanges] = useState<Record<string, { min: string; max: string }>>({});
  const [ownerOnly, setOwnerOnly] = useState(false);

  const deferredTitle = useDeferredValue(titleQuery);
  const metaEntries = useMemo(() => Object.entries(metaSchema ?? {}), [metaSchema]);
  const columns = useMemo(() => metaEntries.filter(([, def]) => !def.filterOnly), [metaEntries]);

  const openDialog = () => {
    if (disabled) return;
    const saved = loadPersistedFilters(persistKey);
    setTab(0);
    setDraft(selectedValues);
    setTitleQuery("");
    setMetaValues(saved?.metaValues ?? {});
    setRanges(saved?.ranges ?? {});
    setOwnerOnly(saved?.ownerOnly ?? false);
    setOpen(true);
  };

  const commitFromTab = (value: string | number) => {
    onCommit(multiple ? [...selectedValues.filter((v) => !sameValue(v, value)), value] : [value]);
    setOpen(false);
  };

  useEffect(() => {
    if (open && persistKey) savePersistedFilters(persistKey, { metaValues, ranges, ownerOnly });
  }, [open, persistKey, metaValues, ranges, ownerOnly]);

  const selectValuesByKey = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [key, def] of metaEntries) {
      if (filterKindFor(def) !== "select") continue;
      const set = new Set<string>();
      for (const o of options) {
        const s = displayedString(def, o.meta?.[key]);
        if (s) set.add(s);
      }
      map[key] = Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
    }
    return map;
  }, [metaEntries, options]);

  const filtered = useMemo(() => {
    const tq = deferredTitle.trim().toLowerCase();
    return options.filter((opt) => {
      if (tq && !opt.label.toLowerCase().includes(tq)) return false;
      if (ownerOnly && meStr && String(opt.meta?.created_by ?? "") !== meStr) return false;
      for (const [key, def] of metaEntries) {
        const kind = filterKindFor(def);
        if (kind === "none") continue;
        const raw = opt.meta?.[key];
        if (kind === "range") {
          const { min, max } = ranges[key] ?? { min: "", max: "" };
          if (min === "" && max === "") continue;
          const num = typeof raw === "number" ? raw : Number(raw);
          if (raw === null || raw === undefined || Number.isNaN(num)) return false;
          if (min !== "" && num < Number(min)) return false;
          if (max !== "" && num > Number(max)) return false;
          continue;
        }
        const fv = metaValues[key] ?? "";
        if (fv === "") continue;
        if (kind === "search") {
          if (
            !String(raw ?? "")
              .toLowerCase()
              .includes(fv.toLowerCase())
          )
            return false;
        } else if (kind === "boolean") {
          if (String(raw ?? "") !== fv) return false;
        } else if (displayedString(def, raw) !== fv) {
          return false;
        }
      }
      return true;
    });
  }, [options, deferredTitle, metaEntries, metaValues, ranges, ownerOnly, meStr]);

  const visible = filtered.slice(0, MAX_VISIBLE_ROWS);

  const checkedSet = useMemo(() => new Set((multiple ? draft : selectedValues).map((v) => String(v))), [multiple, draft, selectedValues]);
  const isChecked = (value: ChoicePickerOption["value"]) => checkedSet.has(String(value));

  const handleRowClick = (value: ChoicePickerOption["value"]) => {
    if (!multiple) {
      onCommit([value]);
      setOpen(false);
      return;
    }
    setDraft((prev) => (prev.some((v) => sameValue(v, value)) ? prev.filter((v) => !sameValue(v, value)) : [...prev, value]));
  };

  const applyMulti = () => {
    onCommit(draft);
    setOpen(false);
  };

  const removeSelected = (value: ChoicePickerOption["value"]) => onCommit(selectedValues.filter((v) => !sameValue(v, value)));

  const selectedOptions = options.filter((o) => selectedValues.some((v) => sameValue(v, o.value)));
  const selectedSingleLabel = selectedOptions[0]?.label;

  const trigger = (
    <Box
      id={id}
      onClick={openDialog}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        px: 1.5,
        py: 1,
        minHeight: 40,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        "&:hover": { borderColor: disabled ? "divider" : "text.primary" },
      }}
    >
      {multiple ? (
        selectedOptions.length ? (
          selectedOptions.map((o) => (
            <Chip
              key={String(o.value)}
              size="small"
              label={o.label}
              onMouseDown={(e) => e.stopPropagation()}
              onDelete={disabled ? undefined : () => removeSelected(o.value)}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            선택 안 함
          </Typography>
        )
      ) : (
        <Typography variant="body2" color={selectedSingleLabel ? "text.primary" : "text.secondary"}>
          {selectedSingleLabel ?? "선택 안 함"}
        </Typography>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="body2" color="primary" sx={{ flexShrink: 0 }}>
        {multiple ? "선택/검색" : "변경"}
      </Typography>
    </Box>
  );

  const selectedFileId = selectedValues[0] != null && selectedValues[0] !== "" ? String(selectedValues[0]) : null;

  return (
    <Box>
      {label && (
        <Typography variant="caption" component="label" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
          {label}
          {required ? " *" : ""}
        </Typography>
      )}
      {publicFile && !multiple ? (
        <Stack direction="row" spacing={2} alignItems="center">
          {selectedFileId ? <ImagePreview id={selectedFileId} /> : <Box sx={previewBoxSx} />}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>{trigger}</Box>
        </Stack>
      ) : (
        trigger
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {label ?? "선택"}
          {multiple && tab === 0 && ` (${draft.length}개 선택됨)`}
        </DialogTitle>
        {publicFile ? (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
            <Tab label="선택" />
            <Tab label="새 파일 업로드" />
          </Tabs>
        ) : null}
        <DialogContent dividers sx={{ height: "80vh", display: "flex", flexDirection: "column" }}>
          {publicFile && tab === 1 ? (
            <PublicFileUploadPanel onUploaded={commitFromTab} />
          ) : (
            <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
              <TextField autoFocus size="small" fullWidth label="이름 검색" value={titleQuery} onChange={(e) => setTitleQuery(e.target.value)} />
              {meStr && metaSchema?.created_by && (
                <FormControlLabel
                  control={<Checkbox size="small" checked={ownerOnly} onChange={(e) => setOwnerOnly(e.target.checked)} />}
                  label="내가 추가한 항목만 표시"
                />
              )}
              {metaEntries.length > 0 && (
                <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                  {metaEntries.map(([key, def]) => {
                    const kind = filterKindFor(def);
                    if (kind === "none") return null;
                    if (kind === "range") {
                      const range = ranges[key] ?? { min: "", max: "" };
                      return (
                        <Stack key={key} direction="row" spacing={0.5} alignItems="center">
                          <TextField
                            size="small"
                            type="number"
                            label={`${def.label} 최소`}
                            value={range.min}
                            onChange={(e) => setRanges((p) => ({ ...p, [key]: { ...range, min: e.target.value } }))}
                            sx={{ width: 110 }}
                          />
                          <TextField
                            size="small"
                            type="number"
                            label={`${def.label} 최대`}
                            value={range.max}
                            onChange={(e) => setRanges((p) => ({ ...p, [key]: { ...range, max: e.target.value } }))}
                            sx={{ width: 110 }}
                          />
                        </Stack>
                      );
                    }
                    if (kind === "search") {
                      return (
                        <TextField
                          key={key}
                          size="small"
                          label={def.label}
                          value={metaValues[key] ?? ""}
                          onChange={(e) => setMetaValues((p) => ({ ...p, [key]: e.target.value }))}
                          sx={{ width: 180 }}
                        />
                      );
                    }
                    // boolean / select 는 드롭다운
                    const items =
                      kind === "boolean"
                        ? [
                            { v: "true", l: "예" },
                            { v: "false", l: "아니오" },
                          ]
                        : (selectValuesByKey[key] ?? []).map((v) => ({ v, l: v }));
                    return (
                      <FormControl key={key} size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>{def.label}</InputLabel>
                        <Select
                          label={def.label}
                          value={metaValues[key] ?? ""}
                          onChange={(e) => setMetaValues((p) => ({ ...p, [key]: e.target.value }))}
                        >
                          <MenuItem value="">
                            <em>전체</em>
                          </MenuItem>
                          {items.map((it) => (
                            <MenuItem key={it.v} value={it.v}>
                              {it.l}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  })}
                </Stack>
              )}

              <Typography variant="caption" color="text.secondary">
                {filtered.length}건{filtered.length > MAX_VISIBLE_ROWS && ` 중 상위 ${MAX_VISIBLE_ROWS}건 표시 — 검색으로 좁혀주세요`}
              </Typography>

              <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {multiple && <TableCell padding="checkbox" />}
                      <TableCell>이름</TableCell>
                      {columns.map(([key, def]) => (
                        <TableCell key={key}>{def.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visible.map((opt) => (
                      <TableRow
                        key={String(opt.value)}
                        hover
                        selected={isChecked(opt.value)}
                        onClick={() => handleRowClick(opt.value)}
                        sx={{ cursor: "pointer" }}
                      >
                        {multiple && (
                          <TableCell padding="checkbox">
                            <Checkbox checked={isChecked(opt.value)} tabIndex={-1} />
                          </TableCell>
                        )}
                        <TableCell>{opt.label}</TableCell>
                        {columns.map(([key, def]) => (
                          <TableCell key={key}>{renderMetaCell(def, opt.meta?.[key])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {visible.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length + (multiple ? 2 : 1)}>
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                            결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {publicFile && tab === 1 ? (
            <Button onClick={() => setOpen(false)} color="inherit">
              닫기
            </Button>
          ) : (
            <>
              <Button onClick={() => setOpen(false)} color="inherit">
                {multiple ? "취소" : "닫기"}
              </Button>
              {multiple && (
                <Button onClick={applyMulti} variant="contained">
                  적용
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ResolvedChoicePicker: FC<ChoicePickerProps & { metaSchema?: ChoiceMetaSchema; persistKey?: string; publicFile?: boolean }> = (props) => {
  const base = {
    id: props.id,
    label: props.label,
    options: props.options ?? [],
    metaSchema: props.metaSchema,
    persistKey: props.persistKey,
    publicFile: props.publicFile,
    required: props.required,
    disabled: props.disabled,
  };
  if (props.multiple) {
    const { value, onChange } = props;
    return (
      <ChoicePickerImpl
        {...base}
        multiple
        selectedValues={Array.isArray(value) ? value : []}
        onCommit={(values) => onChange(values.filter((v): v is string | number => v !== null))}
      />
    );
  }
  const { value, onChange } = props;
  return (
    <ChoicePickerImpl
      {...base}
      multiple={false}
      selectedValues={value === null || value === undefined ? [] : [value]}
      onCommit={(values) => onChange(values.length ? values[0] : null)}
    />
  );
};

const SelectablesChoicePicker: FC<ChoicePickerProps & { source: { app: string; resource: string } }> = (props) => {
  const client = useBackendAdminClient();
  const { data } = useSelectablesQuery(client, props.source.app, props.source.resource);
  const options = useMemo(() => {
    const opts: ChoicePickerOption[] = data.results.map((i: ChoiceItem) => ({ value: i.const, label: i.title || String(i.const), meta: i.meta }));
    return props.optionFilter ? opts.filter(props.optionFilter) : opts;
  }, [data.results, props.optionFilter]);
  // source 는 여기서 소비; 하위엔 조회 결과만 전달
  return (
    <ResolvedChoicePicker
      {...props}
      source={undefined}
      options={options}
      metaSchema={data.meta_schema}
      persistKey={`${props.source.app}.${props.source.resource}`}
      publicFile={isPublicFileSource(props.source)}
    />
  );
};

// source 지정 시 selectables 를 suspense 로 조회하므로 상위에 Suspense 경계 필요.
export const ChoicePicker: FC<ChoicePickerProps> = (props) =>
  props.source ? <SelectablesChoicePicker {...props} source={props.source} /> : <ResolvedChoicePicker {...props} />;

const PREVIEW_SIZE = 56;
const previewBoxSx = {
  width: PREVIEW_SIZE,
  height: PREVIEW_SIZE,
  flexShrink: 0,
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "action.hover",
  overflow: "hidden",
};

const ImagePreview: FC<{ id: string }> = ErrorBoundary.with(
  { fallback: () => <Box sx={previewBoxSx} /> },
  Suspense.with(
    {
      fallback: (
        <Box sx={previewBoxSx}>
          <CircularProgress size={20} />
        </Box>
      ),
    },
    ({ id }) => {
      const client = useBackendAdminClient();
      const { data } = usePublicFileQuery(client, id);
      if (!data) return <Box sx={previewBoxSx} />;
      if (!data.mimetype?.startsWith("image/")) {
        return (
          <Box
            component="a"
            href={data.file}
            target="_blank"
            rel="noopener"
            sx={{ ...previewBoxSx, fontSize: 11, textDecoration: "none", color: "text.secondary" }}
          >
            파일
          </Box>
        );
      }
      return (
        <Box component="a" href={data.file} target="_blank" rel="noopener" sx={previewBoxSx} title="원본 보기">
          <Box component="img" src={data.file} alt="" sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </Box>
      );
    }
  )
);

const PublicFileUploadPanel: FC<{ onUploaded: (id: string) => void }> = ({ onUploaded }) => {
  const client = useBackendAdminClient();
  const upload = useUploadPublicFileMutation(client);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (f.size === 0) {
      addSnackbar("선택한 파일의 크기가 0입니다.", "error");
      return;
    }
    if (!(f.type.startsWith("image/") || f.type === "application/json")) {
      addSnackbar("이미지 또는 JSON 파일만 업로드할 수 있습니다.", "error");
      return;
    }
    setFile(f);
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const onSubmit = () => {
    if (!file) return;
    upload.mutate(file, {
      onSuccess: (data) => {
        addSnackbar("파일 업로드 성공", "success");
        onUploaded(data.id); // 업로드된 파일을 선택하고 다이얼로그를 닫는다
      },
      onError: (e) => addErrorSnackbar(e),
    });
  };

  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/json"
        hidden
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = ""; // 같은 파일 재선택 허용
        }}
      />
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "divider",
          borderRadius: 1,
          bgcolor: dragOver ? "action.selected" : "action.hover",
          cursor: "pointer",
          transition: "background-color 0.2s, border-color 0.2s",
          "&:hover": { bgcolor: "action.selected" },
        }}
      >
        {previewUrl ? (
          <Box component="img" src={previewUrl} alt="업로드 미리보기" sx={{ width: "100%", flex: 1, minHeight: 0, objectFit: "contain", mb: 1 }} />
        ) : (
          <PermMedia sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        )}
        <Typography variant="body2" color="text.secondary">
          클릭해서 파일을 선택하거나 이 영역에 끌어다 놓으세요.
        </Typography>
        <Typography variant="caption" color="text.secondary" component="p">
          이미지 또는 JSON 파일만 업로드할 수 있습니다.
        </Typography>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            선택된 파일: <b>{file.name}</b>
          </Typography>
        )}
      </Box>
      <Button variant="contained" startIcon={<CloudUpload />} disabled={!file || upload.isPending} onClick={onSubmit}>
        업로드 후 선택
      </Button>
    </Stack>
  );
};
