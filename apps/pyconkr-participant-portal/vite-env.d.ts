/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ViteTypeOptions {
  strictImportEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_PYCONKR_BACKEND_API_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
