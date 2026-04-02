import { Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

const SubContentContainer = Common.Components.MDX.SubContentContainer;

const meta = {
  title: "MDX Components/Common/SubContentContainer",
  component: SubContentContainer,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SubContentContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Typography variant="body1">
        SubContentContainer는 콘텐츠에 일정한 패딩을 적용하는 레이아웃 컴포넌트입니다.
        MDX 문서 내에서 서브 섹션을 감싸는 용도로 사용됩니다.
      </Typography>
    ),
  },
};
