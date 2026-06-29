import { Box } from "@mui/material";
import { CSSProperties, FC, useEffect, useRef } from "react";

export type ParallaxLayer = {
  src: string;
  depth: number; // 0 = 고정 배경, 값이 클수록 더 많이 움직임
  isBackground?: boolean; // 확대 없이 상단 페이드 마스크 적용
  isPixel?: boolean; // pixelated 렌더링
  noBlur?: boolean; // 피사계 심도 blur에서 제외(로고 등 선명하게 유지)
  style?: CSSProperties; // 이 레이어 <img>에 병합할 추가 스타일(계산된 기본 스타일을 덮어씀)
  alt?: string;
};

export type MainCoverParallaxProps = {
  layers: ParallaxLayer[];
  width?: number; // 원본 비율 계산용
  height?: number;
  maxWidth?: number;
  focalDepth?: number; // 초점면 depth: 여기서 멀어질수록 흐려짐
  backBlurPerDepth?: number; // 초점면보다 뒤(depth가 작은) 레이어의 blur(px) 계수
  frontBlurPerDepth?: number; // 초점면보다 앞(depth가 큰) 레이어의 blur(px) 계수
  parallaxX?: number; // 마우스 좌우 이동 시 최대 이동량(px), depth=1 기준
  parallaxY?: number; // 마우스 상하 이동 시 최대 이동량(px), depth=1 기준
  parallaxEase?: number; // 마우스를 따라가는 부드러움(0~1) — 클수록 즉각 반응, 작을수록 부드럽게 지연
  parallaxExponent?: number; // 이동량의 depth 곡선: 1 = 선형, >1이면 전경은 그대로·원경은 덜 움직여 깊이감 과장
  sceneStyle?: CSSProperties; // 씬 컨테이너에 병합할 추가 스타일(maskImage 등으로 기본 마스크를 덮어쓸 수 있음)
};

const DEFAULT_SCENE_MASK = "linear-gradient(to bottom, #000 0%, #000 94.5%, rgba(0, 0, 0, .55) 97.2%, transparent 100%)"; // 세로(아래) 페이드
const DEFAULT_SCENE_MASK_X = "linear-gradient(to right, transparent 0%, #000 3%, #000 97%, transparent 100%)"; // 가로(좌우) 페이드
const DEFAULT_BG_TOP_MASK = "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, .24) 3%, #000 9%, #000 100%)";

const DEFAULT_FOCAL_DEPTH = 0.17;
const DEFAULT_BACK_BLUR_PER_DEPTH = 25;
const DEFAULT_FRONT_BLUR_PER_DEPTH = 8;
const DEFAULT_PARALLAX_X = 18;
const DEFAULT_PARALLAX_Y = 12;
const DEFAULT_PARALLAX_EASE = 0.09;
const DEFAULT_PARALLAX_EXPONENT = 1.8;

// 이동량을 depth에 선형이 아니라 거듭제곱 곡선으로 매핑. 가장 앞 레이어(maxDepth) 기준 정규화로 전경의 이동 폭 감각은 유지.
const motionFactor = (depth: number, maxDepth: number, exponent: number): number =>
  maxDepth <= 0 ? 0 : maxDepth * Math.pow(depth / maxDepth, exponent);

export const MainCoverParallax: FC<MainCoverParallaxProps> = ({
  layers,
  width = 1695,
  height = 928,
  maxWidth = 1695,
  focalDepth = DEFAULT_FOCAL_DEPTH,
  backBlurPerDepth = DEFAULT_BACK_BLUR_PER_DEPTH,
  frontBlurPerDepth = DEFAULT_FRONT_BLUR_PER_DEPTH,
  parallaxX = DEFAULT_PARALLAX_X,
  parallaxY = DEFAULT_PARALLAX_Y,
  parallaxEase = DEFAULT_PARALLAX_EASE,
  parallaxExponent = DEFAULT_PARALLAX_EXPONENT,
  sceneStyle,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const maxDepth = Math.max(0, ...layers.map((layer) => layer.depth)); // 비선형 정규화 기준이 되는 가장 앞 레이어의 depth

  useEffect(() => {
    const scene = sceneRef.current;
    if (scene === null) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return; // 모션 최소화 설정 존중

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId = 0;
    let running = false;

    const render = (): void => {
      currentX += (targetX - currentX) * parallaxEase;
      currentY += (targetY - currentY) * parallaxEase;
      scene.style.setProperty("--px", currentX.toFixed(4));
      scene.style.setProperty("--py", currentY.toFixed(4));
      if (Math.abs(targetX - currentX) < 0.0001 && Math.abs(targetY - currentY) < 0.0001) {
        running = false; // 목표값에 수렴하면 멈춰 유휴 연산을 아낌
        return;
      }
      frameId = requestAnimationFrame(render);
    };
    const ensureRunning = (): void => {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(render);
    };

    const setTarget = (clientX: number, clientY: number): void => {
      const rect = scene.getBoundingClientRect();
      targetX = ((clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onPointerMove = (event: PointerEvent): void => {
      setTarget(event.clientX, event.clientY);
      ensureRunning();
    };
    const onPointerLeave = (): void => {
      targetX = 0;
      targetY = 0;
      ensureRunning();
    };

    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frameId);
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [parallaxEase]);

  return (
    <Box
      ref={sceneRef}
      aria-label="PyCon Korea main cover parallax scene"
      style={sceneStyle}
      sx={{
        position: "relative",
        display: "block",
        marginInline: "auto",
        width: `min(100%, ${maxWidth}px)`,
        aspectRatio: `${width} / ${height}`,
        overflow: "hidden",
        background: "transparent",
        isolation: "isolate",
        WebkitMaskImage: `${DEFAULT_SCENE_MASK}, ${DEFAULT_SCENE_MASK_X}`,
        maskImage: `${DEFAULT_SCENE_MASK}, ${DEFAULT_SCENE_MASK_X}`,
        WebkitMaskComposite: "source-in", // 레거시 WebKit: intersect에 해당
        maskComposite: "intersect", // 세로·가로 페이드의 교집합 → 네 변 모두 페이드

        "& img": {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
          userSelect: "none",
          transformOrigin: "center",
          willChange: "transform",
          transform: `translate3d(calc(var(--px, 0) * var(--motion) * ${parallaxX}px), calc(var(--py, 0) * var(--motion) * ${parallaxY}px), 0) scale(var(--scale, 1.018))`,
        },
      }}
    >
      {layers.map((layer, index) => {
        const style: CSSProperties & Record<`--${string}`, string | number> = {
          "--motion": motionFactor(layer.depth, maxDepth, parallaxExponent).toFixed(4),
        };
        if (layer.isBackground) {
          style["--scale"] = 1;
          style.WebkitMaskImage = DEFAULT_BG_TOP_MASK;
          style.maskImage = DEFAULT_BG_TOP_MASK;
        }
        if (layer.isPixel) {
          style.imageRendering = "pixelated";
          if (!layer.isBackground) style["--scale"] = 1.05;
        }
        if (!layer.noBlur && layer.depth !== focalDepth) {
          const distance = layer.depth - focalDepth;
          const coeff = distance < 0 ? backBlurPerDepth : frontBlurPerDepth;
          style.filter = `blur(${(Math.abs(distance) * coeff).toFixed(2)}px)`;
        }
        return <img key={index} src={layer.src} alt={layer.alt ?? ""} style={{ ...style, ...layer.style }} />;
      })}
    </Box>
  );
};
