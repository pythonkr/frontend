import {
  EventSchema,
  FlattenedSiteMapSchema,
  PageSchema,
  SessionQueryParameterSchema,
  SessionSchema,
  SocialSessionStatus,
  SocialSignInRequest,
  SponsorQueryParameterSchema,
  SponsorTierSchema,
} from "@frontend/common/schemas/backendAPI";

import { BackendAPIClient, BackendAPIClientError as _BackendAPIClientError } from "./client";

export const BackendAPIClientError = _BackendAPIClientError;

export const signInWithSNS = (client: BackendAPIClient) => async (socialSignInInfo: SocialSignInRequest) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${client.baseURL}/authn/social/browser/v1/auth/provider/redirect`;

  Object.entries({
    ...socialSignInInfo,
    csrfmiddlewaretoken: client.getCSRFToken() ?? "",
    process: "login",
  }).forEach(([key, value]) => {
    const inputElement = document.createElement("input");
    inputElement.type = "hidden";
    inputElement.name = key;
    inputElement.value = value;
    form.appendChild(inputElement);
  });
  document.body.appendChild(form);
  form.submit();
  setTimeout(() => document.body.removeChild(form), 100);
};

export const retrieveSocialSession = (client: BackendAPIClient) => async (): Promise<SocialSessionStatus | null> => {
  try {
    const res = await client.get<SocialSessionStatus>("authn/social/browser/v1/auth/session");
    return res.meta.is_authenticated ? res : null;
  } catch {
    return null;
  }
};

export const listEvents = (client: BackendAPIClient) => () => client.get<EventSchema[]>("v1/event/");
export const listSiteMaps = (client: BackendAPIClient) => () => client.get<FlattenedSiteMapSchema[]>("v1/cms/sitemap/");
export const retrievePage = (client: BackendAPIClient) => (id: string) => client.get<PageSchema>(`v1/cms/page/${id}/`);
export const listSponsors = (client: BackendAPIClient, params?: SponsorQueryParameterSchema) => () =>
  client.get<SponsorTierSchema[]>("v1/event/sponsor/", { params });
export const listSessions = (client: BackendAPIClient, params?: SessionQueryParameterSchema) => () =>
  client.get<SessionSchema[]>("v1/event/presentation/", { params });
export const retrieveSession = (client: BackendAPIClient) => (id: string) => {
  if (!id) return Promise.resolve(null);
  return client.get<SessionSchema>(`v1/event/presentation/${id}/`);
};
