import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import styled from "@emotion/styled";

const headerMenus = [
  {
    text: "파이콘 한국",
    subMenu: [
      { text: "파이콘 한국 2025", href: "/2025" },
      { text: "파이콘 한국 행동강령(CoC)", href: "/coc" },
      { text: "파이썬 사용자 모임", href: "/user-group" },
      { text: "역대 파이콘 행사", href: "/past-events" },
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

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
`;

export default function MainLayout() {
  return (
    <LayoutContainer>
      <Header menus={headerMenus} />
      <MainContent>
        <Outlet />
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
}
