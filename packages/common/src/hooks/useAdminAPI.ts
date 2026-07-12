import { MutationMeta, useMutation, useQuery, useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";

import {
  approveModificationAudit,
  bulkUpdateSections,
  create,
  exportOrders,
  fetchDashboardChartData,
  getTimetable,
  getTimetableVersion,
  issueGoogleOAuth2AccessToken,
  previewUserMerge,
  listAll,
  listDashboardCharts,
  listPaginated,
  listSections,
  me,
  openApiSchema,
  previewModificationAudit,
  rejectModificationAudit,
  remove,
  removePrepared,
  renderSentTo,
  renderTemplate,
  resetUserPassword,
  retrieve,
  retryHistory,
  retrySentTo,
  revertUserMerge,
  schema,
  selectables,
  signOut,
  update,
  updatePrepared,
  uploadPublicFile,
} from "@frontend/common/apis/admin_api";
import { BackendAPIClient } from "@frontend/common/apis/client";
import { ChoicesResponse, DashboardChartDefinition, PublicFileSchema } from "@frontend/common/schemas/backendAdminAPI";

import { useBackendContext } from "./useAPI";

const QUERY_KEYS = {
  ADMIN_ME: ["query", "admin", "me"],
  ADMIN_LIST: ["query", "admin", "list"],
  ADMIN_RETRIEVE: ["query", "admin", "retrieve"],
  ADMIN_SCHEMA: ["query", "admin", "schema"],
  ADMIN_SELECTABLES: ["query", "admin", "selectables"],
  ADMIN_OPENAPI_SCHEMA: ["query", "admin", "openapi-schema"],
  ADMIN_PREVIEW_MODIFICATION_AUDIT: ["query", "admin", "retrieve", "modification-audit"],
  ADMIN_RENDER_SENT_TO: ["query", "admin", "render-sent-to"],
  ADMIN_DASHBOARD_CHARTS: ["query", "admin", "dashboard", "charts"],
  ADMIN_DASHBOARD_CHART_DATA: ["query", "admin", "dashboard", "chart-data"],
};

const MUTATION_KEYS = {
  ADMIN_SIGN_OUT: ["mutation", "admin", "sign-out"],
  ADMIN_RESET_PASSWORD: ["mutation", "admin", "reset-password"],
  ADMIN_CREATE: ["mutation", "admin", "create"],
  ADMIN_UPDATE: ["mutation", "admin", "update"],
  ADMIN_REMOVE: ["mutation", "admin", "remove"],
  ADMIN_APPROVE_MODIFICATION_AUDIT: ["mutation", "admin", "approve", "modification-audit"],
  ADMIN_REJECT_MODIFICATION_AUDIT: ["mutation", "admin", "reject", "modification-audit"],
  ADMIN_RENDER_TEMPLATE: ["mutation", "admin", "render-template"],
  ADMIN_RETRY_HISTORY: ["mutation", "admin", "retry-history"],
  ADMIN_RETRY_SENT_TO: ["mutation", "admin", "retry-sent-to"],
  ADMIN_ISSUE_GOOGLE_OAUTH2_ACCESS_TOKEN: ["mutation", "admin", "google-oauth2-access-token"],
  ADMIN_EXPORT_ORDERS: ["mutation", "admin", "export-orders"],
  ADMIN_PREVIEW_USER_MERGE: ["mutation", "admin", "preview", "user-merge"],
  ADMIN_REVERT_USER_MERGE: ["mutation", "admin", "revert", "user-merge"],
};

export const useBackendAdminClient = () => {
  const { backendApiDomain, backendApiTimeout, backendApiCSRFCookieName, backendApiSessionCookieName } = useBackendContext();
  return new BackendAPIClient(backendApiDomain, backendApiTimeout, backendApiCSRFCookieName, backendApiSessionCookieName, true);
};

export const useSignedInUserQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.ADMIN_ME,
    queryFn: me(client),
  });

export const useSignOutMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_SIGN_OUT],
    mutationFn: signOut(client),
  });

export const useResetUserPasswordMutation = (client: BackendAPIClient, id: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_RESET_PASSWORD, id],
    mutationFn: resetUserPassword(client, id),
  });

export const useSchemaQuery = (client: BackendAPIClient, app: string, resource: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_SCHEMA, app, resource],
    queryFn: schema(client, app, resource),
  });

