import { useRef } from 'react';

type Point = {
  x: number;
  y: number;
};

type ScrollState = {
  active: boolean;
  offset: Point;
  delta: Point;
  first: boolean;
  last: boolean;
};

type ScrollCallback = (state: ScrollState) => void;

type UseScrollOptions = {
  threshold?: number;
};

type InternalState = {
  offset: Point;
  active: boolean;
  timeout: ReturnType<typeof setTimeout> | null;
};

export const useScroll = (
  callback?: ScrollCallback,
  { threshold = 10 }: UseScrollOptions = {}
) => {
  const state = useRef<InternalState>({
    offset: { x: 0, y: 0 },
    active: false,
    timeout: null
  });

  const handleWheel = (e: React.WheelEvent) => {
    const s = state.current;

    // Start
    if (
      !s.active &&
      (Math.abs(e.deltaX) > threshold || Math.abs(e.deltaY) > threshold)
    ) {
      s.active = true;

      callback?.({
        active: true,
        offset: s.offset,
        delta: { x: 0, y: 0 },
        first: true,
        last: false
      });
    }

    // Move
    if (s.active) {
      s.offset.x += e.deltaX;
      s.offset.y += e.deltaY;

      callback?.({
        active: true,
        offset: s.offset,
        delta: { x: e.deltaX, y: e.deltaY },
        first: false,
        last: false
      });

      // Reset timeout
      if (s.timeout) clearTimeout(s.timeout);

      s.timeout = setTimeout(() => {
        s.active = false;

        callback?.({
          active: false,
          offset: s.offset,
          delta: { x: 0, y: 0 },
          first: false,
          last: true
        });
      }, 150);
    }
  };

  return {
    onWheel: handleWheel
  };
};