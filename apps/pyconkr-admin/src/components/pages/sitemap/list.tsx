import { Add, Delete, Edit, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  IconButtonProps,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { enqueueSnackbar, OptionsObject } from "notistack";
import { CSSProperties, FC, ReactElement, ReactNode, cloneElement, useEffect, useState } from "react";
import { GroupOptions, ReactSortable, SortableEvent, SortableOptions } from "react-sortablejs";

import { BackendAdminSignInGuard } from "@apps/pyconkr-admin/components/elements/admin_signin_guard";
import { ErrorFallback } from "@apps/pyconkr-admin/components/elements/error_fallback";
import { AdminEditor } from "@apps/pyconkr-admin/components/layouts/admin_editor";
import {
  useBackendAdminClient,
  useChoicesQuery,
  useListQuery,
  useRemovePreparedMutation,
  useUpdatePreparedMutation,
} from "@frontend/common/hooks/useAdminAPI";
import { FlattenedSiteMapSchema, NestedSiteMapSchema } from "@frontend/common/schemas/backendAdminAPI";
import { buildFlatSiteMap, buildNestedSiteMap } from "@frontend/common/utils";

type FlatSiteMap = FlattenedSiteMapSchema;
type FlatSiteMapObj = Record<string, FlatSiteMap>;
type NestedSiteMap = NestedSiteMapSchema;
type FlatNestedSiteMap = Record<string, NestedSiteMap>;

const DepthColorMap: CSSProperties["backgroundColor"][] = [
  "rgba(255, 229, 204, 1)",
  "rgba(255, 255, 204, 1)",
  "rgba(204, 255, 204, 1)",
  "rgba(204, 229, 255, 1)",
  "rgba(204, 204, 255, 1)",
  "rgba(229, 204, 255, 1)",
  "rgba(255, 204, 229, 1)",
  "rgba(255, 229, 229, 1)",
  "rgba(229, 255, 204, 1)",
  "rgba(204, 255, 229, 1)",
  "rgba(229, 204, 204, 1)",
  "rgba(255, 204, 204, 1)",
];

type StyledNodePropType = {
  hidden?: boolean;
  selected?: boolean;
  depth: number;
};

const StyledNode = styled(Stack)<StyledNodePropType>(({ hidden, selected, depth, theme }) => ({
  padding: theme.spacing(0.5),
  margin: theme.spacing(0.25, 0),
  border: selected ? "2px dashed #000" : "1px solid #ccc",
  borderRadius: theme.shape.borderRadius,
  fontSize: theme.typography.subtitle2.fontSize,
  backgroundColor: hidden ? "rgba(192, 192, 192, 0.75)" : selected ? "#bbb" : DepthColorMap[depth % DepthColorMap.length],
  zIndex: depth + 1,
}));

const RouteCode = styled("code")(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
}));

type NodePropType = {
  node: NestedSiteMap;
  index: number[];
  parentRoute: string;
  depth: number;
};

type TooltipBtnPropType = IconButtonProps & {
  tooltip: string;
  icon: ReactElement<{ fontSize: string }>;
};

const TooltipBtn: FC<TooltipBtnPropType> = ({ tooltip, icon, ...props }) => (
  <Tooltip title={tooltip} arrow children={<IconButton size="small" {...props} children={cloneElement(icon, { fontSize: "small" })} />} />
);

type InnerSiteMapStateType = {
  parentSiteMapId?: string;
  editorSiteMapId?: string;
  deleteSiteMapId?: string;
  flatSiteMap: FlatSiteMap[];
  isMutating?: boolean;
};

const ModifyDetectionFields: (keyof FlatSiteMap)[] = ["order", "parent_sitemap"];

type InnerSiteMapListProps = { domainGroupId: string; headerSlot: ReactNode };

