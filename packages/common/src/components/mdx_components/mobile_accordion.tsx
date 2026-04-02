import styled from "@emotion/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionDetails, AccordionSummary, Accordion as MuiAccordion, Stack, Typography } from "@mui/material";
import * as React from "react";
import Marquee from "react-fast-marquee";

import Hooks from "../../hooks";

type MobileAccordionProps = {
  eventDates?: string;
  venue?: { ko: string; en: string };
  hostLogoBig?: string;
  hostLogoSmall?: string;
};

const MarqueeAccordion: React.FC<{ eventDates: string; hostLogoSmall?: string }> = ({ eventDates, hostLogoSmall }) => {
  const marqueeWidth = window.innerWidth * 0.9;
  const marqueeGradientWidth = window.innerWidth * 0.1;
  const items = React.useMemo(() => {
    return Array.from({ length: 100 }, () => (
      <Stack direction="row" sx={{ gap: 0 }}>
        <StyledTypography>{eventDates}</StyledTypography>
        {hostLogoSmall && <img alt="logo" src={hostLogoSmall} />}
      </Stack>
    ));
  }, [eventDates, hostLogoSmall]);

  return <Marquee loop={0} gradient={true} gradientWidth={marqueeGradientWidth} speed={30} style={{ width: marqueeWidth }} children={items} />;
};

export const MobileAccordion: React.FC<MobileAccordionProps> = (props) => {
  const { language, eventConfig } = Hooks.Common.useCommonContext();
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const eventDates = props.eventDates ?? eventConfig?.eventDates ?? "";
  const venue = props.venue ?? eventConfig?.venue;
  const hostLogoBig = props.hostLogoBig ?? eventConfig?.assets.hostLogoBig;
  const hostLogoSmall = props.hostLogoSmall ?? eventConfig?.assets.hostLogoSmall;
  const venueLines = venue ? (language === "ko" ? [venue.ko] : venue.en.split("\n")) : [];

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
          {expanded ? null : <MarqueeAccordion eventDates={eventDates} hostLogoSmall={hostLogoSmall} />}
        </AccordionSummary>
        <StyledAccordionDetails>
          <Stack>
            <Stack sx={{ padding: "30px 0px", borderRadius: "16px", alignItems: "center", justifyContent: "center" }}>
              {hostLogoBig && <img src={hostLogoBig} alt="Host Logo" style={{ width: "90%", height: "90%" }} />}
            </Stack>
            {venueLines.length > 0 && (
              <Stack direction="column" sx={{ transform: venueLines.length === 1 ? "translateY(-280%)" : "translateY(-180%)" }}>
                {venueLines.map((line) => (
                  <Typography key={line} color="#938A85" textAlign="center" fontSize={venueLines.length === 1 ? "11px" : "10px"} fontWeight={400}>
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
