import { Theme } from "@mui/material";
import { CSSProperties } from "react";
import { isEmpty } from "remeda";

// CMS 페이지/섹션 렌더링의 공통 레이아웃 스타일. dynamic_route(실제 페이지)와 mdx_preview(미리보기)가 공유한다.
export const initialPageStyle: (additionalStyle: CSSProperties) => (theme: Theme) => CSSProperties = (additionalStyle) => (theme) => ({
  width: "100%",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  flexDirection: "column",

  marginTop: theme.spacing(4),

  ...(!isEmpty(additionalStyle)
    ? additionalStyle
    : {
        [theme.breakpoints.down("lg")]: {
          marginTop: theme.spacing(2),
        },
        [theme.breakpoints.down("sm")]: {
          marginTop: theme.spacing(1),
        },
      }),
});

export const initialSectionStyle: (additionalStyle: CSSProperties) => (theme: Theme) => CSSProperties = (additionalStyle) => (theme) => ({
  width: "100%",
  maxWidth: "1200px",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingRight: theme.spacing(16),
  paddingLeft: theme.spacing(16),

  "& .markdown-body": { width: "100%" },
  ...(!isEmpty(additionalStyle)
    ? additionalStyle
    : {
        [theme.breakpoints.down("lg")]: {
          paddingRight: theme.spacing(4),
          paddingLeft: theme.spacing(4),
        },
        [theme.breakpoints.down("sm")]: {
          paddingRight: theme.spacing(2),
          paddingLeft: theme.spacing(2),
        },
      }),
});
