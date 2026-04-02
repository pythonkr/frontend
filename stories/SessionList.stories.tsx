import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

import { withCommonContext } from "./decorators/withCommonContext";
import { withQueryClient } from "./decorators/withQueryClient";
import { mockSessions } from "./fixtures/sessions";

const SessionList = Common.Components.MDX.SessionList;

const meta = {
  title: "MDX Components/Common/SessionList",
  component: SessionList,
  decorators: [withQueryClient, withCommonContext],
  parameters: {
    layout: "padded",
    mockSessions,
  },
} satisfies Meta<typeof SessionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLink: Story = {
  args: { enableLink: true },
};

export const FilteredByType: Story = {
  args: { types: "keynote" },
  parameters: {
    mockSessions: mockSessions.filter((s) =>
      s.categories.some((c: { id: string; name: string }) => c.name === "Keynote")
    ),
  },
};
