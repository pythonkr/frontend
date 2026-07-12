import { MDXComponents } from "mdx/types";
import { createContext } from "react";

export type AppType = "main" | "admin" | "participant_portal";

export type ContextOptions = {
  appType: AppType;
  language: "ko" | "en";
  frontendDomain?: string;
  baseUrl: string;
  debug?: boolean;
  backendApiDomain: string;
  backendApiAbsoluteDomain?: string;
  accountsDomain: string;
  backendApiTimeout: number;
  backendApiCSRFCookieName?: string;
  backendApiSessionCookieName?: string;
  mdxComponents?: MDXComponents;
};

export const context = createContext<ContextOptions>({
  appType: "main",
  language: "ko",
  frontendDomain: "",
  baseUrl: "",
  debug: false,
  backendApiDomain: "",
  backendApiAbsoluteDomain: "",
  accountsDomain: "",
  backendApiTimeout: 10000,
  backendApiCSRFCookieName: "",
  backendApiSessionCookieName: "",
});
