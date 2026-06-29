import { RJSFSchema, UiSchema } from "@rjsf/utils";

export type DetailedErrorSchema = {
  code: string;
  detail: string;
  attr: string | null;
};

export type ErrorResponseSchema = {
  type: string;
  errors: DetailedErrorSchema[];
};

export type AdminSchemaDefinition = {
  schema: RJSFSchema;
  ui_schema: UiSchema;
  translation_fields: string[];
};

export type ChoiceMetaValue = string | number | boolean | null;
export type ChoiceItem = {
  const: string | null;
  title: string;
  meta?: Record<string, ChoiceMetaValue>;
};
export type ChoicesResponse = Record<string, ChoiceItem[]>;

export type ChoiceMetaFieldDef = {
  label: string;
  type: "string" | "number" | "boolean";
  filter?: "search" | "select";
  display?: "image" | "year" | "filesize";
  filterOnly?: boolean;
};
export type ChoiceMetaSchema = Record<string, ChoiceMetaFieldDef>;

export type SelectablesResponse = { results: ChoiceItem[]; meta_schema: ChoiceMetaSchema };

export type PaginatedListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type UserSchema = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string; // ISO 8601 format
  str_repr: string;
};

export type UserSignInSchema = {
  identity: string; // username or email
  password: string;
};

export type UserChangePasswordSchema = {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
};

export type UserResetPasswordResponseSchema = {
  password: string;
};

export type PublicFileSchema = {
  id: string; // UUID
  file: string; // URL to the public file
  mimetype: string | null; // MIME type of the file
  hash: string; // Hash of the file for integrity check
  size: number; // Size of the file in bytes
};

export type PageSectionSchema = {
  id?: string;
  order: number;
  css: string | null;
  body_ko: string | null;
  body_en: string | null;
};

export type FlattenedSiteMapSchema = {
  id: string;
  domain_group: string;
  route_code: string;
  name_ko: string;
  name_en: string;
  order: number;
  parent_sitemap: string | null;
  hide: boolean;
  page: string | null;
  external_link: string | null;
};

export type NestedSiteMapSchema = {
  id: string;
  domain_group: string;
  route_code: string;
  name_ko: string;
  name_en: string;
  order: number;
  parent_sitemap: string | null;
  hide: boolean;
  children: NestedSiteMapSchema[];
  page: string | null;
  external_link: string | null;
};

export type PageSectionBulkUpdateSchema = PageSectionSchema | Omit<PageSectionSchema, "id">;

export type PresentationSchema = {
  id: string; // UUID
  type: string; // UUID of the presentation type
  categories: string[]; // Array of category UUIDs
  title_ko: string;
  title_en: string;
  summary_ko: string;
  summary_en: string;
  description_ko: string;
  description_en: string;
  slideshow_url: string | null;
  image: string | null;
};

export type ModificationAuditSchema = {
  id: string; // UUID
  status: "requested" | "approved" | "rejected" | "cancelled"; // Status of the modification request
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  created_by: string;
  updated_by: string | null; // User ID of the person who last updated the audit
  modification_data: string; // JSON string containing the modification data
  str_repr: string; // String representation of the modification audit, e.g., "Presentation Title - Status"
  comments: {
    id: string; // UUID of the comment
    content: string; // Content of the comment
    created_at: string; // ISO 8601 timestamp
    created_by: {
      id: number; // User ID of the commenter
      nickname: string; // Nickname of the commenter
      is_superuser: boolean; // Whether the commenter is a staff member
    };
    updated_at: string; // ISO 8601 timestamp
  }[];
  instance: {
    app: string;
    model: string;
    id: string; // UUID of the instance being modified, e.g., presentation ID
  };
};

export type ModificationAuditPreviewSchema<T> = {
  modification_audit: ModificationAuditSchema;
  original: T;
  modified: T;
};

export type OpenAPIParameterSchema = {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
    format?: string;
    items?: { type?: string; enum?: string[] };
    enum?: string[];
  };
};

export type OpenAPISchema = { paths: Record<string, { get?: { parameters?: OpenAPIParameterSchema[] } }> };

export type GoogleOAuth2AccessTokenResponseSchema = {
  is_valid: boolean;
  access_token: string | null;
  token_type: string | null;
  expires_in: number | null;
  scopes: string[];
  email: string | null;
  audience: string | null;
  error: string | null;
};

export type DashboardChartType = "line" | "bar" | "pie" | "metric";

export type DashboardParamType = "date" | "date_range" | "select" | "multi_select" | "text" | "number" | "boolean";

export type DashboardParamOption = {
  value: string | number | boolean; // JSONField — 보통 UUID 문자열 또는 enum 값
  label: string;
  event_id?: string | null; // 티켓 옵션: 소속 이벤트 (종속 필터용)
  date_from?: string | null; // 이벤트 옵션: 통계 기본 기간 (YYYY-MM-DD)
  date_to?: string | null;
};

export type DashboardChartParam = {
  key: string;
  label: string;
  type: DashboardParamType;
  required: boolean;
  default: unknown | null;
  options: DashboardParamOption[] | null;
};

export type DashboardChartOptions = {
  stacked?: boolean | null;
  show_legend?: boolean | null;
  x_axis_label?: string | null;
  y_axis_label?: string | null;
  value_format?: string | null;
  show_data_label?: boolean | null;
};

export type DashboardChartDefinition = {
  id: string;
  title: string;
  type: DashboardChartType;
  unit: string | null;
  options: DashboardChartOptions | null;
  endpoint: string; // ex: /v1/admin-api/dashboard/charts/{id}/data/
  method: "GET" | "POST";
  params: DashboardChartParam[];
};

export type DashboardDateRangeValue = {
  date_from: string; // YYYY-MM-DD
  date_to: string; // YYYY-MM-DD (inclusive — 백엔드가 +1d exclusive end 로 보정)
};

export type MetricChartDataResponse = {
  chart_id: string;
  value: number | string | null;
  comparison?: {
    label: string;
    value: number;
    unit?: string | null;
    direction: "up" | "down" | "flat";
  } | null;
};

export type SeriesChartSeries = {
  key: string;
  name: string;
  color?: string | null;
};

export type SeriesChartDataPoint = {
  label: string;
  values?: Record<string, number | string | null> | null;
  value?: number | string | null; // pie 조각용
  color?: string | null;
};

export type SeriesChartDataResponse = {
  chart_id: string;
  series: SeriesChartSeries[];
  data: SeriesChartDataPoint[];
};

export type DashboardChartDataResponse = MetricChartDataResponse | SeriesChartDataResponse;

export const isMetricChartData = (data: DashboardChartDataResponse): data is MetricChartDataResponse => "value" in data && !("series" in data);
