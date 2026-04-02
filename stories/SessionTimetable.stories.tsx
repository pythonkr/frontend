import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

import { withCommonContext } from "./decorators/withCommonContext";
import { withQueryClient } from "./decorators/withQueryClient";
import { mockSessions } from "./fixtures/sessions";

const SessionTimeTable = Common.Components.MDX.SessionTimeTable;

const meta = {
  title: "MDX Components/Common/SessionTimetable",
  component: SessionTimeTable,
  decorators: [withQueryClient, withCommonContext],
  parameters: {
    layout: "fullscreen",
    mockSessions,
  },
} satisfies Meta<typeof SessionTimeTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
