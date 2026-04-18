import { useCallback, useRef } from 'react';

type Point = {
  x: number;
  y: number;
};

type Velocity = {
  x: number;
  y: number;
};

type Boundary = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type DragState = {
  active: boolean;
  first: boolean;
  last: boolean;
  offset: Point;
  movement: Point;
  velocity: Velocity;
};

type UseDragOptions = {
  boundary?: Boundary | null;
};

type DragCallback = (state: DragState) => void;

type InternalState = {
  isDragging: boolean;
  start: Point;
  offset: Point;
  movement: Point;
  velocity: Velocity;
  lastTime: number;
  lastPos: Point;
};

export const useDrag = (
  callback?: DragCallback,
  { boundary = null }: UseDragOptions = {}
) => {
  const stateRef = useRef<InternalState>({
    isDragging: false,
    start: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    movement: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    lastTime: 0,
    lastPos: { x: 0, y: 0 }
  });

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      const s = stateRef.current;

      s.isDragging = true;
      s.start = { x: clientX, y: clientY };
      s.movement = { x: 0, y: 0 };
      s.lastTime = Date.now();
      s.lastPos = { x: clientX, y: clientY };
      s.velocity = { x: 0, y: 0 };

      callback?.({
        active: true,
        first: true,
        last: false,
        offset: s.offset,
        movement: s.movement,
        velocity: s.velocity
      });
    },
    [callback]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const s = stateRef.current;
      if (!s.isDragging) return;

      const deltaX = clientX - s.start.x;
      const deltaY = clientY - s.start.y;

      s.movement = { x: deltaX, y: deltaY };

      let newOffsetX = s.offset.x + deltaX;
      let newOffsetY = s.offset.y + deltaY;

      if (boundary) {
        if (boundary.left !== undefined)
          newOffsetX = Math.max(newOffsetX, boundary.left);
        if (boundary.right !== undefined)
          newOffsetX = Math.min(newOffsetX, boundary.right);
        if (boundary.top !== undefined)
          newOffsetY = Math.max(newOffsetY, boundary.top);
        if (boundary.bottom !== undefined)
          newOffsetY = Math.min(newOffsetY, boundary.bottom);
      }

      const now = Date.now();
      const timeDelta = now - s.lastTime;

      if (timeDelta > 0) {
        s.velocity = {
          x: (clientX - s.lastPos.x) / timeDelta,
          y: (clientY - s.lastPos.y) / timeDelta
        };
      }

      s.lastTime = now;
      s.lastPos = { x: clientX, y: clientY };

      callback?.({
        active: true,
        first: false,
        last: false,
        offset: { x: newOffsetX, y: newOffsetY },
        movement: s.movement,
        velocity: s.velocity
      });
    },
    [callback, boundary]
  );

  const handleEnd = useCallback(() => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    s.isDragging = false;

    let newOffsetX = s.offset.x + s.movement.x;
    let newOffsetY = s.offset.y + s.movement.y;

    if (boundary) {
      if (boundary.left !== undefined)
        newOffsetX = Math.max(newOffsetX, boundary.left);
      if (boundary.right !== undefined)
        newOffsetX = Math.min(newOffsetX, boundary.right);
      if (boundary.top !== undefined)
        newOffsetY = Math.max(newOffsetY, boundary.top);
      if (boundary.bottom !== undefined)
        newOffsetY = Math.min(newOffsetY, boundary.bottom);
    }

    s.offset = { x: newOffsetX, y: newOffsetY };

    callback?.({
      active: false,
      first: false,
      last: true,
      offset: s.offset,
      movement: s.movement,
      velocity: s.velocity
    });
  }, [callback, boundary]);

  return {
    onTouchStart: (e: React.TouchEvent) =>
      handleStart(e.touches[0].clientX, e.touches[0].clientY),

    onTouchMove: (e: React.TouchEvent) =>
      handleMove(e.touches[0].clientX, e.touches[0].clientY),

    onTouchEnd: handleEnd,

    onMouseDown: (e: React.MouseEvent) =>
      handleStart(e.clientX, e.clientY),

    onMouseMove: (e: React.MouseEvent) =>
      handleMove(e.clientX, e.clientY),

    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,

    style: { touchAction: 'none' as const }
  };
};