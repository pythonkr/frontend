import { Dispatch, SetStateAction, createContext, useContext } from "react";

import { NestedSiteMapSchema, SponsorTierSchema } from "@frontend/common/schemas/backendAPI";
type LanguageType = "ko" | "en";

export type AppContextType = {
  language: LanguageType;
  shouldShowTitleBanner: boolean;
  shouldShowSponsorBanner: boolean;

  siteMapNode?: NestedSiteMapSchema;
  sponsorTiers?: SponsorTierSchema[];
  title: string;
  currentSiteMapDepth: (NestedSiteMapSchema | undefined)[];

  setAppContext: Dispatch<SetStateAction<Omit<AppContextType, "setAppContext">>>;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
