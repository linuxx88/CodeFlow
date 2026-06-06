import React from 'react'
import { Controls } from '@xyflow/react'

interface ControlsOverlayProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  style?: React.CSSProperties
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ position = 'bottom-left', style }) => {
  return (
    <>
      <Controls
        position={position}
        style={{
          zIndex: 9999,
          boxShadow: '0 8px 32px 0 var(--shadow)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          ...style
        }}
        showInteractive={true}
      />
      <style>{`
        /* Enforce custom positioning and responsive offsets for controls */
        .react-flow__controls {
          z-index: 9999 !important;
          margin: 16px !important;
          box-shadow: 0 8px 32px 0 var(--shadow) !important;
          border: 1px solid var(--border) !important;
          border-radius: 10px !important;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Responsive offsets to avoid overlapping system scrollbars or side panels */
        @media (max-width: 1200px) {
          .react-flow__controls {
            margin-bottom: 24px !important;
            margin-left: 24px !important;
            transform: scale(0.95);
          }
        }

        @media (max-width: 900px) {
          .react-flow__controls {
            margin-bottom: 32px !important;
            margin-left: 32px !important;
            transform: scale(0.9);
          }
        }

        @media (max-width: 600px) {
          .react-flow__controls {
            margin-bottom: 40px !important;
            margin-left: 40px !important;
            transform: scale(0.85);
          }
        }
      `}</style>
    </>
  )
}