const InnerSiteMapList: FC<InnerSiteMapListProps> = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, ({ domainGroupId, headerSlot }: InnerSiteMapListProps) => {
    const backendAdminAPIClient = useBackendAdminClient();
    const { data } = useListQuery<FlatSiteMap>(backendAdminAPIClient, "cms", "sitemap", { domain_group: domainGroupId });
    const deleteMutation = useRemovePreparedMutation(backendAdminAPIClient, "cms", "sitemap");
    const { mutateAsync: updateMutationAsync } = useUpdatePreparedMutation(backendAdminAPIClient, "cms", "sitemap");

    const addSnackbar = (c: string | ReactNode, variant: OptionsObject["variant"]) =>
      enqueueSnackbar(c, { variant, anchorOrigin: { vertical: "bottom", horizontal: "center" } });

    const originalFlatSiteMapObj = Object.values(data).reduce((acc, item) => ({ ...acc, [item.id]: item }), {} as FlatSiteMapObj);

    const [state, setState] = useState<InnerSiteMapStateType>({ flatSiteMap: data });
    const nestedSiteMap = buildNestedSiteMap<FlatSiteMap>(state.flatSiteMap)[""];
    const childrenFlatSiteMap = buildFlatSiteMap<NestedSiteMap>(nestedSiteMap);
    const childrenFlatSiteMapObj = Object.values(childrenFlatSiteMap).reduce((acc, item) => ({ ...acc, [item.id]: item }), {} as FlatNestedSiteMap);

    useEffect(() => setState((ps) => ({ ...ps, flatSiteMap: data })), [data]);

    const setEditorSiteMapId = (editorSiteMapId: string | undefined) => setState((ps) => ({ ...ps, editorSiteMapId }));
    const setDeleteSiteMapId = (deleteSiteMapId: string | undefined) => setState((ps) => ({ ...ps, deleteSiteMapId }));
    const setParentSiteMapId = (parentSiteMapId: string | undefined) => setState((ps) => ({ ...ps, parentSiteMapId, editorSiteMapId: "add" }));
    const closeEditor = () => setEditorSiteMapId(undefined);
    const deleteSiteMap = (id: string) => deleteMutation.mutate(id, { onSuccess: () => setDeleteSiteMapId(undefined) });
    const setIsMutating = (isMutating: boolean) => setState((ps) => ({ ...ps, isMutating }));

    const disabled = deleteMutation.isPending;
    const editorId = state.editorSiteMapId === "add" ? undefined : state.editorSiteMapId;
    const editorContext = {
      domain_group: domainGroupId,
      ...(state.parentSiteMapId ? { parent_sitemap: state.parentSiteMapId } : {}),
    };

    const resetFlatSiteMap = () => setState((ps) => ({ ...ps, flatSiteMap: data }));
    const applyChanges = () => {
      addSnackbar("변경 사항을 적용하는 중입니다...\n조금 시간이 걸릴 수 있어요, 잠시만 기다려주세요.", "info");
      setIsMutating(true);
      const modified = Object.values(childrenFlatSiteMapObj).filter((item) =>
        ModifyDetectionFields.some((field) => item[field] !== originalFlatSiteMapObj?.[item.id]?.[field])
      );

      if (modified.length > 0) {
        const updateMutations = modified.map((sitemap) => updateMutationAsync(sitemap));
        Promise.all(updateMutations)
          .then(() => {
            setIsMutating(false);
            addSnackbar("변경 사항이 성공적으로 적용되었습니다.", "success");
          })
          .catch((error) => {
            setIsMutating(false);
            addSnackbar(`변경 사항 적용에 실패했습니다:\n${error.message}`, "error");
          });
      }
    };

    const onAdd = (evt: SortableEvent) => {
      const dragged = childrenFlatSiteMapObj[evt.from.id];
      const target = childrenFlatSiteMapObj[evt.to.id];
      const parent = childrenFlatSiteMapObj[target.parent_sitemap || ""];

      let currTargetIdx = parent.children.findIndex((child) => child.id === target.id);
      const isForwardOfTargetId = evt.newDraggableIndex === 0;
      if (!isForwardOfTargetId) currTargetIdx += 1;

      const oldCldn = parent.children.filter((child) => child.id !== dragged.id);
      const newFlatSiteMapObj = {
        ...childrenFlatSiteMapObj,
        [dragged.id]: { ...dragged, parent_sitemap: parent.id },
        [parent.id]: { ...parent, children: [...oldCldn.slice(0, currTargetIdx), dragged, ...oldCldn.slice(currTargetIdx)] },
      };
      newFlatSiteMapObj[parent.id].children.forEach((child, order) => {
        newFlatSiteMapObj[child.id].order = order;
        child.order = order;
      });

      setState((ps) => ({ ...ps, flatSiteMap: Object.values(newFlatSiteMapObj) }));
    };

    const CommonSortableOptions: SortableOptions = {
      animation: 150,
      fallbackOnBody: true,
      swapThreshold: 0.65,
      ghostClass: "ghost",
      group: "shared",
      sort: true,
      disabled,
      onAdd,
    };

    const Node: FC<NodePropType> = ({ node, index, parentRoute, depth }) => {
      const isSelected = state.editorSiteMapId === node.id;
      const route = parentRoute || node.route_code ? `${parentRoute}/${node.route_code}` : "";
      const group: GroupOptions = { pull: depth !== 0, put: depth !== 0, name: node.id };

      return (
        <ReactSortable id={node.id} list={childrenFlatSiteMap} setList={() => {}} onAdd={onAdd} {...CommonSortableOptions} group={group}>
          <StyledNode key={node.id} hidden={node.hide} selected={isSelected} depth={depth}>
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ width: "100%" }}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ flexGrow: 1 }}>
                <RouteCode>{route || "/"}</RouteCode>
                <Box>{node.name_ko + (node.hide ? " (숨겨짐)" : "")}</Box>
              </Stack>
              <TooltipBtn disabled={disabled} icon={<Add />} onClick={() => setParentSiteMapId(node.id)} tooltip="하위에 새 사이트맵 추가" />
              <TooltipBtn disabled={disabled} icon={<Edit />} onClick={() => setEditorSiteMapId(node.id)} tooltip="사이트맵 편집" />
              <TooltipBtn disabled={disabled} icon={<Delete />} onClick={() => setDeleteSiteMapId(node.id)} tooltip="사이트맵 삭제" />
            </Stack>
            {Object.values(node.children).map((childNode, i) => (
              <Node key={childNode.id} node={childNode} index={[...index, i]} parentRoute={route} depth={depth + 1} />
            ))}
          </StyledNode>
        </ReactSortable>
      );
    };

    return (
      <>
        <Dialog open={state.deleteSiteMapId !== undefined} onClose={() => setDeleteSiteMapId(undefined)} maxWidth="xs" fullWidth>
          <DialogTitle>삭제</DialogTitle>
          <DialogContent>정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteSiteMapId(undefined)} disabled={disabled} children="취소" />
            <Button onClick={() => deleteSiteMap(state.deleteSiteMapId!)} color="error" disabled={disabled} children="삭제" />
          </DialogActions>
        </Dialog>
        <Stack direction="row" spacing={2} sx={{ width: "100%", height: "100%" }}>
          <Stack sx={{ flexGrow: 1, width: "40%", height: "100%" }} spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              {headerSlot}
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" color="error" startIcon={<Delete />} onClick={resetFlatSiteMap} children="초기화" />
                <Button variant="outlined" color="primary" startIcon={<Save />} onClick={applyChanges} children="반영" />
              </Stack>
            </Stack>
            <Node node={nestedSiteMap} index={[0]} parentRoute="" depth={0} />
          </Stack>
          <Box sx={{ flexGrow: 1, width: "60%", height: "100%" }}>
            {state.editorSiteMapId && (
              <AdminEditor
                app="cms"
                resource="sitemap"
                id={editorId}
                onClose={closeEditor}
                context={editorContext}
                hidingFields={["domain_group", "parent_sitemap", "order"]}
              />
            )}
          </Box>
        </Stack>
      </>
    );
  })
);

