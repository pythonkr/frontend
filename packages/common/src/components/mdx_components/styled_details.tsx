import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  PaletteColor,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { FC, PropsWithChildren, ReactNode } from "react";
type StyledDetailsProps = PropsWithChildren<
  AccordionProps & {
    /** 펼침/접힘 토글 아이콘. 미지정 시 기본 화살표(▼) 아이콘을 사용한다. */
    expandIcon?: ReactNode;
    /** 항상 보이는 헤더 영역. 문자열을 넘기면 제목(h5) 스타일로 렌더된다. */
    summary?: ReactNode;
    /** 펼친 내용 하단에 표시할 동작 영역(버튼 등). */
    actions?: ReactNode;
  }
>;

type BaseStyledDetailsProps = StyledDetailsProps & {
  paletteColor: PaletteColor;
  transparencyOnExpand?: number;
};

const BaseStyledDetails: FC<BaseStyledDetailsProps> = ({ expandIcon, summary, children, actions, paletteColor, transparencyOnExpand, ...props }) => {
  const rootSx: SxProps<Theme> = (theme) => ({
    width: "100%",
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    border: `1px solid ${paletteColor.dark}`,
    borderRadius: "0.5rem",
    fontWeight: 500,
    transition: "background-color 0.3s ease",
    "&.Mui-expanded": {
      backgroundColor: `color-mix(in srgb, ${paletteColor.light} ${transparencyOnExpand || 10}%, transparent)`,
    },
  });

  const summarySx: SxProps<Theme> = { color: paletteColor.dark };

  const expandIconSx: SxProps<Theme> = (theme) => ({
    color: paletteColor.dark,
    fontSize: theme.typography.h4.fontSize,
  });

  return (
    <Accordion {...props} disableGutters square elevation={0} sx={rootSx}>
      <AccordionSummary expandIcon={expandIcon || <ExpandMore sx={expandIconSx} />} sx={summarySx}>
        {typeof summary === "string" ? <Typography variant="h5">{summary}</Typography> : summary}
      </AccordionSummary>
      <AccordionDetails sx={{ pt: "0", pb: "1rem", px: "2rem" }}>{children}</AccordionDetails>
      {actions && <AccordionActions sx={{ pt: "0", pb: "1rem", px: "2rem" }}>{actions}</AccordionActions>}
    </Accordion>
  );
};

/**
 * primary 색으로 강조한 접이식 상세(아코디언). `summary` 를 헤더로, 태그 사이 내용(children)을 펼친 내용으로 렌더한다.
 * 펼치면 배경에 primary 색이 옅게 채워진다.
 * @example
 * <Common__Components__MDX__PrimaryStyledDetails summary="자세히 보기">
 *   펼치면 보이는 내용입니다.
 * </Common__Components__MDX__PrimaryStyledDetails>
 */
export const PrimaryStyledDetails: FC<StyledDetailsProps> = (props) => {
  const { palette } = useTheme();
  return <BaseStyledDetails {...props} paletteColor={palette.primary} transparencyOnExpand={20} />;
};

/**
 * highlight 색으로 강조한 접이식 상세(아코디언). `summary` 를 헤더로, 태그 사이 내용(children)을 펼친 내용으로 렌더한다.
 * 동작은 PrimaryStyledDetails 와 같고 강조 색상만 다르다. (레지스트리에는 `SecondaryStyledDetails` 라는 이름으로 등록된다.)
 * @example
 * <Common__Components__MDX__SecondaryStyledDetails summary="강조 항목">
 *   강조된 접이식 내용.
 * </Common__Components__MDX__SecondaryStyledDetails>
 */
export const HighlightedStyledDetails: FC<StyledDetailsProps> = (props) => {
  const { palette } = useTheme();
  return <BaseStyledDetails {...props} paletteColor={palette.highlight} transparencyOnExpand={10} />;
};
