import { Components } from "@frontend/common";
import { ArrowForwardIos, Close, Menu as MenuIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";
import * as React from "react";
import { Link } from "react-router-dom";
import * as R from "remeda";

import { NestedSiteMapSchema } from "../../../../../../packages/common/src/schemas/backendAPI";
import { LOCAL_STORAGE_LANGUAGE_KEY } from "../../../consts/local_storage";
import { useAppContext } from "../../../contexts/app_context";

type MenuType = NestedSiteMapSchema;
type MenuOrUndefinedType = MenuType | undefined;

type NavigationStateType = {
  depth1?: MenuType;
  depth2?: MenuType;
  depth3?: MenuType;
};

const HeaderHeight: React.CSSProperties["height"] = "3.625rem";
const BreadCrumbHeight: React.CSSProperties["height"] = "4.5rem";

// ── 언어 토글 ──────────────────────────────────────────────
const LanguageToggle: React.FC = () => {
  const { language, setAppContext } = useAppContext();

  const handleToggle = () => {
    const next = language === "ko" ? "en" : "ko";
    localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, next);
    setAppContext((ps) => ({ ...ps, language: next }));
  };

  return (
    <Button
      onClick={handleToggle}
      sx={{
        minWidth: 0,
        px: 1,
        color: "text.secondary",
        fontWeight: 300,
        fontSize: "0.8rem",
        "&:hover": { color: "primary.main" },
      }}
    >
      {language === "ko" ? "EN" : "KO"}
    </Button>
  );
};

// ── 모바일 헤더 ──────────────────────────────────────────────
const MobileNav: React.FC = () => {
  const { siteMapNode } = useAppContext();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <MobileHeaderBar>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Components.PythonKorea style={{ width: 30, height: 30 }} />
          <MobileLogoText>PyCon Korea 2026</MobileLogoText>
        </Link>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <LanguageToggle />
          <IconButton onClick={() => setOpen(true)} sx={{ color: "primary.main" }} aria-label="메뉴 열기">
            <MenuIcon />
          </IconButton>
        </Stack>
      </MobileHeaderBar>

      {/* 헤더 높이만큼 spacer */}
      <Box sx={{ height: HeaderHeight }} />

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: "80vw",
            maxWidth: "320px",
            bgcolor: "background.paper",
            borderLeft: "1px solid",
            borderLeftColor: "divider",
          },
        }}
      >
        <Stack sx={{ p: 2 }} direction="row" justifyContent="space-between" alignItems="center">
          <Link to="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Components.PythonKorea style={{ width: 28, height: 28 }} />
            <MobileLogoText>PyCon KR 2026</MobileLogoText>
          </Link>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "primary.main" }} aria-label="메뉴 닫기">
            <Close />
          </IconButton>
        </Stack>

        <Divider sx={{ borderColor: "divider" }} />

        <List dense>
          {siteMapNode?.children
            .filter((s) => !s.hide)
            .map((r) => (
              <ListItemButton
                key={r.id}
                component={Link}
                to={r.external_link || r.route_code}
                onClick={() => setOpen(false)}
                target={R.isString(r.external_link) ? "_blank" : undefined}
                rel={R.isString(r.external_link) ? "noopener noreferrer" : undefined}
                sx={{
                  color: "text.primary",
                  "&:hover": { color: "primary.main", bgcolor: "rgba(237,94,189,0.08)" },
                }}
              >
                <ListItemText primary={r.name} slotProps={{ primary: { fontWeight: 500 } }} />
              </ListItemButton>
            ))}
        </List>
      </Drawer>
    </>
  );
};

