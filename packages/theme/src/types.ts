import type { SerializedStyles } from "@emotion/react";
import type { ThemeOptions } from "@mui/material/styles";

export interface PyConKREventConfig {
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
}

export interface PyConKRThemeConfig {
  event: PyConKREventConfig;
  muiTheme: ThemeOptions;
  globalStyles: SerializedStyles;
}
