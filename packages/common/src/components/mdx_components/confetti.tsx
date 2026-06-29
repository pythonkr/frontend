import { FC } from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

/**
 * 화면 전체에 색종이(컨페티)가 쏟아지는 축하 효과. 창 크기에 맞춰 자동으로 채워지며,
 * 축하·완료 등을 연출할 때 페이지에 배치한다.
 * @example <Common__Components__MDX__Confetti />
 */
export const Confetti: FC = () => {
  const { width, height } = useWindowSize();
  return <ReactConfetti width={width} height={height} />;
};
