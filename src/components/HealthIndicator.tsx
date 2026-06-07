import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from '../services/transportService';
import { scanBreaker } from '../services/circuitBreaker';
import type { CircuitBreakerState } from '../services/circuitBreaker';

export const HealthIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [breakerState, setBreakerState] = useState<CircuitBreakerState | null>(null);

  useEffect(() => {
    // S'abonner aux changements d'état du Circuit Breaker
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

    // Premier check immédiat
    checkHealth();
    
    // Check régulier toutes les 10 secondes
    const interval = setInterval(checkHealth, 10000);

    return () => {
      isMounted = false;
      unsubscribeBreaker();
      clearInterval(interval);
    };
  }, []);

  let color = 'var(--text-muted)';
  let label = 'Vérification de la connectivité...';
  let badgeText = 'Vérification...';
  let isPulseNeeded = true;

  if (isOnline === false) {
    color = 'var(--bottleneck)';
    label = 'Moteur de scan hors ligne. Les requêtes échoueront.';
    badgeText = 'Scanner HS';
  } else if (breakerState?.state === 'OPEN') {
    color = 'var(--cycle)';
    label = `Moteur saturé (Circuit Breaker ouvert). Attente de cooldown...`;
    badgeText = 'Circuit Ouvert';
  } else if (breakerState?.state === 'HALF-OPEN') {
    color = 'var(--warning)';
    label = 'Tentative de reconnexion au moteur...';
    badgeText = 'Reconnexion...';
  } else if (isOnline === true) {
    color = 'var(--success)';
    label = 'Moteur de scan en ligne et prêt.';
    badgeText = 'Moteur OK';
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