// ── 데스크탑 헤더 ──────────────────────────────────────────────
const Header: React.FC = () => {
  const { title, language, siteMapNode, currentSiteMapDepth, shouldShowTitleBanner } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [navState, setNavState] = React.useState<NavigationStateType>({});

  const resetDepths = () => setNavState({});
  const setDepth1 = (depth1: MenuOrUndefinedType) => setNavState({ depth1 });
  const setDepth2 = (depth2: MenuOrUndefinedType) => setNavState((ps) => ({ ...ps, depth2, depth3: undefined }));
  const setDepth3 = (depth3: MenuOrUndefinedType) => setNavState((ps) => ({ ...ps, depth3 }));

  const getDepth2Route = (nextRoute?: string) => (navState.depth1?.route_code || "") + `/${nextRoute || ""}`;
  const getDepth3Route = (nextRoute?: string) => getDepth2Route(navState.depth2?.route_code) + `/${nextRoute || ""}`;

  React.useEffect(resetDepths, [language]);

  if (isMobile) return <MobileNav />;

  let breadCrumbRoute = "";
  let breadCrumbArray = currentSiteMapDepth.slice(1, -1);
  if (R.isEmpty(breadCrumbArray)) breadCrumbArray = currentSiteMapDepth.slice(0, -1);

  return (
    <Box sx={{ position: "relative" }} onMouseLeave={resetDepths}>
      <HeaderContainer>
        {/* 로고 */}
        <NavSideElementContainer>
          <Link to="/" onClick={resetDepths} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <Components.PythonKorea style={{ width: 36, height: 36 }} />
            <LogoText>PyCon Korea 2026</LogoText>
          </Link>
        </NavSideElementContainer>

        {/* 1depth 네비게이션 */}
        {siteMapNode ? (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            {siteMapNode.children
              .filter((s) => !s.hide)
              .map((r) => (
                <Link
                  key={r.id}
                  onClick={resetDepths}
                  target={R.isString(r.external_link) ? "_blank" : undefined}
                  rel={R.isString(r.external_link) ? "noopener noreferrer" : undefined}
                  to={r.external_link || r.route_code}
                >
                  <NavButton onMouseEnter={() => setDepth1(r)}>{r.name}</NavButton>
                </Link>
              ))}
          </Stack>
        ) : (
          <CircularProgress size={22} sx={{ color: "primary.main" }} />
        )}

        {/* 우측 언어 토글 */}
        <NavSideElementContainer sx={{ justifyContent: "flex-end" }}>
          <LanguageToggle />
        </NavSideElementContainer>

        {/* 2~3depth 드롭다운 */}
        {navState.depth1 && (
          <NavDropdownOuter>
            <NavDropdownInner>
              <Typography variant="h1" sx={{ fontSize: "1.5rem", fontWeight: 700, color: "primary.main" }}>
                {navState.depth1.name}
              </Typography>
              <HighlightDivider flexItem />
              <Stack direction="row" spacing={4}>
                <Stack spacing={1.25}>
                  {navState.depth1.children
                    .filter((s) => !s.hide)
                    .map((r) => (
                      <Depth2Item
                        key={r.id}
                        className={r.id === navState.depth2?.id ? "active" : ""}
                        onClick={resetDepths}
                        onMouseEnter={() => setDepth2(r)}
                        onMouseLeave={() => R.isEmpty(navState.depth2?.children ?? {}) && setDepth2(undefined)}
                        target={R.isString(r.external_link) ? "_blank" : undefined}
                        rel={R.isString(r.external_link) ? "noopener noreferrer" : undefined}
                        to={r.external_link || getDepth2Route(r.route_code)}
                        children={r.name}
                      />
                    ))}
                </Stack>

                {navState.depth2 && !R.isEmpty(navState.depth2.children) && (
                  <>
                    <Depth2to3Divider orientation="vertical" flexItem />
                    <Stack spacing={1.5}>
                      {navState.depth2.children
                        .filter((s) => !s.hide)
                        .map((r) => (
                          <Depth3Item
                            key={r.id}
                            className={r.id === navState.depth3?.id ? "active" : ""}
                            onClick={resetDepths}
                            onMouseEnter={() => setDepth3(r)}
                            onMouseLeave={() => setDepth3(undefined)}
                            target={R.isString(r.external_link) ? "_blank" : undefined}
                            rel={R.isString(r.external_link) ? "noopener noreferrer" : undefined}
                            to={r.external_link || getDepth3Route(r?.route_code)}
                            children={r.name}
                          />
                        ))}
                    </Stack>
                  </>
                )}
              </Stack>
            </NavDropdownInner>
          </NavDropdownOuter>
        )}
      </HeaderContainer>

      {/* 브레드크럼 + 페이지 타이틀 배너 */}
      {shouldShowTitleBanner && (
        <>
          <BreadCrumbContainer>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {breadCrumbArray
                .filter((routeInfo) => R.isNonNullish(routeInfo))
                .map(({ route_code, name }, index) => {
                  breadCrumbRoute += `${route_code}/`;
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && <ArrowForwardIos sx={{ fontSize: "0.625rem", color: "text.disabled" }} />}
                      <Link to={breadCrumbRoute} style={{ fontSize: "0.75rem", color: "#9985ad" }}>
                        {name}
                      </Link>
                    </React.Fragment>
                  );
                })}
            </Stack>
            <Typography variant="h1" sx={{ fontSize: "1.625rem", fontWeight: 700, color: "text.primary" }}>
              {title}
            </Typography>
          </BreadCrumbContainer>
          {/* fixed 헤더 + 브레드크럼 높이만큼 spacer */}
          <Box sx={{ height: `calc(${HeaderHeight} + ${BreadCrumbHeight})` }} />
        </>
      )}
    </Box>
  );
};

