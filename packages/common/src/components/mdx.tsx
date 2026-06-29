import { evaluate } from "@mdx-js/mdx";
import * as provider from "@mdx-js/react";
import { CircularProgress, styled, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Theme } from "@mui/material";
import { ErrorBoundary } from "@suspensive/react";
import type { MDXComponents } from "mdx/types";
import muiComponents from "mui-mdx-components";
import { FC, ReactNode, useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { isEmpty } from "remeda";

import { rtrim } from "@frontend/common/utils/string";

import { ErrorFallback } from "./error_handler";
import { StyledDivider } from "./mdx_components/styled_divider";
import { SubContentContainer } from "./mdx_components/sub_content_container";
import { MDXLink } from "./mdx_link";

const REGISTERED_KEYWORDS = [
  "import",
  "export",
  "const",
  "let",
  "function",
  "class",
  "if",
  "else",
  "for",
  "while",
  "return",
  "switch",
  "case",
  "break",
  "continue",
  ",",
  ";",
  "{",
  "}",
];

// 좁은 화면에서는 목록의 들여쓰기(기본 padding-inline-start: 40px)를 제거한다.
// padding을 0으로 두면 기본값(outside)에서 마커가 바깥으로 잘리므로 inside로 함께 둔다.
const responsiveListStyle = (theme: Theme) => ({
  [theme.breakpoints.down("sm")]: {
    paddingInlineStart: 0,
    listStylePosition: "inside" as const,
  },
});
const StyledUl = styled("ul")(({ theme }) => responsiveListStyle(theme));
const StyledOl = styled("ol")(({ theme }) => responsiveListStyle(theme));

const CustomMDXComponents: MDXComponents = {
  h1: (props) => <h1 style={{ margin: 0 }} {...props} />,
  h2: (props) => <h2 style={{ margin: 0 }} {...props} />,
  h3: (props) => <h3 style={{ margin: 0 }} {...props} />,
  h4: (props) => <h4 style={{ margin: 0 }} {...props} />,
  h5: (props) => <h5 style={{ margin: 0 }} {...props} />,
  h6: (props) => <h6 style={{ margin: 0 }} {...props} />,
  strong: (props) => <strong {...props} />,
  a: (props) => <MDXLink {...props} />,
  hr: (props) => <StyledDivider {...props} />,
  img: (props) => <img style={{ maxWidth: "100%" }} alt="" {...props} />,
  em: (props) => <em {...props} />,
  ul: (props) => <StyledUl {...props} />,
  ol: (props) => <StyledOl {...props} />,
  li: (props) => <li {...props} />,
  table: (props) => (
    <TableContainer>
      <Table {...props} />
    </TableContainer>
  ),
  thead: (props) => <TableHead {...props} />,
  tbody: (props) => <TableBody {...props} />,
  tfoot: (props) => <TableFooter {...props} />, // MDX에서는 <tfoot>을 사용하지 않지만, 호환성을 위해 추가합니다.
  tr: (props) => <TableRow {...props} />,
  th: (props) => <TableCell {...props} />,
  td: (props) => <TableCell {...props} />,
  Content: (props) => <SubContentContainer {...props} />,
};

const lineFormatterForMDX = (line: string) => {
  if (isEmpty(line.trim())) return "\n";

  const trimmedLine = rtrim(line);

  // import / export / const문을 위한 꼼수 - import문 다음 줄은 반드시 빈 줄이어야 합니다.
  // 그러나 \n\n으로 변환할 경우, 다음 단계에서 <br />로 변환되므로, import문 다음에 공백이 있는 줄을 넣어서 <br />로 변환되지 않도록 합니다.
  if (REGISTERED_KEYWORDS.some((keyword) => trimmedLine.startsWith(keyword) || trimmedLine.endsWith(keyword))) {
    return `${trimmedLine}\n \n`;
  }

  // Table인 경우, 뒤에 공백을 추가하지 않습니다.
  if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) return `${trimmedLine}\n`;

  return `${trimmedLine}  \n`;
};

type MDXRendererPropType = {
  text: string;
  resetKey?: number;
  format?: "mdx" | "md";
  baseUrl: string;
  mdxComponents?: MDXComponents;
};

export const MDXRenderer: FC<MDXRendererPropType> = ({ text, resetKey, format, baseUrl, mdxComponents }) => {
  const [state, setState] = useState<{
    component: ReactNode;
    resetKey: number;
  }>({
    component: <CircularProgress />,
    resetKey: Math.random(),
  });

  const setRenderResult = (component: ReactNode) => setState((prev) => ({ ...prev, component: component }));
  const setRandomResetKey = () => setState((prev) => ({ ...prev, resetKey: Math.random() }));

  useEffect(() => {
    (async () => {
      try {
        // 원래 MDX는 각 줄의 마지막에 공백 2개가 있어야 줄바꿈이 되고, 또 연속 줄바꿈은 무시되지만,
        // 편의성을 위해 렌더러 단에서 공백 2개를 추가하고 연속 줄바꿈을 <br />로 변환합니다.
        let processedText = text.split("\n").map(lineFormatterForMDX).join("");

        if (format === "md") processedText = processedText.replaceAll(/<br\s*\/?>/g, "\n");
        else processedText = processedText.replaceAll("\n\n", "\n<br />\n");

        const { default: RenderResult } = await evaluate(processedText, {
          ...runtime,
          ...provider,
          format: format || "md",
          baseUrl,
          remarkPlugins: [remarkGfm],
        });
        setRenderResult(
          <RenderResult
            components={muiComponents({
              overrides: { ...CustomMDXComponents, ...(mdxComponents || {}) },
            })}
          />
        );
      } catch (error) {
        setRenderResult(<ErrorFallback error={error as Error} reset={setRandomResetKey} />);
      }
    })();
  }, [text, resetKey, format, state.resetKey, baseUrl, mdxComponents]);

  return (
    <ErrorBoundary fallback={ErrorFallback} resetKeys={[text, resetKey, state.resetKey]}>
      {state.component}
    </ErrorBoundary>
  );
};
