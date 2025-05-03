import styled from "@emotion/styled";
import { useEmail } from "@/hooks/useEmail";
import MessageIcon from "@/assets/Footer/message.svg?react";
import FacebookIcon from "@/assets/Footer/facebook.svg?react";
import YoutubeIcon from "@/assets/Footer/youtube.svg?react";
import XIcon from "@/assets/Footer/x.svg?react";
import GithubIcon from "@/assets/Footer/github.svg?react";
import InstagramIcon from "@/assets/Footer/instagram.svg?react";
import LinkedinIcon from "@/assets/Footer/linkedin.svg?react";
import BlogIcon from "@/assets/Footer/blog.svg?react";
import FlickrIcon from "@/assets/Footer/flickr.svg?react";

interface LinkItem {
  text: string;
  href: string;
}

interface IconItem {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  alt: string;
  href: string;
}

interface FooterProps {
  slogan?: string;
  description?: string;
  links?: LinkItem[];
  icons?: IconItem[];
}

const defaultIcons: IconItem[] = [
  {
    icon: FacebookIcon,
    alt: "facebook",
    href: "https://www.facebook.com/pyconkorea/",
  },
  {
    icon: YoutubeIcon,
    alt: "youtube",
    href: "https://www.youtube.com/c/PyConKRtube",
  },
  { icon: XIcon, alt: "x", href: "https://x.com/PyConKR" },
  { icon: GithubIcon, alt: "github", href: "https://github.com/pythonkr" },
  {
    icon: InstagramIcon,
    alt: "instagram",
    href: "https://www.instagram.com/pycon_korea/",
  },
  {
    icon: LinkedinIcon,
    alt: "linkedin",
    href: "https://www.linkedin.com/company/pyconkorea/",
  },
  { icon: BlogIcon, alt: "blog", href: "https://blog.pycon.kr/" },
  {
    icon: FlickrIcon,
    alt: "flickr",
    href: "https://www.flickr.com/photos/126829363@N08/",
  },
];

export default function Footer({
  slogan = "Weave with Python, 파이콘 한국 2025",
  description = "파이콘 한국 2025는 파이콘 한국 준비위원회가 만들고 있습니다\n파이썬 웹 프레임워크 Django로 만들었습니다",
  links = [
    { text: "파이콘 한국 행동 강령(CoC)", href: "#" },
    { text: "서비스 이용 약관", href: "#" },
    { text: "개인 정보 처리 방침", href: "#" },
  ],
  icons = defaultIcons,
}: FooterProps) {
  const { sendEmail } = useEmail();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSlogan>{slogan}</FooterSlogan>
        {description.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <FooterLinks>
          {links.map((link, index) => (
            <>
              <Link key={link.text} href={link.href}>
                {link.text}
              </Link>
              {index < links.length - 1 && <Separator>|</Separator>}
            </>
          ))}
        </FooterLinks>
        <FooterIcons>
          <IconLink onClick={sendEmail} aria-label="이메일 보내기">
            <MessageIcon width={20} height={20} aria-hidden="true" />
          </IconLink>
          {icons.map((icon) => (
            <IconLink
              key={icon.alt}
              href={icon.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${icon.alt}로 이동`}
            >
              <icon.icon width={20} height={20} aria-hidden="true" />
            </IconLink>
          ))}
        </FooterIcons>
      </FooterContent>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.common.white};
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 267px;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const FooterSlogan = styled.div`
  font-weight: 600;
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
