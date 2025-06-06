import { MDXComponents } from "mdx/types";
import * as React from "react";

namespace GlobalContext {
  export type ContextOptions = {
    language: "ko" | "en";
    frontendDomain?: string;
    baseUrl: string;
    debug?: boolean;
    backendApiDomain: string;
    backendApiTimeout: number;
    backendApiCSRFCookieName?: string;
    mdxComponents?: MDXComponents;
  };

  export const context = React.createContext<ContextOptions>({
    language: "ko",
    frontendDomain: "",
    baseUrl: "",
    debug: false,
    backendApiDomain: "",
    backendApiTimeout: 10000,
    backendApiCSRFCookieName: "",
  });
}

export default GlobalContext;
