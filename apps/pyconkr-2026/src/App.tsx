import { FC, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { isEmpty, isNullish } from "remeda";

import { useBackendClient, useFlattenSiteMapQuery, useSponsorQuery } from "@frontend/common/hooks/useAPI";
import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";
import { buildNestedSiteMap } from "@frontend/common/utils";

import MainLayout from "./components/layout/index.tsx";
import { PageIdParamRenderer, RouteRenderer } from "./components/pages/dynamic_route.tsx";
import { PresentationDetailPage } from "./components/pages/presentation_detail.tsx";
import { ShopSignInPage } from "./components/pages/sign_in.tsx";
import { SponsorDetailPage } from "./components/pages/sponsor_detail.tsx";
import { useAppContext } from "./contexts/app_context";

export const App: FC = () => {
  const backendAPIClient = useBackendClient();
  const { data: sponsorTiers } = useSponsorQuery(backendAPIClient);
  const { data: flatSiteMap } = useFlattenSiteMapQuery(backendAPIClient);
  const siteMapNode = buildNestedSiteMap(flatSiteMap)?.[""];

  const location = useLocation();
  const { setAppContext, language } = useAppContext();

  useEffect(() => {
    (async () => {
      const currentRouteCodes = ["", ...location.pathname.split("/").filter((code) => !isEmpty(code))];
      const currentSiteMapDepth: (NestedSiteMapSchema | undefined)[] = [siteMapNode];

      for (const routeCode of currentRouteCodes.splice(1)) {
        const childrenMap = currentSiteMapDepth
          .at(-1)
          ?.children?.reduce((acc, child) => ({ ...acc, [child.route_code]: child }), {} as Record<string, NestedSiteMapSchema>);
        currentSiteMapDepth.push(childrenMap?.[routeCode]);
        if (isNullish(currentSiteMapDepth.at(-1))) {
          console.warn(`Route not found in site map: ${routeCode}`);
          break;
        }
      }

      setAppContext((ps) => ({ ...ps, siteMapNode, sponsorTiers, currentSiteMapDepth }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, language, flatSiteMap, sponsorTiers]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/account/sign-in" element={<ShopSignInPage />} />
        <Route path="/sponsors/:id" element={<SponsorDetailPage />} />
        <Route path="/presentations/:id" element={<PresentationDetailPage />} />
        <Route path="/pages/:id" element={<PageIdParamRenderer />} />
        <Route path="*" element={<RouteRenderer />} />
      </Route>
    </Routes>
  );
};
