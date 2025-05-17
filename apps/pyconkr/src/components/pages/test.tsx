import * as React from "react";

import { Box, Button } from "@mui/material";

import { MdiTestPage } from "../../debug/page/mdi_test";
import { ShopTestPage } from "../../debug/page/shop_test";

type SelectedTabType = "shop" | "mdi";

export const Test: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState<SelectedTabType>("mdi");

  return (
    <Box>
      <Button variant="contained" onClick={() => setSelectedTab("shop")}>
        Shop Test
      </Button>
      <Button variant="contained" onClick={() => setSelectedTab("mdi")}>
        MDI Test
      </Button>
      {selectedTab === "shop" && <ShopTestPage />}
      {selectedTab === "mdi" && <MdiTestPage />}
    </Box>
  );
};
