import { Box, Stack, Tab, Tabs } from "@mui/material";
import { FC, useState } from "react";

import { InlineResourceSection } from "@apps/pyconkr-admin/components/elements/inline_resource_section";

type PresentationTab = "type" | "room";

const NAME_COLUMN = { name: "name", label: "이름", type: "translated" as const };

export const PresentationSettingsTabs: FC<{ eventId: string }> = ({ eventId }) => {
  const [tab, setTab] = useState<PresentationTab>("type");

  return (
    <Stack direction="row" spacing={2} sx={{ flexGrow: 1, width: "100%" }}>
      <Tabs
        orientation="vertical"
        value={tab}
        onChange={(_, v: PresentationTab) => setTab(v)}
        sx={{ borderRight: 1, borderColor: "divider", minWidth: 72, "& .MuiTab-root": { minWidth: 0, px: 2 } }}
      >
        <Tab value="type" label="유형" />
        <Tab value="room" label="장소" />
      </Tabs>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {tab === "type" && (
          <InlineResourceSection
            app="event"
            resource="presentationtype"
            filter={{ key: "event", value: eventId }}
            label="유형"
            columns={[NAME_COLUMN]}
            dialogChildren={(type) => (
              <InlineResourceSection
                app="event"
                resource="presentationcategory"
                filter={{ key: "type", value: type.id }}
                label="카테고리"
                columns={[NAME_COLUMN]}
              />
            )}
          />
        )}
        {tab === "room" && (
          <InlineResourceSection
            app="event"
            resource="room"
            filter={{ key: "event", value: eventId }}
            label="장소"
            orderField="order"
            columns={[
              NAME_COLUMN,
              {
                name: "order",
                label: "순서",
                type: "number",
                width: 80,
                defaultValue: (n) => String(n * 10),
                helperText: "낮은 값이 먼저 표시됩니다.",
              },
            ]}
          />
        )}
      </Box>
    </Stack>
  );
};
