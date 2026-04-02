import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockUserNotSignedIn, mockProducts } from "./fixtures/shop";

const ProductList = Shop.Components.Features.ProductList;

const meta = {
  title: "MDX Components/Shop/Feature/ProductList",
  component: ProductList,
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
    mockProducts,
  },
} satisfies Meta<typeof ProductList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  parameters: { mockUserStatus: mockUserSignedIn },
};

export const NotSignedIn: Story = {
  parameters: { mockUserStatus: mockUserNotSignedIn },
};

export const Empty: Story = {
  parameters: {
    mockUserStatus: mockUserSignedIn,
    mockProducts: [],
  },
};
