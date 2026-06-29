import { Pause, PlayArrow, Stop } from "@mui/icons-material";
import { Box, CircularProgress, FormControlLabel, IconButton, Stack, Switch } from "@mui/material";
import { ErrorBoundary } from "@suspensive/react";
import { CSSProperties, FC, useEffect, useState } from "react";
import Lottie, { Options } from "react-lottie";

import { isValidHttpUrl } from "@frontend/common/utils/string";

import { ErrorFallback } from "./error_handler";

type PlayState = "playing" | "paused" | "stopped";

type LottiePlayerProps = {
  /** Lottie 애니메이션 JSON 데이터 (lottie-web 의 animationData). */
  data: unknown;
  /** 재생 상태. `playing`=재생, `paused`=일시정지, `stopped`=정지. */
  playState?: PlayState;
  /** `true`면 한 번만 재생하고 반복하지 않는다. */
  disableLoop?: boolean;
  /** lottie-web 렌더러 설정 (preserveAspectRatio 등). */
  renderSettings?: Options["rendererSettings"];
  /** 플레이어 컨테이너에 적용할 CSS 스타일. */
  style?: CSSProperties;
};

type LottiePlayerStateType = {
  playState: PlayState;
};

type LottieDebugPanelStateType = LottiePlayerStateType & {
  loop: boolean;
};

const playStateToLottiePlayerState = (playState: PlayState): { isStopped: boolean; isPaused: boolean } => {
  if (playState === "playing") return { isStopped: false, isPaused: false };
  if (playState === "paused") return { isStopped: false, isPaused: true };
  return { isStopped: true, isPaused: true };
};

export const LottieDebugPanel: FC<LottiePlayerProps> = ({ data, playState = "playing", disableLoop = false, renderSettings = {}, style }) => {
  const [playerState, setPlayerState] = useState<LottieDebugPanelStateType>({
    playState,
    loop: !disableLoop,
  });
  const isPlaying = playerState.playState === "playing";

  const toggleLoop = () => setPlayerState((ps) => ({ ...ps, loop: !ps.loop }));
  const setPlayState = (playState: PlayState) => setPlayerState((ps) => ({ ...ps, playState }));

  const stop = () => setPlayState("stopped");
  const togglePause = () => setPlayState(!isPlaying ? "playing" : "paused");

  return (
    <Stack direction="column">
      <Box>
        <Lottie
          {...playStateToLottiePlayerState(playerState.playState)}
          options={{
            animationData: data,
            loop: playerState.loop,
            autoplay: true,
            rendererSettings: { preserveAspectRatio: "xMidYMid slice", ...renderSettings },
          }}
          style={style}
        />
      </Box>
      <Stack direction="row" spacing={2}>
        <IconButton onClick={togglePause} children={!isPlaying ? <PlayArrow /> : <Pause />} />
        <IconButton onClick={stop} children={<Stop />} />
        <FormControlLabel control={<Switch checked={playerState.loop} onChange={toggleLoop} />} label="반복 재생" />
      </Stack>
    </Stack>
  );
};

/**
 * Lottie 애니메이션 JSON 데이터를 받아 재생하는 플레이어.
 * 정적으로 import 한(또는 이미 메모리에 있는) 애니메이션 데이터를 직접 렌더할 때 사용한다.
 * 원격 URL 에서 불러오려면 NetworkLottie 컴포넌트를 사용한다.
 * @example <Common__Components__Lottie data={animationData} style={{ width: 240 }} />
 */
export const LottiePlayer: FC<LottiePlayerProps> = ({ data, playState = "playing", disableLoop = false, renderSettings = {}, style }) => (
  <Lottie
    {...playStateToLottiePlayerState(playState)}
    options={{
      animationData: data,
      loop: !disableLoop,
      autoplay: playState === "playing",
      rendererSettings: { preserveAspectRatio: "xMidYMid slice", ...renderSettings },
    }}
    style={style}
  />
);

type NetworkLottiePlayerProps = Omit<LottiePlayerProps, "data"> & {
  /** Lottie 애니메이션 JSON 을 받아올 HTTP(S) URL. */
  url: string;
  /** fetch 요청에 전달할 옵션 (headers, credentials 등). */
  fetchOptions?: RequestInit;
};

type NetworkLottiePlayerStateType = {
  data?: unknown | null;
};

/**
 * 원격 URL 에서 Lottie 애니메이션 JSON 을 fetch 해 재생하는 플레이어.
 * 로딩 중에는 스피너를, 실패 시에는 에러 폴백을 보여준다. 애니메이션을 네트워크로 불러올 때 사용한다.
 * @example <Common__Components__NetworkLottie url="https://example.com/animation.json" />
 */
export const NetworkLottiePlayer: FC<NetworkLottiePlayerProps> = ErrorBoundary.with({ fallback: ErrorFallback }, (props) => {
  const [playerState, setPlayerState] = useState<NetworkLottiePlayerStateType>({});

  useEffect(() => {
    (async () => {
      if (!isValidHttpUrl(props.url)) throw new Error("Invalid URL for NetworkLottiePlayer: " + props.url);

      const data = JSON.parse(await (await fetch(props.url, props.fetchOptions)).text());
      setPlayerState((ps) => ({ ...ps, data }));
    })();
  }, [props.url, props.fetchOptions]);

  return playerState.data === undefined ? <CircularProgress /> : <LottiePlayer {...props} data={playerState.data} />;
});
