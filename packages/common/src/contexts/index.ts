import * as React from "react";

namespace GlobalContext {
  export type ContextOptions = {
    baseUrl: string;
    debug?: boolean;
  }

  export const context = React.createContext<ContextOptions>({
    baseUrl: "",
    debug: false,
  });
}

export default GlobalContext;
