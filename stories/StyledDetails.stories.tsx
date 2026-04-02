import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

const PrimaryStyledDetails = Common.Components.MDX.PrimaryStyledDetails;
const HighlightedStyledDetails = Common.Components.MDX.SecondaryStyledDetails;

const meta = {
  title: "MDX Components/Common/StyledDetails",
  component: PrimaryStyledDetails,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PrimaryStyledDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    summary: "발표 일정 안내",
    children: (
      <Typography variant="body1">
        발표는 8월 15일부터 17일까지 3일간 진행됩니다. 각 트랙별 세부 일정은 공식
        홈페이지에서 확인하실 수 있습니다.
      </Typography>
    ),
  },
};

export const Highlighted: Story = {
  render: (args: Story["args"]) => <HighlightedStyledDetails {...args} />,
  args: {
    summary: "중요 공지사항",
    children: (
      <Typography variant="body1">
        발표 신청 마감일은 6월 30일입니다. 기한 내에 신청해 주시기 바랍니다.
      </Typography>
    ),
  },
};

export const Multiple: Story = {
  args: { children: null as never },
  render: () => (
    <Stack spacing={1}>
      <PrimaryStyledDetails summary="파이썬 기초">
        <Typography variant="body1">파이썬의 기본 문법과 자료구조를 학습합니다.</Typography>
      </PrimaryStyledDetails>
      <PrimaryStyledDetails summary="웹 개발">
        <Typography variant="body1">Django와 FastAPI를 사용한 웹 개발 방법을 소개합니다.</Typography>
      </PrimaryStyledDetails>
      <HighlightedStyledDetails summary="특별 세션">
        <Typography variant="body1">파이콘 한국 2025 특별 기조 세션입니다.</Typography>
      </HighlightedStyledDetails>
    </Stack>
  ),
};
