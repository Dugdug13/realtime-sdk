import { useRef } from 'react';

type Point = {
  x: number;
  y: number;
};

type PinchState = {
  active: boolean;
  offset: number;
  origin: Point;
  first: boolean;
  last: boolean;
};

type PinchCallback = (state: PinchState) => void;

type InternalState = {
  dist: number;
  origin: Point;
  active: boolean;
  offset: number;
};

export const usePinch = (callback?: PinchCallback) => {
  const state = useRef<InternalState>({
    dist: 0,
    origin: { x: 0, y: 0 },
    active: false,
    offset: 1
  });

  const getPinchData = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const origin = {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };

    return { dist, origin };
  };

  const handleStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const { dist, origin } = getPinchData(e.touches);

      state.current.dist = dist;
      state.current.origin = origin;
      state.current.active = true;

      callback?.({
        active: true,
        offset: state.current.offset,
        origin,
        first: true,
        last: false
      });
    }
  };

  const handleMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && state.current.active) {
      const { dist, origin } = getPinchData(e.touches);

      const scaleDelta = dist / state.current.dist;

      state.current.offset *= scaleDelta;
      state.current.dist = dist;

      callback?.({
        active: true,
        offset: state.current.offset,
        origin,
        first: false,
        last: false
      });
    }
  };

  const handleEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2 && state.current.active) {
      state.current.active = false;

      callback?.({
        active: false,
        offset: state.current.offset,
        origin: state.current.origin,
        first: false,
        last: true
      });
    }
  };

  return {
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd
  };
};