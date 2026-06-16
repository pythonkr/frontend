import type { SessionSchema } from "@frontend/common/schemas/backendAPI";

/**
 * 세션 상세 페이지(/presentations/:id) URL을 생성합니다.
 * 제목을 URL-safe 앵커로 변환해 해시로 덧붙입니다.
 */
export const getSessionUrl = (session: SessionSchema): string => {
  const urlSafeTitle = session.title
    .replace(/ /g, "-")
    .replace(/([.])/g, "_")
    .replace(/(?![.0-9A-Za-zㄱ-ㅣ가-힣-])./g, "");
  return `/presentations/${session.id}#${urlSafeTitle}`;
};
