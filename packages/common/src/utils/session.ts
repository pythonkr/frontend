import { SessionSchema } from "@frontend/common/schemas/backendAPI";

export const getSessionDetailUrl = (session: SessionSchema): string => {
  const urlSafeTitle = session.title
    .replace(/ /g, "-")
    .replace(/([.])/g, "_")
    .replace(/(?![.0-9A-Za-zㄱ-ㅣ가-힣-])./g, "");
  return `/presentations/${session.id}#${urlSafeTitle}`;
};
