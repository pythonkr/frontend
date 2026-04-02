import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Meta, StoryObj } from "@storybook/react-vite";

import * as Common from "@frontend/common";

const OneDetailsOpener = Common.Components.MDX.OneDetailsOpener;

const meta = {
  title: "MDX Components/Common/OneDetailsOpener",
  component: OneDetailsOpener,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof OneDetailsOpener>;

export default meta;
type Story = StoryObj<typeof meta>;

const accordionItems = [
  { id: "1", title: "파이썬이란?", content: "파이썬은 간결하고 읽기 쉬운 문법을 가진 프로그래밍 언어입니다." },
  { id: "2", title: "파이콘이란?", content: "파이콘은 파이썬 사용자들이 모이는 커뮤니티 컨퍼런스입니다." },
  { id: "3", title: "발표 신청 방법", content: "공식 웹사이트에서 CFP 기간에 신청하실 수 있습니다." },
];

export const Default: Story = {
  args: { children: [] as never },
  render: () => (
    <OneDetailsOpener>
      {accordionItems.map((item) => (
        <Accordion key={item.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{item.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.content}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </OneDetailsOpener>
  ),
};
