import { useBackendClient, useFlattenSiteMapQuery, useSponsorQuery } from "@frontend/common/hooks/useAPI";
import { NestedSiteMapSchema } from "@frontend/common/schemas/backendAPI";
import { buildNestedSiteMap } from "@frontend/common/utils";
import { FC, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { isEmpty, isNullish } from "remeda";

import { EVENT_NAME } from "./consts";
import { useAppContext } from "./contexts/app_context";
import { AuthGuardModalProvider } from "./features/auth/auth_guard";

export const App: FC = () => {
  const backendAPIClient = useBackendClient();
  const { data: sponsorTiers } = useSponsorQuery(backendAPIClient, { event: EVENT_NAME });
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
    <>
      <ScrollRestoration />
      <AuthGuardModalProvider>
        <Outlet />
      </AuthGuardModalProvider>
    </>
  );
};
