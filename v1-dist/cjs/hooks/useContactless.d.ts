type GestureCallback = (data: {
    semanticGesture: string | null;
    results: unknown;
}) => void;
type UseContactlessOptions = {
    runningMode?: 'IMAGE' | 'VIDEO';
    numHands?: number;
    swipeThreshold?: number;
};
export declare const useContactless: (callback?: GestureCallback, { runningMode, numHands, swipeThreshold }?: UseContactlessOptions) => {
    start: (videoElement: HTMLVideoElement | null) => Promise<void>;
    stop: () => void;
    isReady: boolean;
};
export {};
