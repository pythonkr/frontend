import { Stack, StackProps } from "@mui/material";
import { FC } from "react";

import { useCommonContext } from "@frontend/common/hooks/useCommonContext";
import { parseCss } from "@frontend/common/utils";

import { MDXRenderer } from "./mdx";
import { initialPageStyle, initialSectionStyle } from "./page_layout";

export type MDXSection = { id?: string; css?: string | null; body: string };

// CMS 페이지 본문: 페이지 래퍼 + 섹션별 MDX 렌더링. 실제 페이지(dynamic_route)와 미리보기(MDXPreview)가 공유한다.
export const MDXSections: FC<{ css?: string | null; sections: MDXSection[] } & StackProps> = ({ css, sections, ...stackProps }) => {
  const { baseUrl, mdxComponents } = useCommonContext();
  return (
    <Stack sx={initialPageStyle(parseCss(css ?? ""))} {...stackProps}>
      {sections.map((s, i) => (
        <Stack sx={initialSectionStyle(parseCss(s.css ?? ""))} key={s.id ?? i}>
          <MDXRenderer text={s.body} format="mdx" baseUrl={baseUrl} mdxComponents={mdxComponents} />
        </Stack>
      ))}
    </Stack>
  );
};
