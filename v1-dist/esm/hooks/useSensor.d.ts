type SensorData = {
    alpha: number;
    beta: number;
    gamma: number;
};
type SensorCallback = (data: SensorData) => void;
type UseSensorReturn = {
    requestPermission: () => Promise<void>;
    permissionGranted: boolean;
    isSupported: boolean;
};
export declare const useSensor: (callback?: SensorCallback) => UseSensorReturn;
export {};
