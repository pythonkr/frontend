import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { BackendAPIClient } from "@frontend/common/apis/client";
import {
  cancelModificationAudit,
  listModificationAudits,
  listPresentations,
  listPublicFiles,
  me,
  patchPresentation,
  previewMeModAudit,
  previewModificationAudit,
  previewPresentationModAudit,
  retrieveModificationAudit,
  retrievePresentation,
  signOut,
  updateMe,
  uploadPublicFile,
} from "@frontend/common/apis/participant_portal_api";

import { useBackendContext } from "./useAPI";

const QUERY_KEYS = {
  PARTICIPANT_ME: ["query", "participant", "me"],
  PARTICIPANT_PUBLIC_FILES: ["query", "participant", "list", "public-file"],
  PARTICIPANT_LIST_PRESENTATION: ["query", "participant", "list", "presentation"],
  PARTICIPANT_RETRIEVE_PRESENTATION: ["query", "participant", "retrieve", "presentation"],
  PARTICIPANT_LIST_MODIFICATION_AUDIT: ["query", "participant", "list", "modification-audit"],
  PARTICIPANT_RETRIEVE_MODIFICATION_AUDIT: ["query", "participant", "retrieve", "modification-audit"],
};

const MUTATION_KEYS = {
  PARTICIPANT_SIGN_OUT: ["mutation", "participant", "sign-out"],
  PARTICIPANT_UPDATE_ME: ["mutation", "participant", "update-me"],
  PARTICIPANT_UPLOAD_PUBLIC_FILE: ["mutation", "participant", "public-file", "upload"],
  PARTICIPANT_UPDATE_PRESENTATION: ["mutation", "participant", "update", "presentation"],
  PARTICIPANT_CANCEL_MODIFICATION_AUDIT: ["mutation", "participant", "cancel", "modification-audit"],
};

export const useParticipantPortalClient = () => {
  const { backendApiDomain, backendApiTimeout, backendApiCSRFCookieName, backendApiSessionCookieName, language } = useBackendContext();
  return new BackendAPIClient(backendApiDomain, backendApiTimeout, backendApiCSRFCookieName, backendApiSessionCookieName, true, language);
};

export const useSignedInUserQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_ME, client.language],
    queryFn: me(client),
  });

export const usePreviewMeModAuditQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_ME, "preview", client.language],
    queryFn: previewMeModAudit(client),
  });

export const useUpdateMeMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.PARTICIPANT_UPDATE_ME],
    mutationFn: updateMe(client),
  });

export const useSignOutMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.PARTICIPANT_SIGN_OUT],
    mutationFn: signOut(client),
  });

export const usePublicFilesQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_PUBLIC_FILES, client.language],
    queryFn: listPublicFiles(client),
  });

export const useUploadPublicFileMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.PARTICIPANT_UPLOAD_PUBLIC_FILE, "upload"],
    mutationFn: uploadPublicFile(client),
  });

export const useListPresentationsQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_LIST_PRESENTATION, client.language],
    queryFn: listPresentations(client),
  });

export const useRetrievePresentationQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_RETRIEVE_PRESENTATION, id, client.language],
    queryFn: retrievePresentation(client, id),
  });

export const useUpdatePresentationMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.PARTICIPANT_UPDATE_PRESENTATION],
    mutationFn: patchPresentation(client),
  });

export const usePreviewPresentationModAuditQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_RETRIEVE_PRESENTATION, id, "preview", client.language],
    queryFn: previewPresentationModAudit(client, id),
  });

export const useModificationAuditsQuery = (client: BackendAPIClient) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_LIST_MODIFICATION_AUDIT, client.language],
    queryFn: listModificationAudits(client),
  });

export const useModificationAuditPreviewQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_LIST_MODIFICATION_AUDIT, "preview", id, client.language],
    queryFn: previewModificationAudit(client, id),
  });

export const useRetrieveModificationAuditQuery = (client: BackendAPIClient, id: string) =>
  useSuspenseQuery({
    queryKey: [...QUERY_KEYS.PARTICIPANT_RETRIEVE_MODIFICATION_AUDIT, id, client.language],
    queryFn: retrieveModificationAudit(client, id),
  });

export const useCancelModificationAuditMutation = (client: BackendAPIClient) =>
  useMutation({
    mutationKey: [...MUTATION_KEYS.PARTICIPANT_CANCEL_MODIFICATION_AUDIT],
    mutationFn: cancelModificationAudit(client),
  });
