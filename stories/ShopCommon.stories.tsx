import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn } from "./fixtures/shop";

const PriceDisplay = Shop.Components.Common.PriceDisplay;

const meta = {
  title: "MDX Components/Shop/Common/PriceDisplay",
  component: PriceDisplay,
  decorators: [withShopContext],
  parameters: {
    layout: "padded",
    mockUserStatus: mockUserSignedIn,
  },
} satisfies Meta<typeof PriceDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { price: 50000 },
};

export const WithLabel: Story = {
  args: { price: 100000, label: "결제 금액" },
};

export const ZeroPrice: Story = {
  args: { price: 0, label: "무료" },
};
