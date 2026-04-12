import FlickrIcon from "@apps/pyconkr-2026/assets/thirdparty/flickr.svg?react";
import styled from "@emotion/styled";
import { useEmail } from "@frontend/common/src/hooks/useEmail";
import { Article, Email, Facebook, GitHub, Instagram, LinkedIn, OpenInNew, X, YouTube } from "@mui/icons-material";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import * as React from "react";

import { useAppContext } from "../../../contexts/app_context";
import MobileFooter from "./Mobile/MobileFooter";

interface IconItem {
  icon: React.FC<{ width?: number; height?: number }>;
  alt: string;
  href: string;
}

const defaultIcons: IconItem[] = [
  {
    icon: Facebook,
    alt: "facebook",
    href: "https://www.facebook.com/pyconkorea/",
  },
  {
    icon: YouTube,
    alt: "YouTube",
    href: "https://www.youtube.com/c/PyConKRtube",
  },
  { icon: X, alt: "X", href: "https://x.com/PyConKR" },
  { icon: GitHub, alt: "github", href: "https://github.com/pythonkr" },
  {
    icon: Instagram,
    alt: "Instagram",
    href: "https://www.instagram.com/pycon_korea/",
  },
  {
    icon: LinkedIn,
    alt: "LinkedIn",
    href: "https://www.linkedin.com/company/pyconkorea/",
  },
  { icon: Article, alt: "blog", href: "https://blog.pycon.kr/" },
  {
    icon: FlickrIcon,
    alt: "Flickr",
    href: "https://www.flickr.com/photos/126829363@N08/",
  },
];

const Bar: React.FC = () => <div style={{ display: "inline-block", padding: "0 0.25rem" }}>|</div>;

export default function Footer() {
  const { sendEmail } = useEmail();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { language } = useAppContext();

  const corpPasamoStr = language === "ko" ? "사단법인 파이썬사용자모임" : "Python Korea";
  const corpAddressStr =
    language === "ko" ? "서울특별시 강남구 강남대로84길 24-4" : "24-4, Gangnam-daero 84-gil, Gangnam-gu, Seoul, Republic of Korea";
  const corpRepresentatorStr = language === "ko" ? "대표자명 : 배권한" : "Representator : Kwon-Han Bae";
  const corpPhoneStr =
    language === "ko"
      ? "대표 전화 번호 : 031-261-2203, 010-5298-6622, 010-8259-3013 (문자)"
      : "Phone Number : 031-261-2203, 010-5298-6622, 010-8259-3013 (SMS)";
  const corpCompanyNumberStr = language === "ko" ? "사업자 등록 번호 : 338-82-00046" : "Business Registration Number : 338-82-00046";
  const corpCheckBtnStr = language === "ko" ? "사업자 정보 확인" : "Check Business Registration Information";
  const corpMailOrderSalesRegistrationNumberStr =
    language === "ko" ? "통신 판매 번호 : 2023-서울강남-03501" : "Mail Order Sales Registration Number : 2023-SEOUL-GANGNAM-03501";
  const hostingProviderStr =
    language === "ko" ? "호스팅 제공자 : Amazon Web Services(Korea LLC)" : "Hosting Provider : Amazon Web Services(Korea LLC)";
  const contractEmailStr = language === "ko" ? "문의: " : "Contact: ";
  const copyrightStr = language === "ko" ? "© 2025, 사단법인 파이썬사용자모임, All rights reserved." : "© 2025, Python Korea, All rights reserved.";

  const links = [
    {
      text: language === "ko" ? "파이콘 한국 행동 강령(CoC)" : "PyCon Korea Code of Conduct",
      href: "https://pythonkr.github.io/pycon-code-of-conduct/ko/coc/a_intent_and_purpose.html",
    },
    {
      text: language === "ko" ? "서비스 이용 약관" : "Terms of Service",
      href: "/about/terms-of-service",
    },
    {
      text: language === "ko" ? "개인 정보 처리 방침" : "Privacy Policy",
      href: "/about/privacy-policy",
    },
  ];

  if (isMobile) {
    return <MobileFooter />;
  } else {
    return (
      <FooterContainer>
        <FooterContent>
          <FooterText>
            <strong>{corpPasamoStr}</strong>
            <br />
            {corpAddressStr}
            <Bar />
            {corpRepresentatorStr}
            <Bar />
            {corpPhoneStr}
            <Bar />
            {corpCompanyNumberStr}
            <a href="http://www.ftc.go.kr/bizCommPop.do?wrkr_no=3388200046" target="_blank" rel="noreferrer">
              <Button variant="outlined" startIcon={<OpenInNew sx={{ fontSize: "7pt" }} />}>
                {corpCheckBtnStr}
              </Button>
            </a>
            <br />
            {corpMailOrderSalesRegistrationNumberStr}
            <Bar />
            {hostingProviderStr}
            <Bar />
            {contractEmailStr}
            <a href="mailto:pyconkr@pycon.kr">pyconkr@pycon.kr</a>
          </FooterText>
          <FooterLinks>
            {links.map((link, index) => (
              <React.Fragment key={index}>
                <Link key={link.text} href={link.href}>
                  {link.text}
                </Link>
                {index < links.length - 1 && <Separator>|</Separator>}
              </React.Fragment>
            ))}
          </FooterLinks>
          <FooterIcons>
            <IconLink onClick={sendEmail} aria-label="이메일 보내기">
              <Email width={20} height={20} aria-hidden="true" />
            </IconLink>
            {defaultIcons.map((icon) => (
              <IconLink key={icon.alt} href={icon.href} target="_blank" rel="noopener noreferrer" aria-label={`${icon.alt}로 이동`}>
                <icon.icon width={20} height={20} aria-hidden="true" />
              </IconLink>
            ))}
          </FooterIcons>
          <FooterSlogan>{copyrightStr}</FooterSlogan>
        </FooterContent>
      </FooterContainer>
    );
  }
}

const FooterContainer = styled.footer`
  background: ${({ theme }) => `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`};
  color: ${({ theme }) => theme.palette.common.white};
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 16rem;
  padding: 1rem 0;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const FooterText = styled.div`
  padding: 0 2rem;
  margin: 0.1rem;

  font-size: 9pt;

  a > button {
    margin-left: 0.25rem;
    padding: 0.05rem 0.25rem;
    font-size: 8pt;
    color: ${({ theme }) => theme.palette.common.white};
    border-color: ${({ theme }) => theme.palette.common.white};

    gap: 0.25rem;

    & span {
      margin-left: -2px;
      margin-right: 0;

      & svg {
        font-size: 12pt !important;
      }
    }
  }

  strong {
    font-size: 12pt;
  }
`;

const FooterSlogan = styled.div`
  text-align: center;
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const FooterIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.palette.common.white};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.palette.common.white};
  opacity: 0.5;
`;

const IconLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 20px;
    height: 20px;
  }
`;
