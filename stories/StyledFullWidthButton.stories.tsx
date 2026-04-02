import { Stack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

import * as Common from "@frontend/common";

const StyledFullWidthButton = Common.Components.MDX.StyledFullWidthButton;

const meta = {
  title: "MDX Components/Common/StyledFullWidthButton",
  component: StyledFullWidthButton,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    transparency: { control: { type: "range", min: 0, max: 100, step: 5 } },
    setBackgroundColor: { control: "boolean" },
    link: { control: "text" },
  },
} satisfies Meta<typeof StyledFullWidthButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "발표 신청하기",
    transparency: 10,
  },
};

export const WithBackground: Story = {
  args: {
    children: "티켓 구매하기",
    transparency: 20,
    setBackgroundColor: true,
  },
};

export const WithExternalLink: Story = {
  args: {
    children: "공식 홈페이지 방문",
    transparency: 10,
    link: "https://pycon.kr",
  },
};

export const Sizes: Story = {
  args: { transparency: 10 },
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 600 }}>
      <StyledFullWidthButton transparency={10} size="small">
        Small
      </StyledFullWidthButton>
      <StyledFullWidthButton transparency={10} size="medium">
        Medium (기본값)
      </StyledFullWidthButton>
      <StyledFullWidthButton transparency={10} size="large">
        Large
      </StyledFullWidthButton>
    </Stack>
  ),
};
