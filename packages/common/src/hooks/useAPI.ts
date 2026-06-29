import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { listEvents, listSessions, listSiteMaps, listSponsors, retrievePage, retrieveSession } from "@frontend/common/apis";
import { BackendAPIClient } from "@frontend/common/apis/client";
import { context as backendContext } from "@frontend/common/contexts";
import { SessionQueryParameterSchema, SponsorQueryParameterSchema } from "@frontend/common/schemas/backendAPI";
const QUERY_KEYS = {
  SITEMAP_LIST: ["query", "sitemap", "list"],
  PAGE: ["query", "page"],
  SPONSOR_LIST: ["query", "sponsor", "list"],
  SESSION_LIST: ["query", "session", "list"],
  EVENT_LIST: ["query", "event", "list"],
};

export const useBackendContext = () => {
  const ctx = useContext(backendContext);
  if (!ctx) throw new Error("useBackendContext must be used within a CommonProvider");
  return ctx;
};

export const useBackendClient = () => {
  const { language, backendApiDomain, backendApiTimeout } = useBackendContext();
  return new BackendAPIClient(backendApiDomain, backendApiTimeout, "", "", false, language);
};

export const useFlattenSiteMapQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.SITEMAP_LIST, client.language],
    queryFn: listSiteMaps(client),
  });

export const usePageQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PAGE, id, client.language],
    queryFn: () => retrievePage(client)(id),
  });

export const useSponsorQuery = (client: BackendAPIClient, params?: SponsorQueryParameterSchema) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.SPONSOR_LIST, client.language, ...(params ? [JSON.stringify(params)] : [])],
    queryFn: listSponsors(client, params),
  });

export const useEventsQuery = (client: BackendAPIClient) =>
  useQuery({
    queryKey: [...QUERY_KEYS.EVENT_LIST, client.language],
    queryFn: listEvents(client),
  });

export const useSessionsQuery = (client: BackendAPIClient, params?: SessionQueryParameterSchema) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.SESSION_LIST, client.language, ...(params ? [JSON.stringify(params)] : [])],
    queryFn: listSessions(client, params),
  });

export const useSessionQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.SESSION_LIST, id, client.language],
    queryFn: () => retrieveSession(client)(id),
  });
