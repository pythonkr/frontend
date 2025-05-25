import styled from "@emotion/styled";

import * as Common from "@frontend/common";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import LoginButton from "../LoginButton";
import Nav from "../Nav";
import BreadCrumb from "../BreadCrumb";

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <HeaderContainer>
        <HeaderLogo onClick={() => navigate("/")}>
          <Common.Components.PythonKorea style={{ width: 40, height: 40 }} />
        </HeaderLogo>
        <Nav />
        <HeaderLeft>
          <LanguageSelector />
          <LoginButton />
        </HeaderLeft>
      </HeaderContainer>
      <BreadCrumb />
    </>
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
  cursor: pointer;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.125rem;
`;
