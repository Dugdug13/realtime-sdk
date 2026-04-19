type RotateState = {
    active: boolean;
    offset: number;
    first: boolean;
    last: boolean;
};
type RotateCallback = (state: RotateState) => void;
export declare const useRotate: (callback?: RotateCallback) => {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
};
export {};
