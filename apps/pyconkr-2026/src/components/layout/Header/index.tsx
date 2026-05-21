import { ArrowForwardIos } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Stack, styled, SxProps, Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";
import { CSSProperties, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { isEmpty, isNonNullish, isString } from "remeda";

import LanguageSelector from "@apps/pyconkr-2026/components/layout/LanguageSelector";
import { useAppContext } from "@apps/pyconkr-2026/contexts/app_context";
import { PythonKorea } from "@frontend/common/components";
import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";

import { MobileHeader } from "./Mobile/MobileHeader";

type MenuType = NestedSiteMapSchema;
type MenuOrUndefinedType = MenuType | undefined;

type NavigationStateType = {
  depth1?: MenuType;
  depth2?: MenuType;
  depth3?: MenuType;
};

const HeaderHeight: CSSProperties["height"] = "3.625rem";
const BreadCrumbHeight: CSSProperties["height"] = "4.5rem";
const MaxContentWidth: CSSProperties["maxWidth"] = "1366px";

export default function Header() {
  const { title, language, siteMapNode, currentSiteMapDepth, shouldShowTitleBanner } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [navState, setNavState] = useState<NavigationStateType>({});

  const resetDepths = () => setNavState({});
  const setDepth1 = (depth1: MenuOrUndefinedType) => setNavState({ depth1 });
  const setDepth2 = (depth2: MenuOrUndefinedType) => setNavState((ps) => ({ ...ps, depth2, depth3: undefined }));
  const setDepth3 = (depth3: MenuOrUndefinedType) => setNavState((ps) => ({ ...ps, depth3 }));

  const getDepth2Route = (nextRoute?: string) => (navState.depth1?.route_code || "") + `/${nextRoute || ""}`;
  const getDepth3Route = (nextRoute?: string) => getDepth2Route(navState.depth2?.route_code) + `/${nextRoute || ""}`;

  // 언어 변경 시 navState 초기화 (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [prevLanguage, setPrevLanguage] = useState(language);
  if (prevLanguage !== language) {
    setPrevLanguage(language);
    setNavState({});
  }

  if (isMobile) return <MobileHeader />;

  const initialBreadCrumbArray = currentSiteMapDepth.slice(1, -1);
  const breadCrumbArray = isEmpty(initialBreadCrumbArray) ? currentSiteMapDepth.slice(0, -1) : initialBreadCrumbArray;

  const headerStyle: SxProps<Theme> = shouldShowTitleBanner ? {} : { backgroundColor: "transparent" };

  return (
    <Box
      sx={{
        position: "relative",
        "&:has(.nav-dropdown:hover) .header-title-text": { opacity: 1 },
      }}
      onMouseLeave={resetDepths}
    >
      <HeaderContainer sx={headerStyle}>
        <HeaderInner>
          <NavSideElementContainer>
            <Link to="/" onClick={resetDepths}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <PythonKorea style={{ width: 36, height: 36 }} />
                <Typography className="header-title-text" sx={{ color: "#ededde", fontWeight: 600, fontSize: "1rem" }}>
                  PyCon Korea 2026
                </Typography>
              </Stack>
            </Link>
          </NavSideElementContainer>

          {siteMapNode ? (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
              {Object.values(siteMapNode.children)
                .filter((s) => !s.hide)
                .map((r) => (
                  <Link
                    key={r.id}
                    onClick={resetDepths}
                    target={isString(r.external_link) ? "_blank" : undefined}
                    rel={isString(r.external_link) ? "noopener noreferrer" : undefined}
                    to={r.external_link || r.route_code}
                  >
                    <NavButton onMouseEnter={() => setDepth1(r)} isActive={navState.depth1?.id === r.id}>
                      {r.name}
                    </NavButton>
                  </Link>
                ))}
            </Stack>
          ) : (
            <CircularProgress size={24} sx={{ color: "#ed5ebd" }} />
          )}

          <NavSideElementContainer sx={{ justifyContent: "flex-end" }}>
            <LanguageSelector />
          </NavSideElementContainer>
        </HeaderInner>
      </HeaderContainer>

      {navState.depth1 && (
        <NavDropdownOuter className="nav-dropdown">
          <NavDropdownInner>
            <Typography variant="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#ededde" }}>
              {navState.depth1.name}
            </Typography>
            <HighlightDivider flexItem />
            <Stack direction="row" spacing={4}>
              <Stack spacing={1.25}>
                {Object.values(navState.depth1.children)
                  .filter((s) => !s.hide)
                  .map((r) => (
                    <Depth2Item
                      key={r.id}
                      className={r.id === navState.depth2?.id ? "active" : ""}
                      onClick={resetDepths}
                      onMouseEnter={() => setDepth2(r)}
                      onMouseLeave={() => isEmpty(navState.depth2?.children ?? {}) && setDepth2(undefined)}
                      target={isString(r.external_link) ? "_blank" : undefined}
                      rel={isString(r.external_link) ? "noopener noreferrer" : undefined}
                      to={r.external_link || getDepth2Route(r.route_code)}
                    >
                      {r.name}
                    </Depth2Item>
                  ))}
              </Stack>

              {navState.depth2 && !isEmpty(navState.depth2.children) && (
                <>
                  <Depth2to3Divider orientation="vertical" flexItem />
                  <Stack spacing={1.5}>
                    {Object.values(navState.depth2.children)
                      .filter((s) => !s.hide)
                      .map((r) => (
                        <Depth3Item
                          key={r.id}
                          className={r.id === navState.depth3?.id ? "active" : ""}
                          onClick={resetDepths}
                          onMouseEnter={() => setDepth3(r)}
                          onMouseLeave={() => setDepth3(undefined)}
                          target={isString(r.external_link) ? "_blank" : undefined}
                          rel={isString(r.external_link) ? "noopener noreferrer" : undefined}
                          to={r.external_link || getDepth3Route(r?.route_code)}
                        >
                          {r.name}
                        </Depth3Item>
                      ))}
                  </Stack>
                </>
              )}
            </Stack>
          </NavDropdownInner>
        </NavDropdownOuter>
      )}

      {shouldShowTitleBanner && (
        <>
          <BreadCrumbContainer>
            <BreadCrumbInner>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {breadCrumbArray
                  .filter((routeInfo) => isNonNullish(routeInfo))
                  .map(({ name }, index, arr) => {
                    const breadCrumbRoute =
                      arr
                        .slice(0, index + 1)
                        .map((r) => r.route_code)
                        .join("/") + "/";
                    return (
                      <Fragment key={index}>
                        {index > 0 && <ArrowForwardIos sx={{ fontSize: "0.75rem", color: "rgba(237,94,189,0.6)" }} />}
                        <Link to={breadCrumbRoute} children={name} />
                      </Fragment>
                    );
                  })}
              </Stack>
              <Typography variant="h1" sx={{ fontSize: "1.625rem", fontWeight: 700, color: "#ededde" }}>
                {title}
              </Typography>
            </BreadCrumbInner>
          </BreadCrumbContainer>
          <Box sx={{ height: `calc(${HeaderHeight} + ${BreadCrumbHeight})` }} />
        </>
      )}
    </Box>
  );
}

