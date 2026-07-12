import {
  AccountTree,
  AlternateEmail,
  Apartment,
  Article,
  AutoFixHigh,
  BarChart,
  CalendarViewWeek,
  ChatBubble,
  Email,
  Event,
  FilePresent,
  FolderSpecial,
  Forum,
  Handshake,
  LocalOffer,
  Login,
  ManageAccounts,
  MarkEmailRead,
  Merge,
  Person,
  Public,
  ReceiptLong,
  Send,
  ShoppingBag,
  Sms,
  StickyNote2,
  VpnKey,
} from "@mui/icons-material";

import { AdminEditorCreateRoutePage, AdminEditorModifyRoutePage } from "./components/layouts/admin_editor";
import { AdminList } from "./components/layouts/admin_list";
import { RouteDef } from "./components/layouts/global";
import { AccountRedirectPage } from "./components/pages/account/account";
import { SignInPage } from "./components/pages/account/sign_in";
import { DashboardPage } from "./components/pages/dashboard";
import { AdminEventEditor } from "./components/pages/event/editor";
import { AdminGoogleOAuth2Editor } from "./components/pages/external_api/google_oauth2_editor";
import { PublicFileUploadPage } from "./components/pages/file/upload";
import { AdminModificationAuditList } from "./components/pages/modification_audit/list";
import { AdminModificationAuditEditor } from "./components/pages/modification_audit/pages";
import { EMAIL_CHANNEL, KAKAO_CHANNEL, SMS_CHANNEL } from "./components/pages/notification/channels";
import { AdminEmailTemplateEditor } from "./components/pages/notification/email_template_editor";
import { AdminKakaoAlimTalkTemplateEditor } from "./components/pages/notification/kakao_alimtalk_template_editor";
import { AdminNotificationHistoryCreate } from "./components/pages/notification/send_history_create";
import { AdminNotificationHistoryEditor } from "./components/pages/notification/send_history_result";
import { AdminSMSTemplateEditor } from "./components/pages/notification/sms_template_editor";
import { AdminCMSPageEditor } from "./components/pages/page/editor";
import { AdminPresentationEditor } from "./components/pages/presentation/editor";
import { ShopCategoryGroupEditorPage } from "./components/pages/shop/category_group/editor";
import { ShopCategoryGroupListPage } from "./components/pages/shop/category_group/list";
import { ShopOrderEditorPage } from "./components/pages/shop/order/editor";
import { ShopOrderListPage } from "./components/pages/shop/order/list";
import { ShopProductEditorPage } from "./components/pages/shop/product/editor";
import { ShopProductListPage } from "./components/pages/shop/product/list";
import { ShopTagListPage } from "./components/pages/shop/tag/list";
import { SiteMapList } from "./components/pages/sitemap/list";
import { SessionTimetablePage } from "./components/pages/timetable";
import { AdminUserExtEditor } from "./components/pages/user/editor";
import { AdminUserMergePage } from "./components/pages/user/merge/create";
import { AdminUserMergeDetail } from "./components/pages/user/merge/detail";
import { AdminUserMergeList } from "./components/pages/user/merge/list";

