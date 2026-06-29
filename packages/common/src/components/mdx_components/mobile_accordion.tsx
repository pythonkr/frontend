import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionDetails, AccordionSummary, Accordion as MuiAccordion, Stack, Typography } from "@mui/material";
import { FC, useMemo, useState } from "react";
import Marquee from "react-fast-marquee";

import { Common } from "@frontend/common/hooks";
const MarqueeAccordion: FC<{ marqueeText: string; marqueeLogoSrc: string }> = ({ marqueeText, marqueeLogoSrc }) => {
  const marqueeWidth = window.innerWidth * 0.9;
  const marqueeGradientWidth = window.innerWidth * 0.1;
  const items = useMemo(() => {
    return Array.from({ length: 100 }, () => (
      <Stack direction="row" sx={{ gap: 0 }}>
        <StyledTypography>{marqueeText}</StyledTypography>
        <img alt="logo" src={marqueeLogoSrc} />
      </Stack>
    ));
  }, [marqueeText, marqueeLogoSrc]);

  return <Marquee loop={0} gradient={true} gradientWidth={marqueeGradientWidth} speed={30} style={{ width: marqueeWidth }} children={items} />;
};

type MobileAccordionProps = {
  /** 접힌 상태에서 흐르는 마퀴 텍스트(예: `"AUG 15 - 17"`). */
  marqueeText: string;
  /** 마퀴 텍스트 사이에 반복 표시할 로고 이미지 경로. */
  marqueeLogoSrc: string;
  /** 펼친 상태에 크게 표시할 주최 로고 이미지 경로. */
  hostLogoBigSrc: string;
  /** 한국어 행사장 주소(한 줄). 언어가 `ko` 일 때 표시된다. */
  venueKo: string;
  /** 영어 행사장 주소. 줄 단위 배열로 여러 줄을 표시하며 언어가 `en` 일 때 사용된다. */
  venueEnLines: string[];
};

/**
 * 모바일 화면용 아코디언. 접힌 상태에서는 마퀴(흐르는 텍스트+로고)를,
 * 펼치면 주최 로고와 행사장 주소(현재 언어에 맞춰 ko/en)를 보여준다.
 * 레지스트리에는 행사 정보가 미리 채워진 래퍼로 등록되어 MDX 에서는 prop 없이 사용한다.
 * @example <Common__Components__MDX__MobileAccordion />
 */
export const MobileAccordion: FC<MobileAccordionProps> = ({ marqueeText, marqueeLogoSrc, hostLogoBigSrc, venueKo, venueEnLines }) => {
  const { language } = Common.useCommonContext();
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <AccordionWrapper>
      <StyledAccordion square={false} expanded={expanded} onChange={() => setExpanded((prev) => !prev)}>
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon
              fontSize={"large"}
              sx={{
                color: "#8E9B5D",
                borderWidth: 1,
                position: "relative",
                top: expanded ? -16 : 0,
              }}
            />
          }
          sx={{ margin: 0, padding: 0 }}
        >
          {expanded ? null : <MarqueeAccordion marqueeText={marqueeText} marqueeLogoSrc={marqueeLogoSrc} />}
        </AccordionSummary>
        <StyledAccordionDetails>
          <Stack>
            <Stack sx={{ padding: "30px 0px", borderRadius: "16px", alignItems: "center", justifyContent: "center" }}>
              <img src={hostLogoBigSrc} alt="Host Logo" style={{ width: "90%", height: "90%" }} />
            </Stack>
            {language === "ko" ? (
              <Stack direction="column" sx={{ transform: "translateY(-280%)" }}>
                <Typography color="#938A85" textAlign="center" fontSize="11px" fontWeight={400}>
                  {venueKo}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="column" sx={{ transform: "translateY(-180%)" }}>
                {venueEnLines.map((line, i) => (
                  <Typography key={i} color="#938A85" textAlign="center" fontWeight={400} fontSize="10px">
                    {line}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>
        </StyledAccordionDetails>
      </StyledAccordion>
    </AccordionWrapper>
  );
};

const AccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 -4px 16px rgba(0, 0, 0, 0.1);
  margin: 0;
  padding: 0;
  border-radius: 16;
`;

const StyledAccordion = styled(MuiAccordion)`
  box-shadow: none;
  border-radius: 16;

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
    padding: 10px 0px 10px 0px;
    min-height: 60px;
    max-height: 60px;

    .MuiAccordionSummary-content {
      display: flex;
      align-items: center;
      margin: 0;
    }

    &.Mui-expanded {
      min-height: 0px;
      max-height: 0px;
      object-fit: contain;
    }
  }

  "& .muiaccordionsummary-expandiconwrapper": {
    position: 'absolute',
    top: 10;
  }

  ,
  .MuiAccordionDetails-root {
    margin: 6px 0px 24px 0px;
  }

  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  position: relative;
  marginleft: 0;
  paddingleft: 0;
`;

const StyledTypography = styled(Typography)`
  font-weight: 500;
  font-size: 20px;
  color: #938a85;
  text-align: center;
  padding: 0 20px;
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  font-size: 14px;
  font-weight: 400;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
`;
