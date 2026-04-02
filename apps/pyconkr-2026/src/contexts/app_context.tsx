import * as React from "react";

import BackendAPISchemas from "../../../../packages/common/src/schemas/backendAPI";

type LanguageType = "ko" | "en";

export type AppContextType = {
  language: LanguageType;
  shouldShowTitleBanner: boolean;
  shouldShowSponsorBanner: boolean;

  siteMapNode?: BackendAPISchemas.NestedSiteMapSchema;
  sponsorTiers?: BackendAPISchemas.SponsorTierSchema[];
  title: string;
  currentSiteMapDepth: (BackendAPISchemas.NestedSiteMapSchema | undefined)[];

  setAppContext: React.Dispatch<React.SetStateAction<Omit<AppContextType, "setAppContext">>>;
};

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