const DomainGroupSelector: FC = ErrorBoundary.with(
  { fallback: ErrorFallback },
  Suspense.with({ fallback: <CircularProgress /> }, () => {
    const backendAdminAPIClient = useBackendAdminClient();
    const { data: choices } = useChoicesQuery(backendAdminAPIClient, "cms", "sitemap");
    const domainGroupChoices = (choices["domain_group"] ?? []).filter((c): c is { const: string; title: string } => c.const !== null);

    const [domainGroupId, setDomainGroupId] = useState<string>(() => domainGroupChoices[0]?.const ?? "");

    if (domainGroupChoices.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          등록된 도메인 그룹이 없습니다. 먼저 도메인 그룹을 추가해주세요.
        </Typography>
      );
    }

    const selector = (
      <FormControl size="small" sx={{ minWidth: 240 }}>
        <InputLabel id="sitemap-domain-group-label">도메인 그룹</InputLabel>
        <Select labelId="sitemap-domain-group-label" label="도메인 그룹" value={domainGroupId} onChange={(e) => setDomainGroupId(e.target.value)}>
          {domainGroupChoices.map((c) => (
            <MenuItem key={c.const} value={c.const}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );

    return <InnerSiteMapList key={domainGroupId} domainGroupId={domainGroupId} headerSlot={selector} />;
  })
);

export const SiteMapList: FC = () => (
  <BackendAdminSignInGuard>
    <DomainGroupSelector />
  </BackendAdminSignInGuard>
);
