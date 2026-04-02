import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockUserNotSignedIn, mockCart, mockEmptyCart } from "./fixtures/shop";

const CartStatus = Shop.Components.Features.CartStatus;

const meta = {
  title: "MDX Components/Shop/Feature/CartStatus",
  component: CartStatus,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    withShopContext,
  ],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CartStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  parameters: {
    mockUserStatus: mockUserSignedIn,
    mockCart,
  },
};

export const EmptyCart: Story = {
  parameters: {
    mockUserStatus: mockUserSignedIn,
    mockCart: mockEmptyCart,
  },
};

export const NotSignedIn: Story = {
  parameters: {
    mockUserStatus: mockUserNotSignedIn,
    mockCart,
  },
};
