import * as Common from "@frontend/common";
import { Alert, Box, Chip, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { withCommonContext } from "./decorators/withCommonContext";

type ComponentEntry = {
  key: string;
  Component: unknown;
};

const entries: ComponentEntry[] = Object.entries(Common.BaseMDXComponents).map(([key, Component]) => ({ key, Component }));

function isReactComponent(x: unknown): x is React.ElementType {
  return typeof x === "function" || typeof x === "object";
}

function makePreview(key: string): React.ReactNode {
  // 공통 컴포넌트는 실제 동작/필수 props가 각기 달라서, “안전하게 렌더 가능한 샘플”만 제공합니다.
  // (backend/kakao SDK/유효한 lottie json 등이 필요한 컴포넌트는 안내만 표시)
  switch (key) {
    case "Common__Components__MDX__Confetti":
      return <Common.Components.MDX.Confetti />;
    case "Common__Components__MDX__PrimaryStyledDetails":
      return (
        <Common.Components.MDX.PrimaryStyledDetails summary="PrimaryStyledDetails 예시">
          <Typography variant="body2">Details body</Typography>
        </Common.Components.MDX.PrimaryStyledDetails>
      );
    case "Common__Components__MDX__SecondaryStyledDetails":
      return (
        <Common.Components.MDX.SecondaryStyledDetails summary="SecondaryStyledDetails 예시">
          <Typography variant="body2">Details body</Typography>
        </Common.Components.MDX.SecondaryStyledDetails>
      );
    case "Common__Components__MDX__FAQAccordion":
      return (
        <Common.Components.MDX.FAQAccordion
          items={[
            { id: "01", question: "질문 예시 1", answer: "답변 예시 1" },
            { id: "02", question: "질문 예시 2", answer: "답변 예시 2" },
          ]}
        />
      );
    case "Common__Components__MDX__FullWidthStyledButton":
      return (
        <Common.Components.MDX.StyledFullWidthButton transparency={20} setBackgroundColor>
          예시 버튼
        </Common.Components.MDX.StyledFullWidthButton>
      );
    case "Common__Components__MDX__OneDetailsOpener":
      return (
        <Common.Components.MDX.OneDetailsOpener
          children={[
            <Common.Components.MDX.PrimaryStyledDetails key="a" summary="첫 번째">
              <Typography variant="body2">첫 번째 내용</Typography>
            </Common.Components.MDX.PrimaryStyledDetails>,
            <Common.Components.MDX.PrimaryStyledDetails key="b" summary="두 번째">
              <Typography variant="body2">두 번째 내용</Typography>
            </Common.Components.MDX.PrimaryStyledDetails>,
          ]}
        />
      );
    case "Common__Components__MDX__Map":
      return (
        <Common.Components.MDX.Map
          geo={{ lat: 37.5585, lng: 126.998 }}
          placeName={{ ko: "동국대학교", en: "Dongguk University" }}
          placeCode={{ kakao: "11591466", google: "ChIJe9T8lqmifDURbT8a1R3dZVQ", naver: "1" }}
          googleMapIframeSrc="https://www.google.com/maps?q=37.5585,126.998&z=15&output=embed"
        />
      );
    case "Common__Components__Session__List":
      return <Alert severity="info">`SessionList`는 백엔드 API 호출이 필요해서 Storybook 기본 환경에서는 바로 미리보기를 제공하지 않습니다.</Alert>;
    case "Common__Components__Session__TimeTable":
      return (
        <Alert severity="info">`SessionTimeTable`는 백엔드 API 호출이 필요해서 Storybook 기본 환경에서는 바로 미리보기를 제공하지 않습니다.</Alert>
      );
    case "Common__Components__Lottie":
    case "Common__Components__NetworkLottie":
      return (
        <Alert severity="info">Lottie 컴포넌트는 유효한 lottie JSON 데이터(또는 URL)가 필요합니다. 스토리에서 args로 주입해 테스트해주세요.</Alert>
      );
    default:
      // MUI 컴포넌트들은 “필수 props/컨텍스트”가 다양한 관계로, 개별 샘플 렌더는 안전한 것만 제공합니다.
      if (key.startsWith("Mui__material__")) {
        if (key === "Mui__material__Chip") return <Chip label="Chip" />;
        if (key === "Mui__material__Alert") return <Alert severity="success">Alert</Alert>;
        if (key === "Mui__material__TextField") return <TextField label="TextField" />;
        return (
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            이 컴포넌트는 필수 props가 있을 수 있어 자동 프리뷰를 생략했습니다. (key: {key})
          </Typography>
        );
      }
      return (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          프리뷰가 준비되지 않았습니다. (key: {key})
        </Typography>
      );
  }
}

const meta = {
  title: "MDX/BaseMDXComponents",
  decorators: [withCommonContext],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    search: { control: "text" },
    selectedKey: { control: "select", options: entries.map((e) => e.key) },
    showOnlyCustom: { control: "boolean" },
  },
  args: {
    search: "",
    selectedKey: "Common__Components__MDX__Confetti",
    showOnlyCustom: true,
  },
} satisfies Meta<{
  search: string;
  selectedKey: string;
  showOnlyCustom: boolean;
}>;

