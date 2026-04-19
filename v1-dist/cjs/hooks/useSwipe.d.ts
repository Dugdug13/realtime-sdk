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
export declare const useSwipe: (callback?: SwipeCallback, { threshold, timeout, velocityThreshold }?: UseSwipeOptions) => {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    style: {
        touchAction: "none";
    };
};
export {};
