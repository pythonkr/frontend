import { BackendAPIClient } from "./client";
import ParticipantPortalAPISchemas from "../schemas/backendParticipantPortalAPI";

namespace BackendParticipantPortalAPIs {
  export const me = (client: BackendAPIClient) => async () => {
    try {
      return await client.get<ParticipantPortalAPISchemas.UserSchema>("v1/participant-portal/user/me/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return null;
    }
  };

  export const updateMe = (client: BackendAPIClient) => (data: ParticipantPortalAPISchemas.UserUpdateSchema) =>
    client.patch<ParticipantPortalAPISchemas.UserSchema, ParticipantPortalAPISchemas.UserUpdateSchema>("v1/participant-portal/user/me/", data);

  export const previewMeModAudit = (client: BackendAPIClient) => async () =>
    client.get<ParticipantPortalAPISchemas.UserSchema>("v1/participant-portal/user/me/preview/");

  export const signIn = (client: BackendAPIClient) => (data: ParticipantPortalAPISchemas.UserSignInSchema) =>
    client.post<ParticipantPortalAPISchemas.UserSchema, ParticipantPortalAPISchemas.UserSignInSchema>("v1/participant-portal/user/signin/", data);

  export const signOut = (client: BackendAPIClient) => () => client.delete<void>("v1/participant-portal/user/signout/");

  export const changePassword = (client: BackendAPIClient) => (data: ParticipantPortalAPISchemas.UserChangePasswordSchema) =>
    client.put<void, ParticipantPortalAPISchemas.UserChangePasswordSchema>("v1/participant-portal/user/password/", data);

  export const listPublicFiles = (client: BackendAPIClient) => () =>
    client.get<ParticipantPortalAPISchemas.PublicFileSchema[]>("v1/participant-portal/public-file/");

  export const uploadPublicFile = (client: BackendAPIClient) => (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post<ParticipantPortalAPISchemas.PublicFileSchema, FormData>(`v1/participant-portal/public-file/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  export const listPresentations = (client: BackendAPIClient) => () =>
    client.get<ParticipantPortalAPISchemas.PresentationRetrieveSchema[]>("v1/participant-portal/presentation/");

  export const retrievePresentation = (client: BackendAPIClient, id: string) => () => {
    if (!id) return Promise.resolve(null);
    return client.get<ParticipantPortalAPISchemas.PresentationRetrieveSchema>(`v1/participant-portal/presentation/${id}/`);
  };

  export const previewPresentationModAudit = (client: BackendAPIClient, id: string) => () => {
    if (!id) return Promise.resolve(null);
    return client.get<ParticipantPortalAPISchemas.PresentationRetrieveSchema>(`v1/participant-portal/presentation/${id}/preview/`);
  };

  export const patchPresentation = (client: BackendAPIClient) => (data: ParticipantPortalAPISchemas.PresentationUpdateSchema) =>
    client.patch<ParticipantPortalAPISchemas.PresentationRetrieveSchema, ParticipantPortalAPISchemas.PresentationUpdateSchema>(
      `v1/participant-portal/presentation/${data.id}/`,
      data
    );

  export const listModificationAudits = (client: BackendAPIClient) => () =>
    client.get<ParticipantPortalAPISchemas.ModificationAuditSchema[]>("v1/participant-portal/modification-audit/");

  export const previewModificationAudit = (client: BackendAPIClient, id: string) => () => {
    try {
      return client.get<ParticipantPortalAPISchemas.ModificationAuditPreviewSchema>(`v1/participant-portal/modification-audit/${id}/preview/`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return Promise.resolve(null);
    }
  };

  export const retrieveModificationAudit = (client: BackendAPIClient, id: string) => () =>
    client.get<ParticipantPortalAPISchemas.ModificationAuditSchema[]>(`v1/participant-portal/modification-audit/${id}`);

  export const cancelModificationAudit = (client: BackendAPIClient) => (data: ParticipantPortalAPISchemas.ModificationAuditCancelRequestSchema) =>
    client.patch<ParticipantPortalAPISchemas.ModificationAuditSchema, ParticipantPortalAPISchemas.ModificationAuditCancelRequestSchema>(
      `v1/participant-portal/modification-audit/${data.id}/cancel/`,
      data
    );
}

export default BackendParticipantPortalAPIs;
