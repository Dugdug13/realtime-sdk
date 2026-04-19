type Point = {
    x: number;
    y: number;
};
type ScrollState = {
    active: boolean;
    offset: Point;
    delta: Point;
    first: boolean;
    last: boolean;
};
type ScrollCallback = (state: ScrollState) => void;
type UseScrollOptions = {
    threshold?: number;
};
export declare const useScroll: (callback?: ScrollCallback, { threshold }?: UseScrollOptions) => {
    onWheel: (e: React.WheelEvent) => void;
};
export {};
