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

// Extend for iOS Safari (non-standard typing)
interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export const useSensor = (callback?: SensorCallback): UseSensorReturn => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  const requestPermission = async (): Promise<void> => {
    const DeviceOrientation =
      window.DeviceOrientationEvent as typeof DeviceOrientationEventWithPermission;

    if (
      typeof DeviceOrientation !== 'undefined' &&
      typeof DeviceOrientation.requestPermission === 'function'
    ) {
      try {
        const permissionState = await DeviceOrientation.requestPermission();

        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          alert("Permission denied. Ensure you are on HTTPS.");
        }
      } catch (error) {
        console.error('Permission error. HTTPS is required.', error);
        alert(
          "Sensor error. Note: Device Sensors usually require HTTPS on modern browsers."
        );
      }
    } else {
      // Non-iOS devices
      setPermissionGranted(true);

      if (
        window.location.protocol === 'http:' &&
        window.location.hostname !== 'localhost'
      ) {
        alert(
          "Warning: DeviceOrientation usually requires HTTPS. Sensors might fail on HTTP."
        );
      }
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null && e.beta === null && e.gamma === null) return;

      callback?.({
        alpha: e.alpha ?? 0,
        beta: e.beta ?? 0,
        gamma: e.gamma ?? 0
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted, callback]);

  return { requestPermission, permissionGranted, isSupported };
};