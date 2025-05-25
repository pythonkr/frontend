import styled from "@emotion/styled";
import { useEffect, useState } from "react";

const menus = [
  {
    text: "파이콘 한국",
    subMenu: [
      { text: "파이콘 한국 소개", href: "/about" },
      { text: "파이콘 한국 2025", href: "/2025" },
      { text: "파이콘 한국 행동강령(CoC)", href: "/coc" },
      { text: "파이썬 사용자 모임", href: "/user-group" },
      {
        text: "역대 파이콘 행사",
        href: "/past-events",
        subMenu: [
          { text: "2025", href: "/2025" },
          { text: "2024", href: "/2024" },
          { text: "2023", href: "/2023" },
          { text: "2022", href: "/2022" },
          { text: "2021", href: "/2021" },
          { text: "2020", href: "/2020" },
        ],
      },
      { text: "파이콘 한국 건강 관련 안내", href: "/health" },
    ],
  },
  {
    text: "프로그램",
    subMenu: [
      { text: "튜토리얼", href: "/tutorial" },
      { text: "스프린트", href: "/sprint" },
      { text: "포스터 세션", href: "/poster" },
    ],
  },
  {
    text: "세션",
    subMenu: [
      { text: "세션 목록", href: "/sessions" },
      { text: "세션 시간표", href: "/schedule" },
    ],
  },
  {
    text: "구매",
    subMenu: [
      { text: "티켓 구매", href: "/tickets" },
      { text: "굿즈 구매", href: "/goods" },
      { text: "결제 내역", href: "/payments" },
    ],
  },
  {
    text: "후원하기",
    subMenu: [
      { text: "후원사 안내", href: "/sponsors" },
      { text: "개인 후원자", href: "/individual-sponsors" },
    ],
  },
];

function findBreadcrumbInfo(path: string) {
  if (path === "/" || path === "") {
    return {
      paths: [{ text: "홈", href: "/" }],
      title: "홈",
    };
  }

  const normalizedPath = path.replace(/^\/|\/$/g, "");

  let breadcrumbPaths = [{ text: "홈", href: "/" }];
  let pageTitle = "";

  for (const menu of menus) {
    for (const subMenu of menu.subMenu) {
      const subMenuPath = subMenu.href.replace(/^\/|\/$/g, "");

      if (subMenuPath === normalizedPath) {
        breadcrumbPaths.push({ text: menu.text, href: subMenu.href });
        pageTitle = subMenu.text;
        return { paths: breadcrumbPaths, title: pageTitle };
      }

      if (subMenu.subMenu) {
        for (const thirdMenu of subMenu.subMenu) {
          const thirdMenuPath = thirdMenu.href.replace(/^\/|\/$/g, "");

          if (thirdMenuPath === normalizedPath) {
            breadcrumbPaths.push({ text: menu.text, href: subMenu.href });
            breadcrumbPaths.push({ text: subMenu.text, href: subMenu.href });
            pageTitle = thirdMenu.text;
            return { paths: breadcrumbPaths, title: pageTitle };
          }
        }
      }
    }
  }

  return {
    paths: [{ text: "홈", href: "/" }],
    title: normalizedPath.charAt(0).toUpperCase() + normalizedPath.slice(1),
  };
}

export default function BreadCrumb() {
  const [breadcrumbInfo, setBreadcrumbInfo] = useState({
    paths: [{ text: "홈", href: "/" }],
    title: "파이콘 한국 행동강령(CoC)",
  });

  useEffect(() => {
    const mockPathInfo = {
      paths: [
        { text: "홈", href: "/" },
        { text: "파이콘 한국", href: "/about" },
      ],
      title: "파이콘 한국 행동강령(CoC)",
    };
    setBreadcrumbInfo(mockPathInfo);
  }, []);

  return (
    <BreadCrumbContainer>
      <BreadcrumbPathContainer>
        {breadcrumbInfo.paths.map((item, index) => (
          <span key={index}>
            {index > 0 && <span className="separator">&gt;</span>}
            <a href={item.href}>{item.text}</a>
          </span>
        ))}
      </BreadcrumbPathContainer>
      <PageTitle>{breadcrumbInfo.title}</PageTitle>
    </BreadCrumbContainer>
  );
}

const BreadCrumbContainer = styled.div`
  width: 100%;
  padding: 14px 117px;
  background-color: rgba(255, 255, 255, 0.7);
  background-image: linear-gradient(
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.45)
  );
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const BreadcrumbPathContainer = styled.div`
  font-size: 9.75px;
  font-weight: 300;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 0;

  a {
    color: #000000;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .separator {
    color: #4e869d;
    margin: 0 5px;
  }
`;

const PageTitle = styled.h1`
  font-size: 27px;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;
