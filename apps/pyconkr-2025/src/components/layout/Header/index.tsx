import { PythonKorea } from "@frontend/common/components";
import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";
import { ArrowForwardIos } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, Stack, styled, SxProps, Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";
import { CSSProperties, Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isEmpty, isNonNullish, isString } from "remeda";

import { CartBadgeButton } from "@apps/pyconkr-2025/components/layout/CartBadgeButton";
import LanguageSelector from "@apps/pyconkr-2025/components/layout/LanguageSelector";
import { SignInButton } from "@apps/pyconkr-2025/components/layout/SignInButton";
import { useAppContext } from "@apps/pyconkr-2025/contexts/app_context";

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

  useEffect(resetDepths, [language]);

  if (isMobile) {
    return <MobileHeader />;
  }

  let breadCrumbRoute = "";
  let breadCrumbArray = currentSiteMapDepth.slice(1, -1);
  if (isEmpty(breadCrumbArray)) breadCrumbArray = currentSiteMapDepth.slice(0, -1);

  const headerContainerStyle: SxProps<Theme> = shouldShowTitleBanner
    ? {}
    : {
        backgroundColor: "transparent",
        [":hover"]: { backgroundColor: (theme) => theme.palette.primary.light },
      };

  return (
    <Box sx={{ position: "relative" }} onMouseLeave={resetDepths}>
      <HeaderContainer sx={headerContainerStyle}>
        <NavSideElementContainer>
          <Link to="/" onClick={resetDepths} style={{ marginRight: "auto" }}>
            <Stack justifyContent="center" alignItems="center">
              <PythonKorea style={{ width: 40, height: 40 }} />
            </Stack>
          </Link>
        </NavSideElementContainer>
        {siteMapNode ? (
          <>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
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
                    <Button key={r.id} onMouseEnter={() => setDepth1(r)} sx={{ minWidth: 0, textTransform: "none" }}>
                      {r.name}
                    </Button>
                  </Link>
                ))}
            </Stack>

            {navState.depth1 && (
              <NavOuterContainer>
                <NavInnerContainer>
                  <Typography variant="h1" sx={{ fontSize: "1.75rem", fontWeight: 700 }}>
                    {navState.depth1.name}
                  </Typography>
                  <Depth1to2Divider flexItem />
                  <Stack direction="row" spacing={4}>
                    <Stack spacing={1.25}>
                      {Object.values(navState.depth1.children)
                        .filter((s) => !s.hide)
                        .map((r) => (
                          <Depth2Item
                            children={r.name}
                            className={r.id === navState.depth2?.id ? "active" : ""}
                            key={r.id}
                            onClick={resetDepths}
                            onMouseEnter={() => setDepth2(r)}
                            onMouseLeave={() => isEmpty(navState.depth2?.children ?? {}) && setDepth2(undefined)}
                            target={isString(r.external_link) ? "_blank" : undefined}
                            rel={isString(r.external_link) ? "noopener noreferrer" : undefined}
                            to={r.external_link || getDepth2Route(r.route_code)}
                          />
                        ))}
                    </Stack>

                    {navState.depth2 && !isEmpty(navState.depth2.children) && (
                      <>
                        {!isEmpty(navState.depth2.children) && <Depth2to3Divider orientation="vertical" flexItem />}

                        <Stack spacing={1.5}>
                          {Object.values(navState.depth2.children)
                            .filter((s) => !s.hide)
                            .map((r) => (
                              <Depth3Item
                                children={r.name}
                                className={r.id === navState.depth3?.id ? "active" : ""}
                                key={r.id}
                                onClick={resetDepths}
                                onMouseEnter={() => setDepth3(r)}
                                onMouseLeave={() => setDepth3(undefined)}
                                target={isString(r.external_link) ? "_blank" : undefined}
                                rel={isString(r.external_link) ? "noopener noreferrer" : undefined}
                                to={r.external_link || getDepth3Route(r?.route_code)}
                              />
                            ))}
                        </Stack>
                      </>
                    )}
                  </Stack>
                </NavInnerContainer>
              </NavOuterContainer>
            )}
          </>
        ) : (
          <CircularProgress />
        )}
        <NavSideElementContainer>
          <Stack direction="row" alignItems="center" gap={1} sx={{ marginLeft: "auto" }}>
            <LanguageSelector />
            <CartBadgeButton />
            <SignInButton />
          </Stack>
        </NavSideElementContainer>
      </HeaderContainer>
      {shouldShowTitleBanner && (
        <>
          <BreadCrumbContainer>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {breadCrumbArray
                .filter((routeInfo) => isNonNullish(routeInfo))
                .map(({ route_code, name }, index) => {
                  breadCrumbRoute += `${route_code}/`;
                  return (
                    <Fragment key={index}>
                      {index > 0 && <ArrowForwardIos sx={{ fontSize: "0.75rem" }} />}
                      <Link to={breadCrumbRoute} children={name} />
                    </Fragment>
                  );
                })}
            </Stack>
            <Typography variant="h1" sx={{ fontSize: "1.625rem", fontWeight: 700 }}>
              {title}
            </Typography>
          </BreadCrumbContainer>
          {/* Spacer for fixed header */}
          <Box sx={{ height: `calc(${HeaderHeight} + ${BreadCrumbHeight})` }} />
        </>
      )}
    </Box>
  );
}

