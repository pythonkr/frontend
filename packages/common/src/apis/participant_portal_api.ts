import {
  ModificationAuditCancelRequestSchema,
  ModificationAuditPreviewSchema,
  ModificationAuditSchema,
  PresentationRetrieveSchema,
  PresentationUpdateSchema,
  PublicFileSchema,
  UserSchema,
  UserUpdateSchema,
} from "@frontend/common/schemas/backendParticipantPortalAPI";

import { BackendAPIClient } from "./client";

export const me = (client: BackendAPIClient) => async () => {
  try {
    return await client.get<UserSchema>("v1/participant-portal/user/me/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
};

export const updateMe = (client: BackendAPIClient) => (data: UserUpdateSchema) =>
  client.patch<UserSchema, UserUpdateSchema>("v1/participant-portal/user/me/", data);

export const previewMeModAudit = (client: BackendAPIClient) => async () => client.get<UserSchema>("v1/participant-portal/user/me/preview/");

export const signOut = (client: BackendAPIClient) => () => client.delete<void>("v1/participant-portal/user/signout/");

export const listPublicFiles = (client: BackendAPIClient) => () => client.get<PublicFileSchema[]>("v1/participant-portal/public-file/");

export const uploadPublicFile = (client: BackendAPIClient) => (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post<PublicFileSchema, FormData>(`v1/participant-portal/public-file/upload/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const listPresentations = (client: BackendAPIClient) => () => client.get<PresentationRetrieveSchema[]>("v1/participant-portal/presentation/");

export const retrievePresentation = (client: BackendAPIClient, id: string) => () => {
  if (!id) return Promise.resolve(null);
  return client.get<PresentationRetrieveSchema>(`v1/participant-portal/presentation/${id}/`);
};

export const previewPresentationModAudit = (client: BackendAPIClient, id: string) => () => {
  if (!id) return Promise.resolve(null);
  return client.get<PresentationRetrieveSchema>(`v1/participant-portal/presentation/${id}/preview/`);
};

export const patchPresentation = (client: BackendAPIClient) => (data: PresentationUpdateSchema) =>
  client.patch<PresentationRetrieveSchema, PresentationUpdateSchema>(`v1/participant-portal/presentation/${data.id}/`, data);

export const listModificationAudits = (client: BackendAPIClient) => () =>
  client.get<ModificationAuditSchema[]>("v1/participant-portal/modification-audit/");

export const previewModificationAudit = (client: BackendAPIClient, id: string) => () => {
  try {
    return client.get<ModificationAuditPreviewSchema>(`v1/participant-portal/modification-audit/${id}/preview/`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return Promise.resolve(null);
  }
};

export const retrieveModificationAudit = (client: BackendAPIClient, id: string) => () =>
  client.get<ModificationAuditSchema[]>(`v1/participant-portal/modification-audit/${id}`);

export const cancelModificationAudit = (client: BackendAPIClient) => (data: ModificationAuditCancelRequestSchema) =>
  client.patch<ModificationAuditSchema, ModificationAuditCancelRequestSchema>(`v1/participant-portal/modification-audit/${data.id}/cancel/`, data);