export const RouteDefinitions: RouteDef[] = [
  {
    type: "separator",
    key: "dashboard-separator",
    title: "통계",
  },
  {
    type: "routeDefinition",
    key: "dashboard",
    icon: BarChart,
    title: "통계 대시보드",
    route: "/dashboard",
  },
  {
    type: "separator",
    key: "audit-separator",
    title: "심사",
  },
  {
    type: "routeDefinition",
    key: "modificationaudit-modificationaudit",
    icon: AutoFixHigh,
    title: "수정 심사",
    route: "/participant_portal_api/modificationaudit",
  },
  {
    type: "separator",
    key: "cms-separator",
    title: "CMS",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "cms-domain-group",
    icon: Public,
    title: "도메인 그룹",
    app: "cms",
    resource: "domaingroup",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "cms-sitemap",
    icon: AccountTree,
    title: "사이트맵",
    app: "cms",
    resource: "sitemap",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "cms-page",
    icon: Article,
    title: "페이지",
    app: "cms",
    resource: "page",
  },
  {
    type: "separator",
    key: "file-separator",
    title: "파일",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "file-publicfile",
    icon: FilePresent,
    title: "외부 노출 파일",
    app: "file",
    resource: "publicfile",
  },
  {
    type: "separator",
    key: "event-separator",
    title: "행사",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "event-event",
    icon: Event,
    title: "행사",
    app: "event",
    resource: "event",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "event-sponsor",
    icon: Handshake,
    title: "후원사",
    app: "event",
    resource: "sponsor",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "event-presentation",
    icon: StickyNote2,
    title: "발표",
    app: "event",
    resource: "presentation",
  },
  {
    type: "routeDefinition",
    key: "event-timetable",
    icon: CalendarViewWeek,
    title: "시간표",
    route: "/event/timetable",
  },
  {
    type: "separator",
    key: "shop-separator",
    title: "스토어",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "shop-category-groups",
    icon: FolderSpecial,
    title: "카테고리 그룹",
    app: "shop",
    resource: "categorygroup",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "shop-tags",
    icon: LocalOffer,
    title: "태그",
    app: "shop",
    resource: "tag",
  },
  {
    type: "routeDefinition",
    key: "shop-product",
    icon: ShoppingBag,
    title: "상품",
    route: "/shop/product",
  },
  {
    type: "routeDefinition",
    key: "shop-order",
    icon: ReceiptLong,
    title: "주문",
    route: "/shop/order",
  },
  {
    type: "separator",
    key: "notification-template-separator",
    title: "알림 템플릿",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "notification-email-template",
    icon: Email,
    title: "이메일 템플릿",
    app: "notification",
    resource: "emailnotificationtemplate",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "notification-kakao-alimtalk-template",
    icon: Forum,
    title: "카카오 알림톡 템플릿",
    app: "notification",
    resource: "nhncloudkakaoalimtalknotificationtemplate",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "notification-sms-template",
    icon: Sms,
    title: "SMS 템플릿",
    app: "notification",
    resource: "nhncloudsmsnotificationtemplate",
  },
  {
    type: "separator",
    key: "notification-history-separator",
    title: "알림 발송 이력",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "notification-email-history",
    icon: MarkEmailRead,
    title: "이메일 발송 이력",
    app: "notification",
    resource: "emailnotificationhistory",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "notification-kakao-alimtalk-history",
    icon: ChatBubble,
    title: "카카오 알림톡 발송 이력",
    app: "notification",
    resource: "nhncloudkakaoalimtalknotificationhistory",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "notification-sms-history",
    icon: Send,
    title: "SMS 발송 이력",
    app: "notification",
    resource: "nhncloudsmsnotificationhistory",
  },
  {
    type: "separator",
    key: "external-api-separator",
    title: "외부 API",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "external-api-google-oauth2",
    icon: VpnKey,
    title: "Google OAuth2",
    app: "external_api",
    resource: "googleoauth2",
  },
  {
    type: "separator",
    key: "user-separator",
    title: "사용자",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "user-userext",
    icon: ManageAccounts,
    title: "사용자",
    app: "user",
    resource: "userext",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "user-organization",
    icon: Apartment,
    title: "조직",
    app: "user",
    resource: "organization",
  },
  {
    type: "routeDefinition",
    key: "user-merge",
    icon: Merge,
    title: "계정 병합",
    route: "/user/usermergehistory",
  },
  {
    type: "separator",
    key: "allauth-separator",
    title: "소셜 계정 관리",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "allauth-social-app",
    icon: Login,
    title: "소셜 앱",
    app: "allauth",
    resource: "socialapp",
  },
  {
    type: "routeDefinition",
    key: "allauth-social-account",
    icon: Person,
    title: "소셜 계정",
    route: "/allauth/socialaccount",
  },
  {
    type: "autoAdminRouteDefinition",
    key: "allauth-email-address",
    icon: AlternateEmail,
    title: "이메일 주소",
    app: "allauth",
    resource: "emailaddress",
  },
];

const buildDefaultRoutes = (app: string, resource: string) => {
  return {
    [`/${app}/${resource}`]: <AdminList app={app} resource={resource} />,
    [`/${app}/${resource}/create`]: <AdminEditorCreateRoutePage app={app} resource={resource} />,
    [`/${app}/${resource}/:id`]: <AdminEditorModifyRoutePage app={app} resource={resource} />,
  };
};

