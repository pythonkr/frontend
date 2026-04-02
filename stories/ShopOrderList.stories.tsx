import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockUserNotSignedIn, mockOrders } from "./fixtures/shop";

const OrderList = Shop.Components.Features.OrderList;

const meta = {
  title: "MDX Components/Shop/Feature/OrderList",
  component: OrderList,
  decorators: [withShopContext],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof OrderList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithOrders: Story = {
  parameters: {
    mockUserStatus: mockUserSignedIn,
    mockOrders,
  },
};

export const EmptyOrders: Story = {
  parameters: {
    mockUserStatus: mockUserSignedIn,
    mockOrders: [],
  },
};

export const NotSignedIn: Story = {
  parameters: {
    mockUserStatus: mockUserNotSignedIn,
    mockOrders: [],
  },
};