const ResponsivePadding = ({ theme }: MUIStyledCommonProps) => ({
  paddingRight: theme!.spacing(16),
  paddingLeft: theme!.spacing(16),
  [theme!.breakpoints.down("lg")]: { paddingRight: theme!.spacing(4), paddingLeft: theme!.spacing(4) },
  [theme!.breakpoints.down("sm")]: { paddingRight: theme!.spacing(2), paddingLeft: theme!.spacing(2) },
});

const HeaderContainer = styled("header")(({ theme }) => ({
  position: "fixed",
  width: "100%",
  height: HeaderHeight,
  backgroundColor: "rgba(18, 9, 30, 0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(237, 94, 189, 0.2)",
  color: "#ededde",
  fontWeight: 500,
  zIndex: theme.zIndex.appBar,
  transition: "background-color 0.3s ease-in-out",
  "& .header-title-text": {
    // TODO: FIXME: HeaderInner의 좌측 정렬 모드를 중앙 정렬("1fr auto 1fr")로 되돌릴 때 opacity를 다시 0으로 변경할 것 (hover 시에만 노출되는 원래 동작 복귀)
    opacity: 1,
    transition: "opacity 0.2s ease",
  },
  "&:hover .header-title-text": {
    opacity: 1,
  },
}));

const HeaderInner = styled("div")(({ theme }) => ({
  display: "grid",
  // TODO: FIXME: sitemap 항목이 충분히 등록되면 gridTemplateColumns를 "1fr auto 1fr"로 되돌려 중앙 정렬로 복귀하고, columnGap도 제거할 것
  gridTemplateColumns: "auto auto 1fr",
  columnGap: theme.spacing(2),
  alignItems: "center",
  width: "100%",
  height: "100%",
  maxWidth: MaxContentWidth,
  marginInline: "auto",
  ...ResponsivePadding({ theme }),
}));

