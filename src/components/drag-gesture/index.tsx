import React, { ReactNode, CSSProperties } from 'react';
import { useDrag } from '../../hooks';
import { motion, useMotionValue, useSpring, MotionValue } from 'framer-motion';

type Offset = {
  x: number;
  y: number;
};

type DragState = {
  active: boolean;
  offset: Offset;
};

type Boundary = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type DragGestureProps = {
  children: ReactNode;
  boundary?: Boundary;
  style?: CSSProperties;
  className?: string;
};

const DragGesture: React.FC<DragGestureProps> = ({
  children,
  boundary,
  style,
  className
}) => {
  const x: MotionValue<number> = useMotionValue(0);
  const y: MotionValue<number> = useMotionValue(0);

  // Smooth movement using springs
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  const scale: MotionValue<number> = useMotionValue(1);

  const bind = useDrag(
    ({ active, offset }: DragState) => {
      x.set(offset.x);
      y.set(offset.y);
      scale.set(active ? 1.05 : 1);
    },
    { boundary }
  );

  return (
    <motion.div
      {...bind}
      style={{
        x: springX,
        y: springY,
        scale,
        userSelect: 'none',
        position: 'relative',
        cursor: 'grab',
        ...style
      }}
      whileTap={{ cursor: 'grabbing' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default DragGesture;