const ResponsivePaddingDefinition = ({ theme }: MUIStyledCommonProps) => ({
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
  minWidth: "100%",
  maxWidth: "100%",
  height: HeaderHeight,

  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.dark,

  fontWeight: 500,

  zIndex: theme.zIndex.appBar,
  transition: "background-color 0.3s ease-in-out",

  ...ResponsivePaddingDefinition({ theme }),
}));

const NavOuterContainer = styled(Stack)(({ theme }) => ({
  width: "100vw",

  position: "fixed",
  left: 0,
  top: HeaderHeight,

  zIndex: theme.zIndex.appBar + 1,

  backgroundColor: "rgba(255, 255, 255, 0.7)",
  boxShadow: "0 5px 5px 0px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",

  fontSize: "0.875rem",
  color: theme.palette.primary.dark,
}));

const NavInnerContainer = styled(Stack)(({ theme }) => ({
  width: "100%",
  minHeight: "10rem",
  overflowY: "auto",
  gap: "1rem",

  backgroundColor: "rgba(182, 216, 215, 0.05)",

  paddingTop: "1.5rem",
  paddingBottom: "2rem",

  ...ResponsivePaddingDefinition({ theme }),
}));

const NavSideElementContainer = styled(Stack)({
  flexGrow: 1,
  flexBasis: 0,
});

const Depth1to2Divider = styled(Divider)(({ theme }) => ({
  width: "3.375rem",
  borderBottom: `4px solid ${theme.palette.highlight.main}`,
}));

const Depth2Item = styled(Link)(({ theme }) => ({
  fontWeight: 300,
  textDecoration: "none",
  width: "fit-content",
  borderBottom: "2px solid transparent",

  "&.active": {
    fontWeight: 700,
    borderBottom: `2px solid ${theme.palette.primary.dark}`,
  },
}));

const Depth2to3Divider = styled(Divider)(({ theme }) => ({ borderColor: theme.palette.primary.light }));

const Depth3Item = styled(Depth2Item)({ fontSize: "0.75rem" });

const BreadCrumbContainer = styled(Stack)(({ theme }) => ({
  position: "fixed",

  top: HeaderHeight,
  width: "100%",
  height: BreadCrumbHeight,
  background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.45))",
  boxShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",

  gap: "0.25rem",
  justifyContent: "center",
  alignItems: "flex-start",

  zIndex: theme.zIndex.appBar - 1,

  ...ResponsivePaddingDefinition({ theme }),

  "& a": {
    color: "#000000",
    fontWeight: 300,
    fontSize: "0.75rem",
    textDecoration: "none",

    "&:hover": {
      textDecoration: "underline",
    },
  },
  "& svg": {
    color: "rgba(0, 0, 0, 0.5)",
    fontSize: "0.75rem",
  },
}));
