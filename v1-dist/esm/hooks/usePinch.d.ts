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
export declare const usePinch: (callback?: PinchCallback) => {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
};
export {};
