import { useRef } from 'react';

type RotateState = {
  active: boolean;
  offset: number;
  first: boolean;
  last: boolean;
};

type RotateCallback = (state: RotateState) => void;

type InternalState = {
  angle: number;
  active: boolean;
  offset: number;
};

export const useRotate = (callback?: RotateCallback) => {
  const state = useRef<InternalState>({
    angle: 0,
    active: false,
    offset: 0
  });

  const getAngle = (touches: React.TouchList): number => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;

    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handleStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      state.current.angle = getAngle(e.touches);
      state.current.active = true;

      callback?.({
        active: true,
        offset: state.current.offset,
        first: true,
        last: false
      });
    }
  };

  const handleMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && state.current.active) {
      const currentAngle = getAngle(e.touches);

      let angleDelta = currentAngle - state.current.angle;

      // Handle angle wrapping
      if (angleDelta > 180) angleDelta -= 360;
      else if (angleDelta < -180) angleDelta += 360;

      state.current.offset += angleDelta;
      state.current.angle = currentAngle;

      callback?.({
        active: true,
        offset: state.current.offset,
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