import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { Suspense } from "@suspensive/react";
import { FC, useEffect, useState } from "react";

import { isChunkLoadError, reloadForChunkLoadError } from "@frontend/common/utils/chunk_load_error";

import { CenteredPage } from "./centered_page";

const ChunkLoadErrorFallback: FC = () => {
  const [reloadSkipped, setReloadSkipped] = useState(false);

  useEffect(() => {
    // 청크 로드 실패 시 페이지 새로고침. 새로고침이 일어나지 않으면 안내 fallback 표시.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reloadForChunkLoadError()) setReloadSkipped(true);
  }, []);

  if (reloadSkipped) {
    return (
      <CenteredPage>
        <Stack spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary" align="center">
            업데이트를 위해 페이지 새로고침이 필요합니다.
            <br />
            Please refresh the page to load the latest version.
          </Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            새로고침 | Reload
          </Button>
        </Stack>
      </CenteredPage>
    );
  }

  return (
    <CenteredPage>
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" align="center">
          새로운 버전으로 업데이트 중입니다...
          <br />
          Updating to the latest version...
        </Typography>
      </Stack>
    </CenteredPage>
  );
};

const DetailedErrorFallback: FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  console.error(error);
  const errorObject = Object.getOwnPropertyNames(error).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (error as unknown as { [key: string]: unknown })[key],
    }),
    {}
  );
  return (
    <>
      <Typography variant="body2" color="error">
        error.message = {error.message}
      </Typography>
      <details open>
        <summary>오류 상세</summary>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            backgroundColor: "#f5f5f5",
            padding: "1em",
            borderRadius: "4px",
            userSelect: "text",
          }}
        >
          <code>{JSON.stringify(errorObject, null, 2)}</code>
        </pre>
      </details>
      <br />
      <Button variant="outlined" onClick={reset}>
        다시 시도
      </Button>
    </>
  );
};

const SimplifiedErrorFallback: FC<{ reset: () => void }> = ({ reset }) => {
  return (
    <>
      <Typography variant="body2" color="error">
        문제가 발생했습니다, 잠시 후 다시 시도해주세요.
        <br />
        만약 문제가 계속 발생한다면, 파이콘 한국 준비 위원회에게 알려주세요!
        <br />
        <br />
        An error occurred, please try again later.
        <br />
        If the problem persists, please let the PyCon Korea organizing committee know!
      </Typography>
      <br />
      <Button variant="outlined" onClick={reset}>
        다시 시도 | Retry
      </Button>
    </>
  );
};

export const ErrorFallback: FC<{ error: Error; reset: () => void; debug?: boolean }> = ({ error, reset, debug }) => {
  if (isChunkLoadError(error)) return <ChunkLoadErrorFallback />;
  return (
    <Suspense fallback={<>로딩 중...</>}>
      {debug ? <DetailedErrorFallback error={error} reset={reset} /> : <SimplifiedErrorFallback reset={reset} />}
    </Suspense>
  );
};
