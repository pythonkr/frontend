import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button, Chip, Drawer, IconButton, Stack, styled } from "@mui/material";
import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { isEmpty } from "remeda";

import LanguageSelector from "@apps/pyconkr-2026/components/layout/LanguageSelector";
import { PythonKorea } from "@frontend/common/components";
import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";

import { HamburgerButton } from "./HamburgerButton";

type MenuType = NestedSiteMapSchema;

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  siteMapNode?: MenuType;
}

type NavigationLevel = "depth1" | "depth2" | "depth3";

interface NavigationState {
  level: NavigationLevel;
  depth1?: MenuType;
  depth2?: MenuType;
  breadcrumbs: { name: string; level: NavigationLevel }[];
}

export const MobileNavigation: FC<MobileNavigationProps> = ({ isOpen, onClose, siteMapNode }) => {
  const [navState, setNavState] = useState<NavigationState>({ level: "depth1", breadcrumbs: [] });

  const resetNavigation = () => setNavState({ level: "depth1", breadcrumbs: [] });

  const navigateToDepth2 = (depth1: MenuType) => {
    setNavState({ level: "depth2", depth1, breadcrumbs: [{ name: depth1.name, level: "depth1" }] });
  };

  const navigateToDepth3 = (depth2: MenuType) => {
    setNavState((prev) => ({
      ...prev,
      level: "depth3",
      depth2,
      breadcrumbs: [...prev.breadcrumbs, { name: depth2.name, level: "depth2" }],
    }));
  };

  const goBack = () => {
    if (navState.level === "depth3") {
      setNavState((prev) => ({ ...prev, level: "depth2", depth2: undefined, breadcrumbs: prev.breadcrumbs.slice(0, -1) }));
    } else if (navState.level === "depth2") {
      resetNavigation();
    }
  };

  const handleClose = () => {
    onClose();
    resetNavigation();
  };

  const renderDepth1Menu = () => {
    if (!siteMapNode) return null;
    return (
      <MenuContainer>
        {Object.values(siteMapNode.children)
          .filter((s) => !s.hide)
          .map((menu) => (
            <MenuItem key={menu.id}>
              {!isEmpty(menu.children) && Object.values(menu.children).some((c) => !c.hide) ? (
                <MenuButton onClick={() => navigateToDepth2(menu)}>{menu.name}</MenuButton>
              ) : (
                <MenuLink to={menu.route_code} onClick={handleClose}>
                  {menu.name}
                </MenuLink>
              )}
              {!isEmpty(menu.children) && Object.values(menu.children).some((c) => !c.hide) && (
                <MenuArrowButton onClick={() => navigateToDepth2(menu)}>
                  <ArrowForward fontSize="small" />
                </MenuArrowButton>
              )}
            </MenuItem>
          ))}
      </MenuContainer>
    );
  };

  const renderDepth2Menu = () => {
    if (!navState.depth1) return null;
    return (
      <NavigationMenuSection>
        <DepthHeader>
          <BackButton onClick={goBack}>
            <ArrowBack fontSize="small" />
          </BackButton>
          <DepthTitle>{navState.depth1.name}</DepthTitle>
        </DepthHeader>
        <DepthDivider />
        <DepthMenuList>
          {Object.values(navState.depth1.children)
            .filter((s) => !s.hide)
            .map((menu) => (
              <Depth2MenuItem key={menu.id}>
                <Link to={`${navState.depth1!.route_code}/${menu.route_code}`} onClick={handleClose} style={{ textDecoration: "none" }}>
                  <MenuChip label={menu.name} clickable />
                </Link>
                {!isEmpty(menu.children) && Object.values(menu.children).some((c) => !c.hide) && (
                  <MenuArrowButton onClick={() => navigateToDepth3(menu)}>
                    <ArrowForward fontSize="small" />
                  </MenuArrowButton>
                )}
              </Depth2MenuItem>
            ))}
        </DepthMenuList>
      </NavigationMenuSection>
    );
  };

  const renderDepth3Menu = () => {
    if (!navState.depth2) return null;
    return (
      <NavigationMenuSection>
        <DepthHeader>
          <BackButton onClick={goBack}>
            <ArrowBack fontSize="small" />
          </BackButton>
          <DepthTitle>{navState.depth2.name}</DepthTitle>
        </DepthHeader>
        <DepthDivider />
        <DepthMenuGrid>
          {Object.values(navState.depth2.children)
            .filter((s) => !s.hide)
            .map((menu) => (
              <Link
                key={menu.id}
                to={`${navState.depth1!.route_code}/${navState.depth2!.route_code}/${menu.route_code}`}
                onClick={handleClose}
                style={{ textDecoration: "none" }}
              >
                <MenuChip label={menu.name} clickable />
              </Link>
            ))}
        </DepthMenuGrid>
      </NavigationMenuSection>
    );
  };

  return (
    <StyledDrawer anchor="left" open={isOpen} onClose={handleClose}>
      <DrawerContent>
        <NavigationHeader>
          <HamburgerButton isOpen={true} onClick={handleClose} />
          <Link to="/" onClick={handleClose} style={{ textDecoration: "none" }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PythonKorea style={{ width: 28, height: 28 }} />
              <HeaderTitle>파이콘 한국 2026</HeaderTitle>
            </Stack>
          </Link>
        </NavigationHeader>

        <NavigationContent>
          {navState.level === "depth1" && renderDepth1Menu()}
          {navState.level === "depth2" && renderDepth2Menu()}
          {navState.level === "depth3" && renderDepth3Menu()}
        </NavigationContent>

        <Box sx={{ px: 2, py: 3, flexGrow: 0 }}>
          <LanguageSelector />
        </Box>
      </DrawerContent>
    </StyledDrawer>
  );
};

const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    width: "70vw",
    background: "rgba(18, 9, 30, 0.97)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#ededde",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderRight: "1px solid rgba(237, 94, 189, 0.2)",
  },
});

