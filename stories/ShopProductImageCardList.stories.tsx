import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockProducts } from "./fixtures/shop";

const ProductImageCardList = Shop.Components.Features.ProductImageCardList;

const meta = {
  title: "MDX Components/Shop/Feature/ProductImageCardList",
  component: ProductImageCardList,
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
    mockUserStatus: mockUserSignedIn,
    mockProducts,
  },
} satisfies Meta<typeof ProductImageCardList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: { mockProducts: [] },
};
