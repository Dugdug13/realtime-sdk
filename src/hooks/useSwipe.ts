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
    velocityThreshold = 0.3
  }: UseSwipeOptions = {}
) => {
  const stateRef = useRef<InternalState>({
    start: null,
    timeStart: null,
    isSwiping: false
  });

  const handleStart = useCallback((clientX: number, clientY: number) => {
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
  }, [callback]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (!s.isSwiping || !s.start) return;

    const dx = clientX - s.start.x;
    const dy = clientY - s.start.y;

    callback?.({
      active: true,
      direction: null,
      distance: { x: dx, y: dy },
      velocity: 0,
      first: false,
      last: false
    });
  }, [callback]);

  const handleEnd = useCallback((clientX: number, clientY: number) => {
    const s = stateRef.current;
    if (!s.start || s.timeStart === null) return;

    const dx = clientX - s.start.x;
    const dy = clientY - s.start.y;
    const deltaTime = Date.now() - s.timeStart;

    const velocity = Math.sqrt(dx * dx + dy * dy) / deltaTime;

    let direction: SwipeDirection = null;

    // ✅ Primary: distance-based detection
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > threshold) {
        direction = dx > 0 ? 'right' : 'left';
      }
    } else {
      if (Math.abs(dy) > threshold) {
        direction = dy > 0 ? 'down' : 'up';
      }
    }

    // ✅ Fallback: fast swipe
    if (!direction && velocity > velocityThreshold) {
      direction =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? 'right'
            : 'left'
          : dy > 0
          ? 'down'
          : 'up';
    }

    callback?.({
      active: false,
      first: false,
      last: true,
      direction,
      distance: { x: dx, y: dy },
      velocity,
      time: deltaTime
    });

    stateRef.current = {
      start: null,
      timeStart: null,
      isSwiping: false
    };
  }, [threshold, velocityThreshold, callback]);

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

    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },

    onMouseMove: (e: React.MouseEvent) => {
      if (!stateRef.current.isSwiping) return;
      handleMove(e.clientX, e.clientY);
    },

    onMouseUp: (e: React.MouseEvent) =>
      handleEnd(e.clientX, e.clientY),

    onMouseLeave: (e: React.MouseEvent) =>
      handleEnd(e.clientX, e.clientY),

    style: { touchAction: 'none' as const }
  };
};