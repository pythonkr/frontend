import { Box, Stack, styled, Typography } from "@mui/material";
import { FC, useState } from "react";
import { Link } from "react-router-dom";

import LanguageSelector from "@apps/pyconkr-2026/components/layout/LanguageSelector";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";

import { HamburgerButton } from "./HamburgerButton";
import { MobileNavigation } from "./MobileNavigation";
import { PyConLogo } from "@apps/pyconkr-2026/components/pycon_logo";

export const MobileHeader: FC = () => {
  const { siteMapNode } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MobileHeaderContainer isOpen={isOpen}>
        <LeftContent>
          <HamburgerButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          <Link to="/" style={{ textDecoration: "none" }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <PyConLogo style={{ width: 28, height: 28 }} />
              <Typography variant="h6" sx={{ color: "#ededde", fontSize: 17, fontWeight: 600 }}>
                PyCon Korea 2026
              </Typography>
            </Stack>
          </Link>
        </LeftContent>
        <LanguageSelector />
      </MobileHeaderContainer>

      <MobileNavigation isOpen={isOpen} onClose={() => setIsOpen(false)} siteMapNode={siteMapNode} />
    </>
  );
};

const MobileHeaderContainer = styled("header")<{ isOpen: boolean }>(({ theme, isOpen }) => ({
  display: isOpen ? "none" : "flex",
  alignItems: "center",
  justifyContent: "space-between",

  position: "sticky",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  height: 60,
  padding: "15px 20px",

  backgroundColor: "rgba(18, 9, 30, 0.9)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(237, 94, 189, 0.2)",

  zIndex: theme.zIndex.appBar,
}));

const LeftContent = styled(Box)({ display: "flex", alignItems: "center", gap: 17 });
