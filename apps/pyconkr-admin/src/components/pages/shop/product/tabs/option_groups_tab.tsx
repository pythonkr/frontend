import { useBackendAdminClient, useCreateMutation, useUpdateMutation } from "@frontend/common/hooks/useAdminAPI";
import { Add, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";

import { OptionAdmin, OptionGroupAdmin, OptionGroupPlaceholderMode } from "@apps/pyconkr-admin/components/pages/shop/product/types";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

// 백엔드 OptionGroup.PlaceholderMode 와 동일한 라벨.
const PLACEHOLDER_MODE_OPTIONS: { value: OptionGroupPlaceholderMode; label: string }[] = [
  { value: "hidden", label: "선택해주세요 미노출" },
  { value: "optional", label: "노출, 선택해도 통과" },
  { value: "required", label: "노출, 선택 시 검증 실패" },
];
const placeholderModeLabel = (mode: OptionGroupPlaceholderMode): string => PLACEHOLDER_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode;

// 빈 값/NaN 일 때만 fallback 을 사용한다. (유효한 0 입력이 falsy 로 걸러지지 않도록)
const parseNumberOr = (value: string, fallback: number): number => {
  const trimmed = value.trim();
  if (trimmed === "") return fallback;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// ----------------- Option dialog -----------------
type OptionFormValues = {
  name_ko: string;
  name_en: string;
  additional_price: string;
  stock: string;
  max_quantity_per_user: string;
  priority: string;
};

type OptionDialogProps = {
  open: boolean;
  onClose: () => void;
  optionGroup: OptionGroupAdmin;
  option?: OptionAdmin;
};

const OptionDialog: FC<OptionDialogProps> = ({ open, onClose, optionGroup, option }) => {
  const client = useBackendAdminClient();
  const updateMutation = useUpdateMutation<OptionGroupAdmin>(client, "shop", "optiongroup", optionGroup.id);
  const [values, setValues] = useState<OptionFormValues>({
    name_ko: "",
    name_en: "",
    additional_price: "0",
    stock: "0",
    max_quantity_per_user: "0",
    priority: "0",
  });

  useEffect(() => {
    if (open) {
      setValues({
        name_ko: option?.name_ko ?? "",
        name_en: option?.name_en ?? "",
        additional_price: option ? String(option.additional_price) : "0",
        stock: option ? String(option.stock) : "0",
        max_quantity_per_user: option ? String(option.max_quantity_per_user) : "0",
        priority: option ? String(option.priority) : String(optionGroup.options.length * 10),
      });
    }
  }, [open, option, optionGroup.options.length]);

  const onSubmit = () => {
    if (!values.name_ko.trim()) {
      addSnackbar("한국어 이름은 필수입니다.", "error");
      return;
    }
    if (!values.name_en.trim()) {
      addSnackbar("영어 이름은 필수입니다.", "error");
      return;
    }
    const optionPayload = {
      name_ko: values.name_ko,
      name_en: values.name_en,
      additional_price: parseNumberOr(values.additional_price, 0),
      stock: parseNumberOr(values.stock, 0),
      max_quantity_per_user: parseNumberOr(values.max_quantity_per_user, 0),
      priority: parseNumberOr(values.priority, 0),
      group: optionGroup.id,
    };
    const newOptions = option
      ? optionGroup.options.map((o) => (o.id === option.id ? { ...o, ...optionPayload } : o))
      : [...optionGroup.options, optionPayload];
    updateMutation.mutate({ ...optionGroup, options: newOptions } as unknown as OptionGroupAdmin, {
      onSuccess: () => {
        addSnackbar(`옵션 '${values.name_ko}'을(를) ${option ? "수정" : "생성"}했습니다.`, "success");
        onClose();
      },
      onError: addErrorSnackbar,
    });
  };

  return (
    <Dialog open={open} onClose={updateMutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{option ? `옵션 수정: ${option.name_ko}` : "새 옵션 추가"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="이름 (한국어)"
              required
              value={values.name_ko}
              onChange={(e) => setValues((p) => ({ ...p, name_ko: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              label="이름 (영어)"
              required
              value={values.name_en}
              onChange={(e) => setValues((p) => ({ ...p, name_en: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="추가 금액"
              type="number"
              value={values.additional_price}
              onChange={(e) => setValues((p) => ({ ...p, additional_price: e.target.value }))}
              fullWidth
            />
            <TextField
              label="우선순위"
              type="number"
              value={values.priority}
              onChange={(e) => setValues((p) => ({ ...p, priority: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="재고 (0 = 무한대)"
              type="number"
              value={values.stock}
              onChange={(e) => setValues((p) => ({ ...p, stock: e.target.value }))}
              fullWidth
            />
            <TextField
              label="사용자당 최대 (0 = 제한 없음)"
              type="number"
              value={values.max_quantity_per_user}
              onChange={(e) => setValues((p) => ({ ...p, max_quantity_per_user: e.target.value }))}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={updateMutation.isPending}>
          취소
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={updateMutation.isPending}>
          {option ? "수정" : "추가"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ----------------- OptionGroup dialog -----------------
type OptionGroupFormValues = {
  name_ko: string;
  name_en: string;
  min_quantity_per_product: string;
  max_quantity_per_product: string;
  max_quantity_per_user: string;
  visible_starts_at: string;
  visible_ends_at: string;
  orderable_starts_at: string;
  orderable_ends_at: string;
  is_custom_response: boolean;
  custom_response_pattern: string;
  priority: string;
  response_modifiable_ends_at: string;
  placeholder_mode: OptionGroupPlaceholderMode;
};

type OptionGroupDialogProps = {
  open: boolean;
  onClose: () => void;
  productId: string;
  group?: OptionGroupAdmin;
  existingGroupCount: number;
};

const OptionGroupDialog: FC<OptionGroupDialogProps> = ({ open, onClose, productId, group, existingGroupCount }) => {
  const client = useBackendAdminClient();
  const createMutation = useCreateMutation<OptionGroupAdmin>(client, "shop", "optiongroup");
  const updateMutation = useUpdateMutation<OptionGroupAdmin>(client, "shop", "optiongroup", group?.id ?? "");

  const [values, setValues] = useState<OptionGroupFormValues>({
    name_ko: "",
    name_en: "",
    min_quantity_per_product: "0",
    max_quantity_per_product: "1",
    max_quantity_per_user: "0",
    visible_starts_at: "",
    visible_ends_at: "",
    orderable_starts_at: "",
    orderable_ends_at: "",
    is_custom_response: false,
    custom_response_pattern: "",
    priority: "0",
    response_modifiable_ends_at: "",
    placeholder_mode: "hidden",
  });

  useEffect(() => {
    if (open) {
      setValues({
        name_ko: group?.name_ko ?? "",
        name_en: group?.name_en ?? "",
        min_quantity_per_product: group ? String(group.min_quantity_per_product) : "0",
        max_quantity_per_product: group ? String(group.max_quantity_per_product) : "1",
        max_quantity_per_user: group ? String(group.max_quantity_per_user) : "0",
        visible_starts_at: group?.visible_starts_at ?? "",
        visible_ends_at: group?.visible_ends_at ?? "",
        orderable_starts_at: group?.orderable_starts_at ?? "",
        orderable_ends_at: group?.orderable_ends_at ?? "",
        is_custom_response: group?.is_custom_response ?? false,
        custom_response_pattern: group?.custom_response_pattern ?? "",
        priority: group ? String(group.priority) : String(existingGroupCount * 10),
        response_modifiable_ends_at: group?.response_modifiable_ends_at ?? "",
        placeholder_mode: group?.placeholder_mode ?? "hidden",
      });
    }
  }, [open, group, existingGroupCount]);

  const onSubmit = () => {
    if (!values.name_ko.trim()) {
      addSnackbar("한국어 이름은 필수입니다.", "error");
      return;
    }
    if (!values.name_en.trim()) {
      addSnackbar("영어 이름은 필수입니다.", "error");
      return;
    }

    const payload = {
      product: productId,
      priority: parseNumberOr(values.priority, 0),
      name_ko: values.name_ko,
      name_en: values.name_en,
      min_quantity_per_product: parseNumberOr(values.min_quantity_per_product, 0),
      max_quantity_per_product: parseNumberOr(values.max_quantity_per_product, 1),
      max_quantity_per_user: parseNumberOr(values.max_quantity_per_user, 0),
      visible_starts_at: values.visible_starts_at || null,
      visible_ends_at: values.visible_ends_at || null,
      orderable_starts_at: values.orderable_starts_at || null,
      orderable_ends_at: values.orderable_ends_at || null,
      is_custom_response: values.is_custom_response,
      custom_response_pattern: values.is_custom_response ? values.custom_response_pattern : "",
      response_modifiable_ends_at: values.response_modifiable_ends_at || null,
      // placeholder_mode 는 선택형 그룹에만 의미가 있음 — custom response 그룹은 hidden 으로 고정.
      placeholder_mode: values.is_custom_response ? "hidden" : values.placeholder_mode,
      options: group?.options ?? [],
    };

    const handlers = {
      onSuccess: () => {
        addSnackbar(`옵션 그룹 '${values.name_ko}'을(를) ${group ? "수정" : "생성"}했습니다.`, "success");
        onClose();
      },
      onError: addErrorSnackbar,
    };

    if (group) updateMutation.mutate(payload as unknown as OptionGroupAdmin, handlers);
    else createMutation.mutate(payload as unknown as OptionGroupAdmin, handlers);
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{group ? `옵션 그룹 수정: ${group.name_ko}` : "새 옵션 그룹 추가"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="이름 (한국어)"
              required
              value={values.name_ko}
              onChange={(e) => setValues((p) => ({ ...p, name_ko: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              label="이름 (영어)"
              required
              value={values.name_en}
              onChange={(e) => setValues((p) => ({ ...p, name_en: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="상품당 최소 수량"
              type="number"
              value={values.min_quantity_per_product}
              onChange={(e) => setValues((p) => ({ ...p, min_quantity_per_product: e.target.value }))}
              fullWidth
            />
            <TextField
              label="상품당 최대 수량"
              type="number"
              value={values.max_quantity_per_product}
              onChange={(e) => setValues((p) => ({ ...p, max_quantity_per_product: e.target.value }))}
              fullWidth
            />
            <TextField
              label="사용자당 최대 (0 = 제한 없음)"
              type="number"
              value={values.max_quantity_per_user}
              onChange={(e) => setValues((p) => ({ ...p, max_quantity_per_user: e.target.value }))}
              fullWidth
            />
            <TextField
              label="우선순위"
              type="number"
              value={values.priority}
              onChange={(e) => setValues((p) => ({ ...p, priority: e.target.value }))}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="노출 시작 (그룹별)"
              type="datetime-local"
              value={values.visible_starts_at?.slice(0, 16) ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, visible_starts_at: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="비워두면 상품의 노출 기간을 따름"
            />
            <TextField
              label="노출 종료 (그룹별)"
              type="datetime-local"
              value={values.visible_ends_at?.slice(0, 16) ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, visible_ends_at: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="비워두면 상품의 노출 기간을 따름"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="판매 시작 (그룹별)"
              type="datetime-local"
              value={values.orderable_starts_at?.slice(0, 16) ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, orderable_starts_at: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="비워두면 상품의 판매 기간을 따름"
            />
            <TextField
              label="판매 종료 (그룹별)"
              type="datetime-local"
              value={values.orderable_ends_at?.slice(0, 16) ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, orderable_ends_at: e.target.value }))}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="비워두면 상품의 판매 기간을 따름"
            />
          </Stack>
          <FormControlLabel
            control={
              <Checkbox checked={values.is_custom_response} onChange={(e) => setValues((p) => ({ ...p, is_custom_response: e.target.checked }))} />
            }
            label="사용자 입력 옵션 (custom response)"
          />
          {values.is_custom_response && (
            <TextField
              label="입력 검증 정규식"
              value={values.custom_response_pattern}
              onChange={(e) => setValues((p) => ({ ...p, custom_response_pattern: e.target.value }))}
              fullWidth
              helperText="예: ^.{1,20}$"
            />
          )}
          {!values.is_custom_response && (
            <FormControl fullWidth>
              <InputLabel id="placeholder-mode-label">&quot;선택해주세요&quot; 옵션</InputLabel>
              <Select
                labelId="placeholder-mode-label"
                label='"선택해주세요" 옵션'
                value={values.placeholder_mode}
                onChange={(e) => setValues((p) => ({ ...p, placeholder_mode: e.target.value as OptionGroupPlaceholderMode }))}
              >
                {PLACEHOLDER_MODE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label="응답 수정 가능 종료"
            type="datetime-local"
            value={values.response_modifiable_ends_at?.slice(0, 16) ?? ""}
            onChange={(e) => setValues((p) => ({ ...p, response_modifiable_ends_at: e.target.value }))}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="비워두면 결제 후 수정 불가"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={pending}>
          취소
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={pending}>
          {group ? "수정" : "추가"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ----------------- Tab component -----------------
type Props = {
  productId: string;
  optionGroups: OptionGroupAdmin[];
};

export const OptionGroupsTab: FC<Props> = ({ productId, optionGroups }) => {
  const client = useBackendAdminClient();
  const [groupDialog, setGroupDialog] = useState<{ open: boolean; group?: OptionGroupAdmin }>({ open: false });
  const [optionDialog, setOptionDialog] = useState<{ open: boolean; optionGroup?: OptionGroupAdmin; option?: OptionAdmin }>({ open: false });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => client.delete<void>(`v1/admin-api/shop/optiongroup/${groupId}/`),
    onSuccess: () => addSnackbar("옵션 그룹을 삭제했습니다.", "success"),
    onError: addErrorSnackbar,
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (params: { group: OptionGroupAdmin; optionId: string }) => {
      const newOptions = params.group.options.filter((o) => o.id !== params.optionId);
      return client.patch(`v1/admin-api/shop/optiongroup/${params.group.id}/`, { ...params.group, options: newOptions });
    },
    onSuccess: () => addSnackbar("옵션을 삭제했습니다.", "success"),
    onError: addErrorSnackbar,
  });

  const handleDeleteGroup = (group: OptionGroupAdmin) => {
    if (window.confirm(`'${group.name_ko}' 옵션 그룹을 삭제하시겠습니까? 하위 옵션도 함께 삭제됩니다.`)) {
      deleteGroupMutation.mutate(group.id);
    }
  };

  const handleDeleteOption = (group: OptionGroupAdmin, option: OptionAdmin) => {
    if (window.confirm(`'${option.name_ko}' 옵션을 삭제하시겠습니까?`)) {
      deleteOptionMutation.mutate({ group, optionId: option.id });
    }
  };

  const sortedGroups = [...optionGroups].sort((a, b) => a.priority - b.priority);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">옵션 그룹 ({sortedGroups.length})</Typography>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setGroupDialog({ open: true })}>
          옵션 그룹 추가
        </Button>
      </Stack>

      {sortedGroups.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          옵션 그룹이 없습니다.
        </Typography>
      )}

      {sortedGroups.map((group) => {
        const options = [...group.options].sort((a, b) => a.priority - b.priority);
        return (
          <Accordion key={group.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", pr: 2 }}>
                <Typography sx={{ fontWeight: 500 }}>{group.name_ko}</Typography>
                {group.is_custom_response && <Chip label="사용자 입력" size="small" />}
                {!group.is_custom_response && group.placeholder_mode !== "hidden" && (
                  <Chip label={`선택해주세요: ${placeholderModeLabel(group.placeholder_mode)}`} size="small" variant="outlined" />
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  최소 {group.min_quantity_per_product} / 최대 {group.max_quantity_per_product} · 옵션 {options.length}개
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {!group.is_custom_response && (
                    <Button size="small" startIcon={<Add />} onClick={() => setOptionDialog({ open: true, optionGroup: group })}>
                      옵션 추가
                    </Button>
                  )}
                  <Button size="small" startIcon={<Edit />} onClick={() => setGroupDialog({ open: true, group })}>
                    그룹 수정
                  </Button>
                  <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDeleteGroup(group)}>
                    그룹 삭제
                  </Button>
                </Stack>
                {group.is_custom_response ? (
                  <Alert severity="info" variant="outlined">
                    이 그룹은 사용자 입력형이며, 옵션이 없습니다. 검증 정규식: <code>{group.custom_response_pattern || "(없음)"}</code>
                  </Alert>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "35%" }}>이름</TableCell>
                        <TableCell align="right">추가 금액</TableCell>
                        <TableCell align="right">재고</TableCell>
                        <TableCell align="right">사용자당 최대</TableCell>
                        <TableCell align="right">우선순위</TableCell>
                        <TableCell sx={{ width: 100 }}>작업</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {options.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>
                            옵션이 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                      {options.map((option) => (
                        <TableRow key={option.id} hover>
                          <TableCell>{option.name_ko}</TableCell>
                          <TableCell align="right">₩{option.additional_price.toLocaleString()}</TableCell>
                          <TableCell align="right">{option.stock === 0 ? "무한대" : option.stock.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            {option.max_quantity_per_user === 0 ? "제한 없음" : option.max_quantity_per_user.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">{option.priority}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => setOptionDialog({ open: true, optionGroup: group, option })} aria-label="수정">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteOption(group, option)} aria-label="삭제">
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <OptionGroupDialog
        open={groupDialog.open}
        onClose={() => setGroupDialog({ open: false })}
        productId={productId}
        group={groupDialog.group}
        existingGroupCount={sortedGroups.length}
      />
      {optionDialog.optionGroup && (
        <OptionDialog
          open={optionDialog.open}
          onClose={() => setOptionDialog({ open: false })}
          optionGroup={optionDialog.optionGroup}
          option={optionDialog.option}
        />
      )}
    </Stack>
  );
};
