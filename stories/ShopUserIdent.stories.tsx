import * as Shop from "@frontend/shop";
import { Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockUserNotSignedIn } from "./fixtures/shop";

const UserSignInMethod = Shop.Components.Common.UserSignInMethod;

const meta = {
  title: "MDX Components/Shop/Common/UserSignInMethod",
  component: UserSignInMethod,
  decorators: [withShopContext],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof UserSignInMethod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedInWithGoogle: Story = {
  parameters: { mockUserStatus: mockUserSignedIn },
};

export const NotSignedIn: Story = {
  parameters: { mockUserStatus: mockUserNotSignedIn },
};

export const WithAccount: Story = {
  parameters: { mockUserStatus: mockUserSignedIn },
  render: () => {
    const UserSignInAccount = Shop.Components.Common.UserSignInAccount;
    return (
      <Stack spacing={1}>
        <Typography variant="body2">
          로그인 방법: <UserSignInMethod />
        </Typography>
        <Typography variant="body2">
          계정: <UserSignInAccount />
        </Typography>
      </Stack>
    );
  },
};
