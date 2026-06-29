import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion as MuiAccordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { FC, Fragment } from "react";
export interface FAQItem {
  /** 항목 고유 식별자이자 헤더 왼쪽에 표시되는 번호. */
  id: string;
  /** 질문 텍스트. 아코디언 헤더에 표시된다. */
  question: string;
  /** 펼쳤을 때 표시되는 답변 텍스트. */
  answer: string;
}

export interface FAQAccordionProps {
  /** 표시할 FAQ 항목 목록. 각 항목은 `{ id, question, answer }` (모두 string). 항목 사이에는 구분선이 들어간다. */
  items: FAQItem[];
}

/**
 * 자주 묻는 질문(FAQ) 아코디언. `items` 배열을 받아 질문을 클릭하면 답변이 펼쳐지는 목록을 렌더한다.
 * @example <Common__Components__MDX__FAQAccordion items={[{ id: "1", question: "환불 되나요?", answer: "행사 7일 전까지 가능합니다." }]} />
 */
export const FAQAccordion: FC<FAQAccordionProps> = ({ items }) => {
  return (
    <AccordionWrapper>
      {items.map((faq, index) => (
        <Fragment key={faq.id}>
          <StyledAccordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel${faq.id}-content`} id={`panel${faq.id}-header`}>
              <Number>{faq.id}</Number>
              <Question>{faq.question}</Question>
            </AccordionSummary>
            <StyledAccordionDetails>{faq.answer}</StyledAccordionDetails>
          </StyledAccordion>
          {index !== items.length - 1 && <Divider />}
        </Fragment>
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

const StyledAccordion = styled(MuiAccordion)`
  box-shadow: none;
  border-radius: 0;

  &:before {
    display: none;
  }

  &.MuiAccordion-root {
    margin: 0;

    &:first-of-type {
      border-top: none;
    }

    &:last-of-type {
      border-bottom: none;
    }
  }

  .MuiAccordionSummary-root {
    padding: 10px 35px;
    min-height: 60px;
    max-height: 60px;

    .MuiAccordionSummary-content {
      display: flex;
      align-items: center;
      margin: 0;
    }

    &.Mui-expanded {
      min-height: 60px;
      max-height: 60px;
    }
  }
`;

const Number = styled.span`
  font-size: 18px;
  font-weight: 400;
`;

const Question = styled.span`
  font-size: 18px;
  font-weight: 400;
  margin-left: 60px;
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  background-color: ${({ theme }) => `${theme.palette.primary.light}26`}; // 15% opacity (26 in hex)
  color: ${({ theme }) => theme.palette.primary.dark};
  font-size: 14px;
  font-weight: 400;
  padding: 20px 0 20px calc(35px + 18px + 60px); // top right bottom left
`;
