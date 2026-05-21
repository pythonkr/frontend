import { AccordionProps } from "@mui/material";
import { Children, FC, ReactElement, SyntheticEvent, cloneElement, useState } from "react";
type PHOpenOneFoldMgrPropType = {
  children: ReactElement<AccordionProps>[];
  resetKey?: string;
};

export const OneDetailsOpener: FC<PHOpenOneFoldMgrPropType> = (props) => {
  const childrenCount = Children.count(props.children);
  const initialFoldState = new Array(childrenCount).fill(false);
  const [oneFoldOpener, setOneFoldOpener] = useState(initialFoldState);

  // resetKey 변경 시 fold 상태 초기화 (https://react.dev/reference/react/useState#storing-information-from-previous-renders)
  const [prevResetKey, setPrevResetKey] = useState(props.resetKey);
  if (prevResetKey !== props.resetKey) {
    setPrevResetKey(props.resetKey);
    setOneFoldOpener([...initialFoldState]);
  }

  const foldStateSwitcher =
    (index: number): ((event: SyntheticEvent<Element, Event>, expanded: boolean) => void) =>
    (event, expanded) => {
      event.preventDefault();
      event.stopPropagation();

      const newOneFoldOpener = [...initialFoldState];
      newOneFoldOpener[index] = expanded;

      setOneFoldOpener(newOneFoldOpener);
    };

  return (
    <>{Children.map(props.children, (child, index) => cloneElement(child, { expanded: oneFoldOpener[index], onChange: foldStateSwitcher(index) }))}</>
  );
};
