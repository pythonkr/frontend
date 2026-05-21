import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useMutation } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";
import { addErrorSnackbar, addSnackbar } from "@apps/pyconkr-admin/utils/snackbar";
import { useBackendAdminClient, useRetrieveQuery } from "@frontend/common/hooks/useAdminAPI";

type Category = {
  id?: string;
  group?: string;
  name: string;
  priority: number;
  created_at?: string;
  updated_at?: string;
};

type CategoryGroup = {
  id: string;
  name: string;
  priority: number;
  categories: Category[];
};

type CategoryFormValues = {
  name: string;
  priority: string;
};

type CategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  group: CategoryGroup;
  category?: Category;
};

const CategoryDialog: FC<CategoryDialogProps> = ({ open, onClose, group, category }) => {
  const client = useBackendAdminClient();

  const [values, setValues] = useState<CategoryFormValues>({
    name: category?.name ?? "",
    priority: category ? String(category.priority) : "0",
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({
        name: category?.name ?? "",
        priority: category ? String(category.priority) : String((group.categories ?? []).length * 10),
      });
    }
  }, [open, category, group.categories]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: Category = {
        ...(category ?? {}),
        group: group.id,
        name: values.name,
        priority: Number(values.priority) || 0,
      };
      const newCategories = category
        ? group.categories.map((c) => (c.id === category.id ? { ...c, ...payload } : c))
        : [...group.categories, payload];
      return client.patch(`v1/admin-api/shop/category-groups/${group.id}/`, {
        ...group,
        categories: newCategories,
      });
    },
    onSuccess: () => {
      addSnackbar(`카테고리 '${values.name}'을(를) ${category ? "수정" : "생성"}했습니다.`, "success");
      onClose();
    },
    onError: addErrorSnackbar,
  });

  const onSubmit = () => {
    if (!values.name.trim()) {
      addSnackbar("이름은 필수입니다.", "error");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{category ? `카테고리 수정: ${category.name}` : "새 카테고리 추가"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="이름"
            required
            value={values.name}
            onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
            fullWidth
            autoFocus
          />
          <TextField
            label="우선순위"
            type="number"
            value={values.priority}
            onChange={(e) => setValues((p) => ({ ...p, priority: e.target.value }))}
            fullWidth
            helperText="낮은 값이 먼저 표시됩니다."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          취소
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={mutation.isPending}>
          {category ? "수정" : "추가"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const InnerChildCategoryList: FC<{ groupId: string }> = ErrorBoundary.with(
  { fallback: () => null },
  Suspense.with({ fallback: <CircularProgress /> }, ({ groupId }) => {
    const client = useBackendAdminClient();
    const groupQuery = useRetrieveQuery<CategoryGroup>(client, "shop", "category-groups", groupId);
    const group = groupQuery.data;
    const [dialogState, setDialogState] = useState<{ open: boolean; category?: Category }>({ open: false });

    const deleteMutation = useMutation({
      mutationFn: async (categoryId: string) => {
        if (!group) return;
        const newCategories = group.categories.filter((c) => c.id !== categoryId);
        return client.patch(`v1/admin-api/shop/category-groups/${group.id}/`, { ...group, categories: newCategories });
      },
      onSuccess: () => addSnackbar("카테고리를 삭제했습니다.", "success"),
      onError: addErrorSnackbar,
    });

    if (!group) return null;

    const categories = [...(group.categories ?? [])].sort((a, b) => a.priority - b.priority);

    const handleDelete = (category: Category) => {
      if (!category.id) return;
      if (window.confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) {
        deleteMutation.mutate(category.id);
      }
    };

    return (
      <Stack spacing={2} sx={{ mt: 4 }}>
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">하위 카테고리 ({categories.length})</Typography>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setDialogState({ open: true })}>
            카테고리 추가
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "50%" }}>이름</TableCell>
              <TableCell align="right">우선순위</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell sx={{ width: 100 }}>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: "text.secondary" }}>
                  하위 카테고리가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {categories.map((category) => (
              <TableRow key={category.id ?? category.name} hover>
                <TableCell>{category.name}</TableCell>
                <TableCell align="right">{category.priority}</TableCell>
                <TableCell>{category.created_at ? new Date(category.created_at).toLocaleString() : "—"}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setDialogState({ open: true, category })} aria-label="수정">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(category)} aria-label="삭제" disabled={deleteMutation.isPending}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CategoryDialog open={dialogState.open} onClose={() => setDialogState({ open: false })} group={group} category={dialogState.category} />
      </Stack>
    );
  })
);

export const ShopCategoryGroupEditorPage: FC = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <AdminEditor
      app="shop"
      resource="category-groups"
      id={id}
      hidingFields={["categories"]}
      context={id ? undefined : ({ categories: [] } as unknown as Record<string, string>)}
    >
      {id && <InnerChildCategoryList groupId={id} />}
    </AdminEditor>
  );
};
