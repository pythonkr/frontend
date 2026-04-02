import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

import { withCommonContext } from "./decorators/withCommonContext";

const MobileCover = Common.Components.MDX.MobileCover;

const meta = {
  title: "MDX Components/Common/MobileCover",
  component: MobileCover,
  decorators: [withCommonContext],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
  },
  argTypes: {
    mobileCoverImage: { control: "text" },
    mobileCoverTitle: { control: "text" },
  },
} satisfies Meta<typeof MobileCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomAssets: Story = {
  args: {
    mobileCoverImage: "https://placehold.co/400x800/259299/white?text=PyCon+Cover",
    mobileCoverTitle: "https://placehold.co/200x60/E17101/white?text=PyCon+KR",
  },
};
