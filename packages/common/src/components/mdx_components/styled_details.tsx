import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  PaletteColor,
  styled,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import { FC, PropsWithChildren, ReactNode } from "react";
type StyledDetailsProps = PropsWithChildren<
  AccordionProps & {
    expandIcon?: ReactNode;
    summary?: ReactNode;
    actions?: ReactNode;
  }
>;

type BaseStyledDetailsProps = StyledDetailsProps & {
  paletteColor: PaletteColor;
  transparencyOnExpand?: number;
};

const StyledAccordion = styled(Accordion, { shouldForwardProp: (p) => p !== "borderColor" })<{ borderColor: string }>(({ theme, borderColor }) => ({
  width: "100%",
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  border: `1px solid ${borderColor}`,
  borderRadius: "0.5rem",
  fontWeight: 500,
}));

const StyledAccordionSummary = styled(AccordionSummary, { shouldForwardProp: (p) => p !== "summaryColor" })<{ summaryColor: string }>(
  ({ summaryColor }) => ({
    color: summaryColor,
  })
);

const StyledExpandIcon = styled(ExpandMore, { shouldForwardProp: (p) => p !== "iconColor" })<{ iconColor: string }>(({ theme, iconColor }) => ({
  color: iconColor,
  fontSize: theme.typography.h4.fontSize,
}));

const BaseStyledDetails: FC<BaseStyledDetailsProps> = ({ expandIcon, summary, children, actions, paletteColor, transparencyOnExpand, ...props }) => {
  const rootSx: SxProps = {
    transition: "background-color 0.3s ease",
    "&.Mui-expanded": {
      backgroundColor: `color-mix(in srgb, ${paletteColor.light} ${transparencyOnExpand || 10}%, transparent)`,
    },
  };

  return (
    <StyledAccordion borderColor={paletteColor.dark} {...props} disableGutters square elevation={0} slotProps={{ root: { sx: rootSx } }}>
      <StyledAccordionSummary summaryColor={paletteColor.dark} expandIcon={expandIcon || <StyledExpandIcon iconColor={paletteColor.dark} />}>
        {typeof summary === "string" ? <Typography variant="h5">{summary}</Typography> : summary}
      </StyledAccordionSummary>
      <AccordionDetails sx={{ pt: "0", pb: "1rem", px: "2rem" }}>{children}</AccordionDetails>
      {actions && <AccordionActions sx={{ pt: "0", pb: "1rem", px: "2rem" }}>{actions}</AccordionActions>}
    </StyledAccordion>
  );
};

export const PrimaryStyledDetails: FC<StyledDetailsProps> = (props) => {
  const { palette } = useTheme();
  return <BaseStyledDetails {...props} paletteColor={palette.primary} transparencyOnExpand={20} />;
};

export const HighlightedStyledDetails: FC<StyledDetailsProps> = (props) => {
  const { palette } = useTheme();
  return <BaseStyledDetails {...props} paletteColor={palette.highlight} transparencyOnExpand={10} />;
};
