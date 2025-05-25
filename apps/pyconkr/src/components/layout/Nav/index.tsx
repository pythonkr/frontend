import styled from "@emotion/styled";
import { useMenu } from "../../../hooks/useMenu";
import { useState, useEffect, useRef, useMemo } from "react";

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

export default function Nav() {
  const {
    hoveredMenu,
    focusedMenu,
    menuRefs,
    setHoveredMenu,
    setFocusedMenu,
    handleKeyDown,
    handleBlur,
  } = useMenu();

  const [isSubMenuHovered, setIsSubMenuHovered] = useState(false);
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null);
  const lastActiveMenuRef = useRef<string | null>(null);

  useEffect(() => {
    if (hoveredMenu || focusedMenu) {
      lastActiveMenuRef.current = hoveredMenu || focusedMenu;
    }
  }, [hoveredMenu, focusedMenu]);

  const showSubmenu = !!hoveredMenu || !!focusedMenu || isSubMenuHovered;
  const activeMenu =
    hoveredMenu ||
    focusedMenu ||
    (isSubMenuHovered ? lastActiveMenuRef.current : null);
  const currentMenu = menus.find((menu) => menu.text === activeMenu);

  const hasActiveThirdLevel = useMemo(() => {
    if (!hoveredSubItem || !currentMenu) return false;
    const activeSubItem = currentMenu.subMenu.find(
      (item) => item.text === hoveredSubItem
    );
    return activeSubItem?.subMenu && activeSubItem.subMenu.length > 0;
  }, [currentMenu, hoveredSubItem]);

  return (
    <>
      <NavMainContainer>
        <HeaderNav>
          {menus.map((menu) => (
            <li
              key={menu.text}
              ref={(el) => {
                menuRefs.current[menu.text] = el;
              }}
              onMouseEnter={() => setHoveredMenu(menu.text)}
              onMouseLeave={() => setHoveredMenu(null)}
              onFocus={() => setFocusedMenu(menu.text)}
              onBlur={() => handleBlur(menu)}
              onKeyDown={(e) => handleKeyDown(e, menu)}
              tabIndex={0}
            >
              {menu.text}
            </li>
          ))}
        </HeaderNav>
      </NavMainContainer>

      {showSubmenu && currentMenu && (
        <NavSubContainer
          onMouseEnter={() => setIsSubMenuHovered(true)}
          onMouseLeave={() => {
            setIsSubMenuHovered(false);
            setHoveredSubItem(null);
          }}
        >
          <SubMenuWrapper>
            <CategoryTitle>{currentMenu.text}</CategoryTitle>
            <SubMenuContent>
              <SecondLevelContainer>
                <SecondLevelList>
                  {currentMenu.subMenu.map((subItem) => {
                    return (
                      <SecondLevelItem
                        key={subItem.text}
                        onMouseEnter={() => setHoveredSubItem(subItem.text)}
                        className={
                          hoveredSubItem === subItem.text ? "active" : ""
                        }
                      >
                        <a href={subItem.href} tabIndex={0}>
                          {subItem.text}
                        </a>
                      </SecondLevelItem>
                    );
                  })}
                </SecondLevelList>
              </SecondLevelContainer>

              {hasActiveThirdLevel && (
                <>
                  <ThirdLevelDivider />

                  <ThirdLevelSection
                    onMouseEnter={() => {
                      if (hoveredSubItem) {
                        setHoveredSubItem(hoveredSubItem);
                      }
                    }}
                  >
                    {currentMenu.subMenu.map((subItem) => {
                      const hasThirdLevel =
                        subItem.subMenu && subItem.subMenu.length > 0;
                      const isActive = hoveredSubItem === subItem.text;

                      if (!hasThirdLevel || !isActive) return null;

                      return (
                        <ThirdLevelList key={`third-level-${subItem.text}`}>
                          {subItem.subMenu!.map((thirdItem) => (
                            <ThirdLevelItem key={thirdItem.text}>
                              <a href={thirdItem.href} tabIndex={0}>
                                {thirdItem.text}
                              </a>
                            </ThirdLevelItem>
                          ))}
                        </ThirdLevelList>
                      );
                    })}
                  </ThirdLevelSection>
                </>
              )}
            </SubMenuContent>
          </SubMenuWrapper>
        </NavSubContainer>
      )}
    </>
  );
}

const NavMainContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1100;
`;

const NavSubContainer = styled.div`
  width: 100vw;
  height: auto;
  min-height: 150px;
  background-color: rgba(255, 255, 255, 0.7);
  background-image: linear-gradient(
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.45)
  );
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 60px;
  z-index: 1500;
  display: flex;
  justify-content: center;
  padding-top: 34px;
  padding-bottom: 34px;
  overflow-y: auto;
`;

const SubMenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  height: auto;
  padding-left: 118px;
  box-sizing: border-box;
`;

const CategoryTitle = styled.h3`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.primary.dark};
  margin: 0;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -15px;
    width: 53px;
    height: 5px;
    background-color: #ee8d74;
  }
`;

const HeaderNav = styled.ul`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  list-style: none;

  li {
    position: relative;
    cursor: pointer;
    outline: none;
    padding: 20px 10px 30px 10px;
    margin: -20px -10px -30px -10px;

    &:focus {
      outline: 2px solid ${({ theme }) => theme.palette.primary.main};
      outline-offset: 1px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: transparent;
    }
  }
`;

const SubMenuContent = styled.div`
  display: flex;
  margin-top: 25px;
  width: 100%;
  align-items: flex-start;
  height: auto;
`;

const SecondLevelContainer = styled.div`
  height: auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  min-width: 220px;
  width: 220px;
  padding-right: 30px;
`;

const SecondLevelList = styled.ul`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 13px;
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const SecondLevelItem = styled.li`
  padding: 0;
  position: relative;
  width: 100%;
  text-align: left;

  &.active a {
    font-weight: 700;

    &:after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -3px;
      width: 100%;
      height: 2px;
      background-color: ${({ theme }) => theme.palette.primary.dark};
    }
  }

  a {
    color: ${({ theme }) => theme.palette.primary.dark};
    text-decoration: none;
    font-size: 15px;
    font-weight: 300;
    display: inline-block;
    outline: none;
    position: relative;
    white-space: nowrap;

    &:hover,
    &:focus {
      font-weight: 700;

      &:after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -3px;
        width: 100%;
        height: 2px;
        background-color: ${({ theme }) => theme.palette.primary.dark};
      }
    }

    &:focus {
      outline: none;
    }
  }
`;

const ThirdLevelDivider = styled.div`
  width: 1px;
  height: auto;
  background-color: ${({ theme }) => theme.palette.primary.light};
  margin: 0;
  flex-shrink: 0;
  align-self: stretch;
`;

const ThirdLevelSection = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 220px;
  padding-left: 30px;
`;

const ThirdLevelList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 8px;
  height: auto;
  max-height: 160px;
  column-gap: 30px;
  width: 100%;
`;

const ThirdLevelItem = styled.li`
  width: auto;
  text-align: right;
  min-width: 40px;

  a {
    color: ${({ theme }) => theme.palette.primary.dark};
    text-decoration: none;
    font-size: 10px;
    display: inline-block;
    white-space: nowrap;
    font-variation-settings: "wght" 400;

    &:hover,
    &:focus {
      font-weight: 700;
    }
  }
`;