export const RegisteredRoutes = {
  ...RouteDefinitions.filter((r) => r.type === "autoAdminRouteDefinition").reduce(
    (acc, { app, resource }) => {
      return {
        ...acc,
        ...buildDefaultRoutes(app, resource),
      };
    },
    {} as { [key: string]: React.ReactElement }
  ),
  "/cms/page/create": <AdminCMSPageEditor />,
  "/cms/page/:id": <AdminCMSPageEditor />,
  "/notification/emailnotificationtemplate/create": <AdminEmailTemplateEditor />,
  "/notification/emailnotificationtemplate/:id": <AdminEmailTemplateEditor />,
  "/notification/emailnotificationhistory/create": <AdminNotificationHistoryCreate channel={EMAIL_CHANNEL} />,
  "/notification/emailnotificationhistory/:id": <AdminNotificationHistoryEditor channel={EMAIL_CHANNEL} />,
  "/notification/nhncloudkakaoalimtalknotificationtemplate": (
    <AdminList app="notification" resource="nhncloudkakaoalimtalknotificationtemplate" hideCreateNew />
  ),
  "/notification/nhncloudkakaoalimtalknotificationtemplate/:id": <AdminKakaoAlimTalkTemplateEditor />,
  "/notification/nhncloudkakaoalimtalknotificationhistory/create": <AdminNotificationHistoryCreate channel={KAKAO_CHANNEL} />,
  "/notification/nhncloudkakaoalimtalknotificationhistory/:id": <AdminNotificationHistoryEditor channel={KAKAO_CHANNEL} />,
  "/notification/nhncloudsmsnotificationtemplate/create": <AdminSMSTemplateEditor />,
  "/notification/nhncloudsmsnotificationtemplate/:id": <AdminSMSTemplateEditor />,
  "/notification/nhncloudsmsnotificationhistory/create": <AdminNotificationHistoryCreate channel={SMS_CHANNEL} />,
  "/notification/nhncloudsmsnotificationhistory/:id": <AdminNotificationHistoryEditor channel={SMS_CHANNEL} />,
  "/external_api/googleoauth2/create": <AdminGoogleOAuth2Editor />,
  "/external_api/googleoauth2/:id": <AdminGoogleOAuth2Editor />,
  "/file/publicfile/create": <PublicFileUploadPage />,
  "/file/publicfile/:id": <AdminEditorModifyRoutePage app="file" resource="publicfile" notModifiable notDeletable />,
  "/user/userext": <AdminList app="user" resource="userext" hideCreatedAt hideUpdatedAt />,
  "/user/userext/:id": <AdminUserExtEditor />,
  "/user/usermergehistory": <AdminUserMergeList />,
  "/user/usermergehistory/create": <AdminUserMergePage />,
  "/user/usermergehistory/:id": <AdminUserMergeDetail />,
  "/allauth/socialapp": <AdminList app="allauth" resource="socialapp" hideCreatedAt hideUpdatedAt />,
  "/allauth/socialaccount": (
    <AdminList
      app="allauth"
      resource="socialaccount"
      hideCreatedAt
      hideUpdatedAt
      hideCreateNew
      filterChoicesFrom={{ user: { app: "user", resource: "userext" } }}
    />
  ),
  "/allauth/socialaccount/:id": (
    <AdminEditorModifyRoutePage app="allauth" resource="socialaccount" notModifiable fieldLinks={{ user: { app: "user", resource: "userext" } }} />
  ),
  "/allauth/emailaddress": <AdminList app="allauth" resource="emailaddress" hideCreatedAt hideUpdatedAt />,
  "/dashboard": <DashboardPage />,
  "/account": <AccountRedirectPage />,
  "/account/sign-in": <SignInPage />,
  "/cms/sitemap": <SiteMapList />,
  "/cms/sitemap/create": <SiteMapList />,
  "/cms/sitemap/:id": <SiteMapList />,
  "/event/event/create": <AdminEventEditor />,
  "/event/event/:id": <AdminEventEditor />,
  "/event/presentation/create": <AdminPresentationEditor />,
  "/event/presentation/:id": <AdminPresentationEditor />,
  "/event/timetable": <SessionTimetablePage />,
  "/participant_portal_api/modificationaudit": <AdminModificationAuditList />,
  "/participant_portal_api/modificationaudit/:id": <AdminModificationAuditEditor />,
  "/shop/categorygroup": <ShopCategoryGroupListPage />,
  "/shop/categorygroup/create": <ShopCategoryGroupEditorPage />,
  "/shop/categorygroup/:id": <ShopCategoryGroupEditorPage />,
  "/shop/tag": <ShopTagListPage />,
  "/shop/product": <ShopProductListPage />,
  "/shop/product/create": <ShopProductEditorPage />,
  "/shop/product/:id": <ShopProductEditorPage />,
  "/shop/order": <ShopOrderListPage />,
  "/shop/order/:id": <ShopOrderEditorPage />,
};

const ADMIN_DETAIL_RESOURCES: ReadonlySet<string> = new Set(
  Object.keys(RegisteredRoutes)
    .map((path) => /^\/([^/]+)\/([^/]+)\/:id$/.exec(path))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => `${match[1]}/${match[2]}`)
);

export const adminDetailPathFor = (app: string, resource: string, id: string): string | null =>
  ADMIN_DETAIL_RESOURCES.has(`${app}/${resource}`) ? `/${app}/${resource}/${id}` : null;
