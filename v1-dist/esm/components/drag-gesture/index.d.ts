import React, { ReactNode, CSSProperties } from 'react';
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
declare const DragGesture: React.FC<DragGestureProps>;
export default DragGesture;
