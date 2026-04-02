import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeComponents } from "./ThemeComponents";

const meta = {
  title: "Theme/Components",
  component: ThemeComponents,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ThemeComponents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
