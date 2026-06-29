import {
  useBackendAdminClient,
  useCreateMutation,
  useListQuery,
  useRemoveMutation,
  useRetrieveQuery,
  useUpdateMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { FC, ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";

import { buildDefaultFormValues, ProductFormValues, toPayload } from "./form";
import { BasicInfoTab } from "./tabs/basic_info_tab";
import { OptionGroupsTab } from "./tabs/option_groups_tab";
import { PriceOptionsTab } from "./tabs/price_options_tab";
import { TimeSettingsTab } from "./tabs/time_settings_tab";
import { CategoryGroupAdminWithCategories, ProductAdmin, TagAdmin } from "./types";

const formatLeftover = (v: number | null | undefined): ReactNode =>
  v === undefined ? (
    <Typography component="span" variant="body2" color="text.disabled">
      —
    </Typography>
  ) : v === null ? (
    "무한대"
  ) : (
    v.toLocaleString()
  );

const InnerProductEditor: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const client = useBackendAdminClient();

    const isCreate = !id;
    const productQuery = useRetrieveQuery<ProductAdmin>(client, "shop", "product", id ?? "");
    const groupsQuery = useListQuery<CategoryGroupAdminWithCategories>(client, "shop", "categorygroup", {});
    const tagsQuery = useListQuery<TagAdmin>(client, "shop", "tag", {});

    const existing = isCreate ? undefined : (productQuery.data ?? undefined);
    const groups = groupsQuery.data ?? [];
    const tags = tagsQuery.data ?? [];

    const [tab, setTab] = useState(0);
    const [values, setValues] = useState<ProductFormValues>(() => buildDefaultFormValues(existing));

    useEffect(() => {
      if (existing) setValues(buildDefaultFormValues(existing));
    }, [existing]);

    const createMutation = useCreateMutation<ProductAdmin>(client, "shop", "product");
    const updateMutation = useUpdateMutation<ProductAdmin>(client, "shop", "product", id ?? "");
    const deleteMutation = useRemoveMutation(client, "shop", "product", id ?? "");

    const setField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = () => {
      if (!values.name_ko.trim()) {
        addSnackbar("한국어 이름은 필수입니다.", "error");
        return;
      }
      if (!values.category) {
        addSnackbar("카테고리는 필수입니다.", "error");
        return;
      }
      const payload = toPayload(values);
      if (existing) {
        updateMutation.mutate(payload as unknown as ProductAdmin, {
          onSuccess: () => addSnackbar("상품을 수정했습니다.", "success"),
          onError: addErrorSnackbar,
        });
      } else {
        createMutation.mutate(payload as unknown as ProductAdmin, {
          onSuccess: (data) => {
            addSnackbar("상품을 생성했습니다.", "success");
            navigate(`/shop/product/${(data as unknown as ProductAdmin).id}`);
          },
          onError: addErrorSnackbar,
        });
      }
    };

    const onDelete = () => {
      if (!existing) return;
      if (window.confirm(`'${existing.name_ko}' 상품을 삭제하시겠습니까?`)) {
        deleteMutation.mutate(undefined, {
          onSuccess: () => {
            addSnackbar("상품을 삭제했습니다.", "success");
            navigate("/shop/product");
          },
          onError: addErrorSnackbar,
        });
      }
    };

    const title = `SHOP > PRODUCTS > ${existing ? `편집: ${existing.name_ko}` : "새 객체 추가"}`;
    const disabled = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
      <Stack sx={{ flexGrow: 1, width: "100%", minHeight: "100%" }} spacing={3}>
        <Typography variant="h5">{title}</Typography>

        {existing && (
          <Stack spacing={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "30%" }}>필드</TableCell>
                  <TableCell>값</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>
                    <code>{existing.id}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>생성일</TableCell>
                  <TableCell>{new Date(existing.created_at).toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>수정일</TableCell>
                  <TableCell>{new Date(existing.updated_at).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                재고 제약
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "55%" }}>제약</TableCell>
                    <TableCell align="right">한도</TableCell>
                    <TableCell align="right">남은 재고</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>상품 자체</TableCell>
                    <TableCell align="right">{existing.stock === 0 ? "무한대" : existing.stock.toLocaleString()}</TableCell>
                    <TableCell align="right">{formatLeftover(existing.leftover_stock)}</TableCell>
                  </TableRow>
                  {existing.tag_set.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <TableRow key={`tag-${tagId}`}>
                        <TableCell>태그: {tag.name_ko || tag.name_en}</TableCell>
                        <TableCell align="right">{tag.stock === 0 ? "무한대" : tag.stock.toLocaleString()}</TableCell>
                        <TableCell align="right">{formatLeftover(tag.leftover_stock)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {existing.option_groups.flatMap((og) =>
                    og.options.map((opt) => (
                      <TableRow key={`opt-${opt.id}`}>
                        <TableCell>
                          옵션: {og.name_ko} &gt; {opt.name_ko}
                        </TableCell>
                        <TableCell align="right">{opt.stock === 0 ? "무한대" : opt.stock.toLocaleString()}</TableCell>
                        <TableCell align="right">{formatLeftover(opt.leftover_stock)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow sx={{ "& td": { fontWeight: 600, borderTop: 2, borderColor: "divider" } }}>
                    <TableCell>현재 판매 가능 재고</TableCell>
                    <TableCell align="right" colSpan={2}>
                      {existing.leftover_stock === undefined ? (
                        <Typography component="span" variant="body2" color="text.secondary">
                          백엔드 leftover_stock 노출 후 표시
                        </Typography>
                      ) : existing.leftover_stock === null ? (
                        "무한대"
                      ) : (
                        existing.leftover_stock.toLocaleString()
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Divider />
          </Stack>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="기본 정보" />
          <Tab label="시간 설정" />
          <Tab label="가격 옵션" />
          {existing && <Tab label="옵션 그룹" />}
        </Tabs>

        {tab === 0 && <BasicInfoTab values={values} setField={setField} disabled={disabled} groups={groups} tags={tags} />}
        {tab === 1 && <TimeSettingsTab values={values} setField={setField} />}
        {tab === 2 && <PriceOptionsTab values={values} setField={setField} />}
        {tab === 3 && existing && <OptionGroupsTab productId={existing.id} optionGroups={existing.option_groups ?? []} />}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {existing ? (
            <>
              <Button variant="outlined" color="info" startIcon={<Add />} onClick={() => navigate("/shop/product/create")} disabled={disabled}>
                새 객체 추가
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />} onClick={onDelete} disabled={disabled}>
                삭제
              </Button>
              <Button variant="contained" startIcon={<Edit />} onClick={onSubmit} disabled={disabled}>
                수정
              </Button>
            </>
          ) : (
            <Button variant="contained" startIcon={<Add />} onClick={onSubmit} disabled={disabled}>
              새 객체 추가
            </Button>
          )}
        </Stack>
      </Stack>
    );
  })
);

export const ShopProductEditorPage: FC = () => (
  <BackendAdminSignInGuard>
    <InnerProductEditor />
  </BackendAdminSignInGuard>
);
