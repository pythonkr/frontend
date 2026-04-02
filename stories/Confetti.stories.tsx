import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

const Confetti = Common.Components.MDX.Confetti;

const meta = {
  title: "MDX Components/Common/Confetti",
  component: Confetti,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Confetti>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
