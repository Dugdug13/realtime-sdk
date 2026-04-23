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

  // ✅ define handler ONCE (important)
  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.alpha === null && e.beta === null && e.gamma === null) return;

    callback?.({
      alpha: e.alpha ?? 0,
      beta: e.beta ?? 0,
      gamma: e.gamma ?? 0
    });
  };

  const requestPermission = async () => {
    if (typeof window === 'undefined') return;

    const DeviceOrientation = window.DeviceOrientationEvent as any;

    // ✅ iOS Safari permission flow
    if (typeof DeviceOrientation?.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();

        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // ✅ Android / normal browsers
      setPermissionGranted(true);

      if (
        window.location.protocol === 'http:' &&
        window.location.hostname !== 'localhost'
      ) {
        alert(
          'Warning: DeviceOrientation usually requires HTTPS. Sensors might fail on HTTP.'
        );
      }

      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return { requestPermission, permissionGranted, isSupported };
};