// ── Styled Components ──────────────────────────────────────────────

const ResponsivePadding = ({ theme }: MUIStyledCommonProps) => ({
  paddingRight: theme!.spacing(16),
  paddingLeft: theme!.spacing(16),
  [theme!.breakpoints.down("lg")]: {
    paddingRight: theme!.spacing(4),
    paddingLeft: theme!.spacing(4),
  },
  [theme!.breakpoints.down("sm")]: {
    paddingRight: theme!.spacing(2),
    paddingLeft: theme!.spacing(2),
  },
});

const HeaderContainer = styled("header")(({ theme }) => ({
  position: "fixed",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  height: HeaderHeight,

  backgroundColor: "rgba(18, 9, 30, 0.85)",
  backdropFilter: "blur(12px)",
  borderBottom: `1px solid rgba(237, 94, 189, 0.2)`,
  color: theme.palette.text.primary,
  fontWeight: 500,
  zIndex: theme.zIndex.appBar,
  transition: "background-color 0.3s ease-in-out",

  ...ResponsivePadding({ theme }),
}));

const MobileHeaderBar = styled("header")(({ theme }) => ({
  position: "fixed",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  height: HeaderHeight,
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),

  backgroundColor: "rgba(18, 9, 30, 0.92)",
  backdropFilter: "blur(12px)",
  borderBottom: `1px solid rgba(237, 94, 189, 0.2)`,
  zIndex: theme.zIndex.appBar,
}));

const NavSideElementContainer = styled(Stack)({
  flexGrow: 1,
  flexBasis: 0,
});

const LogoText = styled("span")(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1rem",
  color: theme.palette.primary.main,
  letterSpacing: "-0.02em",
}));

const MobileLogoText = styled("span")(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.9rem",
  color: theme.palette.primary.main,
}));

const NavButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  textTransform: "none",
  fontWeight: 400,
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  padding: "0.25rem 0.75rem",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: "rgba(237, 94, 189, 0.08)",
  },
}));

const NavDropdownOuter = styled(Stack)(({ theme }) => ({
  width: "100vw",
  position: "fixed",
  left: 0,
  top: HeaderHeight,
  zIndex: theme.zIndex.appBar + 1,

  backgroundColor: "rgba(18, 9, 30, 0.95)",
  backdropFilter: "blur(16px)",
  borderBottom: `1px solid rgba(237, 94, 189, 0.15)`,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",

  fontSize: "0.875rem",
  color: theme.palette.text.primary,
}));

const NavDropdownInner = styled(Stack)(({ theme }) => ({
  width: "100%",
  minHeight: "10rem",
  overflowY: "auto",
  gap: "1rem",
  paddingTop: "1.5rem",
  paddingBottom: "2rem",
  ...ResponsivePadding({ theme }),
}));

// 황금 노랑 구분선 — highlight.main 사용
const HighlightDivider = styled(Divider)(({ theme }) => ({
  width: "3.375rem",
  borderBottom: `4px solid ${theme.palette.highlight.main}`,
}));

const Depth2Item = styled(Link)(({ theme }) => ({
  fontWeight: 300,
  textDecoration: "none",
  color: theme.palette.text.primary,
  width: "fit-content",
  borderBottom: "2px solid transparent",
  transition: "color 0.15s, border-color 0.15s",

  "&:hover": {
    color: theme.palette.primary.light,
  },
  "&.active": {
    fontWeight: 700,
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
}));

const Depth2to3Divider = styled(Divider)({
  borderColor: "rgba(237, 94, 189, 0.2)",
});

const Depth3Item = styled(Depth2Item)({ fontSize: "0.75rem" });

const BreadCrumbContainer = styled(Stack)(({ theme }) => ({
  position: "fixed",
  top: HeaderHeight,
  width: "100%",
  height: BreadCrumbHeight,

  background: "linear-gradient(rgba(18, 9, 30, 0.8), rgba(18, 9, 30, 0.6))",
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid rgba(237, 94, 189, 0.1)`,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.3)",

  gap: "0.25rem",
  justifyContent: "center",
  alignItems: "flex-start",
  zIndex: theme.zIndex.appBar - 1,

  ...ResponsivePadding({ theme }),

  "& a": {
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
}));

export default Header;
