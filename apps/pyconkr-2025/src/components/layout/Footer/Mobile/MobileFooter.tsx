import styled from "@emotion/styled";
import { Article, Email, Facebook, GitHub, Instagram, LinkedIn, X, YouTube } from "@mui/icons-material";
import { FC } from "react";

import FlickrIcon from "@apps/pyconkr-2025/assets/thirdparty/flickr.svg?react";
import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";
import { useEmail } from "@frontend/common/hooks/useEmail";

interface IconItem {
  icon: FC<{ width?: number; height?: number }>;
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

export default function MobileFooter() {
  const { sendEmail } = useEmail();
  const { language } = useAppContext();

  const title = language === "ko" ? "Weave with Python, 파이콘 한국 2025" : "Weave with Python, Pycon KR 2025";
  const committeeTitle =
    language === "ko"
      ? "파이콘 한국 2025는 파이콘 한국 준비위원회가 만들고 있습니다"
      : "PyCon Korea 2025 is organized by the PyCon Korea Organizing Committee";
  const djangoTitle = language === "ko" ? "파이썬 웹 프레임워크 Django로 만들었습니다" : "Built with the Django web framework for Python";

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

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSlogan>
          <br />
          <FooterBoldText children={title} />
          <br />
          <FooterNormalText children={committeeTitle} />
          <br />
          <FooterNormalText children={djangoTitle} />
          <br />
        </FooterSlogan>
        <FooterLinks>
          {links.map((link, index) => (
            <FooterLinkSlogan key={index}>
              <Link key={link.text} href={link.href}>
                {link.text}
              </Link>
              {index < links.length - 1 && <Separator>|</Separator>}
            </FooterLinkSlogan>
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
      </FooterContent>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  background: linear-gradient(to bottom, #ffffff 0%, #e4fdff 25%, #92c9cc 50%, #5cadb3 75%, #095a5f 100%);
  color: ${({ theme }) => theme.palette.common.white};
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 16rem;
  padding: 5rem 0 1rem 0;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const FooterBoldText = styled.text`
  font-weight: 600;
`;

const FooterNormalText = styled.text`
  font-weight: 400;
`;

const FooterSlogan = styled.div`
  text-align: center;
`;

const FooterLinkSlogan = styled.div`
  display: flex;
  gap: 0.3rem;
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
  margin: 0.05rem 0;
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