const NavButton = styled(Button)<{ isActive?: boolean }>(({ isActive }) => ({
  color: isActive ? "#ed5ebd" : "#ededde",
  minWidth: 0,
  textTransform: "none",
  fontSize: "0.9rem",
  fontWeight: isActive ? 700 : 400,
  transition: "color 0.2s ease",
  "&:hover": { color: "#ed5ebd", backgroundColor: "transparent" },
}));

const NavSideElementContainer = styled(Stack)({
  flexDirection: "row",
  alignItems: "center",
});

const NavDropdownOuter = styled(Stack)(({ theme }) => ({
  width: "100vw",
  position: "fixed",
  left: 0,
  top: HeaderHeight,
  zIndex: theme.zIndex.appBar + 1,
  backgroundColor: "rgba(18, 9, 30, 0.95)",
  boxShadow: "0 5px 20px rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(237, 94, 189, 0.2)",
}));

const NavDropdownInner = styled(Stack)(({ theme }) => ({
  width: "100%",
  maxWidth: MaxContentWidth,
  marginInline: "auto",
  minHeight: "10rem",
  overflowY: "auto",
  gap: "1rem",
  paddingTop: "1.5rem",
  paddingBottom: "2rem",
  color: "#ededde",
  ...ResponsivePadding({ theme }),
}));

const HighlightDivider = styled(Divider)({
  width: "3rem",
  borderBottom: "4px solid #f5c73d",
  borderColor: "#f5c73d",
});

const Depth2Item = styled(Link)({
  color: "#ededde",
  fontWeight: 300,
  textDecoration: "none",
  width: "fit-content",
  borderBottom: "2px solid transparent",
  transition: "color 0.15s ease",
  "&.active": { fontWeight: 700, borderBottom: "2px solid #ed5ebd", color: "#ed5ebd" },
  "&:hover": { color: "#ed5ebd" },
});

const Depth2to3Divider = styled(Divider)({ borderColor: "rgba(237, 94, 189, 0.3)" });

const Depth3Item = styled(Depth2Item)({ fontSize: "0.75rem" });

const BreadCrumbContainer = styled("div")(({ theme }) => ({
  position: "fixed",
  top: HeaderHeight,
  width: "100%",
  height: BreadCrumbHeight,
  background: "rgba(18, 9, 30, 0.8)",
  boxShadow: "0 1px 10px rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(237, 94, 189, 0.15)",
  zIndex: theme.zIndex.appBar - 1,
}));

const BreadCrumbInner = styled(Stack)(({ theme }) => ({
  width: "100%",
  height: "100%",
  maxWidth: MaxContentWidth,
  marginInline: "auto",
  gap: "0.25rem",
  justifyContent: "center",
  alignItems: "flex-start",
  ...ResponsivePadding({ theme }),
  "& a": {
    color: "#f5c73d",
    fontWeight: 300,
    fontSize: "0.75rem",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
}));
