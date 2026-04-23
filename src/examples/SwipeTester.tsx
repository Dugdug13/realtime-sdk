import React, { useState } from 'react';
import { useSwipe } from '../hooks/useSwipe';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SwipeTester Component
 * 
 * A high-fidelity example component to demonstrate the `useSwipe` hook.
 * Features real-time state visualization and a glassmorphic UI.
 */
const SwipeTester: React.FC = () => {
  const [swipeState, setSwipeState] = useState<{
    active: boolean;
    direction: string | null;
    distance: { x: number; y: number };
    velocity: number;
  } | null>(null);

  // Bind the useSwipe hook
  const bind = useSwipe((state) => {
    setSwipeState(state);
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#f8fafc',
        fontFamily: '"Inter", system-ui, sans-serif',
        borderRadius: '2rem',
        userSelect: 'none',
      }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' }}>
        Gesture Tester
      </h2>

      {/* Swipe Area */}
      <div
        {...bind}
        style={{
          width: '280px',
          height: '280px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          borderRadius: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease',
          ...bind.style,
        }}
      >
        <AnimatePresence>
          {(!swipeState || !swipeState.active) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ textAlign: 'center', pointerEvents: 'none' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👆</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.5 }}>Swipe inside here</div>
            </motion.div>
          )}
        </AnimatePresence>

        {swipeState?.active && (
          <motion.div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
              x: swipeState.distance.x,
              y: swipeState.distance.y,
            }}
          />
        )}
      </div>

      {/* Real-time Stats */}
      <div
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          width: '280px',
        }}
      >
        <StatCard 
          label="Direction" 
          value={swipeState?.direction || 'Static'} 
          color={swipeState?.direction ? '#10b981' : '#64748b'}
        />
        <StatCard 
          label="Velocity" 
          value={swipeState?.velocity.toFixed(2) || '0.00'} 
        />
        <StatCard 
          label="X Offset" 
          value={Math.round(swipeState?.distance.x || 0) + 'px'} 
        />
        <StatCard 
          label="Y Offset" 
          value={Math.round(swipeState?.distance.y || 0) + 'px'} 
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string | number, color?: string }) => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      padding: '0.75rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <span style={{ fontSize: '0.625rem', opacity: 0.4, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
      {label}
    </span>
    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: color || '#f8fafc' }}>
      {value}
    </span>
  </div>
);

export default SwipeTester;
