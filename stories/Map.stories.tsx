import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

import { withCommonContext } from "./decorators/withCommonContext";

const Map = Common.Components.MDX.Map;

const meta = {
  title: "MDX Components/Common/Map",
  component: Map,
  decorators: [withCommonContext],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof meta>;

// 동국대학교 신공학관 (PyCon KR 2025 행사장)
export const Default: Story = {
  args: {
    geo: { lat: 37.5587, lng: 127.0004 },
    placeName: {
      ko: "동국대학교 신공학관",
      en: "New Engineering Building, Dongguk University",
    },
    placeCode: {
      kakao: "27296493",
      naver: "FvuDaEWgtV",
      google: "https://maps.app.goo.gl/example",
    },
    googleMapIframeSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.5!2d127.0004!3d37.5587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDMzJzMxLjMiTiAxMjfCsDAwJzAxLjQiRQ!5e0!3m2!1sko!2skr!4v1234567890",
  },
};
