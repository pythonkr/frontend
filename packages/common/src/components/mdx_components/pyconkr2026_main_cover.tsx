import { FC, createElement } from "react";

import { MainCoverParallax, type ParallaxLayer } from "./main_cover_parallax";

const PyConKR2026CoverLayerUrlByName: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob<string>("../../assets/main_cover_layers/*.webp", { eager: true, query: "?url", import: "default" })).map(
    ([path, url]) => [path.split("/").pop() as string, url]
  )
);

// 뒤(배경) -> 앞(전경) 순서, depth가 클수록 더 크게 반응.
// 비픽셀 레이어는 피사계 심도 blur를 에셋에 구워(bake) 런타임 filter를 제거 → noBlur.
// 픽셀아트 레이어(isPixel)는 굽지 않고 CSS 블러 유지(베이크 시 픽셀감이 뭉개지므로).
export const PyConKR2026CoverLayers: ParallaxLayer[] = (
  [
    { name: "00_background_merged.webp", depth: 0.0, isBackground: true, noBlur: true }, // 배경 2장 병합 + 블러 베이크
    { name: "00_back_hill_skyline_pixel_imagegen.webp", depth: 0.035, isPixel: true },
    { name: "09_mid_right_skyline_wide_left_up_offset.webp", depth: 0.07, noBlur: true },
    { name: "01_tower_hill_city_filled_top_aligned.webp", depth: 0.08, noBlur: true },
    { name: "01_hill_foreground_merged.webp", depth: 0.11, isPixel: true }, // 언덕 전경 3장 병합(픽셀, CSS 블러 유지)
    { name: "05_roller_coaster_code_large_half_lower.webp", depth: 0.15, noBlur: true },
    { name: "03_ferris_wheel_aligned.webp", depth: 0.17 }, // 초점면(focal) → 원래 블러 없음
    { name: "06_castle_aligned.webp", depth: 0.2, noBlur: true },
    { name: "08_foreground_environment_with_entrance_floor.webp", depth: 0.24, noBlur: true },
    { name: "08_foreground_bottom_fade_imagegen.webp", depth: 0.24, isPixel: true },
    { name: "02_entrance_ticket_no_floor_aligned.webp", depth: 0.26, noBlur: true },
    { name: "04_program_signboard_front.webp", depth: 0.28, noBlur: true },
    { name: "07_carousel_larger_lower.webp", depth: 0.32, noBlur: true },
    { name: "00_logo_manual_mask.webp", depth: 0.18, noBlur: true },
  ] as const
).map(({ name, ...rest }) => ({ src: PyConKR2026CoverLayerUrlByName[name], ...rest }));

/**
 * 파이콘 한국 2026 메인 표지. 여러 이미지 레이어를 깊이감 있게 겹친 패럴랙스(시차) 배경을 렌더하며,
 * 2026 메인 페이지 상단 배경으로 사용한다.
 * @example <Common__Components__MDX__PyConKR2026MainCover />
 */
export const PyConKR2026MainCover: FC<object> = () => createElement(MainCoverParallax, { layers: PyConKR2026CoverLayers });
