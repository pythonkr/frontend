import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemePalette } from "./ThemePalette";

const meta = {
  title: "Theme/Palette",
  component: ThemePalette,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ThemePalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
