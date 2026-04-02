import * as Common from "@frontend/common";
import * as React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import * as R from "remeda";

import BackendAPISchemas from "../../../packages/common/src/schemas/backendAPI";
import { PageIdParamRenderer, RouteRenderer } from "./components/pages/dynamic_route.tsx";
import { IS_DEBUG_ENV } from "./consts";
import { useAppContext } from "./contexts/app_context";

export const App: React.FC = () => {
  const backendAPIClient = Common.Hooks.BackendAPI.useBackendClient();
  const { data: sponsorTiers } = Common.Hooks.BackendAPI.useSponsorQuery(backendAPIClient);
  const { data: flatSiteMap } = Common.Hooks.BackendAPI.useFlattenSiteMapQuery(backendAPIClient);
  const siteMapNode = Common.Utils.buildNestedSiteMap(flatSiteMap)?.[""];

  const location = useLocation();
  const { setAppContext, language } = useAppContext();

  React.useEffect(() => {
    (async () => {
      const currentRouteCodes = ["", ...location.pathname.split("/").filter((code) => !R.isEmpty(code))];
      const currentSiteMapDepth: (BackendAPISchemas.NestedSiteMapSchema | undefined)[] = [siteMapNode];

      for (const routeCode of currentRouteCodes.splice(1)) {
        const childrenMap = currentSiteMapDepth
          .at(-1)
          ?.children?.reduce((acc, child) => ({ ...acc, [child.route_code]: child }), {} as Record<string, BackendAPISchemas.NestedSiteMapSchema>);
        currentSiteMapDepth.push(childrenMap?.[routeCode]);
        if (R.isNullish(currentSiteMapDepth.at(-1))) {
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
      <Route path="/">
        {IS_DEBUG_ENV && <Route path="/debug" element={<div>Debug Page</div>} />}
        <Route path="/pages/:id" element={<PageIdParamRenderer />} />
        <Route path="*" element={<RouteRenderer />} />
      </Route>
    </Routes>
  );
};
