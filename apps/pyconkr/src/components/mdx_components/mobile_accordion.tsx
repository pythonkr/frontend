import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionDetails, AccordionSummary, Accordion as MuiAccordion, Stack, Typography } from "@mui/material";
import * as React from "react";
import Marquee from "react-fast-marquee";

import { useAppContext } from "../../contexts/app_context";
import PyCon2025HostLogoBig from "../../assets/pyconkr2025_hostlogo_big.png";
import PyCon2025HostLogoSmall from "../../assets/pyconkr2025_hostlogo_small.png";

const MarqueeAccordion: React.FC = () => {
  const marqueeWidth = window.innerWidth * 0.9;
  const marqueeGradientWidth = window.innerWidth * 0.1;
  const items = React.useMemo(() => {
    return Array.from({ length: 100 }, () => (
      <Stack direction="row" sx={{ gap: 0 }}>
        <StyledTypography>AUG 15 - 17</StyledTypography>
        <img alt="logo" src={PyCon2025HostLogoSmall} />
      </Stack>
    ));
  }, []);

  return <Marquee loop={0} gradient={true} gradientWidth={marqueeGradientWidth} speed={30} style={{ width: marqueeWidth }} children={items} />;
};

export const MobileAccordion: React.FC = () => {
  const { language } = useAppContext();
  const [expanded, setExpanded] = React.useState<boolean>(false);

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
          {expanded ? null : <MarqueeAccordion />}
        </AccordionSummary>
        <StyledAccordionDetails>
          <Stack>
            <Stack sx={{ padding: "30px 0px", borderRadius: "16px", alignItems: "center", justifyContent: "center" }}>
              <img src={PyCon2025HostLogoBig} alt="PyCon 2025 Host Logo" style={{ width: "90%", height: "90%" }} />
            </Stack>
            {language === "ko" ? (
              <Stack direction="column" sx={{ transform: "translateY(-280%)" }}>
                <Typography color="#938A85" textAlign="center" fontSize="11px" fontWeight={400}>
                  {"서울특별시 중구 필동로 1길 30 동국대학교 신공학관"}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="column" sx={{ transform: "translateY(-180%)" }}>
                <Typography color="#938A85" textAlign="center" fontSize="10px" fontWeight={400}>
                  {"New Engineering Building, Dongguk University"}
                </Typography>
                <Typography color="#938A85" textAlign="center" fontWeight={400} fontSize="10px">
                  {"Pildong-ro 1-gil, Jung-gu, Seoul, Republic of Korea"}
                </Typography>
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
