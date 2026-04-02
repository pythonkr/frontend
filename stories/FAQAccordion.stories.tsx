import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

const FAQAccordion = Common.Components.MDX.FAQAccordion;

const faqItems = [
  {
    id: "1",
    question: "파이콘 한국이 무엇인가요?",
    answer:
      "파이콘 한국은 파이썬 사용자들이 모여 지식과 경험을 공유하는 비영리 개발자 컨퍼런스입니다. 매년 다양한 발표와 워크숍이 진행됩니다.",
  },
  {
    id: "2",
    question: "티켓은 어떻게 구매할 수 있나요?",
    answer:
      "티켓은 파이콘 한국 공식 웹사이트에서 구매하실 수 있습니다. 얼리버드, 일반, 후원 티켓 등 다양한 종류가 있습니다.",
  },
  {
    id: "3",
    question: "발표 신청은 어떻게 하나요?",
    answer:
      "CFP(Call For Proposals) 기간에 공식 웹사이트를 통해 신청하실 수 있습니다. 발표 주제, 내용, 발표자 정보를 제출하시면 됩니다.",
  },
];

const meta = {
  title: "MDX Components/Common/FAQAccordion",
  component: FAQAccordion,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    items: { control: "object" },
  },
} satisfies Meta<typeof FAQAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: faqItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: [faqItems[0]],
  },
};
