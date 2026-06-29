import { FC, useEffect, useRef, useState } from "react";

import { MDXSection, MDXSections } from "./mdx_sections";

const PREVIEW_MESSAGE_TYPE = "pyconkr:mdx-preview";

type PreviewPayload = {
  css?: string | null;
  title?: string;
  show_top_title_banner?: boolean;
  show_bottom_sponsor_banner?: boolean;
  sections: MDXSection[];
};

const isPreviewPayload = (data: unknown): data is { type: string; payload: PreviewPayload } => {
  const msg = data as { type?: unknown; payload?: { sections?: unknown } };
  return msg?.type === PREVIEW_MESSAGE_TYPE && Array.isArray(msg?.payload?.sections);
};

// 미리보기 페이로드에서 추출한, 호스트 앱이 자신의 레이아웃 상태(제목/배너)에 반영할 메타데이터.
export type MDXPreviewMeta = {
  title?: string;
  showTitleBanner: boolean;
  showSponsorBanner: boolean;
};

// 백엔드 헤드리스 브라우저가 postMessage로 주입한 MDX를 실제 페이지와 동일한 레이아웃으로 렌더링한다.
// 앱별 레이아웃 상태 연동(useAppContext)은 onMeta 콜백으로 호스트 앱에 위임한다.
export const MDXPreview: FC<{ onMeta?: (meta: MDXPreviewMeta) => void }> = ({ onMeta }) => {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);

  // onMeta가 인라인으로 매 렌더 새로 생성돼도 아래 payload 이펙트가 재실행되지 않도록 최신값을 ref로 들고 있는다.
  const onMetaRef = useRef(onMeta);
  useEffect(() => {
    onMetaRef.current = onMeta;
  }, [onMeta]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // 같은 오리진(헤드리스 브라우저가 주입한 스크립트)에서 온 메시지만 수용해 외부 임의 주입을 차단한다.
      if (event.origin !== window.location.origin || !isPreviewPayload(event.data)) return;
      setPayload(event.data.payload);
    };
    window.addEventListener("message", onMessage);
    document.documentElement.setAttribute("data-mdx-preview", "ready");
    return () => {
      window.removeEventListener("message", onMessage);
      document.documentElement.removeAttribute("data-mdx-preview");
    };
  }, []);

  useEffect(() => {
    if (!payload) return;
    onMetaRef.current?.({
      title: payload.title,
      showTitleBanner: !!payload.show_top_title_banner,
      showSponsorBanner: !!payload.show_bottom_sponsor_banner,
    });
  }, [payload]);

  if (!payload) return null;

  return <MDXSections data-mdx-preview-content css={payload.css} sections={payload.sections} />;
};