export const useSelectablesQuery = (client: BackendAPIClient, app: string, resource: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_SELECTABLES, app, resource],
    queryFn: selectables(client, app, resource),
  });

export const useSelectablesQueries = (client: BackendAPIClient, pairs: { app: string; resource: string }[]) =>
  useSuspenseQueries({
    queries: pairs.map(({ app, resource }) => ({
      queryKey: [...QUERY_KEYS.ADMIN_SELECTABLES, app, resource],
      queryFn: selectables(client, app, resource),
    })),
  });

// 리소스의 FK/M2M 필드별 선택지를 {field: ChoiceItem[]} 로 반환.
// json-schema 의 ui:options.choiceApp/choiceResource 로 각 필드의 대상 selectables 를 모아 구성한다.
export const useFieldSelectablesQuery = (client: BackendAPIClient, app: string, resource: string): ChoicesResponse => {
  const { data: schemaDef } = useSchemaQuery(client, app, resource);
  const fields = Object.entries(schemaDef.ui_schema ?? {})
    .map(([field, ui]) => {
      const opts = (ui as { "ui:options"?: { choiceApp?: string; choiceResource?: string } })["ui:options"];
      return opts?.choiceApp && opts?.choiceResource ? { field, app: opts.choiceApp, resource: opts.choiceResource } : null;
    })
    .filter((f): f is { field: string; app: string; resource: string } => f !== null);
  const queries = useSelectablesQueries(
    client,
    fields.map(({ app, resource }) => ({ app, resource }))
  );
  return fields.reduce<ChoicesResponse>((acc, f, i) => ({ ...acc, [f.field]: queries[i]?.data?.results ?? [] }), {});
};

export const useOpenApiSchemaQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.ADMIN_OPENAPI_SCHEMA,
    queryFn: openApiSchema(client),
    staleTime: Infinity,
  });

export const useListPaginatedQuery = <T>(client: BackendAPIClient, app: string, resource: string, params?: Record<string, string>) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_LIST, app, resource, "paginated", JSON.stringify(params)],
    queryFn: listPaginated<T>(client, app, resource, params),
  });

export const adminListAllQueryKey = (app: string, resource: string, params?: Record<string, string>) =>
  [...QUERY_KEYS.ADMIN_LIST, app, resource, "all", JSON.stringify(params)] as const;

export const useListAllQuery = <T>(client: BackendAPIClient, app: string, resource: string, params?: Record<string, string>) =>
  useSuspenseQuery({
    queryKey: adminListAllQueryKey(app, resource, params),
    queryFn: listAll<T>(client, app, resource, params),
  });

export const useRetrieveQuery = <T>(client: BackendAPIClient, app: string, resource: string, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_RETRIEVE, app, resource, id],
    queryFn: retrieve<T>(client, app, resource, id),
  });

export const adminTimetableQueryKey = (eventId: string) => [...QUERY_KEYS.ADMIN_LIST, "event", "timetable", eventId] as const;

export const useTimetableQuery = (client: BackendAPIClient, eventId: string) =>
  useSuspenseQuery({
    queryKey: adminTimetableQueryKey(eventId),
    queryFn: getTimetable(client, eventId),
  });

// 다른 관리자의 변경을 감지하기 위한 경량 버전 폴링 (본문 없이 count+max(updated_at) 해시만 반환).
export const useTimetableVersionQuery = (client: BackendAPIClient, eventId: string, refetchInterval: number) =>
  useQuery({
    queryKey: [...adminTimetableQueryKey(eventId), "version"],
    queryFn: getTimetableVersion(client, eventId),
    refetchInterval,
    refetchIntervalInBackground: false,
  });

export const useCreateMutation = <T>(client: BackendAPIClient, app: string, resource: string, options?: { meta?: MutationMeta }) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_CREATE, app, resource],
    mutationFn: create<T>(client, app, resource),
    ...options,
  });

export const useUpdateMutation = <T>(client: BackendAPIClient, app: string, resource: string, id: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_UPDATE, app, resource, id],
    mutationFn: update<T>(client, app, resource, id),
  });

export const useUpdatePreparedMutation = <T extends { id: string }>(
  client: BackendAPIClient,
  app: string,
  resource: string,
  options?: { meta?: MutationMeta }
) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_UPDATE, app, resource, "prepared"],
    mutationFn: updatePrepared<T>(client, app, resource),
    ...options,
  });

export const useRemoveMutation = (client: BackendAPIClient, app: string, resource: string, id: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_REMOVE, app, resource, id],
    mutationFn: remove(client, app, resource, id),
  });

