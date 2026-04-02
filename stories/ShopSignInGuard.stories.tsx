import * as Shop from "@frontend/shop";
import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { withShopContext } from "./decorators/withShopContext";
import { mockUserSignedIn, mockUserNotSignedIn } from "./fixtures/shop";

const SignInGuard = Shop.Components.Common.SignInGuard;

const meta = {
  title: "MDX Components/Shop/Common/SignInGuard",
  component: SignInGuard,
  decorators: [withShopContext],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SignInGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  parameters: { mockUserStatus: mockUserSignedIn },
  args: {
    children: <Typography variant="body1">로그인된 사용자에게만 보이는 콘텐츠입니다.</Typography>,
  },
};

export const NotSignedIn: Story = {
  parameters: { mockUserStatus: mockUserNotSignedIn },
  args: {
    children: <Typography variant="body1">이 콘텐츠는 로그인 후 확인할 수 있습니다.</Typography>,
  },
};

export const CustomFallback: Story = {
  parameters: { mockUserStatus: mockUserNotSignedIn },
  args: {
    children: <Typography variant="body1">비밀 콘텐츠</Typography>,
    fallback: (
      <Typography variant="body1" color="warning.main">
        회원 전용 콘텐츠입니다. 로그인해주세요.
      </Typography>
    ),
  },
};
