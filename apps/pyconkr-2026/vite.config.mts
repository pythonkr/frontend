import path from "path";

import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/",
  envDir: "../../dotenv",
  plugins: [react(), mdx(), mkcert({ hosts: ["local.dev.pycon.kr"] }), svgr()],
  resolve: {
    alias: {
      "@frontend/common": path.resolve(__dirname, "../../packages/common/src/index.ts"),
      "@frontend/shop": path.resolve(__dirname, "../../packages/shop/src/index.ts"),
      "@frontend/theme": path.resolve(__dirname, "../../packages/theme/src/index.ts"),
      "@apps/pyconkr-2026": path.resolve(__dirname, "./src"),
    },
  },
});
