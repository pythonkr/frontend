import { Box, Stack, styled, Typography } from "@mui/material";
import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";
import { PythonKorea } from "@frontend/common/components";

import { HamburgerButton } from "./HamburgerButton";
import { MobileLanguageToggle } from "./MobileLanguageToggle";
import { MobileNavigation } from "./MobileNavigation";

interface MobileHeaderProps {
  isNavigationOpen?: boolean;
  onToggleNavigation?: () => void;
}

export const MobileHeader: FC<MobileHeaderProps> = ({ isNavigationOpen = false, onToggleNavigation }) => {
  const { siteMapNode } = useAppContext();
  const location = useLocation();
  const [internalNavigationOpen, setInternalNavigationOpen] = useState(false);

  const navigationOpen = onToggleNavigation ? isNavigationOpen : internalNavigationOpen;
  const toggleNavigation = onToggleNavigation || (() => setInternalNavigationOpen(!internalNavigationOpen));

  const isMainPath = location.pathname === "/";

  return (
    <>
      <MobileHeaderContainer isOpen={navigationOpen} isMainPath={isMainPath}>
        <LeftContent>
          <HamburgerButton isOpen={navigationOpen} onClick={toggleNavigation} isMainPath={isMainPath} />
          <LogoAndTextContainer>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Stack direction="row" alignItems="center" spacing={0.375}>
                <PythonKorea style={{ width: 29, height: 29 }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: isMainPath ? "white" : "rgba(18, 109, 127, 0.6)",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  파이콘 한국 2025
                </Typography>
              </Stack>
            </Link>
          </LogoAndTextContainer>
        </LeftContent>

        <MobileLanguageToggle isMainPath={isMainPath} />
      </MobileHeaderContainer>

      <MobileNavigation isOpen={navigationOpen} onClose={() => toggleNavigation()} siteMapNode={siteMapNode} />
    </>
  );
};

const MobileHeaderContainer = styled("header")<{ isOpen: boolean; isMainPath: boolean }>(({ theme, isOpen, isMainPath }) => ({
  position: isMainPath ? "fixed" : "sticky",
  top: 0,
  left: 0,
  right: 0,

  display: isOpen ? "none" : "flex",
  alignItems: "center",
  justifyContent: "space-between",

  width: "100%",
  height: 60,

  padding: "15px 23px",

  backgroundColor: isMainPath ? "rgba(182, 216, 215, 0.1)" : "#B6D8D7",
  backdropFilter: isMainPath ? "blur(8px)" : "none",
  WebkitBackdropFilter: isMainPath ? "blur(8px)" : "none",
  color: isMainPath ? "white" : "rgba(18, 109, 127, 0.6)",

  zIndex: isMainPath ? theme.zIndex.appBar + 100000 : theme.zIndex.appBar,
}));

const LeftContent = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 17,
});

const LogoAndTextContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
});
