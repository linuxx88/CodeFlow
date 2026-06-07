import React, { useEffect, useState } from 'react';
import { toast } from '../services/toastService';
import type { Toast } from '../services/toastService';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        let icon = <Info size={16} color="var(--accent)" />;
        let borderColor = 'rgba(255, 255, 255, 0.1)';
        let bgColor = 'rgba(15, 15, 20, 0.85)';
        let textColor = 'var(--text)';

        if (t.type === 'success') {
          icon = <CheckCircle2 size={16} color="var(--success)" />;
          borderColor = 'rgba(16, 185, 129, 0.4)';
          bgColor = 'rgba(6, 78, 59, 0.8)';
          textColor = '#ecfdf5';
        } else if (t.type === 'error') {
          icon = <AlertTriangle size={16} color="var(--bottleneck)" />;
          borderColor = 'rgba(244, 63, 94, 0.4)';
          bgColor = 'rgba(136, 19, 55, 0.8)';
          textColor = '#fff1f2';
        } else if (t.type === 'warning') {
          icon = <AlertTriangle size={16} color="var(--cycle)" />;
          borderColor = 'rgba(245, 158, 11, 0.4)';
          bgColor = 'rgba(120, 53, 4, 0.8)';
          textColor = '#fef3c7';
        } else if (t.type === 'info') {
          icon = <Info size={16} color="var(--accent)" />;
          borderColor = 'var(--border)';
          bgColor = 'var(--panel-bg)';
          textColor = 'var(--text)';
        }

        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backgroundColor: bgColor,
              backdropFilter: 'blur(16px)',
              border: `1.5px solid ${borderColor}`,
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px var(--shadow), 0 4px 6px -4px var(--shadow)',
              color: textColor,
              fontSize: '13px',
              fontWeight: 500,
              pointerEvents: 'auto',
              animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, opacity 0.2s',
            }}
          >
            <div style={{ marginTop: '2px', display: 'flex', flexShrink: 0 }}>
              {icon}
            </div>
            <div style={{ flex: 1, paddingRight: '8px', lineHeight: '1.4' }}>
              {t.message}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                opacity: 0.6,
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'opacity 0.2s, background-color 0.2s',
                marginTop: '1px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={14} />
            </button>
            {t.duration && t.duration > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '3px',
                  backgroundColor: 'currentColor',
                  opacity: 0.3,
                  animation: `toastProgress ${t.duration}ms linear forwards`,
                }}
              />
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
