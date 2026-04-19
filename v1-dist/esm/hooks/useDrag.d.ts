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
export declare const useDrag: (callback?: DragCallback, { boundary }?: UseDragOptions) => {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    style: {
        touchAction: "none";
    };
};
export {};
