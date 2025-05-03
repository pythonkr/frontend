/// <reference types="vite/client" />

declare module "*.svg?react" {
  import React = require("react");
  const component: React.FC<React.SVGProps<SVGSVGElement>>;
  export default component;
}

interface ViteTypeOptions {
  strictImportEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_PYCONKR_SHOP_API_DOMAIN: string;
  readonly VITE_PYCONKR_SHOP_CSRF_COOKIE_NAME: string;
  readonly VITE_PYCONKR_SHOP_IMP_ACCOUNT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
