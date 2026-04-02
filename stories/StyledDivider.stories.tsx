import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

const StyledDivider = Common.Components.MDX.StyledDivider;

const meta = {
  title: "MDX Components/Common/StyledDivider",
  component: StyledDivider,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StyledDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body1">섹션 1 내용입니다.</Typography>
      <StyledDivider />
      <Typography variant="body1">섹션 2 내용입니다.</Typography>
      <StyledDivider />
      <Typography variant="body1">섹션 3 내용입니다.</Typography>
    </Stack>
  ),
};
