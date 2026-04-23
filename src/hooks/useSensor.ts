import { useState, useEffect } from 'react';

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

export const useSensor = (callback?: SensorCallback): UseSensorReturn => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined") return;

    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        }
      } catch (err) {
        console.error('Permission request failed:', err);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  // cleanup
  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null && e.beta === null && e.gamma === null) return;
      callback?.({
        alpha: e.alpha ?? 0,
        beta: e.beta ?? 0,
        gamma: e.gamma ?? 0,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return { requestPermission, permissionGranted, isSupported };
};