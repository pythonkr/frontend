import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

import { withCommonContext } from "./decorators/withCommonContext";

const MobileAccordion = Common.Components.MDX.MobileAccordion;

const meta = {
  title: "MDX Components/Common/MobileAccordion",
  component: MobileAccordion,
  decorators: [withCommonContext],
  parameters: {
    layout: "centered",
    viewport: { defaultViewport: "mobile1" },
  },
  argTypes: {
    eventDates: { control: "text" },
    hostLogoBig: { control: "text" },
    hostLogoSmall: { control: "text" },
  },
} satisfies Meta<typeof MobileAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomProps: Story = {
  args: {
    eventDates: "AUG 15 - 17",
    venue: {
      ko: "서울특별시 중구 필동로 1길 30 동국대학교 신공학관",
      en: "New Engineering Building, Dongguk University",
    },
    hostLogoBig: "https://placehold.co/300x100/259299/white?text=PyCon+Korea",
    hostLogoSmall: "https://placehold.co/30x30/259299/white?text=PK",
  },
};
