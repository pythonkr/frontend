import path from "path";

import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../dotenv"), "");
  const backendApiDomain = env.VITE_PYCONKR_BACKEND_API_DOMAIN ?? "";

  // Faro 릴리스 식별: 빌드 시각(KST, YYYY-MM-DD_HH-mm-ss) + git short SHA. 예: 2026-06-17_14-30-12+abc1234
  const sha = process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
  const t = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  const version = `${t.year}-${t.month}-${t.day}_${t.hour}-${t.minute}-${t.second}+${sha}`;

  // 백엔드 응답 쿠키의 Domain 속성(예: pycon.kr) 제거 — localhost origin에서 브라우저가 저장 가능하도록.
  const proxyOptions = { target: backendApiDomain, changeOrigin: true, cookieDomainRewrite: "" };

  return {
    base: "/",
    envDir: "../../dotenv",
    define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(version) },
    plugins: [react(), mdx(), mkcert({ hosts: ["localhost"] }), svgr()],
    resolve: {
      alias: {
        "@frontend/common": path.resolve(__dirname, "../../packages/common/src"),
        "@frontend/shop": path.resolve(__dirname, "../../packages/shop/src"),
        "@apps/pyconkr-participant-portal": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "localhost",
      proxy: {
        "/v1": proxyOptions,
        "/api": proxyOptions,
      },
    },
  };
});