const DrawerContent = styled(Box)({ height: "100%", display: "flex", flexDirection: "column" });

const NavigationHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "23px 23px 10px 23px",
  gap: 17,
});

const HeaderTitle = styled("span")({
  color: "#ededde",
  fontSize: "16px",
  fontWeight: 600,
});

const NavigationContent = styled(Box)({ flex: 1, overflow: "auto" });

const MenuContainer = styled(Stack)({ padding: "20px 0", gap: "25px" });

const MenuItem = styled(Box)({ display: "flex", alignItems: "center", padding: "0 23px", gap: 23 });

const MenuLink = styled(Link)({
  color: "#ededde",
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 600,
});

const MenuButton = styled(Button)({
  color: "#ededde",
  textTransform: "none",
  fontSize: "20px",
  fontWeight: 600,
  padding: 0,
  minWidth: "auto",
  justifyContent: "flex-start",
});

const MenuArrowButton = styled(IconButton)({ color: "#ededde", padding: 8 });

const NavigationMenuSection = styled(Box)({ padding: "20px 0" });

const DepthHeader = styled(Box)({ display: "flex", alignItems: "center", padding: "0 23px 12px", gap: 8 });

const BackButton = styled(Button)({
  color: "#ed5ebd",
  textTransform: "none",
  padding: "0 15px 0 0",
  minWidth: "auto",
});

const DepthTitle = styled("span")({ color: "#ededde", fontSize: "18px", fontWeight: 700 });

const DepthDivider = styled("div")({
  margin: "0 23px 16px",
  height: 3,
  width: "3rem",
  borderRadius: 2,
  backgroundColor: "#f5c73d",
});

const DepthMenuList = styled(Stack)({ padding: "0 23px", gap: "12px" });

const Depth2MenuItem = styled(Box)({ display: "flex", alignItems: "center", gap: 8 });

const DepthMenuGrid = styled(Box)({ padding: "0 23px", display: "flex", flexWrap: "wrap", gap: "10px" });

const MenuChip = styled(Chip)({
  backgroundColor: "rgba(237, 94, 189, 0.15)",
  color: "#ededde",
  height: 40,
  borderRadius: 15,
  padding: "10px 4px",
  fontSize: "15px",
  fontWeight: 600,
  border: "1px solid rgba(237, 94, 189, 0.3)",
  "&:hover": { backgroundColor: "rgba(237, 94, 189, 0.3)" },
  "& .MuiChip-label": { padding: "0 10px" },
});
