import { useCallback, useRef } from 'react';

type Point = {
  x: number;
  y: number;
};

type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

type SwipeState = {
  active: boolean;
  first: boolean;
  last: boolean;
  direction: SwipeDirection;
  distance: Point;
  velocity: number;
  time?: number;
};

type SwipeCallback = (state: SwipeState) => void;

type UseSwipeOptions = {
  threshold?: number;
  timeout?: number;
  velocityThreshold?: number;
};

type InternalState = {
  start: Point | null;
  timeStart: number | null;
  isSwiping: boolean;
};

export const useSwipe = (
  callback?: SwipeCallback,
  {
    threshold = 50,
    timeout = 500,
    velocityThreshold = 0.5
  }: UseSwipeOptions = {}
) => {
  const stateRef = useRef<InternalState>({
    start: null,
    timeStart: null,
    isSwiping: false
  });

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      stateRef.current = {
        start: { x: clientX, y: clientY },
        timeStart: Date.now(),
        isSwiping: true
      };

      callback?.({
        active: true,
        direction: null,
        distance: { x: 0, y: 0 },
        velocity: 0,
        first: true,
        last: false
      });
    },
    [callback]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const s = stateRef.current;
      if (!s.isSwiping || !s.start) return;

      const distanceX = clientX - s.start.x;
      const distanceY = clientY - s.start.y;

      callback?.({
        active: true,
        direction: null,
        distance: { x: distanceX, y: distanceY },
        velocity: 0,
        first: false,
        last: false
      });
    },
    [callback]
  );

  const handleEnd = useCallback(
    (clientX: number, clientY: number) => {
      const s = stateRef.current;
      if (!s.start || s.timeStart === null) return;

      const distanceX = clientX - s.start.x;
      const distanceY = clientY - s.start.y;
      const deltaTime = Date.now() - s.timeStart;

      let direction: SwipeDirection = null;

      const velocityX = Math.abs(distanceX) / deltaTime;
      const velocityY = Math.abs(distanceY) / deltaTime;
      const overallVelocity =
        Math.sqrt(distanceX ** 2 + distanceY ** 2) / deltaTime;

      if (deltaTime < timeout || overallVelocity > velocityThreshold) {
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
          if (
            Math.abs(distanceX) > threshold ||
            velocityX > velocityThreshold
          ) {
            direction = distanceX > 0 ? 'right' : 'left';
          }
        } else {
          if (
            Math.abs(distanceY) > threshold ||
            velocityY > velocityThreshold
          ) {
            direction = distanceY > 0 ? 'down' : 'up';
          }
        }
      }

      callback?.({
        active: false,
        first: false,
        last: true,
        direction,
        distance: { x: distanceX, y: distanceY },
        velocity: overallVelocity,
        time: deltaTime
      });

      stateRef.current = {
        start: null,
        timeStart: null,
        isSwiping: false
      };
    },
    [threshold, timeout, velocityThreshold, callback]
  );

  return {
    onTouchStart: (e: React.TouchEvent) =>
      handleStart(e.touches[0].clientX, e.touches[0].clientY),

    onTouchMove: (e: React.TouchEvent) =>
      handleMove(e.touches[0].clientX, e.touches[0].clientY),

    onTouchEnd: (e: React.TouchEvent) =>
      handleEnd(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
      ),

    onMouseDown: (e: React.MouseEvent) =>
      handleStart(e.clientX, e.clientY),

    onMouseMove: (e: React.MouseEvent) =>
      handleMove(e.clientX, e.clientY),

    onMouseUp: (e: React.MouseEvent) =>
      handleEnd(e.clientX, e.clientY),

    onMouseLeave: (e: React.MouseEvent) =>
      handleEnd(e.clientX, e.clientY),

    style: { touchAction: 'none' as const }
  };
};