export default meta;
type Story = StoryObj<typeof meta>;

const CatalogView: React.FC<{ search: string; selectedKey: string; showOnlyCustom: boolean }> = (args) => {
  const [search, setSearch] = React.useState(args.search);
  const [selectedKey, setSelectedKey] = React.useState(args.selectedKey);
  const [showOnlyCustom, setShowOnlyCustom] = React.useState(args.showOnlyCustom);

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    return entries
      .filter((e) => (showOnlyCustom ? !e.key.startsWith("Mui__material__") : true))
      .filter((e) => (s ? e.key.toLowerCase().includes(s) : true));
  }, [search, showOnlyCustom]);

  React.useEffect(() => {
    // controls 패널에서 args가 바뀐 경우 동기화
    setSearch(args.search);
    setSelectedKey(args.selectedKey);
    setShowOnlyCustom(args.showOnlyCustom);
  }, [args.search, args.selectedKey, args.showOnlyCustom]);

  const selected = entries.find((e) => e.key === selectedKey);
  const selectedComponent = selected?.Component;

  return (
    <Stack spacing={2}>
      <Typography variant="h4">BaseMDXComponents 카탈로그</Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        `packages/common/src/consts/mdx_components.ts`의 `BaseMDXComponents`를 기준으로 목록을 만들었습니다.
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField label="Search key" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
        <FormControlLabel
          control={<Switch checked={showOnlyCustom} onChange={(e) => setShowOnlyCustom(e.target.checked)} />}
          label="커스텀만 보기(Common__/...)"
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "stretch" }}>
        <Box
          sx={{
            width: { xs: "100%", md: 420 },
            maxHeight: 520,
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack spacing={1} sx={{ p: 1 }}>
            {filtered.map((e) => (
              <Chip
                key={e.key}
                label={e.key}
                onClick={() => setSelectedKey(e.key)}
                color={e.key === selectedKey ? "primary" : "default"}
                variant={e.key === selectedKey ? "filled" : "outlined"}
                sx={{ justifyContent: "flex-start" }}
              />
            ))}
            {filtered.length === 0 && (
              <Typography variant="body2" sx={{ opacity: 0.7, p: 1 }}>
                검색 결과가 없습니다.
              </Typography>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 520,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
            Selected key
          </Typography>
          <Typography variant="h6" sx={{ wordBreak: "break-all", mb: 2 }}>
            {selectedKey}
          </Typography>

          {!selectedComponent ? (
            <Alert severity="error">선택된 key에 해당하는 컴포넌트를 찾지 못했습니다.</Alert>
          ) : !isReactComponent(selectedComponent) ? (
            <Alert severity="warning">React 컴포넌트 타입으로 판단되지 않아 렌더를 생략했습니다.</Alert>
          ) : (
            <Box sx={{ width: "100%" }}>{makePreview(selectedKey)}</Box>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export const Catalog: Story = {
  render: (rawArgs) => {
    const args = rawArgs as { search: string; selectedKey: string; showOnlyCustom: boolean };
    return <CatalogView {...args} />;
  },
};
