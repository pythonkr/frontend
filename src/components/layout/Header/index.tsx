import styled from "@emotion/styled";
import { useMenu } from "../../../hooks/useMenu";
import LanguageSelector from "../LanguageSelector";
import LoginButton from "../LoginButton";

interface SubMenuItem {
  text: string;
  href: string;
}

interface MenuItem {
  text: string;
  href?: string;
  subMenu?: SubMenuItem[];
}

interface HeaderProps {
  menus: MenuItem[];
}

export default function Header({ menus }: HeaderProps) {
  const {
    hoveredMenu,
    focusedMenu,
    menuRefs,
    setHoveredMenu,
    setFocusedMenu,
    handleKeyDown,
    handleBlur,
  } = useMenu();

  return (
    <HeaderContainer>
      <HeaderLogo>
        <img
          src="src/assets/pyconLogo.png"
          width={40}
          height={40}
          alt="pyconLogo"
        />
      </HeaderLogo>

      <nav>
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
              {menu.subMenu &&
                (hoveredMenu === menu.text || focusedMenu === menu.text) && (
                  <SubMenu>
                    {menu.subMenu.map((subItem) => (
                      <SubMenuItem key={subItem.text}>
                        <a href={subItem.href} tabIndex={0}>
                          {subItem.text}
                        </a>
                      </SubMenuItem>
                    ))}
                  </SubMenu>
                )}
            </li>
          ))}
        </HeaderNav>
      </nav>
      <HeaderLeft>
        <LanguageSelector />
        <LoginButton />
      </HeaderLeft>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.palette.primary.light};
  color: ${({ theme }) => theme.palette.primary.dark};
  font-size: 0.8125rem;
  font-weight: 500;
  width: 100%;
  height: 3.625rem;
  padding: 0.5625rem 7.125rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const HeaderLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderNav = styled.ul`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;

  li {
    position: relative;
    cursor: pointer;
    outline: none;

    &:focus {
      outline: 2px solid ${({ theme }) => theme.palette.primary.main};
      outline-offset: 1px;
    }
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.125rem;
`;

// const HeaderItem = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.625rem;
// `;

const SubMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 5px;
  padding: 5px 0;
  width: 125px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const SubMenuItem = styled.li`
  padding: 5px 0;
  text-align: center;

  a {
    color: ${({ theme }) => theme.palette.primary.light};
    text-decoration: none;
    font-size: 10px;
    display: block;
    outline: none;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.palette.primary.main};
      font-weight: 600;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.palette.primary.main};
      outline-offset: 0.5px;
    }
  }
`;
