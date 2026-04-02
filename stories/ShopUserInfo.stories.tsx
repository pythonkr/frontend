import * as Shop from "@frontend/shop";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockUserNotSignedIn } from "./fixtures/shop";

const UserInfo = Shop.Components.Features.UserInfo;

const meta = {
  title: "MDX Components/Shop/Feature/UserInfo",
  component: UserInfo,
  decorators: [withShopContext],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof UserInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  parameters: { mockUserStatus: mockUserSignedIn },
};

export const NotSignedIn: Story = {
  parameters: { mockUserStatus: mockUserNotSignedIn },
};
