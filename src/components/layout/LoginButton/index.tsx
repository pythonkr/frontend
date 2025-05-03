import styled from "@emotion/styled";

export default function LoginButton() {
  return <LoginButtonStyled>로그인</LoginButtonStyled>;
}

const LoginButtonStyled = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.palette.primary.dark};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
`;
