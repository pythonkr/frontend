import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withShopContext } from "./decorators/withShopContext";
import { mockPatrons } from "./fixtures/shop";

const PatronList = Shop.Components.Features.PatronList;

const meta = {
  title: "MDX Components/Shop/Feature/PatronList",
  component: PatronList,
  decorators: [withShopContext],
  parameters: {
    layout: "padded",
    mockPatrons,
    mockPatronsYear: 2025,
  },
} satisfies Meta<typeof PatronList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { year: 2025 },
};

export const Empty: Story = {
  parameters: { mockPatrons: [] },
  args: { year: 2025 },
};
