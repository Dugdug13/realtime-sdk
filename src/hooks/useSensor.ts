import { useState, useEffect, useRef } from 'react';

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
  error: string | null;
};

// Extend for iOS Safari (non-standard typing)
interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * useSensor hook using a callback pattern for high performance.
 * Improved robustness for various browser sensor policies.
 */
export const useSensor = (callback?: SensorCallback): UseSensorReturn => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window !== 'undefined') {
      return 'DeviceOrientationEvent' in window || 'DeviceMotionEvent' in window;
    }
    return false;
  });
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const supported = 'DeviceOrientationEvent' in window || 'DeviceMotionEvent' in window;
      if (!supported) return "Device sensors not supported on this browser/device.";
    }
    return null;
  });
  const lastDataRef = useRef({ alpha: 0, beta: 0, gamma: 0 });

  const requestPermission = async () => {
    setError(null);
    
    // Check for iOS 13+ permission requirement
    const DeviceOrientation = (typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : null) as any;
    
    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientation.requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setError("Permission denied. Ensure you are using HTTPS and interact with the page first.");
        }
      } catch (err: any) {
        console.error('Permission error:', err);
        setError(`Sensor error: ${err.message || 'Permission request failed'}`);
      }
    } else {
      // Non-iOS or older devices
      setPermissionGranted(true);
      
      // Basic check for HTTPS
      if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        console.warn("DeviceOrientation usually requires HTTPS.");
      }
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    let hasReceivedData = false;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Check if we are actually getting data
      if (e.alpha === null && e.beta === null && e.gamma === null) return;
      hasReceivedData = true;

      const newData = {
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0
      };
      
      lastDataRef.current = newData;
      if (callback) callback(newData);
    };

    // Try both absolute and relative orientation
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    // Safety timeout: if after 2 seconds of permission we get nothing, report it
    const timer = setTimeout(() => {
      if (!hasReceivedData) {
        console.log("No sensor data received after 2s. Checking if browser is blocking...");
        // Some browsers require explicit user interaction even after permission
      }
    }, 2000);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      clearTimeout(timer);
    };
  }, [permissionGranted, callback]);

  return { requestPermission, permissionGranted, isSupported, error };
};
