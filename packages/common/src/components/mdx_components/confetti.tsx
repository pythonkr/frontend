import * as React from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

export const Confetti: React.FC = () => {
  const { width, height } = useWindowSize();
  return <ReactConfetti width={width} height={height} />;
};
