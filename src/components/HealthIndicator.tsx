import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from '../services/transportService';
import { scanBreaker } from '../services/circuitBreaker';
import type { CircuitBreakerState } from '../services/circuitBreaker';

export const HealthIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [breakerState, setBreakerState] = useState<CircuitBreakerState | null>(null);

  useEffect(() => {
    // Subscribe to Circuit Breaker state changes
    const unsubscribeBreaker = scanBreaker.subscribe((state) => {
      setBreakerState(state);
    });

    let isMounted = true;
    const checkHealth = async () => {
      const online = await checkBackendHealth();
      if (isMounted) {
        setIsOnline(online);
      }
    };

    // Immediate initial check
    checkHealth();
    
    // Periodic check every 10 seconds
    const interval = setInterval(checkHealth, 10000);

    return () => {
      isMounted = false;
      unsubscribeBreaker();
      clearInterval(interval);
    };
  }, []);

  let color = 'var(--text-muted)';
  let label = 'Checking connectivity...';
  let badgeText = 'Checking...';
  let isPulseNeeded = true;

  if (isOnline === false) {
    color = 'var(--bottleneck)';
    label = 'Scanner engine offline. Requests will fail.';
    badgeText = 'Scanner Offline';
  } else if (breakerState?.state === 'OPEN') {
    color = 'var(--cycle)';
    label = 'Engine overloaded (Circuit Breaker open). Waiting for cooldown...';
    badgeText = 'Circuit Open';
  } else if (breakerState?.state === 'HALF-OPEN') {
    color = 'var(--warning)';
    label = 'Attempting to reconnect to engine...';
    badgeText = 'Reconnecting...';
  } else if (isOnline === true) {
    color = 'var(--success)';
    label = 'Scanner engine online and ready.';
    badgeText = 'Engine OK';
    isPulseNeeded = true;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '5px 12px',
        borderRadius: '20px',
        backgroundColor: 'var(--input-bg)',
        border: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        userSelect: 'none',
        height: '28px',
        transition: 'all 0.3s ease',
      }}
      title={label}
    >
      <span
        style={{
          position: 'relative',
          display: 'flex',
          height: '8px',
          width: '8px',
        }}
      >
        {isPulseNeeded && isOnline !== null && (
          <span
            style={{
              position: 'absolute',
              display: 'inline-flex',
              height: '100%',
              width: '100%',
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.75,
              animation: isOnline === false || breakerState?.state === 'OPEN'
                ? 'pulse-fast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                : 'pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            borderRadius: '50%',
            height: '8px',
            width: '8px',
            backgroundColor: color,
            transition: 'background-color 0.3s ease',
          }}
        />
      </span>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>
        {badgeText}
      </span>
      
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
export default HealthIndicator;
