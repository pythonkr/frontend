import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button, Chip, Drawer, IconButton, Stack, styled, Typography } from "@mui/material";
import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isEmpty } from "remeda";

import { SignInButton } from "@apps/pyconkr-2025/components/layout/SignInButton";
import { PythonKorea } from "@frontend/common/components";
import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";

import { HamburgerButton } from "./HamburgerButton";
import { MobileLanguageToggle } from "./MobileLanguageToggle";

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
  const location = useLocation();
  const [navState, setNavState] = useState<NavigationState>({
    level: "depth1",
    breadcrumbs: [],
  });

  const isMainPath = location.pathname === "/";

  const resetNavigation = () => {
    setNavState({
      level: "depth1",
      breadcrumbs: [],
    });
  };

  const navigateToDepth2 = (depth1: MenuType) => {
    setNavState({
      level: "depth2",
      depth1,
      breadcrumbs: [{ name: depth1.name, level: "depth1" }],
    });
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
      setNavState((prev) => ({
        ...prev,
        level: "depth2",
        depth2: undefined,
        breadcrumbs: prev.breadcrumbs.slice(0, -1),
      }));
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
            <MenuItem isMainPath={isMainPath} key={menu.id}>
              {!isEmpty(menu.children) && Object.values(menu.children).some((child) => !child.hide) ? (
                <MenuButton isMainPath={isMainPath} onClick={() => navigateToDepth2(menu)}>
                  {menu.name}
                </MenuButton>
              ) : (
                <MenuLink isMainPath={isMainPath} to={menu.route_code} onClick={handleClose}>
                  {menu.name}
                </MenuLink>
              )}
              {!isEmpty(menu.children) && Object.values(menu.children).some((child) => !child.hide) && (
                <MenuArrowButton isMainPath={isMainPath} onClick={() => navigateToDepth2(menu)}>
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
        <Depth2Header isMainPath={isMainPath}>
          <BackButton isMainPath={isMainPath} onClick={goBack}>
            <ArrowBack fontSize="small" />
          </BackButton>
          <Depth2Title isMainPath={isMainPath}>{navState.depth1.name}</Depth2Title>
        </Depth2Header>

        <Depth2Divider isMainPath={isMainPath} />

        <Depth2MenuList>
          {Object.values(navState.depth1.children)
            .filter((s) => !s.hide)
            .map((menu) => (
              <Depth2MenuItem key={menu.id}>
                <Link to={`${navState.depth1!.route_code}/${menu.route_code}`} onClick={handleClose} style={{ textDecoration: "none" }}>
                  <MenuChip isMainPath={isMainPath} label={menu.name} clickable />
                </Link>
                {!isEmpty(menu.children) && Object.values(menu.children).some((child) => !child.hide) && (
                  <MenuArrowButton isMainPath={isMainPath} onClick={() => navigateToDepth3(menu)}>
                    <ArrowForward fontSize="small" />
                  </MenuArrowButton>
                )}
              </Depth2MenuItem>
            ))}
        </Depth2MenuList>
      </NavigationMenuSection>
    );
  };

  const renderDepth3Menu = () => {
    if (!navState.depth2) return null;

    return (
      <NavigationMenuSection>
        <Depth2Header isMainPath={isMainPath}>
          <BackButton isMainPath={isMainPath} onClick={goBack}>
            <ArrowBack fontSize="small" />
          </BackButton>
          <Depth2Title isMainPath={isMainPath}>{navState.depth2.name}</Depth2Title>
        </Depth2Header>

        <Depth2Divider isMainPath={isMainPath} />

        <Depth3MenuGrid>
          {Object.values(navState.depth2.children)
            .filter((s) => !s.hide)
            .map((menu) => (
              <Link
                key={menu.id}
                to={`${navState.depth1!.route_code}/${navState.depth2!.route_code}/${menu.route_code}`}
                onClick={handleClose}
                style={{ textDecoration: "none" }}
              >
                <MenuChip isMainPath={isMainPath} label={menu.name} clickable />
              </Link>
            ))}
        </Depth3MenuGrid>
      </NavigationMenuSection>
    );
  };

  return (
    <StyledDrawer isMainPath={isMainPath} anchor="left" open={isOpen} onClose={handleClose}>
      <DrawerContent>
        <NavigationHeader isMainPath={isMainPath}>
          <HamburgerButton isOpen={true} onClick={handleClose} isMainPath={isMainPath} />

          <LogoAndTextContainer>
            <Link to="/" onClick={handleClose} style={{ textDecoration: "none" }}>
              <Stack direction="row" alignItems="center" spacing={0.375}>
                <PythonKorea style={{ width: 29, height: 29 }} />
                <HeaderTitle isMainPath={isMainPath}>파이콘 한국 2025</HeaderTitle>
              </Stack>
            </Link>
          </LogoAndTextContainer>
        </NavigationHeader>

        <NavigationContent>
          {navState.level === "depth1" && renderDepth1Menu()}
          {navState.level === "depth2" && renderDepth2Menu()}
          {navState.level === "depth3" && renderDepth3Menu()}
        </NavigationContent>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 4, flexGrow: 0, width: "100%" }}>
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <MobileLanguageToggle isMainPath={isMainPath} />
          </Stack>
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <SignInButton isMobile isMainPath={isMainPath} onClose={handleClose} />
          </Stack>
        </Stack>
      </DrawerContent>
    </StyledDrawer>
  );
};

