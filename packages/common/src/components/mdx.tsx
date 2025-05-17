import * as React from "react";
import * as runtime from "react/jsx-runtime";
import * as R from "remeda";

import { evaluate, EvaluateOptions } from "@mdx-js/mdx";
import { Button, CircularProgress, Typography } from "@mui/material";
import { ErrorBoundary, Suspense } from "@suspensive/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import components, { MuiMdxComponentsOptions } from 'mui-mdx-components';

import { useCommonContext } from '../hooks/useCommonContext';

const MDXComponents: MuiMdxComponentsOptions = {
  overrides: {
    'h1': (props) => <h1 {...props} />,
    'h2': (props) => <h2 {...props} />,
    'h3': (props) => <h3 {...props} />,
    'h4': (props) => <h4 {...props} />,
    'h5': (props) => <h5 {...props} />,
    'h6': (props) => <h6 {...props} />,
    'strong': (props) => <strong {...props} />,
    'em': (props) => <em {...props} />,
    'ul': (props) => <ul {...props} />,
    'ol': (props) => <ol {...props} />,
    'li': (props) => <li {...props} />,
  }
}

const SimplifiedMDXErrorFallback: React.FC<{ reset: () => void }> = ({ reset }) => {
  return <>
    <Typography variant="body2" color="error">
      페이지를 그리던 중 문제가 발생했습니다, 잠시 후 다시 시도해주세요.<br />
      만약 문제가 계속 발생한다면, 파이콘 한국 준비 위원회에게 알려주세요!<br />
      <br />
      Problem occurred while drawing the page, please try again later.<br />
      If the problem persists, please let the PyCon Korea organizing committee know!
    </Typography>
    <br />
    <Button variant="outlined" onClick={reset}>다시 시도 | Retry</Button>
  </>;
}

const DetailedMDXErrorFallback: React.FC<{ error: Error, reset: () => void }> = ({ error, reset }) => {
  const errorObject = Object.getOwnPropertyNames(error).reduce((acc, key) => ({ ...acc, [key]: (error as unknown as { [key: string]: unknown })[key] }), {});
  return <>
    <Typography variant="body2" color="error">MDX 변환 오류: {error.message}</Typography>
    <details open>
      <summary>오류 상세</summary>
      <pre style={{
        whiteSpace: "pre-wrap",
        backgroundColor: "#f5f5f5",
        padding: "1em",
        borderRadius: "4px",
        userSelect: "text",
      }}>
        <code>{JSON.stringify(errorObject, null, 2)}</code>
      </pre>
    </details>
    <br />
    <Button variant="outlined" onClick={reset}>다시 시도</Button>
  </>;
};

const InnerMDXRenderer: React.FC<{ text: string, baseUrl: string }> = ({ text, baseUrl }) => {
  const options: EvaluateOptions = { ...runtime, baseUrl };

  const { data } = useSuspenseQuery({
    queryKey: ["mdx", text],
    queryFn: async () => {
      const { default: RenderResult } = await evaluate(text, options);
      return <div className="markdown-body">
        <RenderResult components={components(MDXComponents)} />
      </div>
    },
  });

  return <>{data}</>;
}

const lineFormatterForMDX = (line: string) => {
  const trimmedLine = line.trim();

  if (R.isEmpty(trimmedLine)) return "\n";

  // import문을 위한 꼼수 - import문 다음 줄은 반드시 빈 줄이어야 합니다.
  // 그러나 \n\n으로 변환할 경우, 다음 단계에서 <br />로 변환되므로, import문 다음에 공백이 있는 줄을 넣어서 <br />로 변환되지 않도록 합니다.
  if (trimmedLine.startsWith("import")) return `${trimmedLine}\n \n`;

  return `${trimmedLine}  \n`;
}

export const MDXRenderer: React.FC<{ text: string }> = ({ text }) => {
  // 원래 MDX는 각 줄의 마지막에 공백 2개가 있어야 줄바꿈이 되고, 또 연속 줄바꿈은 무시되지만,
  // 편의성을 위해 렌더러 단에서 공백 2개를 추가하고 연속 줄바꿈을 <br />로 변환합니다.
  const { baseUrl, debug } = useCommonContext();

  const ErrorHandler = debug ? DetailedMDXErrorFallback : SimplifiedMDXErrorFallback;
  const processedText = text
    .split("\n")
    .map(lineFormatterForMDX)
    .join("")
    .replaceAll("\n\n", "\n<br />\n");

  return <ErrorBoundary fallback={ErrorHandler}>
    <Suspense fallback={<CircularProgress />}>
      <InnerMDXRenderer text={processedText} baseUrl={baseUrl} />
    </Suspense>
  </ErrorBoundary>
};
