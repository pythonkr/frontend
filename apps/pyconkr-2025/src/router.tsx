import { createBrowserRouter } from "react-router-dom";

import { App } from "./App.tsx";
import MainLayout from "./components/layout/index.tsx";
import { PageIdParamRenderer, RouteRenderer } from "./components/pages/dynamic_route.tsx";
import { MDXPreviewPage } from "./components/pages/mdx_preview.tsx";
import { PresentationDetailPage } from "./components/pages/presentation_detail.tsx";
import { ShopSignInPage } from "./components/pages/sign_in.tsx";
import { SponsorDetailPage } from "./components/pages/sponsor_detail.tsx";
import { Test } from "./components/pages/test.tsx";
import { IS_DEBUG_ENV } from "./consts";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <MainLayout />,
        children: [
          ...(IS_DEBUG_ENV ? [{ path: "/debug", element: <Test /> }] : []),
          { path: "/preview", element: <MDXPreviewPage /> },
          { path: "/account/sign-in", element: <ShopSignInPage /> },
          { path: "/sponsors/:id", element: <SponsorDetailPage /> },
          { path: "/presentations/:id", element: <PresentationDetailPage /> },
          { path: "/pages/:id", element: <PageIdParamRenderer /> },
          { path: "*", element: <RouteRenderer /> },
        ],
      },
    ],
  },
]);
