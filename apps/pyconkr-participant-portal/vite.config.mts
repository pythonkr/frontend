import path from "path";

import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  envDir: "../../dotenv",
  plugins: [react(), mdx(), mkcert({ hosts: ["local.dev.pycon.kr"] }), svgr()],
  resolve: {
    alias: {
      "@frontend/common": path.resolve(__dirname, "../../packages/common/src/index.ts"),
      "@frontend/shop": path.resolve(__dirname, "../../packages/shop/src/index.ts"),
      "@apps/pyconkr-participant-portal": path.resolve(__dirname, "./src"),
    },
  },
});
