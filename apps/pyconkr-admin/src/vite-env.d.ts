/// <reference types="vite/client" />
import { FC, SVGProps } from "react";
declare module "*.svg?react" {
  const component: FC<SVGProps<SVGSVGElement>>;
  export default component;
}

interface ViteTypeOptions {
  strictImportEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_PYCONKR_FRONTEND_DOMAIN: string;
  readonly VITE_PYCONKR_BACKEND_API_DOMAIN: string;
  readonly VITE_PYCONKR_SHOP_IMP_ACCOUNT_ID: string;
  readonly VITE_FARO_COLLECTOR_URL: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
