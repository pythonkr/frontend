import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion as MuiAccordion, AccordionDetails, AccordionSummary } from "@mui/material";
import * as React from "react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export type FAQAccordionStyles = {
  summary?: {
    padding?: string;
    minHeight?: string;
    maxHeight?: string;
  };
  number?: {
    fontSize?: string;
    fontWeight?: number | string;
  };
  question?: {
    fontSize?: string;
    fontWeight?: number | string;
    marginLeft?: string;
  };
  details?: {
    fontSize?: string;
    fontWeight?: number | string;
    padding?: string;
  };
};

export interface FAQAccordionProps {
  items: FAQItem[];
  styles?: FAQAccordionStyles;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, styles }) => {
  return (
    <AccordionWrapper>
      {items.map((faq, index) => (
        <React.Fragment key={faq.id}>
          <StyledAccordion faqStyles={styles}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${faq.id}-content`} id={`panel${faq.id}-header`}>
              <Number faqStyles={styles}>{faq.id}</Number>
              <Question faqStyles={styles}>{faq.question}</Question>
            </AccordionSummary>
            <StyledAccordionDetails faqStyles={styles}>{faq.answer}</StyledAccordionDetails>
          </StyledAccordion>
          {index !== items.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </AccordionWrapper>
  );
};

const AccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.palette.primary.dark};
  border-bottom: 1px solid ${({ theme }) => theme.palette.primary.dark};
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.palette.primary.light};
  margin: 0;
`;

const StyledAccordion = styled(MuiAccordion, {
  shouldForwardProp: (prop) => prop !== "faqStyles",
})<{ faqStyles?: FAQAccordionStyles }>(({ faqStyles }) => ({
  boxShadow: "none",
  borderRadius: 0,
  "&:before": { display: "none" },
  "&.MuiAccordion-root": {
    margin: 0,
    "&:first-of-type": { borderTop: "none" },
    "&:last-of-type": { borderBottom: "none" },
  },
  ".MuiAccordionSummary-root": {
    padding: faqStyles?.summary?.padding ?? "10px 35px",
    minHeight: faqStyles?.summary?.minHeight ?? "60px",
    maxHeight: faqStyles?.summary?.maxHeight ?? "60px",
    ".MuiAccordionSummary-content": {
      display: "flex",
      alignItems: "center",
      margin: 0,
    },
    "&.Mui-expanded": {
      minHeight: faqStyles?.summary?.minHeight ?? "60px",
      maxHeight: faqStyles?.summary?.maxHeight ?? "60px",
    },
  },
}));

const Number = styled("span", {
  shouldForwardProp: (prop) => prop !== "faqStyles",
})<{ faqStyles?: FAQAccordionStyles }>(({ faqStyles }) => ({
  fontSize: faqStyles?.number?.fontSize ?? "18px",
  fontWeight: faqStyles?.number?.fontWeight ?? 400,
}));

const Question = styled("span", {
  shouldForwardProp: (prop) => prop !== "faqStyles",
})<{ faqStyles?: FAQAccordionStyles }>(({ faqStyles }) => ({
  fontSize: faqStyles?.question?.fontSize ?? "18px",
  fontWeight: faqStyles?.question?.fontWeight ?? 400,
  marginLeft: faqStyles?.question?.marginLeft ?? "60px",
}));

const StyledAccordionDetails = styled(AccordionDetails, {
  shouldForwardProp: (prop) => prop !== "faqStyles",
})<{ faqStyles?: FAQAccordionStyles }>(({ theme, faqStyles }) => ({
  backgroundColor: `${theme.palette.primary.light}26`,
  color: theme.palette.primary.dark,
  fontSize: faqStyles?.details?.fontSize ?? "14px",
  fontWeight: faqStyles?.details?.fontWeight ?? 400,
  padding: faqStyles?.details?.padding ?? "20px 0 20px calc(35px + 18px + 60px)",
}));
