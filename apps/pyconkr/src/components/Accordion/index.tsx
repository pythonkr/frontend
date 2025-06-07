import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion as MuiAccordion, AccordionDetails, AccordionSummary } from "@mui/material";
import styled from "@emotion/styled";

const MOCK_FAQ = [
  {
    id: "01",
    question: "후원사 신청시 여러 후원 등급에 중복 신청도 가능한가요?",
    answer: "네, 중복 신청 가능합니다. 다만 최종 선정시에는 하나의 등급만 선택하셔야 합니다.",
  },
  {
    id: "02",
    question: "후원사 선정 방법이 궁금합니다. 선착순인가요?",
    answer:
      "후원사 선정은 신청 순서와 함께 파이콘 한국의 후원사 선정 기준에 따라 진행됩니다. 자세한 사항은 후원사 안내 페이지를 참고해 주세요.",
  },
  {
    id: "03",
    question: "후원사 등록이 정상적으로 진행되었는지 확인 방법이 있나요?",
    answer:
      "후원사 등록 완료 후 자동으로 확인 이메일이 발송됩니다. 만약 확인 이메일을 받지 못하셨다면 sponsor@pycon.kr로 문의해 주시기 바랍니다.",
  },
];

export default function Accordion() {
  return (
    <AccordionWrapper>
      {MOCK_FAQ.map((faq, index) => (
        <>
          <StyledAccordion key={faq.id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${faq.id}-content`}
              id={`panel${faq.id}-header`}
            >
              <Number>{faq.id}</Number>
              <Question>{faq.question}</Question>
            </AccordionSummary>
            <StyledAccordionDetails>{faq.answer}</StyledAccordionDetails>
          </StyledAccordion>
          {index !== MOCK_FAQ.length - 1 && <Divider />}
        </>
      ))}
    </AccordionWrapper>
  );
}

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
