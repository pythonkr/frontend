import styled from "@emotion/styled";
import { Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

import Footer from "./Footer";
import Header from "./Header";
import { Sponsor } from "./Sponsor";

export default function MainLayout() {
  const { shouldShowSponsorBanner } = useAppContext();

  return (
    <Stack sx={{ minHeight: "100dvh" }}>
      <Header />
      <MainContent>
        <Outlet />
      </MainContent>
      {shouldShowSponsorBanner && <Sponsor />}
      <Footer />
    </Stack>
  );
}

const MainContent = styled.main`
  flex: 1;

  width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > * {
    flex-grow: 1;
  }
`;
