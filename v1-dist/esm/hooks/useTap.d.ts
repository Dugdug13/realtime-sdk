/// <reference types="react" />
type TapEvent = React.MouseEvent | React.TouchEvent;
type TapState = {
    event: TapEvent;
    tap: boolean;
};
type TapCallback = (state: TapState) => void;
type UseTapOptions = {
    maxDelay?: number;
    maxDistance?: number;
};
export declare const useTap: (callback?: TapCallback, { maxDelay, maxDistance }?: UseTapOptions) => {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
};
export {};
