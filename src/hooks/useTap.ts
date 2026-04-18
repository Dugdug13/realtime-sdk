import { useRef } from 'react';

type Point = {
  x: number;
  y: number;
};

type TapEvent = React.MouseEvent | React.TouchEvent;

type TapState = {
  event: TapEvent;
  tap: boolean;
};

type TapCallback = (state: TapState) => void;

type UseTapOptions = {
  maxDelay?: number;
  maxDistance?: number;
};

type InternalState = {
  start: Point | null;
  time: number | null;
};

export const useTap = (
  callback?: TapCallback,
  { maxDelay = 300, maxDistance = 10 }: UseTapOptions = {}
) => {
  const state = useRef<InternalState>({
    start: null,
    time: null
  });

  const handleStart = (clientX: number, clientY: number) => {
    state.current = {
      start: { x: clientX, y: clientY },
      time: Date.now()
    };
  };

  const handleEnd = (
    clientX: number,
    clientY: number,
    event: TapEvent
  ) => {
    const s = state.current;
    if (!s.start || s.time === null) return;

    const dx = clientX - s.start.x;
    const dy = clientY - s.start.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const timeElapsed = Date.now() - s.time;

    if (dist <= maxDistance && timeElapsed <= maxDelay) {
      callback?.({ event, tap: true });
    }

    state.current = { start: null, time: null };
  };

  return {
    onMouseDown: (e: React.MouseEvent) =>
      handleStart(e.clientX, e.clientY),

    onMouseUp: (e: React.MouseEvent) =>
      handleEnd(e.clientX, e.clientY, e),

    onTouchStart: (e: React.TouchEvent) =>
      handleStart(e.touches[0].clientX, e.touches[0].clientY),

    onTouchEnd: (e: React.TouchEvent) =>
      handleEnd(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY,
        e
      )
  };
};