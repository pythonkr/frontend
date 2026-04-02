import { MDXComponents } from "mdx/types";
import * as React from "react";

namespace GlobalContext {
  export type EventConfig = {
    year: number;
    eventName: string;
    eventDates: string;
    venue: {
      ko: string;
      en: string;
    };
    assets: {
      logo: string;
      mobileCoverImage?: string;
      mobileCoverTitle?: string;
      hostLogoBig?: string;
      hostLogoSmall?: string;
    };
  };

  export type ContextOptions = {
    language: "ko" | "en";
    frontendDomain?: string;
    baseUrl: string;
    debug?: boolean;
    backendApiDomain: string;
    backendApiTimeout: number;
    backendApiCSRFCookieName?: string;
    mdxComponents?: MDXComponents;
    eventConfig?: EventConfig;
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