export const useRemovePreparedMutation = (client: BackendAPIClient, app: string, resource: string, options?: { meta?: MutationMeta }) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_REMOVE, app, resource, "prepared"],
    mutationFn: removePrepared(client, app, resource),
    ...options,
  });

export const usePublicFileQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_RETRIEVE, "file", "publicfile", id],
    queryFn: retrieve<PublicFileSchema>(client, "file", "publicfile", id),
  });

export const useUploadPublicFileMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_CREATE, "public-file", "upload"],
    mutationFn: uploadPublicFile(client),
  });

export const useListPageSectionsQuery = (client: BackendAPIClient, pageId: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_LIST, "cms", "page", pageId, "section"],
    queryFn: listSections(client, pageId),
  });

export const useBulkUpdatePageSectionsMutation = (client: BackendAPIClient, pageId: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_UPDATE, "cms", "page", pageId, "section"],
    mutationFn: bulkUpdateSections(client, pageId),
  });

export const useModificationAuditPreviewQuery = <T>(client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.ADMIN_PREVIEW_MODIFICATION_AUDIT, id],
    queryFn: previewModificationAudit<T>(client, id),
  });

export const useApproveModificationAuditMutation = (client: BackendAPIClient, id: string) =>
  useMutation({
    mutationKey: MUTATION_KEYS.ADMIN_APPROVE_MODIFICATION_AUDIT,
    mutationFn: approveModificationAudit(client, id),
  });

export const useRejectModificationAuditMutation = (client: BackendAPIClient, id: string) =>
  useMutation({
    mutationKey: MUTATION_KEYS.ADMIN_REJECT_MODIFICATION_AUDIT,
    mutationFn: rejectModificationAudit(client, id),
  });

export const useRenderTemplateMutation = (client: BackendAPIClient, app: string, resource: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_RENDER_TEMPLATE, app, resource],
    mutationFn: renderTemplate(client, app, resource),
    meta: { invalidates: [] },
  });

export const useRetryHistoryMutation = (client: BackendAPIClient, app: string, resource: string, id: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_RETRY_HISTORY, app, resource, id],
    mutationFn: retryHistory(client, app, resource, id),
  });

export const useRetrySentToMutation = (client: BackendAPIClient, app: string, resource: string, id: string, sentToId: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_RETRY_SENT_TO, app, resource, id, sentToId],
    mutationFn: retrySentTo(client, app, resource, id, sentToId),
  });

export const useRenderSentToQuery = (client: BackendAPIClient, app: string, resource: string, id: string, sentToId: string | null) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_RENDER_SENT_TO, app, resource, id, sentToId],
    queryFn: renderSentTo(client, app, resource, id, sentToId ?? ""),
    enabled: !!sentToId,
  });

export const useIssueGoogleOAuth2AccessTokenMutation = (client: BackendAPIClient, id: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_ISSUE_GOOGLE_OAUTH2_ACCESS_TOKEN, id],
    mutationFn: issueGoogleOAuth2AccessToken(client, id),
    meta: { invalidates: [] },
  });

export const useExportOrdersMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_EXPORT_ORDERS],
    mutationFn: exportOrders(client),
    meta: { invalidates: [] },
  });

export const usePreviewUserMergeMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_PREVIEW_USER_MERGE],
    mutationFn: previewUserMerge(client),
    meta: { invalidates: [] },
  });

export const useRevertUserMergeMutation = (client: BackendAPIClient, id: string) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.ADMIN_REVERT_USER_MERGE, id],
    mutationFn: revertUserMerge(client, id),
  });

// 정의 자체는 정적이지만 응답의 옵션(티켓/이벤트)은 DB에서 동적 주입 → 기본 staleTime 으로 갱신되게 둔다.
export const useDashboardChartsQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: QUERY_KEYS.ADMIN_DASHBOARD_CHARTS,
    queryFn: listDashboardCharts(client),
  });

export const useDashboardChartDataQuery = (
  client: BackendAPIClient,
  chart: DashboardChartDefinition,
  params: Record<string, unknown>,
  enabled: boolean
) =>
  useQuery({
    queryKey: [...QUERY_KEYS.ADMIN_DASHBOARD_CHART_DATA, chart.id, JSON.stringify(params)],
    queryFn: () => fetchDashboardChartData(client, chart.endpoint)(params),
    enabled,
  });