const StyledDrawer = styled(Drawer)<{ isMainPath?: boolean }>(({ theme, isMainPath = true }) => ({
  "& .MuiDrawer-paper": {
    width: "70vw",
    background: isMainPath ? theme.palette.mobileNavigation.main.background : theme.palette.mobileNavigation.sub.background,
    backdropFilter: isMainPath ? "blur(10px)" : "none",
    WebkitBackdropFilter: isMainPath ? "blur(10px)" : "none",
    color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
}));

const DrawerContent = styled(Box)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

const NavigationHeader = styled(Box)<{ isMainPath: boolean }>({
  display: "flex",
  alignItems: "center",
  padding: "23px 23px 10px 23px",
  position: "relative",
  gap: 17,
});

const NavigationContent = styled(Box)({
  flex: 1,
  overflow: "auto",
});

const MenuContainer = styled(Stack)({
  padding: "20px 0",
  gap: "25px",
});

const MenuItem = styled(Box)<{ isMainPath?: boolean }>({
  display: "flex",
  alignItems: "center",
  padding: "0 23px",
  gap: 23,
});

const MenuLink = styled(Link)<{ isMainPath?: boolean }>(({ theme, isMainPath = true }) => ({
  color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
  textDecoration: "none",
  fontSize: "20px",
  fontWeight: 600,
}));

const MenuButton = styled(Button)<{ isMainPath?: boolean }>(({ theme, isMainPath = true }) => ({
  color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
  textTransform: "none",
  fontSize: "20px",
  fontWeight: 600,
  padding: 0,
  minWidth: "auto",
  minHeight: "auto",
  justifyContent: "flex-start",
}));

const MenuArrowButton = styled(IconButton)<{ isMainPath?: boolean }>(({ theme, isMainPath = true }) => ({
  color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
  padding: 8,
}));

const BackButton = styled(Button)<{ isMainPath?: boolean }>(({ theme, isMainPath = true }) => ({
  display: "flex",
  alignItems: "center",
  color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
  textTransform: "none",
  padding: "0 15px 0 0",
  minWidth: "auto",
  minHeight: "auto",
}));

const MenuChip = styled(Chip)<{ isMainPath?: boolean }>(({ theme, isMainPath = true }) => ({
  backgroundColor: isMainPath ? theme.palette.mobileNavigation.main.chip.background : theme.palette.mobileNavigation.sub.chip.background,
  color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
  height: 40,
  borderRadius: 15,
  padding: "10px 13px",
  fontSize: "16px",
  fontWeight: 600,

  "& .MuiChip-label": {
    padding: 0,
  },

  "&:hover": {
    backgroundColor: isMainPath ? theme.palette.mobileNavigation.main.chip.hover : theme.palette.mobileNavigation.sub.chip.hover,
  },
}));

const HeaderTitle = styled(Typography)<{ isMainPath: boolean }>(({ theme, isMainPath }) => ({
  color: isMainPath ? theme.palette.mobileHeader.main.text : theme.palette.mobileHeader.sub.text,
  fontSize: 18,
  fontWeight: 600,
}));

const LogoAndTextContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
});

const NavigationMenuSection = styled(Box)({
  padding: "20px 23px",
});

const Depth2Header = styled(Box)<{ isMainPath: boolean }>({
  display: "flex",
  alignItems: "center",
  height: "auto",
  marginBottom: 10,
});

const Depth2Title = styled(Typography)<{ isMainPath: boolean }>(({ theme, isMainPath }) => ({
  color: isMainPath ? theme.palette.mobileNavigation.main.text : theme.palette.mobileNavigation.sub.text,
  fontSize: 20,
  fontWeight: 800,
}));

const Depth2Divider = styled(Box)<{ isMainPath: boolean }>(({ theme, isMainPath }) => ({
  height: 1,
  backgroundColor: isMainPath ? theme.palette.mobileNavigation.main.divider : theme.palette.mobileNavigation.sub.divider,
  marginBottom: 21,
}));

const Depth2MenuList = styled(Stack)({
  gap: 15,
});

const Depth2MenuItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
});

const Depth3MenuGrid = styled(Box)({
  height: 260,
  display: "flex",
  flexDirection: "column",
  flexWrap: "wrap",
  alignContent: "flex-start",
  gap: 15,
  overflow: "hidden",
});
