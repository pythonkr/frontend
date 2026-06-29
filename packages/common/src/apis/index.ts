import {
  EventSchema,
  FlattenedSiteMapSchema,
  PageSchema,
  SessionQueryParameterSchema,
  SessionSchema,
  SponsorQueryParameterSchema,
  SponsorTierSchema,
} from "@frontend/common/schemas/backendAPI";

import { BackendAPIClient, BackendAPIClientError as _BackendAPIClientError } from "./client";

export const BackendAPIClientError = _BackendAPIClientError;
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
