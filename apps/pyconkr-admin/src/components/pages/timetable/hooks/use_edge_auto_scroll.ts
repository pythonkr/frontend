import { DragEvent, useEffect, useRef } from "react";

import { TIMETABLE_SCROLL_EDGE_THRESHOLD, TIMETABLE_SCROLL_MAX_SPEED } from "../const";

export const useEdgeAutoScroll = (active: boolean) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const velRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const stop = () => {
    velRef.current = 0;
  };
  const setVelocity = (velocity: number) => {
    velRef.current = velocity;
    if (velocity !== 0 && rafRef.current == null) {
      const step = () => {
        const el = scrollRef.current;
        if (!el || velRef.current === 0) {
          rafRef.current = null;
          return;
        }
        el.scrollTop += velRef.current;
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !active) return;
    const rect = el.getBoundingClientRect();
    const topDist = e.clientY - rect.top;
    const bottomDist = rect.bottom - e.clientY;
    if (topDist < TIMETABLE_SCROLL_EDGE_THRESHOLD)
      setVelocity(-TIMETABLE_SCROLL_MAX_SPEED * (1 - Math.max(topDist, 0) / TIMETABLE_SCROLL_EDGE_THRESHOLD));
    else if (bottomDist < TIMETABLE_SCROLL_EDGE_THRESHOLD)
      setVelocity(TIMETABLE_SCROLL_MAX_SPEED * (1 - Math.max(bottomDist, 0) / TIMETABLE_SCROLL_EDGE_THRESHOLD));
    else stop();
  };

  useEffect(() => {
    if (!active) stop();
  }, [active]);
  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return { scrollRef, onDragOver, stop };
};
