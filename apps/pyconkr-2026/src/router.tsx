import { createBrowserRouter } from "react-router-dom";

import { App } from "./App.tsx";
import MainLayout from "./components/layout/index.tsx";
import { CfpPage } from "./components/pages/cfp.tsx";
import { PageIdParamRenderer, RouteRenderer } from "./components/pages/dynamic_route.tsx";
import { MyPage } from "./components/pages/my/index.tsx";
import { MyTimeTablePage } from "./components/pages/my/timetable.tsx";
import { PresentationDetailPage } from "./components/pages/presentation_detail.tsx";
import { ShopSignInPage } from "./components/pages/sign_in.tsx";
import { SponsorDetailPage } from "./components/pages/sponsor_detail.tsx";
import { StoreCartPage } from "./components/pages/store/cart.tsx";
import { StoreOrderHistoriesPage } from "./components/pages/store/order_histories.tsx";
import { StoreThankYouPage } from "./components/pages/store/thank_you.tsx";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/account/sign-in", element: <ShopSignInPage /> },
          { path: "/store/cart", element: <StoreCartPage /> },
          { path: "/store/order-histories", element: <StoreOrderHistoriesPage /> },
          { path: "/store/thank-you-for-your-purchase", element: <StoreThankYouPage /> },
          { path: "/sponsors/:id", element: <SponsorDetailPage /> },
          { path: "/presentations/:id", element: <PresentationDetailPage /> },
          { path: "/my", element: <MyPage /> },
          { path: "/my/timetable", element: <MyTimeTablePage /> },
          { path: "/cfp", element: <CfpPage /> },
          { path: "/pages/:id", element: <PageIdParamRenderer /> },
          { path: "*", element: <RouteRenderer /> },
        ],
      },
    ],
  },
]);
