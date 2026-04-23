import React, { useState } from 'react';
import { useSensor } from '../hooks/useSensor';
import { motion } from 'framer-motion';

/**
 * SensorTester Component
 * 
 * Demonstrates the fixed `useSensor` hook. 
 * Note: Requires a device with an accelerometer/gyroscope.
 */
const SensorTester: React.FC = () => {
  const [sensorData, setSensorData] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);

  const { requestPermission, permissionGranted, isSupported } = useSensor((data) => {
    setSensorData(data);
  });

  if (!isSupported) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        Device Orientation API is not supported on this device/browser.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        background: '#0f172a',
        borderRadius: '24px',
        color: '#f8fafc',
        fontFamily: 'system-ui',
      }}
    >
      <h3 style={{ marginBottom: '1.5rem' }}>Sensor Orientation</h3>

      {!permissionGranted ? (
        <button
          onClick={requestPermission}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Enable Sensors
        </button>
      ) : (
        <div style={{ position: 'relative', width: '200px', height: '200px' }}>
          {/* Visualizing 3D Rotation with a card */}
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              rotateX: sensorData?.beta || 0,
              rotateY: sensorData?.gamma || 0,
              rotateZ: sensorData?.alpha || 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '2rem' }}>📱</div>
          </motion.div>
        </div>
      )}

      {sensorData && (
        <div style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
          <div>Alpha: {Math.round(sensorData.alpha)}°</div>
          <div>Beta: {Math.round(sensorData.beta)}°</div>
          <div>Gamma: {Math.round(sensorData.gamma)}°</div>
        </div>
      )}
    </div>
  );
};

export default SensorTester;
